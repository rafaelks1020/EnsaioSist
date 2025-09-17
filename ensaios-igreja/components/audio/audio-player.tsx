'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Volume2, VolumeX, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration?: number;
}

interface AudioPlayerProps {
  tracks: Track[];
  currentTrackIndex?: number;
  onTrackChange?: (index: number) => void;
  onPlaylistToggle?: () => void;
  autoPlay?: boolean;
}

type RepeatMode = 'none' | 'all' | 'one';

export function AudioPlayer({ 
  tracks, 
  currentTrackIndex = 0, 
  onTrackChange,
  onPlaylistToggle,
  autoPlay = false 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [currentIndex, setCurrentIndex] = useState(currentTrackIndex);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const currentTrack = tracks[currentIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    audio.src = currentTrack.url;
    
    if (autoPlay) {
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [currentIndex, currentTrack, autoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
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

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeatMode, currentIndex, tracks.length]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
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
        return <Repeat className="h-4 w-4 text-blue-600" />;
      default:
        return <Repeat className="h-4 w-4" />;
    }
  };

  if (!currentTrack) {
    return (
      <div className="bg-white border-t shadow-lg p-4">
        <div className="text-center text-gray-500">
          Nenhuma música selecionada
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t shadow-lg">
      <audio ref={audioRef} preload="metadata" />
      
      {/* Progress Bar */}
      <div 
        ref={progressRef}
        className="w-full h-1 bg-gray-200 cursor-pointer hover:h-2 transition-all"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-blue-600 transition-all"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>

      <div className="flex items-center justify-between p-4 max-w-6xl mx-auto">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center text-white font-bold">
            {currentTrack.title.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 truncate">{currentTrack.title}</h3>
            <p className="text-sm text-gray-500 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 mx-8">
          <Button
            onClick={toggleRepeat}
            className={`p-2 rounded-full hover:bg-gray-100 ${
              repeatMode !== 'none' ? 'text-blue-600' : 'text-gray-600'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {getRepeatIcon()}
          </Button>

          <Button
            onClick={handlePrevious}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            disabled={tracks.length <= 1}
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            onClick={togglePlay}
            className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-0.5" />
            )}
          </Button>

          <Button
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            disabled={tracks.length <= 1}
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          {onPlaylistToggle && (
            <Button
              onClick={onPlaylistToggle}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
              title="Ver playlist"
            >
              <List className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Volume & Time */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
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
              className="w-20 accent-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}