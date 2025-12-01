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

    const { play, isPlaying, unlockAudio, preload } = useAudio();

    const getFilteredVocab = useCallback(() => {
        let filtered: VocabItem[];

        console.log('[FILTER] Difficulty type:', typeof difficulty, 'Value:', difficulty);

        if (difficulty === 'mix') {
            // Mix mode: all non-dinosaur vocab
            filtered = VOCAB_LIST.filter(item => item.category !== 'dinosaur');
            console.log('[FILTER] Mix mode: excluding dinosaurs, total:', filtered.length);
        } else if (difficulty === 'dinosaur') {
            // Dinosaur mode: only dinosaurs
            filtered = VOCAB_LIST.filter(item => item.category === 'dinosaur');
            console.log('[FILTER] Dinosaur mode: only dinosaurs, total:', filtered.length);
        } else {
            // Level 1, 2, 3: filter by difficulty AND exclude dinosaurs
            // Convert difficulty to number for comparison (dropdown returns string)
            const difficultyNum = typeof difficulty === 'string' ? parseInt(difficulty) : difficulty;
            filtered = VOCAB_LIST.filter(item => item.difficulty === difficultyNum && item.category !== 'dinosaur');
            console.log(`[FILTER] Level ${difficultyNum}: excluding dinosaurs, total:`, filtered.length);

            // Debug: check if any dinosaurs slipped through
            const dinosaursInFiltered = filtered.filter(item => item.category === 'dinosaur');
            if (dinosaursInFiltered.length > 0) {
                console.error('[FILTER ERROR] Found dinosaurs in level', difficultyNum, ':', dinosaursInFiltered.map(d => d.word));
            }
        }

        return filtered;
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

    // New state for 10-question game
    const [questionIndex, setQuestionIndex] = useState(0);
    const [results, setResults] = useState<boolean[]>([]); // Track result for each question
    const [isGameFinished, setIsGameFinished] = useState(false);
    const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false); // Track if user has attempted current question

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

        // Preload audio for better stability
        if (target.audio) {
            preload(target.audio);
        }

        setGameState(prev => ({
            ...prev,
            currentQuestion: target,
            options,
            status: 'idle',
            selectedId: null,
        }));
        setIsProcessing(false);
        setHasAnsweredCurrent(false);
    }, [pickQuestion, preload]);

    // Restart game function
    const restartGame = useCallback(() => {
        setQuestionIndex(0);
        setResults([]);
        setIsGameFinished(false);
        setGameState(prev => ({ ...prev, score: 0 }));
        generateQuestion();
    }, [generateQuestion]);

    // Initial question - regenerate when difficulty changes
    // Skip first run because useState already initialized it
    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        // Reset game when difficulty changes
        restartGame();
    }, [difficulty, restartGame]);

    // Track if game has started to prevent double audio playback
    const gameStartedRef = useRef(false);

    // Auto-play audio when question changes (but not on initial load)
    useEffect(() => {
        if (gameStartedRef.current && gameState.currentQuestion?.audio && mode === 'english' && !isGameFinished) {
            play(gameState.currentQuestion.audio, gameState.currentQuestion.word);
        }
    }, [gameState.currentQuestion, mode, play, isGameFinished]);

    const handleOptionClick = useCallback(async (item: VocabItem) => {
        // Prevent rapid clicks and clicks during processing
        if (gameState.status === 'correct' || isProcessing || isGameFinished) {
            console.log('Click ignored: status=', gameState.status, 'isProcessing=', isProcessing, 'isFinished=', isGameFinished);
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

            // Strict scoring: only record result on first attempt for this question
            if (!hasAnsweredCurrent) {
                setResults(prev => [...prev, isCorrect]);
                setHasAnsweredCurrent(true);
                if (isCorrect) {
                    setGameState(prev => ({ ...prev, score: prev.score + 1 }));
                }
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
    }, [gameState.status, gameState.currentQuestion, isProcessing, isGameFinished, hasAnsweredCurrent]);

    const nextQuestion = useCallback(() => {
        if (questionIndex >= 9) {
            setIsGameFinished(true);
        } else {
            setQuestionIndex(prev => prev + 1);
            generateQuestion();
        }
    }, [generateQuestion, questionIndex]);

    const replayAudio = useCallback(() => {
        // Unlock audio on first user interaction (iOS requirement)
        unlockAudio();

        if (gameState.currentQuestion?.audio) {
            play(gameState.currentQuestion.audio, gameState.currentQuestion.word);
        }
    }, [gameState.currentQuestion, unlockAudio, play]);

    const markGameStarted = useCallback(() => {
        gameStartedRef.current = true;
    }, []);

    return {
        ...gameState,
        handleOptionClick,
        nextQuestion,
        replayAudio,
        isPlaying,
        unlockAudio,
        play,
        markGameStarted,
        questionIndex,
        results,
        isGameFinished,
        restartGame,
        totalQuestions: 10,
    };
};
