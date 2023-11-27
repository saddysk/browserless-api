import { createCompletion } from "./completion";
import axios from "axios";
import { splitContentToTokenLimit } from "./split-within-token-limit";
import { ContentSource } from "../summarify.enum";
import {
  getContentFromAudioUrl,
  getContentFromBase64,
  getContentFromWebUrl,
  getContentFromYtUrl,
} from "./retrieve-content";

interface ISummaryCallbackResponse {
  headline: string;
  summary: string;
}

export const generateSummary = async (data: any) => {
  const {
    rawContent,
    contentSource,
    summaryPrompt,
    headlinePrompt,
    summaryId,
    callbackUrl,
  } = data;

  try {
    const content = await getContent(rawContent, contentSource);

    const tokenVerifiedContent = splitContentToTokenLimit(content);

    console.debug(`[Debug] summarizing for summary id: ${summaryId}`);

    const { headline, summary } = await simulateProcessing(
      tokenVerifiedContent,
      summaryPrompt,
      headlinePrompt
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
    await axios
      .post(callbackUrl, {
        summaryId,
        errorMessage,
      })
      .catch((error) => console.log(error.response));
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

async function getContent(
  input: string,
  contentSource: ContentSource
): Promise<string> {
  switch (contentSource) {
    case ContentSource.Pdf:
      return getContentFromBase64(input);
    case ContentSource.WebUrl:
    case ContentSource.BlogUrl:
      return getContentFromWebUrl(input);
    case ContentSource.YoutubeUrl:
      return getContentFromYtUrl(input);
    case ContentSource.AudioUrl:
      return getContentFromAudioUrl(input);
    default:
      return input;
  }
}
