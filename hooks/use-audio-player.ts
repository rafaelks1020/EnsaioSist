import { useAudioPlayer } from '@/contexts/audio-player-context-simple';

interface Hymn {
  id: string;
  title: string;
  lyrics?: string;
  mp3Url?: string;
  createdBy: {
    name: string;
  };
}

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  lyrics?: string;
}

export function useHymnPlayer() {
  const audioPlayer = useAudioPlayer();

  const playHymn = (hymn: Hymn) => {
    if (!hymn.mp3Url) {
      alert('Este hino não possui áudio disponível');
      return;
    }

    const track: Track = {
      id: hymn.id,
      title: hymn.title,
      artist: hymn.createdBy.name,
      url: hymn.mp3Url,
      lyrics: hymn.lyrics
    };

    audioPlayer.setCurrentTrack(track);
    audioPlayer.play();
  };

  const playHymns = (hymns: Hymn[], startIndex: number = 0) => {
    const tracksWithAudio = hymns.filter(h => h.mp3Url);
    
    if (tracksWithAudio.length === 0) {
      alert('Nenhum hino possui áudio disponível');
      return;
    }

    const tracks: Track[] = tracksWithAudio.map(h => ({
      id: h.id,
      title: h.title,
      artist: h.createdBy.name,
      url: h.mp3Url!,
      lyrics: h.lyrics
    }));

    const adjustedIndex = Math.min(startIndex, tracks.length - 1);
    // Para múltiplas faixas, por enquanto vamos tocar só a primeira
    audioPlayer.setCurrentTrack(tracks[adjustedIndex]);
    audioPlayer.play();
  };

  return {
    playHymn,
    playHymns,
    ...audioPlayer
  };
}

export function usePlaylistPlayer() {
  const audioPlayer = useAudioPlayer();

  interface PlaylistHymn {
    hymn: Hymn;
    order: number;
  }

  const playPlaylist = (playlistItems: PlaylistHymn[], startIndex: number = 0) => {
    const sortedItems = playlistItems.sort((a, b) => a.order - b.order);
    const tracksWithAudio = sortedItems.filter(item => item.hymn.mp3Url);
    
    if (tracksWithAudio.length === 0) {
      alert('Esta playlist não possui hinos com áudio');
      return;
    }

    const tracks: Track[] = tracksWithAudio.map(item => ({
      id: item.hymn.id,
      title: item.hymn.title,
      artist: item.hymn.createdBy.name,
      url: item.hymn.mp3Url!,
      lyrics: item.hymn.lyrics
    }));

    const adjustedIndex = Math.min(startIndex, tracks.length - 1);
    // Para múltiplas faixas, por enquanto vamos tocar só a primeira
    audioPlayer.setCurrentTrack(tracks[adjustedIndex]);
    audioPlayer.play();
  };

  const playPlaylistHymn = (playlistItems: PlaylistHymn[], hymnId: string) => {
    const sortedItems = playlistItems.sort((a, b) => a.order - b.order);
    const tracksWithAudio = sortedItems.filter(item => item.hymn.mp3Url);
    
    if (tracksWithAudio.length === 0) {
      alert('Esta playlist não possui hinos com áudio');
      return;
    }

    const targetIndex = tracksWithAudio.findIndex(item => item.hymn.id === hymnId);
    if (targetIndex === -1) {
      alert('Este hino não possui áudio disponível');
      return;
    }

    playPlaylist(playlistItems, targetIndex);
  };

  return {
    playPlaylist,
    playPlaylistHymn,
    ...audioPlayer
  };
}