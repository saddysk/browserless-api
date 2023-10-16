import internal from "stream";
import { IResponse } from "../../../interfaces/response.interface";
import youtubeDl from "youtube-dl-exec";
import { uploadToAwsS3 } from "../../storage/services/storage.service";
import { v4 as uuidv4 } from "uuid";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

export const processDownloading = async (
  videoUrl: string
): Promise<IResponse | internal.Readable> => {
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
      const ERROR = `[Error]  Couldn't download the file`;
      console.error(ERROR);
      return {
        status: 400,
        body: {
          message: ERROR,
        },
      };
    }

    return audioStream;
  } catch (error) {
    throw error;
  }
};

// Simulate a time-consuming process
export async function simulateProcessing(
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
