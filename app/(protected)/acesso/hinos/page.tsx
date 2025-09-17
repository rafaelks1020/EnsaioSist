'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Music, Search, Volume2, Play, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useHymnPlayer } from '@/hooks/use-audio-player';

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

export default function AcessoHinosPage() {
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [filteredHymns, setFilteredHymns] = useState<Hymn[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedHymn, setExpandedHymn] = useState<string | null>(null);
  const [showLyricsPanel, setShowLyricsPanel] = useState(false);
  const [currentPlayingHymn, setCurrentPlayingHymn] = useState<Hymn | null>(null);
  const [lyricsPanelSize, setLyricsPanelSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { playHymn, isVisible } = useHymnPlayer();

  const fetchHymns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/hinos');
      if (!response.ok) throw new Error('Failed to fetch hymns');

      const data = await response.json();
      setHymns(data.hymns);
      setFilteredHymns(data.hymns);
    } catch (error) {
      toast.error('Erro ao carregar hinos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHymns();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredHymns(hymns);
    } else {
      const filtered = hymns.filter(hymn =>
        hymn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hymn.lyrics.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredHymns(filtered);
    }
  }, [searchTerm, hymns]);

  const toggleExpandHymn = (hymnId: string) => {
    setExpandedHymn(expandedHymn === hymnId ? null : hymnId);
  };

  const playHymnWithLyrics = (hymn: Hymn) => {
    playHymn(hymn);
    setCurrentPlayingHymn(hymn);
    setShowLyricsPanel(true);
    setIsFullscreen(false);
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

  // Function to strip HTML tags and format lyrics for display
  const formatLyrics = (htmlContent: string) => {
    // Basic HTML to text conversion
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded" />
        <div className="h-12 bg-gray-200 animate-pulse rounded" />
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isVisible ? 'pb-32' : ''}`}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hinos</h1>
        <p className="text-gray-600">Consulte a letra e áudio dos hinos</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por título ou letra..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Hymns List */}
      {filteredHymns.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Music className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>
                {searchTerm ? 'Nenhum hino encontrado com esse termo' : 'Nenhum hino disponível'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredHymns.map((hymn) => (
            <Card key={hymn.id} className="transition-all duration-200 hover:shadow-md">
              <CardHeader 
                className="cursor-pointer"
                onClick={() => toggleExpandHymn(hymn.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                      <Music className="h-5 w-5 text-indigo-600" />
                      {hymn.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Adicionado por {hymn.createdBy.name} em {new Date(hymn.createdAt).toLocaleDateString('pt-BR')}
                    </CardDescription>
                  </div>
                  {hymn.mp3Url && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playHymnWithLyrics(hymn);
                        }}
                        className="flex items-center gap-1 text-sm text-green-600 bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-colors"
                        title="Tocar no Player"
                      >
                        <Play className="h-4 w-4" />
                        Play
                      </button>
                      <a
                        href={hymn.mp3Url}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                        title="Baixar MP3"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                      <Link href={`/acesso/hinos/${hymn.id}`}>
                        <Button
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm px-3 py-1 border border-gray-300 bg-white hover:bg-gray-50"
                          title="Ver Detalhes"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detalhes
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              {expandedHymn === hymn.id && (
                <CardContent className="pt-0">
                  <div className="border-t pt-4 space-y-4">
                    {/* Lyrics */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Letra</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div 
                          className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line"
                          dangerouslySetInnerHTML={{ __html: hymn.lyrics }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Results count */}
      {searchTerm && (
        <div className="text-sm text-gray-500 text-center">
          {filteredHymns.length} hino(s) encontrado(s) para "{searchTerm}"
        </div>
      )}

      {/* Painel de letra fixo que aparece quando toca música */}
      {showLyricsPanel && currentPlayingHymn && (
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