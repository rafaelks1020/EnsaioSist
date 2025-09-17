'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Music, Play, Calendar, Clock, Download } from 'lucide-react';
import { Weekday } from '@/lib/roles';
import { useHymnPlayer } from '@/hooks/use-audio-player';

interface RehearsalSlot {
  id: string;
  weekday: Weekday;
  startTime: string;
  endTime: string;
  description?: string;
}

interface RehearsalHymn {
  id: string;
  order: number;
  hymn: {
    id: string;
    title: string;
    lyrics: string;
    mp3Url?: string;
    createdBy: {
      name: string;
    };
  };
}

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

const WEEKDAY_LABELS = {
  [Weekday.SUNDAY]: 'Domingo',
  [Weekday.MONDAY]: 'Segunda-feira',
  [Weekday.TUESDAY]: 'Terça-feira',
  [Weekday.WEDNESDAY]: 'Quarta-feira',
  [Weekday.THURSDAY]: 'Quinta-feira',
  [Weekday.FRIDAY]: 'Sexta-feira',
  [Weekday.SATURDAY]: 'Sábado',
};

export default function RehearsalDetailsReadOnly() {
  const params = useParams();
  const router = useRouter();
  const rehearsalId = params.id as string;

  const [rehearsal, setRehearsal] = useState<RehearsalSlot | null>(null);
  const [hymns, setHymns] = useState<RehearsalHymn[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHymn, setSelectedHymn] = useState<RehearsalHymn | null>(null);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [currentPlayingHymn, setCurrentPlayingHymn] = useState<RehearsalHymn | null>(null);
  const [lyricsPanelSize, setLyricsPanelSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { playHymns, playHymn, isVisible } = useHymnPlayer();

  useEffect(() => {
    fetchRehearsalData();
    fetchRehearsalHymns();
  }, [rehearsalId]);

  const fetchRehearsalData = async () => {
    try {
      const response = await fetch(`/api/ensaios/${rehearsalId}`);
      if (response.ok) {
        const data = await response.json();
        setRehearsal(data);
      }
    } catch (error) {
      console.error('Erro ao carregar ensaio:', error);
    }
  };

  const fetchRehearsalHymns = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ensaios/${rehearsalId}/hinos`);
      if (response.ok) {
        const data = await response.json();
        setHymns(data);
      }
    } catch (error) {
      console.error('Erro ao carregar hinos do ensaio:', error);
    } finally {
      setLoading(false);
    }
  };

  const showHymnLyrics = (hymn: RehearsalHymn) => {
    setSelectedHymn(hymn);
  };

  const closeHymnModal = () => {
    setSelectedHymn(null);
  };

  const closeLyricsPanel = () => {
    setShowLyricsPanel(false);
    setCurrentPlayingHymn(null);
    setIsFullscreen(false);
  };

  // Detectar quando o player parar para esconder a letra
  useEffect(() => {
    if (!isVisible && showLyricsPanel) {
      setShowLyricsPanel(false);
      setCurrentPlayingHymn(null);
      setIsFullscreen(false);
    }
  }, [isVisible, showLyricsPanel]);

  // Configurações de tamanho do painel
  const panelSizes = {
    small: { width: 'w-72', height: 'max-h-80', textSize: 'text-xs' },
    medium: { width: 'w-80', height: 'max-h-96', textSize: 'text-sm' },
    large: { width: 'w-96', height: 'max-h-[32rem]', textSize: 'text-base' }
  };

  const currentSize = panelSizes[lyricsPanelSize];

  const playHymnFromList = (hymnId: string) => {
    const rehearsalHymn = hymns.find(h => h.hymn.id === hymnId);
    if (rehearsalHymn && rehearsalHymn.hymn) {
      // Tocar o hino
      playHymn(rehearsalHymn.hymn);
      
      // Mostrar letra automaticamente se tiver letra
      if (rehearsalHymn.hymn.lyrics) {
        setCurrentPlayingHymn(rehearsalHymn);
        setShowLyricsPanel(true);
      }
    }
  };

  const playAllHymns = () => {
    const hymnsList = hymns
      .sort((a, b) => a.order - b.order)
      .map(h => h.hymn);
    
    playHymns(hymnsList);
    
    // Mostrar letra do primeiro hino se disponível
    const firstHymnWithLyrics = hymns.find(h => h.hymn.lyrics);
    if (firstHymnWithLyrics) {
      setCurrentPlayingHymn(firstHymnWithLyrics);
      setShowLyricsPanel(true);
    }
  };

  if (!rehearsal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 max-w-4xl ${isVisible ? 'pb-32' : ''}`}>
      <div className="mb-6">
        <Button 
          onClick={() => router.back()}
          className="mb-4 bg-gray-600 hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex items-center gap-4 mb-4">
          <Calendar className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">
              Ensaio de {WEEKDAY_LABELS[rehearsal.weekday]}
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{rehearsal.startTime} - {rehearsal.endTime}</span>
            </div>
            {rehearsal.description && (
              <p className="text-gray-600 mt-1">{rehearsal.description}</p>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Hinos do Ensaio
          </CardTitle>
          <CardDescription>
            Lista dos hinos que serão ensaiados nesta sessão
          </CardDescription>
          {hymns.filter(h => h.hymn.mp3Url).length > 0 && (
            <div className="pt-4 border-t">
              <Button
                onClick={playAllHymns}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Tocar Todos os Hinos
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : hymns.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum hino programado
              </h3>
              <p className="text-gray-500">
                Os hinos para este ensaio ainda não foram definidos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {hymns.map((rehearsalHymn, index) => (
                <div
                  key={rehearsalHymn.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{rehearsalHymn.hymn.title}</h3>
                    <p className="text-sm text-gray-500">
                      Criado por: {rehearsalHymn.hymn.createdBy.name}
                    </p>
                    {rehearsalHymn.hymn.mp3Url && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          MP3 Disponível
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {rehearsalHymn.hymn.mp3Url && (
                      <>
                        <button
                          onClick={() => playHymnFromList(rehearsalHymn.hymn.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded border"
                          title="Tocar no Player"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <a
                          href={rehearsalHymn.hymn.mp3Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded border"
                          title="Baixar MP3"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </>
                    )}
                    
                    <Button
                      onClick={() => showHymnLyrics(rehearsalHymn)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded border bg-transparent"
                      title="Ver letra do hino"
                    >
                      <Music className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Painel de letra fixo que aparece quando toca música */}
      {showLyricsPanel && currentPlayingHymn && (
        <div className={isFullscreen 
          ? "fixed inset-0 bg-white z-50 flex flex-col"
          : `fixed top-4 right-4 ${currentSize.width} ${currentSize.height} bg-white border-2 shadow-xl rounded-lg z-40 overflow-hidden`
        }>
          <div className={`p-3 border-b bg-blue-50 flex items-center justify-between ${
            isFullscreen ? 'px-6 py-4' : ''
          }`}>
            <div className="flex-1">
              <h3 className={`font-semibold text-gray-900 ${
                isFullscreen ? 'text-xl' : 'text-sm'
              }`}>{currentPlayingHymn.hymn.title}</h3>
              <p className={`text-gray-600 ${
                isFullscreen ? 'text-sm' : 'text-xs'
              }`}>🎵 Letra do hino</p>
            </div>
            <div className="flex items-center gap-1">
              {!isFullscreen && (
                <>
                  {/* Controles de tamanho */}
                  <button 
                    onClick={() => setLyricsPanelSize('small')}
                    className={`px-2 py-1 text-xs rounded ${
                      lyricsPanelSize === 'small' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title="Tamanho pequeno"
                  >
                    P
                  </button>
                  <button 
                    onClick={() => setLyricsPanelSize('medium')}
                    className={`px-2 py-1 text-xs rounded ${
                      lyricsPanelSize === 'medium' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title="Tamanho médio"
                  >
                    M
                  </button>
                  <button 
                    onClick={() => setLyricsPanelSize('large')}
                    className={`px-2 py-1 text-xs rounded ${
                      lyricsPanelSize === 'large' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title="Tamanho grande"
                  >
                    G
                  </button>
                </>
              )}
              {/* Botão tela cheia */}
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className={`px-2 py-1 text-xs rounded ${
                  isFullscreen 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
              >
                {isFullscreen ? '⛬' : '⛶'}
              </button>
              <button 
                onClick={closeLyricsPanel}
                className={`ml-2 p-1 h-6 w-6 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded flex items-center justify-center text-xs font-bold ${
                  isFullscreen ? 'h-8 w-8' : ''
                }`}
                title="Fechar letra"
              >
                ×
              </button>
            </div>
          </div>
          <div className={`flex-1 overflow-y-auto ${
            isFullscreen 
              ? 'p-8 max-w-4xl mx-auto w-full' 
              : `p-3 ${currentSize.height.replace('max-h-', 'max-h-')} ${currentSize.textSize}`
          }`}>
            <div 
              className={`text-gray-700 leading-relaxed space-y-4 [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-gray-900 ${
                isFullscreen ? 'text-lg leading-8' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: currentPlayingHymn.hymn.lyrics }}
            />
          </div>
        </div>
      )}

      {/* Modal para mostrar letra do hino */}
      {selectedHymn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selectedHymn.hymn.title}</h2>
                <p className="text-sm text-gray-500">
                  Criado por: {selectedHymn.hymn.createdBy.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedHymn.hymn.mp3Url && (
                  <>
                    <button
                      onClick={() => {
                        playHymnFromList(selectedHymn.hymn.id);
                        closeHymnModal();
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded border"
                      title="Tocar no Player"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                    <a
                      href={selectedHymn.hymn.mp3Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded border"
                      title="Baixar MP3"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </>
                )}
                <Button 
                  onClick={closeHymnModal}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Fechar
                </Button>
              </div>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedHymn.hymn.lyrics }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}