import { Request } from "express";
import { IResponse } from "../../../interfaces/response.interface";

export const srtService = async (req: Request): Promise<IResponse> => {
  const { results: rawData } = req.body;

  //   const rawData = JSON.parse(data);

  const paragraphs = rawData.channels[0].alternatives[0].paragraphs.paragraphs;

  const srtFormatedString = paragraphs.map((para: any) => {
    const sentence = para.sentences.map((item: any) => item.text).join(" ");

    return {
      speaker: para.speaker,
      start: para.start,
      end: para.end,
      text: sentence,
    };
  });

  return {
    status: 200,
    body: { data: srtFormatedString },
  };
};
