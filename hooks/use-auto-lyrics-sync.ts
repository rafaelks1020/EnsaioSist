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

  // Análise de padrões de áudio - MELHORADA
  private async analyzeAudioPatterns(audioFile: File): Promise<AudioPattern[]> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const patterns: AudioPattern[] = [];

    // Usar segmentos menores para maior precisão
    const segmentDuration = 0.05; // 50ms para detectar pausas menores
    const segmentSize = Math.floor(sampleRate * segmentDuration);
    
    let silenceStart: number | null = null;
    
    // Calcular threshold dinâmico baseado no áudio
    const globalRMS = this.calculateRMS(channelData);
    const dynamicThreshold = Math.max(0.005, globalRMS * 0.08);

    for (let i = 0; i < channelData.length; i += segmentSize) {
      const segment = channelData.slice(i, i + segmentSize);
      const rms = this.calculateRMS(segment);
      const timeStamp = i / sampleRate;

      // Melhor detecção de silêncio
      const isSilent = rms < dynamicThreshold;

      if (isSilent) {
        // Detectou silêncio
        if (silenceStart === null) {
          silenceStart = timeStamp;
        }
      } else {
        // Detectou som
        if (silenceStart !== null) {
          const silenceDuration = timeStamp - silenceStart;
          // Só considerar silêncios significativos (>100ms)
          if (silenceDuration >= 0.1) {
            patterns.push({
              type: 'silence',
              start: silenceStart,
              end: timeStamp,
              confidence: Math.min(0.95, 0.6 + silenceDuration)
            });
          }
          silenceStart = null;
        }
        
        // Detectar se é vocal ou instrumental
        const spectralFeatures = this.analyzeSpectralContent(segment, sampleRate);
        const isVocal = spectralFeatures.isVocal;
        
        patterns.push({
          type: isVocal ? 'vocal' : 'instrumental',
          start: timeStamp,
          end: timeStamp + segmentDuration,
          intensity: rms,
          confidence: isVocal ? 0.85 : 0.65
        });
      }
    }

    // Filtrar e otimizar padrões
    return this.optimizePatterns(patterns);
  }

  // Análise espectral simples para detectar conteúdo vocal
  private analyzeSpectralContent(segment: Float32Array, sampleRate: number) {
    // Calcular energia em diferentes bandas de frequência
    const lowFreq = this.calculateEnergyInBand(segment, 0, 300, sampleRate);
    const midFreq = this.calculateEnergyInBand(segment, 300, 2000, sampleRate);
    const highFreq = this.calculateEnergyInBand(segment, 2000, 8000, sampleRate);
    
    // Vocal geralmente tem mais energia nas frequências médias
    const vocalRatio = midFreq / (lowFreq + midFreq + highFreq + 0.001);
    const isVocal = vocalRatio > 0.4 && midFreq > 0.01;
    
    return { isVocal, vocalRatio, lowFreq, midFreq, highFreq };
  }

  // Calcular energia em banda de frequência específica
  private calculateEnergyInBand(segment: Float32Array, minFreq: number, maxFreq: number, sampleRate: number): number {
    // Simulação simples de filtro passa-banda
    let energy = 0;
    const nyquist = sampleRate / 2;
    
    // Para simplicidade, usar aproximação
    if (minFreq <= 1000 && maxFreq >= 1000) {
      // Frequências médias - mais energia vocal
      energy = this.calculateRMS(segment) * 1.2;
    } else if (maxFreq <= 500) {
      // Frequências baixas
      energy = this.calculateRMS(segment) * 0.8;
    } else {
      // Frequências altas
      energy = this.calculateRMS(segment) * 0.6;
    }
    
    return energy;
  }

  // Otimizar padrões detectados
  private optimizePatterns(patterns: AudioPattern[]): AudioPattern[] {
    if (patterns.length === 0) return patterns;
    
    const optimized: AudioPattern[] = [];
    let current = patterns[0];
    
    for (let i = 1; i < patterns.length; i++) {
      const next = patterns[i];
      
      // Mesclar padrões adjacentes do mesmo tipo
      if (current.type === next.type && 
          next.start - current.end < 0.08 && 
          current.type !== 'silence') {
        
        current.end = next.end;
        current.confidence = Math.max(current.confidence, next.confidence);
        if (next.intensity && current.intensity) {
          current.intensity = Math.max(current.intensity, next.intensity);
        }
      } else {
        optimized.push(current);
        current = next;
      }
    }
    
    optimized.push(current);
    
    // Filtrar padrões muito curtos
    return optimized.filter(p => (p.end - p.start) > 0.05);
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

  // Mapear padrões de áudio para letras - ALGORITMO MELHORADO
  private mapPatternsToLyrics(
    patterns: AudioPattern[], 
    structure: any, 
    options: SyncOptions
  ): LyricTimestamp[] {
    const timestamps: LyricTimestamp[] = [];
    const vocalPatterns = patterns.filter(p => p.type === 'vocal');
    const silencePatterns = patterns.filter(p => p.type === 'silence');

    if (vocalPatterns.length === 0) {
      return this.simpleDurationSync(structure.lines.join('\n'), options.estimatedDuration);
    }

    const lines = structure.lines;
    const totalDuration = Math.max(...patterns.map(p => p.end));
    
    // Algoritmo inteligente de mapeamento
    let currentTime = 0;
    
    // Detectar início da primeira linha vocal
    const firstVocalPattern = vocalPatterns[0];
    if (firstVocalPattern) {
      currentTime = Math.max(0, firstVocalPattern.start - 0.2); // Pequeno lead-in
    }

    lines.forEach((line: string, index: number) => {
      const wordsCount = line.split(' ').filter(w => w.trim()).length;
      
      // Calcular duração estimada da linha baseada em múltiplos fatores
      let estimatedDuration = this.calculateSmartLineDuration(line, wordsCount, index, lines.length, totalDuration);
      
      // Ajustar baseado em padrões de áudio próximos
      const nearbyPatterns = this.findNearbyPatterns(patterns, currentTime, estimatedDuration);
      const adjustment = this.calculateTimingAdjustment(nearbyPatterns, estimatedDuration);
      
      const startTime = currentTime;
      const endTime = currentTime + estimatedDuration + adjustment.duration;
      
      timestamps.push({
        text: line.trim(),
        startTime: startTime,
        endTime: endTime,
        confidence: 0.8 + adjustment.confidence,
        lineIndex: index
      });

      // Calcular próximo tempo de início
      currentTime = endTime;
      
      // Verificar se há pausa significativa depois desta linha
      const nextSilence = silencePatterns.find(s => 
        s.start >= currentTime && s.start <= currentTime + 2.0
      );
      
      if (nextSilence && nextSilence.end - nextSilence.start > 0.3) {
        currentTime = nextSilence.end;
      } else {
        // Adicionar pequena pausa padrão entre linhas
        currentTime += 0.1;
      }
    });

    // Pós-processamento: ajustar overlaps e gaps
    return this.postProcessTimestamps(timestamps, totalDuration);
  }

  // Calcular duração inteligente da linha
  private calculateSmartLineDuration(line: string, wordsCount: number, lineIndex: number, totalLines: number, totalDuration: number): number {
    // Fatores múltiplos para estimativa
    const wordsPerSecond = 2.2; // Velocidade típica de canto
    const wordBasedDuration = wordsCount / wordsPerSecond;
    
    // Duração baseada na posição na música
    const averageDurationPerLine = totalDuration / totalLines;
    const positionFactor = 1.0; // Pode ser ajustado baseado na estrutura
    
    // Ajustes baseados no conteúdo
    let contentFactor = 1.0;
    if (line.includes(',') || line.includes('.')) contentFactor += 0.2; // Pausas de pontuação
    if (line.length > 50) contentFactor += 0.3; // Linhas longas
    if (wordsCount <= 2) contentFactor -= 0.2; // Linhas muito curtas
    
    // Combinar todas as estimativas
    const estimatedDuration = Math.max(
      wordBasedDuration * contentFactor,
      averageDurationPerLine * 0.5 // Mínimo
    );
    
    return Math.min(estimatedDuration, averageDurationPerLine * 2); // Máximo
  }

  // Encontrar padrões próximos no tempo
  private findNearbyPatterns(patterns: AudioPattern[], time: number, duration: number) {
    return patterns.filter(p => 
      (p.start >= time - 1.0 && p.start <= time + duration + 1.0) ||
      (p.end >= time && p.end <= time + duration + 1.0)
    );
  }

  // Calcular ajuste de timing baseado em padrões próximos
  private calculateTimingAdjustment(nearbyPatterns: AudioPattern[], estimatedDuration: number) {
    let durationAdjustment = 0;
    let confidenceBonus = 0;
    
    // Verificar se há silêncios que indicam fim da linha
    const silenceAfter = nearbyPatterns.find(p => 
      p.type === 'silence' && p.start >= estimatedDuration * 0.7
    );
    
    if (silenceAfter) {
      durationAdjustment = silenceAfter.start - estimatedDuration;
      confidenceBonus = 0.1;
    }
    
    // Verificar se há padrões vocais que confirmam a presença de letra
    const vocalSupport = nearbyPatterns.filter(p => p.type === 'vocal').length;
    if (vocalSupport > 0) {
      confidenceBonus += Math.min(0.1, vocalSupport * 0.02);
    }
    
    return {
      duration: Math.max(-estimatedDuration * 0.3, Math.min(durationAdjustment, estimatedDuration * 0.5)),
      confidence: Math.min(0.15, confidenceBonus)
    };
  }

  // Pós-processamento para ajustar overlaps e gaps
  private postProcessTimestamps(timestamps: LyricTimestamp[], totalDuration: number): LyricTimestamp[] {
    if (timestamps.length === 0) return timestamps;
    
    const processed = [...timestamps];
    
    // Ajustar overlaps
    for (let i = 0; i < processed.length - 1; i++) {
      const current = processed[i];
      const next = processed[i + 1];
      
      if (current.endTime > next.startTime) {
        // Overlap detectado - ajustar
        const midPoint = (current.endTime + next.startTime) / 2;
        current.endTime = midPoint - 0.05;
        next.startTime = midPoint + 0.05;
      }
    }
    
    // Ajustar último timestamp para não exceder duração total
    const last = processed[processed.length - 1];
    if (last.endTime > totalDuration) {
      last.endTime = Math.max(last.startTime + 1.0, totalDuration - 0.5);
    }
    
    return processed;
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