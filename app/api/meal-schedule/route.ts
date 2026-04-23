import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const elderId = searchParams.get('elderId');

    if (!elderId) {
      return NextResponse.json({ error: 'elderId is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('meal_schedules')
      .select('*')
      .eq('elder_id', elderId)
      .maybeSingle();

    if (error) throw error;

    // Return defaults if no schedule exists
    return NextResponse.json(data ?? {
      elder_id: elderId,
      breakfast: '08:00',
      lunch: '13:00',
      dinner: '20:00',
      bedtime: '22:00',
    });
  } catch (err) {
    console.error('[GET /api/meal-schedule]', err);
    return NextResponse.json({ error: 'Failed to fetch meal schedule' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { elderId, breakfast, lunch, dinner, bedtime } = await request.json();

    if (!elderId) {
      return NextResponse.json({ error: 'elderId is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('meal_schedules')
      .upsert({
        elder_id: elderId,
        breakfast: breakfast || '08:00',
        lunch: lunch || '13:00',
        dinner: dinner || '20:00',
        bedtime: bedtime || '22:00',
      }, { onConflict: 'elder_id' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error('[POST /api/meal-schedule]', err);
    return NextResponse.json({ error: 'Failed to save meal schedule' }, { status: 500 });
  }
}
