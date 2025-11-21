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

    const generateQuestion = useCallback(() => {
        const { target, options } = pickQuestion();
        setGameState(prev => ({
            ...prev,
            currentQuestion: target,
            options,
            status: 'idle',
            selectedId: null,
        }));
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
        if (gameState.status === 'correct') return;

        const isCorrect = item.id === gameState.currentQuestion?.id;

        // Update weight for adaptive learning
        if (gameState.currentQuestion) {
            weightManager.updateWeight(gameState.currentQuestion.id, isCorrect);
        }

        if (isCorrect) {
            // Play correct sound
            const correctAudio = new Audio('/audio/correct_sound.mp3');
            correctAudio.volume = 0.2; // 音量控制：0.0 (靜音) ~ 1.0 (最大)，預設 0.5
            correctAudio.play().catch(err => console.warn('Failed to play correct sound:', err));

            setGameState(prev => ({
                ...prev,
                status: 'correct',
                selectedId: item.id,
                score: prev.score + 1,
            }));
        } else {
            // Play failure sound
            const failureAudio = new Audio('/audio/failure_sound.mp3');
            failureAudio.volume = 0.2; // 音量控制：0.0 (靜音) ~ 1.0 (最大)，預設 0.5
            failureAudio.play().catch(err => console.warn('Failed to play failure sound:', err));

            setGameState(prev => ({
                ...prev,
                status: 'incorrect',
                selectedId: item.id,
            }));
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
