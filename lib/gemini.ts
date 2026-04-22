import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ExtractedData } from './types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const EXTRACT_PROMPT = `You are a health data extractor for an elder care app. Extract structured data from this conversation transcript.
Return ONLY valid JSON in this exact format:
{
  "medications": [{"name": "medicine name", "status": "taken|missed|unknown"}],
  "symptoms": [{"name": "symptom", "duration": "duration string", "severity": "low|medium|high"}],
  "emotion": "happy|sad|anxious|neutral"
}
If no medications/symptoms mentioned, return empty arrays. Emotion must always be one of the four values.
Return only the JSON, no explanation.

Transcript:`;

const PRESCRIPTION_PROMPT = `You are a medical data extractor. Parse this prescription document and return ONLY valid JSON.
Return this exact structure:
{
  "doctor_name": "Dr. R. Kumar",
  "doctor_qualification": "MBBS",
  "clinic_name": "City Health Clinic, Chennai",
  "patient_name": "Arthur Pemberton",
  "patient_age": 78,
  "prescription_date": "2026-04-21",
  "follow_up_days": 14,
  "follow_up_date": "2026-05-05",
  "doctor_advice": "Take all medicines regularly. Maintain a balanced diet.",
  "medicines": [
    {
      "name": "Amlodipine",
      "dosage": "5mg",
      "quantity": "1 tablet",
      "frequency": "once daily",
      "times": ["08:00"],
      "instructions": "in the morning",
      "with_food": false
    }
  ]
}
Rules:
- times: infer HH:MM from instructions. morning→"08:00", bedtime→"22:00", after breakfast→"08:30", twice daily→["08:00","20:00"], three times daily→["08:00","14:00","20:00"]
- with_food: true if instructions mention "after food", "after meal", "after breakfast", "with food"
- follow_up_date: compute prescription_date + follow_up_days. If no follow-up mentioned, omit both fields (null).
- prescription_date: ISO 8601 format YYYY-MM-DD
- Return only valid JSON, no markdown, no explanation.`;

const FALLBACK_EXTRACT: ExtractedData = {
  medications: [],
  symptoms: [],
  emotion: 'neutral',
};

export interface PrescriptionData {
  doctor_name: string;
  doctor_qualification?: string;
  clinic_name?: string;
  patient_name: string;
  patient_age?: number;
  prescription_date: string;
  follow_up_days?: number;
  follow_up_date?: string;
  doctor_advice?: string;
  medicines: {
    name: string;
    dosage: string;
    quantity: string;
    frequency: string;
    times: string[];
    instructions: string;
    with_food: boolean;
  }[];
}

function cleanJson(raw: string): string {
  return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

export async function extractFromTranscript(transcript: string): Promise<ExtractedData> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(`${EXTRACT_PROMPT}\n${transcript}`);
    const text = result.response.text();
    const parsed = JSON.parse(cleanJson(text));
    return {
      medications: parsed.medications ?? [],
      symptoms: parsed.symptoms ?? [],
      emotion: parsed.emotion ?? 'neutral',
    } as ExtractedData;
  } catch (err) {
    console.error('[extractFromTranscript] Gemini error:', err);
    return FALLBACK_EXTRACT;
  }
}

export async function parsePrescription(
  base64Data: string,
  mimeType: string
): Promise<PrescriptionData> {
  const fallback: PrescriptionData = {
    doctor_name: 'Unknown',
    patient_name: 'Unknown',
    prescription_date: new Date().toISOString().split('T')[0],
    medicines: [],
  };
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent([
      PRESCRIPTION_PROMPT,
      { inlineData: { data: base64Data, mimeType } },
    ]);
    const text = result.response.text();
    const parsed = JSON.parse(cleanJson(text));
    return {
      doctor_name: parsed.doctor_name ?? 'Unknown',
      doctor_qualification: parsed.doctor_qualification,
      clinic_name: parsed.clinic_name,
      patient_name: parsed.patient_name ?? 'Unknown',
      patient_age: parsed.patient_age,
      prescription_date: parsed.prescription_date ?? fallback.prescription_date,
      follow_up_days: parsed.follow_up_days,
      follow_up_date: parsed.follow_up_date,
      doctor_advice: parsed.doctor_advice,
      medicines: Array.isArray(parsed.medicines) ? parsed.medicines.map((m: Record<string, unknown>) => ({
        name: String(m.name ?? ''),
        dosage: String(m.dosage ?? ''),
        quantity: String(m.quantity ?? '1 tablet'),
        frequency: String(m.frequency ?? ''),
        times: Array.isArray(m.times) ? m.times : [],
        instructions: String(m.instructions ?? ''),
        with_food: Boolean(m.with_food),
      })) : [],
    };
  } catch (err) {
    console.error('[parsePrescription] Gemini error:', err);
    return fallback;
  }
}
