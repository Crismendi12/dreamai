# Ajust Design System — Reference for DreamAI Reskin

Canonical tokens, type, components, and motion extracted from `/Users/lancemarks/Downloads/ajust-rant-to-us (1).html`. Phase 1 ports these into `src/app/globals.css` + `src/app/layout.tsx`. Phase 2 component agents use this as the styling vocabulary. After Phase 1, the live `globals.css` is the runtime source of truth; this doc is the orientation guide.

---

## 1. Design tokens (verbatim — goes in `:root`)

```css
:root {
  --bg:        #FAFAFA;   /* app canvas */
  --bg-2:      #FFFFFF;   /* card / panel surface */
  --bg-2-h:    #F1F0EA;   /* surface hover (warm off-white) */
  --line:      #E4E2DA;   /* hairline borders, dividers, dots */
  --text:      #1A1A18;   /* primary ink (warm near-black) */
  --muted:     #6F6E67;   /* secondary text */
  --faint:     #8A887F;   /* tertiary / captions / placeholders */
  --accent:    #7C3AED;   /* primary violet */
  --accent-d:  #6D28D9;   /* violet hover / gradient end */
  --accent-l:  #A78BFA;   /* light violet / gradient mid */
  --accent-soft: #F3EDFE; /* pale violet wash — icon chip bg */
  --accent-tint: rgba(124,58,237,0.08);
  --accent-tint-strong: rgba(124,58,237,0.14);
  --green:     #1B7A4B;   /* success / verified */
  --green-soft:#E8F5EE;
  --amber:     #B4690E;   /* caution */
  --amber-soft:#FBF0E1;
  --dark:      #1A1A18;   /* dark button bg */
  --sans: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --serif: "Newsreader", Georgia, "Times New Roman", serif;
  --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}
```

**Mapping to DreamAI's existing var names** (so legacy `var(--…)` consumers re-theme for free): redefine `--accent` → `#7C3AED`, `--accent-warm` → `--accent-l`/`#A78BFA`, `--success` → `--green`, `--danger` → a rose that reads on light (e.g. `#C0392B`), `--text-primary` → `--text`, `--text-secondary` → `--muted`, `--text-muted` → `--faint`, `--bg-deep` → `--bg`, `--bg-card`/`--bg-elevated` → `--bg-2`, `--border`/`--border-subtle` → `--line`. Keep BOTH the Ajust names and the legacy names defined.

## 2. Fonts (`next/font/google` in `layout.tsx`)

Google Fonts link in the source:
`Hanken+Grotesk:wght@400;500;600;700` · `Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500` · `JetBrains+Mono:wght@400;500`

```ts
import { Newsreader, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

const newsreader = Newsreader({          // --font-display (serif): heroes, h1/h2/h3, .em italic
  variable: "--font-display", subsets: ["latin"],
  weight: ["400", "500"], style: ["normal", "italic"], axes: ["opsz"],
});
const hanken = Hanken_Grotesk({          // --font-body (sans)
  variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"],
});
const jetbrains = JetBrains_Mono({       // --font-mono
  variable: "--font-mono", subsets: ["latin"], weight: ["400", "500"],
});
```
Keep the `<html className={...}>` variable wiring. `globals.css` already maps `--font-body`→body/`--font-sans`, `--font-display`→`h1/h2/h3/.font-display`, `--font-mono`→`--font-mono`.

## 3. Type scale

| Use | Family | Size / weight |
|---|---|---|
| Serif hero (`.serif-hero`) | serif | `clamp(34px,7vw,48px)`, wght 400, lh 0.98, ls -0.03em; landing variant `clamp(38px,7vw,56px)` |
| Section head (`.take-ack`, `.step-q`) | serif | `clamp(23–28px, 4.2–5vw, 30–40px)`, ls -0.02em, lh ~1.1 |
| `.analyse-head` | serif | `clamp(24px,4.5vw,30px)` |
| Kicker / mono label (`.greeting`, `.step-kicker`, `.panel-label`) | mono | 10.5–11px, wght 600–700, ls 0.12–0.14em, UPPERCASE, color accent or faint |
| Body / subhead | sans | 14–16px, `.subhead` color muted |
| Pills / buttons | sans | 13–15px, wght 600 |
| Mono numerics (timer, amounts, gauges) | mono | 11–22px |
| `.em` (emphasis inside heroes) | serif italic | `font-style:italic; color:var(--accent)` |

## 4. Shape / elevation / spacing

- **Radius:** cards/panels 16–20px; pills/circles `999px`; icon chips 9–12px; inputs 14px.
- **Card shadow:** `0 1px 2px rgba(26,26,24,0.04)`; transcript/composer `0 12px 30px -24px rgba(26,26,24,0.4)`.
- **Mic shadow:** `0 18px 40px -16px rgba(124,58,237,0.6), inset 0 1px 0 rgba(255,255,255,0.2)`.
- **Outcome hero shadow:** `0 20px 44px -22px rgba(124,58,237,0.7)`.
- **Stage layout:** `.stage { min-height: calc(100vh - …); display:flex; align-items:center; justify-content:center; padding:48px 24px }`; `.stage--top { align-items:flex-start }`. (DreamAI already centers via its shell — apply the same generous centered padding + per-screen `max-width` caps: voice 620, listen 600, analysing 520, take 660, intake 600, catgrid 760, handoff 480.)

## 5. Component class catalogue

> Port the full CSS rules for each from the HTML `<style>` block (lines 45–433). One-liners below; see HTML for exact rules. **Drop the prototype-only `.chrome`/`.tabs`/`.concept-note`/`.variant` explorer scaffolding — not part of the product.**

- **Buttons:** `.btn` (pill, h52, r999, wght600) + `.btn--brand` (violet), `.btn--dark` (`--dark` bg), `.btn--ghost` (white + line border), `.btn--block` (full width). `.linklike` (underlined faint text-button).
- **Brand:** `.mark` (logo slot — DreamAI uses a Newsreader wordmark instead), `.greeting` (mono kicker), `.serif-hero` (+ `.em` italic accent), `.subhead`.
- **Mic / vent:** `.mic-wrap`(+`.idle`), `.mic-ring` ×3 (ripple), `.mic-btn` (112px violet gradient disc), `.mic-hint`. Alts: `.voice-alts`, `.alt-sep` (or-divider), `.nosure` (suggestion card).
- **How / proof:** `.how`/`.how-step`/`.hn` (numbered step strip), `.how-arrow`; `.proof`/`.dot`/`.verified` (stat row).
- **Listening:** `.rec-pill`+`.rec-dot` (pulsing LIVE chip), `.wave` + `span` bars (`bar` keyframe, staggered delays), `.transcript` (serif card, `.dim` + `.caret`), `.listen-actions`, `.stop-btn` (dark circle).
- **Analysing (orb):** `.orb-stage`, `.orb-glow` (`breathe`), `.orb` (conic-gradient blob, `morph`+`spin`), `.spark` s1/s2/s3 (`twinkle`), `.analyse-head`, `.live-steps`, `.live-row`(`.on`/`.done`), `.live-ic` (done→green check), `.live-spin` (`rot`), `.live-t`.
- **Result / our-take:** `.take`, `.take-head`, `.take-ack`(+`.em`); `.reward`(+`reward-ic/body/t/s/amt`, `shimmer`) → DreamAI encouragement strip; `.pills`/`.pill`(+`.pill-edit`); `.outcome`(+`outcome-label/fig/amt/plus/sub`) hero; `.grid2` (200px+1fr, collapses <560px); `.panel`/`.panel-label`; `.strength-panel`+`.gauge`(conic) → DreamAI healing gauge; `.plan-steps`/`.plan-row`(connector line)/`.plan-ic`/`.plan-t`/`.plan-s`; `.kb`/`.kb-label`/`.kb-win*`/`.kb-sauce` (trust card); `.video`/`.video-bg`/`.video-play`/`.video-meta`/`.video-dur`; `.more`/`.more-mic`; `.tips-panel`/`.tip-row`/`.tip-n`; `.amber-outcome` (dark caution hero) + `.gauge.amber`.
- **Composer (type instead):** `.composer-lg`, `.composer-foot`, `.ctool`, `.send-lg`.
- **Category grid:** `.catwrap`, `.catgrid` (4→2 col), `.cat`/`.cat-ic`/`.cat-name`/`.cat-eg`.
- **Handoff:** `.handoff`, `.carry`/`.carry-label`/`.carry-row`/`.carry-k`/`.carry-v`, `.auth-btns`/`.auth-google`/`.auth-or`, `.resume-note`. (DreamAI has no auth — reuse `.carry` summary pattern only where a recap is shown.)
- **Guided intake / golden-gun (maps to FollowUpChat):** `.intake`, `.intake-top`, `.progress-dots`/`.pd`/`.pd-fill` (round indicator), `.step-kicker`, `.step-q`, `.gg-field`(+`.placeholder`,`.caret`), `.gg-suggest`, `.gg-pill`(+`.is-used`), `.sg-label`, `.intake-actions`, `.intake-done`/`.done-orb`/`.done-ctx*`.

## 6. Animations (keyframes — port verbatim)

`ripple` (mic rings), `pulse` (rec dot), `bar` (waveform), `blink` (caret), `breathe` (orb glow), `morph` (orb shape), `spin` (orb rotate), `twinkle` (sparks), `shimmer` (reward strip), `rot` (live-spin).

**Keep existing DreamAI keyframe names `fade-in` and `kenburns`** — referenced by JS-injected inline styles in `DreamPlayer`. Also keep `slide-up` (used widely). Port the `@media (prefers-reduced-motion: reduce)` block (disables mic-ring/rec-dot/wave/caret/orb/glow/spark/live-spin; sets wave bars to static height).

## 7. Icons (`src/lib/icons.tsx`)

Port the `I = {...}` object: stroke-based inline SVGs, 24×24 viewBox, `stroke-width` ~1.8, `currentColor`, round caps/joins. **Exclude the Ajust `logo()` SVG.** Useful names already present and reusable for sleep/dream/therapy: `mic`, `micsm`, `stop`, `keyboard`, `spark`, `sparkline`, `check`, `play`, `refresh`, `brain`, `lightbulb`, `shieldcheck`, `lock`, `target`, `alert`, `list`, `search`, `file`, `send`, `arrowright/left/up`, `trophy`, `zap`, `repeat`. Add a `moon`/`sleep` glyph for DreamAI. Replace component emoji (👤🔮💭🔗⚡🦋🏡) and ASCII (`~ + * #`) with these.

## 8. Responsive

- `.grid2` → 1 col at `max-width:560px`.
- `.catgrid` → 2 col at `max-width:720px` (from 4).
- Heroes use `clamp()` so they scale fluidly; no extra breakpoints needed.

## 9. Tailwind v4 + Next.js porting notes

- Tailwind v4 is CSS-first: put tokens in `:root`, expose the few needed as Tailwind theme via `@theme inline { --color-…: var(--…); --font-…: var(--font-…); }`. Existing arbitrary-value usage (`bg-[var(--accent)]`) keeps working once the vars are redefined.
- Keep component styles (`.btn`, `.panel`, `.mic-wrap`, `.orb`, `.gg-pill`, etc.) as **plain CSS classes in `globals.css`**, not Tailwind utilities — they're complex and match the source 1:1.
- Newsreader optical-size axis (`opsz 6..72`) — load via `axes: ["opsz"]`; italics power `.em`.
- Light canvas: set `body { background: var(--bg); color: var(--text) }` and remove/neutralize the dark `body::before` radial gradients.
