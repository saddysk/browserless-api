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
    body: { data: srtFormatedString, srt: convertToSRT(srtFormatedString) },
  };
};

function convertToSRT(data: any) {
  return data
    .map((item: any, index: any) => {
      const startTime = formatTime(item.start);
      const endTime = formatTime(item.end);
      const text = item.text;

      return `${index + 1}\nspeaker-${
        item.speaker
      }\n${startTime} --> ${endTime}\n${text}\n`;
    })
    .join("\n");
}

function formatTime(timeInSeconds: any) {
  const pad = (num: any, size: any) => ("000" + num).slice(size * -1);
  let time = parseFloat(timeInSeconds).toFixed(3);
  let hours = Math.floor((time as any) / 60 / 60);
  let minutes = Math.floor((time as any) / 60) % 60;
  let seconds = Math.floor(time as any) % 60;
  let milliseconds = time.slice(-3);

  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(
    seconds,
    2
  )},${milliseconds}`;
}
