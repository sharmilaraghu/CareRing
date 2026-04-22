"use client";

import type { Symptom } from "@/lib/types";

const SEV_CONFIG: Record<string, { bg: string; badge: string; dot: string }> = {
  high:   { bg: "#FDECEA", badge: "badge-high",   dot: "bg-red-500" },
  medium: { bg: "#FEF3DC", badge: "badge-medium", dot: "bg-amber-400" },
  low:    { bg: "#EDF4EF", badge: "badge-low",    dot: "bg-green-500" },
};

export default function SymptomsHistory({ symptoms }: { symptoms: Symptom[] }) {
  return (
    <div className="card-vintage p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🌡️</span>
        <div>
          <p className="mono-label">Symptom History</p>
          <p className="text-[var(--brown-light)] text-xs">Last {symptoms.length} reports</p>
        </div>
      </div>

      {symptoms.length === 0 ? (
        <p className="text-sm text-[var(--brown-light)] italic text-center py-3">
          No symptoms reported yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {symptoms.map((s) => {
            const cfg = SEV_CONFIG[s.severity] ?? SEV_CONFIG.low;
            return (
              <div
                key={s.id}
                className="rounded-xl px-3 py-2.5 border-2 border-[var(--card-border)] flex items-center gap-3"
                style={{ background: cfg.bg }}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--brown)] capitalize">{s.name}</p>
                  <p className="mono-label">{s.duration ?? "—"}</p>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                  {s.severity.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
