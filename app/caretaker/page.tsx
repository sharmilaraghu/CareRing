"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { PatientSummary, Medicine, Prescription } from "@/lib/types";
import PrescriptionUploader from "@/components/caretaker/PrescriptionUploader";
import PrescriptionCard from "@/components/caretaker/PrescriptionCard";
import PatientSummaryCards from "@/components/caretaker/PatientSummaryCards";
import MedicineManager from "@/components/caretaker/MedicineManager";
import AlertsList from "@/components/caretaker/AlertsList";
import SymptomsHistory from "@/components/caretaker/SymptomsHistory";
import VoiceCloner from "@/components/caretaker/VoiceCloner";
import MealSchedule from "@/components/caretaker/MealSchedule";

type Tab = "overview" | "medicines";

export default function CaretakerPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // TODO: Replace with auth-based elder ID once auth is implemented
  const ELDER_ID = "e0000000-0000-0000-0000-000000000001";

  const fetchSummary = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/patient-summary?elderId=${ELDER_ID}`);
      if (res.ok) {
        setSummary(await res.json());
        setLastRefresh(new Date());
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30_000);
    return () => clearInterval(interval);
  }, [fetchSummary]);

  function handleUploaded(data: { prescription: Prescription; medicines: Medicine[] }) {
    setSummary((prev) => prev ? { ...prev, prescription: data.prescription, medicines: data.medicines } : null);
    fetchSummary();
  }

  async function handleAcknowledge(conversationId: string) {
    await fetch("/api/alerts/acknowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    fetchSummary();
  }

  if (loading) {
    return (
      <div className="min-h-full dot-grid flex flex-col items-center justify-center gap-3">
        <span className="text-4xl animate-wiggle">🧑‍⚕️</span>
        <p className="mono-label">Loading patient data...</p>
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
              {data.elderName ? `${data.elderName.split(" ")[0]}'s Care Dashboard` : "Caretaker View"}
            </h1>
            <p className="mono-label mt-0.5">
              Refreshed {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · auto every 30s
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchSummary}
              disabled={refreshing}
              className="mono-label px-3 py-1.5 rounded-full border-2 border-[var(--card-border)] bg-[var(--cream)] text-[var(--brown-light)] disabled:opacity-50"
            >
              {refreshing ? "⏳ ..." : "↻ Refresh"}
            </button>
            <button
              onClick={() => router.push("/")}
              className="mono-label px-3 py-1.5 rounded-full border-2 border-[var(--card-border)] bg-[var(--cream)] text-[var(--brown-light)] whitespace-nowrap"
            >
              ← Home
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 px-5 py-5 flex flex-col gap-4 overflow-y-auto pb-32">

        {/* ── Overview Tab ── */}
        {activeTab === "overview" && (
          <>
            {/* Active alerts callout */}
            {data.unacknowledgedAlerts.length > 0 && (
              <div
                className="rounded-xl px-4 py-3 border-2 flex items-center gap-3 animate-fade-in"
                style={{
                  background: data.unacknowledgedAlerts.some((a) => a.level === "high") ? "#FDECEA" : "#FEF3DC",
                  borderColor: data.unacknowledgedAlerts.some((a) => a.level === "high") ? "#C1292E40" : "#D4A57440",
                }}
              >
                <span className="text-xl animate-wiggle">🔔</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--brown)]">
                    {data.unacknowledgedAlerts.length} unacknowledged alert{data.unacknowledgedAlerts.length !== 1 ? "s" : ""}
                  </p>
                  <p className="mono-label text-xs">
                    {data.unacknowledgedAlerts[0]?.reason}
                  </p>
                </div>
              </div>
            )}

            {/* Alerts list — primary content */}
            <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
              <AlertsList alerts={data.allAlerts} onAcknowledge={handleAcknowledge} />
            </div>

            {/* Summary cards */}
            <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
              <PatientSummaryCards summary={data} />
            </div>

            {/* Symptoms history */}
            <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
              <SymptomsHistory symptoms={data.recentSymptoms} />
            </div>
          </>
        )}

        {/* ── Medicines Tab ── */}
        {activeTab === "medicines" && (
          <>
            {/* First-time banner */}
            {data.medicines.length === 0 && (
              <div
                className="rounded-xl px-4 py-3 border-2 border-dashed border-[var(--terracotta)] flex items-center gap-3 animate-fade-in"
                style={{ background: "#FEF3DC" }}
              >
                <span className="text-xl">👇</span>
                <p className="text-sm font-semibold text-[var(--brown)]">
                  Upload a prescription below to get started
                </p>
              </div>
            )}

            {/* Meal schedule — set before uploading prescription */}
            <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
              <MealSchedule elderId={ELDER_ID} />
            </div>

            {/* Prescription uploader */}
            <div className="animate-fade-up" style={{ animationDelay: "40ms" }}>
              <PrescriptionUploader onUploaded={handleUploaded} elderId={ELDER_ID} />
            </div>

            {/* Prescription card */}
            {(data.prescription || data.medicines.length > 0) && (
              <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
                <PrescriptionCard prescription={data.prescription} medicines={data.medicines} />
              </div>
            )}

            {/* Medicine manager */}
            <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
              <MedicineManager
                elderId={ELDER_ID}
                medicines={data.medicines}
                onChange={fetchSummary}
              />
            </div>

            {/* Voice cloner */}
            <div className="animate-fade-up" style={{ animationDelay: "180ms" }}>
              <VoiceCloner elderId={ELDER_ID} />
            </div>
          </>
        )}
      </div>

      {/* ── Bottom Tab Bar ── */}
      <div
        className="shrink-0 border-t-2 border-[var(--card-border)] px-4 py-4 flex gap-3"
        style={{ background: "var(--cream-light)" }}
      >
        <button
          onClick={() => setActiveTab("overview")}
          className="flex-1 py-4 px-4 rounded-xl border-2 font-semibold text-sm transition-all"
          style={{
            background: activeTab === "overview" ? "var(--cream)" : "transparent",
            borderColor: activeTab === "overview" ? "var(--terracotta)" : "var(--card-border)",
            color: activeTab === "overview" ? "var(--brown)" : "var(--brown-light)",
          }}
        >
          📊 Overview
        </button>

        <button
          onClick={() => setActiveTab("medicines")}
          className="flex-1 py-4 px-4 rounded-xl border-2 font-semibold text-sm transition-all"
          style={{
            background: activeTab === "medicines" ? "var(--cream)" : "transparent",
            borderColor: activeTab === "medicines" ? "var(--terracotta)" : "var(--card-border)",
            color: activeTab === "medicines" ? "var(--brown)" : "var(--brown-light)",
          }}
        >
          💊 Medicines
        </button>
      </div>
    </div>
  );
}
