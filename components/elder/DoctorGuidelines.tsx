"use client";

import type { Prescription } from "@/lib/types";

interface Props {
  prescription: Prescription | null;
}

export default function DoctorGuidelines({ prescription }: Props) {
  if (!prescription?.doctor_advice) {
    return (
      <div className="card-vintage p-5" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💊</span>
          <p className="mono-label">Doctor&apos;s Guidelines</p>
        </div>
        <div className="text-center py-3">
          <p className="text-[var(--brown-light)] text-sm italic">No specific guidelines from your doctor yet.</p>
          <p className="mono-label mt-1">Follow your prescription as directed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-vintage p-5" style={{ animationDelay: "80ms" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">💊</span>
        <div>
          <p className="mono-label">Doctor&apos;s Guidelines</p>
          {prescription.doctor_name && (
            <p className="text-[var(--brown-light)] text-xs">From {prescription.doctor_name}</p>
          )}
        </div>
      </div>

      <div
        className="rounded-xl px-4 py-3 border-2"
        style={{ background: "#EDF4EF", borderColor: "#6B9B7A40" }}
      >
        <p className="text-sm text-[var(--brown)] leading-relaxed">
          {prescription.doctor_advice}
        </p>
      </div>

      {prescription.follow_up_date && (
        <p className="mono-label mt-3 text-xs text-[var(--brown-mid)]">
          📅 Follow-up: {new Date(prescription.follow_up_date).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      )}
    </div>
  );
}
