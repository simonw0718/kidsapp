//src/features/picture-match/hooks/useGameLogic.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { VOCAB_LIST } from '../data/vocab';
import type { VocabItem, DifficultyLevel } from '../data/vocab';
import { useAudio } from './useAudio';
import { weightManager } from '../../../core/learning/weightManager';

interface GameState {
    currentQuestion: VocabItem | null;
    options: VocabItem[];
    status: 'idle' | 'correct' | 'incorrect';
    selectedId: string | null;
    score: number;
}

export type GameDifficulty = DifficultyLevel | 'mix' | 'dinosaur';

export const useGameLogic = (difficulty: GameDifficulty = 1, mode: 'english' | 'zhuyin' | 'dinosaur' = 'english') => {
    // Old useState removed - Fixed duplicate declaration

    const { play, isPlaying, unlockAudio } = useAudio();

    const getFilteredVocab = useCallback(() => {
        if (difficulty === 'mix') {
            return VOCAB_LIST;
        }
        if (difficulty === 'dinosaur') {
            return VOCAB_LIST.filter(item => item.category === 'dinosaur');
        }
        return VOCAB_LIST.filter(item => item.difficulty === difficulty);
    }, [difficulty]);

    // Pure-ish function to pick a question
    const pickQuestion = useCallback(() => {
        const filteredList = getFilteredVocab();
        const sourceList = filteredList.length > 0 ? filteredList : VOCAB_LIST;

        // Debug logging
        console.log('[DEBUG] Difficulty:', difficulty);
        console.log('[DEBUG] Filtered list size:', filteredList.length);
        console.log('[DEBUG] Source list size:', sourceList.length);

        // Safety check: ensure we have vocab items
        if (!sourceList || sourceList.length === 0) {
            console.error('No vocabulary items available');
            // Return a fallback question to prevent crash
            return {
                target: {
                    id: 'fallback',
                    word: 'Error',
                    image: '',
                    difficulty: 1,
                    category: 'animal'
                } as VocabItem,
                options: []
            };
        }

        // Ensure we have enough items for the game
        if (sourceList.length < 4) {
            console.warn('Not enough vocabulary items, using all available');
            const target = sourceList[0];
            return { target, options: sourceList };
        }

        const target = weightManager.selectByWeight(sourceList, (item) => item.id);
        const otherItems = sourceList.filter(item => item.id !== target.id);
        const shuffledOthers = [...otherItems].sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 3);
        const options = [target, ...distractors].sort(() => 0.5 - Math.random());

        // Debug logging for selected items
        console.log('[DEBUG] Target:', target.word, 'Difficulty:', target.difficulty);
        console.log('[DEBUG] Options difficulties:', options.map(o => `${o.word}(${o.difficulty})`).join(', '));

        return { target, options };
    }, [getFilteredVocab]);

    const [gameState, setGameState] = useState<GameState>(() => {
        const { target, options } = pickQuestion();
        return {
            currentQuestion: target,
            options,
            status: 'idle',
            selectedId: null,
            score: 0,
        };
    });

    // Add processing lock to prevent rapid clicks
    const [isProcessing, setIsProcessing] = useState(false);

    // Add mounted ref to prevent state updates after unmount
    const isMounted = useRef(true);

    // Preload sound effects for better stability in PWA mode
    const correctSoundRef = useRef<HTMLAudioElement | null>(null);
    const failureSoundRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Preload sound effects
        correctSoundRef.current = new Audio('/audio/correct_sound.mp3');
        failureSoundRef.current = new Audio('/audio/failure_sound.mp3');
        correctSoundRef.current.volume = 0.2;
        failureSoundRef.current.volume = 0.2;

        // Preload audio files to ensure they're ready
        correctSoundRef.current.load();
        failureSoundRef.current.load();

        return () => {
            isMounted.current = false;
            // Cleanup audio objects
            if (correctSoundRef.current) {
                correctSoundRef.current.pause();
                correctSoundRef.current = null;
            }
            if (failureSoundRef.current) {
                failureSoundRef.current.pause();
                failureSoundRef.current = null;
            }
        };
    }, []);

    // Safety reset for isProcessing to prevent stuck state
    useEffect(() => {
        if (isProcessing) {
            const timer = setTimeout(() => {
                if (isMounted.current && isProcessing) {
                    console.warn('Force resetting isProcessing state');
                    setIsProcessing(false);
                }
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isProcessing]);

    const generateQuestion = useCallback(() => {
        const { target, options } = pickQuestion();
        setGameState(prev => ({
            ...prev,
            currentQuestion: target,
            options,
            status: 'idle',
            selectedId: null,
        }));
        setIsProcessing(false);
    }, [pickQuestion]);

    // Initial question - regenerate when difficulty changes
    // Skip first run because useState already initialized it
    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        generateQuestion();
    }, [generateQuestion, difficulty]);

    // Auto-play audio when question changes
    useEffect(() => {
        if (gameState.currentQuestion?.audio && mode === 'english') {
            play(gameState.currentQuestion.audio, gameState.currentQuestion.word);
        }
    }, [gameState.currentQuestion, mode, play]);

    const handleOptionClick = useCallback(async (item: VocabItem) => {
        // Prevent rapid clicks and clicks during processing
        if (gameState.status === 'correct' || isProcessing) {
            console.log('Click ignored: status=', gameState.status, 'isProcessing=', isProcessing);
            return;
        }

        setIsProcessing(true);
        console.log('Option clicked:', item.word);

        try {
            const isCorrect = item.id === gameState.currentQuestion?.id;

            // Update weight for adaptive learning
            if (gameState.currentQuestion) {
                weightManager.updateWeight(gameState.currentQuestion.id, isCorrect);
            }

            if (isCorrect) {
                // Play correct sound (fire and forget)
                if (correctSoundRef.current) {
                    correctSoundRef.current.currentTime = 0;
                    correctSoundRef.current.play()
                        .catch(err => console.warn('Failed to play correct sound:', err));
                }

                setGameState(prev => ({
                    ...prev,
                    status: 'correct',
                    selectedId: item.id,
                    score: prev.score + 1,
                }));
                setIsProcessing(false);
            } else {
                // Play failure sound (fire and forget)
                if (failureSoundRef.current) {
                    failureSoundRef.current.currentTime = 0;
                    failureSoundRef.current.play()
                        .catch(err => console.warn('Failed to play failure sound:', err));
                }

                setGameState(prev => ({
                    ...prev,
                    status: 'incorrect',
                    selectedId: item.id,
                }));

                // Reset processing state after a delay to show feedback
                setTimeout(() => {
                    setIsProcessing(false);
                }, 300); // Reduced delay to 300ms
            }
        } catch (error) {
            console.error('Error in handleOptionClick:', error);
            setIsProcessing(false);
        }
    }, [gameState.status, gameState.currentQuestion, isProcessing]);

    const nextQuestion = useCallback(() => {
        generateQuestion();
    }, [generateQuestion]);

    const replayAudio = useCallback(() => {
        // Unlock audio on first user interaction (iOS requirement)
        unlockAudio();

        if (gameState.currentQuestion?.audio) {
            play(gameState.currentQuestion.audio, gameState.currentQuestion.word);
        }
    }, [gameState.currentQuestion, unlockAudio, play]);

    return {
        ...gameState,
        handleOptionClick,
        nextQuestion,
        replayAudio,
        isPlaying,
        unlockAudio,
        play,
    };
};
