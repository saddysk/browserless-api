import { Request } from "express";
import { IResponse } from "../../../interfaces/response.interface";
import axios from "axios";
import xml2js from "xml2js";

const parser = new xml2js.Parser();

export const rssFeedService = async (req: Request): Promise<IResponse> => {
  const { url } = req.body;

  const { data: rssFeed } = await axios.get(url);

  const podcasts: any = [];
  let channelTitle;
  parser.parseString(rssFeed, (err, result) => {
    if (err) {
      console.error("Error parsing XML:", err);
      return;
    }

    try {
      // console.log(result.rss.channel[0]);

      const channel = result.rss.channel[0];

      channelTitle = channel.title[0];
      channel.item.forEach((podcast: any) => {
        // console.log(podcast, "\n-------------\n");
        podcasts.push({
          title: podcast.title[0],
          podcastUrl: podcast.enclosure[0].$.url,
          pudlishDate: podcast.pubDate?.[0],
          duration: podcast["itunes:duration"]?.[0],
          episode: podcast["itunes:episode"]?.[0],
          thumbnail: podcast["itunes:image"]?.[0].$.href,
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
      data: { channelTitle, podcasts: [...podcasts] },
    },
  };
};

// "url": "https://feeds.libsyn.com/494933/rss",
// "url": "https://feeds.megaphone.fm/HS2300184645",
