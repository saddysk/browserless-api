import { Request } from "express";
import internal from "stream";
import { IResponse } from "../../../interfaces/response.interface";
import { processDownloading, simulateProcessing } from "./process-download";
import axios from "axios";

const youtubeDownloaderService = async (req: Request): Promise<IResponse> => {
  const { callback, videoUrl } = req.body;

  try {
    if (!callback) {
      const ERROR = `[Error] Invalid callback url: ${callback}`;
      console.error(ERROR);
      return {
        status: 400,
        body: {
          message: ERROR,
        },
      };
    }

    const audioStream = await processDownloading(videoUrl);

    processInBackground(
      callback,
      audioStream as internal.Readable,
      req.params.id
    );

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
  callback: string,
  audioStream: internal.Readable,
  id: string
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

    // Send the result to the callback URL
    await axios
      .post(callback, {
        id,
        url: audioUrl,
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

export default youtubeDownloaderService;
