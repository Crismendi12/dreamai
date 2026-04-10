import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY || "" });

interface Scene {
  scene_number: number;
  visual_description: string;
  narration: string;
  duration_seconds: number;
  mood: string;
}

interface FalResult {
  images: { url: string }[];
}

export async function POST(request: Request) {
  const { scenes, endingType } = await request.json();

  if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
    return Response.json({ error: "No scenes provided" }, { status: 400 });
  }

  const moodStyles: Record<string, string> = {
    empowering: "golden warm light, heroic atmosphere, dramatic cinematic lighting",
    calm: "soft diffused light, serene atmosphere, gentle pastel tones",
    warm: "amber golden hour lighting, cozy intimate feeling, soft focus",
    peaceful: "cool blue twilight, tranquil, ethereal mist, gentle glow",
    hopeful: "sunrise colors, volumetric light rays, uplifting atmosphere",
  };

  const endingStyles: Record<string, string> = {
    mastery: "empowering, golden light, strength, heroic framing",
    transformation: "ethereal, metamorphosis, beautiful light transitions",
    safety: "warm, protected, soft lighting, haven, sanctuary",
  };

  try {
    // Generate all images in parallel using Flux
    const imagePromises = scenes.map(async (scene: Scene, index: number) => {
      const moodStyle = moodStyles[scene.mood] || moodStyles.calm;
      const endingStyle = endingStyles[endingType] || "";

      const prompt = `Cinematic still frame, first-person POV perspective, 16:9 aspect ratio, photorealistic, atmospheric, ${moodStyle}, ${endingStyle} -- ${scene.visual_description}. Ultra high quality, no text, no watermarks, dreamlike cinematic quality.`;

      try {
        const result = await fal.subscribe("fal-ai/flux/schnell", {
          input: {
            prompt,
            image_size: "landscape_16_9",
            num_images: 1,
          },
        });

        const falResult = result.data as FalResult;
        return {
          scene_number: scene.scene_number || index + 1,
          image_url: falResult.images?.[0]?.url || null,
          narration: scene.narration,
          duration_seconds: scene.duration_seconds || 10,
          mood: scene.mood,
          visual_description: scene.visual_description,
        };
      } catch {
        return {
          scene_number: scene.scene_number || index + 1,
          image_url: null,
          narration: scene.narration,
          duration_seconds: scene.duration_seconds || 10,
          mood: scene.mood,
          visual_description: scene.visual_description,
        };
      }
    });

    const generatedScenes = await Promise.all(imagePromises);

    return Response.json({
      scenes: generatedScenes,
      total_duration: generatedScenes.reduce((sum, s) => sum + s.duration_seconds, 0),
    });
  } catch (err) {
    return Response.json(
      { error: (err as Error).message || "Image generation failed" },
      { status: 503 }
    );
  }
}
