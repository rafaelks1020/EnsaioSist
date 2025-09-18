'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  List,
  Mic2,
  Maximize2,
  Heart,
  Shuffle,
  Clock,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioPlayer } from '@/contexts/audio-player-context';
import { SyncedLyricsDisplay } from './synced-lyrics-display';
import { MobileLyricsViewer } from './mobile-lyrics-viewer';
import { LyricsSyncEditor } from './lyrics-sync-editor';
import { useLyricsSyncService } from '@/lib/lyrics-sync-service';

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [currentIndex, setCurrentIndex] = useState(currentTrackIndex);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [isLyricsFullscreen, setIsLyricsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSyncEditor, setShowSyncEditor] = useState(false);
  const [syncedTimestamps, setSyncedTimestamps] = useState<any[]>([]);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { setCurrentTime: setContextTime } = useAudioPlayer();
  const lyricsSyncService = useLyricsSyncService();

  const currentTrack = tracks[currentIndex];

  // Detectar dispositivos móveis
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Atualizar contexto global quando o tempo mudar
  useEffect(() => {
    setContextTime(currentTime);
  }, [currentTime, setContextTime]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.url;
    audio.volume = isMuted ? 0 : volume;
    
    if (autoPlay) {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [currentIndex, currentTrack, autoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const updateDuration = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === 'all' || currentIndex < tracks.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [repeatMode, currentIndex, tracks.length]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch (error) {
        console.error('Erro ao reproduzir áudio:', error);
      }
    }
  };

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
    setCurrentIndex(newIndex);
    onTrackChange?.(newIndex);
  };

  const handleNext = () => {
    const newIndex = currentIndex < tracks.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    onTrackChange?.(newIndex);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const newVolume = parseFloat(e.target.value);
    
    if (audio) {
      audio.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const toggleRepeat = () => {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Aqui você pode implementar a lógica para salvar favoritos
  };

  const toggleLyrics = () => {
    if (currentTrack?.lyrics) {
      if (isMobile) {
        setIsLyricsFullscreen(true);
      }
      setShowLyricsPanel(!showLyricsPanel);
    }
  };

  const toggleLyricsFullscreen = () => {
    setIsLyricsFullscreen(!isLyricsFullscreen);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'one':
        return <Repeat1 className="h-4 w-4" />;
      case 'all':
        return <Repeat className="h-4 w-4 text-green-500" />;
      default:
        return <Repeat className="h-4 w-4" />;
    }
  };

  if (!currentTrack) {
    return null;
  }

  return (
    <>
      <div className="bg-gradient-to-r from-gray-900 to-black border-t shadow-2xl text-white">
        <audio ref={audioRef} preload="metadata" />
        
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          className="w-full h-1 bg-gray-700 cursor-pointer hover:h-2 transition-all group"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-green-500 transition-all relative group-hover:bg-green-400"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="block lg:hidden">
          {/* Track Info */}
          <div className="flex items-center gap-3 p-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-md flex items-center justify-center text-white font-bold flex-shrink-0">
              {currentTrack.title.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-white truncate text-sm">{currentTrack.title}</h3>
              <p className="text-xs text-gray-300 truncate">{currentTrack.artist}</p>
            </div>
            
            <div className="flex items-center gap-1">
              {currentTrack.lyrics && (
                <Button
                  onClick={toggleLyrics}
                  className={`p-2 h-8 w-8 ${showLyricsPanel ? 'text-green-400' : 'text-gray-400'} hover:text-white`}
                  title="Ver letra"
                >
                  <Mic2 className="h-4 w-4" />
                </Button>
              )}

              {currentTrack.lyrics && (
                <Button
                  onClick={() => setShowSyncEditor(true)}
                  className="p-2 h-8 w-8 text-gray-400 hover:text-white"
                  title="Sincronizar letra"
                >
                  <Clock className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                onClick={toggleFavorite}
                className={`p-2 h-8 w-8 ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-white`}
                title="Favoritar"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 px-4 pb-3">
            <Button
              onClick={toggleShuffle}
              className={`p-2 h-8 w-8 ${isShuffled ? 'text-green-400' : 'text-gray-400'} hover:text-white`}
              title="Aleatório"
            >
              <Shuffle className="h-4 w-4" />
            </Button>

            <Button
              onClick={handlePrevious}
              className="p-2 h-8 w-8 text-gray-400 hover:text-white"
              disabled={tracks.length <= 1}
            >
              <SkipBack className="h-5 w-5" />
            </Button>

            <Button
              onClick={togglePlay}
              className="p-3 h-12 w-12 rounded-full bg-white hover:bg-gray-100 text-black flex items-center justify-center"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>

            <Button
              onClick={handleNext}
              className="p-2 h-8 w-8 text-gray-400 hover:text-white"
              disabled={tracks.length <= 1}
            >
              <SkipForward className="h-5 w-5" />
            </Button>

            <Button
              onClick={toggleRepeat}
              className={`p-2 h-8 w-8 ${repeatMode !== 'none' ? 'text-green-400' : 'text-gray-400'} hover:text-white`}
              title={`Repetir: ${repeatMode}`}
            >
              {getRepeatIcon()}
            </Button>
          </div>

          {/* Time and Volume */}
          <div className="flex items-center justify-between px-4 pb-3 text-xs text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                className="p-1 h-6 w-6 text-gray-400 hover:text-white"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between p-4 max-w-7xl mx-auto">
            {/* Track Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-md flex items-center justify-center text-white font-bold text-lg">
                {currentTrack.title.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-white truncate text-base">{currentTrack.title}</h3>
                <p className="text-sm text-gray-300 truncate">{currentTrack.artist}</p>
              </div>
              <Button
                onClick={toggleFavorite}
                className={`p-2 h-8 w-8 ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-white`}
                title="Favoritar"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            {/* Center Controls */}
            <div className="flex flex-col items-center gap-3 mx-8">
              <div className="flex items-center gap-3">
                <Button
                  onClick={toggleShuffle}
                  className={`p-2 h-8 w-8 ${isShuffled ? 'text-green-400' : 'text-gray-400'} hover:text-white`}
                  title="Aleatório"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>

                <Button
                  onClick={handlePrevious}
                  className="p-2 h-8 w-8 text-gray-400 hover:text-white"
                  disabled={tracks.length <= 1}
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  onClick={togglePlay}
                  className="p-3 h-12 w-12 rounded-full bg-white hover:bg-gray-100 text-black flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6 ml-0.5" />
                  )}
                </Button>

                <Button
                  onClick={handleNext}
                  className="p-2 h-8 w-8 text-gray-400 hover:text-white"
                  disabled={tracks.length <= 1}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>

                <Button
                  onClick={toggleRepeat}
                  className={`p-2 h-8 w-8 ${repeatMode !== 'none' ? 'text-green-400' : 'text-gray-400'} hover:text-white`}
                  title={`Repetir: ${repeatMode}`}
                >
                  {getRepeatIcon()}
                </Button>
              </div>

              {/* Progress with time */}
              <div className="flex items-center gap-2 w-full max-w-md">
                <span className="text-xs text-gray-400 w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer group" onClick={handleProgressClick}>
                  <div 
                    className="h-full bg-green-500 rounded-full relative group-hover:bg-green-400"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5" />
                  </div>
                </div>
                <span className="text-xs text-gray-400 w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
              {currentTrack.lyrics && (
                <Button
                  onClick={toggleLyrics}
                  className={`p-2 h-8 w-8 ${showLyricsPanel ? 'text-green-400' : 'text-gray-400'} hover:text-white`}
                  title="Ver letra"
                >
                  <Mic2 className="h-4 w-4" />
                </Button>
              )}

              {onPlaylistToggle && (
                <Button
                  onClick={onPlaylistToggle}
                  className="p-2 h-8 w-8 text-gray-400 hover:text-white"
                  title="Ver playlist"
                >
                  <List className="h-4 w-4" />
                </Button>
              )}
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleMute}
                  className="p-2 h-8 w-8 text-gray-400 hover:text-white"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics Display */}
      {currentTrack.lyrics && (
        <>
          {/* Mobile: Viewer em tela cheia */}
          {isMobile && isLyricsFullscreen && (
            <MobileLyricsViewer
              hymn={{
                id: currentTrack.id,
                title: currentTrack.title,
                lyrics: currentTrack.lyrics,
                artist: currentTrack.artist,
              }}
              currentTime={currentTime}
              isVisible={showLyricsPanel}
              onClose={() => {
                setShowLyricsPanel(false);
                setIsLyricsFullscreen(false);
              }}
              isPlaying={isPlaying}
            />
          )}
          
          {/* Desktop: Display sincronizado */}
          {!isMobile && (
            <SyncedLyricsDisplay
              hymn={{
                id: currentTrack.id,
                title: currentTrack.title,
                lyrics: currentTrack.lyrics,
                artist: currentTrack.artist,
              }}
              currentTime={currentTime}
              isVisible={showLyricsPanel}
              onClose={() => setShowLyricsPanel(false)}
              isFullscreen={isLyricsFullscreen}
              onToggleFullscreen={toggleLyricsFullscreen}
              isPlaying={isPlaying}
            />
          )}
        </>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 12px;
          width: 12px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* Editor de Sincronização */}
      {showSyncEditor && currentTrack && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-hidden">
            <LyricsSyncEditor
              hymn={{
                id: currentTrack.id,
                title: currentTrack.title,
                lyrics: currentTrack.lyrics || '',
                mp3Url: currentTrack.url
              }}
              onSave={async (timestamps) => {
                console.log('Timestamps salvos:', timestamps);
                setSyncedTimestamps(timestamps);
                setShowSyncEditor(false);
              }}
              onCancel={() => setShowSyncEditor(false)}
              onLoadExisting={(timestamps) => {
                setSyncedTimestamps(timestamps);
                console.log('Sincronização existente carregada:', timestamps);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}