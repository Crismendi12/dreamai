import { callClaude } from "@/lib/claude";

export async function POST(request: Request) {
  const { transcript, analysis, previousAnswers } = await request.json();

  const answersContext = previousAnswers?.length
    ? `\n\nThe patient has already answered these follow-up questions:\n${previousAnswers.map((a: { q: string; a: string }) => `Q: ${a.q}\nA: ${a.a}`).join("\n\n")}`
    : "";

  try {
    const text = await callClaude(
      `You are a compassionate IRT (Image Rehearsal Therapy) therapist. Your job is to ask follow-up questions about a patient's nightmare to fill in sensory and emotional details that are missing from their initial account.

Rules:
- Ask exactly 3 questions at a time (unless the patient has already answered previous rounds)
- Questions should be specific, not generic. Reference details from THEIR dream.
- Focus on: sensory gaps (what they saw, heard, felt, smelled), emotional peaks, the exact moment of maximum distress, and any detail that would help visualize the scene.
- Be warm but clinical. Not too soft, not cold. Professional and caring.
- If previous answers have been provided, ask DEEPER follow-up questions based on their answers. Go for the sensory details that would help create a vivid visual scene.
- Never ask more than 5 questions total across all rounds.

Respond ONLY with a JSON array of question strings. No markdown, no code blocks.
Example: ["What color was the light in the corridor?", "Could you hear your own breathing?", "When you tried to run, did your legs feel heavy?"]`,
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
