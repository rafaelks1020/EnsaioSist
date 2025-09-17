'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Music, Clock, User, Users } from 'lucide-react';
import { usePlaylistPlayer } from '@/hooks/use-audio-player';

interface Hymn {
  id: string;
  title: string;
  lyrics?: string;
  mp3Url?: string;
  createdBy: {
    name: string;
  };
  createdAt: string;
}

interface PlaylistItem {
  id: string;
  order: number;
  hymn: Hymn;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdBy: {
    name: string;
  };
  createdAt: string;
  items: PlaylistItem[];
}

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export default function PlaylistDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [currentPlayingHymn, setCurrentPlayingHymn] = useState<Hymn | null>(null);
  const [lyricsPanelSize, setLyricsPanelSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { playPlaylist, playPlaylistHymn, isVisible } = usePlaylistPlayer();

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist();
    }
  }, [playlistId]);

  const fetchPlaylist = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/playlists/${playlistId}`);
      if (response.ok) {
        const data = await response.json();
        // Adolescentes só podem ver playlists públicas
        if (data.isPublic) {
          setPlaylist(data);
        } else {
          router.push('/acesso/playlists');
        }
      } else {
        router.push('/acesso/playlists');
      }
    } catch (error) {
      console.error('Erro ao carregar playlist:', error);
      router.push('/acesso/playlists');
    } finally {
      setLoading(false);
    }
  };

  const playFromIndex = (index: number) => {
    if (!playlist) return;
    
    const tracksWithAudio = playlist.items.filter(item => item.hymn.mp3Url);
    
    if (tracksWithAudio.length === 0) {
      alert('Esta playlist não possui hinos com áudio');
      return;
    }

    playPlaylist(playlist.items, index);
  };

  const playAll = () => {
    if (!playlist) return;
    
    const tracksWithAudio = playlist.items.filter(item => item.hymn.mp3Url);
    
    if (tracksWithAudio.length === 0) {
      alert('Esta playlist não possui hinos com áudio');
      return;
    }

    playPlaylist(playlist.items);
  };

  const playHymnWithLyrics = (hymnId: string) => {
    if (!playlist) return;
    
    const hymn = playlist.items.find(item => item.hymn.id === hymnId)?.hymn;
    if (hymn && hymn.mp3Url) {
      playPlaylistHymn(playlist.items, hymnId);
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
    if (!isVisible && showLyricsPanel) {
      setShowLyricsPanel(false);
      setCurrentPlayingHymn(null);
      setIsFullscreen(false);
    }
  }, [isVisible, showLyricsPanel]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
        <div className="h-64 bg-gray-200 animate-pulse rounded" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Playlist não encontrada</h1>
        <button
          onClick={() => router.push('/acesso/playlists')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Voltar às playlists
        </button>
      </div>
    );
  }

  const tracksWithAudio = playlist.items.filter(item => item.hymn.mp3Url);

  return (
    <div className={`space-y-6 ${isVisible ? 'pb-32' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/acesso/playlists')}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{playlist.name}</h1>
          <p className="text-gray-600">
            {playlist.description || 'Sem descrição'}
          </p>
        </div>
      </div>

      {/* Playlist Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Informações da Playlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Criada por</p>
                <p className="font-medium">{playlist.createdBy.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Data de criação</p>
                <p className="font-medium">{formatDate(playlist.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Total de hinos</p>
                <p className="font-medium">{playlist.items.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Com áudio</p>
                <p className="font-medium">{tracksWithAudio.length}</p>
              </div>
            </div>
          </div>
          
          {tracksWithAudio.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={playAll}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Tocar Toda a Playlist
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hymns List */}
      <Card>
        <CardHeader>
          <CardTitle>Hinos ({playlist.items.length})</CardTitle>
          <CardDescription>
            Lista de hinos incluídos nesta playlist
          </CardDescription>
        </CardHeader>
        <CardContent>
          {playlist.items.length === 0 ? (
            <div className="text-center py-8">
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Esta playlist ainda não possui hinos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlist.items
                .sort((a, b) => a.order - b.order)
                .map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-sm text-gray-500">{item.order}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.hymn.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Por: {item.hymn.createdBy.name} • 
                        {formatDate(item.hymn.createdAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.hymn.mp3Url ? (
                        <button
                          onClick={() => playHymnWithLyrics(item.hymn.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                          title="Tocar este hino"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="p-2 text-gray-400" title="Sem áudio disponível">
                          <Music className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

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