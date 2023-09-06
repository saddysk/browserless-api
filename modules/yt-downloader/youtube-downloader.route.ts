import express from "express";
import youtubeDownloaderService from "./services/youtube-donwloader.service";

const youtubeDownloaderRoute = express.Router();

youtubeDownloaderRoute.post("/", async (req, res) => {
  var response = await youtubeDownloaderService(req);
  res.status(response["status"]);
  res.send(response);
});

export default youtubeDownloaderRoute;
