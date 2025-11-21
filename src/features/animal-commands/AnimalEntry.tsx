import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import { GAME_MODES, type GameMode } from './data/levels';
import './animal-commands.css';

export const AnimalEntry: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCharacter, setSelectedCharacter] = React.useState<'rabbit' | 'dino'>('rabbit');

    const handleModeSelect = (mode: GameMode) => {
        navigate(`/animal-commands/play?mode=${mode}&character=${selectedCharacter}`);
    };

    return (
        <PageContainer
            title="動物指令大冒險"
            headerRight={<BackToHomeButton />}
        >
            <div className="ac-entry-container">
                <div className="ac-entry-header">

                </div>

                <div className="ac-character-selection">
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

                <div className="ac-mode-grid">
                    {GAME_MODES.map(mode => (
                        <button
                            key={mode.id}
                            className={`ac-mode-card ac-mode-${mode.id}`}
                            onClick={() => handleModeSelect(mode.id)}
                        >
                            <div className="ac-mode-number">模式 {mode.id}</div>
                            <div className="ac-mode-name">{mode.name}</div>
                            <div className="ac-mode-desc">{mode.description}</div>
                            <div className="ac-mode-info">
                                <span>地圖: {mode.gridSize}x{mode.gridSize}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </PageContainer>
    );
};
