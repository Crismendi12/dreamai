"use client";

import { useState, useRef, useCallback } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string) => void;
}

export default function VoiceRecorder({ onTranscriptReady }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [liveText, setLiveText] = useState("");
  const [mode, setMode] = useState<"idle" | "recording" | "review">("idle");
  const [micError, setMicError] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

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

      // Try Web Speech API for live transcription
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        let finalText = "";

        recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalText += result[0].transcript + " ";
            } else {
              interim += result[0].transcript;
            }
          }
          setLiveText(finalText + interim);
          setTranscript(finalText);
        };

        recognition.onerror = () => {
          // Speech recognition failed, user can still type
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      setIsRecording(true);
      setMode("recording");
    } catch {
      setMicError(true);
      setMode("review");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setMode("review");
  }, []);

  const handleSubmit = () => {
    if (transcript.trim().length > 10) {
      onTranscriptReady(transcript.trim());
    }
  };

  if (mode === "idle") {
    return (
      <div className="flex flex-col items-center gap-8 animate-fade-in">
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
            Record Your Dream
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md">
            Speak freely about what you experienced. Every detail matters -- what you saw, heard, felt. Take your time.
          </p>
        </div>

        <button
          onClick={startRecording}
          className="group relative w-28 h-28 rounded-full bg-[var(--accent)] hover:bg-[var(--accent)]/90 transition-all duration-300 flex items-center justify-center cursor-pointer"
        >
          <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-300" />
          <svg className="w-10 h-10 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        </button>

        <p className="text-xs text-[var(--text-muted)]">
          Or type your dream below
        </p>
        <button
          onClick={() => setMode("review")}
          className="text-sm text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors cursor-pointer"
        >
          I prefer to type
        </button>
      </div>
    );
  }

  if (mode === "recording") {
    return (
      <div className="flex flex-col items-center gap-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
            Listening...
          </h2>
          <p className="text-[var(--text-secondary)]">
            Speak about your dream. Press stop when you're done.
          </p>
        </div>

        <button
          onClick={stopRecording}
          className="relative w-28 h-28 rounded-full bg-[var(--danger)] flex items-center justify-center cursor-pointer"
        >
          <div className="absolute inset-0 rounded-full bg-[var(--danger)] recording-pulse" />
          <svg className="w-8 h-8 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>

        {liveText && (
          <div className="glass rounded-xl p-4 max-w-lg w-full max-h-48 overflow-y-auto">
            <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed">
              {liveText}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Review mode
  return (
    <div className="flex flex-col gap-6 w-full max-w-lg animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
          {transcript ? "Your Dream Narrative" : "Type Your Dream"}
        </h2>
        <p className="text-[var(--text-secondary)] text-sm">
          {transcript ? "Review and edit if needed, then submit for analysis." : "Describe your dream in as much detail as you can."}
        </p>
      </div>

      {micError && (
        <div className="px-4 py-3 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] text-sm text-center animate-fade-in">
          Microphone not available. You can type your dream instead.
        </div>
      )}

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Describe your dream in as much detail as you can remember. What did you see? Who was there? What happened? How did it make you feel?"
        className="w-full h-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-all text-sm leading-relaxed"
      />

      <div className="flex gap-3">
        <button
          onClick={() => { setMode("idle"); setTranscript(""); setLiveText(""); setMicError(false); }}
          className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors text-sm cursor-pointer"
        >
          {micError ? "Try Mic Again" : "Re-record"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={transcript.trim().length < 10}
          className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent)]/90 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          Analyze Dream
        </button>
      </div>
    </div>
  );
}
