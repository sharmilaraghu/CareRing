import type { ExtractedData, AlertLevel } from './types';

interface AlertResult {
  level: AlertLevel;
  reason: string;
}

const LEVEL_ORDER: AlertLevel[] = ['low', 'medium', 'high'];

function higher(a: AlertLevel, b: AlertLevel): AlertLevel {
  return LEVEL_ORDER.indexOf(a) >= LEVEL_ORDER.indexOf(b) ? a : b;
}

export function evaluate(data: ExtractedData): AlertResult | null {
  const reasons: string[] = [];
  let level: AlertLevel | null = null;

  const hasMissed = data.medications.some((m) => m.status === 'missed');
  if (hasMissed) {
    const names = data.medications.filter((m) => m.status === 'missed').map((m) => m.name).join(', ');
    reasons.push(`Missed medication: ${names}`);
    level = higher(level ?? 'low', 'medium');
  }

  const highSymptom = data.symptoms.find((s) => s.severity === 'high');
  if (highSymptom) {
    reasons.push(`High severity symptom: ${highSymptom.name}`);
    level = higher(level ?? 'low', 'high');
  }

  if (data.emotion === 'sad' || data.emotion === 'anxious') {
    reasons.push(`Emotional distress: ${data.emotion}`);
    level = higher(level ?? 'low', 'low');
  }

  if (!level) return null;

  return { level, reason: reasons.join('; ') };
}
