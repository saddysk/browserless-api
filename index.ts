import express, { Express, Request, Response } from "express";
import cors from "cors";
import { AppConfig } from "./src/config/config";

import youtubeDownloaderRoute from "./src/modules/yt-downloader/youtube-downloader.route";
import audioTrimmerRoute from "./src/modules/audio-trimmmer/audio-trimmmer.route";
import audioNotesRoute from "./src/modules/audio-notes/audio-notes.route";
import summaryRoute from "./src/modules/summary/summary.route";
import podnotesRoute from "./src/modules/podnotes/podnotes.route";

const CONFIG = AppConfig();

const app: Express = express();
const PORT = CONFIG.PORT || 3010;

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/youtube-downloader", youtubeDownloaderRoute);
app.use("/api/audio-trimmer", audioTrimmerRoute);
app.use("/api/audio-notes", audioNotesRoute);
app.use("/api/podnotes", podnotesRoute);
app.use("/api/summary", summaryRoute);

app.get("/api", (req: Request, res: Response) => {
  res.send("Api Working!");
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
