import { Request } from "express";
import { IResponse } from "../../../interfaces/response.interface";

interface IPost {
  Post: string;
  UniqueID: string;
  Relevance: string;
}

interface IRequest {
  posts: IPost[];
}

export const bubbleJsonService = async (req: Request): Promise<IResponse> => {
  const data = req.body;

  return {
    status: 200,
    body: {
      data: data as object,
    },
  };
};
