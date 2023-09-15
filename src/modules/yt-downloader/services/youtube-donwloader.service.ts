import { Request } from "express";
import youtubeDl from "youtube-dl-exec";
import ffmpeg from "fluent-ffmpeg";
import internal, { PassThrough } from "stream";
import { v4 as uuidv4 } from "uuid";
import { IResponse } from "../../../interfaces/response.interface";
import { uploadToAwsS3 } from "../../storage/services/storage.service";
import axios from "axios";

const youtubeDownloaderService = async (req: Request): Promise<IResponse> => {
  const { callback, videoUrl } = req.body;

  if (!["youtube.com", "youtu.be"].some((str) => videoUrl.includes(str))) {
    return {
      status: 400,
      body: {
        error: `Invalid url: ${videoUrl}`,
      },
    };
  }

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

  console.log(`[Log] Starting download: ${videoUrl}`);

  try {
    const audioStream = youtubeDl.exec(
      videoUrl,
      {
        extractAudio: true,
        format: "bestaudio",
        output: "-",
      },
      { stdio: ["ignore", "pipe", "pipe"] }
    ).stdout;

    if (audioStream == null) {
      const ERROR = `[Error]  Couldn't download the file`;
      console.error(ERROR);
      return {
        status: 400,
        body: {
          message: ERROR,
        },
      };
    }

    processInBackground(callback, audioStream, req.params.id);

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

// Simulate a time-consuming process
async function simulateProcessing(
  audioStream: internal.Readable
): Promise<string> {
  // Create a pass-through stream to store the compressed audio
  const compressedStream = new PassThrough();

  const command = ffmpeg()
    .input(audioStream)
    .audioCodec("libmp3lame")
    .audioBitrate(128)
    .toFormat("mp3");

  const response = await new Promise<string>(async (resolve, reject) => {
    command.on("error", (error: any) => {
      reject(error);
    });

    command.pipe(compressedStream, { end: true });

    const filePath = `youtube-audio/${uuidv4()}.mp3`;

    // const audioPath = await uploadToSupabase(filePath, compressedStream);
    // const audioUrl = await getPublicUrl(audioPath);

    const audioUrl = await uploadToAwsS3(filePath, compressedStream);

    resolve(audioUrl);
  });

  return response;
}

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
