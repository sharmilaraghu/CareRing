import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { elderId, name, dosage, quantity, frequency, times, instructions, with_food } = await request.json();

    if (!elderId || !name || !dosage) {
      return NextResponse.json(
        { error: 'elderId, name and dosage are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('medicines')
      .insert({
        elder_id: elderId,
        name,
        dosage,
        quantity: quantity || '1 tablet',
        frequency: frequency || 'as directed',
        times: times || [],
        instructions: instructions || null,
        with_food: with_food || false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error('[POST /api/medicine]', err);
    return NextResponse.json({ error: 'Failed to add medicine' }, { status: 500 });
  }
}
