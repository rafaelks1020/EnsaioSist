'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/forms/rich-text-editor';
import { Upload, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NovoHinoPage() {
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [mp3File, setMp3File] = useState<File | null>(null);
  const [mp3Url, setMp3Url] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast.error('Por favor, selecione um arquivo de áudio');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Arquivo deve ter no máximo 20MB');
        return;
      }
      setMp3File(file);
    }
  };

  const handleUpload = async () => {
    if (!mp3File) {
      toast.error('Selecione um arquivo MP3 primeiro');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', mp3File);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha no upload');
      }

      const data = await response.json();
      setMp3Url(data.url);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer upload do arquivo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }
    
    if (!lyrics.trim()) {
      toast.error('Letra é obrigatória');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/hinos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          lyrics,
          mp3Url: mp3Url || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar hino');
      }

      toast.success('Hino criado com sucesso!');
      router.push('/app/hinos');
    } catch (error) {
      toast.error('Erro ao criar hino');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/hinos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Hino</h1>
          <p className="text-gray-600">Adicione um novo hino à biblioteca</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>
              Digite o título e a letra do hino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Digite o título do hino..."
                required
              />
            </div>
            
            <div>
              <Label>Letra *</Label>
              <RichTextEditor
                content={lyrics}
                onChange={setLyrics}
                placeholder="Digite a letra do hino..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Arquivo de Áudio</CardTitle>
            <CardDescription>
              Faça upload do arquivo MP3 (opcional, máximo 20MB)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mp3">Arquivo MP3</Label>
              <Input
                id="mp3"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
              />
            </div>
            
            {mp3File && !mp3Url && (
              <Button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Enviando...' : 'Fazer Upload'}
              </Button>
            )}
            
            {mp3Url && (
              <div>
                <Label>Preview</Label>
                <audio controls className="w-full mt-2">
                  <source src={mp3Url} type="audio/mpeg" />
                  Seu navegador não suporta o elemento de áudio.
                </audio>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Hino'}
          </Button>
          <Link href="/app/hinos">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}