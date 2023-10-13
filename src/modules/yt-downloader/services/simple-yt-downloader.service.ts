import youtubeDl from "youtube-dl-exec";
import { IResponse } from "../../../interfaces/response.interface";
import { simulateProcessing } from "./youtube-donwloader.service";
import { Request } from "express";

const simpleYtDownloaderService = async (req: Request): Promise<IResponse> => {
  const videoUrl = req.query.videourl as string;

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

    const audioUrl = await simulateProcessing(audioStream);

    return {
      status: 200,
      body: {
        data: audioUrl,
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

export default simpleYtDownloaderService;
