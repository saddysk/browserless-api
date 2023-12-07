import express, { Request, Response } from "express";
import { notionService } from "./services/notion.service";
import { jsonService } from "./services/json.service";
import { pineconeService } from "./services/pinecone.service";

const audioNotes = express.Router();

audioNotes.post("/notion", async (req: Request, res: Response) => {
  const response = await notionService(req);
  res.status(response["status"]);
  res.send(response);
});

audioNotes.post("/json", async (req: Request, res: Response) => {
  const response = await jsonService(req);
  res.status(response["status"]);
  res.send(response);
});

audioNotes.post("/pinecone", async (req: Request, res: Response) => {
  const response = await pineconeService(req);
  res.status(response["status"]);
  res.send(response);
});

export default audioNotes;
