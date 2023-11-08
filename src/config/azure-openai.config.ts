import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const azureApiKey = process.env.AZURE_OPENAI_KEY!;

const azureOpenAi = new OpenAIClient(
  endpoint,
  new AzureKeyCredential(azureApiKey)
);

export default azureOpenAi;

// const messages = [
//   { role: "system", content: "You are a helpful assistant." },
//   { role: "user", content: "Does Azure OpenAI support customer managed keys?" },
// ];

// async function main() {
//   console.log("== Chat Completions Sample ==");

//   const client = new OpenAIClient(
//     endpoint,
//     new AzureKeyCredential(azureApiKey)
//   );
//   const result = await client.getChatCompletions(deploymentId, messages, {});

//   for (const choice of result.choices) {
//     console.log(choice.message.content);
//   }
// }
