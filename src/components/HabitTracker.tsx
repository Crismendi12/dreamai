"use client";

import { useState, useEffect } from "react";
import { Icon, type IconName } from "@/lib/icons";
import { STORAGE_KEY, TOTAL_DAYS, getStoredData, getDayNumber, type TrackerData } from "@/lib/tracker";

interface HabitTrackerProps {
  onComplete: () => void;
  onOpenJournal: () => void;
}

export default function HabitTracker({ onComplete, onOpenJournal }: HabitTrackerProps) {
  const [data, setData] = useState<TrackerData>({ startDate: "", completedDays: [], streak: 0 });
  const [todayDay, setTodayDay] = useState(1);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    const stored = getStoredData();
    // Mount-only hydration from localStorage; cascading-render warning does not apply here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const milestones: { day: number; label: string; icon: IconName }[] = [
    { day: 3, label: "Neural pathways forming", icon: "sparkline" },
    { day: 5, label: "Dream patterns shifting", icon: "heart" },
    { day: 7, label: "Deep integration begins", icon: "brain" },
    { day: 10, label: "Transformation complete", icon: "trophy" },
  ];

  return (
    <div className="w-full max-w-2xl space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="serif-hero" style={{ fontSize: "clamp(28px, 5vw, 36px)" }}>
          Your 10-Day Healing Protocol
        </h2>
        <p className="subhead mx-auto" style={{ maxWidth: "34rem" }}>
          IRT research shows 7-10 days of nightly rehearsal rewires nightmare patterns.
          Watch your video before sleep each night.
        </p>
      </div>

      {/* Overall progress */}
      <div className="panel space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--text)]">
            Progress
          </span>
          <span className="text-sm text-[var(--accent)] font-semibold">
            {completedCount} / {TOTAL_DAYS} nights
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full overflow-hidden bg-[var(--line)]">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {data.streak > 1 && (
          <div className="flex justify-center">
            <span className="pill">
              <Icon name="spark" />
              <b>{data.streak}-night streak -- keep going!</b>
            </span>
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
          const isCompleted = data.completedDays.includes(day);
          const isToday = day === todayDay;
          const isFuture = day > todayDay;
          const milestone = milestones.find((m) => m.day === day);

          return (
            <div
              key={day}
              className={`relative rounded-xl p-2 sm:p-3 text-center transition-all border ${
                isCompleted
                  ? "bg-[var(--green-soft)] border-[var(--green)]/30"
                  : isToday
                  ? "bg-[var(--bg-2)] glow-border"
                  : isFuture
                  ? "bg-[var(--bg-2)] border-[var(--line)] opacity-60"
                  : "bg-[var(--bg-2)] border-[var(--line)]"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider font-mono text-[var(--faint)] mb-1">Day</div>
              <div
                className={`text-lg font-bold flex items-center justify-center ${
                  isCompleted
                    ? "text-[var(--green)]"
                    : isToday
                    ? "text-[var(--accent)]"
                    : isFuture
                    ? "text-[var(--faint)]/60"
                    : "text-[var(--muted)]"
                }`}
              >
                {isCompleted ? (
                  <Icon name="check" size={22} className="text-[var(--green)]" />
                ) : (
                  day
                )}
              </div>
              {isToday && !isCompleted && (
                <div className="text-[10px] text-[var(--accent)] mt-1 font-semibold">Tonight</div>
              )}
              {milestone && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-sm">
                  <Icon name={milestone.icon} size={11} className="text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Milestones */}
      <div className="panel">
        <div className="panel-label">Milestones</div>
        <div className="plan-steps">
          {milestones.map((m) => {
            const reached = data.completedDays.length >= m.day;
            return (
              <div key={m.day} className="plan-row">
                <div
                  className="plan-ic"
                  style={
                    reached
                      ? { background: "var(--green-soft)", color: "var(--green)" }
                      : undefined
                  }
                >
                  {reached ? (
                    <Icon name="check" size={16} />
                  ) : (
                    <span className="font-mono text-sm font-bold">{m.day}</span>
                  )}
                </div>
                <div>
                  <div
                    className="plan-t"
                    style={!reached ? { color: "var(--faint)" } : undefined}
                  >
                    Day {m.day}: {m.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's action */}
      {justCompleted ? (
        <div className="outcome animate-fade-in text-center">
          <div className="outcome-label justify-center">
            <Icon name={completedCount >= TOTAL_DAYS ? "trophy" : "moon"} />
            {completedCount >= TOTAL_DAYS ? "Protocol Complete!" : `Night ${completedCount} Complete`}
          </div>
          <p
            className="outcome-sub justify-center mx-auto"
            style={{ marginTop: "10px", maxWidth: "30rem" }}
          >
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
          <div
            className="flex flex-col items-center gap-2.5 mt-5"
            style={{ position: "relative", zIndex: 1 }}
          >
            <button onClick={onOpenJournal} className="btn btn--ghost">
              <Icon name="bookOpen" />
              Take me to my journal
            </button>
            {completedCount >= TOTAL_DAYS && (
              <button onClick={onComplete} className="btn btn--ghost">
                View Your Transformation
                <Icon name="arrowright" />
              </button>
            )}
          </div>
        </div>
      ) : todayCompleted ? (
        <div className="panel text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[var(--green)]">
            <Icon name="shieldcheck" />
            <h3 className="text-lg font-semibold text-[var(--green)]">
              Tonight&apos;s session is done
            </h3>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Come back tomorrow night for your next rehearsal.
          </p>
          <button onClick={onOpenJournal} className="btn btn--brand">
            <Icon name="bookOpen" />
            Take me to my journal
          </button>
        </div>
      ) : (
        <div className="panel text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Icon name="moon" className="text-[var(--accent)]" />
            <h3 className="text-lg font-semibold text-[var(--text)]">
              Day {todayDay} -- Ready for tonight?
            </h3>
          </div>
          <p className="text-sm text-[var(--muted)]">
            After watching your rehearsal video, mark this day as complete.
          </p>
          <button onClick={markToday} className="btn btn--brand">
            <Icon name="check" />
            Mark Tonight as Complete
          </button>
        </div>
      )}
    </div>
  );
}
