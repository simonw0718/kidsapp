import React, { useState, useEffect } from 'react';
import { COLORS, type ColorData } from '../data/colors';
import { MIXING_QUESTIONS, getAllMixingColors } from '../data/mixingQuestions';
import { ColorChip } from '../components/ColorChip';

type GameState = 'question' | 'animating' | 'success' | 'failure';

export const ColorMixingGame: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('question');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [options, setOptions] = useState<ColorData[]>([]);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const question = MIXING_QUESTIONS[currentQuestion];
    const colorA = COLORS.find(c => c.id === question.A)!;
    const colorB = COLORS.find(c => c.id === question.B)!;
    const correctResult = COLORS.find(c => c.id === question.result)!;

    // Initialize options for current question
    useEffect(() => {
        generateOptions();
    }, [currentQuestion]);

    const generateOptions = () => {
        const allMixingColorIds = getAllMixingColors();
        const correctId = question.result;

        // Get all possible wrong answers (excluding A, B, and correct result)
        const wrongOptions = allMixingColorIds.filter(
            id => id !== correctId && id !== question.A && id !== question.B
        );

        // Randomly select 2 wrong answers
        const shuffledWrong = [...wrongOptions].sort(() => 0.5 - Math.random());
        const selectedWrong = shuffledWrong.slice(0, 2);

        // Combine with correct answer and shuffle
        const optionIds = [correctId, ...selectedWrong].sort(() => 0.5 - Math.random());
        const optionColors = optionIds.map(id => COLORS.find(c => c.id === id)!);

        setOptions(optionColors);
        setSelectedAnswer(null);
        setGameState('question');
    };

    const handleOptionClick = (colorId: string) => {
        if (gameState !== 'question') return;

        setSelectedAnswer(colorId);
        setGameState('animating');

        // Wait for animation, then show result
        setTimeout(() => {
            if (colorId === question.result) {
                setGameState('success');
            } else {
                setGameState('failure');
            }
        }, 2000);
    };

    const handleNextQuestion = () => {
        const nextIndex = (currentQuestion + 1) % MIXING_QUESTIONS.length;
        setCurrentQuestion(nextIndex);
    };

    const handleRetry = () => {
        setSelectedAnswer(null);
        setGameState('question');
    };

    if (gameState === 'success') {
        return (
            <div className="cl-mixing-success">
                <div className="cl-success-icon">🎉</div>
                <h3>答對了！</h3>
                <div className="cl-mixing-result-display">
                    <ColorChip color={colorA} size={60} />
                    <span className="cl-mixing-plus">+</span>
                    <ColorChip color={colorB} size={60} />
                    <span className="cl-mixing-equals">=</span>
                    <ColorChip color={correctResult} size={80} showLabel={true} />
                </div>
                <button onClick={handleNextQuestion} className="cl-retry-btn">
                    下一題
                </button>
            </div>
        );
    }

    if (gameState === 'failure') {
        return (
            <div className="cl-mixing-failure">
                <div className="cl-failure-icon">😅</div>
                <h3>再試一次！</h3>
                <div className="cl-mixing-result-display">
                    <ColorChip color={colorA} size={60} />
                    <span className="cl-mixing-plus">+</span>
                    <ColorChip color={colorB} size={60} />
                    <span className="cl-mixing-question">= ?</span>
                </div>
                <button onClick={handleRetry} className="cl-retry-btn">
                    重試
                </button>
            </div>
        );
    }

    return (
        <div className="cl-mixing-game-container">
            <div className="cl-mixing-instruction">
                請選擇混合後的顏色
            </div>

            {/* Color Mixing Animation Area */}
            <div className="cl-mixing-stage">
                <div className={`cl-mixing-colors ${gameState === 'animating' ? 'merging' : ''}`}>
                    <div className="cl-mixing-color-left">
                        <ColorChip color={colorA} size={100} />
                    </div>

                    {gameState === 'animating' && selectedAnswer ? (
                        <div className="cl-mixing-result-center">
                            <ColorChip
                                color={COLORS.find(c => c.id === selectedAnswer)!}
                                size={120}
                            />
                        </div>
                    ) : (
                        <span className="cl-mixing-plus-sign">+</span>
                    )}

                    <div className="cl-mixing-color-right">
                        <ColorChip color={colorB} size={100} />
                    </div>
                </div>
            </div>

            {/* Options */}
            <div className="cl-mixing-options">
                {options.map(color => (
                    <button
                        key={color.id}
                        className={`cl-mixing-option ${selectedAnswer === color.id ? 'selected' : ''}`}
                        onClick={() => handleOptionClick(color.id)}
                        disabled={gameState !== 'question'}
                    >
                        <div
                            className="cl-mixing-option-circle"
                            style={{ backgroundColor: color.hex }}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
};
