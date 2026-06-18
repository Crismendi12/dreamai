"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@/lib/icons";

interface GeneratedScene {
  scene_number: number;
  image_url: string | null;
  video_url?: string | null;
  narration: string;
  duration_seconds: number;
  mood: string;
  visual_description: string;
}

interface DreamPlayerProps {
  scenes: GeneratedScene[];
  totalDuration: number;
  endingTitle: string;
}

export default function DreamPlayer({ scenes, totalDuration, endingTitle }: DreamPlayerProps) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [showEndCard, setShowEndCard] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nextVideoRef = useRef<HTMLVideoElement | null>(null);
  const elapsedRef = useRef(0);

  const scene = scenes[currentScene];
  const nextScene = currentScene < scenes.length - 1 ? scenes[currentScene + 1] : null;

  const speakNarration = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 0.85;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.includes("Samantha") ||
        v.name.includes("Karen") ||
        v.name.includes("Daniel") ||
        v.name.includes("Google UK English Female")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const goToScene = useCallback(
    (index: number) => {
      if (index >= scenes.length) {
        setIsPlaying(false);
        setProgress(100);
        setShowEndCard(true);
        window.speechSynthesis?.cancel();
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      // Crossfade transition
      setTransitioning(true);
      setTimeout(() => {
        setCurrentScene(index);
        setTransitioning(false);
        elapsedRef.current = 0;
        if (isPlaying) {
          speakNarration(scenes[index].narration);
        }
      }, 800);
    },
    [scenes, isPlaying, speakNarration]
  );

  const play = useCallback(() => {
    setIsPlaying(true);
    setShowEndCard(false);
    speakNarration(scenes[currentScene].narration);
    if (videoRef.current) {
      videoRef.current.play();
    }
  }, [currentScene, scenes, speakNarration]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    window.speechSynthesis?.cancel();
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  // Sync video playback with scene changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) videoRef.current.play();
    }
  }, [currentScene, isPlaying]);

  // Preload next video
  useEffect(() => {
    if (nextVideoRef.current && nextScene?.video_url) {
      nextVideoRef.current.src = nextScene.video_url;
      nextVideoRef.current.load();
    }
  }, [nextScene]);

  // Timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    elapsedRef.current = 0;
    const sceneDuration = scene.duration_seconds * 1000;

    timerRef.current = setInterval(() => {
      elapsedRef.current += 100;

      const prevDuration = scenes
        .slice(0, currentScene)
        .reduce((s, sc) => s + sc.duration_seconds, 0);
      const overallElapsed = prevDuration + elapsedRef.current / 1000;
      setProgress(Math.min(100, (overallElapsed / totalDuration) * 100));

      if (elapsedRef.current >= sceneDuration) {
        goToScene(currentScene + 1);
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentScene, scene, scenes, totalDuration, goToScene]);

  // Load voices
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const moodGradients: Record<string, string> = {
    empowering: "from-[#1E2A4A] to-[#0E1526]",
    calm: "from-[#16203A] to-[#0E1526]",
    warm: "from-[#1F2746] to-[#0E1526]",
    peaceful: "from-[#192340] to-[#0E1526]",
    hopeful: "from-[#24315A] to-[#0E1526]",
  };

  return (
    <div className="w-full max-w-3xl space-y-4 animate-slide-up">
      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.12) translate(-1.5%, -1%); }
          100% { transform: scale(1.08) translate(1%, -0.5%); }
        }
      `}</style>
      <div className="text-center space-y-1 mb-2">
        <h2 className="serif-hero text-[var(--text)]" style={{ fontSize: "clamp(26px, 5vw, 34px)" }}>
          Your Rehearsal Experience
        </h2>
        <p className="subhead">
          {endingTitle} · Watch with earbuds for best experience
        </p>
      </div>

      {/* Cinematic Player — light frame around a dark video stage */}
      <div className="rounded-[20px] bg-[var(--bg-2)] border border-[var(--line)] p-2 shadow-[0_12px_30px_-24px_rgba(26,26,24,0.4)]">
      <div className="relative rounded-2xl overflow-hidden bg-[#1A1A18] aspect-video group">
        {/* Main video/visual */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${transitioning ? "opacity-0" : "opacity-100"}`}
        >
          {scene.video_url ? (
            <video
              ref={videoRef}
              key={`video-${currentScene}`}
              src={scene.video_url}
              className="absolute inset-0 w-full h-full object-cover"
              muted
              loop
              playsInline
              autoPlay={isPlaying}
            />
          ) : scene.image_url ? (
            <img
              key={`img-${currentScene}`}
              src={scene.image_url}
              alt={scene.visual_description}
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                animation: isPlaying
                  ? `kenburns ${scene.duration_seconds}s ease-in-out forwards`
                  : "none",
              }}
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${moodGradients[scene.mood] || moodGradients.calm} flex items-center justify-center`}
            >
              <p className="text-white/50 text-sm text-center px-12 italic max-w-md">
                {scene.visual_description}
              </p>
            </div>
          )}
        </div>

        {/* Preload next video (hidden) */}
        {nextScene?.video_url && (
          <video
            ref={nextVideoRef}
            className="hidden"
            muted
            playsInline
            preload="auto"
          />
        )}

        {/* Crossfade black overlay during transitions */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-700 pointer-events-none ${transitioning ? "opacity-80" : "opacity-0"}`}
        />

        {/* Cinematic top/bottom bars (letterbox feel) */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

        {/* Narration subtitle */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          <p
            key={`narr-${currentScene}`}
            className={`text-white text-base leading-relaxed text-center max-w-lg mx-auto transition-opacity duration-700 ${
              isSpeaking ? "opacity-100" : "opacity-60"
            }`}
            style={{
              animation: "fade-in 1s ease-out",
              textShadow: "0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)",
            }}
          >
            &ldquo;{scene.narration}&rdquo;
          </p>
        </div>

        {/* Scene counter (subtle) */}
        <div className="absolute top-3 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <span
            className="text-white/60 text-xs font-medium"
            style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
          >
            {currentScene + 1} / {scenes.length}
          </span>
        </div>

        {/* HD Video badge */}
        {scene.video_url && (
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] text-white text-[11px] font-semibold px-2.5 py-1 shadow-[0_2px_8px_rgba(30,58,138,0.4)]">
              <Icon name="spark" size={11} />
              AI Video
            </span>
          </div>
        )}

        {/* End card */}
        {showEndCard && (
          <div className="absolute inset-0 bg-[var(--bg-2)]/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 px-8 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-[var(--green-soft)] text-[var(--green)] flex items-center justify-center">
              <Icon name="check" size={26} />
            </div>
            <p className="serif-hero text-[var(--text)]" style={{ fontSize: "clamp(22px, 4vw, 28px)" }}>
              Session Complete
            </p>
            <p className="text-[var(--muted)] text-sm max-w-sm text-center leading-relaxed">
              Watch again tomorrow night before sleep. Repetition rewires your dream patterns.
            </p>
            <button
              onClick={() => {
                setCurrentScene(0);
                setProgress(0);
                setShowEndCard(false);
                elapsedRef.current = 0;
                play();
              }}
              className="btn btn--ghost mt-2"
            >
              <Icon name="refresh" size={18} />
              Watch Again
            </button>
          </div>
        )}

        {/* Play/Pause overlay (only on hover, minimal) */}
        {!showEndCard && (
          <button
            onClick={isPlaying ? pause : play}
            className="absolute inset-0 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--accent)]/90 backdrop-blur-sm flex items-center justify-center text-white shadow-[0_8px_24px_rgba(30,58,138,0.45)]">
              {isPlaying ? (
                <Icon name="pause" size={26} />
              ) : (
                <Icon name="play" size={26} className="ml-0.5" />
              )}
            </div>
          </button>
        )}
      </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {/* Progress bar */}
        <div className="relative w-full h-1.5 bg-[var(--line)] rounded-full overflow-hidden cursor-pointer group/bar">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-d)] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
          {/* Scene markers */}
          {scenes.map((_, i) => {
            if (i === 0) return null;
            const markerPos = scenes.slice(0, i).reduce((s, sc) => s + sc.duration_seconds, 0) / totalDuration * 100;
            return (
              <div
                key={i}
                className="absolute top-0 h-full w-px bg-[var(--accent-l)]"
                style={{ left: `${markerPos}%` }}
              />
            );
          })}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToScene(Math.max(0, currentScene - 1))}
              disabled={currentScene === 0}
              className="w-11 h-11 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-25 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Icon name="arrowleft" size={18} />
            </button>

            <button
              onClick={isPlaying ? pause : play}
              className="w-11 h-11 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:bg-[var(--accent-d)] transition-colors cursor-pointer shadow-[0_6px_18px_-8px_rgba(30,58,138,0.7)]"
            >
              {isPlaying ? (
                <Icon name="pause" size={18} />
              ) : (
                <Icon name="play" size={18} className="ml-0.5" />
              )}
            </button>

            <button
              onClick={() => goToScene(Math.min(scenes.length - 1, currentScene + 1))}
              disabled={currentScene === scenes.length - 1}
              className="w-11 h-11 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-25 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <Icon name="arrowright" size={18} />
            </button>
          </div>

          <span className="text-xs text-[var(--faint)] font-mono">
            Scene {currentScene + 1} of {scenes.length}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="panel text-center">
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Watch this experience each night before sleep with earbuds. Focus on the imagery and narration.
          Over 7-10 days, your brain will integrate this new ending into your dream patterns.
        </p>
      </div>
    </div>
  );
}
