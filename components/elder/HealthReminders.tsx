"use client";

const reminders = [
  { emoji: "💧", label: "Drink Water", message: "Stay hydrated!" },
  { emoji: "🚶", label: "Take a Walk", message: "A short walk helps!" },
  { emoji: "🧘", label: "Move Around", message: "Stretch a little!" },
];

export default function HealthReminders() {
  return (
    <div className="card-vintage p-5" style={{ animationDelay: "120ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🌿</span>
        <p className="mono-label">Daily Reminders</p>
      </div>

      <div className="flex flex-col gap-2">
        {reminders.map((r) => (
          <div
            key={r.label}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 border-2"
            style={{ background: "var(--cream)", borderColor: "var(--card-border)" }}
          >
            <span className="text-xl">{r.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-[var(--brown)] text-sm">{r.label}</p>
              <p className="mono-label text-xs">{r.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
