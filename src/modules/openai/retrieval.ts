import { Beta } from "openai/resources";
import openai from "../../config/openai.config";
import { MessageContentText } from "openai/resources/beta/threads/messages/messages";
import jsPDF from "jspdf";
import { Uploadable } from "openai/uploads";

const doc = new jsPDF();

export async function assistantRetrieval(
    data: string,
    userPrompt: string
): Promise<string> {
    // Create PDF
    doc.text(data.replace(/[^\x00-\x7F]/g, ""), 10, 10);
    const blob = doc.output("blob");
    // Create a form and append the file
    const formData = new FormData();
    formData.append("file", blob, 'filename.pdf');
    formData.get("file");

    // upload file for openai assistant
    const uploadedFile = await openai.files.create({
        file: formData.get("file") as Uploadable,
        purpose: "assistants",
    });
    const fileId = uploadedFile.id;

    const run = await openai.beta.threads.createAndRun({
        assistant_id: process.env.OPENAI_ASSISTANT_ID!,
        thread: {
            messages: [{ role: "user", content: userPrompt, file_ids: [fileId] }],
        },
    });

    const threadId = await pollStatus(run);

    const messages = await openai.beta.threads.messages.list(threadId);
    const response = messages.data[0].content.find(
        (e) => e.type == "text"
    ) as MessageContentText;

    // delete file now
    await openai.files.del(fileId);

    return response.text.value;
}

async function pollStatus(
    run: Beta.Threads.Run,
    interval = 5000,
    maxRetries = 30
): Promise<string> {
    try {
        let status = "";
        let finalData = null;
        let retryCount = 0;

        while (status !== "completed") {
            if (retryCount >= maxRetries) {
                throw new Error("Max retries exceeded");
            }

            const runStatus = await openai.beta.threads.runs.retrieve(
                run.thread_id,
                run.id
            );

            status = runStatus.status;
            finalData = runStatus;

            retryCount++;

            if (status !== "completed") {
                await new Promise((resolve) => setTimeout(resolve, interval));
            }
        }

        return finalData?.thread_id!;
    } catch (error) {
        console.error("[Error] ", error);
        throw error;
    }
}
