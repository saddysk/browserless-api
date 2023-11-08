import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const deploymentId = "xxx";
const endpoint = "xxx";
const azureApiKey = "xxx";

const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Does Azure OpenAI support customer managed keys?" },
];

async function main() {
  console.log("== Chat Completions Sample ==");

  const client = new OpenAIClient(
    endpoint,
    new AzureKeyCredential(azureApiKey)
  );
  const result = await client.getChatCompletions(deploymentId, messages, {
    maxTokens: 1000 * 4,
    model: "gpt-35-turbo-16k",
    temperature: 0.8,
  });

  for (const choice of result.choices) {
    console.log(choice.message.content);
  }
}

main();
