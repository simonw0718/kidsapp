//src/features/picture-match/hooks/useGameLogic.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { VOCAB_LIST } from '../data/vocab';
import type { VocabItem, DifficultyLevel } from '../data/vocab';
import { useAudio } from './useAudio';
import { weightManager } from '../../../core/learning/weightManager';

export type GameDifficulty = DifficultyLevel | 'mix' | 'dinosaur';

export const useGameLogic = (difficulty: GameDifficulty = 1, mode: 'english' | 'zhuyin' | 'dinosaur' = 'english') => {
    // Old useState removed - Fixed duplicate declaration

    const { play, isPlaying, unlockAudio } = useAudio();

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

    // History of ALL used questions in this round to prevent repeats
    const roundHistory = useRef<Set<string>>(new Set());

    // Dummy "Ready GO" question for iOS audio unlock
    const READY_GO_QUESTION: VocabItem = {
        id: 'ready-go',
        word: 'Ready Go',
        chinese: '準備開始',
        zhuyin: '',
        image: '/images/picture-match/ready-go.png',
        audio: '', // No audio for this dummy question
        difficulty: 0 as any, // Cast to avoid type error
        category: 'system' as any // Cast to avoid type error
    };

    // Pure-ish function to pick a question
    const pickQuestion = useCallback(() => {
        const filteredList = getFilteredVocab();
        // If filtered list is empty (e.g. error), fallback to full list
        const sourceList = filteredList.length > 0 ? filteredList : VOCAB_LIST;

        // Debug logging
        console.log('[DEBUG] Difficulty:', difficulty);
        console.log('[DEBUG] Filtered list size:', filteredList.length);
        console.log('[DEBUG] Source list size:', sourceList.length);
        console.log('[DEBUG] Round history size:', roundHistory.current.size);

        // Safety check: ensure we have vocab items
        if (!sourceList || sourceList.length === 0) {
            console.error('No vocabulary items available');
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

        // Just blindly return first item if we really don't have enough data
        if (sourceList.length < 4) {
            console.warn('Not enough vocabulary items, using all available');
            const target = sourceList[0];
            return { target, options: sourceList };
        }

        // 1. Identify available TARGETS (items not yet used as target)
        // Convert Set to Array for filtering
        const availableTargets = sourceList.filter(item => !roundHistory.current.has(item.id));

        console.log(`[DEBUG] Available targets: ${availableTargets.length}/${sourceList.length}`);

        // If we ran out of unique targets, reset history or fallback to full list
        // Strategy: Fallback to full list but keep history (so we start repeating only when necessary)
        // OR: Just pick from full list if we really have to.
        let selectionPool = availableTargets;
        if (availableTargets.length === 0) {
            console.warn('[DEBUG] Round history exhausted! Resetting or looping.');
            // Optional: roundHistory.current.clear(); 
            // For now, let's just use the full sourceList so the game continues but repeats.
            selectionPool = sourceList;
        }

        // 2. Pick a Target
        const target = weightManager.selectByWeight(selectionPool, (item) => item.id);

        // 3. Pick Distractors (Options)
        // Options can come from the ENTIRE sourceList, not just unused ones.
        // It makes the game harder if distractors reappear, which is fine.
        const potentialDistractors = sourceList.filter(item => item.id !== target.id);
        const shuffledDistractors = [...potentialDistractors].sort(() => 0.5 - Math.random());
        const distractors = shuffledDistractors.slice(0, 3);

        const options = [target, ...distractors].sort(() => 0.5 - Math.random());

        // Debug logging for selected items
        console.log(`[DEBUG] Target: "${target.word}" (Diff: ${target.difficulty})`);

        return { target, options };
    }, [getFilteredVocab, difficulty]);

    // Game state
    const [currentQuestion, setCurrentQuestion] = useState<VocabItem | null>(null);
    const [options, setOptions] = useState<VocabItem[]>([]);
    const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [results, setResults] = useState<boolean[]>([]);
    const [isGameFinished, setIsGameFinished] = useState(false);

    // Initialize game with Ready GO question
    useEffect(() => {
        // Start with Ready GO question
        setCurrentQuestion(READY_GO_QUESTION);
        setOptions([READY_GO_QUESTION]); // Only one option for Ready GO
        setQuestionIndex(0);
        setScore(0);
        setResults([]);
        setIsGameFinished(false);
        setStatus('idle');
        setSelectedId(null);
        // Clear history
        roundHistory.current.clear();
    }, [difficulty, mode]); // Reset when difficulty/mode changes

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

    // Track if user has attempted current question
    const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false);

    // Track if game has started to prevent double audio playback
    const gameStartedRef = useRef(false);

    // Auto-play audio when question changes (but not on initial load)
    useEffect(() => {
        // Only auto-play if game has started AND it's not the first real question (which is handled manually by startGame)
        // AND it's not the Ready GO question
        if (gameStartedRef.current && currentQuestion?.audio && mode === 'english' && !isGameFinished) {
            if (currentQuestion.id !== 'ready-go') {
                // We need to check if this is the "first real question" which was already played by startGame
                // But since startGame sets gameStartedRef to true, we might double play if we don't be careful.
                // However, startGame plays audio THEN sets state. This effect runs AFTER state update.
                // To avoid double play on the very first question, we can use a flag or check index.

                // Actually, simpler: startGame plays audio. This effect runs. 
                // We can just rely on the fact that startGame handles the first one.
                // But how do we prevent this effect from running for the first one?
                // We can check if we just transitioned from Ready GO.

                // Let's use a ref to track if we should skip next auto-play
                if (shouldSkipNextAutoPlay.current) {
                    shouldSkipNextAutoPlay.current = false;
                    return;
                }

                play(currentQuestion.audio, currentQuestion.word);
            }
        }
    }, [currentQuestion, mode, play, isGameFinished]);

    const shouldSkipNextAutoPlay = useRef(false);

    const restartGame = useCallback(() => {
        // Restart with Ready GO
        setCurrentQuestion(READY_GO_QUESTION as any);
        setOptions([READY_GO_QUESTION as any]);
        // Set index to -1 so progress bar shows 0/10 or hidden
        setQuestionIndex(-1);
        setScore(0);
        setResults([]);
        setIsGameFinished(false);
        setStatus('idle');
        setSelectedId(null);
        roundHistory.current.clear();
        setIsProcessing(false);
        setHasAnsweredCurrent(false);
        gameStartedRef.current = false;
        shouldSkipNextAutoPlay.current = false;
    }, []);

    const isFirstRun = useRef(true);
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        // Reset game when difficulty changes
        restartGame();
    }, [difficulty, restartGame]);

    const handleOptionClick = useCallback(async (item: VocabItem) => {
        // Prevent rapid clicks and clicks during processing
        if (status === 'correct' || isProcessing || isGameFinished) {
            return;
        }

        // Special handling for Ready GO question - SHOULD NOT BE REACHED via this handler anymore
        // because we will use a dedicated startGame function, but keeping as fallback
        if (currentQuestion?.id === 'ready-go') {
            startGame();
            return;
        }

        setIsProcessing(true);
        console.log('Option clicked:', item.word);

        try {
            const isCorrect = item.id === currentQuestion?.id;

            // Update weight for adaptive learning
            if (currentQuestion) {
                weightManager.updateWeight(currentQuestion.id, isCorrect);
            }

            // Strict scoring: only record result on first attempt for this question
            if (!hasAnsweredCurrent) {
                setResults(prev => [...prev, isCorrect]);
                setHasAnsweredCurrent(true);
                if (isCorrect) {
                    setScore(prev => prev + 1);
                }
            }

            setSelectedId(item.id);

            if (isCorrect) {
                // Play correct sound
                play('/audio/correct_sound.mp3');
                setStatus('correct');
                setIsProcessing(false);
            } else {
                // Play failure sound
                play('/audio/failure_sound.mp3');
                setStatus('incorrect');

                // Reset processing state after a delay to show feedback
                setTimeout(() => {
                    setIsProcessing(false);
                }, 300);
            }
        } catch (error) {
            console.error('Error in handleOptionClick:', error);
            setIsProcessing(false);
        }
    }, [status, currentQuestion, isProcessing, isGameFinished, hasAnsweredCurrent, play]);

    const nextQuestion = useCallback(() => {
        if (questionIndex >= 9) {
            setIsGameFinished(true);
            return;
        }

        const { target, options } = pickQuestion();

        // Update history
        roundHistory.current.add(target.id);

        setCurrentQuestion(target);
        setOptions(options);
        setStatus('idle');
        setSelectedId(null);
        setIsProcessing(false);
        setHasAnsweredCurrent(false);
        setQuestionIndex(prev => prev + 1);
    }, [pickQuestion, questionIndex]);

    // New function to synchronously start the game and return the first audio
    const startGame = useCallback(() => {
        // 1. Pick the first real question
        const { target, options } = pickQuestion();

        // 2. Update history
        roundHistory.current.add(target.id);

        // 3. Update state
        setCurrentQuestion(target);
        setOptions(options);
        setStatus('idle');
        setSelectedId(null);
        setIsProcessing(false);
        setHasAnsweredCurrent(false);

        // Set index to 0 (first real question)
        setQuestionIndex(0);

        // Mark game as started
        gameStartedRef.current = true;

        // Flag to skip the useEffect auto-play since we will play it synchronously
        shouldSkipNextAutoPlay.current = true;

        return target;
    }, [pickQuestion]);

    const replayAudio = useCallback(() => {
        // Unlock audio on first user interaction (iOS requirement)
        unlockAudio();

        if (currentQuestion?.audio) {
            play(currentQuestion.audio, currentQuestion.word);
        }
    }, [currentQuestion, unlockAudio, play]);

    const markGameStarted = useCallback(() => {
        gameStartedRef.current = true;
    }, []);

    return {
        currentQuestion,
        options,
        status,
        selectedId,
        score,
        handleOptionClick, // Export as handleSelect to match component expectation
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
        startGame, // Export new function
    };
};
