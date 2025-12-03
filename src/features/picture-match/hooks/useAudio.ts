import { useState, useCallback, useEffect } from 'react';
import { audioManager } from '../../../core/audio/audioPlayer';

interface UseAudioReturn {
    play: (url: string, text?: string) => Promise<void>;
    stop: () => void;
    isPlaying: boolean;
    error: string | null;
    unlockAudio: () => void;
    preload: (url: string) => void;
}

export const useAudio = (): UseAudioReturn => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel(); // Stop any TTS on unmount
        };
    }, []);

    // iOS audio unlock - delegates to audioManager
    const unlockAudio = useCallback(() => {
        audioManager.unlock();
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
            // Use audioManager to play
            await audioManager.play(url);
            setIsPlaying(true);

            // Simulate "ended" event after a reasonable duration
            // (AudioContext doesn't provide ended events easily, so we estimate)
            // For game sounds, they're typically short (< 2 seconds)
            setTimeout(() => {
                setIsPlaying(false);
            }, 2000);
        } catch (err) {
            console.warn('Audio play failed, trying TTS:', err);
            if (text) speakText(text);
        }
    }, [speakText]);

    const stop = useCallback(() => {
        audioManager.stop();
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    }, []);

    const preload = useCallback((url: string) => {
        if (!url) return;
        audioManager.preload(url, url);
    }, []);

    return { play, stop, isPlaying, error, unlockAudio, preload };
};
