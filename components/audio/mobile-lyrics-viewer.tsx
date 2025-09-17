'use client';

import { useState, useEffect } from 'react';
import { X, Mic2, Volume2, VolumeX, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileLyricsViewerProps {
  hymn: {
    id: string;
    title: string;
    lyrics: string;
    artist?: string;
  };
  currentTime: number;
  isVisible: boolean;
  onClose: () => void;
  isPlaying?: boolean;
}

export function MobileLyricsViewer({
  hymn,
  currentTime,
  isVisible,
  onClose,
  isPlaying = false,
}: MobileLyricsViewerProps) {
  const [fontSize, setFontSize] = useState(20); // Maior para mobile
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);

  // Processar letras em versos
  const processLyrics = () => {
    const cleanLyrics = hymn.lyrics
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    return cleanLyrics.split('\n\n').filter(verse => verse.trim());
  };

  const verses = processLyrics();

  // Mudar verso baseado no tempo (simulação)
  useEffect(() => {
    if (currentTime > 0 && verses.length > 0) {
      const verseIndex = Math.floor((currentTime / 180) * verses.length);
      const safeIndex = Math.min(verseIndex, verses.length - 1);
      setCurrentVerseIndex(safeIndex);
    }
  }, [currentTime, verses.length]);

  // Auto-esconder controles após 3 segundos
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showControls]);

  // Mostrar controles ao tocar na tela
  const handleScreenTap = () => {
    setShowControls(true);
  };

  const adjustFontSize = (delta: number) => {
    setFontSize(prev => Math.max(16, Math.min(32, prev + delta)));
  };

  if (!isVisible) return null;

  const bgClass = isDarkMode 
    ? 'bg-gradient-to-b from-gray-900 via-black to-gray-900' 
    : 'bg-gradient-to-b from-white via-gray-50 to-white';
  
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const controlsBg = isDarkMode ? 'bg-black/70' : 'bg-white/70';

  return (
    <div 
      className={`fixed inset-0 z-[100] ${bgClass} flex flex-col`}
      onClick={handleScreenTap}
    >
      {/* Header com controles (animado) */}
      <div 
        className={`transition-all duration-300 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        } ${controlsBg} backdrop-blur-sm p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className={`font-bold text-lg truncate ${textClass}`}>
              {hymn.title}
            </h3>
            {hymn.artist && (
              <p className={`text-sm opacity-75 truncate ${textClass}`}>
                {hymn.artist}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                adjustFontSize(-2);
              }}
              className={`p-3 h-10 w-10 ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'} rounded-full`}
              title="Diminuir fonte"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={(e) => {
                e.stopPropagation();
                adjustFontSize(2);
              }}
              className={`p-3 h-10 w-10 ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'} rounded-full`}
              title="Aumentar fonte"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                setIsDarkMode(!isDarkMode);
              }}
              className={`p-3 h-10 w-10 ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'} rounded-full`}
              title={isDarkMode ? "Modo claro" : "Modo escuro"}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className={`p-3 h-10 w-10 ${isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-200'} rounded-full`}
              title="Fechar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Área principal das letras */}
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          {verses.length > 0 ? (
            <div className="space-y-8">
              {verses.map((verse, index) => {
                const isCurrentVerse = index === currentVerseIndex;
                const isPastVerse = index < currentVerseIndex;
                
                return (
                  <div 
                    key={index}
                    className={`transition-all duration-700 text-center ${
                      isCurrentVerse 
                        ? `${textClass} scale-105 font-medium` 
                        : isPastVerse 
                          ? `${isDarkMode ? 'text-gray-500' : 'text-gray-400'} opacity-60 scale-95`
                          : `${isDarkMode ? 'text-gray-400' : 'text-gray-500'} opacity-80 scale-95`
                    }`}
                    style={{ 
                      fontSize: `${isCurrentVerse ? fontSize + 2 : fontSize}px`,
                      lineHeight: '1.8'
                    }}
                  >
                    {verse.split('\n').map((line, lineIndex) => (
                      <div 
                        key={lineIndex} 
                        className={`mb-3 ${
                          isCurrentVerse && isPlaying ? 'animate-pulse' : ''
                        }`}
                      >
                        {line.trim()}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`text-center ${textClass} opacity-75`}>
              <Mic2 className="h-16 w-16 mx-auto mb-6 opacity-50" />
              <p className="text-xl">Letra não disponível</p>
              <p className="text-sm opacity-75 mt-2">Este hino não possui letra cadastrada</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer com progresso (animado) */}
      {verses.length > 0 && (
        <div 
          className={`transition-all duration-300 ${
            showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          } ${controlsBg} backdrop-blur-sm p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div className="flex items-center justify-between text-sm mb-2">
            <span className={`${textClass} opacity-75`}>
              Verso {currentVerseIndex + 1} de {verses.length}
            </span>
            <span className={`${textClass} opacity-75`}>
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}
            </span>
          </div>
          
          {/* Barra de progresso dos versos */}
          <div className={`w-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded-full overflow-hidden`}>
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ 
                width: `${verses.length > 0 ? ((currentVerseIndex + 1) / verses.length) * 100 : 0}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Indicador de estado de reprodução */}
      {isPlaying && (
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
          <div className={`w-1 h-16 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'} rounded-full animate-pulse`} />
        </div>
      )}

      {/* Instruções no primeiro uso */}
      {showControls && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
          <p className={`text-xs ${textClass} opacity-50`}>
            Toque na tela para ocultar/mostrar controles
          </p>
        </div>
      )}
    </div>
  );
}