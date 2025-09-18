'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Music, List, Users, Lock } from 'lucide-react';
import { usePlaylistPlayer } from '@/hooks/use-audio-player';
import { musicalButton, musicalCard, musicalText } from '@/lib/musical-theme';

interface Hymn {
  id: string;
  title: string;
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
  _count: {
    items: number;
  };
}

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

export default function AcessoPlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { playPlaylist: playPlaylistTracks, currentTrack } = usePlaylistPlayer();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      // Adolescentes só veem playlists públicas
      const response = await fetch('/api/playlists?type=public');
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      }
    } catch (error) {
      console.error('Erro ao carregar playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const playPlaylist = (playlist: Playlist) => {
    const tracksWithAudio = playlist.items.filter(item => item.hymn.mp3Url);
    
    if (tracksWithAudio.length === 0) {
      alert('Esta playlist não possui hinos com áudio');
      return;
    }

    playPlaylistTracks(playlist.items);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${currentTrack ? 'pb-32' : ''}`}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Playlists</h1>
        <p className="text-gray-600">Escute as playlists criadas pelos líderes</p>
      </div>

      {playlists.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma playlist pública encontrada
              </h3>
              <p className="text-gray-500">
                Os líderes ainda não criaram playlists públicas
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="truncate">{playlist.name}</span>
                    </CardTitle>
                    <CardDescription>
                      {playlist.description || 'Sem descrição'}
                    </CardDescription>
                    <p className="text-xs text-gray-500 mt-1">
                      Criada por: {playlist.createdBy.name}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Music className="h-4 w-4" />
                    <span>{playlist._count.items} hinos</span>
                    <span>•</span>
                    <span>
                      {playlist.items.filter(item => item.hymn.mp3Url).length} com áudio
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/acesso/playlists/${playlist.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded border text-sm"
                    >
                      Ver Detalhes
                    </a>
                    <button
                      onClick={() => playPlaylist(playlist)}
                      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                      disabled={playlist.items.filter(item => item.hymn.mp3Url).length === 0}
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}