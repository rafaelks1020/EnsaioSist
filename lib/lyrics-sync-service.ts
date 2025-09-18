import { LyricTimestamp } from '@/hooks/use-auto-lyrics-sync';

export interface SaveSyncRequest {
  timestamps: LyricTimestamp[];
  syncMethod?: 'automatic' | 'manual' | 'hybrid';
  confidence?: number;
}

export interface SyncResponse {
  id: string;
  timestamps: LyricTimestamp[];
  syncMethod: string;
  confidence: number;
  createdBy?: {
    id: string;
    name: string;
  };
  hymn: {
    id: string;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

class LyricsSyncService {
  private baseUrl = '/api/hinos';

  /**
   * Salva sincronização de letras para um hino
   */
  async saveLyricsSync(hymnId: string, data: SaveSyncRequest): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${hymnId}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar sincronização');
      }

      const result = await response.json();
      return { 
        success: true, 
        message: `Sincronização salva com ${result.data.timestampsCount} timestamps e ${Math.round(result.data.confidence * 100)}% de confiança`
      };
    } catch (error) {
      console.error('Erro ao salvar sincronização:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Carrega sincronização existente para um hino
   */
  async getLyricsSync(hymnId: string): Promise<SyncResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${hymnId}/sync`);
      
      if (response.status === 404) {
        return null; // Nenhuma sincronização encontrada
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar sincronização');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Erro ao carregar sincronização:', error);
      return null;
    }
  }

  /**
   * Remove sincronização de um hino
   */
  async deleteLyricsSync(hymnId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${hymnId}/sync`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao remover sincronização');
      }

      return { 
        success: true, 
        message: 'Sincronização removida com sucesso'
      };
    } catch (error) {
      console.error('Erro ao remover sincronização:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Carrega timestamps de um hino e aplica ao player
   */
  async loadAndApplySync(hymnId: string): Promise<LyricTimestamp[] | null> {
    const sync = await this.getLyricsSync(hymnId);
    if (!sync) return null;

    // Validar e converter timestamps
    const timestamps: LyricTimestamp[] = Array.isArray(sync.timestamps) 
      ? sync.timestamps.map((t: any) => ({
          text: String(t.text || ''),
          startTime: Number(t.startTime || 0),
          endTime: Number(t.endTime || 0),
          confidence: Number(t.confidence || 0),
          lineIndex: Number(t.lineIndex || 0)
        }))
      : [];

    return timestamps;
  }

  /**
   * Verifica se um hino tem sincronização salva
   */
  async hasSyncData(hymnId: string): Promise<boolean> {
    const sync = await this.getLyricsSync(hymnId);
    return sync !== null && Array.isArray(sync.timestamps) && sync.timestamps.length > 0;
  }

  /**
   * Calcula estatísticas de qualidade da sincronização
   */
  calculateSyncQuality(timestamps: LyricTimestamp[]): {
    averageConfidence: number;
    lowConfidenceCount: number;
    totalTimestamps: number;
    qualityScore: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    if (timestamps.length === 0) {
      return {
        averageConfidence: 0,
        lowConfidenceCount: 0,
        totalTimestamps: 0,
        qualityScore: 'poor'
      };
    }

    const avgConfidence = timestamps.reduce((sum, t) => sum + t.confidence, 0) / timestamps.length;
    const lowConfidenceCount = timestamps.filter(t => t.confidence < 0.5).length;
    
    let qualityScore: 'excellent' | 'good' | 'fair' | 'poor';
    if (avgConfidence >= 0.8) qualityScore = 'excellent';
    else if (avgConfidence >= 0.6) qualityScore = 'good';
    else if (avgConfidence >= 0.4) qualityScore = 'fair';
    else qualityScore = 'poor';

    return {
      averageConfidence: avgConfidence,
      lowConfidenceCount,
      totalTimestamps: timestamps.length,
      qualityScore
    };
  }
}

// Singleton instance
export const lyricsSyncService = new LyricsSyncService();

// Hook para usar o serviço em componentes React
export function useLyricsSyncService() {
  return lyricsSyncService;
}