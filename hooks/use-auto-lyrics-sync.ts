'use client';

import { useState, useRef, useCallback } from 'react';

// Tipos para sincronização de letras
export interface LyricTimestamp {
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
  lineIndex: number;
}

export interface AudioPattern {
  type: 'vocal' | 'silence' | 'instrumental';
  start: number;
  end: number;
  intensity?: number;
  confidence: number;
}

export interface SyncOptions {
  useVoiceRecognition?: boolean;
  estimatedDuration?: number;
  language?: string;
  silenceThreshold?: number;
  confidenceThreshold?: number;
}

// Classe principal para sincronização automática
export class AutoLyricsSync {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Inicializar AudioContext quando necessário
  }

  // Método principal para sincronização automática
  async syncLyrics(audioFile: File, lyrics: string, options: SyncOptions = {}): Promise<LyricTimestamp[]> {
    try {
      console.log('🎵 Iniciando sincronização automática...');
      
      // 1. Análise de áudio usando Web Audio API
      const audioPatterns = await this.analyzeAudioPatterns(audioFile);
      console.log('🎼 Padrões de áudio detectados:', audioPatterns.length);
      
      // 2. Análise da estrutura das letras
      const lyricsStructure = this.analyzeLyricsStructure(lyrics);
      console.log('📝 Estrutura das letras analisada');
      
      // 3. Mapear padrões para letras
      const timestamps = this.mapPatternsToLyrics(audioPatterns, lyricsStructure, options);
      console.log('✅ Sincronização concluída:', timestamps.length, 'timestamps');
      
      return timestamps;
      
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      
      // Fallback: sincronização simples baseada em duração
      return this.simpleDurationSync(lyrics, options.estimatedDuration || 180);
    }
  }

  // Análise de padrões de áudio
  private async analyzeAudioPatterns(audioFile: File): Promise<AudioPattern[]> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const patterns: AudioPattern[] = [];

    // Analisar áudio em segmentos de 100ms
    const segmentDuration = 0.1; // 100ms
    const segmentSize = Math.floor(sampleRate * segmentDuration);
    
    let silenceStart: number | null = null;
    const silenceThreshold = 0.01;

    for (let i = 0; i < channelData.length; i += segmentSize) {
      const segment = channelData.slice(i, i + segmentSize);
      const rms = this.calculateRMS(segment);
      const timeStamp = i / sampleRate;

      if (rms < silenceThreshold) {
        // Detectou silêncio
        if (silenceStart === null) {
          silenceStart = timeStamp;
        }
      } else {
        // Detectou som
        if (silenceStart !== null) {
          // Fim do silêncio
          patterns.push({
            type: 'silence',
            start: silenceStart,
            end: timeStamp,
            confidence: 0.8
          });
          silenceStart = null;
        }
        
        // Adicionar segmento vocal
        patterns.push({
          type: 'vocal',
          start: timeStamp,
          end: timeStamp + segmentDuration,
          intensity: rms,
          confidence: 0.7
        });
      }
    }

    // Filtrar padrões muito curtos
    return patterns.filter(p => (p.end - p.start) > 0.05);
  }

  // Calcular RMS (Root Mean Square) para intensidade do áudio
  private calculateRMS(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  // Analisar estrutura das letras
  private analyzeLyricsStructure(lyrics: string) {
    const cleanLyrics = lyrics.replace(/<[^>]*>/g, '').trim();
    const lines = cleanLyrics.split('\n').filter(l => l.trim());
    const verses = cleanLyrics.split('\n\n').filter(v => v.trim());

    return {
      lines,
      verses,
      totalWords: cleanLyrics.split(' ').filter(w => w.trim()).length,
      averageWordsPerLine: cleanLyrics.split(' ').length / lines.length,
      estimatedDuration: this.estimateDurationFromLyrics(lines)
    };
  }

  // Estimar duração baseada nas letras
  private estimateDurationFromLyrics(lines: string[]): number {
    // Heurística: ~2.5 palavras por segundo em música vocal
    const totalWords = lines.join(' ').split(' ').filter(w => w.trim()).length;
    return totalWords / 2.5;
  }

  // Mapear padrões de áudio para letras
  private mapPatternsToLyrics(
    patterns: AudioPattern[], 
    structure: any, 
    options: SyncOptions
  ): LyricTimestamp[] {
    const timestamps: LyricTimestamp[] = [];
    const vocalPatterns = patterns.filter(p => p.type === 'vocal');
    const silencePatterns = patterns.filter(p => p.type === 'silence');

    if (vocalPatterns.length === 0) {
      // Se não há padrões vocais, usar sincronização simples
      return this.simpleDurationSync(structure.lines.join('\n'), options.estimatedDuration);
    }

    // Calcular duração total detectada
    const totalAudioDuration = Math.max(...vocalPatterns.map(p => p.end));
    const linesCount = structure.lines.length;

    // Distribuir linhas ao longo dos padrões vocais
    let currentTime = 0;
    const averageLineDuration = totalAudioDuration / linesCount;

    structure.lines.forEach((line: string, index: number) => {
      const wordsInLine = line.split(' ').filter(w => w.trim()).length;
      const estimatedLineDuration = Math.max(
        wordsInLine / 2.5, // Baseado em palavras
        averageLineDuration * 0.8 // Mínimo baseado na duração total
      );

      // Encontrar próximo padrão vocal
      const nearestVocalPattern = vocalPatterns.find(p => p.start >= currentTime);
      if (nearestVocalPattern) {
        currentTime = nearestVocalPattern.start;
      }

      timestamps.push({
        text: line.trim(),
        startTime: currentTime,
        endTime: currentTime + estimatedLineDuration,
        confidence: 0.75,
        lineIndex: index
      });

      currentTime += estimatedLineDuration;

      // Adicionar pausa se houver silêncio detectado
      const nextSilence = silencePatterns.find(
        s => s.start >= currentTime && s.end - s.start > 0.3
      );
      if (nextSilence) {
        currentTime = nextSilence.end;
      }
    });

    return timestamps;
  }

  // Sincronização simples como fallback
  private simpleDurationSync(lyrics: string, totalDuration: number = 180): LyricTimestamp[] {
    const cleanLyrics = lyrics.replace(/<[^>]*>/g, '').trim();
    const lines = cleanLyrics.split('\n').filter(l => l.trim());
    
    if (lines.length === 0) return [];

    const timestamps: LyricTimestamp[] = [];
    const averageLineTime = totalDuration / lines.length;

    lines.forEach((line, index) => {
      const startTime = index * averageLineTime;
      const endTime = startTime + averageLineTime;

      timestamps.push({
        text: line.trim(),
        startTime,
        endTime,
        confidence: 0.5, // Baixa confiança para sync simples
        lineIndex: index
      });
    });

    return timestamps;
  }

  // Melhorar sincronização com feedback do usuário
  async improveSyncWithFeedback(
    timestamps: LyricTimestamp[],
    userCorrections: { lineIndex: number; correctTime: number }[]
  ): Promise<LyricTimestamp[]> {
    const improvedTimestamps = [...timestamps];

    // Aplicar correções do usuário
    userCorrections.forEach(correction => {
      if (improvedTimestamps[correction.lineIndex]) {
        const originalDuration = improvedTimestamps[correction.lineIndex].endTime - 
                                improvedTimestamps[correction.lineIndex].startTime;
        
        improvedTimestamps[correction.lineIndex].startTime = correction.correctTime;
        improvedTimestamps[correction.lineIndex].endTime = correction.correctTime + originalDuration;
        improvedTimestamps[correction.lineIndex].confidence = 0.95; // Alta confiança para correção manual
      }
    });

    // Ajustar timestamps subsequentes baseado nas correções
    this.propagateTimeAdjustments(improvedTimestamps, userCorrections);

    return improvedTimestamps;
  }

  // Propagar ajustes de tempo para linhas subsequentes
  private propagateTimeAdjustments(
    timestamps: LyricTimestamp[],
    corrections: { lineIndex: number; correctTime: number }[]
  ) {
    corrections.forEach(correction => {
      const correctedLine = timestamps[correction.lineIndex];
      if (!correctedLine) return;

      // Calcular diferença entre tempo original e corrigido
      const timeDifference = correction.correctTime - correctedLine.startTime;

      // Aplicar ajuste proporcionalmente às linhas seguintes
      for (let i = correction.lineIndex + 1; i < timestamps.length; i++) {
        const decayFactor = Math.max(0.1, 1 - (i - correction.lineIndex) * 0.1);
        const adjustment = timeDifference * decayFactor;

        timestamps[i].startTime += adjustment;
        timestamps[i].endTime += adjustment;
        timestamps[i].confidence = Math.max(0.6, timestamps[i].confidence - 0.1);
      }
    });
  }
}

// Hook para usar a sincronização automática
export function useAutoLyricsSync() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const syncEngine = useRef<AutoLyricsSync>(new AutoLyricsSync());

  const syncLyrics = useCallback(async (
    audioFile: File, 
    lyrics: string, 
    options: SyncOptions = {}
  ): Promise<LyricTimestamp[]> => {
    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(25);
      const timestamps = await syncEngine.current.syncLyrics(audioFile, lyrics, options);
      setProgress(100);
      
      return timestamps;
    } catch (error) {
      console.error('Erro na sincronização:', error);
      throw error;
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, []);

  const improveSyncWithFeedback = useCallback(async (
    timestamps: LyricTimestamp[],
    corrections: { lineIndex: number; correctTime: number }[]
  ): Promise<LyricTimestamp[]> => {
    return await syncEngine.current.improveSyncWithFeedback(timestamps, corrections);
  }, []);

  return {
    syncLyrics,
    improveSyncWithFeedback,
    isProcessing,
    progress
  };
}