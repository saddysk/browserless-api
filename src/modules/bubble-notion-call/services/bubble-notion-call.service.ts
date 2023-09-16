import { Request } from "express";
import axios from "axios";
import { IResponse } from "../../../interfaces/response.interface";

export const bubbleNotionCallService = async (
  req: Request
): Promise<IResponse> => {
  const { url, authorization } = req.body;

  const NOTION_URL = "https://api.notion.com/v1/pages";

  const notionData = await axios.get(url);

  const config = {
    url: NOTION_URL,
    method: "POST",
    headers: {
      Authorization: authorization,
      "Content-Type": "application/json",
      "Notion-Version": "2022-06-28",
    },
    data: notionData.data,
  };

  try {
    const response = await axios(config);
    return {
      status: 200,
      body: {
        data: response.data,
      },
    };
  } catch (error) {
    console.error(`[Error] ${error}`);
    return {
      status: 400,
      body: {
        error: error as object,
      },
    };
  }
};
