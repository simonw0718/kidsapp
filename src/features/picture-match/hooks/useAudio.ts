import { useState, useCallback, useEffect, useRef } from 'react';
import { audioManager } from '../../core/audio/audioPlayer';

interface UseAudioReturn {
    play: (url: string, text?: string) => Promise<void>;
    stop: () => void;
    isPlaying: boolean;
    error: string | null;
    unlockAudio: () => void;
    preload: (url: string) => void;
}

// Track active audio instances for cleanup
const activeAudioInstances: HTMLAudioElement[] = [];

// Helper function to play audio with HTMLAudioElement (iOS-friendly)
const playAudioElement = (audio: HTMLAudioElement, maxDuration: number = 3000) => {
    const sound = audio.cloneNode() as HTMLAudioElement;
    // Use master volume from audioManager
    sound.volume = audioManager.getVolume();

    // Track this instance
    activeAudioInstances.push(sound);

    // Play the sound
    sound.play().catch(e => console.warn('Audio play failed:', e));

    // Stop after max duration and cleanup
    const timeoutId = setTimeout(() => {
        sound.pause();
        sound.currentTime = 0;
        const index = activeAudioInstances.indexOf(sound);
        if (index > -1) {
            activeAudioInstances.splice(index, 1);
        }
    }, maxDuration);

    // Also cleanup when sound ends naturally
    sound.addEventListener('ended', () => {
        clearTimeout(timeoutId);
        const index = activeAudioInstances.indexOf(sound);
        if (index > -1) {
            activeAudioInstances.splice(index, 1);
        }
    });
};

// Helper to stop all active audio
const stopAllAudio = () => {
    activeAudioInstances.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
    });
    activeAudioInstances.length = 0;
};

export const useAudio = (): UseAudioReturn => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cache for preloaded audio elements
    const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel(); // Stop any TTS on unmount
            stopAllAudio(); // Stop all audio on unmount
        };
    }, []);

    // iOS audio unlock - play a silent sound to unlock
    const unlockAudio = useCallback(() => {
        // Create and play a silent audio element
        const silentAudio = new Audio();
        silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        silentAudio.play().catch(() => {
            console.log('Audio unlock attempted');
        });
    }, []);

    const speakText = useCallback((text: string) => {
        if (!window.speechSynthesis) {
            console.warn('TTS not supported');
            return;
        }

        window.speechSynthesis.cancel(); // Stop previous
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US'; // Default to English for now
        utterance.rate = 0.9; // Slightly slower for kids

        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = (e) => {
            console.error('TTS Error:', e);
            setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const play = useCallback(async (url: string, text?: string) => {
        // Reset state
        setError(null);
        setIsPlaying(false);
        window.speechSynthesis.cancel();

        // If no URL is provided, go straight to TTS
        if (!url && text) {
            speakText(text);
            return;
        }

        try {
            // Get or create audio element
            let audioElement = audioCache.current.get(url);
            if (!audioElement) {
                audioElement = new Audio(url);
                audioCache.current.set(url, audioElement);
            }

            // Play using HTMLAudioElement
            playAudioElement(audioElement);
            setIsPlaying(true);

            // Reset playing state after audio duration
            setTimeout(() => {
                setIsPlaying(false);
            }, 2000);
        } catch (err) {
            console.warn('Audio play failed, trying TTS:', err);
            setError('Audio playback failed');
            if (text) speakText(text);
        }
    }, [speakText]);

    const stop = useCallback(() => {
        stopAllAudio();
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    }, []);

    const preload = useCallback((url: string) => {
        if (!url) return;
        if (!audioCache.current.has(url)) {
            const audio = new Audio(url);
            audio.preload = 'auto';
            audioCache.current.set(url, audio);
        }
    }, []);

    return { play, stop, isPlaying, error, unlockAudio, preload };
};
