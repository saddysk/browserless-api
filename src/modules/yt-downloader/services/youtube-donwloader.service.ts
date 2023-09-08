import { Request } from "express";
import youtubeDl from "youtube-dl-exec";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { v4 as uuidv4 } from "uuid";
import { IResponse } from "../../../interfaces/response.interface";
import { uploadToSupabase } from "../../storage/services/storage.service";

const youtubeDownloaderService = async (req: Request): Promise<IResponse> => {
  const { videoUrl } = req.body;

  if (!["youtube.com", "youtu.be"].some((str) => videoUrl.includes(str))) {
    return {
      status: 400,
      body: {
        error: `Invalid url: ${videoUrl}`,
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
      throw new Error();
    }

    // Create a pass-through stream to store the compressed audio
    const compressedStream = new PassThrough();

    // Compress the audio stream using fluent-ffmpeg
    console.debug(`[Debug] Retrieving & compressing audio...`);

    const command = ffmpeg()
      .input(audioStream)
      .audioCodec("libmp3lame")
      .audioBitrate(128)
      .toFormat("mp3");

    const response = await new Promise<IResponse>(async (resolve, reject) => {
      command.on("error", (error: any) => {
        reject(error);
      });

      command.pipe(compressedStream, { end: true });

      const filePath = `youtube-audio/${uuidv4()}.mp3`;
      const response = await uploadToSupabase(filePath, compressedStream);

      resolve(response);
    });

    return response;
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

export default youtubeDownloaderService;
