/**
 * DreamAI API access with a transparent demo/mock fallback.
 *
 * Lets the app run the FULL journey end-to-end before the backend is wired,
 * while staying 100% transparent once real `/api/*` routes come online.
 *
 *   NEXT_PUBLIC_DEMO_MODE = "true"   -> always mock (no network; snappy demo)
 *                         = "false"  -> always real backend, no fallback  ← set this in production / backend dev
 *                         = unset / "auto" (default) -> try real, fall back to mock only if it fails (graceful)
 *
 * `apiFetch` is a drop-in for `fetch`: it returns a Response, so call sites keep
 * doing `const data = await res.json()`. In "false" mode it IS `fetch`, so the
 * request/response contract the backend implements is unchanged. Wiring real
 * endpoints requires zero component edits.
 */

const MODE = (process.env.NEXT_PUBLIC_DEMO_MODE ?? "auto").toLowerCase();
export const DEMO_FORCED = MODE === "true";
const REAL_ONLY = MODE === "false";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  if (DEMO_FORCED) return mockResponse(path, init);
  if (REAL_ONLY) return fetch(path, init);

  // auto: prefer the real backend, gracefully fall back to mock on failure
  try {
    const res = await fetch(path, init);
    const text = await res.text();
    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      /* non-JSON body */
    }
    const hasError = !!(data && typeof data === "object" && "error" in (data as Record<string, unknown>));
    if (!res.ok || data === null || hasError) {
      throw new Error(`real backend unavailable for ${path} (status ${res.status})`);
    }
    return new Response(text, { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    if (typeof console !== "undefined") {
      console.warn(
        `[DreamAI demo] Using mock data for ${path} — real backend not available yet. ` +
          `Set NEXT_PUBLIC_DEMO_MODE=false once the backend is wired.`,
        err
      );
    }
    return mockResponse(path, init);
  }
}

async function mockResponse(path: string, init?: RequestInit): Promise<Response> {
  const { body, ms } = mockFor(path, init);
  await delay(ms);
  return jsonResponse(body);
}

// ----- canned demo data (one cohesive nightmare → rescript → film) -----

const DEMO_TRANSCRIPT =
  "I'm in a narrow hallway that keeps stretching the more I run. Water is rising past my knees and a figure is always one step behind me. Every door I try is locked. I reach for my brother but the floor gives way beneath us.";

const DEMO_ANALYSIS = {
  setting: "A narrow corridor in a flooding house, dim and tilting underfoot.",
  characters: ["A faceless pursuer", "My younger brother", "A locked door"],
  narrative: DEMO_TRANSCRIPT,
  sensory_details: {
    visual: "Greenish flickering light, walls warping inward",
    auditory: "Rushing water and my own ragged breathing",
    tactile: "Cold water, slick walls under my hands",
    olfactory: "Damp, metallic air",
    proprioceptive: "The floor tilting, my legs heavy and slow",
  },
  emotions: [
    { emotion: "Terror", intensity: 9 },
    { emotion: "Helplessness", intensity: 8 },
    { emotion: "Grief", intensity: 6 },
    { emotion: "Confusion", intensity: 5 },
  ],
  somatic_response: "Chest tightness, racing heart, waking with a jolt and sweating.",
  nightmare_classification: "post_traumatic_pursuit",
  core_threat: "Being unable to protect a loved one while trapped.",
  dream_distortions: ["Endless hallway", "Locked doors", "Faceless figure"],
  themes: ["Entrapment", "Loss of control", "Protection"],
  nightmare_intensity: 9,
  recurrence_indicators: "Reported three to four times a week for two months.",
  waking_life_links: "A recent loss and a sense of responsibility for family.",
  turning_point: "The moment the floor gives way as I reach for my brother.",
  intervention_window: "Just before the floor collapses, when I reach out.",
};

const DEMO_QUESTIONS_R1 = [
  "What sound from the dream stays with you the most?",
  "Where in your body did the fear sit strongest?",
  "What did you most want to do but couldn't?",
];
const DEMO_QUESTIONS_R2 = [
  "If the hallway felt safe, what would it look like instead?",
  "Who would you want beside you in the new version?",
  "What would tell you that you're finally in control?",
];

const demoScenes = (moods: string[]) => [
  {
    scene_number: 1,
    visual_description: "The corridor steadies and warm dawn light fills the hall.",
    narration: "The hallway holds firm beneath my feet.",
    duration_seconds: 10,
    mood: moods[0],
  },
  {
    scene_number: 2,
    visual_description: "A door opens easily and my brother stands safe in the light.",
    narration: "The door opens, and he is there, safe.",
    duration_seconds: 10,
    mood: moods[1],
  },
  {
    scene_number: 3,
    visual_description: "We walk out together into a calm, sunlit garden.",
    narration: "We step outside together, calm and whole.",
    duration_seconds: 10,
    mood: moods[2],
  },
];

const DEMO_ENDINGS = {
  endings: [
    {
      title: "I Hold the Ground",
      description: "You take command of the space and the threat loses its power over you.",
      scenes: demoScenes(["empowering", "empowering", "calm"]),
    },
    {
      title: "The Door Opens",
      description: "The locked doors yield and your brother is found safe.",
      scenes: demoScenes(["hopeful", "warm", "calm"]),
    },
    {
      title: "A Safe Harbor",
      description: "The water recedes and the house becomes a place of refuge.",
      scenes: demoScenes(["peaceful", "calm", "peaceful"]),
    },
  ],
  recommended: 1,
  recommendation_reason: "Transformation endings tend to work best for entrapment themes.",
};

function mockFor(path: string, init?: RequestInit): { body: unknown; ms: number } {
  if (path.includes("/api/transcribe")) {
    return { body: { text: DEMO_TRANSCRIPT }, ms: 800 };
  }
  if (path.includes("/api/analyze")) {
    return { body: { analysis: DEMO_ANALYSIS }, ms: 3600 };
  }
  if (path.includes("/api/followup")) {
    let round1 = true;
    try {
      const parsed = init?.body ? JSON.parse(init.body as string) : null;
      const prev = parsed?.previousAnswers;
      round1 = !Array.isArray(prev) || prev.length === 0;
    } catch {
      /* default to round 1 */
    }
    return { body: { questions: round1 ? DEMO_QUESTIONS_R1 : DEMO_QUESTIONS_R2 }, ms: 1500 };
  }
  if (path.includes("/api/rescript")) {
    return { body: DEMO_ENDINGS, ms: 2200 };
  }
  if (path.includes("/api/generate-scenes")) {
    // Placeholder rehearsal film: no real video yet, so the player shows a calm
    // navy gradient + narration. Real backend will return scenes with video_url.
    const scenes = demoScenes(["empowering", "warm", "calm"]).map((s) => ({
      ...s,
      video_url: null,
    }));
    return { body: { scenes }, ms: 7000 };
  }
  return { body: {}, ms: 300 };
}
