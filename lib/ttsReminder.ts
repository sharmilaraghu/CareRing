/**
 * Plays a medicine reminder using ElevenLabs TTS.
 * Falls back to browser speechSynthesis if the API call fails.
 */
export async function playTTSReminder(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  elderId?: string
): Promise<void> {
  onStart?.();

  try {
    const res = await fetch('/api/tts-reminder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, elderId }),
    });

    if (!res.ok) throw new Error('TTS API failed');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Audio playback failed'));
      };
      audio.play().catch(reject);
    });
  } catch (err) {
    console.warn('[TTS] ElevenLabs failed, falling back to browser TTS:', err);
    // Fallback to browser speechSynthesis
    await new Promise<void>((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.85;
      utter.pitch = 1.05;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
    });
  } finally {
    onEnd?.();
  }
}

/**
 * Normalizes medical abbreviations for natural TTS pronunciation.
 */
function normalizeDosage(text: string): string {
  return text
    .replace(/(\d+)\s*mg\b/gi, '$1 milligrams')
    .replace(/(\d+)\s*mcg\b/gi, '$1 micrograms')
    .replace(/(\d+)\s*ml\b/gi, '$1 milliliters')
    .replace(/(\d+)\s*IU\b/g, '$1 I U')
    .replace(/(\d+)\s*g\b/gi, '$1 grams');
}

/**
 * Builds a medicine reminder text from a list of medicines.
 */
export function buildReminderText(medicines: { name: string; dosage: string }[]): string {
  if (medicines.length === 0) return '';
  if (medicines.length === 1) {
    const med = medicines[0];
    return `Hi! Just a gentle reminder — it's time to take your ${med.name}, ${normalizeDosage(med.dosage)}. Take care!`;
  }
  const medList = medicines.map((m) => `${m.name}, ${normalizeDosage(m.dosage)}`).join('. Then, ');
  return `Hi! Just a gentle reminder — it's time for your medicines. Please take: ${medList}. Stay healthy!`;
}
