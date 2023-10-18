import { Deepgram } from "@deepgram/sdk";
import { Alternative } from "@deepgram/sdk/dist/types";

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY!);

export async function getTranscription(audioUrl: string): Promise<Alternative> {
  console.debug(`[Debug] Transcribing audio url.`);

  try {
    const audioSource = {
      url: audioUrl,
    };

    const response = await deepgram.transcription.preRecorded(audioSource, {
      detect_language: true,
    });

    const trascription =
      response.results?.channels[0].alternatives[0];

    if (trascription == null) {
      throw new Error("Failed to get transcription");
    }

    return trascription;
  } catch (error) {
    throw error;
  }
}
