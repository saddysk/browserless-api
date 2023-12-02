import axios from "axios";
import { getTranscription } from "../../../utils/deepgram";
import {
  processDownloading,
  simulateProcessingBuffer,
} from "../../yt-downloader/services/process-download";
import internal from "stream";
import pdf from "pdf-parse";

export async function getContentFromBase64(
  pdfFile: Express.Multer.File
): Promise<string> {
  try {
    // Load the PDF file
    const data = await pdf(pdfFile.buffer);

    // Extract and return the text content
    return data.text.replaceAll("\u0000", "");
  } catch (error) {
    throw new Error("Invalid text content provided. Please revalidate.");
  }
}

export async function getContentFromWebUrl(url: string): Promise<string> {
  const headers = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
    "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
  };

  const data = {
    type: "Url",
    source: url,
    processingLevel: "Basic",
  };

  try {
    const response = await axios.post(
      "https://recapiogpt.p.rapidapi.com",
      data,
      { headers }
    );

    return response.data.text;
  } catch {
    throw new Error(`Can not read data from the provided url.`);
  }
}

export async function getContentFromYtUrl(url: string): Promise<string> {
  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    return "";
  }

  try {
    const audioStream = await processDownloading(url);
    const audioBuffer = await simulateProcessingBuffer(
      audioStream as internal.Readable
    );

    const alternative = await getTranscription(audioBuffer);
    return alternative.transcript;
  } catch {
    throw new Error(
      "Cannot read data. Please check if it is a valid youtube url."
    );
  }
}

export async function getContentFromAudioUrl(
  audioFile: Express.Multer.File
): Promise<string> {
  try {
    const alternative = await getTranscription(
      audioFile.buffer,
      audioFile.mimetype
    );
    return alternative.transcript;
  } catch (error) {
    throw error;
  }
}

// const getWebContent = async (url: string): Promise<string> => {
//   try {
//     const response = await axios.get(url);

//     if (response.status === 200) {
//       const $ = load(response.data);
//       const textElements = $("p, h1, h2, h3, span, a");

//       const extractedText = textElements
//         .map((index, element) => $(element).text())
//         .get()
//         .join(" ");

//       return extractedText;
//     } else {
//       throw new Error("Failed to fetch website content");
//     }
//   } catch (error) {
//     throw error;
//   }
// };
