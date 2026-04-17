import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY || "" });

interface Scene {
  scene_number: number;
  visual_description: string;
  narration: string;
  duration_seconds: number;
  mood: string;
}

interface FalVideoResult {
  video: { url: string; content_type: string; file_name: string; file_size: number };
}

export const maxDuration = 300; // 5 min max for video generation

export async function POST(request: Request) {
  const { scenes, endingType } = await request.json();

  if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
    return Response.json({ error: "No scenes provided" }, { status: 400 });
  }

  // Cap at 3 scenes to control costs (~$0.07/s per clip)
  const cappedScenes = scenes.slice(0, 3);

  const moodCinema: Record<string, string> = {
    empowering:
      "dramatic golden hour lighting, volumetric god rays, heroic atmosphere, warm amber tones, cinematic lens flare",
    calm:
      "soft ethereal diffused light, gentle fog, serene blue-silver palette, shallow depth of field, peaceful floating particles",
    warm:
      "intimate amber candlelight, cozy golden bokeh, soft focus background, gentle warm color grading",
    peaceful:
      "cool blue twilight, moonlit mist, tranquil water reflections, ethereal glow, slow drifting clouds",
    hopeful:
      "dawn breaking through clouds, pink and gold sunrise palette, volumetric light shafts, ascending perspective",
  };

  const moodCamera: Record<string, string> = {
    empowering: "slow dramatic dolly forward, slight low angle looking up, steady heroic camera movement",
    calm: "gentle floating drift, smooth lateral pan, breathing camera movement like meditation",
    warm: "intimate slow push in, soft handheld feel, tender dolly closer",
    peaceful: "serene glide, weightless floating camera, slow ascending crane shot",
    hopeful: "gradual upward tilt revealing sky, slow rising camera, expanding wide shot",
  };

  const endingTone: Record<string, string> = {
    mastery: "triumphant, powerful, overcoming adversity, strength emerging",
    transformation: "metamorphosis, beauty emerging from darkness, transcendent change",
    safety: "sanctuary, warmth, protection, coming home, deep comfort",
  };

  try {
    // Kling 2.6 Pro: cinematic quality, $0.07/s (~$0.35 per 5s clip)
    // v2/standard was deprecated (instant 0.02s failures). v2.6/pro works.
    const results = await Promise.all(
      cappedScenes.map(async (scene: Scene, index: number) => {
        const cinema = moodCinema[scene.mood] || moodCinema.calm;
        const camera = moodCamera[scene.mood] || moodCamera.calm;
        const tone = endingTone[endingType] || "";

        const prompt = [
          "First-person POV shot from inside the dreamer's eyes. The camera IS the dreamer's vision. Hands and arms partially visible at bottom of frame when relevant",
          "Cinematic dream sequence, photorealistic, 4K film quality, subtle film grain, anamorphic lens",
          camera,
          cinema,
          tone,
          scene.visual_description,
          "No third-person view, no external person visible as the dreamer, no over-the-shoulder shots. The viewer IS the dreamer looking out through their own eyes",
          "Smooth continuous motion. Dreamlike cinematic quality, Emmanuel Lubezki cinematography style. No text, no watermarks, no UI elements",
        ].join(". ");

        try {
          const result = await fal.subscribe("fal-ai/kling-video/v2.6/pro/text-to-video", {
            input: {
              prompt,
              duration: "5",
              aspect_ratio: "16:9",
              negative_prompt: "third person view, external person, over the shoulder, back of head, full body shot, blur, distort, low quality, text, watermark, logo, cartoon, anime, ugly, deformed, glitch, artifact, static image",
            },
            pollInterval: 5000,
          });

          const data = result.data as FalVideoResult;

          return {
            scene_number: scene.scene_number || index + 1,
            video_url: data.video?.url || null,
            narration: scene.narration,
            duration_seconds: 10,
            mood: scene.mood,
            visual_description: scene.visual_description,
          };
        } catch (err) {
          const error = err as { body?: { detail?: string }; message?: string };
          console.error(`Scene ${index + 1} generation failed:`, error.message || error.body?.detail);
          return {
            scene_number: scene.scene_number || index + 1,
            video_url: null,
            error: error.body?.detail || error.message || "Generation failed",
            narration: scene.narration,
            duration_seconds: 10,
            mood: scene.mood,
            visual_description: scene.visual_description,
          };
        }
      })
    );

    return Response.json({ scenes: results });
  } catch (err) {
    return Response.json(
      { error: (err as Error).message || "Failed to generate videos" },
      { status: 503 }
    );
  }
}
