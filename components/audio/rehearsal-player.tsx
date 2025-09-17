'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Mic2, 
  Volume2,
  VolumeX,
  Repeat,
  Users,
  Eye,
  EyeOff
} from 'lucide-react';

interface RehearsalPlayerProps {
  hymns: Array<{
    id: string;
    title: string;
    lyrics?: string;
    mp3Url?: string;
    artist: string;
  }>;
  currentHymnIndex: number;
  onHymnChange: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime?: number;
  showLyrics?: boolean;
  onToggleLyrics?: () => void;
}

export function RehearsalPlayer({
  hymns,
  currentHymnIndex,
  onHymnChange,
  isPlaying,
  onTogglePlay,
  currentTime = 0,
  showLyrics = true,
  onToggleLyrics,
}: RehearsalPlayerProps) {
  const [fontSize, setFontSize] = useState(22); // Tamanho otimizado para ensaios
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const currentHymn = hymns[currentHymnIndex];

  // Processar letras em versos
  const processLyrics = (lyrics: string) => {
    const cleanLyrics = lyrics
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    return cleanLyrics.split('\n\n').filter(verse => verse.trim());
  };

  const verses = currentHymn?.lyrics ? processLyrics(currentHymn.lyrics) : [];

  // Calcular verso atual baseado no tempo
  const getCurrentVerseIndex = () => {
    if (currentTime > 0 && verses.length > 0) {
      const progress = Math.min(currentTime / 180, 1); // Assume 3min por hino
      return Math.floor(progress * verses.length);
    }
    return 0;
  };

  const currentVerseIndex = getCurrentVerseIndex();

  const handlePrevious = () => {
    if (currentHymnIndex > 0) {
      onHymnChange(currentHymnIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentHymnIndex < hymns.length - 1) {
      onHymnChange(currentHymnIndex + 1);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!currentHymn) return null;

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white min-h-screen flex flex-col">
      {/* Header com controles do professor */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">
              Ensaio - Hino {currentHymnIndex + 1} de {hymns.length}
            </h1>
            <Button
              onClick={() => setIsTeacherMode(!isTeacherMode)}
              className={`flex items-center gap-2 ${isTeacherMode ? 'bg-indigo-600' : 'bg-gray-600'} text-white`}
            >
              <Users className="h-4 w-4" />
              {isTeacherMode ? 'Modo Professor' : 'Modo Aluno'}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Controles de fonte */}
            <Button
              onClick={() => setFontSize(prev => Math.max(16, prev - 2))}
              className="p-2 text-gray-600 hover:bg-gray-100"
              title="Diminuir fonte"
            >
              A-
            </Button>
            <span className="text-sm text-gray-600 px-2">{fontSize}px</span>
            <Button
              onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
              className="p-2 text-gray-600 hover:bg-gray-100"
              title="Aumentar fonte"
            >
              A+
            </Button>

            {/* Toggle letras */}
            {onToggleLyrics && (
              <Button
                onClick={onToggleLyrics}
                className={`p-2 ${showLyrics ? 'text-indigo-600' : 'text-gray-400'} hover:bg-gray-100`}
                title={showLyrics ? 'Ocultar letras' : 'Mostrar letras'}
              >
                {showLyrics ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex">
        {/* Painel de letras */}
        {showLyrics && currentHymn.lyrics && (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {/* Título do hino */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-indigo-900 mb-2">
                  {currentHymn.title}
                </h2>
                <p className="text-indigo-600">
                  {currentHymn.artist}
                </p>
                {isPlaying && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm text-red-600 font-medium">AO VIVO</span>
                  </div>
                )}
              </div>

              {/* Letras */}
              <div className="space-y-8">
                {verses.map((verse, index) => {
                  const isCurrentVerse = index === currentVerseIndex && isPlaying;
                  const isPastVerse = index < currentVerseIndex && isPlaying;
                  
                  return (
                    <div 
                      key={index}
                      className={`transition-all duration-500 p-6 rounded-lg ${
                        isCurrentVerse 
                          ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg scale-105' 
                          : isPastVerse 
                            ? 'bg-gray-100 opacity-60' 
                            : 'bg-white border border-gray-200'
                      }`}
                      style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                    >
                      {/* Indicador de verso atual */}
                      {isCurrentVerse && (
                        <div className="flex items-center gap-2 mb-4">
                          <Mic2 className="h-5 w-5 text-yellow-600" />
                          <span className="text-sm font-bold text-yellow-700">
                            CANTANDO AGORA - Verso {index + 1}
                          </span>
                        </div>
                      )}

                      {/* Número do verso (modo professor) */}
                      {isTeacherMode && (
                        <div className="text-xs text-gray-500 mb-2 font-mono">
                          Verso {index + 1}
                        </div>
                      )}

                      {/* Linhas do verso */}
                      <div className={`text-center ${
                        isCurrentVerse ? 'text-gray-900 font-medium' : 'text-gray-700'
                      }`}>
                        {verse.split('\n').map((line, lineIndex) => (
                          <div 
                            key={lineIndex} 
                            className={`mb-3 ${
                              isCurrentVerse ? 'animate-pulse' : ''
                            }`}
                          >
                            {line.trim()}
                          </div>
                        ))}
                      </div>

                      {/* Instruções para o professor */}
                      {isTeacherMode && isCurrentVerse && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                          <p className="text-blue-800">
                            💡 <strong>Dica:</strong> Este verso está sendo destacado para os adolescentes
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Próximo hino (preview) */}
              {currentHymnIndex < hymns.length - 1 && (
                <div className="mt-12 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <h3 className="text-lg font-bold text-indigo-900 mb-2">
                    Próximo hino:
                  </h3>
                  <p className="text-indigo-700">
                    {hymns[currentHymnIndex + 1].title}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mensagem quando letras não disponíveis */}
        {showLyrics && !currentHymn.lyrics && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <Mic2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">
                Letra não disponível
              </h3>
              <p className="text-gray-500">
                Este hino não possui letra cadastrada
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Player fixo na parte inferior */}
      <div className="bg-white border-t-2 border-indigo-200 shadow-lg">
        <div className="max-w-6xl mx-auto p-4">
          {/* Progresso dos hinos */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso do ensaio</span>
              <span>{currentHymnIndex + 1} de {hymns.length} hinos</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentHymnIndex + 1) / hymns.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Controles principais */}
          <div className="flex items-center justify-between">
            {/* Info do hino atual */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                {currentHymnIndex + 1}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 truncate">
                  {currentHymn.title}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {currentHymn.artist}
                </p>
              </div>
            </div>

            {/* Controles de reprodução */}
            <div className="flex items-center gap-3 mx-8">
              <Button
                onClick={handlePrevious}
                disabled={currentHymnIndex === 0}
                className="p-3 rounded-full hover:bg-gray-100 disabled:opacity-50"
                title="Hino anterior"
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                onClick={onTogglePlay}
                className="p-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </Button>

              <Button
                onClick={handleNext}
                disabled={currentHymnIndex === hymns.length - 1}
                className="p-3 rounded-full hover:bg-gray-100 disabled:opacity-50"
                title="Próximo hino"
              >
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            {/* Controles de volume */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-gray-100"
                title={isMuted ? 'Ativar som' : 'Mutar'}
              >
                {isMuted ? (
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
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-20 accent-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}