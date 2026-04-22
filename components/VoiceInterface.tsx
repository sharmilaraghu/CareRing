"use client";

import { useState, useRef, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";

export interface SessionResult {
  transcript: string;
}

export type VoiceStatus = "idle" | "micRequested" | "connecting" | "connected" | "disconnected";

interface Props {
  onSessionEnd: (result: SessionResult) => void;
  onError: (err: Error) => void;
}

export default function useVoiceInterface({ onSessionEnd, onError }: Props) {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const transcriptRef = useRef<string[]>([]);

  const conversation = useConversation({
    onConnect: () => setStatus("connected"),
    onDisconnect: () => {
      const transcript = transcriptRef.current.join("\n");
      transcriptRef.current = [];
      setStatus("idle");
      onSessionEnd({ transcript });
    },
    onMessage: (msg) => {
      if (msg.message) {
        const role = msg.source === "user" ? "User" : "Companion";
        transcriptRef.current.push(`${role}: ${msg.message}`);
      }
    },
    onError: (message: string) => {
      setStatus("idle");
      onError(new Error(message));
    },
  });

  const start = useCallback(async () => {
    try {
      setStatus("micRequested");
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setStatus("connecting");

      const res = await fetch("/api/signed-url");
      if (!res.ok) {
        throw new Error("Failed to get signed URL from server");
      }
      const { signedUrl } = await res.json();

      await conversation.startSession({
        signedUrl,
        connectionType: "websocket",
      });
    } catch (err) {
      setStatus("idle");
      onError(err instanceof Error ? err : new Error("Failed to start session"));
    }
  }, [conversation, onError]);

  const stop = useCallback(() => {
    conversation.endSession();
  }, [conversation]);

  return { status, start, stop };
}
