"use client";

import { useState, useEffect } from "react";
import { Icon, type IconName } from "@/lib/icons";

interface Scene {
  scene_number: number;
  visual_description: string;
  narration: string;
  duration_seconds: number;
  mood: string;
}

interface Ending {
  title: string;
  description: string;
  scenes: Scene[];
}

interface RescriptData {
  endings?: Ending[];
  recommended?: number;
  recommendation_reason?: string;
}

interface RescriptingViewProps {
  analysis: Record<string, unknown>;
  followUpAnswers: { q: string; a: string }[];
  onGenerateVideo: (ending: { title: string; type: string; scenes: Scene[] }) => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeEndings(raw: any): RescriptData {
  if (!raw || typeof raw !== "object") return { endings: [] };

  // Case 1: already an array of endings
  if (Array.isArray(raw)) {
    return { endings: raw, recommended: 1 };
  }

  // Case 2: {endings: [...], recommended: N}
  if (Array.isArray(raw.endings)) {
    return {
      endings: raw.endings,
      recommended: raw.recommended || 1,
      recommendation_reason: raw.recommendation_reason || raw.reason,
    };
  }

  // Case 3: {ending_1: {}, ending_2: {}, mastery_ending: {}, etc.}
  // Extract all object values that look like endings (have title + scenes)
  const endingObjects: Ending[] = [];
  for (const [, val] of Object.entries(raw)) {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const obj = val as any;
      if (obj.title && obj.scenes) {
        endingObjects.push(obj as Ending);
      }
    }
  }
  if (endingObjects.length > 0) {
    return {
      endings: endingObjects,
      recommended: raw.recommended || 1,
      recommendation_reason: raw.recommendation_reason || raw.reason,
    };
  }

  return { endings: [] };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function RescriptingView({ analysis, followUpAnswers, onGenerateVideo }: RescriptingViewProps) {
  const [data, setData] = useState<RescriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEnding, setSelectedEnding] = useState<number | null>(null);
  const [activeScene, setActiveScene] = useState(0);

  async function fetchRescripts() {
    try {
      const res = await fetch("/api/rescript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysis, followUpAnswers }),
      });
      const result = await res.json();
      const raw = result.endings;
      const normalized = normalizeEndings(raw);
      setData(normalized);
      if (normalized.endings && normalized.endings.length > 0) {
        const rec = typeof normalized.recommended === "number" ? normalized.recommended : 1;
        setSelectedEnding(Math.max(0, Math.min(rec - 1, normalized.endings.length - 1)));
      }
    } catch {
      setData({ endings: [] });
    }
    setLoading(false);
  }

  useEffect(() => {
    // fetchRescripts is async: every setState runs after `await`/in catch, never
    // synchronously within the effect body, so the cascading-render concern does
    // not apply here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRescripts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="analysing animate-fade-in">
        <div className="orb-stage">
          <div className="orb-glow" />
          <div className="orb" />
          <span className="spark s1"><Icon name="spark" /></span>
          <span className="spark s2"><Icon name="spark" /></span>
          <span className="spark s3"><Icon name="spark" /></span>
        </div>
        <p className="text-[var(--muted)] text-sm">Creating new endings for your dream...</p>
        <p className="text-[var(--faint)] text-xs mt-1">This is where the healing begins</p>
      </div>
    );
  }

  if (!data?.endings || data.endings.length === 0) {
    return (
      <div className="panel flex flex-col items-center gap-4 text-center animate-fade-in">
        <p className="text-[var(--muted)]">Could not generate endings.</p>
        <button onClick={() => { setLoading(true); fetchRescripts(); }} className="btn btn--brand">
          <Icon name="refresh" />
          Try Again
        </button>
      </div>
    );
  }

  const labels = ["Mastery", "Transformation", "Safety"];
  const iconNames: IconName[] = ["zap", "heart", "shieldcheck"];
  const colors = ["#1E3A8A", "#172554", "#3B82F6"];

  const ending = selectedEnding !== null ? data.endings[selectedEnding] : null;

  return (
    <div className="w-full max-w-2xl space-y-6 animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display text-[var(--text)]">
          Rescript Your Dream
        </h2>
        <p className="subhead text-sm">
          Choose how you want your dream to end. Each approach is backed by IRT research.
        </p>
      </div>

      {/* Ending selector */}
      <div className="grid grid-cols-3 gap-3">
        {data.endings.map((e, i) => (
          <button
            key={i}
            onClick={() => { setSelectedEnding(i); setActiveScene(0); }}
            className={`cat relative ${selectedEnding === i ? "glow-border" : ""}`}
            style={{
              borderColor: selectedEnding === i ? colors[i] : undefined,
            }}
          >
            {data.recommended === i + 1 && (
              <span className="pill absolute -top-3 -right-2 !py-1 !px-2.5 text-[10px] !bg-[var(--accent)] !border-[var(--accent)] !text-white font-medium">
                Recommended
              </span>
            )}
            <span className="cat-ic">
              <Icon name={iconNames[i]} />
            </span>
            <span className="cat-name">{labels[i]}</span>
            <span className="cat-eg">{e.title}</span>
          </button>
        ))}
      </div>

      {/* Recommendation reason */}
      {data.recommendation_reason && (
        <p className="text-xs text-[var(--faint)] text-center italic">
          {data.recommendation_reason}
        </p>
      )}

      {/* Selected ending detail */}
      {ending && (
        <div className="space-y-4 animate-fade-in">
          <div className="panel">
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              {ending.description}
            </p>
          </div>

          {/* Scene viewer */}
          {ending.scenes && ending.scenes.length > 0 && (
            <div className="space-y-3">
              <h3 className="panel-label !mb-0">
                Scene-by-Scene Visualization
              </h3>

              {/* Scene tabs */}
              <div className="flex gap-2">
                {ending.scenes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveScene(i)}
                    className={`w-8 h-8 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer border ${
                      activeScene === i
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "bg-[var(--bg-2)] text-[var(--faint)] border-[var(--line)] hover:bg-[var(--bg-2-h)]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Active scene */}
              <div className="panel space-y-4 animate-fade-in" key={activeScene}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
                    Scene {ending.scenes[activeScene].scene_number || activeScene + 1}
                  </span>
                  <span className="font-mono text-xs text-[var(--faint)]">
                    {ending.scenes[activeScene].duration_seconds}s
                    {ending.scenes[activeScene].mood && ` · ${ending.scenes[activeScene].mood}`}
                  </span>
                </div>

                <div className="pl-4 border-l-2 border-[var(--accent-l)]">
                  <span className="panel-label !mb-2 block">
                    Visual
                  </span>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {ending.scenes[activeScene].visual_description}
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-[var(--accent)]">
                  <span className="panel-label !mb-2 block !text-[var(--accent)]">
                    Narration
                  </span>
                  <p className="text-sm text-[var(--text)] leading-relaxed italic font-display">
                    &ldquo;{ending.scenes[activeScene].narration}&rdquo;
                  </p>
                </div>
              </div>

              {/* Scene navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setActiveScene(Math.max(0, activeScene - 1))}
                  disabled={activeScene === 0}
                  className="linklike disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                >
                  <Icon name="arrowleft" />
                  Previous
                </button>
                <button
                  onClick={() => setActiveScene(Math.min(ending.scenes.length - 1, activeScene + 1))}
                  disabled={activeScene === ending.scenes.length - 1}
                  className="linklike disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
                >
                  Next
                  <Icon name="arrowright" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generate Video CTA */}
      {ending && (
        <div className="outcome">
          <div className="outcome-label">
            <Icon name="play" />
            Generate Your Rehearsal Film
          </div>
          <div className="outcome-fig">
            <span className="font-display text-2xl leading-tight">{ending.title}</span>
          </div>
          <p className="outcome-sub mt-2">
            AI will create a cinematic POV video of your new ending -- {ending.scenes.length} scenes
            with dreamlike camera movement and narration.
          </p>
          <div className="pt-5">
            <button
              onClick={() => {
                if (selectedEnding === null) return;
                const endingTypes = ["mastery", "transformation", "safety"];
                onGenerateVideo({
                  title: ending.title,
                  type: endingTypes[selectedEnding] || "mastery",
                  scenes: ending.scenes,
                });
              }}
              className="btn btn--ghost"
            >
              Generate Rehearsal Film
              <Icon name="arrowright" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
