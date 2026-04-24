"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  elderId: string;
}

export default function VoiceCloner({ elderId }: Props) {
  const [status, setStatus] = useState<"idle" | "uploading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [speakerName, setSpeakerName] = useState("");
  const [hasClone, setHasClone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Check if a clone already exists
  useEffect(() => {
    fetch(`/api/voice-clone?elderId=${elderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.hasClone) {
          setHasClone(true);
          setStatus("ready");
        }
      })
      .catch(() => {});
  }, [elderId]);

  async function handleFile(file: File) {
    setStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("elderId", elderId);
    formData.append("speakerName", speakerName || "Family Member");

    try {
      const res = await fetch("/api/voice-clone", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Voice cloning failed");
      setStatus("ready");
      setHasClone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voice cloning failed");
      setStatus("error");
    }
  }

  return (
    <div className="card-vintage p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🎙️</span>
        <div>
          <p className="mono-label">Clone Your Voice</p>
          <p className="text-[var(--brown-light)] text-xs">
            Medicine reminders will sound like you
          </p>
        </div>
      </div>

      {status === "ready" && hasClone && (
        <div
          className="rounded-xl px-4 py-3 border-2 flex items-center gap-3 mb-4"
          style={{ background: "#EDF4EF", borderColor: "#6B9B7A40" }}
        >
          <span className="text-xl">✅</span>
          <div>
            <p className="text-sm font-semibold text-[var(--brown)]">Voice cloned!</p>
            <p className="mono-label text-xs">Reminders now use your voice</p>
          </div>
        </div>
      )}

      {status !== "ready" && (
        <>
          <div className="mb-3">
            <label className="mono-label text-xs">Your Name</label>
            <input
              type="text"
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              placeholder="e.g., Sarah (daughter)"
              className="w-full mt-1 px-3 py-2 rounded-lg border-2 border-[var(--card-border)] text-sm"
            />
          </div>

          <div
            onClick={() => status !== "uploading" && fileRef.current?.click()}
            className="rounded-xl border-2 border-dashed border-[var(--card-border)] flex flex-col items-center justify-center gap-2 py-6 cursor-pointer transition-colors"
            style={{ background: "var(--cream)" }}
          >
            <span className="text-3xl">{status === "uploading" ? "⏳" : "🎤"}</span>
            <p className="text-sm font-semibold text-[var(--brown-mid)]">
              {status === "uploading" ? "Cloning your voice..." : "Upload a voice recording"}
            </p>
            <p className="mono-label text-xs">30+ seconds of clear speech · MP3, WAV, M4A</p>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </>
      )}

      {status === "error" && error && (
        <p className="mt-3 text-xs text-red-600 font-semibold mono-label">Error: {error}</p>
      )}

      {status === "ready" && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => { setStatus("idle"); setHasClone(false); }}
            className="mono-label text-xs text-[var(--terracotta)] underline"
          >
            Upload a different voice
          </button>
          <button
            onClick={async () => {
              try {
                await fetch("/api/voice-clone", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ elderId }),
                });
                setStatus("idle");
                setHasClone(false);
              } catch {
                setError("Failed to delete voice");
              }
            }}
            className="mono-label text-xs text-red-600 underline"
          >
            Delete cloned voice
          </button>
        </div>
      )}
    </div>
  );
}
