import azureOpenAi from "../../../config/azure-openai.config";
import { ChatMessage, GetChatCompletionsOptions } from "@azure/openai";
import openai from "../../../config/openai.config";
import {
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
} from "openai/resources";

export const MaxtTokens = 1000 * 4;

export async function createCompletion(
  prompt: string,
  article: string,
  summaryId?: string
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
    // OPENAI
    // const params: ChatCompletionCreateParamsNonStreaming = {
    //   model: process.env.OPENAI_MODEL!,
    //   messages, // type should be "ChatCompletionMessageParam[]"
    //   max_tokens: MaxtTokens,
    //   temperature: 0.8,
    // };

    // if (summaryId) {
    //   console.log(`processing > ${summaryId}`);
    // }

    // const response = await openai.chat.completions.create(params);

    // AZURE
    const params: GetChatCompletionsOptions = {
      maxTokens: MaxtTokens,
      model: process.env.AZURE_OPENAI_MODEL,
      temperature: 0.8,
    };

    const response = await azureOpenAi.getChatCompletions(
      process.env.AZURE_OPENAI_DEPLOYMENT_ID!,
      messages,
      params
    );

    return response.choices[0].message?.content!;
  } catch (error) {
    console.error(error, "api/summary error");
    throw new Error(`[Error] 500: Failed to get summary`);
  }
}
