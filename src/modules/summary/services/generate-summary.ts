import { createCompletion } from "../../openai/completion";
import axios from "axios";
import { validateTokenLimit } from "./split-within-token-limit";
import { ContentSource } from "../summarify.enum";
import {
  getContentFromAudioUrl,
  getContentFromBase64,
  getContentFromWebUrl,
  getContentFromYtUrl,
} from "./retrieve-content";
import { assistantRetrieval } from "../../openai/retrieval";
import createPrompt from "../prompts/summary";
import createHeadlinePrompt from "../prompts/headline";
import retrievalUserPrompt from "../prompts/retrieval-user";

interface ISummaryCallbackResponse {
  headline: string;
  summary: string;
}

export const generateSummary = async (data: any) => {
  const {
    input,
    inputFile,
    contentSource,
    outputLanguage,
    writingStyle,
    style,
    summaryId,
    callbackUrl,
  } = data;

  try {
    const content = await getContent(input, inputFile, contentSource);

    if (!content.trim()) {
      throw new Error("Can not read any data from the provided input source");
    }

    console.debug(`[Debug] summarizing for summary id: ${summaryId}`);

    const isWithinTokenLimit = validateTokenLimit(content);

    const summaryPrompt = isWithinTokenLimit
      ? createPrompt(outputLanguage, style, writingStyle)
      : retrievalUserPrompt(outputLanguage, style, writingStyle);
    const headlinePrompt = createHeadlinePrompt(outputLanguage!);
    const { headline, summary } = await simulateSummaryProcessing(
      summaryId,
      content,
      summaryPrompt,
      headlinePrompt,
      isWithinTokenLimit
    );

    // Send the result to the callback URL
    await axios
      .post(callbackUrl, {
        summaryId,
        headline,
        summary,
        content,
      })
      .catch((error) => console.log(error.response));
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ??
      `${error}` ??
      "Failed to process the content or it's source.";

    console.log(errorMessage);

    await axios
      .post(callbackUrl, {
        summaryId,
        errorMessage,
      })
      .catch((error) => console.log(error.response));
  }
};

// Simulate a time-consuming process
async function simulateSummaryProcessing(
  summaryId: string,
  content: string,
  summaryPrompt: string,
  headlinePrompt: string,
  isWithinTokenLimit: boolean
): Promise<ISummaryCallbackResponse> {
  const response = await new Promise<ISummaryCallbackResponse>(
    async (resolve, reject) => {
      try {
        console.log(`Processing for summary id: ${summaryId}`);

        console.log("single token limit? ", isWithinTokenLimit);
        let summary = null;
        if (isWithinTokenLimit) {
          summary = await createCompletion(summaryPrompt, content);
        } else {
          summary = await assistantRetrieval(content, summaryPrompt);
        }

        if (!summary) {
          throw new Error("Couldn't get any summary from OpenAI.");
        }

        const finalSummary = summary.replace(/^\n+/, "").trim();
        console.log(`Summary generated for id: ${summaryId}`);
        const headline = await createCompletion(headlinePrompt, finalSummary);
        console.log(`Headline generated for id: ${summaryId}`);

        resolve({ headline, summary: finalSummary });
      } catch (error) {
        reject(error);
      }
    }
  );

  return response;
}

async function getContent(
  input: string,
  inputFile: Express.Multer.File,
  contentSource: ContentSource
): Promise<string> {
  switch (contentSource) {
    case ContentSource.Pdf:
      return getContentFromBase64(inputFile);
    case ContentSource.WebUrl:
    case ContentSource.BlogUrl:
      return getContentFromWebUrl(input);
    case ContentSource.YoutubeUrl:
      return getContentFromYtUrl(input);
    case ContentSource.AudioUrl:
      return getContentFromAudioUrl(inputFile);
    default:
      return input;
  }
}
