import express, { Request, Response } from "express";
import { bubbleNotionCallService } from "./services/bubble-notion-call.service";
import { bubbleJsonService } from "./services/bubble-json.service";

const bubbleRoute = express.Router();

bubbleRoute.post("/", async (req: Request, res: Response) => {
  const response = await bubbleNotionCallService(req);
  res.status(response["status"]);
  res.send(response);
});

bubbleRoute.post("/json", async (req: Request, res: Response) => {
  const response = await bubbleJsonService(req);
  res.status(response["status"]);
  res.send(response);
});

export default bubbleRoute;
