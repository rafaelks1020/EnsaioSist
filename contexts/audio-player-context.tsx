'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  lyrics?: string;
}

interface AudioPlayerContextType {
  // Player state
  isVisible: boolean;
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTrackIndex: number;
  tracks: Track[];
  currentTime: number;
  showLyrics: boolean;
  
  // Player controls
  showPlayer: (tracks: Track[], startIndex?: number) => void;
  hidePlayer: () => void;
  playTrack: (track: Track) => void;
  playTracks: (tracks: Track[], startIndex?: number) => void;
  setCurrentTrackIndex: (index: number) => void;
  togglePlayPause: () => void;
  setCurrentTime: (time: number) => void;
  toggleLyrics: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentTrackIndex, setCurrentTrackIndexState] = useState(0);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTime, setCurrentTimeState] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);

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

  const setCurrentTime = (time: number) => {
    setCurrentTimeState(time);
  };

  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
  };

  const value: AudioPlayerContextType = {
    isVisible,
    isPlaying,
    currentTrack,
    currentTrackIndex,
    tracks,
    currentTime,
    showLyrics,
    showPlayer,
    hidePlayer,
    playTrack,
    playTracks,
    setCurrentTrackIndex,
    togglePlayPause,
    setCurrentTime,
    toggleLyrics,
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