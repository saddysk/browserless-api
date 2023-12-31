import express, { Request, Response } from "express";
import youtubeDownloaderService from "./services/youtube-downloader.service";
import simpleYtDownloaderService from "./services/simple-yt-downloader.service";
import ytTranscriptionService from "./services/yt-transcription.service";

const youtubeDownloaderRoute = express.Router();

youtubeDownloaderRoute.get("", async (req: Request, res: Response) => {
  const response = await simpleYtDownloaderService(req);
  res.status(response["status"]);
  res.send(response);
});

youtubeDownloaderRoute.post(
  "/transcription",
  async (req: Request, res: Response) => {
    const response = await ytTranscriptionService(req);
    res.status(response["status"]);
    res.send(response);
  }
);

youtubeDownloaderRoute.post("/:id", async (req: Request, res: Response) => {
  const response = await youtubeDownloaderService(req);
  res.status(response["status"]);
  res.send(response);
});

export default youtubeDownloaderRoute;
