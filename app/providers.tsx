'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { AudioPlayerProvider } from '@/contexts/audio-player-context';
import { GlobalAudioPlayer } from '@/components/audio/global-audio-player';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AudioPlayerProvider>
        {children}
        <GlobalAudioPlayer />
        <Toaster richColors position="top-right" />
      </AudioPlayerProvider>
    </SessionProvider>
  );
}