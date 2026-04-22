"use client";

import { useState, useRef } from "react";
import type { Medicine, Prescription } from "@/lib/types";

interface Props {
  onUploaded: (data: { prescription: Prescription; medicines: Medicine[] }) => void;
  elderId: string;
}

export default function PrescriptionUploader({ onUploaded, elderId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("elderId", elderId);

    try {
      const res = await fetch("/api/upload-prescription", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onUploaded({ prescription: data.prescription, medicines: data.medicines });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="card-vintage p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <div>
          <p className="mono-label">Upload Prescription</p>
          <p className="text-[var(--brown-light)] text-xs">Image or PDF</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="rounded-xl border-2 border-dashed border-[var(--card-border)] flex flex-col items-center justify-center gap-2 py-8 cursor-pointer transition-colors"
        style={{ background: "var(--cream)" }}
      >
        <span className="text-4xl">{uploading ? "⏳" : "📄"}</span>
        <p className="text-sm font-semibold text-[var(--brown-mid)]">
          {uploading ? "Reading your prescription..." : "Tap or drop file here"}
        </p>
        <p className="mono-label">JPG · PNG · PDF</p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {error && (
        <p className="mt-3 text-xs text-red-600 font-semibold mono-label">Error: {error}</p>
      )}
      {success && (
        <p className="mt-3 text-xs text-[var(--sage)] font-semibold mono-label">
          ✓ Prescription parsed successfully
        </p>
      )}
    </div>
  );
}
