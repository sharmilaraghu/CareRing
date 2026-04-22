import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const elderId = searchParams.get('elderId');

    if (!elderId) {
      return NextResponse.json(
        { error: 'elderId query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const today = new Date().toISOString().split('T')[0];

    const [elderResult, medicinesResult, conversationsResult, prescriptionResult, logsResult] = await Promise.all([
      supabase.from('users').select('name').eq('id', elderId).single(),
      supabase
        .from('medicines')
        .select('*')
        .eq('elder_id', elderId)
        .order('created_at', { ascending: true }),
      supabase
        .from('conversations')
        .select('*')
        .eq('elder_id', elderId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('prescriptions')
        .select('*')
        .eq('elder_id', elderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from('medication_logs')
        .select('*')
        .eq('elder_id', elderId)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`),
    ]);

    const latestConversation = conversationsResult.data?.[0] ?? null;

    const alertConversations = (conversationsResult.data ?? []).filter(
      (c) => c.alert_level && c.alert_level !== 'low'
    );

    const unacknowledgedAlerts = alertConversations
      .filter((c) => !c.acknowledged)
      .map((c) => ({
        id: c.id,
        conversation_id: c.id,
        level: c.alert_level,
        reason: c.alert_reason,
        acknowledged: false,
        created_at: c.created_at,
      }));

    const allAlerts = [
      ...alertConversations
        .filter((c) => !c.acknowledged)
        .map((c) => ({
          id: c.id,
          conversation_id: c.id,
          level: c.alert_level,
          reason: c.alert_reason,
          acknowledged: false,
          created_at: c.created_at,
        })),
      ...alertConversations
        .filter((c) => c.acknowledged)
        .map((c) => ({
          id: c.id,
          conversation_id: c.id,
          level: c.alert_level,
          reason: c.alert_reason,
          acknowledged: true,
          created_at: c.created_at,
        })),
    ];

    const allSymptoms: { id: string; conversation_id: string; name: string; duration: string | null; severity: string }[] = [];
    let idx = 0;
    for (const conv of conversationsResult.data ?? []) {
      if (conv.extracted?.symptoms) {
        for (const s of conv.extracted.symptoms) {
          allSymptoms.push({
            id: `${conv.id}-${idx++}`,
            conversation_id: conv.id,
            name: s.name,
            duration: s.duration ?? null,
            severity: s.severity,
          });
        }
      }
    }

    return NextResponse.json({
      elderName: elderResult.data?.name ?? null,
      prescription: prescriptionResult.data ?? null,
      medicines: medicinesResult.data ?? [],
      latestConversation,
      recentSymptoms: allSymptoms.slice(0, 10),
      latestMood: latestConversation?.emotion
        ? {
            id: latestConversation.id,
            conversation_id: latestConversation.id,
            emotion: latestConversation.emotion,
            created_at: latestConversation.created_at,
          }
        : null,
      unacknowledgedAlerts,
      allAlerts,
      medicationLogs: logsResult.data ?? [],
    });
  } catch (err) {
    console.error('[GET /api/patient-summary]', err);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
