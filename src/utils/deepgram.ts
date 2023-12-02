import { Deepgram } from "@deepgram/sdk";
import { Alternative } from "@deepgram/sdk/dist/types";

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY!);

export async function getTranscription(
  audio: string | Buffer,
  mimetype?: string
): Promise<Alternative> {
  try {
    let response;
    if (typeof audio === "string") {
      response = await deepgram.transcription.preRecorded(
        { url: audio },
        { detect_language: true }
      );
    } else {
      response = await deepgram.transcription.preRecorded(
        {
          buffer: audio,
          mimetype: mimetype ?? "audio/mp3",
        },
        { detect_language: true }
      );
    }

    const trascription = response.results?.channels[0].alternatives[0];

    if (trascription == null) {
      throw new Error("Failed to get transcription");
    }

    return trascription;
  } catch (error) {
    throw error;
  }
}
