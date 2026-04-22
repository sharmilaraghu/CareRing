import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!agentId || !apiKey) {
    return NextResponse.json(
      { error: "Server misconfigured: missing agent ID or API key" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
      {
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to get signed URL: ${errorText}` },
        { status: 502 }
      );
    }

    const { signed_url } = await response.json();
    return NextResponse.json({ signedUrl: signed_url });
  } catch (error) {
    return NextResponse.json(
      { error: `Exception getting signed URL: ${error}` },
      { status: 500 }
    );
  }
}
