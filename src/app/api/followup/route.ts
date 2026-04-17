import { callClaude } from "@/lib/claude";

export async function POST(request: Request) {
  const { transcript, analysis, previousAnswers } = await request.json();

  const answersContext = previousAnswers?.length
    ? `\n\nThe patient has already answered these follow-up questions:\n${previousAnswers.map((a: { q: string; a: string }) => `Q: ${a.q}\nA: ${a.a}`).join("\n\n")}`
    : "";

  try {
    const text = await callClaude(
      `You are an IRT (Image Rehearsal Therapy) clinician conducting a structured nightmare interview. Your goal is to gather the specific sensory, somatic, and emotional data needed to create an effective rescripted ending.

Your questions must target 3 critical areas for IRT rescripting:

**A. The Intervention Window** -- the moment just before peak distress where the dream narrative can be redirected. You need to understand what the dreamer was seeing, feeling in their body, and thinking at this exact moment.

**B. Somatic Experience** -- how the nightmare lives in the body. IRT works because the body rehearses the new ending. You need: body position, muscle sensations, breathing, temperature, where tension was held, what the body felt upon waking.

**C. Sensory Vividness** -- the visual, auditory, and tactile details that make the rescripted video feel real. The more specific the original details, the more effective the rescripted scenes. Ask about colors, textures, sounds, spatial relationships.

Rules:
- Ask exactly 3 questions per round. Maximum 2 rounds (6 questions total).
- Questions MUST reference specific details from THIS patient's dream -- never generic.
- Frame questions as choices when possible ("Was it more like X or Y?") -- this helps patients recall details.
- One question should always target the body ("Where in your body did you feel...").
- Ask about the moment JUST BEFORE the worst part -- this is the rescripting entry point.
- If this is round 2, go deeper on their answers: "You mentioned X -- can you describe exactly..."
- Tone: warm, validating, clinically precise. Like a trauma-informed therapist who respects the patient's experience.

Respond ONLY with a JSON array of question strings. No markdown, no code blocks.
Example: ["Right before the corridor started closing in, what were your hands doing -- were they reaching for something or pressed against the walls?", "When you felt the paralysis starting in your legs, did it begin at your feet and move up, or did everything freeze at once?", "The figure behind you -- could you feel its presence physically, like a temperature change or pressure on your back?"]`,
      `Original dream transcript: "${transcript}"\n\nStructured analysis: ${JSON.stringify(analysis)}${answersContext}`,
      1000
    );

    try {
      const questions = JSON.parse(text);
      return Response.json({ questions });
    } catch {
      return Response.json({ questions: [text] });
    }
  } catch (err) {
    return Response.json(
      { error: (err as Error).message || "AI service unavailable" },
      { status: 503 }
    );
  }
}
