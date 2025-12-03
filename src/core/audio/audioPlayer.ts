// src/core/audio/audioPlayer.ts

class AudioManager {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private isUnlocked: boolean = false;

  constructor() {
    // Initialize AudioContext lazily or on demand
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.context = new AudioContextClass();
      }

      // iOS PWA Stability: Resume context when app returns to foreground
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.context?.state === 'suspended') {
          this.context.resume().then(() => {
            console.log('AudioContext resumed on visibility change');
          }).catch(console.error);
        }
      });

    } catch (e) {
      console.error('Web Audio API not supported:', e);
    }
  }

  /**
   * Unlocks the AudioContext on iOS/Android by playing a silent buffer.
   * Should be called on the first user interaction (click/touch).
   */
  public unlock = () => {
    if (this.isUnlocked || !this.context) return;

    if (this.context.state === 'suspended') {
      this.context.resume().then(() => {
        this.isUnlocked = true;
        console.log('AudioContext resumed and unlocked');
      }).catch(err => {
        console.error('Failed to resume AudioContext:', err);
      });
    } else {
      // Create and play a silent buffer to force unlock
      const buffer = this.context.createBuffer(1, 1, 22050);
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.context.destination);
      source.start(0);
      this.isUnlocked = true;
      console.log('AudioContext unlocked via silent buffer');
    }
  };

  /**
   * Preloads an audio file and decodes it into an AudioBuffer.
   */
  public async preload(id: string, url: string): Promise<void> {
    if (this.buffers.has(id)) return;
    if (!this.context) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
      this.buffers.set(id, audioBuffer);
      console.log(`Audio loaded: ${id}`);
    } catch (error) {
      console.error(`Failed to load audio ${id}:`, error);
    }
  }

  /**
   * Plays a sound by ID.
   * @param id The ID of the preloaded sound.
   * @param volume Volume from 0.0 to 1.0 (default 1.0).
   */
  public async play(id: string, volume: number = 1.0) {
    if (!this.context) return;

    // Auto-unlock if not yet unlocked (though browser might block it if not in user event)
    if (this.context.state === 'suspended') {
      this.context.resume();
    }

    let buffer = this.buffers.get(id);
    if (!buffer) {
      // Attempt to auto-load if the ID looks like a file path
      if (id.startsWith('/') || id.startsWith('http')) {
        try {
          // Use the ID as the URL
          await this.preload(id, id);
          buffer = this.buffers.get(id);
        } catch (e) {
          console.warn(`Failed to auto-load audio: ${id}`, e);
          return;
        }
      } else {
        console.warn(`Audio not found: ${id}`);
        return;
      }
    }

    if (!buffer) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.context.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.context.destination);

    source.start(0);
  }

  /**
   * Stop method (placeholder - AudioContext doesn't support stopping all sources easily).
   * Individual sources stop automatically when they finish playing.
   */
  public stop() {
    // AudioContext doesn't have a global stop for all sources
    // Sources stop automatically when buffer ends
    // This is a no-op for compatibility
  }
}

export const audioManager = new AudioManager();

