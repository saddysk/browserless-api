import { Request } from "express";
import { IResponse } from "../../../interfaces/response.interface";
import createPrompt from "../prompts/summary";
import createHeadlinePrompt from "../prompts/headline";
import { generateSummary } from "./generate-summary";
import { ContentSource } from "../summarify.enum";
import { getContentFromBase64 } from "./retrieve-content";

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
  const inputFile = req.file;

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
    const summaryPrompt = createPrompt(outputLanguage!, style, writingStyle);
    const headlinePrompt = createHeadlinePrompt(outputLanguage!);

    generateSummary({
      input,
      inputFile,
      contentSource,
      summaryPrompt,
      headlinePrompt,
      summaryId,
      callbackUrl,
    }).then();

    let pdfInput;
    if (contentSource === ContentSource.Pdf) {
      pdfInput = await getContentFromBase64(inputFile!);
    }

    return {
      status: 200,
      body: {
        message: `Starting summary generation for ${summaryId}`,
        data: pdfInput,
      },
    };
  } catch (error: any) {
    console.log(`[Error] ${error}`);
    return errorResponseObject(
      500,
      `Error summarizing content: ${error.message}`
    );
  }
};
