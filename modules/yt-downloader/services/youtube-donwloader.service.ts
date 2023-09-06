import { Request, Response } from "express";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import supabase from "../../../config/supabase.config";
import { AppConfig } from "../../../config/config";
import { isValidYouTubeUrl } from "../../../utils/validation";
import { IResponse } from "../../../interfaces/response.interface";
import { v4 as uuidv4 } from "uuid";

const CONFIG = AppConfig();

const youtubeDownloaderService = async (req: Request): Promise<IResponse> => {
  const { videoUrl } = req.body;

  if (!isValidYouTubeUrl(videoUrl)) {
    return {
      status: 400,
      body: {
        error: `Invalid url: ${videoUrl}`,
      },
    };
  }

  // Get video info
  const info = await ytdl.getInfo(videoUrl);

  // Get the best audio stream
  const audioStream = ytdl(videoUrl, { quality: "highestaudio" });

  // Create a pass-through stream to store the compressed audio
  const compressedStream = new PassThrough();

  // Compress the audio stream using fluent-ffmpeg
  ffmpeg()
    .input(audioStream)
    .audioCodec("libmp3lame")
    .audioBitrate(128)
    .format("mp3")
    .pipe(compressedStream, { end: true });

  const filePath = `youtube-audio/${uuidv4()}.mp3`;

  // Upload the compressed audio to Supabase
  const { data, error } = await supabase.storage
    .from(CONFIG.SUPABASE_BUCKET)
    .upload(filePath, compressedStream, {
      cacheControl: "3600",
      upsert: true,
      contentType: "audio/mpeg",
    });

  if (error) {
    console.error("Error uploading audio to Supabase:", error);
    return {
      status: 400,
      body: {
        error,
      },
    };
  } else {
    console.log(`Audio compressed and uploaded to Supabase: ${data.path}`);

    return {
      status: 200,
      body: {
        data: await getPublicUrl(data.path),
      },
    };
  }
};

async function getPublicUrl(path: string): Promise<string> {
  if (!path) {
    throw new Error(`Invalid supabase object path: ${path}`);
  }

  const { data } = supabase.storage
    .from(CONFIG.SUPABASE_BUCKET)
    .getPublicUrl(path);

  if (data == null) {
    throw new Error(`Public url for the object not found`);
  }

  return data.publicUrl;
}

export default youtubeDownloaderService;
