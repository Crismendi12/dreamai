This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## ⚠️ Demo / mock fallback — read this first

The full UI/UX is built, but the AI backend (transcription, analysis, follow-ups, rescripting, video generation) is **not wired yet**. So the app currently runs on a **graceful mock fallback** so the team can click through the entire journey (record → analyze → diary → follow-up → rescript → film → tracker → transformation).

- All API calls go through `apiFetch` (`src/lib/api.ts`), a transparent drop-in for `fetch`.
- Behavior is controlled by `NEXT_PUBLIC_DEMO_MODE` (see `.env.example`):
  - `true` → always mock · `false` → always real backend (**set in production**) · unset/`auto` (default) → try real, fall back to mock on failure.
- The "Watch" step shows a **placeholder rehearsal film** (calm navy gradient + narration) because there is no real video yet. Real video appears automatically once `/api/generate-scenes` returns `video_url`s.
- The recorder's editable transcript after voice capture is **intentional** (review/edit), not a "retype" bug; in demo mode it's pre-filled with sample text.

**When the backend/middleware is actually wired in, it must work for real:** set `NEXT_PUBLIC_DEMO_MODE=false` and implement the existing route contracts (no component changes needed). Do **not** delete the API routes or `apiFetch` — they are the integration seam. Full details: [`docs/redesign/demo-mode.md`](docs/redesign/demo-mode.md).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
