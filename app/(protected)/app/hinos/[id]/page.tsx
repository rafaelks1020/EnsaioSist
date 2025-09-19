'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Edit, Download, Music, Calendar, User, FileText } from 'lucide-react';
import { useHymnPlayer } from '@/hooks/use-audio-player';
import { musicalButton, musicalCard, musicalText } from '@/lib/musical-theme';

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

export default function HymnDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const hymnId = params.id as string;
  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { playHymn } = useHymnPlayer();

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
    }
  };

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
      <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-lg text-slate-600">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Music className="h-16 w-16 text-pink-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">{error}</h2>
            <Button onClick={() => router.back()} className={`mt-4 ${musicalButton('secondary')}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!hymn) {
    return (
      <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Music className="h-16 w-16 text-pink-500 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Hino não encontrado</h2>
            <Button onClick={() => router.back()} className={`mt-4 ${musicalButton('secondary')}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
      <div className="relative z-10 container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => router.back()}
          className={musicalButton('secondary')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-slate-800">{hymn?.title}</h1>
          <p className="text-slate-500">Detalhes do Hino</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Audio Player Card */}
          {hymn?.mp3Url && (
            <Card className={musicalCard()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Music className="h-5 w-5 text-pink-500" />
                  Áudio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePlayHymn}
                    className={musicalButton('primary')}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Reproduzir
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className={musicalButton('action')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar MP3
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lyrics Card */}
          {hymn?.lyrics && (
            <Card className={musicalCard()}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <FileText className="h-5 w-5 text-pink-500" />
                  Letra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="text-slate-700 leading-relaxed space-y-4 [&_p]:mb-4 [&_strong]:font-semibold [&_strong]:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: hymn?.lyrics || '' }}
                />
              </CardContent>
            </Card>
          )}

          {/* No Content Message */}
          {!hymn?.lyrics && !hymn?.mp3Url && (
            <Card className={musicalCard()}>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Music className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                  <h3 className={`text-lg font-medium mb-2 text-slate-800`}>
                    Conteúdo não disponível
                  </h3>
                  <p className="text-slate-500">
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
          <Card className={musicalCard()}>
            <CardHeader>
              <CardTitle className="text-slate-800">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-pink-400" />
                <div>
                  <p className="text-sm text-purple-300">Criado por</p>
                  <p className={`font-medium ${musicalText('heading')}`}>{hymn?.createdBy?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-pink-400" />
                <div>
                  <p className="text-sm text-purple-300">Data de criação</p>
                  <p className={`font-medium ${musicalText('heading')}`}>
                    {hymn ? new Date(hymn.createdAt).toLocaleDateString('pt-BR') : ''}
                  </p>
                </div>
              </div>

              {hymn && hymn.updatedAt !== hymn.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-pink-400" />
                  <div>
                    <p className="text-sm text-purple-300">Última atualização</p>
                    <p className={`font-medium ${musicalText('heading')}`}>
                      {new Date(hymn.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-pink-400" />
                <div>
                  <p className="text-sm text-purple-300">Status do áudio</p>
                  <p className={`font-medium ${musicalText('heading')}`}>
                    {hymn?.mp3Url ? (
                      <span className="text-green-400">MP3 Disponível</span>
                    ) : (
                      <span className="text-purple-300">Sem áudio</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card className={musicalCard()}>
            <CardHeader>
              <CardTitle className={musicalText('gradient')}>Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push(`/app/hinos/${hymn?.id}/editar`)}
                className={`w-full ${musicalButton('primary')}`}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Hino
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}