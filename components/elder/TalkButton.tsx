"use client";

import { useCallback } from "react";
import useVoiceInterface, { type VoiceStatus } from "@/components/VoiceInterface";

interface Props {
  onSessionEnd: (transcript: string) => void;
}

const STATUS_LABEL: Record<VoiceStatus, string> = {
  idle:           "Talk to Rosie 🌸",
  micRequested:   "Allow microphone...",
  connecting:     "Connecting to Rosie...",
  connected:      "Rosie is listening · Tap to stop",
  disconnected:   "Finishing up...",
};

export default function TalkButton({ onSessionEnd }: Props) {
  const handleEnd = useCallback(
    ({ transcript }: { transcript: string }) => onSessionEnd(transcript),
    [onSessionEnd]
  );

  const { status, start, stop } = useVoiceInterface({
    onSessionEnd: handleEnd,
    onError: (err) => console.error("Voice error:", err),
  });

  const isActive = status === "connected" || status === "connecting";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Waveform animation when active */}
      {status === "connected" && (
        <div className="flex items-end gap-1 h-10">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-2 rounded-full animate-wave-bar"
              style={{
                background: "var(--terracotta)",
                height: "100%",
                animationDelay: `${i * 80}ms`,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
      )}

      {/* Pulse ring when connecting */}
      {status === "connecting" && (
        <div className="relative w-10 h-10 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{ background: "var(--terracotta)" }}
          />
          <div className="w-5 h-5 rounded-full bg-[var(--terracotta)]" />
        </div>
      )}

      <button
        onClick={isActive ? stop : start}
        disabled={status === "disconnected"}
        className="btn-terra w-full py-5 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isActive ? "#A85239" : "var(--terracotta)",
          fontSize: "1.2rem",
        }}
      >
        {isActive ? "🛑 " : "🎙️ "}{STATUS_LABEL[status]}
      </button>
    </div>
  );
}
