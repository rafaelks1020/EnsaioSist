'use client';

import { useEffect, useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Type, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LyricsDisplayProps {
  hymn: {
    id: string;
    title: string;
    lyrics: string;
    artist?: string;
  };
  currentTime?: number;
  isVisible: boolean;
  onClose: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function LyricsDisplay({
  hymn,
  currentTime = 0,
  isVisible,
  onClose,
  isFullscreen = false,
  onToggleFullscreen,
}: LyricsDisplayProps) {
  const [fontSize, setFontSize] = useState(16);
  const [autoScroll, setAutoScroll] = useState(true);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Limpar HTML e dividir em versos para melhor exibição
  const cleanLyrics = hymn.lyrics
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular spaces
    .trim();

  const verses = cleanLyrics.split('\n\n').filter(verse => verse.trim());

  // Auto-scroll baseado no tempo (simulação)
  useEffect(() => {
    if (autoScroll && lyricsRef.current && currentTime > 0) {
      // Simula scroll automático baseado no tempo
      // Em uma implementação real, você teria timestamps para cada verso
      const scrollPosition = (currentTime / 180) * lyricsRef.current.scrollHeight; // Assume 3 min de música
      lyricsRef.current.scrollTo({
        top: Math.min(scrollPosition, lyricsRef.current.scrollHeight),
        behavior: 'smooth'
      });
    }
  }, [currentTime, autoScroll]);

  // Função para aumentar/diminuir fonte
  const adjustFontSize = (delta: number) => {
    setFontSize(prev => Math.max(12, Math.min(32, prev + delta)));
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
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose, onToggleFullscreen]);

  if (!isVisible) return null;

  const containerClasses = isFullscreen
    ? "fixed inset-0 z-[100] bg-black"
    : "fixed bottom-20 right-4 w-96 h-[32rem] bg-white border border-gray-200 rounded-lg shadow-xl z-50";

  const textColor = isFullscreen ? "text-white" : "text-gray-900";
  const headerBg = isFullscreen ? "bg-black/50" : "bg-white";
  const buttonVariant = isFullscreen ? "ghost" : "outline";

  return (
    <div ref={containerRef} className={containerClasses}>
      {/* Header com controles */}
      <div className={`flex items-center justify-between p-4 border-b ${isFullscreen ? 'border-gray-700' : 'border-gray-200'} ${headerBg} ${isFullscreen ? 'text-white' : ''}`}>
        <div className="min-w-0 flex-1">
          <h3 className={`font-semibold truncate ${textColor}`}>{hymn.title}</h3>
          {hymn.artist && (
            <p className={`text-sm opacity-75 truncate ${textColor}`}>{hymn.artist}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1 ml-4">
          {/* Controles de fonte */}
          <Button
            onClick={() => adjustFontSize(-2)}
            className={`p-2 h-8 w-8 ${textColor}`}
            title="Diminuir fonte (tecla -)"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className={`px-2 text-sm font-mono ${textColor}`}>{fontSize}px</span>
          
          <Button
            onClick={() => adjustFontSize(2)}
            className={`p-2 h-8 w-8 ${textColor}`}
            title="Aumentar fonte (tecla +)"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          {/* Toggle fullscreen */}
          {onToggleFullscreen && (
            <Button
              onClick={onToggleFullscreen}
              className={`p-2 h-8 w-8 ${textColor}`}
              title={isFullscreen ? "Sair tela cheia (Ctrl+F)" : "Tela cheia (Ctrl+F)"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}

          {/* Fechar */}
          <Button
            onClick={onClose}
            className={`p-2 h-8 w-8 ${textColor}`}
            title="Fechar (ESC)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Área de scroll da letra */}
      <div 
        ref={lyricsRef}
        className={`flex-1 overflow-y-auto p-6 ${isFullscreen ? 'bg-black' : 'bg-white'} ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[calc(32rem-80px)]'}`}
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: isFullscreen ? '1.8' : '1.6'
        }}
      >
        {verses.length > 0 ? (
          <div className="space-y-6">
            {verses.map((verse, index) => (
              <div 
                key={index}
                className={`${textColor} transition-all duration-300 ${
                  isFullscreen ? 'text-center' : ''
                }`}
              >
                {verse.split('\n').map((line, lineIndex) => (
                  <div 
                    key={lineIndex} 
                    className={`mb-2 ${isFullscreen ? 'mb-4' : ''} ${
                      line.trim() === '' ? 'h-4' : ''
                    }`}
                  >
                    {line.trim() || '\u00A0'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center ${textColor} opacity-75`}>
            <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Letra não disponível para este hino</p>
          </div>
        )}
      </div>

      {/* Indicador de controles na parte inferior (apenas fullscreen) */}
      {isFullscreen && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2">
          <p className="text-white text-sm text-center opacity-75">
            ESC: Fechar | +/-: Fonte | Ctrl+F: Janela
          </p>
        </div>
      )}
    </div>
  );
}