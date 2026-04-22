import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('medicines')
      .update({
        name: body.name,
        dosage: body.dosage,
        quantity: body.quantity,
        frequency: body.frequency,
        times: body.times,
        instructions: body.instructions,
        with_food: body.with_food,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error('[PUT /api/medicine/[id]]', err);
    return NextResponse.json({ error: 'Failed to update medicine' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    const { error } = await supabase
      .from('medicines')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/medicine/[id]]', err);
    return NextResponse.json({ error: 'Failed to delete medicine' }, { status: 500 });
  }
}
