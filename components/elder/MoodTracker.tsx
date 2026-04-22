"use client";

import { useState } from "react";
import type { Emotion } from "@/lib/types";

interface Props {
  elderId: string;
  onMoodSaved?: () => void;
  currentMood?: Emotion | null;
}

const moods: { emoji: string; value: Emotion; label: string }[] = [
  { emoji: "😊", value: "happy", label: "Great" },
  { emoji: "🙂", value: "good", label: "Good" },
  { emoji: "😐", value: "neutral", label: "Okay" },
  { emoji: "😔", value: "sad", label: "Low" },
  { emoji: "😰", value: "anxious", label: "Anxious" },
];

export default function MoodTracker({ elderId, onMoodSaved, currentMood }: Props) {
  const [selected, setSelected] = useState<Emotion | null>(currentMood ?? null);
  const [saving, setSaving] = useState(false);

  async function handleSelect(emotion: Emotion) {
    if (saving) return;
    setSelected(emotion);
    setSaving(true);
    try {
      await fetch("/api/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderId, emotion }),
      });
      onMoodSaved?.();
    } catch (err) {
      console.error("Failed to save mood:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-vintage p-5" style={{ animationDelay: "20ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💝</span>
        <p className="mono-label">How are you feeling today?</p>
      </div>

      <div className="flex justify-around">
        {moods.map((m) => (
          <button
            key={m.value}
            onClick={() => handleSelect(m.value)}
            disabled={saving}
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all disabled:opacity-50"
            style={{
              background: selected === m.value ? "var(--cream)" : "transparent",
              transform: selected === m.value ? "scale(1.15)" : "scale(1)",
            }}
          >
            <span className="text-3xl">{m.emoji}</span>
            <span className="mono-label text-xs">{m.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <p className="text-center mt-3 text-sm text-[var(--brown-mid)]">
          {saving ? "Saving..." : "Saved! Rosie knows how you're feeling"}
        </p>
      )}
    </div>
  );
}
