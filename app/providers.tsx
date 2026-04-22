'use client';

import { ConversationProvider } from '@elevenlabs/react';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConversationProvider
      isMuted={false}
      onMutedChange={undefined}
    >
      {children}
    </ConversationProvider>
  );
}
