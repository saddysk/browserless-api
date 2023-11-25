import { Request } from "express";
import { IResponse } from "../../../interfaces/response.interface";
import createPrompt from "../prompts/summary";
import createHeadlinePrompt from "../prompts/headline";
import { generateSummary } from "./generate-summary";

const errorResponseObject = (status: number, message: string): IResponse => {
  return {
    status,
    body: {
      error: message,
    },
  };
};

export const generateSummaryService = async (
  req: Request
): Promise<IResponse> => {
  const {
    input,
    outputLanguage,
    writingStyle,
    style,
    contentSource,
    summaryId,
    callbackUrl,
  } = req.body;

  try {
    const summaryPrompt = createPrompt(outputLanguage, writingStyle, style);
    const headlinePrompt = createHeadlinePrompt(outputLanguage);

    generateSummary({
      rawContent: input,
      contentSource,
      summaryPrompt,
      headlinePrompt,
      summaryId,
      callbackUrl,
    });

    return {
      status: 200,
      body: {
        message: `Starting summary generation for ${summaryId}`,
      },
    };
  } catch (error: any) {
    console.error(`[Error] ${error}`);
    return errorResponseObject(
      500,
      `Error summarizing content: ${error.message}`
    );
  }
};