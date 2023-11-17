import express, { Request, Response } from "express";
import { generateSummaryService } from "./services/summarify.service";

const summaryRoute = express.Router();

summaryRoute.post("/", async (req: Request, res: Response) => {
  const response = await generateSummaryService(req);
  res.status(response["status"]);
  res.send(response);
});

export default summaryRoute;
