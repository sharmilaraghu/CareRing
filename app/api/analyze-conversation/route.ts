import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { extractFromTranscript } from '@/lib/gemini';
import { evaluate } from '@/lib/decisionEngine';

export async function POST(request: NextRequest) {
  try {
    const { transcript, elderId } = await request.json();

    if (!transcript || !elderId) {
      return NextResponse.json(
        { error: 'transcript and elderId are required' },
        { status: 400 }
      );
    }

    const extractedData = await extractFromTranscript(transcript);
    const alertResult = evaluate(extractedData);

    const supabase = createServerSupabaseClient();

    // Build the conversation record with flattened fields
    const conversationRecord = {
      elder_id: elderId,
      transcript,
      extracted: extractedData,
      emotion: extractedData.emotion,
      alert_level: alertResult?.level ?? null,
      alert_reason: alertResult?.reason ?? null,
    };

    const { error: convError } = await supabase
      .from('conversations')
      .insert(conversationRecord)
      .select()
      .single();

    if (convError) throw convError;

    // Upsert patient_summary with latest data
    const recentSymptoms = extractedData.symptoms.length > 0
      ? extractedData.symptoms.map((s: { name: string; duration: string; severity: string }) => ({
          name: s.name,
          duration: s.duration,
          severity: s.severity,
        }))
      : [];

    const missedMeds = extractedData.medications
      .filter((m: { status: string }) => m.status === 'missed')
      .map((m: { name: string }) => m.name);

    const lastMedStatus = missedMeds.length > 0
      ? `Missed: ${missedMeds.join(', ')}`
      : 'All taken';

    await supabase
      .from('patient_summary')
      .upsert({
        elder_id: elderId,
        last_emotion: extractedData.emotion,
        last_alert: alertResult?.level ?? null,
        last_updated: new Date().toISOString(),
        recent_symptoms: recentSymptoms,
        last_med_status: lastMedStatus,
      });

    return NextResponse.json({
      extractedData,
      alert: alertResult
        ? { level: alertResult.level, reason: alertResult.reason }
        : null,
    });
  } catch (err) {
    console.error('[POST /api/analyze-conversation]', err);
    return NextResponse.json(
      { error: 'Failed to analyze conversation' },
      { status: 500 }
    );
  }
}
