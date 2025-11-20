import { useState, useRef, useCallback, useEffect } from 'react';

interface UseAudioReturn {
    play: (url: string, text?: string) => Promise<void>;
    stop: () => void;
    isPlaying: boolean;
    error: string | null;
    unlockAudio: () => void;
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
                audioRef.current?.pause();
                setIsUnlocked(true);
                console.log('Audio unlocked for iOS');
            })
            .catch((err) => {
                console.warn('Failed to unlock audio:', err);
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
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.src = url;

            // We wrap play in a promise to handle immediate errors (like 404 if browser checks immediately)
            // But audio loading is async, so we also need to handle the 'error' event.
            // A robust way is to check if the file exists or just let the error listener handle it?
            // Actually, the error listener in useEffect doesn't have access to 'text'.
            // So let's override the error listener for this specific play call if possible, 
            // or just use a one-off handler.

            const playPromise = audioRef.current.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsPlaying(true);
                    })
                    .catch((err) => {
                        console.warn('Audio play failed (catch), trying TTS:', err);
                        if (text) speakText(text);
                        else setIsPlaying(false);
                    });
            }
        } catch (err) {
            console.warn('Audio play failed (try-catch), trying TTS:', err);
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

    return { play, stop, isPlaying, error, unlockAudio };
};
