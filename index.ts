import express, { Express, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";

import { AppConfig } from "./src/interfaces/config/config";
import youtubeDownloaderRoute from "./src/modules/yt-downloader/youtube-downloader.route";
import audioTrimmerRoute from "./src/modules/audio-trimmmer/audio-trimmmer.route";
import audioNotes from "./src/modules/audio-notes/audio-notes";
import summaryRoute from "./src/modules/summary/summary.route";

const CONFIG = AppConfig();

const app: Express = express();
const PORT = CONFIG.PORT || 3010;

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// for parsing application/json
app.use(bodyParser.json());

app.use("/api/youtube-downloader", youtubeDownloaderRoute);
app.use("/api/audio-trimmer", audioTrimmerRoute);
app.use("/api/audioNotes", audioNotes);
app.use("/api/summary", summaryRoute);

app.get("/api", (req: Request, res: Response) => {
  res.send("Api Working!");
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
