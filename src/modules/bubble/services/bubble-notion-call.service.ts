import { Request } from "express";
import axios from "axios";
import { IResponse } from "../../../interfaces/response.interface";
import mainBlockJson, { IBlock } from "./main-block";

interface IRequest {
  title: string;
  database_id: string;
  summary: string;
  transcription: string;
  timestamp: string;
  shownotes?: string;
}

export const bubbleNotionCallService = async (
  req: Request
): Promise<IResponse> => {
  const { authorization, ...requestData } = req.body;

  const notionData = formatAndGetNotionData(requestData);

  const config = {
    url: "https://api.notion.com/v1/pages",
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    data: notionData,
  };

  console.debug(
    `[Debug] Storing data to notion at database: ${requestData.database_id}`
  );

  try {
    const response = await axios(config);
    console.debug(`[Debug] Data stored successfully`);

    return {
      status: 200,
      body: {
        data: response.data,
      },
    };
  } catch (error) {
    console.error(`[Error] ${error}`);
    return {
      status: 400,
      body: {
        error: error as object,
      },
    };
  }
};

function formatAndGetNotionData(request: IRequest) {
  const { title, database_id, transcription, summary, timestamp, shownotes } =
    request;

  console.debug(
    `[Debug] title: ${title}\ntranscription: ${transcription}\nsummary: ${summary}\ntimestamp: ${timestamp}`
  );

  const transcriptionChunks = splitStringIntoChunks(transcription);
  const summaryChunks = splitStringIntoChunks(summary);
  const timestampChunks = splitStringIntoChunks(timestamp);
  const shownotesChunks = shownotes
    ? splitStringIntoChunks(shownotes)
    : undefined;

  const transcriptionBlock = createChunk(transcriptionChunks);
  const summaryBlock = createChunk(summaryChunks);
  const timestampBlock = createChunk(timestampChunks);
  const shownotesBlock = shownotesChunks
    ? createChunk(shownotesChunks)
    : undefined;

  return mainBlockJson({
    TITLE: title,
    DATABASE_ID: database_id,
    BLOCK_TRANSCRIPTION: transcriptionBlock,
    BLOCK_SUMMARY: summaryBlock,
    BLOCK_TIMESTAMP: timestampBlock,
    BLOCK_SHOWNOTES: shownotesBlock,
  });
}

function splitStringIntoChunks(inputString: string): string[] {
  const chunkSize = 1500;
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < inputString.length) {
    let endIndex = startIndex + chunkSize;

    // Check if endIndex is within the string length
    if (endIndex > inputString.length) {
      endIndex = inputString.length;
    } else {
      // Find the nearest punctuation mark before or after the endIndex
      const punctuation = /[.,!?;:]/;
      let beforeIndex = endIndex;
      let afterIndex = endIndex;

      while (beforeIndex >= startIndex || afterIndex <= inputString.length) {
        if (
          beforeIndex >= startIndex &&
          punctuation.test(inputString[beforeIndex])
        ) {
          endIndex = beforeIndex + 1;
          break;
        }
        if (
          afterIndex <= inputString.length &&
          punctuation.test(inputString[afterIndex])
        ) {
          endIndex = afterIndex + 1;
          break;
        }

        beforeIndex--;
        afterIndex++;
      }
    }

    const chunk = inputString.substring(startIndex, endIndex);
    chunks.push(chunk);
    startIndex = endIndex;
  }

  return chunks;
}

function createChunk(chunks: string[]): IBlock[] {
  return chunks.map((chunk) => {
    return {
      object: "block",
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: {
              content: chunk,
            },
          },
        ],
      },
    };
  });
}
