import { Request } from "express";
import { IResponse } from "../../../interfaces/response.interface";
import { createCompletion } from "./completion";
import axios from "axios";

interface ISummaryCallbackResponse {
  headline: string;
  summary: string;
}

export const generateSummaryService = async (
  req: Request
): Promise<IResponse> => {
  const { content, summaryPrompt, headlinePrompt, id, callbackUrl } = req.body;

  try {
    if (!id || !callbackUrl) {
      const ERROR =
        "[Error] Invalid" + !id &&
        `id: ${id}, ` + !callbackUrl &&
        `callback url: ${callbackUrl}`;
      console.error(ERROR);
      return {
        status: 400,
        body: {
          message: ERROR,
        },
      };
    }

    processInBackground(
      content,
      summaryPrompt,
      headlinePrompt,
      id,
      callbackUrl
    );

    return {
      status: 200,
      body: {
        message: "Video processing started.",
      },
    };
  } catch (error) {
    console.error(`[Error] ${error}`);
    return {
      status: 500,
      body: {
        error: `Error summarizing content: ${error}`,
      },
    };
  }
};

// Simulate a time-consuming process
async function simulateProcessing(
  tokenVerifiedContent: string[],
  summaryPrompt: string,
  headlinePrompt: string
): Promise<ISummaryCallbackResponse> {
  const response = await new Promise<ISummaryCallbackResponse>(
    async (resolve, reject) => {
      try {
        const summary = await Promise.all(
          tokenVerifiedContent.map((article) =>
            createCompletion(summaryPrompt, article)
          )
        );
        const finalSummary = summary.join("/n").replace(/^\n+/, "");
        const headline = await createCompletion(headlinePrompt, finalSummary);

        resolve({ headline, summary: finalSummary });
      } catch (error) {
        reject(error);
      }
    }
  );

  return response;
}

async function processInBackground(
  content: string[],
  summaryPrompt: string,
  headlinePrompt: string,
  id: string,
  callbackUrl: string
) {
  console.debug(`[Debug] summarizing for summary id: ${id}`);

  const { headline, summary } = await simulateProcessing(
    content,
    summaryPrompt,
    headlinePrompt
  );

  // Send the result to the callback URL
  await axios.post(callbackUrl, {
    id,
    headline,
    summary,
  });
  try {
  } catch (error) {
    console.error("Error processing the task:", error);
  }
}
