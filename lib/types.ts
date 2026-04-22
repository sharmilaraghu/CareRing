export type AlertLevel = 'low' | 'medium' | 'high';
export type MedStatus = 'taken' | 'missed' | 'unknown';
export type Severity = 'low' | 'medium' | 'high';
export type Emotion = 'happy' | 'good' | 'sad' | 'anxious' | 'neutral';

export interface Prescription {
  id: string;
  elder_id: string;
  doctor_name: string;
  doctor_qualification?: string;
  clinic_name?: string;
  patient_name: string;
  patient_age?: number;
  prescription_date: string;
  follow_up_date?: string;
  doctor_advice?: string;
  created_at: string;
}

export interface Medicine {
  id: string;
  elder_id: string;
  prescription_id?: string;
  name: string;
  dosage: string;
  quantity: string;
  frequency: string;
  times: string[];
  instructions: string;
  with_food: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  elder_id: string;
  transcript: string;
  extracted: ExtractedData | null;
  emotion: string;
  alert_level: string | null;
  alert_reason: string | null;
  acknowledged: boolean;
  created_at: string;
}

export interface MedicationLog {
  id: string;
  conversation_id: string;
  medicine_name: string;
  status: MedStatus;
  created_at: string;
}

export interface Symptom {
  id: string;
  conversation_id: string;
  name: string;
  duration: string | null;
  severity: Severity;
  created_at: string;
}

export interface MoodLog {
  id: string;
  conversation_id: string;
  emotion: Emotion;
  created_at: string;
}

export interface Alert {
  id: string;
  conversation_id: string | null;
  level: AlertLevel;
  reason: string;
  acknowledged: boolean;
  created_at: string;
}

export interface ExtractedData {
  medications: { name: string; status: MedStatus }[];
  symptoms: { name: string; duration: string; severity: Severity }[];
  emotion: Emotion;
}

export interface PatientSummary {
  elderName: string | null;
  prescription: Prescription | null;
  medicines: Medicine[];
  latestConversation: Conversation | null;
  medicationLogs: MedicationLog[];
  recentSymptoms: Symptom[];
  latestMood: MoodLog | null;
  unacknowledgedAlerts: Alert[];
  allAlerts: Alert[];
}
