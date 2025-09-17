'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

interface AudioPlayerContextType {
  // Player state
  isVisible: boolean;
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTrackIndex: number;
  tracks: Track[];
  
  // Player controls
  showPlayer: (tracks: Track[], startIndex?: number) => void;
  hidePlayer: () => void;
  playTrack: (track: Track) => void;
  playTracks: (tracks: Track[], startIndex?: number) => void;
  setCurrentTrackIndex: (index: number) => void;
  togglePlayPause: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTrackIndex, setCurrentTrackIndexState] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);

  const showPlayer = (newTracks: Track[], startIndex: number = 0) => {
    setTracks(newTracks);
    setCurrentTrackIndexState(startIndex);
    setCurrentTrack(newTracks[startIndex] || null);
    setIsVisible(true);
    setIsPlaying(true);
  };

  const hidePlayer = () => {
    setIsVisible(false);
    setIsPlaying(false);
  };

  const playTrack = (track: Track) => {
    const trackIndex = tracks.findIndex(t => t.id === track.id);
    if (trackIndex !== -1) {
      setCurrentTrackIndexState(trackIndex);
      setCurrentTrack(track);
    } else {
      // Se a track não está na playlist atual, cria uma nova playlist com apenas essa track
      setTracks([track]);
      setCurrentTrackIndexState(0);
      setCurrentTrack(track);
    }
    setIsVisible(true);
    setIsPlaying(true);
  };

  const playTracks = (newTracks: Track[], startIndex: number = 0) => {
    showPlayer(newTracks, startIndex);
  };

  const setCurrentTrackIndex = (index: number) => {
    setCurrentTrackIndexState(index);
    setCurrentTrack(tracks[index] || null);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const value: AudioPlayerContextType = {
    isVisible,
    isPlaying,
    currentTrack,
    currentTrackIndex,
    tracks,
    showPlayer,
    hidePlayer,
    playTrack,
    playTracks,
    setCurrentTrackIndex,
    togglePlayPause,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
}