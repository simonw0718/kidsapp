import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import { GAME_MODES, type GameMode } from './data/levels';
import type { Difficulty } from './data/levelTemplates';
import './animal-commands.css';

type GameType = 'daily' | 'normal' | 'free';

export const AnimalEntry: React.FC = () => {
    const navigate = useNavigate();
    const [selectedGameType, setSelectedGameType] = React.useState<GameType>('free');
    const [selectedMode, setSelectedMode] = React.useState<GameMode>(1);
    const [selectedDifficulty, setSelectedDifficulty] = React.useState<Difficulty>('Easy');
    const [selectedCharacter, setSelectedCharacter] = React.useState<'rabbit' | 'dino'>('rabbit');

    const handleStartGame = () => {
        const params = new URLSearchParams({
            mode: String(selectedMode),
            character: selectedCharacter,
        });

        if (selectedGameType === 'free') {
            params.append('difficulty', selectedDifficulty);
        } else {
            // Adventure modes always start at Easy
            params.append('difficulty', 'Easy');
            params.append('adventureType', selectedGameType);
        }

        navigate(`/animal-commands/play?${params.toString()}`);
    };

    return (
        <PageContainer
            title="動物指令大冒險"
            headerRight={<BackToHomeButton />}
            scrollable={true}
        >
            <div className="ac-entry-container">
                {/* Game Type Selection */}
                <div className="ac-selection-section">
                    <h3 className="ac-section-title">選擇遊戲類型</h3>
                    <div className="ac-game-type-buttons">
                        <button
                            className={`ac-game-type-btn ${selectedGameType === 'daily' ? 'selected' : ''}`}
                            onClick={() => setSelectedGameType('daily')}
                        >
                            📅 每日挑戰
                        </button>
                        <button
                            className={`ac-game-type-btn ${selectedGameType === 'normal' ? 'selected' : ''}`}
                            onClick={() => setSelectedGameType('normal')}
                        >
                            🎲 隨機闖關
                        </button>
                        <button
                            className={`ac-game-type-btn ${selectedGameType === 'free' ? 'selected' : ''}`}
                            onClick={() => setSelectedGameType('free')}
                        >
                            🎮 自由練習
                        </button>
                    </div>
                </div>

                {/* Control Mode Selection */}
                <div className="ac-selection-section">
                    <h3 className="ac-section-title">選擇控制模式</h3>
                    <div className="ac-mode-buttons">
                        {GAME_MODES.map(mode => (
                            <button
                                key={mode.id}
                                className={`ac-control-mode-btn ${selectedMode === mode.id ? 'selected' : ''}`}
                                onClick={() => setSelectedMode(mode.id)}
                            >
                                <div className="ac-mode-number">模式 {mode.id}</div>
                                <div className="ac-mode-name">{mode.name}</div>
                                <div className="ac-mode-desc">{mode.description}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Difficulty Selection (Only for Free Practice) */}
                {selectedGameType === 'free' && (
                    <div className="ac-selection-section">
                        <h3 className="ac-section-title">選擇難度</h3>
                        <div className="ac-difficulty-buttons">
                            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                                <button
                                    key={diff}
                                    className={`ac-diff-btn ${selectedDifficulty === diff ? 'selected' : ''}`}
                                    onClick={() => setSelectedDifficulty(diff)}
                                >
                                    {diff === 'Easy' ? '簡單' : diff === 'Medium' ? '中等' : '困難'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Character Selection */}
                <div className="ac-selection-section">
                    <h3 className="ac-section-title">選擇你的角色</h3>
                    <div className="ac-character-options">
                        <button
                            className={`ac-character-card ${selectedCharacter === 'rabbit' ? 'selected' : ''}`}
                            onClick={() => setSelectedCharacter('rabbit')}
                        >
                            <img src="/images/animals-game/rabbit_to_down.png" alt="Rabbit" className="ac-character-img" />
                            <span className="ac-character-name">小兔子 🐰</span>
                        </button>
                        <button
                            className={`ac-character-card ${selectedCharacter === 'dino' ? 'selected' : ''}`}
                            onClick={() => setSelectedCharacter('dino')}
                        >
                            <img src="/images/animals-game/dino_down.png" alt="Dino" className="ac-character-img" />
                            <span className="ac-character-name">小恐龍 🦖</span>
                        </button>
                    </div>
                </div>

                {/* Start Button */}
                <div className="ac-start-section">
                    <button className="ac-start-btn" onClick={handleStartGame}>
                        開始遊戲
                    </button>
                </div>
            </div>
        </PageContainer>
    );
};
