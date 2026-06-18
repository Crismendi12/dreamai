"use client";

import { useState, useEffect } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import FollowUpChat from "@/components/FollowUpChat";
import DreamDiary from "@/components/DreamDiary";
import RescriptingView from "@/components/RescriptingView";
import VideoGenerator from "@/components/VideoGenerator";
import HabitTracker from "@/components/HabitTracker";
import TransformationView from "@/components/TransformationView";
import { Icon, type IconName } from "@/lib/icons";
import { apiFetch } from "@/lib/api";
import SignInScreen from "@/components/SignInScreen";
import Dashboard from "@/components/Dashboard";
import DreamEntryView from "@/components/DreamEntryView";
import Profile from "@/components/Profile";
import type { DreamEntry } from "@/lib/dashboard-data";

type Step = "landing" | "dashboard" | "entry" | "profile" | "signin" | "record" | "analyzing" | "diary" | "followup" | "rescript" | "video" | "tracker" | "transformation";
type NavTab = "home" | "journal" | "plan" | "profile";

const NAV_TABS: { id: NavTab; label: string; icon: IconName }[] = [
  { id: "home", label: "Home", icon: "home" },
  { id: "journal", label: "Journal", icon: "bookOpen" },
  { id: "plan", label: "Plan", icon: "target" },
  { id: "profile", label: "Profile", icon: "user" },
];
// Dashboard section to scroll to per tab (profile is its own step, no section).
const TAB_SECTION: Record<NavTab, string> = { home: "", journal: "dash-journal", plan: "dash-plan", profile: "" };

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
// Peaceful cadence for stepping through the analysis stages while we wait.
const ANALYZE_STEP_MS = 1200;

export default function Home() {
  const [step, setStep] = useState<Step>("landing");
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<{ q: string; a: string }[]>([]);
  const [selectedEnding, setSelectedEnding] = useState<SelectedEnding | null>(null);
  const [error, setError] = useState<string | null>(null);
  // sign-in gate (mocked) + home-base navigation
  const [signedIn, setSignedIn] = useState(false);
  const [pendingEnding, setPendingEnding] = useState<SelectedEnding | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [selectedEntry, setSelectedEntry] = useState<DreamEntry | null>(null);

  const handleTranscript = async (text: string) => {
    setTranscript(text);
    setStep("analyzing");
    setError(null);

    try {
      const res = await apiFetch("/api/analyze", {
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

  // Generating a rehearsal film requires sign-in (mocked). If not signed in, hold
  // the chosen ending and show the sign-in SCREEN; resume on success.
  const handleEndingSelected = (ending: SelectedEnding) => {
    if (!signedIn) {
      setPendingEnding(ending);
      setStep("signin");
      return;
    }
    setSelectedEnding(ending);
    setStep("video");
  };

  const completeSignIn = () => {
    setSignedIn(true);
    if (pendingEnding) {
      setSelectedEnding(pendingEnding);
      setPendingEnding(null);
      setStep("video");
    } else {
      openDashboard("home");
    }
  };

  const resetToHome = () => {
    setStep("landing");
    setTranscript("");
    setAnalysis(null);
    setFollowUpAnswers([]);
    setSelectedEnding(null);
    setError(null);
  };

  const openDashboard = (tab: NavTab = "home") => {
    setActiveTab(tab);
    setStep("dashboard");
    const section = TAB_SECTION[tab];
    setTimeout(() => {
      if (!section) window.scrollTo({ top: 0, behavior: "smooth" });
      else document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 70);
  };

  // Nav destination router: profile is its own screen; the rest live on the dashboard.
  const goTab = (tab: NavTab) => {
    if (tab === "profile") {
      setActiveTab("profile");
      setStep("profile");
      setTimeout(() => window.scrollTo({ top: 0 }), 0);
      return;
    }
    openDashboard(tab);
  };

  const openEntry = (entry: DreamEntry) => {
    setSelectedEntry(entry);
    setStep("entry");
    setTimeout(() => window.scrollTo({ top: 0 }), 0);
  };

  const showNav = step === "dashboard" || step === "entry" || step === "profile";
  const handleLogo = () => (showNav ? openDashboard("home") : resetToHome());

  const steps = ["Record", "Analyze", "Deepen", "Rescript", "Watch", "Heal"];
  const stepIndex = step === "landing" ? -1
    : step === "record" ? 0
    : step === "analyzing" || step === "diary" ? 1
    : step === "followup" ? 2
    : step === "rescript" ? 3
    : step === "signin" || step === "video" ? 4
    : step === "tracker" || step === "transformation" ? 5
    : 0;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Header */}
      <header
        className="flex items-center justify-between gap-4 px-6 py-4"
        style={{
          borderBottom: "1px solid var(--line)",
          background: "rgba(250,250,250,0.92)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 30,
          paddingTop: "calc(1rem + env(safe-area-inset-top))",
        }}
      >
        <button
          type="button"
          onClick={handleLogo}
          aria-label="DreamAI — home"
          className="flex items-center gap-2.5"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <span
            className="flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)" }}
          >
            <Icon name="moon" size={18} />
          </span>
          <span className="font-display" style={{ fontSize: 20, letterSpacing: "-0.02em" }}>
            Dream<span style={{ fontStyle: "italic", color: "var(--accent)" }}>AI</span>
          </span>
        </button>

        {/* Home-base: desktop top nav (mobile uses the bottom tab bar) */}
        {showNav && (
          <nav className="topnav" aria-label="Primary">
            {NAV_TABS.filter((t) => t.id !== "profile").map((t) => (
              <button
                key={t.id}
                type="button"
                className={`topnav-item ${activeTab === t.id ? "is-active" : ""}`}
                aria-current={activeTab === t.id ? "page" : undefined}
                onClick={() => goTab(t.id)}
              >
                <Icon name={t.icon} size={17} />
                <span>{t.label}</span>
              </button>
            ))}
            <button type="button" className="btn btn--brand" style={{ height: 40, padding: "0 16px", fontSize: 14 }} onClick={() => setStep("record")}>
              <Icon name="plus" size={18} />
              Record a dream
            </button>
            <button
              type="button"
              className="topnav-avatar"
              aria-label="Profile"
              onClick={() => goTab("profile")}
              style={{ cursor: "pointer", border: activeTab === "profile" ? "2px solid var(--accent)" : "none" }}
            >
              <Icon name="user" size={16} />
            </button>
          </nav>
        )}

        {/* Focused session: progress stepper */}
        {!showNav && step !== "landing" && (
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
      <main className={`flex-1 flex flex-col items-center px-6 py-12 ${showNav ? "justify-start has-tabbar" : "justify-center"}`}>
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
        {step === "dashboard" && (
          <Dashboard
            onRecordNew={() => setStep("record")}
            onOpenPlan={() => setStep("tracker")}
            onOpenEntry={openEntry}
          />
        )}
        {step === "entry" && selectedEntry && (
          <DreamEntryView entry={selectedEntry} onBack={() => openDashboard("journal")} />
        )}
        {step === "record" && <VoiceRecorder onTranscriptReady={handleTranscript} />}
        {step === "analyzing" && <AnalyzingView />}
        {step === "diary" && analysis && (
          <div className="flex flex-col items-center gap-8 w-full">
            <DreamDiary analysis={analysis as Record<string, unknown>} />
            <button onClick={() => setStep("followup")} className="btn btn--brand">
              Let&apos;s Go Deeper
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
          <HabitTracker onComplete={() => setStep("transformation")} onOpenJournal={() => openDashboard("home")} />
        )}
        {step === "transformation" && analysis && (
          <TransformationView
            analysis={analysis}
            endingTitle={selectedEnding?.title || "Your New Ending"}
          />
        )}
        {step === "signin" && (
          <SignInScreen onSignIn={completeSignIn} onBack={() => setStep("rescript")} />
        )}
        {step === "profile" && <Profile onSignOut={resetToHome} />}
      </main>

      {/* Footer — hidden on the home base (dashboard/entry/profile); the disclaimer
          lives at the bottom of Profile there so the hub stays uncluttered. */}
      {!showNav && (
        <footer className="px-6 py-4 text-center" style={{ borderTop: "1px solid var(--line)" }}>
          <p style={{ fontSize: 12, color: "var(--faint)", lineHeight: 1.5 }}>
            DreamAI uses AI-powered Image Rehearsal Therapy (IRT) to help transform nightmares.
            {" "}In collaboration with Dr. Michael Breus, PhD.
            {" "}Not a substitute for professional mental health care.
          </p>
        </footer>
      )}

      {/* Home-base mobile bottom tab bar (Instagram/TikTok style) */}
      {showNav && (
        <nav className="tabbar" aria-label="Primary">
          {NAV_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tabitem ${activeTab === t.id ? "is-active" : ""}`}
              aria-current={activeTab === t.id ? "page" : undefined}
              onClick={() => goTab(t.id)}
            >
              <span style={{ display: "flex" }}><Icon name={t.icon} size={22} /></span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

function AnalyzingView() {
  // Advance through the stages one at a time (done -> spinning -> idle) for a calm,
  // legible "thinking" beat. The last stage keeps spinning until analysis returns
  // and the screen advances on its own.
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i < ANALYZE_STEPS.length; i++) {
      timers.push(setTimeout(() => setActive(i), i * ANALYZE_STEP_MS));
    }
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
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
          <div key={s.t} className={`live-row ${i < active ? "done" : ""} ${i === active ? "on" : ""}`}>
            <span className="live-ic">
              {i < active ? (
                <Icon name="check" size={14} />
              ) : i === active ? (
                <span className="live-spin" />
              ) : (
                <Icon name={s.ic} size={14} />
              )}
            </span>
            <span className="live-t">{s.t}</span>
          </div>
        ))}
      </div>
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
    </div>
  );
}
