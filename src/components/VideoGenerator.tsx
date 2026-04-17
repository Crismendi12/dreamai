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

interface GeneratedScene {
  scene_number: number;
  video_url: string | null;
  narration: string;
  duration_seconds: number;
  mood: string;
  visual_description: string;
  error?: string;
}

interface VideoGeneratorProps {
  scenes: Scene[];
  endingType: string;
  endingTitle: string;
  onComplete: () => void;
}

export default function VideoGenerator({ scenes, endingType, endingTitle, onComplete }: VideoGeneratorProps) {
  const [phase, setPhase] = useState<"generating" | "done">("generating");
  const [completedScenes, setCompletedScenes] = useState<GeneratedScene[]>([]);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Timer for user feedback
  useEffect(() => {
    if (phase !== "generating") return;
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Single API call that blocks until all videos are ready
  useEffect(() => {
    const generate = async () => {
      try {
        const res = await fetch("/api/generate-scenes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenes, endingType }),
        });
        const data = await res.json();

        if (data.error) {
          if (data.error.includes("balance") || data.error.includes("locked")) {
            setGenerationError("Video generation service needs credits. Please top up at fal.ai/dashboard/billing");
          } else {
            setGenerationError(data.error);
          }
        } else if (data.scenes) {
          setCompletedScenes(data.scenes);
        }
      } catch {
        setGenerationError("Connection error -- please check your internet and try again");
      }
      setPhase("done");
    };
    generate();
  }, [scenes, endingType]);

  const totalScenes = scenes.length;
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  // Generating phase -- show cinematic loading
  if (phase === "generating") {
    return (
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-semibold text-[var(--text-primary)]">
            Creating Your Dream Film
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">
            AI is generating {totalScenes} cinematic POV scenes with Kling 2.6
          </p>
        </div>

        {/* Animated progress */}
        <div className="space-y-3">
          <div className="w-full h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] animate-pulse"
              style={{ width: "60%" }}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center">
            Rendering scenes... {timeStr} elapsed
          </p>
        </div>

        {/* Scene cards */}
        <div className="grid grid-cols-2 gap-3">
          {scenes.map((s, i) => (
            <div key={i} className="glass rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-muted)]">
                  Scene {s.scene_number || i + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span className="text-xs text-[var(--accent)]">Rendering</span>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                {s.visual_description}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center italic">
          Each scene takes ~2 minutes to render. All {totalScenes} generate in parallel.
        </p>
      </div>
    );
  }

  // Done -- sort scenes and show player
  const sortedScenes = [...completedScenes].sort((a, b) => a.scene_number - b.scene_number);
  const totalDuration = sortedScenes.reduce((sum, s) => sum + s.duration_seconds, 0);
  const hasVideos = sortedScenes.some((s) => s.video_url);

  if (!hasVideos) {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in max-w-md text-center">
        {generationError ? (
          <>
            <div className="w-14 h-14 rounded-full bg-[var(--danger)]/10 flex items-center justify-center">
              <svg className="w-7 h-7 text-[var(--danger)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-[var(--text-primary)] font-medium">Video Generation Unavailable</p>
              <p className="text-sm text-[var(--text-secondary)]">{generationError}</p>
            </div>
            {generationError.includes("credits") || generationError.includes("balance") || generationError.includes("billing") ? (
              <a
                href="https://fal.ai/dashboard/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent)]/90 transition-colors"
              >
                Add Credits at fal.ai
              </a>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent)]/90 transition-colors cursor-pointer"
              >
                Retry
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-[var(--text-secondary)]">Video generation failed. Please try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent)]/90 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DreamPlayer
        scenes={sortedScenes}
        totalDuration={totalDuration}
        endingTitle={endingTitle}
      />
      <div className="flex justify-center">
        <button
          onClick={onComplete}
          className="px-8 py-3 rounded-xl btn-primary cursor-pointer"
        >
          Continue to Your Healing Plan
        </button>
      </div>
    </div>
  );
}
