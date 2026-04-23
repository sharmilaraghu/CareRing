import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { parsePrescription } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const elderId = formData.get('elderId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!elderId) {
      return NextResponse.json({ error: 'elderId is required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type || 'application/pdf';

    const supabase = createServerSupabaseClient();

    // Gemini vision handles both PDF and images natively via inlineData
    // Fetch meal schedule for personalized medicine timing
    let mealTimes = { breakfast: '08:00', lunch: '13:00', dinner: '20:00', bedtime: '22:00' };
    try {
      const { data: mealData } = await supabase
        .from('meal_schedules')
        .select('*')
        .eq('elder_id', elderId)
        .single();
      if (mealData) {
        mealTimes = {
          breakfast: mealData.breakfast || '08:00',
          lunch: mealData.lunch || '13:00',
          dinner: mealData.dinner || '20:00',
          bedtime: mealData.bedtime || '22:00',
        };
      }
    } catch { /* use defaults */ }

    const prescription = await parsePrescription(base64, mimeType, mealTimes);

    // Insert new prescription (keep old prescriptions for history)
    const { data: presRow, error: presError } = await supabase
      .from('prescriptions')
      .insert({
        elder_id: elderId,
        doctor_name: prescription.doctor_name,
        doctor_qualification: prescription.doctor_qualification ?? null,
        clinic_name: prescription.clinic_name ?? null,
        patient_name: prescription.patient_name,
        patient_age: prescription.patient_age ?? null,
        prescription_date: prescription.prescription_date ?? null,
        follow_up_date: prescription.follow_up_date ?? null,
        doctor_advice: prescription.doctor_advice ?? null,
      })
      .select()
      .single();

    if (presError) throw presError;

    // For each medicine: upsert by name (update if exists, insert if new)
    const medicinesToUpsert = [];
    for (const m of prescription.medicines) {
      // Check if medicine with same name already exists
      const { data: existing } = await supabase
        .from('medicines')
        .select('id')
        .eq('elder_id', elderId)
        .eq('name', m.name)
        .single();

      if (existing) {
        // Update existing medicine with new details, link to new prescription
        await supabase
          .from('medicines')
          .update({
            dosage: m.dosage,
            quantity: m.quantity,
            frequency: m.frequency,
            times: m.times ?? [],
            instructions: m.instructions,
            with_food: m.with_food,
            prescription_id: presRow.id,
          })
          .eq('id', existing.id);
      } else {
        // Insert new medicine
        medicinesToUpsert.push({
          elder_id: elderId,
          prescription_id: presRow.id,
          name: m.name,
          dosage: m.dosage,
          quantity: m.quantity,
          frequency: m.frequency,
          times: m.times ?? [],
          instructions: m.instructions,
          with_food: m.with_food,
        });
      }
    }

    // Batch insert new medicines
    if (medicinesToUpsert.length > 0) {
      const { error } = await supabase
        .from('medicines')
        .insert(medicinesToUpsert)
        .select();
      if (error) throw error;
    }

    // Fetch all current medicines for response
    const { data: allMedicines } = await supabase
      .from('medicines')
      .select('*')
      .eq('elder_id', elderId)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      prescription: presRow,
      medicines: allMedicines ?? [],
    });
  } catch (err) {
    console.error('[POST /api/upload-prescription]', err);
    const message =
      err instanceof Error && err.message.includes('429')
        ? 'Gemini quota exceeded — try again in a few seconds'
        : 'Failed to parse prescription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
