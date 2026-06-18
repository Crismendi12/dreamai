/**
 * Demo journal data for the dashboard. No backend yet, so past dreams are mocked
 * here; the live 10-day plan/streak still reads real localStorage (see tracker.ts).
 * Real persistence arrives with the backend — replace MOCK_ENTRIES with a fetch.
 */

// Matches DreamPlayer's GeneratedScene so entry.scenes can be passed straight in.
export interface EntryScene {
  scene_number: number;
  image_url: string | null;
  video_url: string | null;
  narration: string;
  duration_seconds: number;
  mood: string;
  visual_description: string;
}

export interface DreamEntry {
  id: string;
  date: string; // ISO date
  title: string; // chosen ending title — card headline
  setting: string;
  distress: number; // 1-10
  projectedDistress: number; // matches TransformationView math: max(1, round(distress*0.3))
  endingType: "mastery" | "transformation" | "safety";
  themes: string[];
  scenes: EntryScene[] | null; // null = film not generated yet ("Finish this dream")
  analysis: Record<string, unknown>; // full diary payload for the entry detail view
}

const film = (mood: string, narration: string, visual: string, n: number): EntryScene => ({
  scene_number: n,
  image_url: null,
  video_url: null, // placeholder film: DreamPlayer shows a calm gradient + narration
  narration,
  duration_seconds: 10,
  mood,
  visual_description: visual,
});

export const ENDING_LABEL: Record<DreamEntry["endingType"], string> = {
  mastery: "Mastery",
  transformation: "Transformation",
  safety: "Safety",
};

export const MOCK_ENTRIES: DreamEntry[] = [
  {
    id: "d-003",
    date: "2026-06-09",
    title: "The Tide Recedes",
    setting: "A flooded childhood house, water near the ceiling",
    distress: 8,
    projectedDistress: 2,
    endingType: "mastery",
    themes: ["Loss of control", "Drowning", "Helplessness"],
    scenes: [
      film("calm", "The water stills, then begins to fall away.", "The flood lowers; warm light returns to the rooms.", 1),
      film("empowering", "I stand on solid floor. The house is mine again.", "Dry floorboards, steady footing, open windows.", 2),
      film("peaceful", "I open the front door to a quiet morning.", "A calm street, soft dawn, easy breath.", 3),
    ],
    analysis: {
      setting: "A flooded childhood house, water near the ceiling",
      narrative: "Water keeps rising through the rooms of my old house and I can't find a way out.",
      nightmare_intensity: 8,
      themes: ["Loss of control", "Drowning", "Helplessness"],
      emotions: [
        { emotion: "Panic", intensity: 9 },
        { emotion: "Helplessness", intensity: 8 },
      ],
      turning_point: "The water reaches my chest and I stop fighting it.",
      intervention_window: "The moment before panic — when I choose to stand instead of struggle.",
    },
  },
  {
    id: "d-002",
    date: "2026-06-05",
    title: "I Turn and Face the Door",
    setting: "A dark hallway in old base housing",
    distress: 9,
    projectedDistress: 3,
    endingType: "transformation",
    themes: ["Pursuit", "Threat", "Hypervigilance"],
    scenes: [
      film("empowering", "The footsteps stop. I turn around, steady.", "A long hallway; I face it without flinching.", 1),
      film("warm", "The door opens to people I trust.", "Warm light, familiar faces, safety.", 2),
      film("calm", "I walk out, unhurried.", "An open doorway into a calm evening.", 3),
    ],
    analysis: {
      setting: "A dark hallway in old base housing",
      narrative: "Someone is following me down a corridor and I can't see who.",
      nightmare_intensity: 9,
      themes: ["Pursuit", "Threat", "Hypervigilance"],
      emotions: [
        { emotion: "Fear", intensity: 9 },
        { emotion: "Dread", intensity: 7 },
      ],
      turning_point: "The footsteps stop right behind me.",
      intervention_window: "The pause before I run — when I can choose to turn and look.",
    },
  },
  {
    id: "d-001",
    date: "2026-06-01",
    title: "The Ground Holds",
    setting: "A bridge that crumbles as I cross",
    distress: 7,
    projectedDistress: 2,
    endingType: "safety",
    themes: ["Falling", "Instability"],
    scenes: null, // logged, film not generated yet
    analysis: {
      setting: "A bridge that crumbles as I cross",
      narrative: "The planks give way under me halfway across a high bridge.",
      nightmare_intensity: 7,
      themes: ["Falling", "Instability"],
      emotions: [{ emotion: "Terror", intensity: 8 }],
      turning_point: "The planks begin to fall away beneath my feet.",
      intervention_window: "The step before the fall — when the ground can choose to hold.",
    },
  },
];
