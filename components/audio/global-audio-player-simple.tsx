'use client';

import React from 'react';
import { useAudioPlayer } from '@/contexts/audio-player-context-simple';
import { SpotifyPlayer } from './spotify-player-simple';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  lyrics?: string;
  duration?: number;
}

interface GlobalAudioPlayerProps {
  onClose?: () => void;
}

export function GlobalAudioPlayer({ onClose }: GlobalAudioPlayerProps) {
  const { currentTrack, reset } = useAudioPlayer();

  if (!currentTrack) {
    return null;
  }

  const tracks: Track[] = [currentTrack];

  const handleClose = () => {
    reset();
    onClose?.();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <SpotifyPlayer 
        tracks={tracks}
        currentTrackIndex={0}
        onPlaylistToggle={handleClose}
        autoPlay={true}
      />
    </div>
  );
}