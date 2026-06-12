# Demo / mock fallback mode

DreamAI can run the **entire user journey** (record → analyze → diary → follow-up → rescript → film → tracker → transformation) without a live backend, so the team can click through the real app before the backend/middleware engineers wire the `/api/*` routes.

## How it works

All five API calls go through a single transparent wrapper, `apiFetch` in `src/lib/api.ts`. It is a drop-in for `fetch` (returns a `Response`; call sites still do `await res.json()`), so the request/response **contract** is unchanged. Only the data *source* flexes, controlled by one env var:

| `NEXT_PUBLIC_DEMO_MODE` | Behavior |
|---|---|
| `true` | Always returns mock data. No network. Snappy, fully self-contained demo. |
| `false` | Always uses the real backend, no fallback. **Use this in production / once the backend is wired.** Identical to plain `fetch`. |
| unset / `auto` (default) | Tries the real backend first; if it fails (no keys, route missing, error), gracefully falls back to mock. Self-heals the moment a real route comes online. |

A `console.warn` is emitted whenever a mock fallback is used, so it is never silent.

## For the team (clickable demo)

Just open the deployed URL. With the default `auto` mode, every step works on mock data until the backend exists. For the snappiest experience (no doomed network attempts), set `NEXT_PUBLIC_DEMO_MODE=true`.

Note: the recorder's review step (editable transcript after voice capture) is intentional — Whisper output should be reviewable. In demo mode the transcript is pre-filled with sample text so the flow is smooth; it is **not** asking the user to retype. The sample rehearsal film uses public sample clips; if a clip can't load, the player falls back to a calm gradient + narration.

## For backend / middleware engineers

Set `NEXT_PUBLIC_DEMO_MODE=false`. From that point `apiFetch` is literally `fetch` — no mock, real errors surface normally. **No component changes are needed to adopt the real backend**; implement the existing route contracts:

- `POST /api/transcribe` (multipart `audio`) → `{ text }`
- `POST /api/analyze` `{ transcript }` → `{ analysis }`
- `POST /api/followup` `{ transcript, analysis, previousAnswers }` → `{ questions: string[] }`
- `POST /api/rescript` `{ analysis, followUpAnswers }` → `{ endings, recommended?, recommendation_reason? }`
- `POST /api/generate-scenes` `{ scenes, endingType }` → `{ scenes: [{ scene_number, video_url, narration, duration_seconds, mood, visual_description }] }`

The mock payloads in `src/lib/api.ts` document the exact expected shapes.
