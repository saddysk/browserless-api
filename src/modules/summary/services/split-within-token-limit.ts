import { encodingForModel } from "js-tiktoken";

export const ModelTokenCount = "gpt-3.5-turbo";
export const MaxtTokens = 1000 * 4;
export const ModelTokenLimit = 16000;
const PromptTokenCount = 500;
const defaultTokenCount = MaxtTokens + PromptTokenCount;

export function validateTokenLimit(content: string): boolean {
  const encoder = encodingForModel(ModelTokenCount);
  const encoded = encoder.encode(content);

  const totalTokenCount = encoded.length + defaultTokenCount;

  if (totalTokenCount > ModelTokenLimit) {
    return false;
  }

  return true;
}

export function splitContentToTokenLimit(content: string): string[] {
  const encoder = encodingForModel(ModelTokenCount);
  const encoded = encoder.encode(content);

  const totalTokenCount = encoded.length + defaultTokenCount;

  if (totalTokenCount > ModelTokenLimit * 3) {
    return ["TOKEN_LIMIT_EXCEEDED"];
  }

  let splittedData;
  if (totalTokenCount > ModelTokenLimit) {
    splittedData = splitArray(encoded, ModelTokenLimit - defaultTokenCount);
  }

  if (splittedData) {
    const decoded = splittedData.map((data) => {
      return encoder.decode(data);
    });

    return decoded;
  }

  return [content];
}

function splitArray(arr: number[], maxLimit: number): number[][] {
  if (!Array.isArray(arr) || maxLimit <= 0) {
    throw new Error("Invalid input");
  }

  const result = [];
  let currentSubarray = [];

  for (const num of arr) {
    if (currentSubarray.length + 1 > maxLimit) {
      result.push(currentSubarray);
      currentSubarray = [];
    }
    currentSubarray.push(num);
  }

  if (currentSubarray.length > 0) {
    result.push(currentSubarray);
  }

  return result;
}
