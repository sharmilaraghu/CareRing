"use client";

import { useState } from "react";
import type { Alert } from "@/lib/types";

const LEVEL_CONFIG: Record<string, { emoji: string; bg: string; badge: string; text: string }> = {
  high:   { emoji: "🚨", bg: "#FDECEA", badge: "badge-high",   text: "HIGH" },
  medium: { emoji: "⚠️",  bg: "#FEF3DC", badge: "badge-medium", text: "MED" },
  low:    { emoji: "ℹ️",  bg: "#EDF4EF", badge: "badge-low",    text: "LOW" },
};

interface Props {
  alerts: Alert[];
  onAcknowledge: (conversationId: string) => Promise<void>;
}

export default function AlertsList({ alerts, onAcknowledge }: Props) {
  const [acking, setAacking] = useState<string | null>(null);

  const active = alerts.filter((a) => !a.acknowledged);
  const done = alerts.filter((a) => a.acknowledged);

  async function handleAck(conversationId: string) {
    setAacking(conversationId);
    await onAcknowledge(conversationId);
    setAacking(null);
  }

  return (
    <div className="card-vintage p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🔔</span>
        <div>
          <p className="mono-label">Alerts</p>
          <p className="text-[var(--brown-light)] text-xs">
            {active.length} active · {done.length} acknowledged
          </p>
        </div>
      </div>

      {active.length === 0 && done.length === 0 && (
        <p className="text-sm text-[var(--brown-light)] italic text-center py-3">
          No alerts yet.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {active.map((alert) => {
          const cfg = LEVEL_CONFIG[alert.level] ?? LEVEL_CONFIG.low;
          return (
            <div
              key={alert.id}
              className="rounded-xl px-3 py-3 border-2 border-[var(--card-border)] flex gap-3 items-start"
              style={{ background: cfg.bg }}
            >
              <span className="text-xl shrink-0 mt-0.5">{cfg.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    {cfg.text}
                  </span>
                  <p className="mono-label">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <p className="text-sm font-semibold text-[var(--brown)] leading-snug">{alert.reason}</p>
              </div>
              <button
                onClick={() => handleAck(alert.conversation_id ?? alert.id)}
                disabled={acking === alert.id}
                className="shrink-0 mono-label px-2 py-1 rounded-lg border-2 border-[var(--card-border)] bg-[var(--cream)] disabled:opacity-50 hover:bg-[var(--sage)] hover:text-white transition-colors"
              >
                {acking === alert.id ? "..." : "Done"}
              </button>
            </div>
          );
        })}

        {done.length > 0 && (
          <>
            <p className="mono-label mt-2 text-[var(--brown-light)]">Acknowledged</p>
            {done.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl px-3 py-2 border border-[var(--card-border)] flex gap-3 items-center opacity-50"
                style={{ background: "var(--cream)" }}
              >
                <span className="text-base">✅</span>
                <p className="text-xs text-[var(--brown-mid)] flex-1 truncate">{alert.reason}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
