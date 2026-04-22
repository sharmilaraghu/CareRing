"use client";

interface Props {
  onTalkToRosie: () => void;
}

export default function AssistantHelp({ onTalkToRosie }: Props) {
  return (
    <div className="card-vintage p-5" style={{ animationDelay: "120ms" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">🌸</span>
        <p className="mono-label">Need help or have symptoms?</p>
      </div>

      <p className="text-sm text-[var(--brown-mid)] mb-4 leading-relaxed">
        If you&apos;re not feeling well, have new symptoms, or just need someone to talk to — Rosie is here for you.
      </p>

      <button
        onClick={onTalkToRosie}
        className="w-full py-3 px-4 rounded-xl border-2 font-semibold text-[var(--brown)] transition-all"
        style={{
          background: "var(--cream)",
          borderColor: "var(--terracotta)",
        }}
      >
        🌸 Talk to Rosie
      </button>

      <div className="flex flex-col gap-2 mt-4 pt-4 border-t-2" style={{ borderColor: "var(--card-border)" }}>
        <p className="mono-label text-xs mb-2">You can tell Rosie about:</p>
        {[
          "Any symptoms you're experiencing",
          "If you missed a medicine",
          "How you're feeling emotionally",
          "Any concerns or questions",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs text-[var(--brown-mid)]">
            <span>•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
