"use client";

import { useState, useEffect } from "react";

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
}

export default function RescriptingView({ analysis, followUpAnswers }: RescriptingViewProps) {
  const [data, setData] = useState<RescriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEnding, setSelectedEnding] = useState<number | null>(null);
  const [activeScene, setActiveScene] = useState(0);

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
      setData(result.endings);
      if (result.endings?.recommended) {
        setSelectedEnding(result.endings.recommended - 1);
      }
    } catch {
      // Handle error
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

  if (!data?.endings) {
    return <p className="text-[var(--text-secondary)]">Could not generate endings. Please try again.</p>;
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

      {/* CTA */}
      <div className="glass rounded-xl p-6 text-center space-y-3">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          Ready for Your Rehearsal Video
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          In the full version, DreamAI will generate a personalized 2-3 minute immersive video
          based on these scenes -- with AI-generated imagery, calming narration, and ambient sound.
          You'll watch it with earbuds before sleep each night.
        </p>
        <div className="pt-2">
          <span className="inline-block px-4 py-2 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-medium border border-[var(--accent)]/20">
            Video Generation Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
}
