"use client";

import { useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import FollowUpChat from "@/components/FollowUpChat";
import DreamDiary from "@/components/DreamDiary";
import RescriptingView from "@/components/RescriptingView";
import VideoGenerator from "@/components/VideoGenerator";
import HabitTracker from "@/components/HabitTracker";
import TransformationView from "@/components/TransformationView";
import { Icon, type IconName } from "@/lib/icons";

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

const ANALYZE_STEPS: { ic: IconName; t: string }[] = [
  { ic: "quote", t: "Reading your dream" },
  { ic: "search", t: "Identifying patterns & emotions" },
  { ic: "brain", t: "Mapping sensory detail" },
  { ic: "list", t: "Structuring your diary entry" },
];

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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="flex items-center justify-between gap-4 px-6 py-4"
        style={{ borderBottom: "1px solid var(--line)", background: "rgba(250,250,250,0.92)", backdropFilter: "blur(8px)" }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <Icon name="moon" size={18} />
          </span>
          <span className="font-display" style={{ fontSize: 20, letterSpacing: "-0.02em" }}>
            Dream<span style={{ fontStyle: "italic", color: "var(--accent)" }}>AI</span>
          </span>
        </div>

        {step !== "landing" && (
          <div className="flex items-center gap-3">
            <span className="step-kicker hidden sm:block">{steps[stepIndex] ?? ""}</span>
            <div className="progress-dots" style={{ maxWidth: 220, minWidth: 140 }}>
              {steps.map((s, i) => (
                <span key={s} className={`pd ${i < stepIndex ? "is-done" : ""} ${i === stepIndex ? "is-active" : ""}`}>
                  <span className="pd-fill" />
                </span>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {step === "landing" && <LandingView onStart={() => setStep("record")} />}
        {error && (
          <div className="mb-5 w-full max-w-lg animate-fade-in">
            <div
              className="flex items-center gap-2.5 px-4 py-3"
              style={{ background: "var(--amber-soft)", border: "1px solid var(--line)", borderRadius: 14, color: "var(--amber)", fontSize: 14 }}
            >
              <Icon name="alert" size={16} />
              <span>{error}</span>
            </div>
          </div>
        )}
        {step === "record" && <VoiceRecorder onTranscriptReady={handleTranscript} />}
        {step === "analyzing" && (
          <div className="analysing animate-fade-in">
            <div className="orb-stage">
              <div className="orb-glow" />
              <div className="orb" />
              <span className="spark s1"><Icon name="spark" size={20} /></span>
              <span className="spark s2"><Icon name="spark" size={26} /></span>
              <span className="spark s3"><Icon name="spark" size={15} /></span>
            </div>
            <h2 className="analyse-head">Analyzing your dream…</h2>
            <div className="live-steps">
              {ANALYZE_STEPS.map((s, i) => (
                <div key={s.t} className={`live-row ${i === 0 ? "on" : ""}`}>
                  <span className="live-ic">
                    {i === 0 ? <span className="live-spin" /> : <Icon name={s.ic} size={14} />}
                  </span>
                  <span className="live-t">{s.t}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === "diary" && analysis && (
          <div className="flex flex-col items-center gap-8 w-full">
            <DreamDiary analysis={analysis as Record<string, unknown>} />
            <button onClick={() => setStep("followup")} className="btn btn--brand">
              Continue — Let&apos;s Go Deeper
              <Icon name="arrowright" size={18} />
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
      <footer className="px-6 py-4 text-center" style={{ borderTop: "1px solid var(--line)" }}>
        <p style={{ fontSize: 12, color: "var(--faint)", lineHeight: 1.5 }}>
          DreamAI uses AI-powered Image Rehearsal Therapy (IRT) to help transform nightmares.
          {" "}Not a substitute for professional mental health care.
        </p>
      </footer>
    </div>
  );
}

function LandingView({ onStart }: { onStart: () => void }) {
  return (
    <div className="voice animate-fade-in">
      <div className="home-head">
        <div className="animate-float" style={{ marginBottom: 4 }}>
          <span
            className="flex items-center justify-center"
            style={{ width: 96, height: 96, borderRadius: 999, background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <Icon name="moon" size={40} />
          </span>
        </div>
        <span className="greeting">AI-guided dream rescripting</span>
        <h1 className="serif-hero">
          Transform your<br />
          <span className="em">nightmares.</span>
        </h1>
        <p className="subhead" style={{ maxWidth: "32rem" }}>
          AI-powered Image Rehearsal Therapy that helps you take control of your dreams.
          Record, rescript, and rehearse your way to better sleep.
        </p>
      </div>

      <button onClick={onStart} className="btn btn--brand" style={{ marginTop: 10 }}>
        Begin your session
        <Icon name="arrowright" size={18} />
      </button>

      {/* How it works */}
      <div className="how">
        <span className="how-step"><span className="hn">1</span> <b>Record</b></span>
        <span className="how-arrow"><Icon name="arrowright" size={15} /></span>
        <span className="how-step"><span className="hn">2</span> <b>Analyze</b></span>
        <span className="how-arrow"><Icon name="arrowright" size={15} /></span>
        <span className="how-step"><span className="hn">3</span> <b>Rescript</b></span>
        <span className="how-arrow"><Icon name="arrowright" size={15} /></span>
        <span className="how-step"><span className="hn">4</span> <b>Rehearse</b></span>
      </div>

      {/* Proof */}
      <div className="proof">
        <span><b>70%</b> nightmare reduction</span><span className="dot" />
        <span><b>10 days</b> to lasting change</span><span className="dot" />
        <span><b>90%</b> maintain at 6 months</span><span className="dot" />
        <span className="verified"><Icon name="check" size={13} /> Clinically grounded</span>
      </div>

      {/* Citation */}
      <p style={{ fontSize: 11, color: "var(--faint)", maxWidth: "32rem", lineHeight: 1.5, marginTop: 6 }}>
        Based on Image Rehearsal Therapy protocols validated by Krakow &amp; Zadra (2006) and Aurora et al. (2010).
        In collaboration with Dr. Michael Breus, PhD — The Sleep Doctor.
      </p>
    </div>
  );
}
