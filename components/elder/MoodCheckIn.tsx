"use client";

import type { Emotion } from "@/lib/types";

interface Props {
  onSelectMood: (emotion: Emotion) => void;
  currentMood?: Emotion | null;
}

const moods: { emoji: string; value: Emotion; label: string }[] = [
  { emoji: "😊", value: "happy", label: "Great" },
  { emoji: "😔", value: "sad", label: "Not great" },
  { emoji: "😰", value: "anxious", label: "Anxious" },
  { emoji: "😐", value: "neutral", label: "Okay" },
];

export default function MoodCheckIn({ onSelectMood, currentMood }: Props) {
  return (
    <div className="card-vintage p-5" style={{ animationDelay: "40ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💝</span>
        <div>
          <p className="mono-label">How are you feeling today?</p>
          <p className="text-[var(--brown-light)] text-xs">Tap an emoji to share with Rosie</p>
        </div>
      </div>

      <div className="flex justify-around">
        {moods.map((m) => (
          <button
            key={m.value}
            onClick={() => onSelectMood(m.value)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
            style={{
              background: currentMood === m.value ? "var(--cream)" : "transparent",
              transform: currentMood === m.value ? "scale(1.1)" : "scale(1)",
            }}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="mono-label text-xs">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
