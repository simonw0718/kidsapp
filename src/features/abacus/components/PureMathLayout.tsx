// src/features/abacus/components/PureMathLayout.tsx
import React from 'react';
import { BpmWord } from '../../../components/common/BpmWord';
import type { AbacusQuestion } from '../types';

interface PureMathLayoutProps {
    question: AbacusQuestion;
    status: 'idle' | 'correct' | 'incorrect';
    selected: number | null;
    statusImg?: string;
    statusImgAlt?: string;
    onOptionClick: (value: number) => void;
    onNext: () => void;
}

export const PureMathLayout: React.FC<PureMathLayoutProps> = ({
    question,
    status,
    selected,
    statusImg,
    statusImgAlt,
    onOptionClick,
    onNext,
}) => {
    return (
        <div className="pure-math-container">
            {/* Question Section */}
            <div className="pure-math-question-section">
                {/* Avatar Image */}
                {statusImg && (
                    <img
                        key={statusImg}
                        src={statusImg}
                        alt={statusImgAlt}
                        className="pure-math-avatar"
                    />
                )}

                {/* Math Expression */}
                <div className="pure-math-expression">
                    {question.a} {question.operator} {question.b} = ?
                </div>
            </div>

            {/* Options Section */}
            <div className="pure-math-options-section">
                {/* Label */}
                <div className="pure-math-answer-label">
                    <BpmWord char="答" onset="ㄉ" rime="ㄚ" tone="ˊ" />
                    <BpmWord char="案" rime="ㄢ" tone="ˋ" />
                    <BpmWord char="是" onset="ㄕ" tone="ˋ" />
                    <span className="bpm-tilde">～</span>
                </div>

                {/* Options Grid */}
                <div className="pure-math-options-grid">
                    {question.options.map((option: number) => {
                        const isSelected = selected === option;
                        const isCorrect = option === question.answer;

                        let className = 'pure-math-option-btn';
                        if (status !== 'idle' && isSelected) {
                            className += isCorrect
                                ? ' pure-math-option-btn--correct'
                                : ' pure-math-option-btn--incorrect pure-math-option-btn--disabled';
                        }

                        const disabled =
                            status === 'correct' ||
                            (status === 'incorrect' && isSelected && !isCorrect);

                        return (
                            <button
                                key={option}
                                type="button"
                                className={className}
                                onClick={() => onOptionClick(option)}
                                disabled={disabled}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

                {/* Next Button Slot */}
                <div className="pure-math-next-button-slot">
                    {status === 'correct' && (
                        <button
                            type="button"
                            className="pure-math-next-button"
                            onClick={onNext}
                        >
                            <span className="pure-math-next-button-inner">
                                <BpmWord char="下" onset="ㄒ" rime="ㄧㄚ" tone="ˋ" />
                                <BpmWord char="一" onset="ㄧ" />
                                <BpmWord char="題" onset="ㄊ" rime="ㄧ" tone="ˊ" />
                                <span className="pure-math-next-arrow">➜</span>
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
