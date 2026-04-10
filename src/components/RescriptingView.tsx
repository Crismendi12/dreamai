"use client";

import { useState, useEffect } from "react";
import DreamPlayer from "./DreamPlayer";

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

interface GeneratedScene {
  scene_number: number;
  image_url: string | null;
  narration: string;
  duration_seconds: number;
  mood: string;
  visual_description: string;
}

interface RescriptingViewProps {
  analysis: Record<string, unknown>;
  followUpAnswers: { q: string; a: string }[];
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

export default function RescriptingView({ analysis, followUpAnswers }: RescriptingViewProps) {
  const [data, setData] = useState<RescriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEnding, setSelectedEnding] = useState<number | null>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoScenes, setVideoScenes] = useState<GeneratedScene[] | null>(null);
  const [videoTotalDuration, setVideoTotalDuration] = useState(0);

  useEffect(() => {
    fetchRescripts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRescripts = async () => {
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
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-10 h-10 border-2 border-[var(--accent-warm)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--text-secondary)] text-sm">Creating new endings for your dream...</p>
        <p className="text-[var(--text-muted)] text-xs">This is where the healing begins</p>
      </div>
    );
  }

  if (!data?.endings || data.endings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <p className="text-[var(--text-secondary)]">Could not generate endings.</p>
        <button
          onClick={() => { setLoading(true); fetchRescripts(); }}
          className="px-6 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent)]/90 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const labels = ["Mastery", "Transformation", "Safety"];
  const icons = ["⚡", "🦋", "🏡"];
  const colors = ["var(--accent)", "var(--accent-warm)", "var(--success)"];

  const ending = selectedEnding !== null ? data.endings[selectedEnding] : null;

  return (
    <div className="w-full max-w-2xl space-y-6 animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
          Rescript Your Dream
        </h2>
        <p className="text-[var(--text-secondary)] text-sm">
          Choose how you want your dream to end. Each approach is backed by IRT research.
        </p>
      </div>

      {/* Ending selector */}
      <div className="grid grid-cols-3 gap-3">
        {data.endings.map((e, i) => (
          <button
            key={i}
            onClick={() => { setSelectedEnding(i); setActiveScene(0); }}
            className={`relative glass rounded-xl p-4 text-left transition-all cursor-pointer ${
              selectedEnding === i ? "ring-2 glow-border" : "hover:bg-[var(--bg-elevated)]"
            }`}
            style={{
              borderColor: selectedEnding === i ? colors[i] : undefined,
            }}
          >
            {data.recommended === i + 1 && (
              <span className="absolute -top-2 -right-2 text-[10px] bg-[var(--accent)] text-white px-2 py-0.5 rounded-full font-medium">
                Recommended
              </span>
            )}
            <div className="text-lg mb-2">{icons[i]}</div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
              {labels[i]}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">{e.title}</p>
          </button>
        ))}
      </div>

      {/* Recommendation reason */}
      {data.recommendation_reason && (
        <p className="text-xs text-[var(--text-muted)] text-center italic">
          {data.recommendation_reason}
        </p>
      )}

      {/* Selected ending detail */}
      {ending && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {ending.description}
            </p>
          </div>

          {/* Scene viewer */}
          {ending.scenes && ending.scenes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Scene-by-Scene Visualization
              </h3>

              {/* Scene tabs */}
              <div className="flex gap-2">
                {ending.scenes.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveScene(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      activeScene === i
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {/* Active scene */}
              <div className="glass rounded-xl p-5 space-y-4 animate-fade-in" key={activeScene}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--accent)] uppercase tracking-wider">
                    Scene {ending.scenes[activeScene].scene_number || activeScene + 1}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {ending.scenes[activeScene].duration_seconds}s
                    {ending.scenes[activeScene].mood && ` · ${ending.scenes[activeScene].mood}`}
                  </span>
                </div>

                <div className="bg-[var(--bg-deep)] rounded-lg p-4 border-l-2 border-[var(--accent-warm)]">
                  <span className="text-[10px] font-medium text-[var(--accent-warm)] uppercase tracking-wider block mb-2">
                    Visual
                  </span>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {ending.scenes[activeScene].visual_description}
                  </p>
                </div>

                <div className="bg-[var(--bg-deep)] rounded-lg p-4 border-l-2 border-[var(--accent)]">
                  <span className="text-[10px] font-medium text-[var(--accent)] uppercase tracking-wider block mb-2">
                    Narration
                  </span>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed italic">
                    &ldquo;{ending.scenes[activeScene].narration}&rdquo;
                  </p>
                </div>
              </div>

              {/* Scene navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setActiveScene(Math.max(0, activeScene - 1))}
                  disabled={activeScene === 0}
                  className="text-sm text-[var(--accent)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setActiveScene(Math.min(ending.scenes.length - 1, activeScene + 1))}
                  disabled={activeScene === ending.scenes.length - 1}
                  className="text-sm text-[var(--accent)] disabled:text-[var(--text-muted)] disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Video Generation */}
      {videoScenes ? (
        <DreamPlayer
          scenes={videoScenes}
          totalDuration={videoTotalDuration}
          endingTitle={ending?.title || "Your New Ending"}
        />
      ) : (
        <div className="glass rounded-xl p-6 text-center space-y-3">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Generate Your Rehearsal Video
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            DreamAI will create a personalized immersive experience with AI-generated imagery
            and calming narration. Watch with earbuds before sleep each night.
          </p>
          <div className="pt-2">
            <button
              onClick={async () => {
                if (!ending || selectedEnding === null) return;
                setGeneratingVideo(true);
                try {
                  const endingTypes = ["mastery", "transformation", "safety"];
                  const res = await fetch("/api/generate-scenes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      scenes: ending.scenes,
                      endingType: endingTypes[selectedEnding] || "mastery",
                    }),
                  });
                  const result = await res.json();
                  if (result.scenes) {
                    setVideoScenes(result.scenes);
                    setVideoTotalDuration(result.total_duration || 0);
                  }
                } catch {
                  // Silently fail -- user can retry
                }
                setGeneratingVideo(false);
              }}
              disabled={generatingVideo}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] text-white font-medium hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingVideo ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Imagery...
                </>
              ) : (
                "Generate Rehearsal Video"
              )}
            </button>
          </div>
          {generatingVideo && (
            <p className="text-xs text-[var(--text-muted)] animate-fade-in">
              Creating {ending?.scenes?.length || 0} cinematic scenes with AI... this takes about 30 seconds
            </p>
          )}
        </div>
      )}
    </div>
  );
}
