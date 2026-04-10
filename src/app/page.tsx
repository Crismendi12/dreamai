"use client";

import { useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import FollowUpChat from "@/components/FollowUpChat";
import DreamDiary from "@/components/DreamDiary";
import RescriptingView from "@/components/RescriptingView";

type Step = "landing" | "record" | "analyzing" | "diary" | "followup" | "rescript";

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<{ q: string; a: string }[]>([]);

  const handleTranscript = async (text: string) => {
    setTranscript(text);
    setStep("analyzing");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      setAnalysis(data.analysis);
      setStep("diary");
    } catch {
      setStep("record");
    }
  };

  const handleFollowUpComplete = (answers: { q: string; a: string }[]) => {
    setFollowUpAnswers(answers);
    setStep("rescript");
  };

  const steps = ["Record", "Analyze", "Deepen", "Rescript"];
  const stepIndex = step === "landing" ? -1
    : step === "record" ? 0
    : step === "analyzing" ? 1
    : step === "diary" ? 1
    : step === "followup" ? 2
    : 3;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-warm)] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 006.002-2.248z" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Dream<span className="text-[var(--accent)]">AI</span>
          </span>
        </div>

        {step !== "landing" && (
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full text-[10px] font-medium flex items-center justify-center transition-all ${
                  i <= stepIndex
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)]"
                }`}>
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <span className={`text-xs hidden sm:block ${
                  i <= stepIndex ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                }`}>{s}</span>
                {i < steps.length - 1 && (
                  <div className={`w-6 h-px ${i < stepIndex ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {step === "landing" && <LandingView onStart={() => setStep("record")} />}
        {step === "record" && <VoiceRecorder onTranscriptReady={handleTranscript} />}
        {step === "analyzing" && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--text-secondary)]">Analyzing your dream with AI...</p>
            <p className="text-xs text-[var(--text-muted)]">Identifying patterns, emotions, and sensory details</p>
          </div>
        )}
        {step === "diary" && analysis && (
          <div className="flex flex-col items-center gap-6 w-full">
            <DreamDiary analysis={analysis as Record<string, unknown>} />
            <button
              onClick={() => setStep("followup")}
              className="px-8 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent)]/90 transition-colors cursor-pointer"
            >
              Continue -- Let's Go Deeper
            </button>
          </div>
        )}
        {step === "followup" && analysis && (
          <FollowUpChat
            transcript={transcript}
            analysis={analysis}
            onComplete={handleFollowUpComplete}
          />
        )}
        {step === "rescript" && analysis && (
          <RescriptingView analysis={analysis} followUpAnswers={followUpAnswers} />
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-[var(--border)] text-center">
        <p className="text-xs text-[var(--text-muted)]">
          DreamAI uses AI-powered Image Rehearsal Therapy (IRT) to help transform nightmares.
          {" "}Not a substitute for professional mental health care.
        </p>
      </footer>
    </div>
  );
}

function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-10 max-w-xl text-center animate-fade-in">
      {/* Hero icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-warm)] flex items-center justify-center">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 006.002-2.248z" />
          </svg>
        </div>
        <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-warm)] opacity-10 blur-xl" />
      </div>

      {/* Copy */}
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Transform Your
          <br />
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] bg-clip-text text-transparent">
            Nightmares
          </span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
          AI-powered Image Rehearsal Therapy that helps you take control of your dreams.
          Record, rescript, and rehearse your way to better sleep.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-sm">
        <StatCard value="70%" label="Nightmare reduction" />
        <StatCard value="7-10" label="Days to see change" />
        <StatCard value="21min" label="Military suicide interval" />
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="group px-10 py-4 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] text-white font-semibold text-lg hover:opacity-90 transition-all cursor-pointer"
      >
        Begin Your Session
        <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
      </button>

      {/* How it works */}
      <div className="grid grid-cols-4 gap-4 w-full pt-4">
        <StepCard step="1" title="Record" desc="Speak or type your dream" />
        <StepCard step="2" title="Analyze" desc="AI extracts patterns" />
        <StepCard step="3" title="Rescript" desc="Choose a new ending" />
        <StepCard step="4" title="Rehearse" desc="Watch before sleep" />
      </div>

      {/* Trust */}
      <p className="text-xs text-[var(--text-muted)] max-w-sm">
        Based on clinically validated Image Rehearsal Therapy protocols.
        Developed in collaboration with Dr. Michael Breus, PhD -- The Sleep Doctor.
      </p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-[var(--accent)]">{value}</div>
      <div className="text-[10px] text-[var(--text-muted)] mt-1">{label}</div>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="glass rounded-xl p-3 text-center">
      <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold flex items-center justify-center mx-auto mb-2">
        {step}
      </div>
      <h3 className="text-xs font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{desc}</p>
    </div>
  );
}
