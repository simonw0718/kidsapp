//src/features/picture-match/hooks/useGameLogic.ts
import { useState, useEffect, useCallback } from 'react';
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
    const [gameState, setGameState] = useState<GameState>({
        currentQuestion: null,
        options: [],
        status: 'idle',
        selectedId: null,
        score: 0,
    });

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

    const generateQuestion = useCallback(() => {
        const filteredList = getFilteredVocab();

        // If list is empty (shouldn't happen if data is correct), fallback to full list
        const sourceList = filteredList.length > 0 ? filteredList : VOCAB_LIST;

        // Pick a target using weighted selection for adaptive learning
        const target = weightManager.selectByWeight(sourceList, (item) => item.id);

        // Pick 3 distractors
        // Distractors can come from the FULL list to make it a bit more interesting?
        // Or should they be strictly from the same difficulty?
        // Let's keep them from the same difficulty for fairness in Level 1, 
        // but maybe allow full list for Mix?
        // For simplicity and fairness, let's use the same sourceList for distractors.

        const otherItems = sourceList.filter(item => item.id !== target.id);
        const shuffledOthers = [...otherItems].sort(() => 0.5 - Math.random());
        const distractors = shuffledOthers.slice(0, 3);

        // Combine and shuffle options
        const options = [target, ...distractors].sort(() => 0.5 - Math.random());

        setGameState(prev => ({
            ...prev,
            currentQuestion: target,
            options,
            status: 'idle',
            selectedId: null,
        }));

        // Auto-play audio for the new question ONLY if mode is english
        if (target.audio && mode === 'english') {
            play(target.audio, target.word);
        }
    }, [play, getFilteredVocab, mode]);

    // Initial question - regenerate when difficulty changes
    useEffect(() => {
        generateQuestion();
    }, [generateQuestion, difficulty]);

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
