import { Request } from "express";
import { IResponse } from "../../../interfaces/response.interface";
import { processDownloading, simulateProcessing } from "./process-download";
import axios from "axios";
import { getTranscription } from "../../../utils/deepgram";
import internal from "stream";

const ytTranscriptionService = async (req: Request): Promise<IResponse> => {
  const { id, callbackUrl, videoUrl } = req.body;

  try {
    if (!id || !callbackUrl) {
      const ERROR =
        "[Error] Invalid" + !id &&
        `id: ${id}, ` + !callbackUrl &&
        `callback url: ${callbackUrl}`;
      console.error(ERROR);
      return {
        status: 400,
        body: {
          message: ERROR,
        },
      };
    }

    const audioStream = await processDownloading(videoUrl);

    processInBackground(id, callbackUrl, audioStream as internal.Readable);

    return {
      status: 200,
      body: {
        message: "Video processing started.",
      },
    };
  } catch (error) {
    console.error(`[Error] ${error}`);
    return {
      status: 500,
      body: {
        error: `Error during audio download and processing. ${error}`,
      },
    };
  }
};

// Background processing
async function processInBackground(
  id: string,
  callback: string,
  audioStream: internal.Readable
) {
  // Compress the audio stream using fluent-ffmpeg
  console.debug(`[Debug] Retrieving & compressing audio...`);

  try {
    const audioUrl = await simulateProcessing(audioStream);

    if (audioUrl == null) {
      console.error("[Error] Failed to process audio download.");
    }

    console.debug(
      `[Debug] Processing completed and audio url: ${audioUrl}, sending to callback: ${callback}`
    );

    const transcription = await getTranscription(audioUrl);

    console.info(transcription);

    // Send the result to the callback URL
    await axios
      .post(callback, {
        id,
        transcription,
      })
      .catch((error) =>
        console.error(
          `[Error] ${error}. Failed to send renponse to callback url.`
        )
      );
  } catch (error) {
    console.error("Error processing the task:", error);
  }
}

export default ytTranscriptionService;
