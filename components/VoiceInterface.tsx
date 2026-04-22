"use client";

import { useState, useRef, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";

export interface SessionResult {
  transcript: string;
}

export type VoiceStatus = "idle" | "micRequested" | "connecting" | "connected" | "disconnected";

export interface ClientToolsMap {
  [toolName: string]: (params: Record<string, unknown>) => Promise<string | Record<string, unknown>>;
}

export interface SessionOverrides {
  systemPromptContext?: string;
  firstMessage?: string;
}

interface Props {
  onSessionEnd: (result: SessionResult) => void;
  onError: (err: Error) => void;
  clientTools?: ClientToolsMap;
  overrides?: SessionOverrides;
}

export default function useVoiceInterface({ onSessionEnd, onError, clientTools, overrides }: Props) {
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

      // Build session config with optional overrides and client tools
      const sessionConfig: Record<string, unknown> = {
        signedUrl,
        connectionType: "websocket",
      };

      // Add client tools if provided
      if (clientTools && Object.keys(clientTools).length > 0) {
        sessionConfig.clientTools = clientTools;
      }

      // Add overrides if provided (system prompt context + first message)
      if (overrides?.systemPromptContext || overrides?.firstMessage) {
        sessionConfig.overrides = {
          agent: {
            prompt: overrides.systemPromptContext
              ? { prompt: overrides.systemPromptContext }
              : undefined,
            firstMessage: overrides.firstMessage || undefined,
          },
        };
      }

      await conversation.startSession(sessionConfig);
    } catch (err) {
      setStatus("idle");
      onError(err instanceof Error ? err : new Error("Failed to start session"));
    }
  }, [conversation, onError, clientTools, overrides]);

  const stop = useCallback(() => {
    conversation.endSession();
  }, [conversation]);

  return { status, start, stop };
}
