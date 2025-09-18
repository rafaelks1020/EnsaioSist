'use client';

import { useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2,
  Zap,
  Star,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAdvancedSyncedPlayer } from '@/hooks/use-synced-lyrics';

interface AdvancedLyricsPlayerProps {
  hymnId: string;
  audioUrl: string;
  onOpenSyncEditor?: () => void;
  className?: string;
}

export function AdvancedLyricsPlayer({ 
  hymnId, 
  audioUrl, 
  onOpenSyncEditor,
  className = ''
}: AdvancedLyricsPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentLineRef = useRef<HTMLDivElement>(null);
  
  const {
    timestamps,
    currentLineIndex,
    nextLineIndex,
    currentLine,
    nextLine,
    progress,
    isLoaded,
    isLoading,
    error,
    syncQuality,
    currentTime,
    duration,
    isPlaying,
    seekToLine,
    seekToNextLine,
    seekToPreviousLine,
    karaokeMode,
    setKaraokeMode
  } = useAdvancedSyncedPlayer(hymnId, audioRef);

  // Auto-scroll para linha atual
  useEffect(() => {
    if (currentLineRef.current && currentLineIndex >= 0) {
      currentLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentLineIndex]);

  // Controles de reprodução
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-2">❌ Erro ao carregar sincronização</div>
          <div className="text-sm text-gray-500">{error}</div>
          {onOpenSyncEditor && (
            <Button onClick={onOpenSyncEditor} className="mt-3">
              Criar Sincronização
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <div className="text-gray-500">Carregando sincronização...</div>
        </CardContent>
      </Card>
    );
  }

  if (!isLoaded || timestamps.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-gray-500 mb-2">🎵 Nenhuma sincronização encontrada</div>
          <div className="text-sm text-gray-400 mb-4">
            Crie uma sincronização para acompanhar a letra em tempo real
          </div>
          {onOpenSyncEditor && (
            <Button onClick={onOpenSyncEditor} className="bg-indigo-600 hover:bg-indigo-700">
              <Zap className="h-4 w-4 mr-2" />
              Sincronizar Letra
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {/* Header com controles */}
      <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              syncQuality.qualityScore === 'excellent' ? 'bg-green-100 text-green-800' :
              syncQuality.qualityScore === 'good' ? 'bg-blue-100 text-blue-800' :
              syncQuality.qualityScore === 'fair' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {syncQuality.qualityScore === 'excellent' ? '⭐ Excelente' :
               syncQuality.qualityScore === 'good' ? '✅ Boa' :
               syncQuality.qualityScore === 'fair' ? '⚠️ Regular' :
               '❌ Ruim'}
            </div>
            <div className="text-xs text-gray-500">
              {timestamps.length} linhas • {Math.round(syncQuality.averageConfidence * 100)}%
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setKaraokeMode(!karaokeMode)}
              className={`p-2 h-8 w-8 ${karaokeMode ? 'text-yellow-500' : 'text-gray-400'}`}
              title="Modo Karaokê"
            >
              <Star className="h-4 w-4" />
            </Button>
            
            {onOpenSyncEditor && (
              <Button
                onClick={onOpenSyncEditor}
                className="p-2 h-8 w-8 text-gray-400 hover:text-gray-600"
                title="Editar Sincronização"
              >
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Controles de reprodução */}
        <div className="flex items-center gap-3">
          <Button onClick={seekToPreviousLine} className="p-2" disabled={currentLineIndex <= 0}>
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button onClick={togglePlay} className="p-3 bg-indigo-600 hover:bg-indigo-700">
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <Button onClick={seekToNextLine} className="p-2" disabled={nextLineIndex < 0}>
            <SkipForward className="h-4 w-4" />
          </Button>

          <div className="flex-1 mx-4">
            <div className="text-sm text-gray-600 mb-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-200"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
          </div>

          <Volume2 className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Letras sincronizadas */}
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {timestamps.map((timestamp, index) => {
            const isCurrent = index === currentLineIndex;
            const isNext = index === nextLineIndex;
            const isPast = currentTime > timestamp.endTime;
            
            return (
              <div
                key={index}
                ref={isCurrent ? currentLineRef : undefined}
                onClick={() => seekToLine(index)}
                className={`p-4 border-b cursor-pointer transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-300 shadow-sm' 
                    : isNext
                      ? 'bg-blue-50 hover:bg-blue-100'
                      : isPast
                        ? 'bg-gray-50 text-gray-500'
                        : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCurrent 
                      ? 'bg-indigo-600 text-white' 
                      : isNext
                        ? 'bg-blue-500 text-white'
                        : isPast
                          ? 'bg-gray-300 text-gray-600'
                          : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className={`font-medium transition-all ${
                      isCurrent ? 'text-indigo-900 text-lg' : 'text-gray-900'
                    }`}>
                      {timestamp.text}
                    </div>
                    
                    {isCurrent && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs text-indigo-600">
                          <span>{formatTime(timestamp.startTime)} - {formatTime(timestamp.endTime)}</span>
                          <span>•</span>
                          <span>{Math.round(timestamp.confidence * 100)}% confiança</span>
                        </div>
                        
                        {/* Barra de progresso da linha */}
                        <div className="w-full bg-indigo-200 rounded-full h-1 mt-2">
                          <div 
                            className="bg-indigo-600 h-1 rounded-full transition-all duration-200"
                            style={{ width: `${progress * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {isNext && (
                      <div className="text-xs text-blue-600 mt-1">
                        Próxima: {formatTime(timestamp.startTime)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      {/* Elemento de áudio */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </Card>
  );
}