import express, { Express, Request, Response } from "express";
import cors from "cors";
import { AppConfig } from "./src/interfaces/config/config";

import youtubeDownloaderRoute from "./src/modules/yt-downloader/youtube-downloader.route";
import audioTrimmerRoute from "./src/modules/audio-trimmmer/audio-trimmmer.route";
import bubbleNotionCallRoute from "./src/modules/bubble-notion-call/bubble-notion-call.route";

const CONFIG = AppConfig();

const app: Express = express();
const PORT = CONFIG.PORT || 3010;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/browserless/api/youtube-downloader", youtubeDownloaderRoute);
app.use("/browserless/api/audio-trimmer", audioTrimmerRoute);
app.use("/browserless/api/bubble-notion", bubbleNotionCallRoute);

app.get("/browserless/api", (req: Request, res: Response) => {
  res.send("Api Working!");
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
