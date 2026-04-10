"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import DreamPlayer from "./DreamPlayer";

interface Scene {
  scene_number: number;
  visual_description: string;
  narration: string;
  duration_seconds: number;
  mood: string;
}

interface QueuedScene {
  scene_number: number;
  request_id: string | null;
  narration: string;
  duration_seconds: number;
  mood: string;
  visual_description: string;
}

interface GeneratedScene {
  scene_number: number;
  video_url: string | null;
  image_url: null;
  narration: string;
  duration_seconds: number;
  mood: string;
  visual_description: string;
}

interface VideoGeneratorProps {
  scenes: Scene[];
  endingType: string;
  endingTitle: string;
  onComplete: () => void;
}

export default function VideoGenerator({ scenes, endingType, endingTitle, onComplete }: VideoGeneratorProps) {
  const [phase, setPhase] = useState<"submitting" | "generating" | "done">("submitting");
  const [queuedScenes, setQueuedScenes] = useState<QueuedScene[]>([]);
  const [completedScenes, setCompletedScenes] = useState<GeneratedScene[]>([]);
  const [sceneStatuses, setSceneStatuses] = useState<Record<number, string>>({});
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef<Set<number>>(new Set());

  // Step 1: Submit all scenes to the queue
  useEffect(() => {
    const submit = async () => {
      try {
        const res = await fetch("/api/generate-scenes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenes, endingType }),
        });
        const data = await res.json();
        if (data.scenes) {
          setQueuedScenes(data.scenes);
          setPhase("generating");
          // Initialize statuses
          const statuses: Record<number, string> = {};
          data.scenes.forEach((s: QueuedScene) => {
            statuses[s.scene_number] = s.request_id ? "IN_QUEUE" : "FAILED";
          });
          setSceneStatuses(statuses);
        }
      } catch {
        setPhase("done");
      }
    };
    submit();
  }, [scenes, endingType]);

  // Step 2: Poll for completion
  const pollScenes = useCallback(async () => {
    if (queuedScenes.length === 0) return;

    const pending = queuedScenes.filter(
      (s) => s.request_id && !completedRef.current.has(s.scene_number)
    );

    if (pending.length === 0) {
      // All done
      if (pollingRef.current) clearInterval(pollingRef.current);
      setPhase("done");
      return;
    }

    // Check each pending scene
    await Promise.all(
      pending.map(async (scene) => {
        try {
          const res = await fetch("/api/scene-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ request_id: scene.request_id }),
          });
          const data = await res.json();

          setSceneStatuses((prev) => ({ ...prev, [scene.scene_number]: data.status }));

          if (data.status === "COMPLETED" && data.video_url) {
            completedRef.current.add(scene.scene_number);
            setCompletedScenes((prev) => [
              ...prev,
              {
                scene_number: scene.scene_number,
                video_url: data.video_url,
                image_url: null,
                narration: scene.narration,
                duration_seconds: scene.duration_seconds,
                mood: scene.mood,
                visual_description: scene.visual_description,
              },
            ]);
          } else if (data.status === "FAILED") {
            completedRef.current.add(scene.scene_number);
            setCompletedScenes((prev) => [
              ...prev,
              {
                scene_number: scene.scene_number,
                video_url: null,
                image_url: null,
                narration: scene.narration,
                duration_seconds: scene.duration_seconds,
                mood: scene.mood,
                visual_description: scene.visual_description,
              },
            ]);
          }
        } catch {
          // Ignore poll errors, retry next cycle
        }
      })
    );
  }, [queuedScenes]);

  useEffect(() => {
    if (phase !== "generating") return;
    // Poll every 5 seconds
    pollScenes();
    pollingRef.current = setInterval(pollScenes, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [phase, pollScenes]);

  const totalScenes = scenes.length;
  const completedCount = completedRef.current.size;
  const progressPct = totalScenes > 0 ? (completedCount / totalScenes) * 100 : 0;

  // Generating phase -- show cinematic loading
  if (phase !== "done") {
    return (
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
            Creating Your Dream Film
          </h2>
          <p className="text-[var(--text-secondary)] text-sm">
            AI is generating {totalScenes} cinematic POV scenes with Kling v2
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="w-full h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] transition-all duration-1000"
              style={{ width: `${Math.max(progressPct, phase === "submitting" ? 5 : 10)}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] text-center">
            {phase === "submitting"
              ? "Submitting scenes to AI pipeline..."
              : `${completedCount} of ${totalScenes} scenes ready`}
          </p>
        </div>

        {/* Per-scene status */}
        <div className="grid grid-cols-2 gap-3">
          {(queuedScenes.length > 0 ? queuedScenes : scenes).map((s, i) => {
            const num = "scene_number" in s ? s.scene_number : i + 1;
            const status = sceneStatuses[num] || "WAITING";
            const isComplete = status === "COMPLETED";
            const isFailed = status === "FAILED";
            const isProcessing = status === "IN_PROGRESS";

            return (
              <div
                key={num}
                className={`glass rounded-xl p-4 space-y-2 transition-all ${isComplete ? "border border-[var(--success)]/30" : ""}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    Scene {num}
                  </span>
                  {isComplete ? (
                    <span className="text-xs text-[var(--success)] font-medium">Ready</span>
                  ) : isFailed ? (
                    <span className="text-xs text-[var(--danger)] font-medium">Failed</span>
                  ) : isProcessing ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                      <span className="text-xs text-[var(--accent)]">Rendering</span>
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">Queued</span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  {s.visual_description}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center italic">
          Each scene takes 1-3 minutes to render. You can wait here or come back.
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
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <p className="text-[var(--text-secondary)]">Video generation failed. Please try again.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent)]/90 transition-colors cursor-pointer"
        >
          Retry
        </button>
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
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] text-white font-medium hover:opacity-90 transition-all cursor-pointer"
        >
          Continue to Your Healing Plan
        </button>
      </div>
    </div>
  );
}
