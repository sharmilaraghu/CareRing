"use client";

import type { Medicine } from "@/lib/types";

interface Props {
  medicines: Medicine[];
  // Status derived from latest conversation's extracted medications
  statusData?: { name: string; status: "taken" | "missed" | "unknown" }[];
}

export default function MedicinesCard({ medicines, statusData = [] }: Props) {
  function getStatus(name: string) {
    const entry = statusData.find(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );
    return entry?.status ?? null;
  }

  return (
    <div
      className="card-vintage p-5"
      style={{ animationDelay: "80ms" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💊</span>
        <div>
          <p className="mono-label">Today&apos;s Medicines</p>
          <p className="text-[var(--brown-light)] text-xs">{medicines.length} prescribed</p>
        </div>
      </div>

      {medicines.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-[var(--brown-light)] text-sm italic">No medicines on record yet.</p>
          <p className="mono-label mt-1">Ask caretaker to upload prescription</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {medicines.map((med) => {
            const status = getStatus(med.name);
            return (
              <div
                key={med.id}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 border-2"
                style={{
                  background: status === "taken"
                    ? "#EDF4EF"
                    : status === "missed"
                    ? "#FDECEA"
                    : "var(--cream)",
                  borderColor: status === "taken"
                    ? "#6B9B7A50"
                    : status === "missed"
                    ? "#C1292E40"
                    : "var(--card-border)",
                }}
              >
                <span className="text-lg shrink-0">
                  {status === "taken" ? "✅" : status === "missed" ? "❌" : "⏳"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--brown)] text-sm leading-tight truncate">{med.name}</p>
                  <p className="mono-label">
                    {med.dosage} · {med.frequency}
                    {med.instructions ? ` · ${med.instructions}` : ""}
                  </p>
                </div>
                {med.times?.[0] && (
                  <span
                    className="text-xs font-mono shrink-0 px-2 py-1 rounded-lg border border-[var(--card-border)]"
                    style={{ background: "var(--cream)", color: "var(--brown-mid)" }}
                  >
                    {med.times[0]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
