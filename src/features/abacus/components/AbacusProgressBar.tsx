import React from 'react';

interface AbacusProgressBarProps {
    total: number;
    current: number;
    results: boolean[];
}

export const AbacusProgressBar: React.FC<AbacusProgressBarProps> = ({ total, current, results }) => {
    return (
        <div className="abacus-progress-bar">
            {Array.from({ length: total }).map((_, index) => {
                let className = 'abacus-progress-circle';

                if (index < results.length) {
                    // Question has been answered
                    className += results[index] ? ' abacus-progress-circle--correct' : ' abacus-progress-circle--incorrect';
                } else if (index === current) {
                    // Current question
                    className += ' abacus-progress-circle--current';
                } else {
                    // Unanswered
                    className += ' abacus-progress-circle--unanswered';
                }

                return (
                    <div key={index} className={className}>
                        {index + 1}
                    </div>
                );
            })}
        </div>
    );
};
