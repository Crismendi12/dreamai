"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    fetchQuestions([]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuestions = async (prevAnswers: { q: string; a: string }[]) => {
    setLoading(true);
    try {
      const res = await fetch("/api/followup", {
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
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
        <p className="text-[var(--text-secondary)] text-sm">
          {round === 1 ? "Analyzing your dream..." : "Preparing deeper questions..."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg animate-slide-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
          Let's Go Deeper
        </h2>
        <p className="text-[var(--text-secondary)] text-sm">
          These details help us create a more vivid and personal experience for you.
          {round === 2 && " (Final round)"}
        </p>
      </div>

      {/* Previous answers */}
      {answers.length > 0 && (
        <div className="space-y-3 opacity-60">
          {answers.map((a, i) => (
            <div key={i} className="glass rounded-lg p-3">
              <p className="text-xs text-[var(--accent)] font-medium mb-1">{a.q}</p>
              <p className="text-sm text-[var(--text-secondary)]">{a.a}</p>
            </div>
          ))}
        </div>
      )}

      {/* Current questions */}
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={`${round}-${i}`} className="space-y-2 animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
            <label className="text-sm font-medium text-[var(--accent)]">
              {q}
            </label>
            <textarea
              value={currentAnswers[i] || ""}
              onChange={(e) => {
                const updated = [...currentAnswers];
                updated[i] = e.target.value;
                setCurrentAnswers(updated);
              }}
              placeholder="Describe what you remember..."
              className="w-full h-20 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 transition-all text-sm"
            />
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onComplete(answers)}
          className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors text-sm cursor-pointer"
        >
          Skip to Rescripting
        </button>
        <button
          onClick={handleSubmitAnswers}
          disabled={!allAnswered}
          className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent)]/90 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          {round >= 2 ? "Continue to Rescripting" : "Submit & Next"}
        </button>
      </div>
    </div>
  );
}
