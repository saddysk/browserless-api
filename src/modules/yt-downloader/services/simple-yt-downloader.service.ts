import { IResponse } from "../../../interfaces/response.interface";
import { Request } from "express";
import { processDownloading, simulateProcessingUrl } from "./process-download";
import internal from "stream";

const simpleYtDownloaderService = async (req: Request): Promise<IResponse> => {
  const videoUrl = req.query.videourl as string;

  try {
    const audioStream = await processDownloading(videoUrl);

    const audioUrl = await simulateProcessingUrl(
      audioStream as internal.Readable
    );

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
