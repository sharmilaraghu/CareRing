import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { elderId, medicineId, medicineName, status } = await request.json();

    if (!elderId || !medicineName || !status) {
      return NextResponse.json(
        { error: 'elderId, medicineName and status are required' },
        { status: 400 }
      );
    }

    if (!['taken', 'missed'].includes(status)) {
      return NextResponse.json(
        { error: 'status must be "taken" or "missed"' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const today = new Date().toISOString().split('T')[0];

    // Delete any existing entry for this medicine today (one entry per medicine per day)
    await supabase
      .from('medication_logs')
      .delete()
      .eq('elder_id', elderId)
      .eq('medicine_name', medicineName)
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`);

    // Insert new status
    const { data, error } = await supabase
      .from('medication_logs')
      .insert({
        elder_id: elderId,
        medicine_id: medicineId || null,
        medicine_name: medicineName,
        status,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Generate alert if medicine was missed (manual tap or voice tool)
    if (status === 'missed') {
      await supabase
        .from('conversations')
        .insert({
          elder_id: elderId,
          transcript: `Medication logged manually: ${medicineName} — missed`,
          extracted: {
            medications: [{ name: medicineName, status: 'missed' }],
            symptoms: [],
            emotion: 'neutral',
            source: 'manual_log',
          },
          emotion: 'neutral',
          alert_level: 'medium',
          alert_reason: `Missed medication: ${medicineName}`,
        });
    }

    return NextResponse.json({ id: data.id, status: data.status, created_at: data.created_at });
  } catch (err) {
    console.error('[POST /api/medication-log]', err);
    return NextResponse.json({ error: 'Failed to save medication status' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const elderId = searchParams.get('elderId');

    if (!elderId) {
      return NextResponse.json({ error: 'elderId is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Get today's logs
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('elder_id', elderId)
      .gte('created_at', `${today}T00:00:00`)
      .lt('created_at', `${today}T23:59:59`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('[GET /api/medication-log]', err);
    return NextResponse.json({ error: 'Failed to fetch medication logs' }, { status: 500 });
  }
}
