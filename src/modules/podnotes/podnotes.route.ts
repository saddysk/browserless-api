import express, { Request, Response } from "express";
import { rssFeedService } from "./services/rss-feed.service";

const podnotesRoute = express.Router();

podnotesRoute.post("/rss-feed", async (req: Request, res: Response) => {
  const response = await rssFeedService(req);
  res.status(response["status"]);
  res.send(response);
});

export default podnotesRoute;
