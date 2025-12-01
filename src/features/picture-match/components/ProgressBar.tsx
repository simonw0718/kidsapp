import React from 'react';

interface ProgressBarProps {
    total: number;
    current: number;
    results: boolean[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ total, current, results }) => {
    return (
        <div className="pm-progress-container">
            <div className="pm-progress-track">
                {Array.from({ length: total }).map((_, index) => {
                    let status = 'upcoming';
                    if (index < results.length) {
                        status = results[index] ? 'correct' : 'incorrect';
                    } else if (index === current) {
                        status = 'current';
                    }

                    return (
                        <div
                            key={index}
                            className={`pm-progress-step ${status}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};
