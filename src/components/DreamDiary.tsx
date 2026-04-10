"use client";

interface DreamAnalysis {
  setting?: string;
  characters?: string[];
  narrative?: string;
  sensory_details?: {
    visual?: string;
    auditory?: string;
    tactile?: string;
    olfactory?: string;
  };
  emotions?: { emotion: string; intensity: number }[];
  themes?: string[];
  nightmare_intensity?: number;
  waking_life_links?: string;
  turning_point?: string;
}

export default function DreamDiary({ analysis }: { analysis: DreamAnalysis }) {
  if (!analysis || typeof analysis === "string") return null;

  return (
    <div className="w-full max-w-lg space-y-4 animate-slide-up">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
          Dream Diary Entry
        </h2>
        <p className="text-[var(--text-secondary)] text-sm">
          AI-structured analysis based on IRT protocol
        </p>
      </div>

      {/* Intensity bar */}
      {analysis.nightmare_intensity !== undefined && (
        <div className="glass rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Distress Level</span>
            <span className="text-lg font-bold" style={{
              color: analysis.nightmare_intensity >= 7 ? 'var(--danger)' :
                     analysis.nightmare_intensity >= 4 ? '#F59E0B' : 'var(--success)'
            }}>
              {analysis.nightmare_intensity}/10
            </span>
          </div>
          <div className="w-full h-2 bg-[var(--bg-deep)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${analysis.nightmare_intensity * 10}%`,
                background: analysis.nightmare_intensity >= 7
                  ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                  : analysis.nightmare_intensity >= 4
                  ? 'linear-gradient(90deg, #34D399, #F59E0B)'
                  : 'linear-gradient(90deg, #34D399, #6B8AFF)',
              }}
            />
          </div>
        </div>
      )}

      {/* Setting */}
      {analysis.setting && (
        <DiaryField icon="location" label="Setting" value={analysis.setting} />
      )}

      {/* Narrative */}
      {analysis.narrative && (
        <DiaryField icon="narrative" label="Dream Narrative" value={analysis.narrative} />
      )}

      {/* Characters */}
      {analysis.characters && analysis.characters.length > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs">👤</span>
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Characters</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.characters.map((c, i) => (
              <span key={i} className="text-xs bg-[var(--bg-deep)] text-[var(--text-secondary)] px-3 py-1.5 rounded-full">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sensory Details */}
      {analysis.sensory_details && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs">🔮</span>
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Sensory Details</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          </div>
        </div>
      )}

      {/* Emotions */}
      {analysis.emotions && analysis.emotions.length > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs">💭</span>
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Emotions</span>
          </div>
          <div className="space-y-2">
            {analysis.emotions.map((e, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm text-[var(--text-secondary)] w-28 shrink-0">{e.emotion}</span>
                <div className="flex-1 h-1.5 bg-[var(--bg-deep)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent-warm)]"
                    style={{ width: `${e.intensity * 10}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--text-muted)] w-6 text-right">{e.intensity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Themes */}
      {analysis.themes && analysis.themes.length > 0 && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs">🔗</span>
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Themes</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.themes.map((t, i) => (
              <span key={i} className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1.5 rounded-full border border-[var(--accent)]/20">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Turning Point */}
      {analysis.turning_point && (
        <div className="glass rounded-xl p-4 border-l-2 border-[var(--danger)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-[var(--danger)] uppercase tracking-wider">Critical Turning Point</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{analysis.turning_point}</p>
        </div>
      )}

      {/* Waking Life Links */}
      {analysis.waking_life_links && (
        <DiaryField icon="link" label="Waking Life Connections" value={analysis.waking_life_links} />
      )}
    </div>
  );
}

function DiaryField({ label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-4">
      <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">{label}</span>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{value}</p>
    </div>
  );
}

function SenseCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--bg-deep)] rounded-lg p-3">
      <span className="text-[10px] font-medium text-[var(--accent)] uppercase tracking-wider block mb-1">{label}</span>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{value}</p>
    </div>
  );
}
