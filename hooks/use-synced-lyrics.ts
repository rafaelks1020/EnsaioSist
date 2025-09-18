'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LyricTimestamp } from '@/hooks/use-auto-lyrics-sync';
import { useLyricsSyncService } from '@/lib/lyrics-sync-service';

interface UseSyncedLyricsProps {
  hymnId: string;
  currentTime: number;
  isPlaying: boolean;
}

interface SyncedLyricsState {
  timestamps: LyricTimestamp[];
  currentLineIndex: number;
  nextLineIndex: number;
  currentLine: LyricTimestamp | null;
  nextLine: LyricTimestamp | null;
  progress: number; // Progresso da linha atual (0-1)
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  syncQuality: {
    averageConfidence: number;
    qualityScore: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export function useSyncedLyrics({ hymnId, currentTime, isPlaying }: UseSyncedLyricsProps): SyncedLyricsState {
  const [timestamps, setTimestamps] = useState<LyricTimestamp[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lyricsSyncService = useLyricsSyncService();
  const loadedHymnId = useRef<string | null>(null);

  // Carregar timestamps quando o hino mudar
  useEffect(() => {
    if (!hymnId || loadedHymnId.current === hymnId) return;

    const loadTimestamps = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const loadedTimestamps = await lyricsSyncService.loadAndApplySync(hymnId);
        if (loadedTimestamps) {
          setTimestamps(loadedTimestamps);
          setIsLoaded(true);
        } else {
          setTimestamps([]);
          setIsLoaded(false);
        }
        loadedHymnId.current = hymnId;
      } catch (err) {
        setError('Erro ao carregar sincronização');
        setTimestamps([]);
        setIsLoaded(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimestamps();
  }, [hymnId, lyricsSyncService]);

  // Encontrar linha atual baseada no tempo
  const getCurrentLineIndex = useCallback(() => {
    if (!timestamps.length) return -1;
    
    return timestamps.findIndex(timestamp => 
      currentTime >= timestamp.startTime && currentTime <= timestamp.endTime
    );
  }, [timestamps, currentTime]);

  // Encontrar próxima linha
  const getNextLineIndex = useCallback(() => {
    if (!timestamps.length) return -1;
    
    return timestamps.findIndex(timestamp => 
      timestamp.startTime > currentTime
    );
  }, [timestamps, currentTime]);

  // Calcular progresso da linha atual
  const calculateProgress = useCallback((lineIndex: number) => {
    if (lineIndex < 0 || !timestamps[lineIndex]) return 0;
    
    const line = timestamps[lineIndex];
    const duration = line.endTime - line.startTime;
    const elapsed = currentTime - line.startTime;
    
    return Math.max(0, Math.min(1, elapsed / duration));
  }, [timestamps, currentTime]);

  // Estados calculados
  const currentLineIndex = getCurrentLineIndex();
  const nextLineIndex = getNextLineIndex();
  const currentLine = currentLineIndex >= 0 ? timestamps[currentLineIndex] : null;
  const nextLine = nextLineIndex >= 0 ? timestamps[nextLineIndex] : null;
  const progress = calculateProgress(currentLineIndex);

  // Calcular qualidade da sincronização
  const syncQuality = timestamps.length > 0 
    ? lyricsSyncService.calculateSyncQuality(timestamps)
    : { averageConfidence: 0, qualityScore: 'poor' as const };

  return {
    timestamps,
    currentLineIndex,
    nextLineIndex,
    currentLine,
    nextLine,
    progress,
    isLoaded,
    isLoading,
    error,
    syncQuality
  };
}

// Hook para integração avançada com player de áudio
export function useAdvancedSyncedPlayer(hymnId: string, audioRef: React.RefObject<HTMLAudioElement>) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const syncedLyrics = useSyncedLyrics({ 
    hymnId, 
    currentTime, 
    isPlaying 
  });

  // Sincronizar com elemento de áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const updatePlaying = () => setIsPlaying(!audio.paused);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', updatePlaying);
    audio.addEventListener('pause', updatePlaying);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', updatePlaying);
      audio.removeEventListener('pause', updatePlaying);
    };
  }, [audioRef]);

  // Funções de controle avançado
  const seekToLine = useCallback((lineIndex: number) => {
    const audio = audioRef.current;
    if (!audio || !syncedLyrics.timestamps[lineIndex]) return;

    audio.currentTime = syncedLyrics.timestamps[lineIndex].startTime;
  }, [audioRef, syncedLyrics.timestamps]);

  const seekToNextLine = useCallback(() => {
    if (syncedLyrics.nextLineIndex >= 0) {
      seekToLine(syncedLyrics.nextLineIndex);
    }
  }, [syncedLyrics.nextLineIndex, seekToLine]);

  const seekToPreviousLine = useCallback(() => {
    const currentIndex = syncedLyrics.currentLineIndex;
    if (currentIndex > 0) {
      seekToLine(currentIndex - 1);
    }
  }, [syncedLyrics.currentLineIndex, seekToLine]);

  // Reprodução automática das linhas (para karaokê)
  const [karaokeMode, setKaraokeMode] = useState(false);

  useEffect(() => {
    if (!karaokeMode || !syncedLyrics.currentLine) return;

    // Lógica para destacar palavras durante a reprodução
    // Pode ser expandida para sincronização palavra por palavra
    
  }, [karaokeMode, syncedLyrics.currentLine, currentTime]);

  return {
    ...syncedLyrics,
    currentTime,
    duration,
    isPlaying,
    seekToLine,
    seekToNextLine,
    seekToPreviousLine,
    karaokeMode,
    setKaraokeMode
  };
}