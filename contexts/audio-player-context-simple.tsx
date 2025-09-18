'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface AudioPlayerContextType {
  // Estado básico
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  volume: number;
  
  // Ações
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  
  // Estado da música atual
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  
  // Controles
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  
  // Reset
  reset: () => void;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  lyrics?: string;
  duration?: number;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

interface AudioPlayerProviderProps {
  children: React.ReactNode;
}

export function AudioPlayerProvider({ children }: AudioPlayerProviderProps) {
  // Estados agrupados para reduzir re-renders
  const [audioState, setAudioState] = useState({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    volume: 0.7,
    currentTrack: null as Track | null
  });

  // Ref para batching de updates
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdatesRef = useRef<Partial<typeof audioState>>({});

  // Batch updates para performance
  const batchUpdate = useCallback((updates: Partial<typeof audioState>) => {
    pendingUpdatesRef.current = { ...pendingUpdatesRef.current, ...updates };
    
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    
    updateTimerRef.current = setTimeout(() => {
      setAudioState(prev => ({ ...prev, ...pendingUpdatesRef.current }));
      pendingUpdatesRef.current = {};
      updateTimerRef.current = null;
    }, 16); // ~60fps
  }, []);

  // Setters otimizados
  const setCurrentTime = useCallback((time: number) => {
    batchUpdate({ currentTime: time });
  }, [batchUpdate]);

  const setDuration = useCallback((duration: number) => {
    batchUpdate({ duration });
  }, [batchUpdate]);

  const setIsPlaying = useCallback((isPlaying: boolean) => {
    setAudioState(prev => ({ ...prev, isPlaying }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setAudioState(prev => ({ ...prev, volume }));
  }, []);

  const setCurrentTrack = useCallback((track: Track | null) => {
    setAudioState(prev => ({ ...prev, currentTrack: track, currentTime: 0 }));
  }, []);

  // Controles simplificados
  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!audioState.isPlaying);
  }, [audioState.isPlaying]);

  const reset = useCallback(() => {
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current);
    }
    setAudioState({
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      volume: 0.7,
      currentTrack: null
    });
  }, []);

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, []);

  const contextValue: AudioPlayerContextType = {
    // Estado
    currentTime: audioState.currentTime,
    duration: audioState.duration,
    isPlaying: audioState.isPlaying,
    volume: audioState.volume,
    currentTrack: audioState.currentTrack,
    
    // Setters
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setVolume,
    setCurrentTrack,
    
    // Controles
    play,
    pause,
    togglePlayPause,
    
    // Reset
    reset
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
    throw new Error('useAudioPlayer deve ser usado dentro de um AudioPlayerProvider');
  }
  return context;
}