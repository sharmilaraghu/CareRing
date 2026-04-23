"use client";

import { useState } from "react";

interface Props {
  elderId: string;
  emergencyNumber?: string;
}

export default function SOSButton({ elderId, emergencyNumber = "911" }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSOS() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    // Fire a critical alert to the caretaker
    try {
      await fetch("/api/analyze-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: "SOS triggered by elder — emergency assistance requested.",
          elderId,
        }),
      });
    } catch {
      // Best-effort — don't block the phone call
    }

    setSent(true);

    // Open phone dialer
    window.location.href = `tel:${emergencyNumber}`;

    // Reset after 10 seconds
    setTimeout(() => {
      setConfirming(false);
      setSent(false);
    }, 10000);
  }

  function handleCancel() {
    setConfirming(false);
  }

  if (sent) {
    return (
      <div
        className="rounded-full px-4 py-3 flex items-center justify-center gap-2"
        style={{ background: "#EDF4EF", border: "2px solid #6B9B7A" }}
      >
        <span className="text-lg">✅</span>
        <span className="text-sm font-semibold text-[#4A7A58]">
          Calling {emergencyNumber} — caretaker notified
        </span>
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleSOS}
          className="flex-1 py-3 rounded-full text-white font-bold text-sm"
          style={{ background: "#C1292E", border: "2px solid #A01F23" }}
        >
          🚨 Yes, call {emergencyNumber}
        </button>
        <button
          onClick={handleCancel}
          className="py-3 px-4 rounded-full font-semibold text-sm border-2"
          style={{ borderColor: "var(--card-border)", color: "var(--brown-light)" }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSOS}
      className="w-full py-3 rounded-full text-white font-bold text-base"
      style={{
        background: "#C1292E",
        border: "2px solid #A01F23",
        boxShadow: "3px 4px 0px #8B1A1E",
      }}
    >
      🚨 SOS Emergency
    </button>
  );
}
