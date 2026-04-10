import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY || "" });

interface Scene {
  scene_number: number;
  visual_description: string;
  narration: string;
  duration_seconds: number;
  mood: string;
}

export async function POST(request: Request) {
  const { scenes, endingType } = await request.json();

  if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
    return Response.json({ error: "No scenes provided" }, { status: 400 });
  }

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
    // Submit all video jobs to fal queue (returns instantly with request IDs)
    const submissions = await Promise.all(
      scenes.map(async (scene: Scene, index: number) => {
        const cinema = moodCinema[scene.mood] || moodCinema.calm;
        const camera = moodCamera[scene.mood] || moodCamera.calm;
        const tone = endingTone[endingType] || "";

        const prompt = [
          "Cinematic dream sequence, first-person POV perspective, photorealistic, 4K film quality, film grain texture",
          camera,
          cinema,
          tone,
          scene.visual_description,
          "No text, no watermarks, no UI. Smooth continuous motion. Dreamlike cinematic quality, Terrence Malick style.",
        ].join(". ");

        try {
          const { request_id } = await fal.queue.submit("fal-ai/kling-video/v2/master/text-to-video", {
            input: {
              prompt,
              duration: "5",
              aspect_ratio: "16:9",
              negative_prompt: "blur, distort, low quality, text, watermark, logo, cartoon, anime, ugly, deformed, glitch, artifact",
              cfg_scale: 0.5,
            },
          });

          return {
            scene_number: scene.scene_number || index + 1,
            request_id,
            narration: scene.narration,
            duration_seconds: 10,
            mood: scene.mood,
            visual_description: scene.visual_description,
          };
        } catch {
          return {
            scene_number: scene.scene_number || index + 1,
            request_id: null,
            narration: scene.narration,
            duration_seconds: 10,
            mood: scene.mood,
            visual_description: scene.visual_description,
          };
        }
      })
    );

    return Response.json({ scenes: submissions });
  } catch (err) {
    return Response.json(
      { error: (err as Error).message || "Failed to submit video jobs" },
      { status: 503 }
    );
  }
}
