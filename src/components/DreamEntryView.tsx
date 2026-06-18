"use client";

import { Icon } from "@/lib/icons";
import DreamPlayer from "@/components/DreamPlayer";
import DreamDiary from "@/components/DreamDiary";
import { type DreamEntry } from "@/lib/dashboard-data";

/** "2026-06-09" -> "Jun 9, 2026" — quiet mono dateline for the entry header. */
function fullDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// DreamDiary takes a structured DreamAnalysis; the stored analysis payload is a loose
// Record<string, unknown> that matches that shape, so we narrow it at the boundary.
type DiaryAnalysis = React.ComponentProps<typeof DreamDiary>["analysis"];

export default function DreamEntryView({
  entry,
  onBack,
}: {
  entry: DreamEntry;
  onBack: () => void;
}) {
  const totalDuration = entry.scenes
    ? entry.scenes.reduce((sum, s) => sum + s.duration_seconds, 0)
    : 0;

  return (
    <div className="dash">
      <button type="button" className="linklike" onClick={onBack} style={{ alignSelf: "flex-start" }}>
        <Icon name="arrowleft" />
        Back to journal
      </button>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span
          style={{
            fontFamily: "var(--font-mono), var(--mono)",
            fontSize: 11,
            letterSpacing: "0.06em",
            color: "var(--faint)",
          }}
        >
          {fullDate(entry.date)}
        </span>
        <h1 className="serif-hero" style={{ fontSize: "clamp(26px, 5vw, 34px)" }}>
          {entry.title}
        </h1>
        <p className="subhead">{entry.setting}</p>
      </div>

      {entry.scenes ? (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <DreamPlayer
            scenes={entry.scenes}
            totalDuration={totalDuration}
            endingTitle={entry.title}
          />
        </div>
      ) : (
        <div className="panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>
            This dream doesn&apos;t have a rehearsal film yet. Finish it to generate a new
            ending you can watch each night.
          </p>
          {/* Stub: generation flow isn't wired here yet, so this returns to the journal. */}
          <button type="button" className="btn btn--brand" onClick={onBack} style={{ alignSelf: "flex-start" }}>
            <Icon name="play" />
            Finish this dream
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <DreamDiary analysis={entry.analysis as DiaryAnalysis} />
      </div>
    </div>
  );
}
