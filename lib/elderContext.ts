import type { PatientSummary, Medicine, MedicationLog } from './types';

/**
 * Builds a context object for Rosie's session — injected as dynamic variables
 * and used to construct the system prompt override.
 */

export interface ElderContext {
  elderName: string;
  currentTime: string;
  greeting: string;
  medicinesSummary: string;
  dueMedicines: string;
  recentSymptomsSummary: string;
  lastMood: string;
  lastCheckIn: string;
  systemPromptContext: string;
  firstMessage: string;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function getMedicineStatus(
  med: Medicine,
  logs: MedicationLog[]
): "taken" | "missed" | "due" | "upcoming" {
  const log = logs.find(
    (l) => l.medicine_name?.toLowerCase() === med.name.toLowerCase()
  );
  if (log) return log.status as "taken" | "missed";

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const time of med.times) {
    const [h, m] = time.split(":").map(Number);
    const medMinutes = h * 60 + m;
    if (currentMinutes >= medMinutes - 10 && currentMinutes <= medMinutes + 30) return "due";
    if (currentMinutes > medMinutes + 30) return "missed";
  }

  return "upcoming";
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function buildElderContext(summary: PatientSummary): ElderContext {
  const elderName = summary.elderName?.split(" ")[0] ?? "there";
  const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const greetingTime = getGreeting();

  // Medicine summary
  const medLines = summary.medicines.map((med) => {
    const status = getMedicineStatus(med, summary.medicationLogs);
    const timeStr = med.times.length > 0 ? med.times.map(formatTime).join(", ") : "no time set";
    return `- ${med.name} ${med.dosage} (${med.frequency}, at ${timeStr}) → ${status}`;
  });
  const medicinesSummary = medLines.length > 0
    ? medLines.join("\n")
    : "No medicines on record.";

  // Due/missed medicines specifically
  const dueMeds = summary.medicines.filter((med) => {
    const status = getMedicineStatus(med, summary.medicationLogs);
    return status === "due" || status === "missed";
  });
  const dueMedicines = dueMeds.length > 0
    ? dueMeds.map((m) => `${m.name} (${getMedicineStatus(m, summary.medicationLogs)})`).join(", ")
    : "All medicines taken or upcoming.";

  // Recent symptoms
  const recentSymptomsSummary = summary.recentSymptoms.length > 0
    ? summary.recentSymptoms.slice(0, 5).map((s) =>
        `- ${s.name} (severity: ${s.severity}${s.duration ? `, duration: ${s.duration}` : ""})`
      ).join("\n")
    : "No recent symptoms reported.";

  // Last mood
  const lastMood = summary.latestMood
    ? `${summary.latestMood.emotion} (at ${new Date(summary.latestMood.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`
    : "Unknown — no mood logged today.";

  // Last check-in
  const lastCheckIn = summary.latestConversation
    ? new Date(summary.latestConversation.created_at).toLocaleString([], {
        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
      })
    : "No previous check-ins.";

  // Build the system prompt context block
  const systemPromptContext = `
IMPORTANT CONTEXT FOR THIS CONVERSATION:
- Elder's name: ${elderName}
- Current time: ${currentTime} (${greetingTime})
- Today's medication schedule:
${medicinesSummary}
- Medicines needing attention: ${dueMedicines}
- Recent symptoms from past conversations:
${recentSymptomsSummary}
- Last mood: ${lastMood}
- Last check-in: ${lastCheckIn}

CONVERSATION GUIDELINES:
1. Start by greeting ${elderName} warmly by name.
2. If any medicines are due or missed, ask about them specifically by name. For example: "Have you taken your ${dueMeds[0]?.name ?? "medicine"} yet?"
3. If there are recent symptoms, ask a follow-up. For example: "Last time you mentioned [symptom] — how is that today?"
4. Ask about emotional wellness naturally. If their last mood was negative, be extra gentle.
5. When the elder confirms they took or missed a medicine, use the logMedicationStatus tool to record it.
6. Keep the conversation warm, caring, and concise. You are Rosie — a loving companion, not a clinical system.
`.trim();

  // Build contextual first message
  let firstMessage = `Good ${greetingTime}, ${elderName}! `;
  if (dueMeds.length > 0) {
    const medName = dueMeds[0].name;
    firstMessage += `I wanted to check in — have you taken your ${medName} today?`;
  } else if (summary.recentSymptoms.length > 0) {
    const symptom = summary.recentSymptoms[0].name;
    firstMessage += `How are you feeling today? Last time you mentioned ${symptom} — is that any better?`;
  } else {
    firstMessage += `How are you doing today? I'd love to hear how you're feeling.`;
  }

  return {
    elderName,
    currentTime,
    greeting: greetingTime,
    medicinesSummary,
    dueMedicines,
    recentSymptomsSummary,
    lastMood,
    lastCheckIn,
    systemPromptContext,
    firstMessage,
  };
}
