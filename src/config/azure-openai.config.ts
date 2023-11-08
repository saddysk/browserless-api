import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT!;
const azureApiKey = process.env.AZURE_OPENAI_KEY!;

const azureOpenAi = new OpenAIClient(
  endpoint,
  new AzureKeyCredential(azureApiKey)
);

export default azureOpenAi;
