'use client';

import { useAudioPlayer } from '@/contexts/audio-player-context';
import { AudioPlayer } from '@/components/audio/audio-player';

export function GlobalAudioPlayer() {
  const { 
    isVisible, 
    tracks, 
    currentTrackIndex, 
    setCurrentTrackIndex, 
    hidePlayer 
  } = useAudioPlayer();

  if (!isVisible || tracks.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:pl-64">
      <AudioPlayer
        tracks={tracks}
        currentTrackIndex={currentTrackIndex}
        onTrackChange={setCurrentTrackIndex}
        onPlaylistToggle={hidePlayer}
        autoPlay={true}
      />
    </div>
  );
}