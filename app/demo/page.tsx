'use client';

import { AdvancedLyricsPlayer } from '@/components/audio/advanced-lyrics-player';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LyricsSyncDemo() {
  // Dados de exemplo para demonstração
  const sampleHymn = {
    id: 'sample-hymn-1',
    title: 'Amazing Grace',
    lyrics: `Amazing grace! How sweet the sound
That saved a wretch like me!
I once was lost, but now am found;
Was blind, but now I see.

'Twas grace that taught my heart to fear,
And grace my fears relieved;
How precious did that grace appear
The hour I first believed.`,
    mp3Url: '/sample-audio.mp3'
  };

  return (
    <div className="min-h-screen relative">
      {/* Background Musical Epic */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=1920&h=1080&fit=crop&crop=center')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/90 to-pink-900/90"></div>
        <div className="absolute inset-0 backdrop-blur-sm"></div>
        
        {/* Efeitos animados */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </div>
      
      {/* Conteúdo */}
      <div className="relative z-10 container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-lg">
            🎵 Sistema de Sincronização FODA 🔥
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto backdrop-blur-sm bg-white/10 rounded-lg p-4 border border-white/20">
            Sistema completo de sincronização automática de letras com IA, 
            persistência no banco de dados e player avançado para ensaios musicais
          </p>
        </div>

        {/* Funcionalidades */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-white/15 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                🤖 IA Automática
              </CardTitle>
              <CardDescription className="text-gray-200">
                Análise de áudio com Web Audio API para detectar padrões e sincronizar automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-gray-300">
              <li>• Detecção de pausas e intensidade</li>
              <li>• Análise RMS em tempo real</li>
              <li>• Mapeamento inteligente letra-áudio</li>
              <li>• Sistema de confiança adaptativo</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-white/15 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              💾 Persistência Total
            </CardTitle>
            <CardDescription className="text-gray-200">
              Sistema completo de banco de dados com APIs REST e validação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Timestamps salvos no PostgreSQL</li>
              <li>• APIs REST com validação Zod</li>
              <li>• Histórico de sincronizações</li>
              <li>• Controle de qualidade automático</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-white/15 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              🎮 Player Avançado
            </CardTitle>
            <CardDescription className="text-gray-200">
              Interface moderna com recursos profissionais para ensaios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Navegação por linhas da música</li>
              <li>• Modo karaokê com destacamento</li>
              <li>• Auto-scroll sincronizado</li>
              <li>• Indicadores de qualidade visuais</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-white/15 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              ⚡ Performance
            </CardTitle>
            <CardDescription className="text-gray-200">
              Otimizado para funcionar perfeitamente em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Processamento assíncrono</li>
              <li>• Cache de sincronizações</li>
              <li>• Lazy loading inteligente</li>
              <li>• Responsivo mobile-first</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-white/15 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              🔧 Ferramentas Pro
            </CardTitle>
            <CardDescription className="text-gray-200">
              Editor visual completo para ajustes manuais precisos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Timeline interativa</li>
              <li>• Controles de timestamp precisos</li>
              <li>• Preview em tempo real</li>
              <li>• Validação de qualidade</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl hover:bg-white/15 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              🎯 Para Adolescentes
            </CardTitle>
            <CardDescription className="text-gray-200">
              Interface intuitiva e divertida para jovens músicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Design moderno tipo Spotify</li>
              <li>• Feedback visual imediato</li>
              <li>• Gamificação com scores</li>
              <li>• Tutorial integrado</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Player Demo */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-white">
            🎵 Player Demonstração
          </CardTitle>
          <CardDescription className="text-center text-gray-200">
            Exemplo completo com todas as funcionalidades integradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedLyricsPlayer
            hymnId={sampleHymn.id}
            audioUrl={sampleHymn.mp3Url}
            onOpenSyncEditor={() => {
              if (typeof window !== 'undefined') {
                alert('Editor de sincronização seria aberto aqui!');
              }
            }}
            className="max-w-4xl mx-auto"
          />
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="text-center p-4 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">5+</div>
          <div className="text-sm text-gray-200">Componentes Avançados</div>
        </Card>
        <Card className="text-center p-4 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">3</div>
          <div className="text-sm text-gray-200">APIs REST Completas</div>
        </Card>
        <Card className="text-center p-4 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">2</div>
          <div className="text-sm text-gray-200">Hooks Especializados</div>
        </Card>
        <Card className="text-center p-4 bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">100%</div>
          <div className="text-sm text-gray-200">TypeScript</div>
        </Card>
      </div>

      {/* Rodapé */}
      <div className="text-center py-8">
        <p className="text-lg font-medium text-white drop-shadow-lg">
          🚀 Sistema FODA implementado com sucesso! 
        </p>
        <p className="text-sm mt-2 text-gray-200">
          Pronto para revolucionar os ensaios musicais com IA e tecnologia de ponta
        </p>
      </div>
      </div>
    </div>
  );
}