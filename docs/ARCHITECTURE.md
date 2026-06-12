# DreamAI — Architecture (for engineers)

How the app is wired, where the mock seam is, and exactly what to implement to go live.
For the non-engineer overview and status table, see [`/README.md`](../README.md).

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 (CSS-first, no config palette) · fal.ai (Whisper + Kling) · Anthropic (Claude Sonnet 4 → Haiku 4.5 fallback) · browser `SpeechSynthesis` for narration · persistence = localStorage only.

**One-line mental model:** a single client component (`src/app/page.tsx`) is a state machine over a `Step` union. Every screen is a component it renders. Every backend call goes through one wrapper, `apiFetch`, which either hits the real `/api/*` route or returns canned demo data. Nothing else talks to the network.

---

## 1. The SPA state machine

`src/app/page.tsx` holds all routing in React state — there are no Next routes besides `/` and the API routes. Two state unions drive it:

```ts
type Step   = "landing" | "dashboard" | "entry" | "profile" | "signin"
            | "record" | "analyzing" | "diary" | "followup"
            | "rescript" | "video" | "tracker" | "transformation";
type NavTab = "home" | "journal" | "plan" | "profile";
```

### Steps → what renders

| `step` | Renders | Notes |
|---|---|---|
| `landing` | `LandingView` (in `page.tsx`) | Hero + how-it-works + proof stats. CTA → `record` |
| `record` | `VoiceRecorder` | Mic capture → Whisper → editable transcript review |
| `analyzing` | `AnalyzingView` (in `page.tsx`) | Orb + stepped "live" stages while `/api/analyze` runs |
| `diary` | `DreamDiary` | The 15-field clinical analysis, formatted. CTA → `followup` |
| `followup` | `FollowUpChat` | 2 rounds of deepening questions (`/api/followup`) |
| `rescript` | `RescriptingView` | 3 endings × 3 scenes (`/api/rescript`); user picks one |
| `signin` | `SignInScreen` | **Mocked auth gate** before film generation |
| `video` | `VideoGenerator` → `DreamPlayer` | Generates + plays the rehearsal film (`/api/generate-scenes`) |
| `tracker` | `HabitTracker` | The real 10-day plan / streak (localStorage) |
| `transformation` | `TransformationView` | Before/after distress, what changed, science |
| `dashboard` | `Dashboard` | Signed-in home base (journal + plan summary) |
| `entry` | `DreamEntryView` | A single past dream's detail |
| `profile` | `Profile` | Account-ish screen + sign-out + disclaimer |

### Two navigation zones

- **Focused session** (`landing` → … → `transformation`): linear. Header shows a 6-step progress stepper (`Record · Analyze · Deepen · Rescript · Watch · Heal`), derived by `stepIndex` from the current `step`. No bottom nav.
- **Home base** (`dashboard` / `entry` / `profile`): shows persistent nav — a desktop top-nav and a mobile bottom tab bar (`showNav` gate). Tabs `home`/`journal`/`plan` live on the dashboard (scroll-to-section); `profile` is its own step.

### The sign-in gate (mocked)

Selecting an ending in `RescriptingView` calls `handleEndingSelected`. If `signedIn` is false, the chosen ending is held in `pendingEnding` and the app shows `SignInScreen`; `completeSignIn` sets `signedIn = true`, restores the ending, and proceeds to `video`. **There is no real auth** — any sign-in button calls `onSignIn`. Replace this gate when adding accounts.

State that flows through the journey: `transcript`, `analysis`, `followUpAnswers`, `selectedEnding`. None of it persists across reload (except the localStorage plan/streak).

---

## 2. The `apiFetch` seam + the 5 route contracts

`src/lib/api.ts` exports **`apiFetch(path, init)`** — a drop-in for `fetch` that returns a `Response`, so call sites keep doing `await res.json()`. It is the single integration boundary. Wiring the real backend requires **no component edits**.

```ts
const MODE = (process.env.NEXT_PUBLIC_DEMO_MODE ?? "auto").toLowerCase();
// "true"  → always mockResponse(...)        (no network)
// "false" → return fetch(path, init)         (real backend, no fallback)
// "auto"  → try fetch; on !ok / non-JSON / {error} / throw → mockResponse(...) + console.warn
```

In `auto` mode a real response is treated as a failure (and falls back to mock) if the status is not OK, the body isn't JSON, or the JSON contains an `error` key. Every fallback logs a `console.warn` — it is never silent.

The mock payloads in `api.ts` are the **canonical contract documentation**. The real routes already exist under `src/app/api/*` and must return the same shapes. Contracts:

### `POST /api/transcribe`
- **Request:** `multipart/form-data` with field `audio` (a `Blob`/`File`, `audio/webm`).
- **Response:** `{ text: string }`
- **Real impl:** `transcribe/route.ts` — uploads to fal storage, runs `fal-ai/whisper`. Errors → `{ error }` (400 / 503).

### `POST /api/analyze`
- **Request:** `{ transcript: string }` (guarded ≥ 10 chars).
- **Response:** `{ analysis: object }` — 15 clinical fields: `setting, characters[], narrative, sensory_details{visual,auditory,tactile,olfactory,proprioceptive}, emotions[{emotion,intensity}], somatic_response, nightmare_classification, core_threat, dream_distortions[], themes[], nightmare_intensity, recurrence_indicators, waking_life_links, turning_point, intervention_window`.
- **Real impl:** `analyze/route.ts` → `callClaude(...)`, JSON-parsed. Errors → `{ error }`.

### `POST /api/followup`
- **Request:** `{ transcript, analysis, previousAnswers: {q,a}[] }`. `previousAnswers` empty ⇒ round 1; non-empty ⇒ round 2.
- **Response:** `{ questions: string[] }` (exactly 3 per round, max 2 rounds).
- **Real impl:** `followup/route.ts` → `callClaude(...)`.

### `POST /api/rescript`
- **Request:** `{ analysis, followUpAnswers: {q,a}[] }`.
- **Response:** `{ endings: [{ title, description, scenes: [{ scene_number, visual_description, narration, duration_seconds, mood }] }], recommended?: number, recommendation_reason?: string }` — 3 endings (Mastery / Transformation / Safety), 3 scenes each. `RescriptingView.normalizeEndings` tolerates a few backend shapes.
- **Real impl:** `rescript/route.ts` → `callClaude(...)`.

### `POST /api/generate-scenes`
- **Request:** `{ scenes: Scene[], endingType: string }` (capped at 3 scenes).
- **Response:** `{ scenes: [{ scene_number, video_url: string|null, narration, duration_seconds, mood, visual_description, error? }] }`.
- **Real impl:** `generate-scenes/route.ts` → `fal-ai/kling-video/v2.6/pro/text-to-video` (first-person POV cinematic prompt, `maxDuration = 300`). **Until real `video_url`s come back, `DreamPlayer` shows a calm navy gradient + narration** — so the Watch step works in mock with `video_url: null`.

> `src/app/api/scene-status/route.ts` is **dead code** (returns `{ status: "DEPRECATED" }`) — video generation now blocks via `fal.subscribe` instead of client polling. Left in place; not part of any contract.

---

## 3. Demo / mock layer

See [`redesign/demo-mode.md`](redesign/demo-mode.md) for the team-facing version. Engineer summary:

- All five calls go through `apiFetch`; only the **data source** flexes, not the contract.
- `NEXT_PUBLIC_DEMO_MODE`: `true` (always mock) · `false` (always real — **production**) · unset/`auto` (try real, fall back). `DEMO_FORCED` is exported for any UI that wants to badge demo mode.
- Mock data is one cohesive nightmare (`DEMO_TRANSCRIPT` → `DEMO_ANALYSIS` → `DEMO_QUESTIONS_R1/R2` → `DEMO_ENDINGS` → placeholder film), with realistic latencies so the motion/loaders read naturally.

---

## 4. Persistence (localStorage schema)

No database. Two stores, both client-only:

**Real — 10-day plan / streak** (`src/lib/tracker.ts`):

```ts
// localStorage key: "dreamai-habit-tracker"
interface TrackerData {
  startDate: string;       // "YYYY-MM-DD", set on first read
  completedDays: number[]; // day numbers marked done
  streak: number;
}
// TOTAL_DAYS = 10. getDayNumber(startDate) = clamp(daysSinceStart + 1, 1..10).
```

Used by `HabitTracker` (marks days, computes streak) and read-only by `Dashboard` / `Profile` for the plan summary. `getStoredData()` returns empty values on the server (SSR-safe; components hydrate after mount).

**Mock — journal** (`src/lib/dashboard-data.ts`): `MOCK_ENTRIES: DreamEntry[]` (3 sample past dreams) powers the dashboard journal and `DreamEntryView`. `EntryScene` mirrors `DreamPlayer`'s scene shape; `scenes: null` means "logged, film not generated yet." **Replace `MOCK_ENTRIES` with a fetch when persistence lands.**

---

## 5. Component map

| Component | Role | Key props |
|---|---|---|
| `VoiceRecorder` | Mic capture → `/api/transcribe` → editable transcript review (4 modes: idle/recording/transcribing/review). >10-char submit guard | `onTranscriptReady(text)` |
| `DreamDiary` | Renders the 15-field clinical analysis (panels, gauge, pills, callouts). Stateless | `analysis` |
| `FollowUpChat` | 2 rounds × 3 deepening questions via `/api/followup`; `allAnswered` gate; skip allowed | `transcript, analysis, onComplete(answers)` |
| `RescriptingView` | Fetches `/api/rescript`; pick 1 of 3 endings; scene preview; `normalizeEndings` handles shape variants | `analysis, followUpAnswers, onGenerateVideo(ending)` |
| `SignInScreen` | **Mocked** in-canvas auth gate before film generation | `onSignIn(), onBack?()` |
| `VideoGenerator` | Calls `/api/generate-scenes`; orb loader + per-scene status; renders `DreamPlayer` when done; retry via reload | `scenes, endingType, endingTitle, onComplete()` |
| `DreamPlayer` | Plays the film: `<video>` (or gradient placeholder when `video_url` null) + `SpeechSynthesis` narration + timeline. Carefully ordered refs/timers | `scenes, totalDuration, endingTitle` |
| `HabitTracker` | The real 10-day plan: calendar grid, streak, milestones (reads/writes localStorage) | `onComplete(), onOpenJournal()` |
| `TransformationView` | Staged reveal: before/after distress gauges, what-changed, science, share via `navigator.share` | `analysis, endingTitle` |
| `Dashboard` | Signed-in home base: live plan summary (real) + journal (mock) | `onRecordNew(), onOpenPlan(), onOpenEntry(entry)` |
| `DreamEntryView` | One past dream's detail (reuses `DreamDiary`) | `entry, onBack()` |
| `Profile` | Account-ish screen, plan figures, sign-out, disclaimer | `onSignOut()` |
| `LandingView` / `AnalyzingView` | Defined inline in `page.tsx` (hero; analysis loader orb) | — |

Shared: `src/lib/icons.tsx` (`<Icon name>` stroke-SVG set), `src/app/globals.css` (all visual classes — see [`design-system.md`](redesign/design-system.md)).

---

## 6. To wire the real backend — checklist

1. **Set keys** — `FAL_KEY`, `ANTHROPIC_API_KEY` (server-side env).
2. **Verify each route** returns exactly the shape in §2 (the `api.ts` mock is the source of truth). Keep `apiFetch` and the routes — they are the seam. Do not change call sites.
3. **Confirm the film** — once `/api/generate-scenes` returns real `video_url`s, the Watch step plays real video with no UI change. Mind `maxDuration` / serverless timeouts and fal cost caps (3 scenes max by design).
4. **Real auth** — replace `SignInScreen`'s mock `onSignIn` with real authentication and gate `video` on a real session (`page.tsx`: `signedIn` / `pendingEnding`).
5. **Real persistence** — replace `MOCK_ENTRIES` (`dashboard-data.ts`) with a fetch of the user's saved dreams; migrate `tracker.ts` localStorage to per-user DB for cross-device sync; persist `transcript`/`analysis`/`selectedEnding`/`followUpAnswers` per session.
6. **Flip the flag** — `NEXT_PUBLIC_DEMO_MODE=false`. `apiFetch` becomes plain `fetch`; real errors surface. Smoke-test the full journey (note: `console.warn` fallbacks should disappear entirely).
7. **Stretch (post-MVP):** ElevenLabs TTS to replace browser `SpeechSynthesis` in `DreamPlayer`; therapist dashboard; MP4 export; i18n; native app shell.

---

## Related docs
- [`/README.md`](../README.md) — overview + status table.
- [`redesign/demo-mode.md`](redesign/demo-mode.md) — mock fallback (team-facing).
- [`redesign/design-system.md`](redesign/design-system.md) — tokens, type, component classes, motion.
- [`redesign/2026-06-12-visual-system-spec.md`](redesign/2026-06-12-visual-system-design.md) / [`-plan.md`](redesign/2026-06-12-visual-system-plan.md) — historical redesign spec + plan.
- [`DreamAI - Architecture & Build.md`](DreamAI%20-%20Architecture%20&%20Build.md) — original build/clinical notes.
