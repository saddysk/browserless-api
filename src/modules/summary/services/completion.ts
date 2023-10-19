import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
} from "openai/resources";
import openai from "../../../config/openai.config";

export const MaxtTokens = 800 * 4;

export async function createCompletion(
  prompt: string,
  article: string
): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: prompt,
    },
    {
      role: "user",
      content: article,
    },
  ];

  try {
    const params: ChatCompletionCreateParamsNonStreaming = {
      model: process.env.OPENAI_MODEL!,
      messages,
      max_tokens: MaxtTokens,
      temperature: 0.8,
    };

    const response = await openai.chat.completions.create(params, {
      maxRetries: 3,
    });

    return response.choices[0].message.content!;
  } catch (error) {
    console.error(error, "api/summary error");
    throw new Error(`[Error] 500: Failed to get summary`);
  }
}
