type AudioId = string;

const audioCache = new Map<AudioId, HTMLAudioElement>();

export const audioPlayer = {
  preload(id: AudioId, src: string) {
    if (audioCache.has(id)) return;
    const audio = new Audio(src);
    audioCache.set(id, audio);
  },

  play(id: AudioId) {
    const audio = audioCache.get(id);
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play();
  },

  clear() {
    audioCache.clear();
  },
};
