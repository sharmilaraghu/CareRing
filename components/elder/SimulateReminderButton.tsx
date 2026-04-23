"use client";

import { useState } from "react";
import type { Medicine } from "@/lib/types";
import { playTTSReminder, buildReminderText } from "@/lib/ttsReminder";

export default function SimulateReminderButton({ medicines }: { medicines: Medicine[] }) {
  const [speaking, setSpeaking] = useState(false);

  async function speak() {
    if (medicines.length === 0) return;
    const text = buildReminderText(medicines.map((m) => ({ name: m.name, dosage: m.dosage })));
    if (!text) return;
    await playTTSReminder(text, () => setSpeaking(true), () => setSpeaking(false));
  }

  return (
    <button
      onClick={speak}
      disabled={speaking || medicines.length === 0}
      className="btn-sage w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {speaking ? "🔊 Playing reminder..." : "🔔 Medicine Reminder"}
    </button>
  );
}
