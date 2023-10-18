import { OpenAI } from "openai";

const configuration = {
  apiKey: process.env["OPENAI_KEY"],
  // organization: process.env["OPENAI_ORGANIZATION"],
};

const openai = new OpenAI(configuration);

export default openai;
