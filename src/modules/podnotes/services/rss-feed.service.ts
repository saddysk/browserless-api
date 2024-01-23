import { Request } from "express";
import { IResponse } from "../../../interfaces/response.interface";
import axios from "axios";
import xml2js from "xml2js";

const parser = new xml2js.Parser();

export const rssFeedService = async (req: Request): Promise<IResponse> => {
  const { url } = req.body;

  const { data: rssFeed } = await axios.get(url);

  const podcasts: any = [];
  parser.parseString(rssFeed, (err, result) => {
    if (err) {
      console.error("Error parsing XML:", err);
      return;
    }

    try {
      const data = result.rss.channel[0].item;
      data.forEach((podcast: any) => {
        podcasts.push({
          title: podcast.title[0],
          podcastUrl: podcast.enclosure[0].$.url,
        });
      });
    } catch (error) {
      console.log(`Error processing parsed XML for rss feed: ${url}`);
      console.error(error);
    }
  });

  return {
    status: 200,
    body: {
      data: { podcasts: [...podcasts] },
    },
  };
};
