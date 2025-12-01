import React from 'react';

interface EndScreenProps {
    score: number;
    total: number;
    onRestart: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({ score, total, onRestart }) => {
    return (
        <div className="pm-end-screen">
            <div className="pm-end-content">
                <img
                    src="/images/picture-match/game_over.jpg"
                    alt="Great Job!"
                    className="pm-end-image"
                />
                <h2 className="pm-end-title">Great Job!</h2>
                <div className="pm-end-score">
                    Correct: <span className="pm-score-value">{score}</span> / {total}
                </div>
                <button className="pm-restart-btn" onClick={onRestart}>
                    Play Again
                </button>
            </div>
        </div>
    );
};
