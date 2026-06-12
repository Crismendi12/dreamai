"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/lib/icons";

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
          <h2 className="serif-hero">
            Your <span className="em">Transformation</span>
          </h2>
          <p className="subhead mt-3">
            10 days of Image Rehearsal Therapy -- here&rsquo;s what changed
          </p>
        </div>
      </div>

      {/* Before / After distress */}
      <div
        className={`transition-all duration-1000 delay-300 ${revealStage >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="panel space-y-6">
          <div className="panel-label text-center">
            Nightmare Distress Level
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Before */}
            <div className="text-center space-y-3">
              <span className="block text-xs text-[var(--faint)]">Before IRT</span>
              <div className="relative mx-auto w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--line)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="var(--danger)"
                    strokeWidth="8"
                    strokeDasharray={`${originalDistress * 25.1} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--danger)] font-[family-name:var(--font-mono)]">{originalDistress}</span>
                </div>
              </div>
              <span className="block text-xs text-[var(--danger)]">High Distress</span>
            </div>

            {/* After */}
            <div className="text-center space-y-3">
              <span className="block text-xs text-[var(--faint)]">After IRT</span>
              <div className="relative mx-auto w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--line)" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="var(--green)"
                    strokeWidth="8"
                    strokeDasharray={`${projectedDistress * 25.1} 251`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--green)] font-[family-name:var(--font-mono)]">{projectedDistress}</span>
                </div>
              </div>
              <span className="block text-xs text-[var(--green)]">Managed</span>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-[var(--line)]">
            <div className="outcome-fig justify-center">
              <span className="amt em font-[family-name:var(--font-display)]">{reductionPct}%</span>
              <span className="text-2xl font-semibold text-[var(--accent)]">reduction</span>
            </div>
            <p className="text-xs text-[var(--faint)] mt-2">
              projected based on clinical IRT outcomes
            </p>
          </div>
        </div>
      </div>

      {/* What was transformed */}
      <div
        className={`transition-all duration-1000 delay-500 ${revealStage >= 3 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="panel space-y-4">
          <div className="panel-label text-center">
            What Changed
          </div>

          <div className="space-y-3">
            {/* Turning point */}
            {turningPoint && (
              <div className="bg-[var(--bg)] rounded-xl p-4 border-l-2 border-[var(--accent-l)]">
                <span className="panel-label" style={{ color: "var(--accent)", marginBottom: 4 }}>
                  Original Turning Point
                </span>
                <p className="text-sm text-[var(--muted)] mt-1 italic font-[family-name:var(--font-display)]">
                  &ldquo;{turningPoint}&rdquo;
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 py-2">
              <div className="h-px flex-1 bg-[var(--line)]" />
              <Icon name="arrowright" size={18} className="text-[var(--accent)] rotate-90" />
              <span className="text-xs text-[var(--accent)] font-semibold">Rescripted to</span>
              <div className="h-px flex-1 bg-[var(--line)]" />
            </div>

            <div className="bg-[var(--bg)] rounded-xl p-4 border-l-2 border-[var(--green)]">
              <span className="panel-label" style={{ color: "var(--green)", marginBottom: 4 }}>
                New Ending
              </span>
              <p className="text-sm text-[var(--text)] mt-1 font-medium">
                {endingTitle}
              </p>
            </div>

            {/* Emotions addressed */}
            {topEmotions.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {topEmotions.map((e) => (
                  <span key={e} className="pill">
                    <Icon name="check" size={13} className="text-[var(--green)]" />
                    <b>{e}</b>
                  </span>
                ))}
                <span className="text-xs text-[var(--faint)] self-center">
                  -- addressed
                </span>
              </div>
            )}

            {/* Themes */}
            {themes.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {themes.map((t) => (
                  <span key={t} className="pill">
                    <Icon name="spark" size={13} className="text-[var(--accent)]" />
                    <b>{t}</b>
                  </span>
                ))}
                <span className="text-xs text-[var(--faint)] self-center">
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
        <div className="panel space-y-4">
          <div className="panel-label text-center">
            The Science Behind Your Healing
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[var(--accent)] font-[family-name:var(--font-mono)]">70%</div>
              <div className="text-[10px] text-[var(--faint)] mt-1">Average nightmare reduction with IRT</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--accent)] font-[family-name:var(--font-mono)]">10</div>
              <div className="text-[10px] text-[var(--faint)] mt-1">Days to lasting change</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--green)] font-[family-name:var(--font-mono)]">90%</div>
              <div className="text-[10px] text-[var(--faint)] mt-1">Maintain improvement at 6 months</div>
            </div>
          </div>

          <p className="text-xs text-[var(--faint)] text-center italic">
            Based on Krakow & Zadra (2006), Aurora et al. (2010), and ongoing research
            by Dr. Michael Breus in dream engineering and IRT protocols.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-4 pt-4">
        <p className="text-sm text-[var(--muted)]">
          Continue watching your rehearsal video whenever nightmares return.
          Your brain now has a new script to follow.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="btn btn--brand"
          >
            <Icon name="refresh" size={18} />
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
            className="btn btn--ghost"
          >
            <Icon name="heart" size={18} className="text-[var(--accent)]" />
            Share Your Journey
          </button>
        </div>
      </div>
    </div>
  );
}
