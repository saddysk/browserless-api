import express, { Request, Response } from "express";
import { generateSummaryService } from "./services/summarify.service";
import multer from "multer";

const upload = multer();

const summaryRoute = express.Router();

summaryRoute.post(
  "/",
  upload.single("inputFile"),
  async (req: Request, res: Response) => {
    const response = await generateSummaryService(req);
    res.status(response["status"]);
    res.send(response);
  }
);

export default summaryRoute;
