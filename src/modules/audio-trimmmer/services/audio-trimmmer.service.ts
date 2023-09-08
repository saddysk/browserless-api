import { IResponse } from "../../../interfaces/response.interface";
import axios from "axios";
import { uploadToSupabase } from "../../storage/services/storage.service";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import { Request } from "express";

export const audioTrimmerService = async (req: Request): Promise<IResponse> => {
  const { audioUrl, startTimeInMs, endTimeInMs } = req.body;

  if (!["http://", "https://"].some((str) => audioUrl.includes(str))) {
    return {
      status: 400,
      body: {
        error: `Invalid url: ${audioUrl}`,
      },
    };
  }

  if (!startTimeInMs || !endTimeInMs) {
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
      .inputFormat("mp3")
      .seekInput(startTimeInMs / 1000)
      .duration((endTimeInMs - startTimeInMs) / 1000)
      .audioCodec("libmp3lame")
      .toFormat("mp3");

    const uploadResponse = await new Promise<IResponse>(
      async (resolve, reject) => {
        command.on("error", (error: any) => {
          reject(error);
        });

        command.pipe(compressedStream, { end: true });

        console.log("[Log] Audio trimmed successfully. Uploading to cloud.");
        const filePath = `trimmed-audio/${uuidv4()}.mp3`;
        const uploadResponse = await uploadToSupabase(
          filePath,
          compressedStream
        );

        resolve(uploadResponse);
      }
    );

    // Return the upload response
    return uploadResponse;
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
