"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [pressed, setPressed] = useState<string | null>(null);

  function go(role: "elder" | "caretaker") {
    setPressed(role);
    setTimeout(() => router.push(`/${role}`), 220);
  }

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--cream)" }}>

      {/* ── Logo bar ── */}
      <div className="flex items-center justify-center gap-2 py-4 px-5 shrink-0">
        <span className="text-xl">🩺</span>
        <h1 className="font-serif text-2xl text-[var(--brown)]">CareRing</h1>
        <span className="mono-label ml-2" style={{ fontSize: "0.55rem" }}>EST. 2026</span>
      </div>

      {/* ── Split navigation ── */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* Patient half */}
        <button
          onClick={() => go("elder")}
          className="flex-1 relative flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #E8C49A 0%, #C4674A 100%)",
            opacity: pressed === "caretaker" ? 0.5 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {/* Grain texture */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' x='0' y='0' fill='%23fff' opacity='0.4'/%3E%3Crect width='1' height='1' x='2' y='2' fill='%23fff' opacity='0.3'/%3E%3C/svg%3E\")"
            }}
          />

          {/* Decorative ring */}
          <div className="absolute w-48 h-48 rounded-full border-4 border-white/10 -top-12 -right-12" />
          <div className="absolute w-32 h-32 rounded-full border-2 border-white/10 -bottom-8 -left-8" />

          {/* Content */}
          <div className="relative flex flex-col items-center gap-3 z-10">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white/30"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
            >
              <span style={{ fontSize: "3rem", lineHeight: 1 }}>🫶</span>
            </div>
            <div className="text-center">
              <p className="font-serif text-white text-2xl leading-tight drop-shadow">
                I need care
              </p>
              <p className="text-white/70 text-sm mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Patient · Loved one
              </p>
            </div>
          </div>

          {/* Bottom arrow hint */}
          <div className="absolute bottom-4 right-5">
            <span className="text-white/50 text-xl">→</span>
          </div>
        </button>

        {/* Divider line */}
        <div className="relative h-px shrink-0" style={{ background: "var(--brown)", opacity: 0.15 }}>
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full border"
            style={{ background: "var(--cream)", borderColor: "var(--card-border)", color: "var(--brown-light)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            or
          </div>
        </div>

        {/* Guardian half */}
        <button
          onClick={() => go("caretaker")}
          className="flex-1 relative flex flex-col items-center justify-center overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #A8C9B0 0%, #4A7A58 100%)",
            opacity: pressed === "elder" ? 0.5 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {/* Grain texture */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='1' height='1' x='0' y='0' fill='%23fff' opacity='0.4'/%3E%3Crect width='1' height='1' x='2' y='2' fill='%23fff' opacity='0.3'/%3E%3C/svg%3E\")"
            }}
          />

          {/* Decorative ring */}
          <div className="absolute w-48 h-48 rounded-full border-4 border-white/10 -bottom-12 -left-12" />
          <div className="absolute w-32 h-32 rounded-full border-2 border-white/10 -top-8 -right-8" />

          {/* Content */}
          <div className="relative flex flex-col items-center gap-3 z-10">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white/30"
              style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
            >
              <span style={{ fontSize: "3rem", lineHeight: 1 }}>🛡️</span>
            </div>
            <div className="text-center">
              <p className="font-serif text-white text-2xl leading-tight drop-shadow">
                I give care
              </p>
              <p className="text-white/70 text-sm mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Guardian · Caretaker
              </p>
            </div>
          </div>

          {/* Bottom arrow hint */}
          <div className="absolute bottom-4 right-5">
            <span className="text-white/50 text-xl">→</span>
          </div>
        </button>
      </div>

      {/* ── Footer ── */}
      <div className="shrink-0 py-2 flex items-center justify-center">
        <p className="mono-label" style={{ fontSize: "0.55rem" }}>
          Powered by Gemini · ElevenLabs
        </p>
      </div>
    </div>
  );
}
