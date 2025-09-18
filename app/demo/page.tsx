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
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          🎵 Sistema de Sincronização FODA 🔥
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Sistema completo de sincronização automática de letras com IA, 
          persistência no banco de dados e player avançado para ensaios musicais
        </p>
      </div>

      {/* Funcionalidades */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-2 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 IA Automática
            </CardTitle>
            <CardDescription>
              Análise de áudio com Web Audio API para detectar padrões e sincronizar automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Detecção de pausas e intensidade</li>
              <li>• Análise RMS em tempo real</li>
              <li>• Mapeamento inteligente letra-áudio</li>
              <li>• Sistema de confiança adaptativo</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💾 Persistência Total
            </CardTitle>
            <CardDescription>
              Sistema completo de banco de dados com APIs REST e validação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Timestamps salvos no PostgreSQL</li>
              <li>• APIs REST com validação Zod</li>
              <li>• Histórico de sincronizações</li>
              <li>• Controle de qualidade automático</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎮 Player Avançado
            </CardTitle>
            <CardDescription>
              Interface moderna com recursos profissionais para ensaios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Navegação por linhas da música</li>
              <li>• Modo karaokê com destacamento</li>
              <li>• Auto-scroll sincronizado</li>
              <li>• Indicadores de qualidade visuais</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              ⚡ Performance
            </CardTitle>
            <CardDescription>
              Otimizado para funcionar perfeitamente em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Processamento assíncrono</li>
              <li>• Cache de sincronizações</li>
              <li>• Lazy loading inteligente</li>
              <li>• Responsivo mobile-first</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 Ferramentas Pro
            </CardTitle>
            <CardDescription>
              Editor visual completo para ajustes manuais precisos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Timeline interativa</li>
              <li>• Controles de timestamp precisos</li>
              <li>• Preview em tempo real</li>
              <li>• Validação de qualidade</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 Para Adolescentes
            </CardTitle>
            <CardDescription>
              Interface intuitiva e divertida para jovens músicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Design moderno tipo Spotify</li>
              <li>• Feedback visual imediato</li>
              <li>• Gamificação com scores</li>
              <li>• Tutorial integrado</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Player Demo */}
      <Card className="border-2 border-indigo-300">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🎵 Player Demonstração
          </CardTitle>
          <CardDescription className="text-center">
            Exemplo completo com todas as funcionalidades integradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdvancedLyricsPlayer
            hymnId={sampleHymn.id}
            audioUrl={sampleHymn.mp3Url}
            onOpenSyncEditor={() => alert('Editor de sincronização seria aberto aqui!')}
            className="max-w-4xl mx-auto"
          />
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-indigo-600">5+</div>
          <div className="text-sm text-gray-600">Componentes Avançados</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-600">APIs REST Completas</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-purple-600">2</div>
          <div className="text-sm text-gray-600">Hooks Especializados</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-bold text-yellow-600">100%</div>
          <div className="text-sm text-gray-600">TypeScript</div>
        </Card>
      </div>

      {/* Rodapé */}
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg font-medium">
          🚀 Sistema FODA implementado com sucesso! 
        </p>
        <p className="text-sm mt-2">
          Pronto para revolucionar os ensaios musicais com IA e tecnologia de ponta
        </p>
      </div>
    </div>
  );
}