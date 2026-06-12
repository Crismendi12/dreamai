# DreamAI

**AI Image Rehearsal Therapy (IRT) for nightmare treatment.** DreamAI helps people rewrite recurring nightmares: record the dream by voice, let AI analyze and deepen it, choose a new ending, and rehearse a personalized "film" of that ending nightly for 10 days to retrain the dream.

Built for people who suffer most from nightmares: **combat veterans** (the beachhead) and **assault / PTSD survivors**. Calm, clinical, hopeful tone; light surfaces with a deep-navy accent. In clinical collaboration with **Dr. Michael Breus, PhD** (The Sleep Doctor). Not a substitute for professional mental health care.

Primarily a **mobile app** (iOS / Android) that also runs on desktop web.

---

## Status — what's wired vs mocked

> **The UI/UX is fully built and clickable end-to-end. The AI backend is NOT wired yet.** Everything runs on a transparent mock fallback so the whole journey works with no backend, no keys, and no spend. Nothing is faked silently: when a mock is used, a `console.warn` is logged.

| Capability | State | Notes |
|---|---|---|
| Full UI / UX (every screen + state) | ✅ **Wired** | Built to the DreamAI design system; mobile + desktop |
| The 5 AI API routes (`/api/*`) | 🟡 **Stubbed contract** | Routes exist and are real (fal.ai + Claude code), but need `FAL_KEY` / `ANTHROPIC_API_KEY`; until then `apiFetch` falls back to mock |
| Transcription / analysis / follow-up / rescript | 🟡 **Mock fallback** | Returns canned demo data via `src/lib/api.ts` |
| Rehearsal "film" (the Watch step) | 🟡 **Placeholder** | Shows a calm navy gradient + narration; real video appears automatically once `/api/generate-scenes` returns `video_url`s |
| Sign-in / accounts | 🔴 **Mocked gate** | No auth, no accounts. Any sign-in button just unlocks the flow |
| Dashboard journal (past dreams) | 🔴 **Mock data** | Hardcoded in `src/lib/dashboard-data.ts` |
| 10-day plan / streak | ✅ **Real (localStorage)** | Genuinely persists per-device via `src/lib/tracker.ts` |
| Persistence / database | 🔴 **None yet** | localStorage only; no DB, no cross-device sync |

The fallback is controlled by one env var, **`NEXT_PUBLIC_DEMO_MODE`**:

| Value | Behavior |
|---|---|
| `true` | Always mock. No network. Snappiest click-through demo. |
| `false` | Always real backend, no fallback. **Set this in production once the backend is wired.** |
| unset / `auto` (default) | Try the real backend; fall back to mock on failure. Self-heals the moment a real route comes online. |

Full detail: [`docs/redesign/demo-mode.md`](docs/redesign/demo-mode.md).

---

## Quickstart

```bash
npm install
cp .env.example .env.local   # optional; defaults to auto/mock
npm run dev                  # http://localhost:3000
```

You can click through the entire app immediately — no keys required (it uses mock data). To run real AI, fill `FAL_KEY` + `ANTHROPIC_API_KEY` in `.env.local` and set `NEXT_PUBLIC_DEMO_MODE=false`. See [`.env.example`](.env.example).

---

## The user journey

A single-page state machine (`src/app/page.tsx`). Two zones:

**Focused session** (linear, with a 6-step progress stepper):

`landing → record (voice) → analyzing → diary → follow-up (2 rounds) → rescript (pick an ending) → sign-in (mocked gate) → generate film → watch → tracker (10-day plan) → transformation`

**Signed-in home base** (a hub with mobile bottom-tab / desktop top-nav): **Home (dashboard) · Journal · Plan · Profile**, plus a per-dream **entry** detail view. "Record a dream" re-enters the focused session from anywhere.

---

## Design system

Light canvas (`#FAFAFA`) with a **deep-navy** accent (`#1E3A8A`) — calm, clinical, hopeful. Type: **Newsreader** (serif headings / emphasis), **Hanken Grotesk** (body), **JetBrains Mono** (labels, timers, figures). Soft-bordered white cards, pill buttons, and signature motion (mic ripple, live waveform, a morphing "analyzing" orb, progress dots). All theming flows through CSS variables in `src/app/globals.css` (no Tailwind config palette). Tokens + class catalogue: [`docs/redesign/design-system.md`](docs/redesign/design-system.md).

---

## Architecture map

| Path | Role |
|---|---|
| `src/app/page.tsx` | The SPA state machine — steps, nav, and the landing/analyzing views |
| `src/app/layout.tsx` | Root layout, fonts, metadata, iOS safe-area viewport |
| `src/app/globals.css` | Design system: tokens, `@theme`, component classes, keyframes |
| `src/lib/api.ts` | **`apiFetch`** — the demo/mock seam; canned demo data + route contracts |
| `src/lib/claude.ts` | Anthropic client + Sonnet→Haiku fallback (`callClaude`) |
| `src/lib/tracker.ts` | Real 10-day plan/streak persistence (localStorage) |
| `src/lib/dashboard-data.ts` | **Mock** journal entries for the dashboard |
| `src/lib/icons.tsx` | Stroke-SVG icon set + `<Icon>` |
| `src/app/api/transcribe/route.ts` | fal.ai Whisper — audio → text |
| `src/app/api/analyze/route.ts` | Claude — transcript → 15-field clinical analysis |
| `src/app/api/followup/route.ts` | Claude — generates deepening questions (2 rounds) |
| `src/app/api/rescript/route.ts` | Claude — 3 alternative endings × 3 scenes |
| `src/app/api/generate-scenes/route.ts` | fal.ai Kling — scenes → video clips |
| `src/app/api/scene-status/route.ts` | **Dead code** (deprecated polling endpoint) |
| `src/components/*` | One component per journey screen + the home-base hub |

Stack: **Next.js 16** (App Router, Turbopack), **React 19**, **Tailwind CSS v4**, **fal.ai** (Whisper + Kling), **Anthropic** (Claude Sonnet 4 / Haiku 4.5 fallback). Browser `SpeechSynthesis` for narration (ElevenLabs planned). Deep dive: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Going live (replacing the mocks)

Wiring the real backend needs **zero component changes** — `apiFetch` is a drop-in for `fetch` and the request/response contracts are already defined.

1. **API keys** — set `FAL_KEY` and `ANTHROPIC_API_KEY` (server-side).
2. **Implement the 5 route contracts** — they already exist; verify each returns the shape `apiFetch`'s mock documents (see `docs/ARCHITECTURE.md` for method / request / response per route). Do **not** delete the routes or `apiFetch`; they are the integration seam.
3. **Real auth + accounts** — `SignInScreen` is a mocked gate today (any button unlocks). Replace with real auth and gate film generation on a real session.
4. **Real persistence** — swap `MOCK_ENTRIES` in `dashboard-data.ts` for a fetch; migrate the localStorage 10-day plan (`tracker.ts`) to per-user DB storage for cross-device sync.
5. **Flip the flag** — set `NEXT_PUBLIC_DEMO_MODE=false`. From then on `apiFetch` is literally `fetch` and real errors surface normally.

Real rehearsal video appears in the Watch step automatically once `/api/generate-scenes` returns `video_url`s — no UI work needed.

---

## Branches & deploy

- Repo: `Crismendi12/dreamai` (collaborator identity `lance-fp`).
- Live demo: https://dreamai-rho.vercel.app · Vercel: https://vercel.com/cristian-mendivelsos-projects/dreamai
- **PR #1** introduces the DreamAI design system on branch **`redesign/dreamai-design-system`** (pure UI/UX reskin; zero functional change). Plan/spec for that work live in `docs/redesign/`.

---

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — engineer's guide: state machine, the `apiFetch` seam + 5 route contracts, demo modes, localStorage schema, component map, "wire the backend" checklist.
- [`docs/redesign/demo-mode.md`](docs/redesign/demo-mode.md) — the mock fallback in depth.
- [`docs/redesign/design-system.md`](docs/redesign/design-system.md) — tokens, type, component classes, motion.
- [`docs/redesign/2026-06-12-visual-system-design.md` & `-plan.md`](docs/redesign/) — historical redesign spec + implementation plan.
- [`docs/DreamAI - Architecture & Build.md`](docs/) — original architecture / build notes + clinical background.
