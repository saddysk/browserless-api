import express, { Request, Response } from "express";
import { bubbleNotionCallService } from "./services/bubble-notion-call.service";

const bubbleNotionCallRoute = express.Router();

bubbleNotionCallRoute.post("/", async (req: Request, res: Response) => {
  const response = await bubbleNotionCallService(req);
  res.status(response["status"]);
  res.send(response);
});

export default bubbleNotionCallRoute;
