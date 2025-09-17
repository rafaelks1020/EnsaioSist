'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Music, Play, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useHymnPlayer } from '@/hooks/use-audio-player';

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
  
  const { playHymn, isVisible } = useHymnPlayer();

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
    <div className={`space-y-6 ${isVisible ? 'pb-32' : ''}`}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hinos</h1>
          <p className="text-gray-600">Gerencie a biblioteca de hinos</p>
        </div>
        <Link href="/app/hinos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Hino
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Hinos</CardTitle>
          <CardDescription>
            Encontre hinos pelo título
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Digite o título do hino..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Carregando...</div>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {hymns.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-500">
                    <Music className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum hino encontrado</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              hymns.map((hymn) => (
                <Card key={hymn.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {hymn.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Criado por {hymn.createdBy.name} em{' '}
                          {new Date(hymn.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                        {hymn.mp3Url && (
                          <div className="mt-2">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              MP3 Disponível
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {hymn.mp3Url && (
                          <>
                            <button
                              onClick={() => playHymn(hymn)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded border"
                              title="Tocar no Player"
                            >
                              <Play className="h-4 w-4" />
                            </button>
                            <a
                              href={hymn.mp3Url}
                              download
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded border"
                              title="Baixar MP3"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </>
                        )}
                        <Link href={`/app/hinos/${hymn.id}`}>
                          <Button variant="outline" size="sm" title="Ver Detalhes">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/app/hinos/${hymn.id}/editar`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(hymn.id, hymn.title)}
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
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => fetchHymns(pagination.page - 1, search)}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
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
  );
}