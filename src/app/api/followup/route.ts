import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  const { transcript, analysis, previousAnswers } = await request.json();

  const answersContext = previousAnswers?.length
    ? `\n\nThe patient has already answered these follow-up questions:\n${previousAnswers.map((a: { q: string; a: string }) => `Q: ${a.q}\nA: ${a.a}`).join("\n\n")}`
    : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: `You are a compassionate IRT (Image Rehearsal Therapy) therapist. Your job is to ask follow-up questions about a patient's nightmare to fill in sensory and emotional details that are missing from their initial account.

Rules:
- Ask exactly 3 questions at a time (unless the patient has already answered previous rounds)
- Questions should be specific, not generic. Reference details from THEIR dream.
- Focus on: sensory gaps (what they saw, heard, felt, smelled), emotional peaks, the exact moment of maximum distress, and any detail that would help visualize the scene.
- Be warm but clinical. Not too soft, not cold. Professional and caring.
- If previous answers have been provided, ask DEEPER follow-up questions based on their answers. Go for the sensory details that would help create a vivid visual scene.
- Never ask more than 5 questions total across all rounds.

Respond ONLY with a JSON array of question strings. No markdown, no code blocks.
Example: ["What color was the light in the corridor?", "Could you hear your own breathing?", "When you tried to run, did your legs feel heavy?"]`,
    messages: [
      {
        role: "user",
        content: `Original dream transcript: "${transcript}"\n\nStructured analysis: ${JSON.stringify(analysis)}${answersContext}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "[]";

  try {
    const questions = JSON.parse(text);
    return Response.json({ questions });
  } catch {
    return Response.json({ questions: [text] });
  }
}
