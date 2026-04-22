"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PatientSummary } from "@/lib/types";
import { buildElderContext } from "@/lib/elderContext";
import type { ClientToolsMap, SessionOverrides } from "@/components/VoiceInterface";
import MedicineTimeline from "@/components/elder/MedicineTimeline";
import MoodTracker from "@/components/elder/MoodTracker";
import DoctorGuidelines from "@/components/elder/DoctorGuidelines";
import AssistantHelp from "@/components/elder/AssistantHelp";
import TalkButton from "@/components/elder/TalkButton";
import AlertsBadge from "@/components/elder/AlertsBadge";

type Tab = "dashboard" | "rosie";

// TODO: Replace with auth-based elder ID once auth is implemented
const ELDER_ID = "e0000000-0000-0000-0000-000000000001";

export default function ElderPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [lastAlert, setLastAlert] = useState<{ level: string; reason: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const fetchSummary = useCallback(async () => {
    const res = await fetch(`/api/patient-summary?elderId=${ELDER_ID}`);
    if (res.ok) setSummary(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30_000);
    const onFocus = () => fetchSummary();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchSummary]);

  // ── Build client tools for Rosie ──
  const clientTools: ClientToolsMap = useMemo(() => ({
    getMedicationSchedule: async () => {
      try {
        const res = await fetch(`/api/patient-summary?elderId=${ELDER_ID}`);
        if (!res.ok) return { error: "Failed to fetch medication schedule" };
        const data = await res.json();

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();

        const todayLogs: Record<string, string> = {};
        for (const log of data.medicationLogs ?? []) {
          todayLogs[log.medicine_name?.toLowerCase()] = log.status;
        }

        const medicines = (data.medicines ?? []).map((med: { name: string; dosage: string; frequency: string; times: string[] }) => {
          const logStatus = todayLogs[med.name.toLowerCase()];
          let status = "upcoming";
          if (logStatus) {
            status = logStatus;
          } else if (med.times.length > 0) {
            const [h, m] = med.times[0].split(":").map(Number);
            const medMin = h * 60 + m;
            if (currentMinutes > medMin + 30) status = "missed";
            else if (currentMinutes >= medMin - 10) status = "due";
          }
          return { name: med.name, dosage: med.dosage, frequency: med.frequency, times: med.times, status };
        });

        return JSON.stringify({ medicines, currentTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) });
      } catch {
        return JSON.stringify({ error: "Failed to fetch medication data" });
      }
    },

    getRecentSymptoms: async () => {
      try {
        const res = await fetch(`/api/patient-summary?elderId=${ELDER_ID}`);
        if (!res.ok) return { error: "Failed to fetch symptoms" };
        const data = await res.json();
        const symptoms = (data.recentSymptoms ?? []).slice(0, 5).map((s: { name: string; severity: string; duration: string | null }) => ({
          name: s.name,
          severity: s.severity,
          duration: s.duration ?? "not specified",
        }));
        return JSON.stringify({ symptoms, count: symptoms.length });
      } catch {
        return JSON.stringify({ error: "Failed to fetch symptoms" });
      }
    },

    getEmotionalHistory: async () => {
      try {
        const res = await fetch(`/api/patient-summary?elderId=${ELDER_ID}`);
        if (!res.ok) return { error: "Failed to fetch emotional history" };
        const data = await res.json();
        return JSON.stringify({
          latestMood: data.latestMood?.emotion ?? "unknown",
          latestMoodTime: data.latestMood?.created_at ?? null,
        });
      } catch {
        return JSON.stringify({ error: "Failed to fetch emotional history" });
      }
    },

    logMedicationStatus: async (params: Record<string, unknown>) => {
      try {
        const medicineName = params.medicine_name as string;
        const status = params.status as string;
        if (!medicineName || !status) {
          return JSON.stringify({ error: "medicine_name and status are required" });
        }
        const res = await fetch("/api/medication-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            elderId: ELDER_ID,
            medicineName,
            status: status === "taken" ? "taken" : "missed",
          }),
        });
        if (!res.ok) return JSON.stringify({ error: "Failed to log medication status" });
        // Refresh the dashboard data
        fetchSummary();
        return JSON.stringify({ success: true, medicine: medicineName, status });
      } catch {
        return JSON.stringify({ error: "Failed to log medication status" });
      }
    },
  }), [fetchSummary]);

  // ── Build session overrides with elder context ──
  const sessionOverrides: SessionOverrides | undefined = useMemo(() => {
    if (!summary) return undefined;
    const ctx = buildElderContext(summary);
    return {
      systemPromptContext: ctx.systemPromptContext,
      firstMessage: ctx.firstMessage,
    };
  }, [summary]);

  async function handleSessionEnd(transcript: string) {
    if (!transcript.trim()) return;
    setLastAlert(null);
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze-conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, elderId: ELDER_ID }),
      });
      const data = await res.json();
      if (data.alert) setLastAlert(data.alert);
      await fetchSummary();
    } catch (err) {
      console.error("Failed to analyze conversation:", err);
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-full dot-grid flex flex-col items-center justify-center gap-3">
        <span className="text-4xl animate-wiggle">💊</span>
        <p className="mono-label">Loading your care data...</p>
      </div>
    );
  }

  const emptySummary: PatientSummary = {
    elderName: null,
    prescription: null,
    medicines: [],
    latestConversation: null,
    medicationLogs: [],
    recentSymptoms: [],
    latestMood: null,
    unacknowledgedAlerts: [],
    allAlerts: [],
  };

  const data = summary ?? emptySummary;

  return (
    <div className="dot-grid min-h-full flex flex-col">
      {/* ── Header ── */}
      <div
        className="px-5 pt-5 pb-4 border-b-2 border-[var(--card-border)]"
        style={{ background: "var(--cream-light)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl text-[var(--brown)] leading-tight">
              Good {greeting()}!
            </h1>
            {data.elderName && (
              <p className="font-serif text-xl text-[var(--brown-mid)] leading-tight mt-1">
                {data.elderName.split(" ")[0]}
              </p>
            )}
            <p className="mono-label mt-0.5">{todayLabel()}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="mono-label px-3 py-1.5 rounded-full border-2 border-[var(--card-border)] bg-[var(--cream)] text-[var(--brown-light)] whitespace-nowrap"
          >
            ← Home
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 px-5 py-5 flex flex-col gap-4 overflow-y-auto pb-32">

        {/* Analyzing overlay */}
        {analyzing && (
          <div
            className="rounded-xl px-4 py-3 border-2 border-[var(--amber)] flex items-center gap-3 animate-fade-in"
            style={{ background: "#FEF3DC" }}
          >
            <span className="text-xl animate-wiggle">🌸</span>
            <p className="text-sm font-semibold text-[var(--brown)]">
              Rosie is thinking...
            </p>
          </div>
        )}

        {/* Alert toast */}
        {lastAlert && !analyzing && (
          <div
            className="rounded-xl px-4 py-3 border-2 flex items-center gap-3 animate-fade-in cursor-pointer"
            style={{
              background: lastAlert.level === "high" ? "#FDECEA" : lastAlert.level === "medium" ? "#FEF3DC" : "#EDF4EF",
              borderColor: lastAlert.level === "high" ? "#C1292E40" : lastAlert.level === "medium" ? "#D4A57440" : "#6B9B7A40",
            }}
            onClick={() => setLastAlert(null)}
          >
            <span className="text-xl">
              {lastAlert.level === "high" ? "🚨" : lastAlert.level === "medium" ? "⚠️" : "ℹ️"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="mono-label">New Alert · {lastAlert.level.toUpperCase()}</p>
              <p className="text-sm font-semibold text-[var(--brown)] truncate">{lastAlert.reason}</p>
            </div>
            <span className="mono-label">tap to dismiss</span>
          </div>
        )}

        {/* ── Dashboard Tab ── */}
        {activeTab === "dashboard" && (
          <>
            {data.unacknowledgedAlerts.length > 0 && (
              <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
                <AlertsBadge alerts={data.unacknowledgedAlerts} />
              </div>
            )}

            <div className="animate-fade-up" style={{ animationDelay: "20ms" }}>
              <MoodTracker
                elderId={ELDER_ID}
                currentMood={data.latestMood?.emotion}
                onMoodSaved={fetchSummary}
              />
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "40ms" }}>
              <MedicineTimeline
                elderId={ELDER_ID}
                medicines={data.medicines}
                medicationLogs={data.medicationLogs}
                statusData={data.latestConversation?.extracted?.medications ?? []}
                onStatusChange={fetchSummary}
              />
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
              <DoctorGuidelines prescription={data.prescription} />
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
              <AssistantHelp onTalkToRosie={() => setActiveTab("rosie")} />
            </div>
          </>
        )}

        {/* ── Talk to Rosie Tab ── */}
        {activeTab === "rosie" && (
          <>
            <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
              <TalkButton
                onSessionEnd={handleSessionEnd}
                clientTools={clientTools}
                overrides={sessionOverrides}
              />
            </div>

            {data.latestConversation && (
              <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
                <div
                  className="rounded-xl px-4 py-3 border-2 border-[var(--card-border)]"
                  style={{ background: "var(--cream)" }}
                >
                  <p className="mono-label mb-2">Last check-in</p>
                  <p className="text-sm text-[var(--brown-mid)] leading-relaxed">
                    {data.latestMood && (
                      <span className="mr-2">
                        Felt{" "}
                        <span className="font-semibold">
                          {data.latestMood.emotion === "happy" ? "😊 happy" :
                           data.latestMood.emotion === "good" ? "🙂 good" :
                           data.latestMood.emotion === "sad" ? "😔 sad" :
                           data.latestMood.emotion === "anxious" ? "😰 anxious" : "😐 okay"}
                        </span>
                      </span>
                    )}
                    {data.latestConversation.transcript.slice(0, 150)}
                    {data.latestConversation.transcript.length > 150 ? "..." : ""}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Bottom Tab Bar ── */}
      <div
        className="shrink-0 border-t-2 border-[var(--card-border)] px-4 py-4 flex gap-3"
        style={{ background: "var(--cream-light)" }}
      >
        <button
          onClick={() => setActiveTab("dashboard")}
          className="flex-1 py-4 px-4 rounded-xl border-2 font-semibold text-sm transition-all"
          style={{
            background: activeTab === "dashboard" ? "var(--cream)" : "transparent",
            borderColor: activeTab === "dashboard" ? "var(--terracotta)" : "var(--card-border)",
            color: activeTab === "dashboard" ? "var(--brown)" : "var(--brown-light)",
          }}
        >
          📋 Dashboard
        </button>

        <button
          onClick={() => setActiveTab("rosie")}
          className="flex-1 py-4 px-4 rounded-xl border-2 font-semibold text-sm transition-all"
          style={{
            background: activeTab === "rosie" ? "var(--cream)" : "transparent",
            borderColor: activeTab === "rosie" ? "var(--terracotta)" : "var(--card-border)",
            color: activeTab === "rosie" ? "var(--brown)" : "var(--brown-light)",
          }}
        >
          🌸 Talk to Rosie
        </button>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
