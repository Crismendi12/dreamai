"use client";

import { useState, useEffect } from "react";
import DreamPlayer from "./DreamPlayer";
import { Icon } from "@/lib/icons";

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
  image_url: string | null;
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
      <div className="analysing animate-fade-in">
        {/* Morphing orb hero */}
        <div className="orb-stage">
          <div className="orb-glow" />
          <div className="orb" />
          <div className="spark s1"><Icon name="spark" /></div>
          <div className="spark s2"><Icon name="spark" /></div>
          <div className="spark s3"><Icon name="spark" /></div>
        </div>

        <h2 className="analyse-head">Creating Your Dream Film</h2>
        <p className="subhead" style={{ marginTop: "-14px", marginBottom: "20px" }}>
          AI is generating {totalScenes} cinematic POV scenes with Kling 2.6
        </p>

        {/* Decorative indeterminate progress track (fixed 60%, not real progress) */}
        <div style={{ width: "100%", maxWidth: "360px" }}>
          <div
            style={{
              width: "100%",
              height: "3px",
              borderRadius: "999px",
              background: "var(--line)",
              overflow: "hidden",
            }}
          >
            <div
              className="animate-pulse"
              style={{
                width: "60%",
                height: "100%",
                borderRadius: "999px",
                background: "linear-gradient(90deg, var(--accent), var(--accent-l))",
              }}
            />
          </div>
          <p
            style={{
              fontFamily: "var(--font-mono), var(--mono)",
              fontSize: "12px",
              color: "var(--faint)",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            Rendering scenes... {timeStr} elapsed
          </p>
        </div>

        {/* Per-scene status list */}
        <div className="plan-steps" style={{ width: "100%", maxWidth: "360px", marginTop: "8px", textAlign: "left" }}>
          {scenes.map((s, i) => (
            <div key={i} className="plan-row">
              <div className="plan-ic"><Icon name="play" /></div>
              <div style={{ flex: 1 }}>
                <div className="plan-t">Scene {s.scene_number || i + 1}</div>
                <div className="plan-s" style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span
                    className="animate-pulse"
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "999px",
                      background: "var(--accent)",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ color: "var(--accent)" }}>Rendering</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            fontSize: "12.5px",
            color: "var(--faint)",
            textAlign: "center",
            fontStyle: "italic",
            marginTop: "18px",
          }}
        >
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
      <div className="panel animate-fade-in" style={{ maxWidth: "440px", textAlign: "center" }}>
        {generationError ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "999px",
                background: "rgba(192,57,43,0.1)",
                color: "var(--danger)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="alert" size={28} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <p style={{ fontWeight: 600, color: "var(--text)" }}>Video Generation Unavailable</p>
              <p style={{ fontSize: "14px", color: "var(--muted)" }}>{generationError}</p>
            </div>
            {generationError.includes("credits") || generationError.includes("balance") || generationError.includes("billing") ? (
              <a
                href="https://fal.ai/dashboard/billing"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--brand"
              >
                Add Credits at fal.ai
                <Icon name="arrowright" />
              </a>
            ) : (
              <button onClick={() => window.location.reload()} className="btn btn--brand">
                <Icon name="refresh" />
                Retry
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "18px" }}>
            <p style={{ color: "var(--muted)" }}>Video generation failed. Please try again.</p>
            <button onClick={() => window.location.reload()} className="btn btn--brand">
              <Icon name="refresh" />
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DreamPlayer
        scenes={sortedScenes.map((s) => ({ ...s, image_url: null }))}
        totalDuration={totalDuration}
        endingTitle={endingTitle}
      />
      <div className="flex justify-center">
        <button onClick={onComplete} className="btn btn--brand">
          Continue to Your Healing Plan
          <Icon name="arrowright" />
        </button>
      </div>
    </div>
  );
}
