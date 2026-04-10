import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY || "" });

interface WhisperResult {
  text: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 });
    }

    // Upload audio to fal storage
    const audioUrl = await fal.storage.upload(audioFile);

    // Transcribe with Whisper
    const result = await fal.subscribe("fal-ai/whisper", {
      input: {
        audio_url: audioUrl,
        task: "transcribe",
        chunk_level: "segment",
      },
    });

    const whisperResult = result.data as WhisperResult;
    return Response.json({ text: whisperResult.text || "" });
  } catch (err) {
    return Response.json(
      { error: (err as Error).message || "Transcription failed" },
      { status: 503 }
    );
  }
}
