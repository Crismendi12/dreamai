import { callClaude } from "@/lib/claude";

export async function POST(request: Request) {
  const { analysis, followUpAnswers } = await request.json();

  const answersContext = followUpAnswers?.length
    ? `\n\nAdditional details from follow-up questions:\n${followUpAnswers.map((a: { q: string; a: string }) => `Q: ${a.q}\nA: ${a.a}`).join("\n\n")}`
    : "";

  try {
    const text = await callClaude(
      `You are an IRT (Image Rehearsal Therapy) specialist. Your job is to propose 3 alternative endings for a patient's nightmare that follow evidence-based rescripting principles.

The three approaches should be:
1. **MASTERY**: The dreamer takes control of the situation. They confront the threat, become powerful, and resolve the conflict through their own agency.
2. **TRANSFORMATION**: The threatening element transforms into something non-threatening or even positive. The monster becomes a friend, the fire becomes warmth.
3. **SAFETY**: The dreamer finds an escape or reaches a place of absolute safety. The scene dissolves into peace.

For EACH ending, provide:
- A title (2-4 words)
- A brief description of the new ending (2-3 sentences)
- A scene-by-scene breakdown (exactly 3 scenes) for video visualization. Each scene needs:
  - scene_number
  - visual_description (detailed enough to generate an AI image)
  - narration (what a calm, warm voice would say over this scene)
  - duration_seconds (8-15 seconds per scene)
  - mood (one word: calm, empowering, warm, peaceful, hopeful)

Also provide a "recommended" field (1, 2, or 3) indicating which ending you think would be most therapeutically effective for this specific nightmare, with a brief reason.

Respond ONLY with valid JSON. No markdown, no code blocks.`,
      `Nightmare analysis:\n${JSON.stringify(analysis, null, 2)}${answersContext}`,
      2500
    );

    try {
      const endings = JSON.parse(text);
      return Response.json({ endings });
    } catch {
      return Response.json({ endings: text });
    }
  } catch (err) {
    return Response.json(
      { error: (err as Error).message || "AI service unavailable" },
      { status: 503 }
    );
  }
}
