import express, { Request, Response } from "express";
import { notionService } from "./services/notion.service";
import { jsonService } from "./services/json.service";
import { pineconeService } from "./services/pinecone.service";

const audioNotesRoute = express.Router();

audioNotesRoute.post("/notion", async (req: Request, res: Response) => {
  const response = await notionService(req);
  res.status(response["status"]);
  res.send(response);
});

audioNotesRoute.post("/json", async (req: Request, res: Response) => {
  const response = await jsonService(req);
  res.status(response["status"]);
  res.send(response);
});

audioNotesRoute.post("/pinecone", async (req: Request, res: Response) => {
  const response = await pineconeService(req);
  res.status(response["status"]);
  res.send(response);
});

export default audioNotesRoute;
