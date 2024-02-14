import { IResponse } from "../../../interfaces/response.interface";
import { Request } from "express";
import ytdl from "ytdl-core";

const downloadYoutubeVideoService = async (
  req: Request
): Promise<IResponse> => {
  const { videoUrl, qualityLabel, container, hasVideo, hasAudio } = req.body;

  // console.log(videoUrl, qualityLabel, container, hasVideo, hasAudio);

  try {
    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
      throw new Error("Invalid URL provided");
    }

    // Fetch video info
    const info = await ytdl.getInfo(videoUrl);

    if (info.videoDetails.isUnlisted) {
      throw new Error("Video not found");
    }
    if (info.videoDetails.isLiveContent) {
      throw new Error(
        "Sorry, can not download live video. Try with different Youtube URL"
      );
    }

    console.log(`[Log] Starting download: ${videoUrl}`);

    const format = ytdl.chooseFormat(info.formats, {
      filter: (format) =>
        format.qualityLabel === qualityLabel &&
        format.container === container &&
        format.hasVideo === hasVideo &&
        format.hasAudio === hasAudio,
    });

    const stream = ytdl.downloadFromInfo(info, {
      format: format,
    });

    if (stream == null) {
      throw new Error(`[Error]  Couldn't download the file`);
    }

    const contentType = !hasVideo && hasAudio ? "audio/mpeg" : "video/mp4";

    console.log(`File extracted successfully for url: ${videoUrl}`);

    return {
      status: 200,
      data: { contentType, stream },
    };
  } catch (error) {
    console.error(`[Error] ${error}`);
    return {
      status: 500,
      error: `Error during audio download and processing. ${error}`,
    };
  }
};

export default downloadYoutubeVideoService;
