import express, { Express, Request, Response } from "express";
import cors from "cors";
import { AppConfig } from "./config/config";

import youtubeDownloaderRoute from "./modules/yt-downloader/youtube-downloader.route";

const CONFIG = AppConfig();

const app: Express = express();
const PORT = CONFIG.PORT || 3010;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/browserless/api/youtube-downloader", youtubeDownloaderRoute);

app.get("/browserless/api", (req: Request, res: Response) => {
  res.send("Api Working!");
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
