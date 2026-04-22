"use client";

import { useState } from "react";
import type { Medicine } from "@/lib/types";

export default function SimulateReminderButton({ medicines }: { medicines: Medicine[] }) {
  const [speaking, setSpeaking] = useState(false);

  function speak() {
    if (!window.speechSynthesis || medicines.length === 0) return;
    window.speechSynthesis.cancel();

    const medList = medicines.map((m) => `${m.name}, ${m.dosage}`).join(". Next: ");
    const text = `Good morning! Time for your medicines. Please take: ${medList}. Stay healthy!`;

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.85;
    utter.pitch = 1.05;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utter);
  }

  return (
    <button
      onClick={speak}
      disabled={speaking || medicines.length === 0}
      className="btn-sage w-full py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {speaking ? "🔊 Playing reminder..." : "🔔 Simulate Medicine Reminder"}
    </button>
  );
}
