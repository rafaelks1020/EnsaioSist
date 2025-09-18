'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useRef, useEffect } from 'react';

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
  // Estado otimizado com menos re-renders
  const [playerState, setPlayerState] = useState({
    isVisible: false,
    isPlaying: false,
    currentTrackIndex: 0,
    currentTime: 0,
    showLyrics: false
  });
  
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  
  // Ref para evitar closures obsoletos
  const stateRef = useRef(playerState);
  stateRef.current = playerState;

  // Atualizar estado de forma batched
  const updatePlayerState = useCallback((updates: Partial<typeof playerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }));
  }, []);

  const showPlayer = useCallback((newTracks: Track[], startIndex: number = 0) => {
    setTracks(newTracks);
    setCurrentTrack(newTracks[startIndex] || null);
    updatePlayerState({
      currentTrackIndex: startIndex,
      isVisible: true,
      isPlaying: true
    });
  }, [updatePlayerState]);

  const hidePlayer = useCallback(() => {
    updatePlayerState({
      isVisible: false,
      isPlaying: false
    });
  }, [updatePlayerState]);

  const playTrack = useCallback((track: Track) => {
    const trackIndex = tracks.findIndex(t => t.id === track.id);
    if (trackIndex !== -1) {
      setCurrentTrack(track);
      updatePlayerState({
        currentTrackIndex: trackIndex,
        isVisible: true,
        isPlaying: true
      });
    } else {
      // Se a track não está na playlist atual, cria uma nova playlist
      setTracks([track]);
      setCurrentTrack(track);
      updatePlayerState({
        currentTrackIndex: 0,
        isVisible: true,
        isPlaying: true
      });
    }
  }, [tracks, updatePlayerState]);

  const playTracks = useCallback((newTracks: Track[], startIndex: number = 0) => {
    showPlayer(newTracks, startIndex);
  }, [showPlayer]);

  const setCurrentTrackIndex = useCallback((index: number) => {
    if (index >= 0 && index < tracks.length) {
      setCurrentTrack(tracks[index]);
      updatePlayerState({ currentTrackIndex: index });
    }
  }, [tracks, updatePlayerState]);

  const togglePlayPause = useCallback(() => {
    updatePlayerState({ isPlaying: !stateRef.current.isPlaying });
  }, [updatePlayerState]);

  const setCurrentTime = useCallback((time: number) => {
    // Throttle das atualizações para evitar re-renders excessivos
    updatePlayerState({ currentTime: time });
  }, [updatePlayerState]);

  const toggleLyrics = useCallback(() => {
    updatePlayerState({ showLyrics: !stateRef.current.showLyrics });
  }, [updatePlayerState]);

  const contextValue: AudioPlayerContextType = {
    // State
    isVisible: playerState.isVisible,
    isPlaying: playerState.isPlaying,
    currentTrack,
    currentTrackIndex: playerState.currentTrackIndex,
    tracks,
    currentTime: playerState.currentTime,
    showLyrics: playerState.showLyrics,
    
    // Controls
    showPlayer,
    hidePlayer,
    playTrack,
    playTracks,
    setCurrentTrackIndex,
    togglePlayPause,
    setCurrentTime,
    toggleLyrics
  };

  return (
    <AudioPlayerContext.Provider value={contextValue}>
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