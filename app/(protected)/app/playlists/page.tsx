'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Play, Edit, Trash2, Music, List, Users, Lock } from 'lucide-react';
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

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', isPublic: false });
  
  const { playPlaylist: playPlaylistTracks, currentTrack } = usePlaylistPlayer();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/playlists');
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

  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPlaylist.name.trim()) return;

    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlaylist),
      });

      if (response.ok) {
        alert('Playlist criada com sucesso!');
        setShowCreateForm(false);
        setNewPlaylist({ name: '', description: '', isPublic: false });
        fetchPlaylists();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar playlist');
      }
    } catch (error) {
      alert('Erro ao criar playlist');
    }
  };

  const deletePlaylist = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta playlist?')) return;

    try {
      const response = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Playlist excluída!');
        fetchPlaylists();
      } else {
        alert('Erro ao excluir playlist');
      }
    } catch (error) {
      alert('Erro ao excluir playlist');
    }
  };

  const playPlaylist = (playlist: Playlist) => {
    if (playlist.items.length === 0) {
      alert('Esta playlist está vazia');
      return;
    }

    playPlaylistTracks(playlist.items);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
      {/* Conteúdo principal */}
      <div className={`relative z-10 space-y-6 p-4 sm:p-6 ${currentTrack ? 'pb-32' : 'pb-24'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">Playlists</h1>
            <p className="text-slate-500">Gerencie suas playlists de hinos</p>
          </div>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
          >
          <Plus className="h-4 w-4 mr-2" />
          Nova Playlist
        </Button>
      </div>

      {/* Create Playlist Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Nova Playlist</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createPlaylist} className="space-y-4">
              <div>
                <Input
                  placeholder="Nome da playlist"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="Descrição (opcional)"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newPlaylist.isPublic}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, isPublic: e.target.checked })}
                />
                <label htmlFor="isPublic" className="text-sm">
                  Playlist pública (apenas administradores)
                </label>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" className={`w-full sm:w-auto ${musicalButton('primary')}`}>Criar</Button>
                <Button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className={`w-full sm:w-auto ${musicalButton('secondary')}`}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <List className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma playlist encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                Crie sua primeira playlist para organizar seus hinos
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="hover:bg-slate-100 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      {playlist.isPublic ? (
                        <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      )}
                      <span className="truncate">{playlist.name}</span>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {playlist.description || 'Sem descrição'}
                    </CardDescription>
                    <p className="text-xs text-gray-500 mt-1">
                      Por: {playlist.createdBy.name}
                    </p>
                  </div>
                  <Button
                    onClick={() => deletePlaylist(playlist.id)}
                    className="p-2 text-red-600 hover:bg-red-50 bg-transparent border-0 flex-shrink-0 touch-manipulation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Music className="h-4 w-4" />
                    <span>{playlist._count.items} hinos</span>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`/app/playlists/${playlist.id}`}
                      className={`flex-1 sm:flex-none p-2 rounded border text-center touch-manipulation ${musicalButton('info')}`}
                    >
                      <Edit className="h-4 w-4 mx-auto" />
                    </a>
                    <Button
                      onClick={() => playPlaylist(playlist)}
                      className={`flex-1 sm:flex-none p-2 touch-manipulation ${musicalButton('action')}`}
                      disabled={playlist._count.items === 0}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}