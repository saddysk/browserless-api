import { Deepgram } from "@deepgram/sdk";

const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY!);

export async function getTranscription(audioUrl: string): Promise<string> {
  console.debug(`[Debug] Transcribing audio url.`);

  try {
    const audioSource = {
      url: audioUrl,
    };

    const response = await deepgram.transcription.preRecorded(audioSource);

    const trascription =
      response.results?.channels[0].alternatives[0].transcript;

    if (trascription == null) {
      throw new Error("Failed to get transcription");
    }

    return trascription;
  } catch (error) {
    throw error;
  }
}
