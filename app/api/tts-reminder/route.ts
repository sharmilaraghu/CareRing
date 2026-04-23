import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, elderId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
    }

    // Priority: explicit voiceId > cloned voice from DB > default Matilda
    let voice = voiceId || null;
    if (!voice && elderId) {
      const supabase = createServerSupabaseClient();
      const { data } = await supabase
        .from('users')
        .select('cloned_voice_id')
        .eq('id', elderId)
        .single();
      voice = data?.cloned_voice_id || null;
    }
    voice = voice || 'XrExE9yKIg1WjnnlVkGX'; // Matilda default

    // Sanitize voiceId — must be alphanumeric (ElevenLabs voice IDs are alphanumeric strings)
    if (!/^[a-zA-Z0-9]+$/.test(voice)) {
      return NextResponse.json({ error: 'Invalid voiceId format' }, { status: 400 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_flash_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.3,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[TTS] ElevenLabs error:', errorText);
      return NextResponse.json({ error: 'TTS generation failed' }, { status: 502 });
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('[POST /api/tts-reminder]', err);
    return NextResponse.json({ error: 'Failed to generate reminder' }, { status: 500 });
  }
}
