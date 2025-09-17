# Sistema de Player de Áudio e Letras - Ensaios Igreja

## 🎵 Funcionalidades do Novo Player

### Player Principal (Estilo Spotify)
O novo player oferece uma experiência moderna e intuitiva:

- **Design Spotify-like** com gradientes e animações suaves
- **Controles avançados**: shuffle, repeat, favoritos
- **Visualização de progresso** com barra interativa
- **Volume ajustável** com slider visual
- **Responsivo** para desktop e mobile

### Sistema de Letras Inteligente

#### 📱 Mobile (Adolescentes)
- **Visualização em tela cheia** otimizada para smartphones
- **Modo escuro/claro** para diferentes ambientes
- **Fonte ajustável** (16px - 32px)
- **Auto-scroll** baseado no progresso da música
- **Controles por toque** (tap para mostrar/ocultar)
- **Destaque do verso atual** com animações

#### 💻 Desktop (Ensaios)
- **Painel lateral** com letras sincronizadas
- **Destaque da linha atual** em tempo real
- **Modo tela cheia** para projeção
- **Timestamps opcionais** para sincronização precisa
- **Scroll automático** seguindo a música

#### 🎓 Modo Ensaio (Professor)
- **Interface dedicada** para condução de ensaios
- **Modo Professor/Aluno** com diferentes visualizações
- **Destaque do verso atual** para todos acompanharem
- **Progresso visual** do ensaio
- **Preview do próximo hino**

## 🛠️ Componentes Criados

### 1. `SpotifyPlayer` - Player Principal
```tsx
// Uso básico
<SpotifyPlayer
  tracks={tracksWithLyrics}
  currentTrackIndex={0}
  onTrackChange={handleTrackChange}
  autoPlay={true}
/>
```

### 2. `SyncedLyricsDisplay` - Letras Sincronizadas (Desktop)
```tsx
// Letras com sincronização
<SyncedLyricsDisplay
  hymn={{
    id: "hymn-1",
    title: "Título do Hino",
    lyrics: "<html>Letra do hino...</html>",
    artist: "Compositor"
  }}
  currentTime={currentTime}
  isVisible={true}
  isPlaying={true}
  onClose={handleClose}
/>
```

### 3. `MobileLyricsViewer` - Visualizador Mobile
```tsx
// Interface otimizada para mobile
<MobileLyricsViewer
  hymn={hymnData}
  currentTime={currentTime}
  isVisible={showLyrics}
  isPlaying={isPlaying}
  onClose={handleClose}
/>
```

### 4. `RehearsalPlayer` - Interface de Ensaio
```tsx
// Player para ensaios com múltiplos hinos
<RehearsalPlayer
  hymns={rehearsalHymns}
  currentHymnIndex={currentIndex}
  onHymnChange={setCurrentIndex}
  isPlaying={isPlaying}
  onTogglePlay={togglePlay}
  showLyrics={true}
/>
```

## 🎯 Como Usar nos Ensaios

### Para Adolescentes:
1. **Abra o hino** no dispositivo mobile
2. **Toque no ícone de letra** (🎤) para abrir a visualização
3. **Use gestos** para ajustar fonte e modo
4. **Acompanhe** o destaque automático dos versos

### Para Professores:
1. **Ative o modo Professor** no player de ensaio
2. **Use o controle central** para navegar entre hinos
3. **Observe o destaque** que os alunos estão vendo
4. **Ajuste a fonte** conforme necessário para a turma

### Para Estudo em Casa:
1. **Abra qualquer hino** com áudio
2. **Clique em reproduzir** para usar o player global
3. **Ative as letras** com o botão 🎤
4. **Use tela cheia** para melhor experiência

## ⚙️ Configurações e Personalizações

### Controles de Teclado (Desktop):
- `ESC` - Fechar letras
- `+/-` - Ajustar fonte
- `Ctrl+F` - Alternar tela cheia
- `S` - Ativar/desativar auto-scroll
- `T` - Mostrar/ocultar timestamps

### Gestos Mobile:
- **Toque simples** - Mostrar/ocultar controles
- **Pinch** - Ajustar zoom (futuro)
- **Swipe vertical** - Scroll manual

## 🔧 Integração Técnica

### Interface Track Atualizada:
```typescript
interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  lyrics?: string; // Novo campo para letras
}
```

### Hook useHymnPlayer Atualizado:
```typescript
// Agora inclui letras automaticamente
const { playHymn } = useHymnPlayer();

playHymn({
  id: "hymn-1",
  title: "Título",
  lyrics: "Letra HTML...", // Incluída automaticamente
  mp3Url: "url-do-audio",
  createdBy: { name: "Compositor" }
});
```

### Context AudioPlayer Expandido:
- `currentTime` - Tempo atual para sincronização
- `showLyrics` - Estado das letras
- `toggleLyrics()` - Alternar visualização

## 🎨 Estilos e Temas

### Cores Principais:
- **Player**: Gradiente escuro (Spotify-like)
- **Letras Mobile**: Modo escuro/claro alternável
- **Ensaio**: Azul índigo com acentos amarelos
- **Destaques**: Amarelo para verso atual

### Animações:
- **Transições suaves** (duration-300/500)
- **Pulse** para elementos ativos
- **Scale** para destaque de versos
- **Glow** para linha atual

## 📱 Responsividade

### Breakpoints:
- **Mobile** (< 768px): Interface simplificada
- **Tablet** (768px - 1024px): Layout adaptativo
- **Desktop** (> 1024px): Interface completa

### Otimizações Mobile:
- **Touch targets** maiores (min 44px)
- **Fonte base** maior (20px vs 16px)
- **Controles simplificados**
- **Gestos intuitivos**

## 🚀 Benefícios para os Ensaios

### Para Adolescentes:
- ✅ **Interface familiar** (estilo Spotify)
- ✅ **Letras sempre visíveis** e sincronizadas
- ✅ **Fácil de usar** no smartphone
- ✅ **Acompanhamento visual** do progresso

### Para Professores:
- ✅ **Controle total** do ensaio
- ✅ **Visualização clara** do que os alunos veem
- ✅ **Navegação rápida** entre hinos
- ✅ **Feedback visual** em tempo real

### Para Estudo Individual:
- ✅ **Player sempre disponível** na parte inferior
- ✅ **Letras em tela cheia** para leitura
- ✅ **Sincronização automática** com o áudio
- ✅ **Controles de acessibilidade** (fonte, tema)

## 🔄 Próximas Melhorias

### Planejadas:
- [ ] **Timestamps reais** para sincronização precisa
- [ ] **Marcação de favoritos** persistente
- [ ] **Playlists colaborativas** para ensaios
- [ ] **Modo karaokê** com destaque de palavras
- [ ] **Compartilhamento** de letras via QR Code
- [ ] **Offline mode** para hinos baixados

### Possíveis:
- [ ] **Reconhecimento de voz** para sincronização
- [ ] **Tradução automática** das letras
- [ ] **Anotações** nos hinos
- [ ] **Gravação** de ensaios
- [ ] **Analytics** de uso dos hinos

---

Este sistema foi desenvolvido especificamente para melhorar a experiência dos ensaios, focando na facilidade de uso para adolescentes e controle para professores. A interface moderna e intuitiva torna o acompanhamento das letras uma experiência agradável e eficiente! 🎵✨