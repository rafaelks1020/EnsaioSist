'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { musicalButton, musicalCard, musicalText } from '@/lib/musical-theme';

// Import TipTap editor dynamically to avoid SSR issues
const HymnEditor = dynamic(() => import('@/components/forms/rich-text-editor'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-md" />,
});

interface Hymn {
  id: string;
  title: string;
  lyrics: string;
  mp3Url?: string;
  createdBy: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function EditHymnPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [uploadingMp3, setUploadingMp3] = useState(false);

  useEffect(() => {
    fetchHymn();
  }, [id]);

  const fetchHymn = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hinos/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch hymn');
      }

      const data = await response.json();
      setHymn(data);
      setTitle(data.title);
      setLyrics(data.lyrics);
    } catch (error) {
      toast.error('Erro ao carregar hino');
      router.push('/app/hinos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    try {
      setSaving(true);

      let mp3Url = hymn?.mp3Url;

      // Upload MP3 if selected
      if (mp3File) {
        setUploadingMp3(true);
        const formData = new FormData();
        formData.append('file', mp3File);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload MP3');
        }

        const uploadData = await uploadResponse.json();
        mp3Url = uploadData.url;
        setUploadingMp3(false);
      }

      const response = await fetch(`/api/hinos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          lyrics,
          mp3Url,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update hymn');
      }

      toast.success('Hino atualizado com sucesso!');
      router.push('/app/hinos');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
      setUploadingMp3(false);
    }
  };

  const handleMp3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'audio/mpeg') {
        toast.error('Apenas arquivos MP3 são permitidos');
        return;
      }
      
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast.error('Arquivo muito grande. Máximo: 50MB');
        return;
      }

      setMp3File(file);
    }
  };

  const removeMp3 = () => {
    setMp3File(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
        <div className="relative z-10 space-y-6 p-4 sm:p-6">
          <div className="h-8 bg-slate-200 animate-pulse rounded" />
          <div className="h-64 bg-slate-200 animate-pulse rounded" />
          <div className="h-32 bg-slate-200 animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!hymn) {
    return (
      <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
        <div className="relative z-10 text-center py-8">
          <p className="text-slate-600">Hino não encontrado</p>
          <Link href="/app/hinos">
            <Button className={`mt-4 ${musicalButton('secondary')}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-white to-slate-50">
      <div className="relative z-10 space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/app/hinos">
            <Button className={musicalButton('secondary')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">Editar Hino</h1>
            <p className="text-slate-500">
              Criado por {hymn.createdBy.name} em {new Date(hymn.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving || uploadingMp3}
          className={musicalButton('primary')}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Title */}
        <Card className={musicalCard()}>
          <CardHeader>
            <CardTitle className={musicalText('gradient')}>Título</CardTitle>
            <CardDescription className="text-purple-200">Nome do hino</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título do hino..."
              required
            />
          </CardContent>
        </Card>

        {/* Lyrics */}
        <Card className={musicalCard()}>
          <CardHeader>
            <CardTitle className={musicalText('gradient')}>Letra</CardTitle>
            <CardDescription className="text-purple-200">Use o editor para formatar a letra do hino</CardDescription>
          </CardHeader>
          <CardContent>
            <HymnEditor 
              content={lyrics}
              onChange={setLyrics}
            />
          </CardContent>
        </Card>

        {/* MP3 Upload */}
        <Card className={musicalCard()}>
          <CardHeader>
            <CardTitle className={musicalText('gradient')}>Áudio (MP3)</CardTitle>
            <CardDescription className="text-purple-200">Arquivo de áudio do hino (opcional, máximo 50MB)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hymn.mp3Url && !mp3File && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ Arquivo de áudio atual disponível
                </p>
                <audio controls className="mt-2 w-full">
                  <source src={hymn.mp3Url} type="audio/mpeg" />
                  Seu navegador não suporta áudio.
                </audio>
              </div>
            )}

            {mp3File && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-800 font-medium">
                      Novo arquivo selecionado:
                    </p>
                    <p className="text-sm text-blue-600">{mp3File.name}</p>
                    <p className="text-xs text-blue-500">
                      {(mp3File.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    onClick={removeMp3}
                    className="bg-red-100 text-red-700 hover:bg-red-200 border-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="mp3-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {mp3File || hymn.mp3Url ? 'Selecionar novo arquivo MP3' : 'Clique para selecionar arquivo MP3'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Máximo: 50MB</p>
                </div>
              </Label>
              <input
                id="mp3-upload"
                type="file"
                accept=".mp3,audio/mpeg"
                onChange={handleMp3Change}
                className="hidden"
              />
            </div>

            {uploadingMp3 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  📤 Fazendo upload do arquivo...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}