"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface GeneratedScene {
  scene_number: number;
  image_url: string | null;
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
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const elapsedRef = useRef(0);

  const scene = scenes[currentScene];

  const speakNarration = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85;
    utterance.pitch = 0.9;
    utterance.volume = 1;

    // Try to find a calm, warm voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) => v.name.includes("Samantha") || v.name.includes("Karen") || v.name.includes("Daniel") || v.name.includes("Google UK English Female")
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
        // End of video
        setIsPlaying(false);
        setCurrentScene(scenes.length - 1);
        setProgress(100);
        window.speechSynthesis?.cancel();
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      setCurrentScene(index);
      setSceneProgress(0);
      if (isPlaying) {
        speakNarration(scenes[index].narration);
      }
    },
    [scenes, isPlaying, speakNarration]
  );

  const play = useCallback(() => {
    setIsPlaying(true);
    speakNarration(scenes[currentScene].narration);
  }, [currentScene, scenes, speakNarration]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    window.speechSynthesis?.cancel();
  }, []);

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
      const sp = Math.min(100, (elapsedRef.current / sceneDuration) * 100);
      setSceneProgress(sp);

      // Calculate overall progress
      const prevDuration = scenes
        .slice(0, currentScene)
        .reduce((s, sc) => s + sc.duration_seconds, 0);
      const overallElapsed = prevDuration + (elapsedRef.current / 1000);
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
    empowering: "from-amber-900/40 to-yellow-600/20",
    calm: "from-blue-900/40 to-slate-800/20",
    warm: "from-orange-900/40 to-amber-700/20",
    peaceful: "from-indigo-900/40 to-blue-800/20",
    hopeful: "from-rose-900/30 to-amber-600/20",
  };

  return (
    <div className="w-full max-w-2xl space-y-4 animate-slide-up">
      <div className="text-center space-y-1 mb-2">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
          Your Rehearsal Experience
        </h2>
        <p className="text-[var(--text-secondary)] text-sm">
          {endingTitle} -- Watch with earbuds for best experience
        </p>
      </div>

      {/* Video Player */}
      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video group">
        {/* Scene Image with Ken Burns */}
        {scene.image_url ? (
          <img
            key={currentScene}
            src={scene.image_url}
            alt={scene.visual_description}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
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
            <p className="text-white/60 text-sm text-center px-8 italic">
              {scene.visual_description}
            </p>
          </div>
        )}

        {/* Mood overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${moodGradients[scene.mood] || moodGradients.calm} pointer-events-none opacity-40`}
        />

        {/* Narration overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <p
            key={`narr-${currentScene}`}
            className={`text-white text-sm leading-relaxed italic transition-opacity duration-700 ${
              isSpeaking ? "opacity-100" : "opacity-70"
            }`}
            style={{ animation: "fade-in 0.8s ease-out" }}
          >
            &ldquo;{scene.narration}&rdquo;
          </p>
        </div>

        {/* Scene counter */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-xs font-medium">
            Scene {currentScene + 1} / {scenes.length}
          </span>
        </div>

        {/* Mood indicator */}
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white/70 text-xs capitalize">{scene.mood}</span>
        </div>

        {/* Play/Pause overlay */}
        <button
          onClick={isPlaying ? pause : play}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            {isPlaying ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="w-full h-1.5 bg-[var(--bg-card)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Scene dots */}
        <div className="flex justify-between px-1">
          {scenes.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                goToScene(i);
                elapsedRef.current = 0;
              }}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                i === currentScene
                  ? "bg-[var(--accent)] scale-125"
                  : i < currentScene
                  ? "bg-[var(--accent)]/50"
                  : "bg-[var(--bg-elevated)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => { goToScene(Math.max(0, currentScene - 1)); elapsedRef.current = 0; }}
          disabled={currentScene === 0}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          onClick={isPlaying ? pause : play}
          className="w-12 h-12 rounded-full bg-[var(--accent)] text-white flex items-center justify-center hover:bg-[var(--accent)]/90 transition-colors cursor-pointer"
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => { goToScene(Math.min(scenes.length - 1, currentScene + 1)); elapsedRef.current = 0; }}
          disabled={currentScene === scenes.length - 1}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Instructions */}
      <div className="glass rounded-xl p-4 text-center space-y-2">
        <p className="text-xs text-[var(--text-muted)]">
          For best results, watch this experience each night before sleep with earbuds in.
          Focus on the imagery and narration. Over 7-10 days, your brain will begin
          integrating this new ending into your dream patterns.
        </p>
      </div>
    </div>
  );
}
