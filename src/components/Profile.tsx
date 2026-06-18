"use client";

import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/lib/icons";
import { getDayNumber, getStoredData } from "@/lib/tracker";

/**
 * Account / Settings screen. Reached from the main nav. Mock only — no real
 * auth or backend yet, so the header is a placeholder and the settings rows are
 * non-functional stubs. Sign-out is the one live affordance (delegated to the
 * page shell via onSignOut).
 *
 * Renders inside the page <main>; the shell owns the header/footer/nav.
 */

/** Non-functional settings stubs. Real destinations arrive with the backend. */
const SETTINGS_ROWS: { icon: IconName; label: string }[] = [
  { icon: "mail", label: "Notifications" },
  { icon: "lock", label: "Privacy & data" },
  { icon: "heart", label: "Help & support" },
];

export default function Profile({ onSignOut }: { onSignOut: () => void }) {
  // Live plan figures from real localStorage. Read after mount to stay SSR-safe
  // (getStoredData returns empty on the server, so first paint matches hydration).
  const [plan, setPlan] = useState({ nightsDone: 0, dayOfPlan: 1 });

  useEffect(() => {
    const data = getStoredData();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlan({ nightsDone: data.completedDays.length, dayOfPlan: getDayNumber(data.startDate) });
  }, []);

  const stats: { label: string; value: number }[] = [
    { label: "Dreams logged", value: 3 },
    { label: "Nights rehearsed", value: plan.nightsDone },
    { label: "Day of plan", value: plan.dayOfPlan },
  ];

  return (
    <div className="dash">
      {/* 1. Profile header */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: "var(--accent-soft)",
            color: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="moon" size={30} />
        </div>
        <h1 className="serif-hero" style={{ fontSize: "clamp(24px, 5vw, 30px)" }}>
          You
        </h1>
        <p
          className="subhead"
          style={{ fontFamily: "var(--font-mono), var(--mono)", fontSize: 13 }}
        >
          you@example.com
        </p>
      </div>

      {/* 2. Stats strip */}
      <div style={{ display: "flex", gap: 12 }}>
        {stats.map((s) => (
          <div
            key={s.label}
            className="panel"
            style={{ flex: 1, textAlign: "center", padding: "14px 8px" }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono), var(--mono)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--accent)",
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--faint)",
                marginTop: 6,
                lineHeight: 1.3,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Settings list — non-functional stubs */}
      <div className="panel" style={{ padding: "6px 18px" }}>
        <div className="panel-label" style={{ marginTop: 12 }}>
          Settings
        </div>
        {SETTINGS_ROWS.map((row, i) => (
          <button
            key={row.label}
            type="button"
            onClick={() => {}}
            style={{
              appearance: "none",
              width: "100%",
              background: "none",
              border: "none",
              borderTop: i === 0 ? "none" : "1px solid var(--line)",
              cursor: "pointer",
              font: "inherit",
              fontFamily: "var(--font-body), var(--sans)",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 13,
              minHeight: 52,
              padding: "10px 0",
              color: "var(--text)",
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flex: "none",
                background: "var(--accent-soft)",
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={row.icon} size={18} />
            </span>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14.5 }}>{row.label}</span>
            <span style={{ color: "var(--faint)", display: "flex" }}>
              <Icon name="arrowright" size={18} />
            </span>
          </button>
        ))}
      </div>

      {/* 4. Sign out */}
      <button type="button" className="btn btn--ghost btn--block" onClick={onSignOut}>
        Sign out
      </button>

      {/* 5. Clinical disclaimer — small, faint, non-obtrusive */}
      <p
        style={{
          fontSize: 11.5,
          color: "var(--faint)",
          textAlign: "center",
          lineHeight: 1.5,
          maxWidth: "34rem",
          marginInline: "auto",
        }}
      >
        DreamAI uses AI-powered Image Rehearsal Therapy (IRT) to help transform nightmares.
        {" "}In collaboration with Dr. Michael Breus, PhD.
        {" "}Not a substitute for professional mental health care.
      </p>
    </div>
  );
}
