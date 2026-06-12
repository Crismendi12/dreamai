"use client";

import { useState, useEffect } from "react";
import DreamPlayer from "./DreamPlayer";
import { Icon } from "@/lib/icons";
import { apiFetch } from "@/lib/api";

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
  // renderedCount = how many scenes have finished "rendering"; the scene at index
  // === renderedCount is the one currently rendering. dataReady = the generate()
  // call has returned. We gate the player on the animation having stepped through
  // EVERY scene, so it never gets cut off when generation resolves quickly.
  const [renderedCount, setRenderedCount] = useState(0);
  const [dataReady, setDataReady] = useState(false);

  const totalScenes = scenes.length;
  const STEP_MS = 1500;

  // Timer for user feedback
  useEffect(() => {
    if (phase !== "generating") return;
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Single API call that blocks until all videos are ready. Mark dataReady when it
  // returns (don't reveal the player yet — the animation gate below does that).
  useEffect(() => {
    const generate = async () => {
      try {
        const res = await apiFetch("/api/generate-scenes", {
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
      setDataReady(true);
    };
    generate();
  }, [scenes, endingType]);

  // Step through each scene one at a time, holding the LAST one as "rendering"
  // until generation returns. This guarantees every scene animates through.
  useEffect(() => {
    if (phase !== "generating") return;
    if (renderedCount >= totalScenes - 1) return; // hold the last scene rendering
    const t = setTimeout(() => setRenderedCount((c) => c + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [phase, renderedCount, totalScenes]);

  // Finish: once data is ready AND the animation reached the last scene, mark it
  // rendered and reveal the player after a calm beat. Errors short-circuit.
  useEffect(() => {
    if (phase !== "generating" || !dataReady) return;
    if (generationError) {
      const t = setTimeout(() => setPhase("done"), 300);
      return () => clearTimeout(t);
    }
    if (renderedCount < totalScenes - 1) return; // wait for the walk-through to finish
    const t1 = setTimeout(() => setRenderedCount(totalScenes), 450);
    const t2 = setTimeout(() => setPhase("done"), 1150);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase, dataReady, generationError, renderedCount, totalScenes]);

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

        {/* Per-scene status list — same smooth opacity-fade pattern as the
            analyzing screen (.live-steps / .live-row .on/.done) so states cross-
            fade instead of popping. Driven by activeIdx. */}
        <div className="live-steps" style={{ marginTop: "8px" }}>
          {scenes.map((s, i) => {
            const done = i < renderedCount;
            const rendering = i === renderedCount;
            const status = done ? "Rendered" : rendering ? "Rendering" : "Queued";
            return (
              <div key={i} className={`live-row ${done ? "done" : ""} ${rendering ? "on" : ""}`}>
                <span className="live-ic">
                  {done ? (
                    <Icon name="check" size={14} />
                  ) : rendering ? (
                    <span className="live-spin" />
                  ) : (
                    <Icon name="play" size={14} />
                  )}
                </span>
                <span className="live-t">Scene {s.scene_number || i + 1} — {status}</span>
              </div>
            );
          })}
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

  // Show the player whenever scenes came back — DreamPlayer renders real video when
  // a scene has a video_url, or an on-brand calm placeholder (gradient + narration)
  // when it doesn't yet. Only show the error state on a real generation error or
  // when nothing came back at all.
  if (generationError || sortedScenes.length === 0) {
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
