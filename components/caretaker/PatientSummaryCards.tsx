"use client";

import type { PatientSummary } from "@/lib/types";

const MOOD_EMOJI: Record<string, string> = {
  happy: "😊", neutral: "😐", sad: "😔", anxious: "😟",
};

export default function PatientSummaryCards({ summary }: { summary: PatientSummary }) {
  const { medicines, recentSymptoms, latestMood, unacknowledgedAlerts } = summary;

  const cards = [
    {
      emoji: "💊",
      label: "Medicines",
      value: medicines.length > 0 ? `${medicines.length} prescribed` : "None yet",
      sub: medicines.length > 0
        ? medicines.slice(0, 2).map((m) => m.name).join(", ")
        : "Upload a prescription",
      bg: "#EDF4EF",
    },
    {
      emoji: "🌡️",
      label: "Recent Symptoms",
      value: recentSymptoms.length > 0 ? `${recentSymptoms.length} reported` : "All clear 🌟",
      sub: recentSymptoms[0]?.name ?? "No symptoms reported",
      bg: recentSymptoms.some((s) => s.severity === "high") ? "#FDECEA" : "var(--cream)",
    },
    {
      emoji: MOOD_EMOJI[latestMood?.emotion ?? "neutral"] ?? "😐",
      label: "Mood",
      value: latestMood?.emotion ? capitalize(latestMood.emotion) : "Unknown",
      sub: latestMood
        ? new Date(latestMood.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "No check-in yet",
      bg: latestMood?.emotion === "happy" ? "#EDF4EF" : latestMood?.emotion === "anxious" || latestMood?.emotion === "sad" ? "#FEF3DC" : "var(--cream)",
    },
    {
      emoji: "🔔",
      label: "Active Alerts",
      value: unacknowledgedAlerts.length > 0 ? `${unacknowledgedAlerts.length} unread` : "All clear ✅",
      sub: unacknowledgedAlerts[0]?.reason ?? "No active alerts",
      bg: unacknowledgedAlerts.some((a) => a.level === "high") ? "#FDECEA" : unacknowledgedAlerts.length > 0 ? "#FEF3DC" : "#EDF4EF",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map(({ emoji, label, value, sub, bg }) => (
        <div
          key={label}
          className="card-vintage p-4 flex flex-col gap-1"
          style={{ background: bg }}
        >
          <span className="text-2xl">{emoji}</span>
          <p className="mono-label">{label}</p>
          <p className="font-semibold text-[var(--brown)] text-sm leading-tight">{value}</p>
          <p className="text-[var(--brown-light)] text-xs truncate">{sub}</p>
        </div>
      ))}
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
