"use client";

import { Icon } from "@/lib/icons";

interface DreamAnalysis {
  setting?: string;
  characters?: string[];
  narrative?: string;
  sensory_details?: {
    visual?: string;
    auditory?: string;
    tactile?: string;
    olfactory?: string;
    proprioceptive?: string;
  };
  emotions?: { emotion: string; intensity: number }[];
  somatic_response?: string;
  nightmare_classification?: string;
  core_threat?: string;
  dream_distortions?: string[];
  themes?: string[];
  nightmare_intensity?: number;
  recurrence_indicators?: string;
  waking_life_links?: string;
  turning_point?: string;
  intervention_window?: string;
}

export default function DreamDiary({ analysis }: { analysis: DreamAnalysis }) {
  if (!analysis || typeof analysis === "string") return null;

  return (
    <div className="dream-diary w-full max-w-lg space-y-4 animate-slide-up">
      <div className="text-center space-y-2 mb-6">
        <h2 className="serif-hero" style={{ fontSize: "clamp(28px, 5vw, 36px)" }}>
          Dream Diary Entry
        </h2>
        <p className="subhead">
          AI-structured analysis based on IRT protocol
        </p>
      </div>

      {/* 1. Narrative — the story, reflected back first */}
      {analysis.narrative && (
        <DiaryField label="Dream Narrative" value={analysis.narrative} />
      )}

      {/* 2. Setting */}
      {analysis.setting && (
        <DiaryField label="Setting" value={analysis.setting} />
      )}

      {/* 3. Characters */}
      {analysis.characters && analysis.characters.length > 0 && (
        <div className="panel">
          <div className="panel-label dd-section-label flex items-center gap-2">
            <Icon name="moon" size={13} style={{ color: "var(--accent)" }} />
            Characters
          </div>
          <div className="pills">
            {analysis.characters.map((c, i) => (
              <span key={i} className="pill">{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* 4. Sensory Details */}
      {analysis.sensory_details && (
        <div className="panel">
          <div className="panel-label dd-section-label flex items-center gap-2">
            <Icon name="sparkline" size={13} style={{ color: "var(--accent)" }} />
            Sensory Details
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.sensory_details.visual && (
              <SenseCard label="Visual" value={analysis.sensory_details.visual} />
            )}
            {analysis.sensory_details.auditory && (
              <SenseCard label="Auditory" value={analysis.sensory_details.auditory} />
            )}
            {analysis.sensory_details.tactile && (
              <SenseCard label="Tactile" value={analysis.sensory_details.tactile} />
            )}
            {analysis.sensory_details.olfactory && (
              <SenseCard label="Olfactory" value={analysis.sensory_details.olfactory} />
            )}
            {analysis.sensory_details.proprioceptive && (
              <SenseCard label="Body Sense" value={analysis.sensory_details.proprioceptive} />
            )}
          </div>
        </div>
      )}

      {/* 5. Emotions */}
      {analysis.emotions && analysis.emotions.length > 0 && (
        <div className="panel">
          <div className="panel-label dd-section-label flex items-center gap-2">
            <Icon name="brain" size={13} style={{ color: "var(--accent)" }} />
            Emotions
          </div>
          <div className="space-y-2">
            {analysis.emotions.map((e, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm w-20 sm:w-28 shrink-0" style={{ color: "var(--text)" }}>{e.emotion}</span>
                <div className="flex-1 min-w-0 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${e.intensity * 10}%`, background: "var(--accent)" }}
                  />
                </div>
                <span
                  className="w-6 text-right"
                  style={{ fontFamily: "var(--font-mono), var(--mono)", fontSize: "12px", color: "var(--faint)" }}
                >
                  {e.intensity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Body Response */}
      {analysis.somatic_response && (
        <DiaryField label="Body Response" value={analysis.somatic_response} />
      )}

      {/* 7. Distress Level — the summarizing intensity gauge */}
      {analysis.nightmare_intensity !== undefined && (
        <div className="panel">
          <div className="flex justify-between items-center mb-2">
            <span className="panel-label dd-section-label" style={{ marginBottom: 0 }}>Distress Level</span>
            <span
              style={{
                fontFamily: "var(--font-mono), var(--mono)",
                fontWeight: 700,
                fontSize: "18px",
                color: analysis.nightmare_intensity >= 7 ? "var(--danger)" :
                       analysis.nightmare_intensity >= 4 ? "var(--amber)" : "var(--green)",
              }}
            >
              {analysis.nightmare_intensity}/10
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--line)" }}>
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${analysis.nightmare_intensity * 10}%`,
                background: analysis.nightmare_intensity >= 7
                  ? "var(--danger)"
                  : analysis.nightmare_intensity >= 4
                  ? "var(--amber)"
                  : "var(--green)",
              }}
            />
          </div>
        </div>
      )}

      {/* 8. Dream Distortions */}
      {analysis.dream_distortions && analysis.dream_distortions.length > 0 && (
        <div className="panel">
          <div className="panel-label dd-section-label">Dream Distortions</div>
          <div className="pills">
            {analysis.dream_distortions.map((d, i) => (
              <span
                key={i}
                className="pill"
                style={{
                  background: "var(--amber-soft)",
                  borderColor: "rgba(180,105,14,0.25)",
                  color: "var(--amber)",
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 9. Themes */}
      {analysis.themes && analysis.themes.length > 0 && (
        <div className="panel">
          <div className="panel-label dd-section-label flex items-center gap-2">
            <Icon name="list" size={13} style={{ color: "var(--accent)" }} />
            Themes
          </div>
          <div className="pills">
            {analysis.themes.map((t, i) => (
              <span
                key={i}
                className="pill"
                style={{
                  background: "var(--accent-soft)",
                  borderColor: "rgba(30,58,138,0.2)",
                  color: "var(--accent-d)",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 10. Recurrence Pattern */}
      {analysis.recurrence_indicators && (
        <DiaryField label="Recurrence Pattern" value={analysis.recurrence_indicators} />
      )}

      {/* 11. Waking Life Connections */}
      {analysis.waking_life_links && (
        <DiaryField label="Waking Life Connections" value={analysis.waking_life_links} />
      )}

      {/* 12. Clinical Assessment */}
      {(analysis.nightmare_classification || analysis.core_threat) && (
        <div className="panel" style={{ borderLeft: "2px solid var(--accent)" }}>
          <div className="panel-label dd-section-label" style={{ color: "var(--accent)" }}>Clinical Assessment</div>
          {analysis.nightmare_classification && (
            <div className="mb-2">
              <span className="panel-label" style={{ marginBottom: 0 }}>Classification</span>
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                {analysis.nightmare_classification.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              </p>
            </div>
          )}
          {analysis.core_threat && (
            <div>
              <span className="panel-label" style={{ marginBottom: 0 }}>Core Threat</span>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{analysis.core_threat}</p>
            </div>
          )}
        </div>
      )}

      {/* 13. Critical Turning Point */}
      {analysis.turning_point && (
        <div className="panel" style={{ borderLeft: "2px solid var(--danger)" }}>
          <div className="panel-label dd-section-label" style={{ color: "var(--danger)" }}>Critical Turning Point</div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{analysis.turning_point}</p>
        </div>
      )}

      {/* 14. Rescripting Entry Point — bridges into "Let's Go Deeper" */}
      {analysis.intervention_window && (
        <div className="panel" style={{ borderLeft: "2px solid var(--green)" }}>
          <div className="panel-label dd-section-label" style={{ color: "var(--green)" }}>Rescripting Entry Point</div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{analysis.intervention_window}</p>
        </div>
      )}
    </div>
  );
}

function DiaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel">
      <div className="panel-label dd-section-label">{label}</div>
      <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{value}</p>
    </div>
  );
}

function SenseCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: "var(--bg-2-h)", border: "1px solid var(--line)" }}
    >
      <div className="panel-label" style={{ color: "var(--accent)", marginBottom: "4px" }}>{label}</div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>{value}</p>
    </div>
  );
}
