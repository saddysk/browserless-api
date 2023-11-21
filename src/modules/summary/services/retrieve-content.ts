import axios from "axios";
import { getTranscription } from "../../../utils/deepgram";
import {
  processDownloading,
  simulateProcessing,
} from "../../yt-downloader/services/process-download";
import internal from "stream";
import pdf from "pdf-parse";

export async function getContentFromBase64(base64: string): Promise<string> {
  const pdfBuffer = Buffer.from(base64, "base64");

  try {
    // Load the PDF file
    const data = await pdf(pdfBuffer);

    // Extract and return the text content
    return data.text.replaceAll("\u0000", "");
  } catch (error) {
    console.error("Error processing PDF:", error);
    throw error;
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
  const response = await axios.post("https://recapiogpt.p.rapidapi.com", data, {
    headers,
  });

  return response.data.text;
}

export async function getContentFromYtUrl(url: string): Promise<string> {
  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
    return "";
  }

  const audioStream = await processDownloading(url);
  const audioUrl = await simulateProcessing(audioStream as internal.Readable);

  const alternative = await getTranscription(audioUrl);
  return alternative.transcript;
}

export async function getContentFromAudioUrl(url: string): Promise<string> {
  const audioExtensions = [".mp3", ".wav"];

  if (!audioExtensions.some((ext) => url.toLocaleLowerCase().endsWith(ext))) {
    return "";
  }

  const alternative = await getTranscription(url);
  return alternative.transcript;
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
