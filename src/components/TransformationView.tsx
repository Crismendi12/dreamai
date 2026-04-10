"use client";

import { useState, useEffect } from "react";

interface TransformationViewProps {
  analysis: Record<string, unknown>;
  endingTitle: string;
}

export default function TransformationView({ analysis, endingTitle }: TransformationViewProps) {
  const [revealStage, setRevealStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setRevealStage(1), 500),
      setTimeout(() => setRevealStage(2), 1500),
      setTimeout(() => setRevealStage(3), 2500),
      setTimeout(() => setRevealStage(4), 3500),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const nightmareIntensity = (analysis.nightmare_intensity as number) || 7;
  const themes = (analysis.themes as string[]) || [];
  const emotions = (analysis.emotions as Array<{ emotion: string; intensity: number }>) || [];
  const turningPoint = (analysis.turning_point as string) || "";

  // Calculate transformation metrics
  const originalDistress = nightmareIntensity;
  const projectedDistress = Math.max(1, Math.round(originalDistress * 0.3));
  const reductionPct = Math.round(((originalDistress - projectedDistress) / originalDistress) * 100);

  const topEmotions = emotions
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 3)
    .map((e) => e.emotion);

  return (
    <div className="w-full max-w-2xl space-y-8 animate-slide-up">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div
          className={`transition-all duration-1000 ${revealStage >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            Your Transformation
          </h2>
          <p className="text-[var(--text-secondary)] mt-2">
            10 days of Image Rehearsal Therapy -- here's what changed
          </p>
        </div>
      </div>

      {/* Before / After distress */}
      <div
        className={`transition-all duration-1000 delay-300 ${revealStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="glass rounded-2xl p-6 space-y-6">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-center">
            Nightmare Distress Level
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Before */}
            <div className="text-center space-y-3">
              <span className="text-xs text-[var(--text-muted)]">Before IRT</span>
              <div className="relative mx-auto w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="var(--danger)"
                    strokeWidth="8"
                    strokeDasharray={`${originalDistress * 25.1} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--danger)]">{originalDistress}</span>
                </div>
              </div>
              <span className="text-xs text-[var(--danger)]">High Distress</span>
            </div>

            {/* After */}
            <div className="text-center space-y-3">
              <span className="text-xs text-[var(--text-muted)]">After IRT</span>
              <div className="relative mx-auto w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="var(--success)"
                    strokeWidth="8"
                    strokeDasharray={`${projectedDistress * 25.1} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--success)]">{projectedDistress}</span>
                </div>
              </div>
              <span className="text-xs text-[var(--success)]">Managed</span>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-[var(--border)]">
            <span className="text-3xl font-bold bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] bg-clip-text text-transparent">
              {reductionPct}% reduction
            </span>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              projected based on clinical IRT outcomes
            </p>
          </div>
        </div>
      </div>

      {/* What was transformed */}
      <div
        className={`transition-all duration-1000 delay-500 ${revealStage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-center">
            What Changed
          </h3>

          <div className="space-y-3">
            {/* Turning point */}
            {turningPoint && (
              <div className="bg-[var(--bg-deep)] rounded-xl p-4 border-l-2 border-[var(--accent-warm)]">
                <span className="text-[10px] font-medium text-[var(--accent-warm)] uppercase tracking-wider">
                  Original Turning Point
                </span>
                <p className="text-sm text-[var(--text-secondary)] mt-1 italic">
                  &ldquo;{turningPoint}&rdquo;
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
              <span className="text-xs text-[var(--accent)] font-medium">Rescripted to</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <div className="bg-[var(--bg-deep)] rounded-xl p-4 border-l-2 border-[var(--success)]">
              <span className="text-[10px] font-medium text-[var(--success)] uppercase tracking-wider">
                New Ending
              </span>
              <p className="text-sm text-[var(--text-primary)] mt-1 font-medium">
                {endingTitle}
              </p>
            </div>

            {/* Emotions addressed */}
            {topEmotions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {topEmotions.map((e) => (
                  <span
                    key={e}
                    className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium border border-[var(--accent)]/20"
                  >
                    {e}
                  </span>
                ))}
                <span className="px-3 py-1 rounded-full text-xs text-[var(--text-muted)]">
                  -- addressed
                </span>
              </div>
            )}

            {/* Themes */}
            {themes.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {themes.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full bg-[var(--accent-warm)]/10 text-[var(--accent-warm)] text-xs font-medium border border-[var(--accent-warm)]/20"
                  >
                    {t}
                  </span>
                ))}
                <span className="px-3 py-1 rounded-full text-xs text-[var(--text-muted)]">
                  -- rewired
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Science backed */}
      <div
        className={`transition-all duration-1000 delay-700 ${revealStage >= 4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider text-center">
            The Science Behind Your Healing
          </h3>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-[var(--accent)]">70%</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-1">Average nightmare reduction with IRT</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--accent-warm)]">10</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-1">Days to lasting change</div>
            </div>
            <div>
              <div className="text-xl font-bold text-[var(--success)]">90%</div>
              <div className="text-[10px] text-[var(--text-muted)] mt-1">Maintain improvement at 6 months</div>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] text-center italic">
            Based on Krakow & Zadra (2006), Aurora et al. (2010), and ongoing research
            by Dr. Michael Breus in dream engineering and IRT protocols.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 pt-4">
        <p className="text-sm text-[var(--text-secondary)]">
          Continue watching your rehearsal video whenever nightmares return.
          Your brain now has a new script to follow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent)]/90 transition-colors cursor-pointer"
          >
            Start New Session
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "DreamAI - Nightmare Therapy",
                  text: "I completed the 10-day IRT protocol with DreamAI. AI-powered nightmare therapy that actually works.",
                  url: window.location.href,
                });
              }
            }}
            className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
          >
            Share Your Journey
          </button>
        </div>
      </div>
    </div>
  );
}
