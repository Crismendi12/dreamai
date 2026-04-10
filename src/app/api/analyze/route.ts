import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  const { transcript } = await request.json();

  if (!transcript || transcript.trim().length < 10) {
    return Response.json(
      { error: "Please provide a dream description" },
      { status: 400 }
    );
  }

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    system: `You are an AI dream analyst trained in Image Rehearsal Therapy (IRT) protocols. Your role is to analyze a dream narrative and extract structured data for a therapeutic dream diary.

You must extract:
1. **setting**: Where did the dream take place? (location, time of day, indoor/outdoor)
2. **characters**: Who was present? (people, animals, entities -- describe relationships if mentioned)
3. **narrative**: What happened? Summarize the dream in 3-5 sentences, preserving emotional and sensory details.
4. **sensory_details**: What did the dreamer see, hear, smell, feel physically? List each sense separately.
5. **emotions**: What emotions were present? Rate each 0-10 intensity.
6. **themes**: Recurring themes (e.g., being chased, falling, loss of control, helplessness).
7. **nightmare_intensity**: Overall distress level 0-10.
8. **waking_life_links**: Any connections to real life events or stressors you can infer.
9. **turning_point**: The moment the dream became most distressing -- this is critical for rescripting later.

Respond ONLY with a valid JSON object. No markdown, no code blocks, no explanation.

Example format:
{
  "setting": "A dark hospital corridor, nighttime",
  "characters": ["The dreamer", "An unknown figure in scrubs"],
  "narrative": "The dreamer was running through a hospital...",
  "sensory_details": {
    "visual": "Flickering fluorescent lights, blood on the floor",
    "auditory": "Alarms beeping, distant screaming",
    "tactile": "Cold tile floor under bare feet",
    "olfactory": "Antiseptic and smoke"
  },
  "emotions": [
    {"emotion": "Fear", "intensity": 9},
    {"emotion": "Helplessness", "intensity": 7}
  ],
  "themes": ["Being chased", "Inability to help"],
  "nightmare_intensity": 8,
  "waking_life_links": "Possible connection to high-stress work environment",
  "turning_point": "The moment the unknown figure turned around and had no face"
}`,
    messages: [
      {
        role: "user",
        content: `Here is the dream narrative recorded by the patient:\n\n"${transcript}"`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    const analysis = JSON.parse(text);
    return Response.json({ analysis });
  } catch {
    return Response.json({ analysis: text });
  }
}
