import { Request } from "express";
import { IResponse } from "../../../interfaces/response.interface";
import axios from "axios";
import { splitStringIntoChunks } from "./bubble-notion-call.service";

const OPENAI_API_URL = "https://api.openai.com/v1/embeddings";
const OPENAI_API_KEY = process.env["AUDIONOTES_OPENAI_API_KEY"];
const PINECONE_API_URL =
  "https://podnotes-soyl752.svc.gcp-starter.pinecone.io/vectors/upsert";
const PINECONE_API_KEY = process.env["AUDIONOTES_PINECONE_API_KEY"];

const generateUniqueId = (): string => {
  const now = new Date();
  const uniqueId = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(
    2,
    "0"
  )}${String(now.getMinutes()).padStart(2, "0")}${String(
    now.getSeconds()
  ).padStart(2, "0")}`;

  return uniqueId;
};

export const pineconeService = async (req: Request): Promise<IResponse> => {
  const { id, text, namespace } = req.body;

  try {
    const textChunks = splitStringIntoChunks(text, 1000);

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

      const uniqueId = generateUniqueId();
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
