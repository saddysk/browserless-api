import { Request } from "express";
import { IResponse } from "../../../interfaces/response.interface";
import axios from "axios";
import { splitStringIntoChunks } from "./bubble-notion-call.service";
import { v4 as uuidv4 } from "uuid";

const OPENAI_API_URL = "https://api.openai.com/v1/embeddings";
const OPENAI_API_KEY = process.env["AUDIONOTES_OPENAI_API_KEY"];
const PINECONE_API_URL =
  "https://audionotes-1hdd7nb.svc.gcp-starter.pinecone.io/vectors/upsert";
const PINECONE_API_KEY = process.env["AUDIONOTES_PINECONE_API_KEY"];

export const pineconeService = async (req: Request): Promise<IResponse> => {
  const { id, text, namespace } = req.body;

  try {
    const textChunks = splitStringIntoChunks(text);

    textChunks.map(async (chunk) => {
      const openaiResponse = await axios.post(
        OPENAI_API_URL,
        {
          input: chunk,
          model: "text-embedding-ada-002",
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const uniqueId = uuidv4();
      await axios
        .post(
          PINECONE_API_URL,
          {
            vectors: [
              {
                id: uniqueId,
                metadata: {
                  text: chunk,
                  note: id,
                  email: namespace,
                },
                values: openaiResponse.data.data[0].embedding,
              },
            ],
          },
          {
            headers: {
              "Api-Key": PINECONE_API_KEY,
            },
          }
        )
        .then(() =>
          console.log(`Data stored for note id: ${id}, id: ${uniqueId}`)
        )
        .catch((error) =>
          console.log(`${error} ---note id ${id}, id: ${uniqueId}`)
        );

      // Wait for 0.5 seconds
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    return {
      status: 200,
      body: {
        message: "Operation started.",
      },
    };
  } catch (error) {
    console.error(error);
    return {
      status: 400,
      body: { error: error as object },
    };
  }
};
