'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Download, Music, Calendar, User, FileText } from 'lucide-react';
import { useHymnPlayer } from '@/hooks/use-audio-player';

interface Hymn {
  id: string;
  title: string;
  lyrics?: string;
  mp3Url?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export default function PublicHymnDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hymnId = params.id as string;
  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [currentPlayingHymn, setCurrentPlayingHymn] = useState<Hymn | null>(null);
  const [lyricsPanelSize, setLyricsPanelSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { playHymn, currentTrack, isPlaying } = useHymnPlayer();

  useEffect(() => {
    if (hymnId) {
      fetchHymn();
    }
  }, [hymnId]);

  const fetchHymn = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/hinos/${hymnId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Hino não encontrado');
        } else {
          setError('Erro ao carregar hino');
        }
        return;
      }
      
      const data = await response.json();
      setHymn(data);
    } catch (error) {
      console.error('Erro ao buscar hino:', error);
      setError('Erro ao carregar hino');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayHymn = () => {
    if (hymn && hymn.mp3Url) {
      playHymn({
        id: hymn.id,
        title: hymn.title,
        mp3Url: hymn.mp3Url,
        createdBy: hymn.createdBy
      });
      setCurrentPlayingHymn(hymn);
      setShowLyricsPanel(true);
      setIsFullscreen(false);
    }
  };

  const closeLyricsPanel = () => {
    setShowLyricsPanel(false);
    setCurrentPlayingHymn(null);
    setIsFullscreen(false);
  };

  // Configuração dos tamanhos do painel
  const panelSizes = {
    small: { width: 'w-72', height: 'max-h-96', textSize: 'text-xs' },
    medium: { width: 'w-80', height: 'max-h-[500px]', textSize: 'text-sm' },
    large: { width: 'w-96', height: 'max-h-[600px]', textSize: 'text-base' }
  };

  const currentSize = panelSizes[lyricsPanelSize];

  // Detectar quando o player parar para esconder a letra
  useEffect(() => {
    if (!currentTrack && showLyricsPanel) {
      setShowLyricsPanel(false);
      setIsFullscreen(false);
    }
  }, [currentTrack, showLyricsPanel]);

  const handleDownload = async () => {
    if (hymn && hymn.mp3Url) {
      try {
        const response = await fetch(hymn.mp3Url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${hymn.title}.mp3`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Erro ao baixar arquivo:', error);
        alert('Erro ao baixar arquivo');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Music className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (!hymn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Music className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hino não encontrado</h2>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.back()}
          className="p-2 bg-gray-600 hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{hymn.title}</h1>
          <p className="text-gray-600">Detalhes do Hino</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Audio Player Card */}
          {hymn.mp3Url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Áudio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePlayHymn}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Reproduzir
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar MP3
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lyrics Card */}
          {hymn.lyrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Letra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-gray-700 leading-relaxed space-y-4 [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: hymn.lyrics }}
                />
              </CardContent>
            </Card>
          )}

          {/* No Content Message */}
          {!hymn.lyrics && !hymn.mp3Url && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Conteúdo não disponível
                  </h3>
                  <p className="text-gray-600">
                    Este hino ainda não possui letra ou arquivo de áudio.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Criado por</p>
                  <p className="font-medium">{hymn.createdBy.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Data de criação</p>
                  <p className="font-medium">
                    {new Date(hymn.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Status do áudio</p>
                  <p className="font-medium">
                    {hymn.mp3Url ? (
                      <span className="text-green-600">MP3 Disponível</span>
                    ) : (
                      <span className="text-gray-500">Sem áudio</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Painel de letra fixo que aparece quando toca música */}
      {showLyricsPanel && currentPlayingHymn && currentPlayingHymn.lyrics && (
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
              }`}>{currentPlayingHymn.title}</h3>
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
              dangerouslySetInnerHTML={{ __html: currentPlayingHymn.lyrics }}
            />
          </div>
        </div>
      )}
    </div>
  );
}