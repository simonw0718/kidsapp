import React, { useState } from 'react';
import { PageContainer } from '../../components/common/PageContainer';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import { ColorNamesMode } from './modes/ColorNamesMode';
import { ColorTeachingMode } from './modes/ColorTeachingMode';
import { ColorSortingGame } from './modes/ColorSortingGame';
import { ColorMixingGame } from './modes/ColorMixingGame';
import './color-learning.css';

interface ColorLearningGameProps {
    onSwitchMode: () => void;
}

type SubMode = 'names' | 'teaching' | 'game' | 'mixing-game';

export const ColorLearningGame: React.FC<ColorLearningGameProps> = ({ onSwitchMode }) => {
    const [subMode, setSubMode] = useState<SubMode>('names');

    const renderContent = () => {
        switch (subMode) {
            case 'names':
                return <ColorNamesMode />;
            case 'teaching':
                return <ColorTeachingMode />;
            case 'game':
                return <ColorSortingGame />;
            case 'mixing-game':
                return <ColorMixingGame />;
            default:
                return <ColorNamesMode />;
        }
    };

    return (
        <PageContainer
            title="顏色學習"
            headerRight={
                <div className="cg-header-controls">
                    <button
                        onClick={onSwitchMode}
                        className="cg-mode-switch-btn"
                    >
                        回主選單
                    </button>
                    <BackToHomeButton />
                </div>
            }
            scrollable={true}
        >
            <div className="cl-game-container">
                <div className="cl-submode-nav">
                    <button
                        className={`cl-nav-btn ${subMode === 'names' ? 'active' : ''}`}
                        onClick={() => setSubMode('names')}
                    >
                        <span className="cl-nav-icon">🎨</span>
                        認識顏色
                    </button>
                    <button
                        className={`cl-nav-btn ${subMode === 'teaching' ? 'active' : ''}`}
                        onClick={() => setSubMode('teaching')}
                    >
                        <span className="cl-nav-icon">👩‍🏫</span>
                        顏色教學
                    </button>
                    <button
                        className={`cl-nav-btn ${subMode === 'game' ? 'active' : ''}`}
                        onClick={() => setSubMode('game')}
                    >
                        <span className="cl-nav-icon">🎮</span>
                        顏色遊戲
                    </button>
                    <button
                        className={`cl-nav-btn ${subMode === 'mixing-game' ? 'active' : ''}`}
                        onClick={() => setSubMode('mixing-game')}
                    >
                        <span className="cl-nav-icon">🧪</span>
                        混色遊戲
                    </button>
                </div>

                <div className="cl-content-area">
                    {renderContent()}
                </div>
            </div>
        </PageContainer>
    );
};
