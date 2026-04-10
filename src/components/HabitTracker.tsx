"use client";

import { useState, useEffect } from "react";

interface HabitTrackerProps {
  onComplete: () => void;
}

const TOTAL_DAYS = 10;
const STORAGE_KEY = "dreamai-habit-tracker";

interface TrackerData {
  startDate: string;
  completedDays: number[];
  streak: number;
}

function getStoredData(): TrackerData {
  if (typeof window === "undefined") return { startDate: "", completedDays: [], streak: 0 };
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }
  const data: TrackerData = {
    startDate: new Date().toISOString().split("T")[0],
    completedDays: [],
    streak: 0,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

function getDayNumber(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.min(diff + 1, TOTAL_DAYS);
}

export default function HabitTracker({ onComplete }: HabitTrackerProps) {
  const [data, setData] = useState<TrackerData>({ startDate: "", completedDays: [], streak: 0 });
  const [todayDay, setTodayDay] = useState(1);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    const stored = getStoredData();
    setData(stored);
    setTodayDay(getDayNumber(stored.startDate));
  }, []);

  const markToday = () => {
    const newData = { ...data };
    if (!newData.completedDays.includes(todayDay)) {
      newData.completedDays = [...newData.completedDays, todayDay];
      // Calculate streak
      let streak = 0;
      for (let d = todayDay; d >= 1; d--) {
        if (newData.completedDays.includes(d)) {
          streak++;
        } else {
          break;
        }
      }
      newData.streak = streak;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setData(newData);
      setJustCompleted(true);
    }
  };

  const todayCompleted = data.completedDays.includes(todayDay);
  const completedCount = data.completedDays.length;
  const progressPct = (completedCount / TOTAL_DAYS) * 100;

  const milestones = [
    { day: 3, label: "Neural pathways forming", icon: "~" },
    { day: 5, label: "Dream patterns shifting", icon: "+" },
    { day: 7, label: "Deep integration begins", icon: "*" },
    { day: 10, label: "Transformation complete", icon: "#" },
  ];

  return (
    <div className="w-full max-w-2xl space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
          Your 10-Day Healing Protocol
        </h2>
        <p className="text-[var(--text-secondary)] text-sm">
          IRT research shows 7-10 days of nightly rehearsal rewires nightmare patterns.
          Watch your video before sleep each night.
        </p>
      </div>

      {/* Overall progress */}
      <div className="glass rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--text-primary)]">
            Progress
          </span>
          <span className="text-sm text-[var(--accent)] font-medium">
            {completedCount} / {TOTAL_DAYS} nights
          </span>
        </div>
        <div className="w-full h-3 bg-[var(--bg-deep)] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {data.streak > 1 && (
          <p className="text-xs text-[var(--accent-warm)] text-center font-medium">
            {data.streak}-night streak -- keep going!
          </p>
        )}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-5 gap-3">
        {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
          const isCompleted = data.completedDays.includes(day);
          const isToday = day === todayDay;
          const isFuture = day > todayDay;
          const milestone = milestones.find((m) => m.day === day);

          return (
            <div
              key={day}
              className={`relative rounded-xl p-3 text-center transition-all ${
                isCompleted
                  ? "bg-[var(--accent)]/20 border border-[var(--accent)]/30"
                  : isToday
                  ? "glass border border-[var(--accent-warm)]/40 glow-border"
                  : isFuture
                  ? "bg-[var(--bg-card)]/50 border border-[var(--border)]"
                  : "bg-[var(--bg-card)] border border-[var(--border)]"
              }`}
            >
              <div className="text-xs text-[var(--text-muted)] mb-1">Day</div>
              <div
                className={`text-lg font-bold ${
                  isCompleted
                    ? "text-[var(--accent)]"
                    : isToday
                    ? "text-[var(--accent-warm)]"
                    : isFuture
                    ? "text-[var(--text-muted)]/50"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6 mx-auto text-[var(--success)]" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  day
                )}
              </div>
              {isToday && !isCompleted && (
                <div className="text-[10px] text-[var(--accent-warm)] mt-1 font-medium">Tonight</div>
              )}
              {milestone && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-warm)] flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">{milestone.icon}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        {milestones.map((m) => {
          const reached = data.completedDays.length >= m.day;
          return (
            <div
              key={m.day}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                reached ? "bg-[var(--accent)]/10" : "bg-[var(--bg-card)]/50"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  reached
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                }`}
              >
                {reached ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  m.day
                )}
              </div>
              <div>
                <span className={`text-sm ${reached ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}>
                  Day {m.day}: {m.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's action */}
      <div className="glass rounded-xl p-6 text-center space-y-4">
        {justCompleted ? (
          <div className="space-y-3 animate-fade-in">
            <div className="text-3xl">
              {completedCount >= TOTAL_DAYS ? "*" : ""}
            </div>
            <h3 className="text-lg font-semibold text-[var(--success)]">
              {completedCount >= TOTAL_DAYS
                ? "Protocol Complete!"
                : `Night ${completedCount} Complete`}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {completedCount >= TOTAL_DAYS
                ? "You've completed the full 10-day protocol. Your dream patterns have been rewired."
                : completedCount >= 7
                ? "Deep neural integration is happening. Your dreams are shifting."
                : completedCount >= 5
                ? "You're past the halfway point. Your brain is forming new dream patterns."
                : completedCount >= 3
                ? "New neural pathways are forming. Keep building this momentum."
                : "Great start. Consistency is the key to rewiring your dreams."}
            </p>
            {completedCount >= TOTAL_DAYS && (
              <button
                onClick={onComplete}
                className="mt-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] text-white font-medium hover:opacity-90 transition-all cursor-pointer"
              >
                View Your Transformation
              </button>
            )}
          </div>
        ) : todayCompleted ? (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[var(--success)]">
              Tonight's session is done
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Come back tomorrow night for your next rehearsal.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              Day {todayDay} -- Ready for tonight?
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              After watching your rehearsal video, mark this day as complete.
            </p>
            <button
              onClick={markToday}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent-warm)] text-white font-medium hover:opacity-90 transition-all cursor-pointer"
            >
              Mark Tonight as Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
