# DreamAI

AI-powered Image Rehearsal Therapy (IRT) platform for nightmare treatment. Partnership with Dr. Michael Breus (The Sleep Doctor).

## What It Does

Users record nightmares via voice -> AI asks deepening questions (2 rounds) -> generates 3 alternative endings (Mastery/Transformation/Safety) -> creates personalized video of the new dream ending via fal.ai Kling v2 -> user watches nightly for 10 days to rewire the dream.

## Partnership

- **Dr. Michael Breus** -- sleep expert, sleepdoctor.com, Diary of a CEO. Has clinical frameworks + research. No technical skills. Email: dr.breus@gmail.com
- **Cristian** -- technical partner, building the MVP
- **Referral**: Jess connected them (2026-03-16)

## Target Users (Beachhead)

Military combat veterans first (Dr. Breus's preference). Key stat: every 21 minutes a US military member commits suicide; nightmare frequency correlates with suicidality. Nightmares are a modifiable, independent suicide risk factor.

Secondary: rape/assault survivors. Free for PTSD sufferers, paid later for innovation/problem-solving dreaming.

## Clinical Foundation

IRT is the gold standard (AASM Level A for PTSD nightmares). 8-step protocol: psychoeducation -> nightmare selection -> imagery skills -> rescripting -> daily rehearsal (5-20 min) -> optional exposure -> belief/mastery work -> tracking. Effects sustained 6-12 months to 4+ years.

Our approach = technology-enhanced Targeted Dream Incubation (TDI) combined with IRT rescripting. Pre-sleep video + suggestions. Grounded in MIT/Stickgold research.

## Tech Stack

- **Framework**: Next.js 16.2.3 (App Router, Turbopack)
- **AI Text**: Claude API (Sonnet 4, Haiku 4.5 fallback)
- **AI Video**: fal.ai Kling v2 Standard (text-to-video, queue-based)
- **AI Speech**: fal.ai Whisper (transcription)
- **TTS**: Browser SpeechSynthesis (ElevenLabs planned for prod)
- **Styling**: Tailwind CSS v4, Playfair Display + DM Sans
- **Hosting**: Vercel serverless
- **Persistence**: localStorage (habit tracker)

## 6-Step Flow

1. **Record** -- voice capture -> Whisper transcription
2. **Analyze** -- Claude IRT analysis (15 clinical fields)
3. **Deepen** -- 2 rounds of sensory follow-up questions (Claude)
4. **Rescript** -- 3 endings x 3 scenes each (Claude)
5. **Watch** -- fal.ai Kling v2 video generation (queue.submit -> poll -> play)
6. **Heal** -- 10-day habit tracker + transformation summary

## Cost Per Session

~$0.53-$1.06 total. Video generation is the main cost ($0.45-$0.90 for 3 scenes). At $5 fal.ai credit: ~5-8 full sessions.

## Key Technical Decisions

- **Queue-based video**: Kling takes 1-3 min/scene, Vercel times out at 10-60s. Solution: `fal.queue.submit()` -> client polls `/api/scene-status` every 5s
- **3 scenes max**: Cost control ($0.15-$0.30/clip)
- **Sonnet -> Haiku fallback**: Richer analysis with cost safety net
- **Browser TTS over ElevenLabs**: MVP speed, zero cost, upgrade planned

## URLs

| Resource | URL |
|----------|-----|
| Live app | https://dreamai-rho.vercel.app |
| Vercel dashboard | https://vercel.com/cristian-mendivelsos-projects/dreamai |

## Architecture Details

Full architecture doc with Mermaid diagrams, prompt patterns, and file structure: `docs/DreamAI - Architecture & Build.md`

## Next Steps (Post-MVP)

1. ElevenLabs TTS -- warm therapeutic voice
2. User accounts -- save sessions across devices
3. Therapist dashboard -- clinician view
4. Export video as MP4
5. Multi-language (Spanish, Portuguese)
6. Mobile app (React Native or PWA)
