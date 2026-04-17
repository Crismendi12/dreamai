import { callClaude } from "@/lib/claude";

export async function POST(request: Request) {
  const { transcript } = await request.json();

  if (!transcript || transcript.trim().length < 10) {
    return Response.json(
      { error: "Please provide a dream description" },
      { status: 400 }
    );
  }

  try {
    const text = await callClaude(
      `You are a clinical dream analyst specialized in Image Rehearsal Therapy (IRT) as developed by Krakow & Zadra. You analyze nightmare narratives with diagnostic precision to prepare for therapeutic rescripting.

Extract the following structured clinical data:

1. **setting**: Location, time of day, indoor/outdoor, lighting conditions.
2. **characters**: Who was present -- people, entities, shadows. Note relationship to dreamer (known/unknown, threatening/neutral).
3. **narrative**: Clinical summary in 3-5 sentences. Preserve the dream's emotional arc: onset, escalation, peak distress, and outcome.
4. **sensory_details**: Map each sensory channel separately. Be specific -- "cold tile under bare feet" not just "cold."
   - visual, auditory, tactile, olfactory, proprioceptive (body position, movement sensation)
5. **emotions**: Each emotion with 0-10 intensity. Include both primary (fear, anger) and secondary (shame, guilt, helplessness).
6. **somatic_response**: Physical body reactions during the dream AND upon waking -- heart racing, sweating, muscle tension, breathing changes, paralysis sensations.
7. **nightmare_classification**: Classify the nightmare type:
   - "chase_pursuit" | "helplessness_paralysis" | "falling_loss_of_control" | "death_harm_threat" | "abandonment_isolation" | "metamorphosis_identity" | "entrapment" | "performance_failure" | "other"
8. **core_threat**: The deepest psychological threat the brain is processing. Not the surface event, but the underlying fear (e.g., "loss of agency and inability to protect oneself" rather than "being chased").
9. **dream_distortions**: List any distortions from reality -- time loops, impossible physics, morphing environments, paralysis, voice loss, size changes. These are IRT intervention targets.
10. **themes**: Recurring nightmare themes identified using standard IRT taxonomy.
11. **nightmare_intensity**: Overall distress level 0-10 using the Nightmare Distress Questionnaire (NDQ) framework.
12. **recurrence_indicators**: Any signs this is a recurring nightmare pattern (common imagery, archetypal elements, patterned structure).
13. **waking_life_links**: Potential connections to trauma, stressors, or life events. Be thoughtful, not speculative.
14. **turning_point**: The exact moment the dream became most distressing -- this is the IRT rescripting intervention point. Describe it precisely.
15. **intervention_window**: The moment just BEFORE the turning point where the dream narrative could be redirected. This is where rescripting begins.

Respond ONLY with a valid JSON object. No markdown, no code blocks, no explanation.

Example format:
{
  "setting": "A dark hospital corridor, nighttime, flickering overhead lights",
  "characters": ["The dreamer (first person)", "An unknown figure in scrubs (threatening, unrecognized)"],
  "narrative": "The dreamer was navigating a dark hospital corridor when they noticed blood on the floor. An unknown figure appeared behind them. As they tried to run, their legs became heavy and unresponsive. The figure got closer as the dreamer's voice failed when trying to scream for help.",
  "sensory_details": {
    "visual": "Flickering fluorescent lights, dark blood pooling on white tile, shadow figure with no visible face",
    "auditory": "Alarms beeping irregularly, distant muffled screaming, own heartbeat amplified",
    "tactile": "Cold tile floor under bare feet, legs heavy like concrete",
    "olfactory": "Sharp antiseptic mixed with something metallic like blood",
    "proprioceptive": "Legs paralyzed, body moving in slow motion, throat constricted"
  },
  "emotions": [
    {"emotion": "Terror", "intensity": 9},
    {"emotion": "Helplessness", "intensity": 8},
    {"emotion": "Dread", "intensity": 7}
  ],
  "somatic_response": "Heart pounding violently, legs frozen, voice completely gone. Woke with racing heart, drenched in sweat, hyperventilating.",
  "nightmare_classification": "helplessness_paralysis",
  "core_threat": "Complete loss of agency -- the inability to move, speak, or escape when facing danger. The body betrays the dreamer at the moment they need it most.",
  "dream_distortions": ["Voice loss despite attempting to scream", "Legs becoming impossibly heavy", "Corridor appearing to elongate"],
  "themes": ["Being chased", "Paralysis", "Voice loss", "Inability to escape"],
  "nightmare_intensity": 8,
  "recurrence_indicators": "Chase-paralysis pattern is among the most common recurring nightmare archetypes, suggesting possible repetitive pattern.",
  "waking_life_links": "Possible connection to situations where the dreamer feels powerless or unable to advocate for themselves.",
  "turning_point": "The moment the dreamer tried to run and their legs became heavy -- the dream shifted from fear to helplessness.",
  "intervention_window": "The moment just before the legs became heavy -- while the dreamer still had mobility and the choice to turn and face the figure."
}`,
      `Here is the dream narrative recorded by the patient:\n\n"${transcript}"`,
      2500
    );

    try {
      const analysis = JSON.parse(text);
      return Response.json({ analysis });
    } catch {
      return Response.json({ analysis: text });
    }
  } catch (err) {
    return Response.json(
      { error: (err as Error).message || "AI service unavailable" },
      { status: 503 }
    );
  }
}
