"use client";

import { useState, useRef, useCallback } from "react";
import { Icon } from "@/lib/icons";

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string) => void;
}

export default function VoiceRecorder({ onTranscriptReady }: VoiceRecorderProps) {
  const [transcript, setTranscript] = useState("");
  const [mode, setMode] = useState<"idle" | "recording" | "transcribing" | "review">("idle");
  const [micError, setMicError] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start(1000);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);

      setMode("recording");
    } catch {
      setMicError(true);
      setMode("review");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === "inactive") {
      setMode("review");
      return;
    }

    // Wait for the recorder to finish writing chunks
    const recorder = mediaRecorderRef.current;
    await new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
      recorder.stop();
    });
    recorder.stream.getTracks().forEach((t) => t.stop());

    // Build audio blob and send to Whisper for transcription
    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

    if (audioBlob.size < 1000) {
      // Too short, go to typing
      setMode("review");
      return;
    }

    setMode("transcribing");

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.text && data.text.trim().length > 0) {
        setTranscript(data.text.trim());
      }
    } catch {
      // Transcription failed, user can type
    }

    setMode("review");
  }, []);

  const handleSubmit = () => {
    if (transcript.trim().length > 10) {
      onTranscriptReady(transcript.trim());
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (mode === "idle") {
    return (
      <div className="voice animate-fade-in">
        <div className="home-head">
          <h2 className="serif-hero">Record Your Dream</h2>
          <p className="mic-hint max-w-md leading-relaxed">
            Speak freely about what you experienced. Every detail matters -- what you saw, heard, felt. Take your time.
          </p>
        </div>

        <div className="mic-wrap idle">
          <span className="mic-ring" />
          <span className="mic-ring" />
          <span className="mic-ring" />
          <button onClick={startRecording} className="mic-btn" aria-label="Record Your Dream">
            <Icon name="mic" size={44} />
          </button>
        </div>

        <div className="voice-alts">
          <span className="alt-sep">or</span>
          <button onClick={() => setMode("review")} className="linklike">
            <Icon name="keyboard" size={14} />
            I prefer to type
          </button>
        </div>
      </div>
    );
  }

  if (mode === "recording") {
    return (
      <div className="listen animate-fade-in">
        <span className="rec-pill">
          <span className="rec-dot" />
          RECORDING
        </span>

        <div className="wave">
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${(i % 7) * 0.09}s` }} />
          ))}
        </div>

        <button onClick={stopRecording} className="stop-btn" aria-label="Stop recording">
          <Icon name="stop" size={24} />
        </button>

        <span className="text-lg font-mono text-[var(--muted)] tabular-nums mt-4">
          {formatTime(recordingTime)}
        </span>
        <p className="listen-cap">
          Speak about your dream. Press stop when you&apos;re done.
        </p>
      </div>
    );
  }

  if (mode === "transcribing") {
    return (
      <div className="analysing animate-fade-in">
        <div className="orb-stage">
          <div className="orb-glow" />
          <div className="orb" />
          <span className="spark s1"><Icon name="spark" /></span>
          <span className="spark s2"><Icon name="spark" /></span>
          <span className="spark s3"><Icon name="spark" /></span>
        </div>
        <p className="analyse-head">Transcribing your recording...</p>
        <p className="text-xs text-[var(--faint)]">Using AI to convert speech to text</p>
      </div>
    );
  }

  // Review mode
  return (
    <div className="flex flex-col gap-6 w-full max-w-lg animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="serif-hero" style={{ fontSize: "clamp(26px, 5vw, 34px)" }}>
          {transcript ? "Your Dream Narrative" : "Type Your Dream"}
        </h2>
        <p className="subhead" style={{ fontSize: 14 }}>
          {transcript ? "Review and edit if needed, then submit for analysis." : "Describe your dream in as much detail as you can."}
        </p>
      </div>

      {micError && (
        <div
          className="px-4 py-3 rounded-xl text-sm text-center animate-fade-in"
          style={{ background: "var(--amber-soft)", border: "1px solid var(--line)", color: "var(--amber)" }}
        >
          Microphone not available. You can type your dream instead.
        </div>
      )}

      <div className="composer-lg">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Describe your dream in as much detail as you can remember. What did you see? Who was there? What happened? How did it make you feel?"
          className="w-full h-44 bg-transparent border-none p-0 text-[var(--text)] placeholder-[var(--faint)] resize-none focus:outline-none leading-relaxed"
          style={{ fontSize: 17, lineHeight: 1.55 }}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => { setMode("idle"); setTranscript(""); setRecordingTime(0); setMicError(false); }}
          className="btn btn--ghost flex-1"
        >
          {micError ? "Try Mic Again" : "Re-record"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={transcript.trim().length < 10}
          className="btn btn--brand flex-1 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Analyze Dream
        </button>
      </div>
    </div>
  );
}
