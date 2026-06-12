# DreamAI → DreamAI Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the entire DreamAI app to the the reference visual language (light + deep navy, Newsreader/Hanken Grotesk/JetBrains Mono) without changing any functionality.

**Architecture:** Two layers. **Layer 1 (foundation, sequential):** replace tokens + fonts + shared classes + add the full reference class vocabulary in `globals.css`, plus an icon module and the `page.tsx` shell. **Layer 2 (parallel):** one agent per component reworks JSX/className to the matching reference pattern, preserving every prop, handler, effect, fetch, and copy string. **Layer 3:** typecheck/lint/build + Playwright screenshot verification vs. the reference, then PR.

**Tech Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4 (CSS-first `@theme inline`), `next/font/google`, fal.ai + Anthropic SDK (untouched), Playwright (verification only).

**Reference docs (read before starting):**
- Spec: `docs/redesign/2026-06-12-visual-system-design.md`
- Design system: `docs/redesign/design-system.md`
- Verbatim source: `/Users/lancemarks/Downloads/reference-prototype.html` (CSS in `<style>` lines 11–433; component HTML lines 449–1066)

**Verification model (every task):** `npx tsc --noEmit` → `npm run lint` → `npm run build`. No behavior/contract drift. Visual checks via dev server + Playwright in Layer 3.

**Hard constraint (every Layer 2 task):** Change ONLY JSX markup, `className`, and cosmetic inline styles. Do NOT touch: prop interfaces, `useState`/`useRef`/`useEffect` bodies, event-handler logic, `fetch` calls, conditional *conditions* (`if (mode === …)`, `&&` render gates, ternary test expressions), data-driven inline-style math, or `key=` props. Keep all user-facing copy strings.

---

## File Structure

| File | Responsibility | Layer |
|---|---|---|
| `src/app/layout.tsx` | Font swap → Newsreader / Hanken Grotesk / JetBrains Mono | 1 |
| `src/app/globals.css` | Tokens, `@theme`, light body, shared-class reskin, full reference class vocabulary, keyframes, reduced-motion | 1 |
| `src/lib/icons.tsx` | **New.** Ported reference stroke-SVG icon set (no reference logo) | 1 |
| `src/app/page.tsx` | Shell (wordmark, progress-dots stepper, footer, error, `analyzing` block) + `LandingView`/`StatCard`/`StepCard` | 1 |
| `src/components/VoiceRecorder.tsx` | mic-ripple / waveform / orb / transcript-card | 2 |
| `src/components/DreamDiary.tsx` | panel stack / gauge / pills / callouts | 2 |
| `src/components/FollowUpChat.tsx` | golden-gun chip questions / progress-dots | 2 |
| `src/components/RescriptingView.tsx` | option cards / dot stepper / outcome CTA | 2 |
| `src/components/VideoGenerator.tsx` | orb loader / plan-row scene list / error card | 2 |
| `src/components/DreamPlayer.tsx` | light reference player frame / deep navy timeline / pill controls | 2 |
| `src/components/HabitTracker.tsx` | gauge / dot-grid calendar / plan-step milestones | 2 |
| `src/components/TransformationView.tsx` | before/after gauges / outcome hero / stat row | 2 |
| `src/lib/claude.ts`, `src/app/api/**` | **DO NOT TOUCH** | — |
| `CLAUDE.md`, `AGENTS.md` | **DO NOT TOUCH** (foreign-authored) | — |

---

## Layer 1 — Foundation (sequential; complete before Layer 2)

### Task 1: Swap fonts in `layout.tsx`

**Files:** Modify `src/app/layout.tsx`

- [ ] **Step 1: Replace the three `next/font/google` imports + constructors** with (keep the existing `--font-display` / `--font-body` / `--font-mono` variable names and the `<html className>` wiring exactly):

```ts
import { Newsreader, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

const newsreader = Newsreader({
  variable: "--font-display", subsets: ["latin"],
  weight: ["400", "500"], style: ["normal", "italic"], axes: ["opsz"],
});
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"],
});
```
Update the `<html className={`${newsreader.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}>` to the new const names. Leave metadata/structure as-is. (Optional: update `metadata.title`/`description` only if currently Playfair-specific — otherwise leave.)

- [ ] **Step 2: Verify** `npx tsc --noEmit` (expect 0 errors). `npm run build` will be run after Task 3.

- [ ] **Step 3: Commit**
```bash
git add src/app/layout.tsx
git commit -m "feat(redesign): swap fonts to Newsreader/Hanken Grotesk/JetBrains Mono"
```

### Task 2: Replace tokens, theme, and light body in `globals.css`

**Files:** Modify `src/app/globals.css`

- [ ] **Step 1: Replace the `:root` block** with the reference tokens AND the retained legacy aliases (so existing `var(--accent)` etc. consumers re-theme). Use the verbatim token block from `docs/redesign/design-system.md` §1, then append legacy aliases:

```css
:root {
  /* reference tokens — see design-system.md §1 (paste the full block) */
  --bg:#FAFAFA; --bg-2:#FFFFFF; --bg-2-h:#F1F0EA; --line:#E4E2DA;
  --text:#1A1A18; --muted:#6F6E67; --faint:#8A887F;
  --accent:#1E3A8A; --accent-d:#172554; --accent-l:#3B82F6; --accent-soft:#E8EEFB;
  --accent-tint:rgba(30,58,138,0.08); --accent-tint-strong:rgba(30,58,138,0.14);
  --green:#1B7A4B; --green-soft:#E8F5EE; --amber:#B4690E; --amber-soft:#FBF0E1; --dark:#1A1A18;
  --sans:"Hanken Grotesk",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
  --serif:"Newsreader",Georgia,"Times New Roman",serif;
  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,monospace;

  /* Legacy aliases — keep existing component var() calls working on the new palette */
  --bg-deep:var(--bg); --bg-card:var(--bg-2); --bg-elevated:var(--bg-2-h);
  --text-primary:var(--text); --text-secondary:var(--muted); --text-muted:var(--faint);
  --accent-glow:var(--accent-tint); --accent-warm:var(--accent-l); --accent-cool:var(--accent-l);
  --success:var(--green); --danger:#C0392B; --border:var(--line); --border-subtle:var(--line);
}
```

- [ ] **Step 2: Rewire `@theme inline`** so Tailwind theme tokens point at the new vars; keep `--color-background: var(--bg)`, `--color-foreground: var(--text)`, `--color-accent: var(--accent)`, `--color-card: var(--bg-2)`, `--color-border: var(--line)`, `--font-sans: var(--font-body)`, `--font-mono: var(--font-mono)`, etc. (mirror existing keys, repoint values).

- [ ] **Step 3: Light body + neutralize the dark overlay.** Set `body { background: var(--bg); color: var(--text); font-family: var(--font-body), system-ui, sans-serif; }`. **Remove (or replace) the dark `body::before` radial-gradient block** so no dark atmosphere persists (either delete it or repoint to a very subtle light wash). Retune the custom scrollbar thumb to `rgba(30,58,138,0.25)`. Keep the `h1,h2,h3,.font-display` serif rule.

- [ ] **Step 4: Verify** `npx tsc --noEmit`. (Build after Task 3.)

- [ ] **Step 5: Commit**
```bash
git add src/app/globals.css
git commit -m "feat(redesign): reference light/deep navy tokens + light body in globals.css"
```

### Task 3: Reskin shared classes + add full reference class vocabulary + keyframes

**Files:** Modify `src/app/globals.css`

- [ ] **Step 1: Reskin the existing shared classes** to the new system (same names, new look): `.btn-primary` → deep navy pill (`background:var(--accent); color:#fff; border-radius:999px; font-weight:600;` hover `var(--accent-d)`); `.glass` / `.glass-warm` → white soft card (`background:var(--bg-2); border:1px solid var(--line); box-shadow:0 1px 2px rgba(26,26,24,0.04);`); `.glow-border` → `box-shadow:0 0 0 1px var(--accent), 0 0 0 4px var(--accent-tint);`; retune `.recording-pulse`, `.noise`, `.stagger-*` as needed.

- [ ] **Step 2: Add the full reference component class set**, ported verbatim from the HTML `<style>` (lines 81–428). Drop ONLY the prototype explorer chrome (`.chrome`, `.chrome-row`, `.chrome-title`, `.chrome-hint`, `.tabs`, `.tab`, `.concept-note`, `.variant`, `.stage`/`.stage--top` may be kept as a reusable centering helper). Include: `.btn` + variants + `.linklike`; `.greeting`, `.serif-hero`(+`.em`), `.subhead`, `.mark`; `.mic-wrap`/`.mic-ring`/`.mic-btn`/`.mic-hint`/`.voice-alts`/`.alt-sep`/`.nosure*`; `.how*`/`.proof*`; `.rec-pill`/`.rec-dot`/`.wave`/`.transcript`/`.listen-actions`/`.stop-btn`/`.listen-cap`; `.analysing`/`.orb-stage`/`.orb-glow`/`.orb`/`.spark*`/`.analyse-head`/`.live-steps`/`.live-row`/`.live-ic`/`.live-spin`/`.live-t`; `.take*`/`.reward*`/`.pills`/`.pill`/`.outcome*`/`.grid2`/`.panel`/`.panel-label`/`.strength-panel`/`.gauge`(+`.amber`)/`.gauge-val`/`.plan-steps`/`.plan-row`/`.plan-ic`/`.plan-t`/`.plan-s`/`.kb*`/`.video*`/`.more*`/`.tips-panel`/`.tip-*`/`.amber-outcome`; `.composer-lg`/`.composer-foot`/`.ctool`/`.send-lg`; `.catwrap`/`.catgrid`/`.cat*`; `.handoff`/`.carry*`/`.auth-*`/`.resume-note`; `.intake*`/`.progress-dots`/`.pd`/`.pd-fill`/`.step-kicker`/`.step-q`/`.step-hint`/`.gg-field`/`.gg-suggest`/`.gg-pill`/`.sg-label`/`.intake-actions`/`.intake-done`/`.done-orb`/`.done-ctx*`.

- [ ] **Step 3: Port all keyframes verbatim:** `ripple`, `pulse`, `bar`, `blink`, `breathe`, `morph`, `spin`, `twinkle`, `shimmer`, `rot`. **Keep the existing `fade-in`, `slide-up`, and `kenburns` keyframes** (JS-referenced — do not rename). Port the `@media (prefers-reduced-motion: reduce)` block from the HTML (lines 429–433) merged with the existing one.

- [ ] **Step 4: Verify** `npx tsc --noEmit`; `npm run build` (expect success); `npm run lint` (expect clean).

- [ ] **Step 5: Commit**
```bash
git add src/app/globals.css
git commit -m "feat(redesign): port full reference component classes + keyframes"
```

### Task 4: Icon module `src/lib/icons.tsx`

**Files:** Create `src/lib/icons.tsx`

- [ ] **Step 1:** Port the reference `I = {…}` icon object (HTML lines 461–500) into a typed React-friendly module. **Exclude the reference `logo()` SVG.** Export both a raw-string map and a small `<Icon name="…" />` component. Add a `moon` glyph for DreamAI. Example shape:

```tsx
export const ICONS = {
  mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" .../>`,
  // ...all non-logo icons from the source, plus:
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>`,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className, style }: { name: IconName; className?: string; style?: React.CSSProperties }) {
  return <span className={className} style={style} aria-hidden dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
}
```
(Use `currentColor` so icons inherit text color; size via wrapper/CSS.)

- [ ] **Step 2: Verify** `npx tsc --noEmit`.

- [ ] **Step 3: Commit**
```bash
git add src/lib/icons.tsx
git commit -m "feat(redesign): add reference icon set (src/lib/icons.tsx)"
```

### Task 5: Reskin `page.tsx` shell + landing

**Files:** Modify `src/app/page.tsx`

- [ ] **Step 1: Shell.** Restyle `<header>`: replace logo with a `serif-hero`-style "DreamAI" wordmark (small, Newsreader). Replace the 6-dot stepper markup with reference `.progress-dots` (`.pd` per the 6 steps, `.is-done`/`.is-active` driven by the EXISTING `stepIndex` value — keep that derivation untouched). Restyle `<footer>` disclaimer in muted Hanken. Restyle the `{error && (...)}` banner to a soft notice (`background:var(--accent-soft)` or amber-soft, `border:1px solid var(--line)`, rounded). Restyle the inline `analyzing` block (lines ~132–143) to the reference **`.analysing` orb + `.live-steps`** pattern (static or simple stepped; reuse the orb markup). **Do not change** the `Step` type, `stepIndex` map, handlers, `setStep`/`fetch`, or render gates.

- [ ] **Step 2: Landing.** Rework `LandingView` to `.voice`/`home-head` hero: `.greeting` kicker, `.serif-hero` headline (keep copy), `.btn--brand` CTA wired to the existing `onStart`. Convert `StatCard` rows to the `.proof` stat strip and `StepCard` steps to the `.how` step strip (keep their copy + the citation). Replace any emoji/icon with `Icon`.

- [ ] **Step 3: Verify** `npx tsc --noEmit`; `npm run build`; `npm run lint`.

- [ ] **Step 4: Commit**
```bash
git add src/app/page.tsx
git commit -m "feat(redesign): reskin app shell, stepper, and landing to DreamAI design system"
```

### Checkpoint: Foundation review

- [ ] Run `npm run dev`, open `/`. Confirm: light canvas, deep navy accent, Newsreader headings, progress-dots header, landing renders. Screenshot. Fix any foundation drift before Layer 2.

---

## Layer 2 — Per-component reskin (PARALLEL; one subagent per task)

Each task is independent (separate file). Every task: read the spec §4–§5 + design-system doc, apply the mapping, obey the Hard Constraint, then `npx tsc --noEmit && npm run lint && npm run build`, then commit. Each agent receives the contract block for its component (from spec §4) verbatim.

### Task 6: `VoiceRecorder.tsx`
- [ ] Map `idle` → `.mic-wrap.idle` + 3 `.mic-ring` + `.mic-btn` (Icon `mic`) + `.mic-hint`; "I prefer to type" → `.linklike`. `recording` → `.rec-pill` LIVE + `.wave` (28 staggered bars) + `.stop-btn` (Icon `stop`) + mono timer. `transcribing` → `.orb-stage`/`.orb` morphing orb + caption. `review` → `.transcript`/composer card (textarea) + `.btn--ghost` (Re-record) + `.btn--brand` (Analyze). micError → soft inline notice. **Preserve:** MediaRecorder/timer/`/api/transcribe`/`>10`-char guard/`onTranscriptReady`. Keep copy. Verify + commit.

### Task 7: `DreamDiary.tsx`
- [ ] Each field card → `.panel`. Intensity → `.gauge` (or `.outcome` mini) with tier colors mapped to new palette (`>=7`→`--danger`, `>=4`→`--amber`, else `--green`). Characters/distortions/themes → `.pill`. Sensory → 2-col card grid. Clinical/Turning Point/Intervention → left-rule callouts (deep navy/danger/green). Emotion bars → deep navy mini-bars (keep `intensity*10%` math). Replace emoji with `Icon`. Keep `DiaryField`/`SenseCard` signatures (incl. unused `icon`). **Preserve:** stateless render + conditional presence + intensity math. Keep copy. Verify + commit.

### Task 8: `FollowUpChat.tsx`
- [ ] `loading` → morphing orb + round-aware caption. Questions → `.step-q` prompt per question + `.gg-field` input; render the round indicator as `.progress-dots` (round 1/2). Prior answers → muted `.pill`/`.carry`-style recap (keep `opacity-60`). Buttons → `.linklike` Skip + `.btn--brand` Submit/Continue (keep `allAnswered` disable). Keep staggered entrance. **Preserve:** 2-round cap, `/api/followup`, fallback question, `onComplete`. Keep copy. Verify + commit.

### Task 9: `RescriptingView.tsx`
- [ ] `loading` → orb + caption; empty → white card + `.btn--brand` Try Again. Ending selector → 3 selectable cards (`.cat`/`.panel` style); selected → `.glow-border` deep navy ring (keep the `colors[i]` borderColor mechanism, recolor values); "Recommended" → badge `.pill`. Scene tabs → `.progress-dots`/segmented. Visual/Narration → left-rule `.outcome`-callouts (keep Narration italic via `.em`/serif). Generate CTA → `.outcome` hero + `.btn--brand`. Keep `key={activeScene}`. **Preserve:** `normalizeEndings`, `/api/rescript`, recommended clamp, type map, `onGenerateVideo`. Keep copy + ⚡🦋🏡 (or swap to `Icon zap`/`spark`/`shieldcheck`). Verify + commit.

### Task 10: `VideoGenerator.tsx`
- [ ] `generating` → `.orb-stage` hero + mono elapsed; per-scene cards → `.plan-steps`/`.plan-row` with live status dot; the fixed-60% bar → keep the element but restyle as an indeterminate deep navy bar (DO NOT wire real progress). `error` → white card + Icon `alert` + `.btn--brand` (Retry / "Add Credits" pill link). `done` → `<DreamPlayer/>` + `.btn--brand` "Continue to Your Healing Plan". **Preserve:** `/api/generate-scenes`, balance/locked mapping, `sortedScenes`/`totalDuration`, `reload()` retry, `onComplete`. Keep copy. Verify + commit.

### Task 11: `DreamPlayer.tsx` (handle media carefully)
- [ ] Reskin the FRAME to light reference: outer `.panel`/rounded surround, Newsreader header, **deep navy** timeline fill + scene markers (replace gold `--accent-warm` gradient), pill prev/play/next controls, "AI Video" → badge `.pill`, end card + instructions → light `.panel` + `.btn`. The `<video>` element + letterbox keep a dark stage for contrast; subtitle keeps `textShadow` for legibility over footage. **Preserve EXACTLY:** all refs (`videoRef`/`nextVideoRef`/`utteranceRef`/`timerRef`/`elapsedRef`), `speechSynthesis` + voice list, 100ms timer loop, crossfade timing, hidden preload `<video>`, injected `kenburns` `<style>`, `moodGradients` mechanism (recolor values only), every `key=`. Keep copy. Verify + commit.

### Task 12: `HabitTracker.tsx`
- [ ] Progress card → `.gauge`/deep navy bar (keep `progressPct`); streak → small `.pill` badge. Calendar `grid-cols-5` → progress-dot/chip grid: completed = filled + Icon `check`, today = deep navy `.glow-border` ring + "Tonight", future = ghost; milestone corner badge → small `.pill`. Milestones list → `.plan-steps`. Action card → `.outcome` + `.btn--brand`. Replace ASCII glyphs (`~ + * #`) with `Icon`. **Preserve:** `STORAGE_KEY`/`TOTAL_DAYS`/`TrackerData`/`getStoredData`/`getDayNumber`/`markToday`/streak math/tiered thresholds/`onComplete`. Keep copy. Verify + commit.

### Task 13: `TransformationView.tsx`
- [ ] Before/after SVG rings → `.gauge` pair (keep `strokeDasharray = value*25.1` math), danger→green. Hero + reduction % → `.outcome` hero (Newsreader figure, deep navy `.em`). What-Changed callouts → left-rule `.outcome` cards; chips → `.pill` (addressed=deep navy, rewired=secondary). Science → 3-stat row (mono figures). CTAs → `.btn--brand` (Start New) + `.btn--ghost` (Share). Keep the 4-stage reveal. **Preserve:** reveal timers, distress math, `navigator.share` payload, `reload()`. Keep copy + citation. Verify + commit.

---

## Layer 3 — Verification & integration

### Task 14: Full static verification
- [ ] Run `npx tsc --noEmit` (0 errors), `npm run lint` (0), `npm run build` (clean). Fix any drift. Commit fixes if any.

### Task 15: Visual verification vs. reference (Playwright)
- [ ] **Step 1:** `npm run dev`. Use Playwright (MCP) to drive the full journey and screenshot every surface at desktop (1280) + mobile (390) widths: landing → record (idle/recording/review) → analyzing → diary → followup (round 1 & 2) → rescript (loading/selector/scene) → video (generating/error/player) → tracker (default/completed/day-10) → transformation. To reach data-dependent screens without live API spend, seed via the same fixtures the components expect (or temporarily mock `fetch` responses at the network layer in the browser — NOT in source) OR walk the real flow with a short typed dream if credits permit.
- [ ] **Step 2:** Open the reference reference HTML in a second tab; compare each DreamAI surface against its reference analog for token/type/spacing/motion fidelity. Record drift.
- [ ] **Step 3:** Fix drift in the relevant component(s) (re-run static verification after each). Re-screenshot. Repeat until faithful.
- [ ] **Step 4:** Confirm preserved behavior by manual smoke: mic permission prompt appears, textarea submit gating at >10 chars, habit-tracker localStorage persists across reload, transformation reveal animates, player controls/subtitle/timeline work. Keep `prefers-reduced-motion` honored.

### Task 16: Ship
- [ ] **Step 1:** Final `npx tsc --noEmit && npm run lint && npm run build` — capture output.
- [ ] **Step 2:** Ensure `origin` push works as `lance-fp` (remote may need SSH alias `git@github.com-fp:Crismendi12/dreamai.git`; set if HTTPS push is rejected). `git push -u origin redesign/dreamai-design-system`.
- [ ] **Step 3:** Open PR → `main` (`gh pr create`), body summarizing the reskin, the preserved-contract guarantee, and screenshots. Do NOT merge — Lance reviews.

---

## Self-Review (completed)

- **Spec coverage:** every spec §3 foundation item → Tasks 1–5; every spec §5 component → Tasks 6–13; spec §8 verification → Tasks 14–16. ✅
- **Placeholders:** none — each task cites exact files, the source CSS/HTML line ranges, and concrete class mappings. ✅
- **Type/name consistency:** font var names (`--font-display/body/mono`), `Icon`/`ICONS`/`IconName`, `stepIndex`, `STORAGE_KEY` used consistently across tasks. ✅
- **Contract preservation** restated per Layer 2 task. ✅
