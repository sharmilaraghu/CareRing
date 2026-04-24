"use client";

import { useEffect, useRef, useState } from "react";
import type { Medicine, MedicationLog } from "@/lib/types";
import { playTTSReminder, buildReminderText } from "@/lib/ttsReminder";

interface Props {
  elderId: string;
  medicines: Medicine[];
  medicationLogs: MedicationLog[];
  statusData?: { name: string; status: "taken" | "missed" | "unknown" }[];
  onStatusChange?: () => void;
}

interface TimelineEntry {
  medicine: Medicine;
  time: string;
  status: "taken" | "missed" | "due" | "upcoming" | "unknown";
  withFoodLabel: string;
  logStatus?: "taken" | "missed" | null;
}

function getStatus(
  med: Medicine,
  time: string,
  statusData: { name: string; status: "taken" | "missed" | "unknown" }[],
  logs: MedicationLog[],
): "taken" | "missed" | "due" | "upcoming" | "unknown" {
  // First check explicit logs (UI buttons take priority)
  const logEntry = logs.find(
    (l) => l.medicine_name?.toLowerCase() === med.name.toLowerCase()
  );
  if (logEntry) return logEntry.status as "taken" | "missed";

  // Then check voice-reported status
  const voiceEntry = statusData.find(
    (s) => s.name.toLowerCase() === med.name.toLowerCase()
  );
  if (voiceEntry) return voiceEntry.status;

  // Finally check time-based inference
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [hours, minutes] = time.split(":").map(Number);
  const medMinutes = hours * 60 + minutes;

  if (currentTime > medMinutes + 30) return "missed";
  if (currentTime >= medMinutes - 10 && currentTime <= medMinutes + 30) return "due";

  return "upcoming";
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export default function MedicineTimeline({
  elderId,
  medicines,
  medicationLogs = [],
  statusData = [],
  onStatusChange,
}: Props) {
  const lastSpokeRef = useRef<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Build timeline entries sorted by time
  const entries: TimelineEntry[] = medicines.flatMap((med) =>
    med.times.map((time) => ({
      medicine: med,
      time,
      status: getStatus(med, time, statusData, medicationLogs),
      withFoodLabel: med.with_food ? "🍽️ With food" : "⏰ Empty stomach",
      logStatus: medicationLogs.find(
        (l) => l.medicine_name?.toLowerCase() === med.name.toLowerCase()
      )?.status as "taken" | "missed" | undefined,
    }))
  ).sort((a, b) => a.time.localeCompare(b.time));

  // TTS for missed medicines (only if not already marked taken via UI)
  useEffect(() => {
    const missedMeds = entries.filter((e) => e.status === "missed" && !e.logStatus);
    const missedKey = missedMeds.map((e) => `${e.medicine.name}-${e.time}`).join(",");

    if (missedKey && missedKey !== lastSpokeRef.current) {
      lastSpokeRef.current = missedKey;
      const missedMedicines = missedMeds.map((e) => e.medicine);
      if (missedMedicines.length > 0) {
        // Fire and forget — TTS is best-effort
        const text = buildReminderText(missedMedicines.map((m) => ({ name: m.name, dosage: m.dosage })));
        if (text) {
          playTTSReminder(text, undefined, undefined, elderId).catch((err) => console.warn("TTS reminder failed:", err));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medicines.length, medicationLogs.length]);

  async function handleMark(med: Medicine, time: string, status: "taken" | "missed") {
    const key = `${med.id}-${time}`;
    setSavingId(key);
    try {
      await fetch("/api/medication-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          elderId,
          medicineId: med.id,
          medicineName: med.name,
          status,
        }),
      });
      onStatusChange?.();
    } catch (err) {
      console.error("Failed to mark medication:", err);
    } finally {
      setSavingId(null);
    }
  }

  if (medicines.length === 0) {
    return (
      <div className="card-vintage p-5" style={{ animationDelay: "40ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📅</span>
          <p className="mono-label">Today&apos;s Medicines</p>
        </div>
        <div className="text-center py-4">
          <p className="text-[var(--brown-light)] text-sm italic">No medicines on record yet.</p>
          <p className="mono-label mt-1">Your caretaker will add your prescriptions</p>
        </div>
      </div>
    );
  }

  const statusBg = (status: string) => {
    switch (status) {
      case "taken": return "#EDF4EF";
      case "missed": return "#FDECEA";
      case "due": return "#FEF3DC";
      default: return "var(--cream)";
    }
  };

  const statusBorder = (status: string) => {
    switch (status) {
      case "taken": return "#6B9B7A50";
      case "missed": return "#C1292E40";
      case "due": return "#D4A57450";
      default: return "var(--card-border)";
    }
  };

  return (
    <div className="card-vintage p-5" style={{ animationDelay: "40ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📅</span>
        <p className="mono-label">Today&apos;s Medicines</p>
      </div>

      <div className="flex flex-col gap-0">
        {entries.map((entry, idx) => {
          const key = `${entry.medicine.id}-${entry.time}`;
          const isSaving = savingId === key;
          const isTaken = entry.logStatus === "taken";
          const isMissed = entry.logStatus === "missed";

          return (
            <div key={key} className="flex gap-3">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{ background: statusBg(entry.status), border: `2px solid ${statusBorder(entry.status)}` }}
                >
                  {isTaken ? "✅" : isMissed ? "❌" : entry.status === "due" ? "🔔" : entry.status === "missed" ? "❌" : "⏳"}
                </div>
                {idx < entries.length - 1 && (
                  <div className="w-0.5 flex-1" style={{ background: "var(--card-border)", minHeight: "24px" }} />
                )}
              </div>

              {/* Content */}
              <div
                className="flex-1 rounded-xl px-3 py-2.5 mb-2 border-2"
                style={{
                  background: isTaken ? "#EDF4EF" : isMissed ? "#FDECEA" : statusBg(entry.status),
                  borderColor: isTaken ? "#6B9B7A50" : isMissed ? "#C1292E40" : statusBorder(entry.status),
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--brown)] text-sm leading-tight truncate">
                      {entry.medicine.name}
                    </p>
                    <p className="mono-label text-xs">
                      {entry.medicine.dosage} · {entry.medicine.frequency}
                    </p>
                  </div>
                  <span
                    className="text-xs font-mono shrink-0 px-2 py-1 rounded-lg border"
                    style={{
                      background: "var(--cream)",
                      borderColor: "var(--card-border)",
                      color: "var(--brown-mid)",
                    }}
                  >
                    {formatTime(entry.time)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {entry.medicine.instructions && (
                    <span className="mono-label text-xs text-[var(--brown-light)]">
                      {entry.medicine.instructions}
                    </span>
                  )}
                  {entry.medicine.with_food && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full border shrink-0"
                      style={{ background: "#EDF4EF", borderColor: "#6B9B7A40", color: "#4A7A58" }}
                    >
                      🍽 With food
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                {!entry.logStatus && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleMark(entry.medicine, entry.time, "taken")}
                      disabled={isSaving}
                      className="flex-1 py-1.5 px-2 rounded-lg border-2 text-xs font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: "#EDF4EF",
                        borderColor: "#6B9B7A50",
                        color: "#4A7A58",
                      }}
                    >
                      {isSaving ? "..." : "✅ Took it"}
                    </button>
                    <button
                      onClick={() => handleMark(entry.medicine, entry.time, "missed")}
                      disabled={isSaving}
                      className="flex-1 py-1.5 px-2 rounded-lg border-2 text-xs font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: "#FDECEA",
                        borderColor: "#C1292E40",
                        color: "#C1292E",
                      }}
                    >
                      {isSaving ? "..." : "❌ Missed"}
                    </button>
                  </div>
                )}

                {isTaken && (
                  <p className="text-xs text-[#4A7A58] mt-1 font-semibold">✓ Taken</p>
                )}
                {isMissed && (
                  <p className="text-xs text-[#C1292E] mt-1 font-semibold">✗ Missed</p>
                )}

                {!isTaken && !isMissed && entry.status === "missed" && (
                  <p className="text-xs text-[#C1292E] mt-1 font-semibold">Missed - take as soon as possible</p>
                )}
                {!isTaken && !isMissed && entry.status === "due" && (
                  <p className="text-xs text-[#9A6B00] mt-1 font-semibold">Due now!</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
