"use client";

import { useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import FollowUpChat from "@/components/FollowUpChat";
import DreamDiary from "@/components/DreamDiary";
import RescriptingView from "@/components/RescriptingView";
import VideoGenerator from "@/components/VideoGenerator";
import HabitTracker from "@/components/HabitTracker";
import TransformationView from "@/components/TransformationView";

type Step = "landing" | "record" | "analyzing" | "diary" | "followup" | "rescript" | "video" | "tracker" | "transformation";

interface SelectedEnding {
  title: string;
  type: string;
  scenes: Array<{
    scene_number: number;
    visual_description: string;
    narration: string;
    duration_seconds: number;
    mood: string;
  }>;
}

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<{ q: string; a: string }[]>([]);
  const [selectedEnding, setSelectedEnding] = useState<SelectedEnding | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranscript = async (text: string) => {
    setTranscript(text);
    setStep("analyzing");
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setStep("record");
        return;
      }
      setAnalysis(data.analysis);
      setStep("diary");
    } catch {
      setError("Connection error. Please try again.");
      setStep("record");
    }
  };

  const handleFollowUpComplete = (answers: { q: string; a: string }[]) => {
    setFollowUpAnswers(answers);
    setStep("rescript");
  };

  const handleEndingSelected = (ending: SelectedEnding) => {
    setSelectedEnding(ending);
    setStep("video");
  };

  const steps = ["Record", "Analyze", "Deepen", "Rescript", "Watch", "Heal"];
  const stepIndex = step === "landing" ? -1
    : step === "record" ? 0
    : step === "analyzing" || step === "diary" ? 1
    : step === "followup" ? 2
    : step === "rescript" ? 3
    : step === "video" ? 4
    : step === "tracker" || step === "transformation" ? 5
    : 0;

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-warm)] flex items-center justify-center shadow-lg shadow-[var(--accent)]/10">
            <svg className="w-4 h-4 text-[#080B14]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 006.002-2.248z" />
            </svg>
          </div>
          <span className="text-lg font-display font-semibold tracking-tight">
            Dream<span className="text-[var(--accent)]">AI</span>
          </span>
        </div>

        {step !== "landing" && (
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full text-[9px] font-medium flex items-center justify-center transition-all duration-500 ${
                  i <= stepIndex
                    ? "bg-[var(--accent)] text-[#080B14]"
                    : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                }`}>
                  {i < stepIndex ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-[10px] hidden sm:block transition-colors duration-500 ${
                  i <= stepIndex ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                }`}>{s}</span>
                {i < steps.length - 1 && (
                  <div className={`w-4 h-px transition-colors duration-500 ${i < stepIndex ? "bg-[var(--accent)]/50" : "bg-[var(--border-subtle)]"}`} />
                )}
              </div>
            ))}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
        {step === "landing" && <LandingView onStart={() => setStep("record")} />}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] text-sm text-center max-w-lg animate-fade-in">
            {error}
          </div>
        )}
        {step === "record" && <VoiceRecorder onTranscriptReady={handleTranscript} />}
        {step === "analyzing" && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/20" />
              <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-[var(--text-primary)] font-display">Analyzing your dream...</p>
              <p className="text-xs text-[var(--text-muted)]">Identifying patterns, emotions, and sensory details</p>
            </div>
          </div>
        )}
        {step === "diary" && analysis && (
          <div className="flex flex-col items-center gap-8 w-full">
            <DreamDiary analysis={analysis as Record<string, unknown>} />
            <button
              onClick={() => setStep("followup")}
              className="btn-primary px-8 py-3 rounded-xl text-sm cursor-pointer"
            >
              Continue -- Let&apos;s Go Deeper
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
          <RescriptingView
            analysis={analysis}
            followUpAnswers={followUpAnswers}
            onGenerateVideo={handleEndingSelected}
          />
        )}
        {step === "video" && selectedEnding && (
          <VideoGenerator
            scenes={selectedEnding.scenes}
            endingType={selectedEnding.type}
            endingTitle={selectedEnding.title}
            onComplete={() => setStep("tracker")}
          />
        )}
        {step === "tracker" && (
          <HabitTracker onComplete={() => setStep("transformation")} />
        )}
        {step === "transformation" && analysis && (
          <TransformationView
            analysis={analysis}
            endingTitle={selectedEnding?.title || "Your New Ending"}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 border-t border-[var(--border-subtle)] text-center">
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
    <div className="flex flex-col items-center gap-12 max-w-xl text-center animate-fade-in">
      {/* Hero icon */}
      <div className="relative animate-float">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent-cool)]/10 flex items-center justify-center border border-[var(--accent)]/15">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--accent)]/30 to-[var(--accent-warm)]/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 006.002-2.248z" />
            </svg>
          </div>
        </div>
        <div className="absolute -inset-6 rounded-full bg-[var(--accent)]/5 blur-2xl" />
      </div>

      {/* Headline */}
      <div className="space-y-5">
        <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight leading-[1.1]">
          Transform Your
          <br />
          <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] bg-clip-text text-transparent">
            Nightmares
          </span>
        </h1>
        <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-md mx-auto">
          AI-powered Image Rehearsal Therapy that helps you take control of your dreams.
          Record, rescript, and rehearse your way to better sleep.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8 w-full max-w-sm">
        <StatCard value="70%" label="Nightmare reduction with IRT" />
        <StatCard value="10" label="Days to lasting change" />
        <StatCard value="90%" label="Maintain gains at 6 months" />
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        className="group btn-primary px-12 py-4 rounded-xl text-base cursor-pointer"
      >
        Begin Your Session
        <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&rarr;</span>
      </button>

      {/* Steps */}
      <div className="grid grid-cols-4 gap-3 w-full pt-2">
        <StepCard step="1" title="Record" desc="Speak or type your dream" />
        <StepCard step="2" title="Analyze" desc="AI extracts patterns" />
        <StepCard step="3" title="Rescript" desc="Choose a new ending" />
        <StepCard step="4" title="Rehearse" desc="Watch before sleep" />
      </div>

      {/* Citation */}
      <p className="text-[11px] text-[var(--text-muted)] max-w-sm leading-relaxed">
        Based on Image Rehearsal Therapy protocols validated by Krakow & Zadra (2006) and Aurora et al. (2010).
        In collaboration with Dr. Michael Breus, PhD -- The Sleep Doctor.
      </p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center space-y-1.5">
      <div className="text-2xl font-display font-bold text-[var(--accent)]">{value}</div>
      <div className="text-[10px] text-[var(--text-muted)] leading-tight">{label}</div>
    </div>
  );
}

function StepCard({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="glass rounded-xl p-3.5 text-center transition-all hover:border-[var(--accent)]/15">
      <div className="w-7 h-7 rounded-full bg-[var(--accent)]/8 text-[var(--accent)] text-xs font-bold flex items-center justify-center mx-auto mb-2 border border-[var(--accent)]/15">
        {step}
      </div>
      <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">{title}</h3>
      <p className="text-[10px] text-[var(--text-muted)]">{desc}</p>
    </div>
  );
}
