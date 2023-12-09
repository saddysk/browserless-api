import { IResponse } from "../../../interfaces/response.interface";
import axios from "axios";
import { uploadToAwsS3 } from "../../storage/services/storage.service";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { Request } from "express";
import { URL } from "url";
import path from "path";

export const audioTrimmerService = async (req: Request): Promise<IResponse> => {
  const { audioUrl, startTimeInMs, endTimeInMs, fileName } = req.body;

  // get extension
  const url = new URL(audioUrl);
  const pathname = url.pathname;
  const extension = path.extname(pathname).slice(1);

  if (!["http://", "https://"].some((str) => audioUrl.includes(str))) {
    return {
      status: 400,
      body: {
        error: `Invalid url: ${audioUrl}`,
      },
    };
  }

  if (startTimeInMs == null || endTimeInMs == null) {
    return {
      status: 400,
      body: {
        error: `Missing start or end time. Start: ${startTimeInMs}, End: ${endTimeInMs}`,
      },
    };
  }

  try {
    // Download the audio file using Axios
    console.log(`[Log] Downloading audio: ${audioUrl}`);
    const response = await axios.get(audioUrl, {
      responseType: "stream",
    });

    // Create a writable stream to store the trimmed audio
    const compressedStream = new PassThrough();

    // Pipe the response data from Axios to ffmpeg
    const command = ffmpeg()
      .input(response.data)
      .inputFormat(extension)
      .seekInput(startTimeInMs / 1000)
      .duration((endTimeInMs - startTimeInMs) / 1000)
      .audioCodec("libmp3lame")
      .toFormat("mp3");

    const trimmedAudio = await new Promise<string>(async (resolve, reject) => {
      command.on("error", (error: any) => {
        reject(error);
      });

      command.pipe(compressedStream, { end: true });

      console.log("[Log] Audio trimmed successfully. Uploading to cloud.");

      const filePath = `trimmed-audio/${fileName}`;
      // const audioPath = await uploadToSupabase(filePath, compressedStream);
      const audioUrl = await uploadToAwsS3(filePath, compressedStream);

      resolve(audioUrl);
    });

    console.debug(`[Debug] Trimmed audio uploaded to cloud: ${trimmedAudio}`);

    // Return the upload response
    return {
      status: 200,
      body: {
        data: trimmedAudio,
      },
    };
  } catch (error) {
    console.error(`[Error] ${error}`);
    return {
      status: 200,
      body: {
        error: error as object,
      },
    };
  }
};
