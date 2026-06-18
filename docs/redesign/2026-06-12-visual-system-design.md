> Historical design record — see [`/README.md`](../../README.md) and [`/docs/ARCHITECTURE.md`](../ARCHITECTURE.md) for current state.

# DreamAI → DreamAI Design System — Redesign Spec

**Date:** 2026-06-12
**Branch:** `redesign/dreamai-design-system`
**Status:** Approved design, ready for implementation plan
**Scope:** Pure UI/UX overhaul. Zero functional changes. Every prop, handler, effect, fetch, state machine, ref, localStorage schema, and copy string is preserved.

---

## 1. Goal

Re-skin the entire DreamAI app (a clinical Image Rehearsal Therapy / nightmare-treatment product) to match the visual language of the **the reference** prototype (`/Users/lancemarks/Downloads/reference-prototype.html`) **exactly**: light theme, deep navy accent, the Newsreader / Hanken Grotesk / JetBrains Mono type system, pill buttons, soft-bordered white cards, and the signature motion (mic ripple, live waveform, morphing "analysing" orb, shimmer, progress dots, golden-gun suggestion chips).

DreamAI keeps its own identity, content, clinical copy, and functionality. Only the visual layer changes.

## 2. Locked decisions

| Decision | Choice |
|---|---|
| Theme literalness | **Exact match** — light `#FAFAFA` canvas, deep navy `#1E3A8A` accent, the three reference fonts, all reference component styles + motion. |
| Branding | **Keep DreamAI identity.** No reference logo. "DreamAI" wordmark set in Newsreader. Existing clinical copy retained. |
| reference-only business pieces | **Adapted, not copied.** No money figures. (See §6.) |
| DreamPlayer | **Fully reskinned** to the light DreamAI design system (frame, controls, timeline, surround). Subtitle/overlay treatments keep enough contrast to stay readable over video. |
| Git | New branch `redesign/dreamai-design-system` → push to `origin` (Crismendi12/dreamai) → PR to `main`. Identity `lance-fp`. Foreign `CLAUDE.md` / `AGENTS.md` untouched. |

## 3. Architecture of the change — two layers

### Layer 1 — Foundation (one-time, blocking; established before any component work)

All theming in DreamAI flows through `globals.css` CSS variables + a few shared utility classes consumed via Tailwind v4 arbitrary values (`bg-[var(--accent)]`, etc.). There is **no `tailwind.config` palette**. So replacing the foundation re-themes most of the app automatically.

1. **`src/app/globals.css`**
   - Replace the dark/gold `:root` token block with the reference light/deep navy tokens (see `design-system.md`).
   - Rewire the `@theme inline { ... }` mappings to the new tokens.
   - Remove the dark atmospheric `body::before` radial gradients; set the light canvas. Retune the custom scrollbar to deep navy-on-light.
   - Re-skin the existing shared classes so legacy consumers inherit the new look: `.btn-primary` → reference brand-pill semantics; `.glass` → white soft-bordered `.panel` surface; `.glow-border` → deep navy ring; `.glass-warm`, `.noise`, `.recording-pulse` retuned.
   - **Add the full reference class vocabulary** so Layer 2 never edits this file: buttons (`.btn`, `.btn--brand`, `.btn--dark`, `.btn--ghost`, `.btn--block`, `.linklike`), brand bits (`.serif-hero`, `.greeting`, `.subhead`, `.mark`), vent/mic (`.mic-wrap`, `.mic-ring`, `.mic-btn`, `.mic-hint`), how/proof (`.how`, `.how-step`, `.proof`), listening (`.rec-pill`, `.rec-dot`, `.wave`, `.transcript`, `.stop-btn`), analysing (`.orb-stage`, `.orb-glow`, `.orb`, `.spark`, `.analyse-head`, `.live-steps`, `.live-row`, `.live-ic`, `.live-spin`, `.live-t`), our-take (`.take`, `.take-ack`, `.reward`, `.pill`, `.outcome`, `.grid2`, `.panel`, `.panel-label`, `.strength-panel`, `.gauge`, `.plan-steps`, `.plan-row`, `.plan-ic`, `.kb`, `.video`, `.more`, `.tips-panel`, `.amber-outcome`), composer (`.composer-lg`, `.ctool`, `.send-lg`), category grid (`.catgrid`, `.cat`), handoff (`.carry`, `.auth-*`, `.resume-note`), intake/golden-gun (`.intake`, `.progress-dots`, `.pd`, `.pd-fill`, `.step-kicker`, `.step-q`, `.gg-field`, `.gg-suggest`, `.gg-pill`, `.sg-label`, `.intake-done`, `.done-orb`, `.done-ctx`).
   - **Port all keyframes** verbatim: `ripple`, `pulse`, `bar`, `blink`, `breathe`, `morph`, `spin`, `twinkle`, `shimmer`, `rot`. **Keep the names `fade-in` and `kenburns`** — they are referenced by JS-injected inline styles in DreamPlayer; renaming breaks playback animations. Port the `@media (prefers-reduced-motion: reduce)` block.

2. **`src/app/layout.tsx`** — swap fonts only:
   - `Playfair_Display` → **`Newsreader`** bound to `--font-display` (axes/weights per design-system doc; italic enabled for `.em`).
   - `DM_Sans` → **`Hanken_Grotesk`** bound to `--font-body`.
   - `JetBrains_Mono` → unchanged, bound to `--font-mono`.
   - The three CSS-var bindings propagate through `globals.css` (`body`, `h1/h2/h3/.font-display`, `--font-sans`/`--font-mono` theme tokens) — **no component-level font className edits needed.**

3. **`src/lib/icons.tsx`** (new, presentational only) — port the reference stroke-SVG icon set (the `I = {...}` object) as React components/strings. **Exclude the reference logo.** Provides icons to replace emoji (👤 🔮 💭 🔗 ⚡ 🦋 🏡) and ASCII glyphs (`~ + * #`). Curated for a sleep/dream/therapy app (moon/sparkle/shield/brain/check/play/etc.).

4. **`src/app/page.tsx` shell** (header / stepper / footer / error / inline `analyzing` block) — restyle to the new system: "DreamAI" wordmark in Newsreader, the 6-step header indicator → reference **progress-dots**, footer disclaimer in muted Hanken, error banner → soft notice, inline `analyzing` spinner → **morphing orb + live-steps**. The `Step` type, `stepIndex` derivation, handlers, `setStep`/`fetch` calls, and conditional render gates are unchanged.

### Layer 2 — Per-component markup reskin (parallelizable; one agent per file)

Each component's `return (...)` JSX and `className`s are reworked to the matching reference pattern. **No edits to:** prop interfaces, `useState`/`useRef`/`useEffect`, handlers, `fetch` calls, branch *conditions*, data-driven inline-style math, animation `key=` props. Mapping in §5.

Layer 2 files are mutually independent (different files) and depend only on Layer 1 being complete → safe to run in parallel.

## 4. Preserved contract (must not change — behavior)

- **VoiceRecorder:** `getUserMedia`, `MediaRecorder` (`start(1000)`, `ondataavailable`, `onstop`), `audio/webm` blob assembly, `< 1000`-byte guard, `setInterval` timer, `POST /api/transcribe` (multipart `audio`), `> 10`-char submit guard.
- **page.tsx:** `Step` union, `stepIndex` map, `handleTranscript`/`handleFollowUpComplete`/`handleEndingSelected`, all `setStep`/`setError`, `POST /api/analyze`, every render gate (`step === "diary" && analysis`, etc.) and prop wiring.
- **FollowUpChat:** 2-round cap, `POST /api/followup` `{transcript, analysis, previousAnswers}` → `{questions}`, fallback question, `allAnswered` gate.
- **RescriptingView:** `normalizeEndings` (3 backend shapes), `POST /api/rescript`, recommended-index clamp, `["mastery","transformation","safety"]` type map.
- **VideoGenerator:** `POST /api/generate-scenes` `{scenes, endingType}` → `{scenes}`, balance/locked error mapping, `sortedScenes`/`totalDuration`, the **decorative fixed-60% bar (left as-is — not wired to real progress)**, `window.location.reload()` retry.
- **DreamPlayer:** `speechSynthesis` + `SpeechSynthesisUtterance` (rate .8 / pitch .85) + voice preference list, `<video>` `videoRef`/`nextVideoRef` control + hidden preload node, 100ms timer loop, crossfade timing, `key={`video-${currentScene}`}` remounts, the injected `kenburns` `<style>`, `moodGradients` (recolor values allowed, keep mechanism).
- **HabitTracker:** `STORAGE_KEY = "dreamai-habit-tracker"`, `TOTAL_DAYS = 10`, `TrackerData` schema, `getStoredData`/`getDayNumber`/`markToday`, streak math, tiered congratulation thresholds.
- **TransformationView:** 4-stage `setTimeout` reveal (500/1500/2500/3500ms), distress math (`projectedDistress`, `reductionPct`, `topEmotions`), SVG ring `strokeDasharray = value * 25.1`, `navigator.share` payload, `window.location.reload()`.
- **All API routes + `src/lib/claude.ts`:** untouched. `api/scene-status` is dead code — left as-is.
- **Pre-existing quirks kept:** `DiaryField`'s unused `icon` prop; `VideoGenerator`'s local `GeneratedScene` lacking `image_url`.

## 5. Per-component visual mapping

| Component | Surfaces | reference pattern applied |
|---|---|---|
| `page.tsx` shell | header, 6-step stepper, footer, error, `analyzing` | Newsreader wordmark; progress-dots; soft notice; morphing orb + live-steps |
| `page.tsx` `LandingView`/`StatCard`/`StepCard` | hero | `.serif-hero`, `.proof` stat row, `.how` step strip, `.btn--brand` CTA |
| `VoiceRecorder` | idle / recording / transcribing / review (+ micError) | mic-ripple hero / waveform + `.stop-btn` + mono timer / morphing orb / `.transcript` card + pill buttons / soft inline notice |
| `DreamDiary` | 15 clinical fields | white `.panel` stack; intensity → `.gauge`; chips → `.pill`; sensory → 2-col card grid; clinical/turning/intervention → left-rule `.outcome`-callouts; emotion bars → deep navy mini-bars; emoji → icon set |
| `FollowUpChat` | loading / questions (rounds 1–2) | morphing orb; **golden-gun** chip questions + `.gg-field`; rounds → progress-dots; prior answers → muted chips; ghost + brand pill buttons |
| `RescriptingView` | loading / empty / selector + scenes + CTA | selectable option cards (deep navy ring when picked) + "Recommended" badge pill; scene tabs → dot stepper; Visual/Narration → left-rule callouts; CTA → `.outcome` hero; keep `key={activeScene}` |
| `VideoGenerator` | generating / error / done | morphing orb hero + mono elapsed; per-scene → `.plan-row` status list; decorative bar → indeterminate deep navy treatment; error → white card + pill (Retry / Add Credits) |
| `DreamPlayer` | player / end card / controls / instructions | **light reference frame**: rounded panel surround, deep navy timeline + markers, Newsreader header, light footer card, pill controls; subtitle keeps `textShadow` for legibility over video; "AI Video" badge → badge pill |
| `HabitTracker` | progress / calendar / milestones / action | `.gauge` progress + streak badge; calendar → progress-dot grid (completed=check, today=deep navy ring, future=ghost); milestones → `.plan-steps`; action → `.outcome` + pill; replace ASCII glyphs |
| `TransformationView` | staged reveal: hero / before-after / what-changed / science / CTAs | before/after **gauges** (keep dasharray math), danger→green; `.outcome` hero w/ Newsreader figure; chips → pills; 3-stat row; pill CTAs; keep staged reveal |

## 6. Adapting reference-only pieces (no money in DreamAI)

| reference element | DreamAI adaptation |
|---|---|
| `$20 credit` reward strip (`.reward`) | optional **encouragement/affirmation** strip (shimmer kept) — used sparingly, e.g. after a strong narrative; no dollar amount |
| `$267 back` outcome figure (`.outcome`) | **"your rewritten ending"** hero / healing outcome — words, not currency |
| case-strength gauge | **healing-progress / distress-reduction** gauge |
| reference logo, Fair Trading, Google/email auth, "rant" copy | dropped — DreamAI has no auth step and its own clinical copy |

## 7. Risks & mitigations (from recon)

1. **Hardcoded hex outside tokens** — DreamDiary distress gradients (`#F59E0B/#EF4444/#34D399/#6B8AFF`), DreamPlayer `moodGradients` + gold timeline + `text-emerald-400`, RescriptingView `colors[]`, button text color `#080B14`. → Component agents replace these explicitly with the new palette; not covered by token swap.
2. **JS-referenced keyframes** `fade-in`, `kenburns` — keep these names in `globals.css`.
3. **State-driven conditional classNames** (ternaries) are load-bearing — keep the *conditions*, swap only class strings on each branch.
4. **`key=` remount props** for re-animation — preserve.
5. **Light theme vs `body::before`** — must neutralize the dark atmospheric overlay or stale gradients persist.
6. **Parallel-edit safety** — Layer 1 ships the complete class vocabulary first; Layer 2 agents touch only their own component file (+ read-only icon import), so no `globals.css` contention.

## 8. Execution & verification

1. Branch `redesign/dreamai-design-system` (done).
2. **Phase 1 (foundation):** globals.css tokens/classes/keyframes + layout.tsx fonts + icons module + page.tsx shell. Verify `tsc` + `eslint` + `next build` green and dev server renders the shell.
3. **Phase 2 (parallel):** one agent per component, each with the preserved-contract constraint and its §5 mapping. DreamPlayer handled carefully (media behavior).
4. **Phase 3 (verification):** `tsc` 0 / `eslint` 0 / `next build` clean; run dev server; Playwright-screenshot every surface (landing → record → analyzing → diary → followup → rescript → video → tracker → transformation, plus error/empty states); compare to the reference reference; fix drift. No "done" claim without command output + screenshots.
5. Commit per phase. Push branch to `origin`. Open PR → `main` for Lance's review.

## 9. Out of scope

Functional changes, new features, API/prompt edits, copy rewrites (beyond adapting reference-only labels), routing, auth, the dead `scene-status` route, dependency changes (other than fonts already via `next/font`).
