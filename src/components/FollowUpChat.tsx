"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/lib/icons";
import { apiFetch } from "@/lib/api";

interface FollowUpChatProps {
  transcript: string;
  analysis: Record<string, unknown>;
  onComplete: (answers: { q: string; a: string }[]) => void;
}

export default function FollowUpChat({ transcript, analysis, onComplete }: FollowUpChatProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([]);
  const [currentAnswers, setCurrentAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(1);

  const fetchQuestions = async (prevAnswers: { q: string; a: string }[]) => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          analysis,
          previousAnswers: prevAnswers,
        }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setCurrentAnswers(new Array(data.questions?.length || 0).fill(""));
    } catch {
      setQuestions(["Could you describe any specific sounds you heard in the dream?"]);
      setCurrentAnswers([""]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuestions([]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmitAnswers = () => {
    const newAnswers = questions.map((q, i) => ({
      q,
      a: currentAnswers[i] || "(no answer)",
    }));
    const allAnswers = [...answers, ...newAnswers];
    setAnswers(allAnswers);

    if (round >= 2) {
      onComplete(allAnswers);
    } else {
      setRound(round + 1);
      fetchQuestions(allAnswers);
    }
  };

  const allAnswered = currentAnswers.every((a) => a.trim().length > 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center text-center animate-fade-in">
        <div className="orb-stage">
          <div className="orb-glow" />
          <div className="orb" />
          <span className="spark s1"><Icon name="spark" /></span>
          <span className="spark s2"><Icon name="sparkline" /></span>
          <span className="spark s3"><Icon name="spark" /></span>
        </div>
        <p className="analyse-head">
          {round === 1 ? "Analyzing your dream..." : "Preparing deeper questions..."}
        </p>
      </div>
    );
  }

  return (
    <div className="intake animate-slide-up">
      {/* Round indicator */}
      <div>
        <div className="step-kicker">Round {round} of 2 &middot; Deepen</div>
        <div className="intake-top" style={{ marginTop: "12px" }}>
          <div className="progress-dots">
            <span className={`pd${round > 1 ? " is-done" : round === 1 ? " is-active" : ""}`}>
              <span className="pd-fill" />
            </span>
            <span className={`pd${round === 2 ? " is-active" : ""}`}>
              <span className="pd-fill" />
            </span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="step-q">Let&apos;s Go Deeper</h2>
        <p className="step-hint">
          These details help us create a more vivid and personal experience for you.
          {round === 2 && " (Final round)"}
        </p>
      </div>

      {/* Previous answers */}
      {answers.length > 0 && (
        <div className="carry opacity-60">
          <div className="carry-label">
            <Icon name="check" /> Captured so far
          </div>
          {answers.map((a, i) => (
            <div key={i} className="carry-row">
              <span className="carry-k">{a.q}</span>
              <span className="carry-v">{a.a}</span>
            </div>
          ))}
        </div>
      )}

      {/* Current questions */}
      <div className="flex flex-col gap-6">
        {questions.map((q, i) => (
          <div key={`${round}-${i}`} className="animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
            <label className="sg-label">
              <Icon name="quote" /> {q}
            </label>
            <textarea
              value={currentAnswers[i] || ""}
              onChange={(e) => {
                const updated = [...currentAnswers];
                updated[i] = e.target.value;
                setCurrentAnswers(updated);
              }}
              placeholder="Describe what you remember..."
              className="gg-field w-full resize-none"
              style={{ minHeight: "88px", alignItems: "flex-start" }}
            />
          </div>
        ))}
      </div>

      <div className="intake-actions">
        <button onClick={() => onComplete(answers)} className="linklike">
          Skip to Rescripting
        </button>
        <button
          onClick={handleSubmitAnswers}
          disabled={!allAnswered}
          className="btn btn--brand"
          style={{ opacity: !allAnswered ? 0.3 : 1, cursor: !allAnswered ? "not-allowed" : "pointer" }}
        >
          {round >= 2 ? "Rescript" : "Continue"}
          <Icon name="arrowright" />
        </button>
      </div>
    </div>
  );
}
