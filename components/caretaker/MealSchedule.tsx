"use client";

import { useState, useEffect } from "react";

interface Props {
  elderId: string;
}

interface Schedule {
  breakfast: string;
  lunch: string;
  dinner: string;
  bedtime: string;
}

const DEFAULTS: Schedule = {
  breakfast: "08:00",
  lunch: "13:00",
  dinner: "20:00",
  bedtime: "22:00",
};

const LABELS: { key: keyof Schedule; emoji: string; label: string }[] = [
  { key: "breakfast", emoji: "🌅", label: "Breakfast" },
  { key: "lunch", emoji: "☀️", label: "Lunch" },
  { key: "dinner", emoji: "🌙", label: "Dinner" },
  { key: "bedtime", emoji: "😴", label: "Bedtime" },
];

export default function MealSchedule({ elderId }: Props) {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/meal-schedule?elderId=${elderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.breakfast) {
          setSchedule({
            breakfast: data.breakfast,
            lunch: data.lunch,
            dinner: data.dinner,
            bedtime: data.bedtime,
          });
        }
      })
      .catch(() => {});
  }, [elderId]);

  async function handleChange(key: keyof Schedule, value: string) {
    const updated = { ...schedule, [key]: value };
    setSchedule(updated);
    setSaving(true);
    setSaved(false);

    try {
      await fetch("/api/meal-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elderId, ...updated }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save meal schedule:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card-vintage p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <div>
            <p className="mono-label">Meal Times</p>
            <p className="text-[var(--brown-light)] text-xs">Medicine times adjust to this schedule</p>
          </div>
        </div>
        {saving && <span className="mono-label text-xs">Saving...</span>}
        {saved && <span className="mono-label text-xs text-[var(--sage)]">✓ Saved</span>}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {LABELS.map(({ key, emoji, label }) => (
          <div
            key={key}
            className="flex items-center gap-2 rounded-xl px-3 py-2 border-2"
            style={{ background: "var(--cream)", borderColor: "var(--card-border)" }}
          >
            <span className="text-lg">{emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--brown)] leading-tight">{label}</p>
              <input
                type="time"
                value={schedule[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full text-sm font-mono text-[var(--brown-mid)] bg-transparent border-none outline-none p-0 mt-0.5"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
