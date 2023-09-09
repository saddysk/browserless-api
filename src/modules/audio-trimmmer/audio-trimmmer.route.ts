import express, { Request, Response } from "express";
import { audioTrimmerService } from "./services/audio-trimmmer.service";

const audioTrimmerRoute = express.Router();

audioTrimmerRoute.post("/", async (req: Request, res: Response) => {
  const response = await audioTrimmerService(req);
  res.status(response["status"]);
  res.send(response);
});

export default audioTrimmerRoute;
