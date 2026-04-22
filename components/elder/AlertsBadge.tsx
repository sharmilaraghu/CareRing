"use client";

import type { Alert } from "@/lib/types";

export default function AlertsBadge({ alerts }: { alerts: Alert[] }) {
  const count = alerts.length;
  const highest = alerts.find((a) => a.level === "high")
    ?? alerts.find((a) => a.level === "medium")
    ?? alerts[0];

  if (count === 0) {
    return (
      <div
        className="card-vintage px-4 py-3 flex items-center gap-3"
        style={{ background: "#EDF4EF", borderColor: "#6B9B7A50" }}
      >
        <span className="text-xl">✅</span>
        <div>
          <p className="mono-label">Alerts</p>
          <p className="text-[var(--sage)] font-semibold text-sm">All clear!</p>
        </div>
      </div>
    );
  }

  const levelColors: Record<string, string> = {
    high:   "#FDECEA",
    medium: "#FEF3DC",
    low:    "#EDF4EF",
  };

  return (
    <div
      className="card-vintage px-4 py-3 flex items-center gap-3"
      style={{ background: levelColors[highest?.level ?? "low"] }}
    >
      <span className="text-2xl animate-wiggle">🔔</span>
      <div className="flex-1 min-w-0">
        <p className="mono-label">Active Alerts</p>
        <p className="font-semibold text-[var(--brown)] text-sm truncate">
          {count} alert{count !== 1 ? "s" : ""} — {highest?.reason}
        </p>
      </div>
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ background: highest?.level === "high" ? "#C1292E" : highest?.level === "medium" ? "#D4A574" : "#6B9B7A" }}
      >
        {count}
      </span>
    </div>
  );
}
