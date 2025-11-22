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

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const generateQuestion = useCallback(() => {
        const { target, options } = pickQuestion();
        if (isMounted.current) {
            setGameState(prev => ({
                ...prev,
                currentQuestion: target,
                options,
                status: 'idle',
                selectedId: null,
            }));
            setIsProcessing(false);
        }
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

    const handleOptionClick = (item: VocabItem) => {
        // Prevent rapid clicks and clicks during processing
        if (gameState.status === 'correct' || isProcessing) return;

        setIsProcessing(true);

        const isCorrect = item.id === gameState.currentQuestion?.id;

        // Update weight for adaptive learning
        if (gameState.currentQuestion) {
            weightManager.updateWeight(gameState.currentQuestion.id, isCorrect);
        }

        if (isCorrect) {
            // Play correct sound with error handling
            const correctAudio = new Audio('/audio/correct_sound.mp3');
            correctAudio.volume = 0.2;
            correctAudio.play()
                .catch(err => console.warn('Failed to play correct sound:', err))
                .finally(() => {
                    // Cleanup audio object
                    correctAudio.src = '';
                });

            if (isMounted.current) {
                setGameState(prev => ({
                    ...prev,
                    status: 'correct',
                    selectedId: item.id,
                    score: prev.score + 1,
                }));
                setIsProcessing(false);
            }
        } else {
            // Play failure sound with error handling
            const failureAudio = new Audio('/audio/failure_sound.mp3');
            failureAudio.volume = 0.2;
            failureAudio.play()
                .catch(err => console.warn('Failed to play failure sound:', err))
                .finally(() => {
                    // Cleanup audio object
                    failureAudio.src = '';
                });

            if (isMounted.current) {
                setGameState(prev => ({
                    ...prev,
                    status: 'incorrect',
                    selectedId: item.id,
                }));
                // Reset processing state after a delay to show feedback
                setTimeout(() => {
                    if (isMounted.current) {
                        setIsProcessing(false);
                    }
                }, 500);
            }
        }
    };

    const nextQuestion = () => {
        generateQuestion();
    };

    const replayAudio = () => {
        // Unlock audio on first user interaction (iOS requirement)
        unlockAudio();

        if (gameState.currentQuestion?.audio) {
            play(gameState.currentQuestion.audio, gameState.currentQuestion.word);
        }
    };

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
