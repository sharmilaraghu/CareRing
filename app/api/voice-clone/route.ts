import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const elderId = formData.get('elderId') as string | null;
    const speakerName = formData.get('speakerName') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }
    if (!elderId) {
      return NextResponse.json({ error: 'elderId is required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Build form data for ElevenLabs voice cloning API
    const elForm = new FormData();
    elForm.append('name', `CareRing - ${speakerName || 'Family Voice'}`);
    elForm.append('description', `Cloned voice for CareRing elder ${elderId}`);
    elForm.append('files', file);

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: elForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Voice Clone] ElevenLabs error:', errorText);
      return NextResponse.json({ error: 'Voice cloning failed. Ensure audio is at least 30 seconds of clear speech.' }, { status: 502 });
    }

    const { voice_id } = await response.json();

    // Store the cloned voice ID in the users table
    const supabase = createServerSupabaseClient();
    await supabase
      .from('users')
      .update({ cloned_voice_id: voice_id })
      .eq('id', elderId);

    return NextResponse.json({
      voiceId: voice_id,
      speakerName: speakerName || 'Family Voice',
      status: 'ready',
    });
  } catch (err) {
    console.error('[POST /api/voice-clone]', err);
    return NextResponse.json({ error: 'Failed to clone voice' }, { status: 500 });
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
    const { data } = await supabase
      .from('users')
      .select('cloned_voice_id')
      .eq('id', elderId)
      .single();

    return NextResponse.json({
      voiceId: data?.cloned_voice_id ?? null,
      hasClone: !!data?.cloned_voice_id,
    });
  } catch (err) {
    console.error('[GET /api/voice-clone]', err);
    return NextResponse.json({ error: 'Failed to fetch voice clone status' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { elderId } = await request.json();

    if (!elderId) {
      return NextResponse.json({ error: 'elderId is required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const supabase = createServerSupabaseClient();

    // Get the current voice ID before clearing
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('cloned_voice_id')
      .eq('id', elderId)
      .single();

    if (fetchError) {
      console.error('[DELETE /api/voice-clone] DB fetch error:', fetchError);
      return NextResponse.json({ error: 'Failed to look up voice clone' }, { status: 500 });
    }

    const voiceId = data?.cloned_voice_id;

    // Delete from ElevenLabs if we have a voice ID
    if (voiceId) {
      if (!apiKey) {
        console.warn('[DELETE /api/voice-clone] ELEVENLABS_API_KEY not configured, skipping remote deletion');
      } else {
        await fetch(`https://api.elevenlabs.io/v1/voices/${encodeURIComponent(voiceId)}`, {
          method: 'DELETE',
          headers: { 'xi-api-key': apiKey },
        }).catch((err) => {
          console.warn('[DELETE /api/voice-clone] ElevenLabs deletion failed (best-effort):', err.message);
        });
      }
    }

    // Clear from database
    const { error: updateError } = await supabase
      .from('users')
      .update({ cloned_voice_id: null })
      .eq('id', elderId);

    if (updateError) {
      console.error('[DELETE /api/voice-clone] DB update error:', updateError);
      return NextResponse.json({ error: 'Failed to clear voice clone from database' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/voice-clone]', err);
    return NextResponse.json({ error: 'Failed to delete voice clone' }, { status: 500 });
  }
}
