'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Music, Play, Download, Eye, Mic2 } from 'lucide-react';
import { toast } from 'sonner';
import { useHymnPlayer } from '@/hooks/use-audio-player';
import { musicalButton, musicalCard, musicalText } from '@/lib/musical-theme';

interface Hymn {
  id: string;
  title: string;
  lyrics: string;
  mp3Url?: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function HinosPage() {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [currentPlayingHymn, setCurrentPlayingHymn] = useState<Hymn | null>(null);
  
  const { playHymn, currentTrack, isPlaying } = useHymnPlayer();

  const fetchHymns = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
      });

      const response = await fetch(`/api/hinos?${params}`);
      if (!response.ok) throw new Error('Failed to fetch hymns');

      const data = await response.json();
      setHymns(data.hymns);
      setPagination(data.pagination);
    } catch (error) {
      toast.error('Erro ao carregar hinos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHymns();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHymns(1, search);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir o hino "${title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/hinos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete hymn');

      toast.success('Hino excluído com sucesso');
      fetchHymns(pagination.page, search);
    } catch (error) {
      toast.error('Erro ao excluir hino');
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
      {/* Conteúdo principal */}
      <div className={`relative z-10 space-y-6 p-4 sm:p-6 ${currentTrack ? 'pb-32' : 'pb-24'}`}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold mb-2">
              <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">Hinos</span>
            </h1>
            <p className="text-slate-500">Gerencie a biblioteca de hinos</p>
          </div>
          <Link href="/app/hinos/novo">
            <Button className={musicalButton('primary')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Hino
            </Button>
          </Link>
        </div>

        <Card className={musicalCard()}>
          <CardHeader>
            <CardTitle className="text-slate-800">Buscar Hinos</CardTitle>
            <CardDescription className="text-slate-500">
              Encontre hinos pelo título
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Digite o título do hino..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" className={`w-full sm:w-auto ${musicalButton('primary')}`}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-slate-500 text-lg">Carregando...</div>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {hymns.length === 0 ? (
              <Card className={musicalCard()}>
                <CardContent className="pt-6">
                  <div className="text-center text-slate-500">
                    <Music className="h-12 w-12 mx-auto mb-4 text-pink-500" />
                    <p>Nenhum hino encontrado</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              hymns.map((hymn) => (
                <Card key={hymn.id} className={`${musicalCard()} hover:bg-slate-100 transition-all`}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-semibold truncate text-slate-800`}>
                          {hymn.title}
                        </h3>
                        <p className="text-slate-500 mt-1">
                          Criado por {hymn.createdBy.name} em{' '}
                          {new Date(hymn.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        {hymn.mp3Url && (
                          <div className="mt-2">
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded border border-green-200">MP3 Disponível</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Mobile Action Buttons */}
                      <div className="flex sm:hidden gap-2 w-full">
                        {hymn.mp3Url && (
                          <>
                            <button
                              onClick={() => playHymn(hymn)}
                              className="flex-1 p-3 text-green-700 hover:bg-green-100 rounded border border-green-200 text-center touch-manipulation transition-all"
                              title="Tocar no Player"
                            >
                              <Play className="h-4 w-4 mx-auto" />
                            </button>
                            
                            {hymn.lyrics && (
                              <button
                                onClick={() => {
                                  playHymn(hymn);
                                  setCurrentPlayingHymn(hymn);
                                  setShowLyricsPanel(true);
                                }}
                                className="flex-1 p-3 text-pink-700 hover:bg-pink-100 rounded border border-pink-200 text-center touch-manipulation transition-all"
                                title="Ver letras sincronizadas"
                              >
                                <Mic2 className="h-4 w-4 mx-auto" />
                              </button>
                            )}
                            
                            <a
                              href={hymn.mp3Url}
                              download
                              className="flex-1 p-3 text-indigo-700 hover:bg-indigo-100 rounded border border-indigo-200 text-center touch-manipulation transition-all"
                              title="Baixar MP3"
                            >
                              <Download className="h-4 w-4 mx-auto" />
                            </a>
                          </>
                        )}
                        <Link href={`/app/hinos/${hymn.id}`} className="flex-1">
                          <Button className={`w-full h-9 rounded-md px-3 touch-manipulation border border-input bg-background hover:bg-accent hover:text-accent-foreground`} title="Ver Detalhes">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/app/hinos/${hymn.id}/editar`} className="flex-1">
                          <Button className="w-full h-9 rounded-md px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground touch-manipulation">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleDelete(hymn.id, hymn.title)}
                          className="flex-1 h-9 rounded-md px-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 touch-manipulation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Desktop Action Buttons */}
                      <div className="hidden sm:flex gap-2 ml-4 flex-shrink-0">
                        {hymn.mp3Url && (
                          <>
                            <button
                              onClick={() => playHymn(hymn)}
                              className={`p-2 rounded border touch-manipulation ${musicalButton('action')}`}
                              title="Tocar no Player"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                            
                            {hymn.lyrics && (
                              <button
                                onClick={() => {
                                  playHymn(hymn);
                                  setCurrentPlayingHymn(hymn);
                                  setShowLyricsPanel(true);
                                }}
                                className={`p-2 rounded border touch-manipulation ${musicalButton('primary')}`}
                                title="Ver letras sincronizadas"
                              >
                                <Mic2 className="h-4 w-4" />
                              </button>
                            )}
                            
                            <a
                              href={hymn.mp3Url}
                              download
                              className={`p-2 rounded border touch-manipulation ${musicalButton('info')}`}
                              title="Baixar MP3"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </>
                        )}
                        <Link href={`/app/hinos/${hymn.id}`}>
                          <Button className={`h-9 rounded-md px-3 touch-manipulation border border-input bg-background hover:bg-accent hover:text-accent-foreground`} title="Ver Detalhes">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/app/hinos/${hymn.id}/editar`}>
                          <Button className={`h-9 rounded-md px-3 touch-manipulation ${musicalButton('info')}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleDelete(hymn.id, hymn.title)}
                          className={`h-9 rounded-md px-3 touch-manipulation ${musicalButton('danger')}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button
                className={`w-full sm:w-auto ${pagination.page === 1 ? musicalButton('disabled') : musicalButton('secondary')}`}
                disabled={pagination.page === 1}
                onClick={() => fetchHymns(pagination.page - 1, search)}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                className={`w-full sm:w-auto ${pagination.page === pagination.totalPages ? musicalButton('disabled') : musicalButton('secondary')}`}
                disabled={pagination.page === pagination.totalPages}
                onClick={() => fetchHymns(pagination.page + 1, search)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
}