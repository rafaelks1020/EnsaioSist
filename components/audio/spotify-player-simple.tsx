'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Heart,
  Shuffle,
  Mic2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioPlayer } from '@/contexts/audio-player-context';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  lyrics?: string;
  duration?: number;
}

interface SpotifyPlayerProps {
  tracks: Track[];
  currentTrackIndex?: number;
  onTrackChange?: (index: number) => void;
  onPlaylistToggle?: () => void;
  autoPlay?: boolean;
}

type RepeatMode = 'none' | 'all' | 'one';

export function SpotifyPlayer({ 
  tracks, 
  currentTrackIndex = 0, 
  onTrackChange,
  onPlaylistToggle,
  autoPlay = false 
}: SpotifyPlayerProps) {
  // Estados principais agrupados para reduzir re-renders
  const [playerState, setPlayerState] = useState({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    repeatMode: 'none' as RepeatMode,
    currentIndex: currentTrackIndex,
    isShuffled: false,
    isFavorite: false
  });

  // Estados de UI separados
  const [uiState, setUiState] = useState({
    showLyricsPanel: false,
    isLyricsFullscreen: false,
    isMobile: false,
    isLoading: false,
    hasError: false
  });

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const isMountedRef = useRef(true);

  // Hook do contexto
  const { setCurrentTime: setContextTime } = useAudioPlayer();

  // Valores memoizados para performance
  const currentTrack = useMemo(() => tracks[playerState.currentIndex], [tracks, playerState.currentIndex]);
  
  const progressPercentage = useMemo(() => {
    return playerState.duration > 0 ? (playerState.currentTime / playerState.duration) * 100 : 0;
  }, [playerState.currentTime, playerState.duration]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Detectar dispositivos móveis com debounce
  useEffect(() => {
    const checkMobile = () => {
      if (isMountedRef.current) {
        setUiState(prev => ({ ...prev, isMobile: window.innerWidth < 768 }));
      }
    };
    
    checkMobile();
    
    let resizeTimer: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(checkMobile, 150);
    };
    
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Carregar nova faixa
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !isMountedRef.current) return;

    setUiState(prev => ({ ...prev, isLoading: true, hasError: false }));

    const cleanup = () => {
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('loadstart', onLoadStart);
    };

    const onLoadStart = () => {
      if (isMountedRef.current) {
        setUiState(prev => ({ ...prev, isLoading: true }));
      }
    };

    const onCanPlay = () => {
      if (isMountedRef.current) {
        setUiState(prev => ({ ...prev, isLoading: false }));
        
        if (autoPlay && playerState.isPlaying) {
          audio.play().catch(error => {
            console.warn('Auto-play bloqueado:', error);
            setPlayerState(prev => ({ ...prev, isPlaying: false }));
          });
        }
      }
    };

    const onError = (e: Event) => {
      if (isMountedRef.current) {
        console.error('Erro ao carregar áudio:', e);
        setUiState(prev => ({ ...prev, isLoading: false, hasError: true }));
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    audio.addEventListener('loadstart', onLoadStart);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);
    
    // Configurar áudio
    audio.src = currentTrack.url;
    audio.volume = playerState.isMuted ? 0 : playerState.volume;
    audio.preload = 'metadata';

    return cleanup;
  }, [currentTrack, autoPlay, playerState.isMuted, playerState.volume, playerState.isPlaying]);

  // Event listeners do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Throttle para atualizações de tempo
    const updateTime = () => {
      const now = Date.now();
      if (now - lastUpdateTimeRef.current > 100) { // Atualizar a cada 100ms
        lastUpdateTimeRef.current = now;
        if (isMountedRef.current && isFinite(audio.currentTime)) {
          const newTime = audio.currentTime;
          setPlayerState(prev => ({ ...prev, currentTime: newTime }));
          setContextTime(newTime);
        }
      }
    };
    
    const updateDuration = () => {
      if (isMountedRef.current && isFinite(audio.duration)) {
        setPlayerState(prev => ({ ...prev, duration: audio.duration }));
      }
    };
    
    const handleEnded = () => {
      if (!isMountedRef.current) return;
      
      if (playerState.repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else if (playerState.repeatMode === 'all' || playerState.currentIndex < tracks.length - 1) {
        handleNext();
      } else {
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    const handlePlay = () => {
      if (isMountedRef.current) {
        setPlayerState(prev => ({ ...prev, isPlaying: true }));
      }
    };
    
    const handlePause = () => {
      if (isMountedRef.current) {
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
      }
    };

    const handleWaiting = () => {
      if (isMountedRef.current) {
        setUiState(prev => ({ ...prev, isLoading: true }));
      }
    };

    const handleCanPlay = () => {
      if (isMountedRef.current) {
        setUiState(prev => ({ ...prev, isLoading: false }));
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [playerState.repeatMode, playerState.currentIndex, tracks.length, setContextTime]);

  // Controles otimizados
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    try {
      if (playerState.isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      setUiState(prev => ({ ...prev, hasError: true }));
    }
  }, [playerState.isPlaying, currentTrack]);

  const handlePrevious = useCallback(() => {
    const newIndex = playerState.currentIndex > 0 ? playerState.currentIndex - 1 : tracks.length - 1;
    setPlayerState(prev => ({ ...prev, currentIndex: newIndex }));
    onTrackChange?.(newIndex);
  }, [playerState.currentIndex, tracks.length, onTrackChange]);

  const handleNext = useCallback(() => {
    const newIndex = playerState.currentIndex < tracks.length - 1 ? playerState.currentIndex + 1 : 0;
    setPlayerState(prev => ({ ...prev, currentIndex: newIndex }));
    onTrackChange?.(newIndex);
  }, [playerState.currentIndex, tracks.length, onTrackChange]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar || playerState.duration === 0) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * playerState.duration;
    
    audio.currentTime = newTime;
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
  }, [playerState.duration]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const newMutedState = !playerState.isMuted;
    setPlayerState(prev => ({ ...prev, isMuted: newMutedState }));
    audio.volume = newMutedState ? 0 : playerState.volume;
  }, [playerState.isMuted, playerState.volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value);
    
    if (audio) {
      setPlayerState(prev => ({ 
        ...prev, 
        volume: newVolume,
        isMuted: newVolume === 0 
      }));
      audio.volume = newVolume;
    }
  }, []);

  const toggleRepeat = useCallback(() => {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const currentModeIndex = modes.indexOf(playerState.repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setPlayerState(prev => ({ ...prev, repeatMode: nextMode }));
  }, [playerState.repeatMode]);

  const toggleShuffle = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isShuffled: !prev.isShuffled }));
  }, []);

  const toggleFavorite = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isFavorite: !prev.isFavorite }));
  }, []);

  const toggleLyrics = useCallback(() => {
    if (currentTrack?.lyrics) {
      setUiState(prev => ({ 
        ...prev, 
        showLyricsPanel: !prev.showLyricsPanel,
        isLyricsFullscreen: prev.isMobile ? !prev.isLyricsFullscreen : prev.isLyricsFullscreen
      }));
    }
  }, [currentTrack?.lyrics, uiState.isMobile]);

  const formatTime = useCallback((time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  if (!currentTrack) {
    return null;
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      
      {/* Player Principal */}
      <div className="bg-gradient-to-r from-gray-900 to-black text-white shadow-2xl border-t border-gray-700">
        {/* Barra de Progresso */}
        <div className="w-full bg-gray-600 h-1 cursor-pointer group" ref={progressRef} onClick={handleProgressClick}>
          <div 
            className="bg-green-500 h-full transition-all duration-100 group-hover:bg-green-400 relative"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          {/* Informações da Música */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold">
                  {currentTrack.title.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white truncate">
                {currentTrack.title}
              </h3>
              <p className="text-sm text-gray-300 truncate">
                {currentTrack.artist}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFavorite}
              className={`text-gray-400 hover:text-white ${playerState.isFavorite ? 'text-green-500' : ''}`}
            >
              <Heart className={`h-5 w-5 ${playerState.isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Controles Centrais */}
          <div className="flex flex-col items-center space-y-2 flex-1 max-w-md">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleShuffle}
                className={`text-gray-400 hover:text-white ${playerState.isShuffled ? 'text-green-500' : ''}`}
              >
                <Shuffle className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className="text-gray-400 hover:text-white"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                onClick={togglePlay}
                disabled={uiState.isLoading || uiState.hasError}
                className="bg-white text-black hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-all"
              >
                {uiState.isLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : playerState.isPlaying ? (
                  <Pause className="h-5 w-5 ml-0.5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="text-gray-400 hover:text-white"
              >
                <SkipForward className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRepeat}
                className={`text-gray-400 hover:text-white ${playerState.repeatMode !== 'none' ? 'text-green-500' : ''}`}
              >
                {playerState.repeatMode === 'one' ? (
                  <Repeat1 className="h-4 w-4" />
                ) : (
                  <Repeat className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>{formatTime(playerState.currentTime)}</span>
              <span>/</span>
              <span>{formatTime(playerState.duration)}</span>
            </div>
          </div>

          {/* Controles da Direita */}
          <div className="flex items-center space-x-3 flex-1 justify-end">
            {/* Letras */}
            {currentTrack.lyrics && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLyrics}
                className={`text-gray-400 hover:text-white ${uiState.showLyricsPanel ? 'text-green-500' : ''}`}
                title="Mostrar/Ocultar letras"
              >
                <Mic2 className="h-4 w-4" />
              </Button>
            )}

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-gray-400 hover:text-white"
              >
                {playerState.isMuted || playerState.volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={playerState.isMuted ? 0 : playerState.volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer slider"
              />
            </div>

            {/* Fechar */}
            {onPlaylistToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPlaylistToggle}
                className="text-gray-400 hover:text-white"
                title="Fechar player"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Error State */}
        {uiState.hasError && (
          <div className="px-4 py-2 bg-red-600 text-white text-sm flex items-center justify-between">
            <span>⚠️ Erro ao carregar áudio. Verifique a conexão.</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUiState(prev => ({ ...prev, hasError: false }))}
              className="text-white hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Painel de Letras Simples */}
      {uiState.showLyricsPanel && currentTrack.lyrics && (
        <div className="bg-gray-900 text-white border-t border-gray-700 max-h-64 overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Letras - {currentTrack.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLyrics}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              <pre className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">
                {currentTrack.lyrics}
              </pre>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 0 2px rgba(0,0,0,0.5);
        }
        
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 2px rgba(0,0,0,0.5);
        }

        .slider::-webkit-slider-track {
          background: transparent;
        }
      `}</style>
    </>
  );
}