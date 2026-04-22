"use client";

import type { MoodLog } from "@/lib/types";

const MOOD_MAP: Record<string, { emoji: string; label: string; bg: string; border: string }> = {
  happy:   { emoji: "😊", label: "Feeling good!",     bg: "#EDF4EF", border: "#6B9B7A50" },
  neutral: { emoji: "😐", label: "Feeling okay",      bg: "var(--cream)", border: "var(--card-border)" },
  sad:     { emoji: "😔", label: "Feeling a bit low",  bg: "#EEF2FF", border: "#6B7FD450" },
  anxious: { emoji: "😟", label: "Feeling anxious",   bg: "#FEF3DC", border: "#D4A57450" },
};

export default function MoodCard({ mood }: { mood: MoodLog | null }) {
  const m = mood ? MOOD_MAP[mood.emotion] ?? MOOD_MAP.neutral : null;

  return (
    <div
      className="card-vintage p-5"
      style={{
        background: m?.bg ?? "var(--card-bg)",
        borderColor: m?.border?.includes("var") ? undefined : m?.border,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-4xl">{m?.emoji ?? "🤔"}</span>
        <div>
          <p className="mono-label">Last Mood</p>
          <p className="font-serif text-xl text-[var(--brown)]">
            {m?.label ?? "No check-in yet"}
          </p>
          {mood && (
            <p className="mono-label mt-0.5">
              {new Date(mood.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
