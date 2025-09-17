'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AudioPlayer } from '@/components/audio/audio-player';
import { ArrowLeft, Plus, Play, Trash2, Music, Search, Users, Lock } from 'lucide-react';

interface Hymn {
  id: string;
  title: string;
  lyrics: string;
  mp3Url?: string;
  createdBy: {
    name: string;
  };
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
  const [availableHymns, setAvailableHymns] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddHymns, setShowAddHymns] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingHymnId, setAddingHymnId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    fetchPlaylistData();
  }, [playlistId]);

  const fetchPlaylistData = async () => {
    setLoading(true);
    try {
      const [playlistResponse, hymnsResponse] = await Promise.all([
        fetch(`/api/playlists/${playlistId}`),
        fetch('/api/hinos')
      ]);

      if (playlistResponse.ok) {
        const playlistData = await playlistResponse.json();
        setPlaylist(playlistData);
      }

      if (hymnsResponse.ok) {
        const hymnsData = await hymnsResponse.json();
        setAvailableHymns(hymnsData.hymns || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHymnToPlaylist = async (hymnId: string) => {
    setAddingHymnId(hymnId);
    try {
      const response = await fetch(`/api/playlists/${playlistId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hymnId }),
      });

      if (response.ok) {
        alert('Hino adicionado à playlist!');
        fetchPlaylistData();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao adicionar hino');
      }
    } catch (error) {
      alert('Erro ao adicionar hino');
    } finally {
      setAddingHymnId(null);
    }
  };

  const removeHymnFromPlaylist = async (hymnId: string, itemId: string) => {
    if (!confirm('Remover este hino da playlist?')) return;
    
    setRemovingItemId(itemId);
    try {
      const response = await fetch(`/api/playlists/${playlistId}/items?hymnId=${hymnId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Hino removido da playlist!');
        fetchPlaylistData();
      } else {
        alert('Erro ao remover hino');
      }
    } catch (error) {
      alert('Erro ao remover hino');
    } finally {
      setRemovingItemId(null);
    }
  };

  const playPlaylist = () => {
    if (!playlist || playlist.items.length === 0) {
      alert('Esta playlist está vazia');
      return;
    }

    const tracksWithAudio = playlist.items.filter(item => item.hymn.mp3Url);
    if (tracksWithAudio.length === 0) {
      alert('Nenhum hino desta playlist possui áudio');
      return;
    }

    setCurrentTrackIndex(0);
    setShowPlayer(true);
  };

  const getTracksFromPlaylist = (): Track[] => {
    if (!playlist) return [];
    
    return playlist.items
      .filter(item => item.hymn.mp3Url)
      .map(item => ({
        id: item.hymn.id,
        title: item.hymn.title,
        artist: item.hymn.createdBy.name,
        url: item.hymn.mp3Url!
      }));
  };

  const filteredHymns = availableHymns.filter(hymn =>
    hymn.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !playlist?.items.some(item => item.hymn.id === hymn.id)
  );

  if (loading || !playlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentTracks = getTracksFromPlaylist();

  return (
    <div className={`container mx-auto px-4 py-8 max-w-4xl ${showPlayer ? 'pb-32' : ''}`}>
      <div className="mb-6">
        <Button 
          onClick={() => router.back()}
          className="mb-4 bg-gray-600 hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {playlist.isPublic ? (
                <Users className="h-6 w-6 text-blue-600" />
              ) : (
                <Lock className="h-6 w-6 text-gray-600" />
              )}
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-gray-600 mt-1">{playlist.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Criada por: {playlist.createdBy.name} • {playlist.items.length} hinos
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowAddHymns(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Hinos
            </Button>
            <Button
              onClick={playPlaylist}
              className="bg-green-600 hover:bg-green-700"
              disabled={currentTracks.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Tocar Tudo
            </Button>
          </div>
        </div>
      </div>

      {/* Add Hymns Modal */}
      {showAddHymns && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Adicionar Hinos à Playlist</h2>
                <Button 
                  onClick={() => setShowAddHymns(false)}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  Fechar
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar hinos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredHymns.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'Nenhum hino encontrado' : 'Todos os hinos já foram adicionados'}
                  </div>
                ) : (
                  filteredHymns.map((hymn) => (
                    <div
                      key={hymn.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{hymn.title}</h3>
                        <p className="text-sm text-gray-500">
                          {hymn.createdBy.name}
                          {hymn.mp3Url && ' • MP3 disponível'}
                        </p>
                      </div>
                      <Button
                        onClick={() => addHymnToPlaylist(hymn.id)}
                        disabled={addingHymnId === hymn.id}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {addingHymnId === hymn.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          'Adicionar'
                        )}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Items */}
      <Card>
        <CardHeader>
          <CardTitle>Hinos da Playlist</CardTitle>
        </CardHeader>
        <CardContent>
          {playlist.items.length === 0 ? (
            <div className="text-center py-12">
              <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Playlist vazia
              </h3>
              <p className="text-gray-500 mb-4">
                Adicione hinos para começar a organizar sua playlist
              </p>
              <Button
                onClick={() => setShowAddHymns(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Hino
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {playlist.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-medium text-sm">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{item.hymn.title}</h3>
                    <p className="text-sm text-gray-500">
                      {item.hymn.createdBy.name}
                      {item.hymn.mp3Url && ' • MP3 disponível'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.hymn.mp3Url && (
                      <a
                        href={item.hymn.mp3Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-600 hover:bg-green-50 rounded border"
                        title="Tocar MP3"
                      >
                        <Play className="h-4 w-4" />
                      </a>
                    )}
                    
                    <Button
                      onClick={() => removeHymnFromPlaylist(item.hymn.id, item.id)}
                      disabled={removingItemId === item.id}
                      className="p-2 text-red-600 hover:bg-red-50 bg-transparent border-0"
                      title="Remover da playlist"
                    >
                      {removingItemId === item.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audio Player */}
      {showPlayer && currentTracks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <AudioPlayer
            tracks={currentTracks}
            currentTrackIndex={currentTrackIndex}
            onTrackChange={setCurrentTrackIndex}
            onPlaylistToggle={() => setShowPlayer(false)}
            autoPlay={true}
          />
        </div>
      )}
    </div>
  );
}