"use client";

import type { Prescription, Medicine } from "@/lib/types";

interface Props {
  prescription: Prescription | null;
  medicines: Medicine[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function followUpUrgency(followUpDate?: string): "urgent" | "soon" | "ok" | null {
  if (!followUpDate) return null;
  const days = Math.ceil(
    (new Date(followUpDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 0) return "urgent";
  if (days <= 7) return "soon";
  return "ok";
}

export default function PrescriptionCard({ prescription, medicines }: Props) {
  const urgency = followUpUrgency(prescription?.follow_up_date);

  return (
    <div className="card-vintage p-5">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <div>
          <p className="mono-label">Prescription</p>
          {prescription && (
            <p className="text-[var(--brown-light)] text-xs">
              {prescription.doctor_name}
              {prescription.doctor_qualification ? `, ${prescription.doctor_qualification}` : ""}
              {prescription.clinic_name ? ` · ${prescription.clinic_name}` : ""}
            </p>
          )}
        </div>
      </div>

      {/* Prescription metadata */}
      {prescription && (
        <div className="flex flex-wrap gap-2 mb-4">
          {prescription.prescription_date && (
            <span
              className="text-xs px-2 py-1 rounded-lg border border-[var(--card-border)]"
              style={{ background: "var(--cream)", color: "var(--brown-mid)", fontFamily: "var(--font-mono)" }}
            >
              📅 {formatDate(prescription.prescription_date)}
            </span>
          )}
          {prescription.patient_age && (
            <span
              className="text-xs px-2 py-1 rounded-lg border border-[var(--card-border)]"
              style={{ background: "var(--cream)", color: "var(--brown-mid)", fontFamily: "var(--font-mono)" }}
            >
              Age {prescription.patient_age}
            </span>
          )}
          {prescription.follow_up_date && (
            <span
              className="text-xs px-2 py-1 rounded-lg border font-semibold"
              style={{
                background: urgency === "urgent" ? "#FDECEA" : urgency === "soon" ? "#FEF3DC" : "#EDF4EF",
                borderColor: urgency === "urgent" ? "#C1292E40" : urgency === "soon" ? "#D4A57440" : "#6B9B7A40",
                color: urgency === "urgent" ? "#C1292E" : "var(--brown-mid)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {urgency === "urgent" ? "⚠️ " : "🗓 "}Follow up: {formatDate(prescription.follow_up_date)}
            </span>
          )}
        </div>
      )}

      {/* Doctor's advice */}
      {prescription?.doctor_advice && (
        <div
          className="rounded-xl px-3 py-2 mb-4 border border-[var(--card-border)] text-xs text-[var(--brown-mid)] italic"
          style={{ background: "var(--cream)" }}
        >
          &ldquo;{prescription.doctor_advice}&rdquo;
        </div>
      )}

      {/* Medicines */}
      {medicines.length > 0 && (
        <div className="flex flex-col gap-2">
          {medicines.map((m) => (
            <div
              key={m.id}
              className="rounded-xl px-3 py-2.5 border-2 border-[var(--card-border)]"
              style={{ background: "var(--cream)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg shrink-0">💊</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--brown)] text-sm leading-tight">
                    {m.name} {m.dosage}
                  </p>
                  <p className="mono-label">
                    {m.quantity} · {m.frequency}
                    {m.instructions ? ` · ${m.instructions}` : ""}
                  </p>
                </div>
                {m.times?.length > 0 && (
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {m.times.map((t) => (
                      <span
                        key={t}
                        className="text-xs font-mono px-2 py-0.5 rounded-lg border border-[var(--card-border)]"
                        style={{ background: m.with_food ? "#EDF4EF" : "var(--cream)", color: "var(--brown-mid)" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {m.with_food && (
                <p className="mono-label mt-1 ml-9 text-[var(--sage)]">🍽 Take with food</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
