import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { elderId, emotion } = await request.json();

    if (!elderId || !emotion) {
      return NextResponse.json(
        { error: 'elderId and emotion are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Save mood as a conversation record
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        elder_id: elderId,
        transcript: `Mood logged directly: ${emotion}`,
        extracted: { mood: emotion, source: 'manual_entry' },
        emotion,
        alert_level: null,
        alert_reason: null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id, emotion: data.emotion, created_at: data.created_at });
  } catch (err) {
    console.error('[POST /api/mood]', err);
    return NextResponse.json({ error: 'Failed to save mood' }, { status: 500 });
  }
}
