import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioReturn {
    play: (url: string, text?: string) => Promise<void>;
    stop: () => void;
    isPlaying: boolean;
    error: string | null;
    unlockAudio: () => void;
    preload: (url: string) => void;
}

export const useAudio = (): UseAudioReturn => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);

    useEffect(() => {
        // Initialize audio element
        const audio = new Audio();
        audioRef.current = audio;

        const handleEnded = () => setIsPlaying(false);

        // Error handler: if audio file fails, try TTS
        const handleError = (e: Event | string) => {
            console.warn('Audio playback error, attempting TTS fallback:', e);
            // We can't easily trigger TTS here because we don't have the text in this scope
            // So we'll handle the fallback in the play method's catch block or logic
            setIsPlaying(false);
            setError('Failed to play audio');
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.pause();
            audioRef.current = null;
            window.speechSynthesis.cancel(); // Stop any TTS
        };
    }, []);

    // iOS audio unlock - must be called from user interaction
    const unlockAudio = useCallback(() => {
        if (isUnlocked || !audioRef.current) return;

        // Play and immediately pause a silent audio to unlock iOS audio
        audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        audioRef.current.play()
            .then(() => {
                // Add a small delay before pausing to prevent interrupting subsequent play calls
                setTimeout(() => {
                    audioRef.current?.pause();
                    setIsUnlocked(true);
                    console.log('Audio unlocked for iOS');
                }, 100);
            })
            .catch((err) => {
                console.warn('Failed to unlock audio:', err);
                // Still mark as unlocked even if it fails, to avoid repeated attempts
                setIsUnlocked(true);
            });
    }, [isUnlocked]);

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

        if (!audioRef.current) return;

        try {
            const audio = audioRef.current;
            audio.pause();
            audio.currentTime = 0;
            audio.src = url;
            audio.load(); // Explicitly load

            // Create a promise that resolves when audio is ready to play
            const readyToPlay = new Promise<void>((resolve, reject) => {
                const onCanPlay = () => {
                    cleanup();
                    resolve();
                };
                const onError = (e: Event) => {
                    cleanup();
                    reject(e);
                };
                const cleanup = () => {
                    audio.removeEventListener('canplay', onCanPlay);
                    audio.removeEventListener('error', onError);
                };

                audio.addEventListener('canplay', onCanPlay);
                audio.addEventListener('error', onError);

                // Timeout if loading takes too long (e.g. 3 seconds)
                setTimeout(() => {
                    cleanup();
                    reject(new Error('Audio load timeout'));
                }, 3000);
            });

            // Wait for ready or timeout, but don't block indefinitely
            // If it's already ready (readyState >= 3), the event might not fire if we missed it,
            // so check readyState too.
            if (audio.readyState >= 3) {
                // Already ready
            } else {
                await readyToPlay;
            }

            const playPromise = audio.play();
            if (playPromise !== undefined) {
                await playPromise;
                setIsPlaying(true);
            }
        } catch (err) {
            console.warn('Audio play failed, trying TTS:', err);
            if (text) speakText(text);
        }
    }, [speakText]);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        window.speechSynthesis.cancel();
        setIsPlaying(false);
    }, []);

    const preload = useCallback((url: string) => {
        if (!url) return;
        const audio = new Audio();
        audio.src = url;
        audio.load();
    }, []);

    return { play, stop, isPlaying, error, unlockAudio, preload };
};
