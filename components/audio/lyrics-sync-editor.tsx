'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Save, 
  Zap, 
  Clock, 
  Volume2,
  SkipBack,
  SkipForward,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutoLyricsSync, LyricTimestamp } from '@/hooks/use-auto-lyrics-sync';
import { useLyricsSyncService } from '@/lib/lyrics-sync-service';

interface LyricsSyncEditorProps {
  hymn: {
    id: string;
    title: string;
    lyrics: string;
    mp3Url?: string;
  };
  onSave: (timestamps: LyricTimestamp[]) => void;
  onCancel: () => void;
  onLoadExisting?: (timestamps: LyricTimestamp[]) => void;
}

export function LyricsSyncEditor({ hymn, onSave, onCancel, onLoadExisting }: LyricsSyncEditorProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [timestamps, setTimestamps] = useState<LyricTimestamp[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingSync, setHasExistingSync] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const { syncLyrics, improveSyncWithFeedback, isProcessing, progress } = useAutoLyricsSync();
  const lyricsSyncService = useLyricsSyncService();

  // Processar letras em linhas
  const lyricsLines = hymn.lyrics
    .replace(/<[^>]*>/g, '')
    .split('\n')
    .filter(line => line.trim());

  // Carregar sincronização existente ao montar componente
  useEffect(() => {
    const loadExistingSync = async () => {
      setIsLoading(true);
      try {
        const existingTimestamps = await lyricsSyncService.loadAndApplySync(hymn.id);
        if (existingTimestamps && existingTimestamps.length > 0) {
          setTimestamps(existingTimestamps);
          setHasExistingSync(true);
          onLoadExisting?.(existingTimestamps);
        }
      } catch (error) {
        console.error('Erro ao carregar sincronização existente:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingSync();
  }, [hymn.id, lyricsSyncService, onLoadExisting]);

  // Carregar arquivo de áudio
  useEffect(() => {
    if (hymn.mp3Url) {
      fetch(hymn.mp3Url)
        .then(response => response.blob())
        .then(blob => {
          const file = new File([blob], 'audio.mp3', { type: 'audio/mpeg' });
          setAudioFile(file);
        })
        .catch(error => console.error('Erro ao carregar áudio:', error));
    }
  }, [hymn.mp3Url]);

  // Atualizar tempo do áudio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Sincronização automática
  const handleAutoSync = async () => {
    if (!audioFile) {
      alert('Arquivo de áudio não encontrado');
      return;
    }

    setIsAutoSyncing(true);
    try {
      const autoTimestamps = await syncLyrics(audioFile, hymn.lyrics, {
        estimatedDuration: duration || 180,
        silenceThreshold: 0.01,
        confidenceThreshold: 0.6
      });

      setTimestamps(autoTimestamps);
    } catch (error) {
      console.error('Erro na sincronização automática:', error);
      alert('Erro na sincronização automática. Tente ajustar manualmente.');
    } finally {
      setIsAutoSyncing(false);
    }
  };

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

  const seekTo = (time: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skipSeconds = (seconds: number) => {
    seekTo(Math.max(0, Math.min(duration, currentTime + seconds)));
  };

  // Ajustar timestamp manualmente
  const adjustTimestamp = (lineIndex: number, field: 'startTime' | 'endTime', value: number) => {
    const newTimestamps = [...timestamps];
    if (newTimestamps[lineIndex]) {
      newTimestamps[lineIndex][field] = value;
      newTimestamps[lineIndex].confidence = 0.9; // Alta confiança para ajuste manual
      setTimestamps(newTimestamps);
    }
  };

  // Definir timestamp atual
  const setCurrentTimeAsStart = (lineIndex: number) => {
    adjustTimestamp(lineIndex, 'startTime', currentTime);
  };

  const setCurrentTimeAsEnd = (lineIndex: number) => {
    adjustTimestamp(lineIndex, 'endTime', currentTime);
  };

  // Reproduzir linha específica
  const playLine = (lineIndex: number) => {
    if (timestamps[lineIndex]) {
      seekTo(timestamps[lineIndex].startTime);
      setSelectedLineIndex(lineIndex);
    }
  };

  // Salvar sincronização
  const handleSave = async () => {
    if (timestamps.length === 0) {
      alert('Nenhuma sincronização para salvar');
      return;
    }

    setIsSaving(true);
    try {
      // Determinar método de sincronização
      const hasAutoTimestamps = timestamps.some(t => t.confidence > 0.7);
      const hasManualTimestamps = timestamps.some(t => t.confidence >= 0.9);
      
      let syncMethod: 'automatic' | 'manual' | 'hybrid' = 'manual';
      if (hasAutoTimestamps && hasManualTimestamps) syncMethod = 'hybrid';
      else if (hasAutoTimestamps) syncMethod = 'automatic';

      // Calcular confiança média
      const avgConfidence = timestamps.reduce((sum, t) => sum + t.confidence, 0) / timestamps.length;

      // Salvar no banco de dados
      const result = await lyricsSyncService.saveLyricsSync(hymn.id, {
        timestamps,
        syncMethod,
        confidence: avgConfidence
      });

      if (result.success) {
        alert(result.message || 'Sincronização salva com sucesso!');
        onSave(timestamps);
      } else {
        alert(result.message || 'Erro ao salvar sincronização');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar sincronização');
    } finally {
      setIsSaving(false);
    }
  };

  // Inicializar timestamps vazios
  useEffect(() => {
    if (timestamps.length === 0 && lyricsLines.length > 0) {
      const initialTimestamps: LyricTimestamp[] = lyricsLines.map((line, index) => ({
        text: line.trim(),
        startTime: 0,
        endTime: 0,
        confidence: 0,
        lineIndex: index
      }));
      setTimestamps(initialTimestamps);
    }
  }, [lyricsLines, timestamps.length]);

  // Encontrar linha atual baseada no tempo
  const getCurrentLineIndex = useCallback(() => {
    return timestamps.findIndex(t => 
      currentTime >= t.startTime && currentTime <= t.endTime
    );
  }, [currentTime, timestamps]);

  const currentLineIndex = getCurrentLineIndex();

  // Calcular qualidade da sincronização
  const syncQuality = lyricsSyncService.calculateSyncQuality(timestamps);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-indigo-600" />
            Editor de Sincronização - {hymn.title}
          </CardTitle>
          <CardDescription>
            Sincronize automaticamente ou ajuste manualmente os timestamps das letras
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-blue-800">Carregando sincronização existente...</span>
            </div>
          )}

          {hasExistingSync && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-800 font-medium">Sincronização Existente Carregada</span>
              </div>
              <div className="text-sm text-green-700">
                {timestamps.length} linhas sincronizadas • 
                Qualidade: <span className="font-medium capitalize">{syncQuality.qualityScore}</span> • 
                Confiança média: {Math.round(syncQuality.averageConfidence * 100)}%
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAutoSync}
              disabled={!audioFile || isAutoSyncing || isProcessing}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isAutoSyncing || isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Sincronização Automática
            </Button>
            
            <Button 
              onClick={handleSave} 
              disabled={isSaving || timestamps.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Sincronização
            </Button>
            
            <Button onClick={onCancel} className="border">
              Cancelar
            </Button>

            {/* Indicador de qualidade */}
            {timestamps.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  syncQuality.qualityScore === 'excellent' ? 'bg-green-100 text-green-800' :
                  syncQuality.qualityScore === 'good' ? 'bg-blue-100 text-blue-800' :
                  syncQuality.qualityScore === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {syncQuality.qualityScore === 'excellent' ? '🎯 Excelente' :
                   syncQuality.qualityScore === 'good' ? '✅ Boa' :
                   syncQuality.qualityScore === 'fair' ? '⚠️ Regular' :
                   '❌ Ruim'}
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round(syncQuality.averageConfidence * 100)}%
                </div>
              </div>
            )}
          </div>

          {/* Progresso da sincronização */}
          {(isProcessing || progress > 0) && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analisando áudio... {progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player de Áudio */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Player de Áudio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hymn.mp3Url && (
              <audio ref={audioRef} src={hymn.mp3Url} preload="metadata" />
            )}

            {/* Controles */}
            <div className="flex items-center justify-center gap-2">
              <Button onClick={() => skipSeconds(-5)} className="p-2">
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button onClick={togglePlay} className="p-3 bg-indigo-600 hover:bg-indigo-700">
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              
              <Button onClick={() => skipSeconds(5)} className="p-2">
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Tempo atual */}
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-indigo-600">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-gray-500">
                / {formatTime(duration)}
              </div>
            </div>

            {/* Barra de progresso */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seekTo(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Linha atual */}
            {currentLineIndex >= 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm font-medium text-yellow-800 mb-1">
                  Linha Atual:
                </div>
                <div className="text-yellow-700">
                  {timestamps[currentLineIndex]?.text}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor de Timestamps */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Timestamps das Letras</CardTitle>
            <CardDescription>
              Clique em "Definir Início/Fim" no momento certo da música
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {timestamps.map((timestamp, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg transition-all ${
                    index === currentLineIndex
                      ? 'border-yellow-400 bg-yellow-50'
                      : index === selectedLineIndex
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Número da linha */}
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>

                    {/* Texto da linha */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 mb-2">
                        {timestamp.text}
                      </div>

                      {/* Controles de tempo */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Início
                          </label>
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              step="0.1"
                              value={timestamp.startTime.toFixed(1)}
                              onChange={(e) => adjustTimestamp(index, 'startTime', parseFloat(e.target.value))}
                              className="text-sm"
                            />
                            <Button
                              onClick={() => setCurrentTimeAsStart(index)}
                              className="px-2 py-1 text-xs"
                              title="Definir tempo atual como início"
                            >
                              Set
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Fim
                          </label>
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              step="0.1"
                              value={timestamp.endTime.toFixed(1)}
                              onChange={(e) => adjustTimestamp(index, 'endTime', parseFloat(e.target.value))}
                              className="text-sm"
                            />
                            <Button
                              onClick={() => setCurrentTimeAsEnd(index)}
                              className="px-2 py-1 text-xs"
                              title="Definir tempo atual como fim"
                            >
                              Set
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => playLine(index)}
                        className="p-2 text-xs"
                        title="Reproduzir esta linha"
                      >
                        <Play className="h-3 w-3" />
                      </Button>

                      {/* Indicador de confiança */}
                      <div className="text-center">
                        {timestamp.confidence > 0.7 ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                        ) : timestamp.confidence > 0.3 ? (
                          <AlertCircle className="h-4 w-4 text-yellow-500 mx-auto" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 mx-auto" />
                        )}
                        <div className="text-xs text-gray-500">
                          {Math.round(timestamp.confidence * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dicas de uso */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dicas de Uso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">⚡ Sincronização Automática:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Analisa padrões de áudio automaticamente</li>
                <li>• Detecta pausas e mudanças de intensidade</li>
                <li>• Funciona melhor com vozes claras</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">✋ Ajuste Manual:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Use os botões "Set" no momento certo</li>
                <li>• Navegue com as setas ← → (5 segundos)</li>
                <li>• Clique em "Reproduzir" para testar cada linha</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}