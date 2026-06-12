"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/lib/icons";
import { ENDING_LABEL, MOCK_ENTRIES, type DreamEntry } from "@/lib/dashboard-data";
import { getDayNumber, getStoredData, TOTAL_DAYS, type TrackerData } from "@/lib/tracker";

/** Round the distress reduction to a whole percent for a calm, single figure. */
function reductionPct(entry: DreamEntry): number {
  if (entry.distress <= 0) return 0;
  return Math.round(((entry.distress - entry.projectedDistress) / entry.distress) * 100);
}

/** "2026-06-09" -> "Jun 9" — quiet mono dateline. */
function shortDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface Milestone {
  day: number;
  title: string;
  icon: IconName;
}

// Plan milestones, in order. The first one the user hasn't reached yet is shown.
const MILESTONES: Milestone[] = [
  { day: 3, title: "Neural pathways forming", icon: "sparkline" },
  { day: 5, title: "Dream patterns shifting", icon: "heart" },
  { day: 7, title: "Deep integration begins", icon: "brain" },
  { day: 10, title: "Transformation complete", icon: "trophy" },
];

export default function Dashboard({
  onRecordNew,
  onOpenPlan,
  onOpenEntry,
}: {
  onRecordNew: () => void;
  onOpenPlan: () => void;
  onOpenEntry: (entry: DreamEntry) => void;
}) {
  // Live 10-day plan/streak from real localStorage. Read after mount to stay SSR-safe
  // (getStoredData returns empty on the server, so first paint matches hydration).
  const [plan, setPlan] = useState<TrackerData>({ startDate: "", completedDays: [], streak: 0 });

  useEffect(() => {
    const data = getStoredData();
    // getDayNumber anchors "today" within the plan; kept for parity with the full
    // plan view even though the summary bar is driven by completedDays below.
    void getDayNumber(data.startDate);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlan(data);
  }, []);

  const { completedDays, streak } = plan;
  const nightsDone = completedDays.length;
  const planPct = Math.min(100, (nightsDone / TOTAL_DAYS) * 100);
  const nextMilestone = MILESTONES.find((m) => m.day > nightsDone);

  const entryCount = MOCK_ENTRIES.length;
  const avgDrop =
    entryCount > 0
      ? Math.round(MOCK_ENTRIES.reduce((sum, e) => sum + reductionPct(e), 0) / entryCount)
      : 0;

  return (
    <div className="dash">
      {/* 1. Greeting */}
      <div className="greeting-block" style={{ marginBottom: 4 }}>
        <p className="greeting">WELCOME BACK</p>
        <h1 className="serif-hero" style={{ fontSize: "clamp(26px, 5vw, 34px)" }}>
          Rest <span className="em">easy</span> tonight.
        </h1>
        <p className="subhead">
          {nightsDone > 0
            ? `You're ${nightsDone} ${nightsDone === 1 ? "night" : "nights"} into your 10-day healing plan.`
            : "Your healing works by rehearsing nightly. Record a dream to begin."}
        </p>
      </div>

      {/* 2. Healing plan summary — the nightly rehearsal that drives the cure (primary) */}
      <div id="dash-plan" className="panel" style={{ scrollMarginTop: 80 }}>
        <div className="panel-label">Your 10-day plan</div>

        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 8, background: "var(--line)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${planPct}%`, background: "var(--accent)" }}
          />
        </div>

        <div
          className="flex items-center justify-between"
          style={{ marginTop: 10, gap: 12, flexWrap: "wrap" }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono), var(--mono)",
              fontSize: 13,
              color: "var(--text)",
            }}
          >
            {nightsDone} / {TOTAL_DAYS} nights
          </span>
          {streak > 1 && (
            <span className="pill">
              <Icon name="spark" />
              {streak}-night streak
            </span>
          )}
        </div>

        {nextMilestone && (
          <div className="plan-steps" style={{ marginTop: 14 }}>
            <div className="plan-row">
              <span className="plan-ic">
                <Icon name={nextMilestone.icon} />
              </span>
              <span>
                <span className="plan-t">{nextMilestone.title}</span>
                <span className="plan-s">Night {nextMilestone.day} of your plan</span>
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn btn--ghost btn--block"
          onClick={onOpenPlan}
          style={{ marginTop: 16 }}
        >
          <Icon name="target" />
          Open my healing plan
        </button>
      </div>

      {/* 3. Secondary action — record a new dream (occasional, not daily) */}
      <div className="outcome">
        <div className="outcome-label">
          <Icon name="moon" />
          Had another dream?
        </div>
        <p className="outcome-sub" style={{ marginTop: 8 }}>
          Record it and we&apos;ll turn it into a new ending you can rehearse.
        </p>
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
          <button type="button" className="btn btn--brand" onClick={onRecordNew}>
            <Icon name="mic" />
            Record a new dream
          </button>
          <button
            type="button"
            className="linklike"
            onClick={onRecordNew}
            style={{ color: "rgba(255,255,255,0.82)", alignSelf: "flex-start" }}
          >
            or type it
          </button>
        </div>
      </div>

      {/* 4. Your dreams (journal) */}
      <div id="dash-journal" className="flex items-center justify-between" style={{ gap: 12, scrollMarginTop: 80 }}>
        <span className="panel-label" style={{ marginBottom: 0 }}>
          Your dreams
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono), var(--mono)",
            fontSize: 12,
            color: "var(--faint)",
          }}
        >
          {entryCount} {entryCount === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Pull the grid up under its header so the label sits cleanly above the cards
          (the .dash gap is 22px; this tightens header→grid to a ~12px panel-label rhythm). */}
      <div className="journal-grid" style={{ marginTop: -10 }}>
        {MOCK_ENTRIES.map((entry) => {
          const drop = reductionPct(entry);
          return (
            <div
              key={entry.id}
              role="button"
              tabIndex={0}
              onClick={() => onOpenEntry(entry)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenEntry(entry);
                }
              }}
              className="panel active:translate-y-px"
              style={{
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                minHeight: 44,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono), var(--mono)",
                  fontSize: 11,
                  color: "var(--faint)",
                }}
              >
                {shortDate(entry.date)}
              </span>

              <div>
                <div className="font-display" style={{ fontSize: 17, lineHeight: 1.2 }}>
                  {entry.title}
                </div>
                <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2, lineHeight: 1.35 }}>
                  {entry.setting}
                </p>
              </div>

              <div className="flex items-center" style={{ gap: 8 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono), var(--mono)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--danger)",
                  }}
                >
                  {entry.distress}
                </span>
                <Icon name="arrowright" size={15} style={{ color: "var(--faint)" }} />
                <span
                  style={{
                    fontFamily: "var(--font-mono), var(--mono)",
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--green)",
                  }}
                >
                  {entry.projectedDistress}
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontFamily: "var(--font-mono), var(--mono)",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--accent)",
                  }}
                >
                  {drop}%
                </span>
              </div>

              <div className="pills">
                <span
                  className="pill"
                  style={{
                    background: "var(--accent-soft)",
                    borderColor: "rgba(30,58,138,0.2)",
                    color: "var(--accent-d)",
                  }}
                >
                  {ENDING_LABEL[entry.endingType]}
                </span>
                {entry.themes.slice(0, 3).map((theme) => (
                  <span key={theme} className="pill">
                    {theme}
                  </span>
                ))}
              </div>

              {entry.scenes ? (
                <button
                  type="button"
                  className="btn btn--brand btn--block"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEntry(entry);
                  }}
                  style={{ marginTop: 2 }}
                >
                  <Icon name="play" />
                  Watch film
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn--ghost btn--block"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEntry(entry);
                  }}
                  style={{ marginTop: 2 }}
                >
                  <Icon name="arrowright" />
                  Finish this dream
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. Progress glimpse */}
      {entryCount > 0 && (
        <div className="panel">
          <div className="panel-label">Your progress so far</div>
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <ProgressFigure value={entryCount} label="Dreams logged" />
            <ProgressFigure value={nightsDone} label="Nights rehearsed" />
            <ProgressFigure value={`${avgDrop}%`} label="Avg distress drop" />
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressFigure({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontFamily: "var(--font-mono), var(--mono)",
          fontWeight: 700,
          fontSize: 22,
          color: "var(--accent)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 12, color: "var(--faint)", lineHeight: 1.3 }}>{label}</span>
    </div>
  );
}
