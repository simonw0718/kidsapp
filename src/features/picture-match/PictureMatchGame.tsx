import React, { useState } from 'react';
import { PageContainer } from '../../components/common/PageContainer';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import { useGameLogic, type GameDifficulty } from './hooks/useGameLogic';
import { ImageCard } from './components/ImageCard';
import { StimulusDisplay } from './components/StimulusDisplay';
import './picture-match.css';

interface PictureMatchGameProps {
    mode: 'english' | 'zhuyin' | 'dinosaur';
}

export const PictureMatchGame: React.FC<PictureMatchGameProps> = ({ mode }) => {
    // If mode is 'dinosaur', set initial difficulty to 'dinosaur', otherwise default to 1
    const [difficulty, setDifficulty] = useState<GameDifficulty>(mode === 'dinosaur' ? 'dinosaur' : 1);
    const [gameStarted, setGameStarted] = useState(false);

    // If mode is 'dinosaur', we treat it as 'english' for audio purposes (or we could add specific logic)
    // For now, let's pass 'english' to useGameLogic if mode is 'dinosaur' so it behaves like English mode (audio plays)
    const logicMode = mode === 'zhuyin' ? 'zhuyin' : 'english';

    const { currentQuestion, options, status, selectedId, handleOptionClick, nextQuestion, replayAudio, isPlaying, unlockAudio, play } = useGameLogic(difficulty, logicMode);

    const difficultyOptions: { label: string; value: GameDifficulty }[] = [
        { label: '簡單 (Lv1)', value: 1 },
        { label: '中等 (Lv2)', value: 2 },
        { label: '困難 (Lv3)', value: 3 },
        { label: '混合', value: 'mix' },
        { label: '恐龍 (Dinosaur)', value: 'dinosaur' },
    ];

    const handleStartGame = () => {
        unlockAudio();
        setGameStarted(true);
        // Manually trigger the first audio play since useGameLogic might have tried and failed or not tried yet
        if (currentQuestion?.audio && mode === 'english') {
            play(currentQuestion.audio, currentQuestion.word);
        }
    };

    if (!currentQuestion) return <div>Loading...</div>;

    return (
        <PageContainer
            title={mode === 'english' ? '字卡 - 英文' : '字卡 - 注音'}
            headerRight={
                <div className="pm-header-controls">
                    {/* Difficulty dropdown */}
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as GameDifficulty)}
                        className="pm-difficulty-select"
                    >
                        {difficultyOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <BackToHomeButton />
                </div>
            }
        >
            <div className="pm-game-container">
                {!gameStarted ? (
                    <div className="pm-start-overlay" onClick={handleStartGame}>
                        <img
                            src="/images/picture-match/ready-go.png"
                            alt="Ready GO!"
                            className="pm-start-image"
                        />
                    </div>
                ) : (
                    <>
                        <StimulusDisplay
                            item={currentQuestion}
                            mode={mode}
                            onReplay={replayAudio}
                            isPlaying={isPlaying}
                        />

                        <div className="pm-card-grid">
                            {options.map(item => (
                                <ImageCard
                                    key={item.id}
                                    item={item}
                                    onClick={handleOptionClick}
                                    state={
                                        status === 'correct' && item.id === currentQuestion.id
                                            ? 'correct'
                                            : status === 'incorrect' && item.id === selectedId
                                                ? 'incorrect'
                                                : 'idle'
                                    }
                                    disabled={status === 'correct'}
                                />
                            ))}
                        </div>

                        {status === 'correct' && (
                            <button
                                onClick={nextQuestion}
                                className="pm-next-btn"
                            >
                                下一題 ➜
                            </button>
                        )}
                    </>
                )}
            </div>
        </PageContainer>
    );
};

