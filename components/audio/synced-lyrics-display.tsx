'use client';

import { useEffect, useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Maximize2, Minimize2, PlayCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LyricLine {
  text: string;
  startTime?: number;
  endTime?: number;
}

interface SyncedLyricsDisplayProps {
  hymn: {
    id: string;
    title: string;
    lyrics: string;
    artist?: string;
  };
  currentTime: number;
  isVisible: boolean;
  onClose: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isPlaying?: boolean;
}

export function SyncedLyricsDisplay({
  hymn,
  currentTime,
  isVisible,
  onClose,
  isFullscreen = false,
  onToggleFullscreen,
  isPlaying = false,
}: SyncedLyricsDisplayProps) {
  const [fontSize, setFontSize] = useState(18);
  const [autoScroll, setAutoScroll] = useState(true);
  const [highlightMode, setHighlightMode] = useState<'line' | 'verse' | 'word'>('line');
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  
  const lyricsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Processar letras e criar estrutura de versos
  const processLyrics = () => {
    const cleanLyrics = hymn.lyrics
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    const verses = cleanLyrics.split('\n\n').filter(verse => verse.trim());
    const lyricsData: LyricLine[] = [];

    verses.forEach((verse, verseIndex) => {
      const lines = verse.split('\n').filter(line => line.trim());
      lines.forEach((line, lineIndex) => {
        // Simular timestamps baseados na posição da linha
        // Em uma implementação real, você teria timestamps reais
        const estimatedStartTime = (verseIndex * 30) + (lineIndex * 4);
        lyricsData.push({
          text: line.trim(),
          startTime: estimatedStartTime,
          endTime: estimatedStartTime + 4,
        });
      });
      
      // Adicionar linha vazia entre versos
      if (verseIndex < verses.length - 1) {
        lyricsData.push({
          text: '',
          startTime: (verseIndex + 1) * 30 - 2,
          endTime: (verseIndex + 1) * 30,
        });
      }
    });

    return lyricsData;
  };

  const lyricsData = processLyrics();

  // Encontrar linha atual baseada no tempo
  useEffect(() => {
    if (currentTime > 0 && lyricsData.length > 0) {
      const currentLine = lyricsData.findIndex((line, index) => {
        const nextLine = lyricsData[index + 1];
        return (
          line.startTime! <= currentTime &&
          (!nextLine || currentTime < nextLine.startTime!)
        );
      });
      
      if (currentLine !== -1 && currentLine !== currentLineIndex) {
        setCurrentLineIndex(currentLine);
      }
    }
  }, [currentTime, lyricsData, currentLineIndex]);

  // Auto-scroll para linha atual
  useEffect(() => {
    if (autoScroll && lyricsRef.current && isPlaying) {
      const currentLineElement = lyricsRef.current.children[currentLineIndex] as HTMLElement;
      if (currentLineElement) {
        currentLineElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentLineIndex, autoScroll, isPlaying]);

  // Função para aumentar/diminuir fonte
  const adjustFontSize = (delta: number) => {
    setFontSize(prev => Math.max(12, Math.min(36, prev + delta)));
  };

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          adjustFontSize(2);
          break;
        case '-':
          e.preventDefault();
          adjustFontSize(-2);
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey && onToggleFullscreen) {
            e.preventDefault();
            onToggleFullscreen();
          }
          break;
        case 's':
        case 'S':
          e.preventDefault();
          setAutoScroll(!autoScroll);
          break;
        case 't':
        case 'T':
          e.preventDefault();
          setShowTimestamps(!showTimestamps);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose, onToggleFullscreen, autoScroll, showTimestamps]);

  if (!isVisible) return null;

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-[100] bg-gradient-to-b from-purple-900 via-black to-black"
    : "fixed bottom-20 right-4 w-96 h-[36rem] bg-gradient-to-b from-gray-900 to-black border border-gray-700 rounded-lg shadow-2xl z-50";

  const textColor = "text-white";
  const headerBg = isFullscreen ? "bg-black/50 backdrop-blur-sm" : "bg-gray-900/90";

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Header com controles */}
      <div className={`flex items-center justify-between p-4 border-b border-gray-700 ${headerBg}`}>
        <div className="min-w-0 flex-1">
          <h3 className={`font-bold truncate ${textColor} ${isFullscreen ? 'text-xl' : 'text-lg'}`}>
            {hymn.title}
          </h3>
          {hymn.artist && (
            <p className={`text-sm opacity-75 truncate ${textColor}`}>{hymn.artist}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          {/* Controles de fonte */}
          <Button
            onClick={() => adjustFontSize(-2)}
            className={`p-2 h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700`}
            title="Diminuir fonte (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className={`px-2 text-sm font-mono ${textColor}`}>{fontSize}px</span>
          
          <Button
            onClick={() => adjustFontSize(2)}
            className={`p-2 h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700`}
            title="Aumentar fonte (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Configurações */}
          <Button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 h-8 w-8 ${autoScroll ? 'text-green-400' : 'text-gray-400'} hover:text-white hover:bg-gray-700`}
            title={`Auto-scroll ${autoScroll ? 'ligado' : 'desligado'} (S)`}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Toggle fullscreen */}
          {onToggleFullscreen && (
            <Button
              onClick={onToggleFullscreen}
              className={`p-2 h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700`}
              title={isFullscreen ? "Sair tela cheia (Ctrl+F)" : "Tela cheia (Ctrl+F)"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}

          {/* Fechar */}
          <Button
            onClick={onClose}
            className={`p-2 h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-700`}
            title="Fechar (ESC)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Área de scroll da letra */}
      <div 
        ref={lyricsRef}
        className={`flex-1 overflow-y-auto p-6 ${isFullscreen ? 'h-[calc(100vh-140px)]' : 'h-[calc(36rem-140px)]'}`}
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: isFullscreen ? '2.2' : '1.8'
        }}
      >
        {lyricsData.length > 0 ? (
          <div className={`space-y-4 ${isFullscreen ? 'max-w-4xl mx-auto text-center' : ''}`}>
            {lyricsData.map((line, index) => {
              const isCurrentLine = index === currentLineIndex && isPlaying;
              const isPastLine = index < currentLineIndex && isPlaying;
              const isFutureLine = index > currentLineIndex && isPlaying;
              
              return (
                <div 
                  key={index}
                  className={`transition-all duration-500 ${
                    line.text.trim() === '' ? 'h-6' : ''
                  } ${
                    isCurrentLine 
                      ? 'text-yellow-300 font-bold scale-105 glow' 
                      : isPastLine 
                        ? 'text-gray-400 opacity-70' 
                        : isFutureLine 
                          ? 'text-gray-300 opacity-90'
                          : 'text-white'
                  }`}
                  style={{
                    textShadow: isCurrentLine ? '0 0 20px rgba(255, 255, 0, 0.5)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {showTimestamps && line.startTime !== undefined && (
                      <span className="text-xs text-gray-500 font-mono w-12 flex-shrink-0">
                        {Math.floor(line.startTime / 60)}:{(line.startTime % 60).toString().padStart(2, '0')}
                      </span>
                    )}
                    <div className="flex-1">
                      {line.text.trim() || '\u00A0'}
                    </div>
                    {isCurrentLine && (
                      <PlayCircle className="h-4 w-4 text-yellow-300 animate-pulse flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`text-center ${textColor} opacity-75`}>
            <div className="h-12 w-12 mx-auto mb-4 opacity-50 bg-gray-600 rounded-full flex items-center justify-center">
              <PlayCircle className="h-6 w-6" />
            </div>
            <p>Letra não disponível para este hino</p>
          </div>
        )}
      </div>

      {/* Barra de progresso da música */}
      {isFullscreen && lyricsData.length > 0 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-80 bg-gray-800/50 backdrop-blur-sm rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-gray-300 mb-2">
            <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
            <span className="text-yellow-300">
              Linha {currentLineIndex + 1} de {lyricsData.filter(l => l.text.trim()).length}
            </span>
            <span>3:30</span> {/* Duração total estimada */}
          </div>
          <div className="w-full h-1 bg-gray-700 rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((currentTime / 210) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Indicador de controles na parte inferior (apenas fullscreen) */}
      {isFullscreen && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-white text-sm text-center opacity-75">
            ESC: Fechar | +/-: Fonte | S: Auto-scroll | T: Timestamps | Ctrl+F: Janela
          </p>
        </div>
      )}

      <style jsx>{`
        .glow {
          filter: drop-shadow(0 0 8px rgba(255, 255, 0, 0.3));
        }
      `}</style>
    </div>
  );
}