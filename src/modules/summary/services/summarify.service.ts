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

function areFieldsValid(obj: any) {
  for (let key in obj) {
    if (obj[key] === null || obj[key] === "") {
      return false;
    }
  }
  return true;
}

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
    if (!areFieldsValid(req.body)) {
      return errorResponseObject(400, "MISSING_FIELD");
    }

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
