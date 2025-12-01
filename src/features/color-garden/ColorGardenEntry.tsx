import React, { useState } from 'react';
import { PageContainer } from '../../components/common/PageContainer';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import './color-garden.css';
import { ColorGardenGame } from './ColorGardenGame';
import { ColorLearningGame } from './ColorLearningGame';

const ColorGardenEntry: React.FC = () => {
    const [mode, setMode] = useState<'entry' | 'coloring' | 'learning'>('entry');

    if (mode === 'coloring') {
        return <ColorGardenGame onSwitchMode={() => setMode('entry')} />;
    }

    if (mode === 'learning') {
        return <ColorLearningGame onSwitchMode={() => setMode('entry')} />;
    }

    return (
        <PageContainer
            title="自由著色"
            headerRight={
                <div className="cg-header-controls">
                    <button
                        onClick={() => setMode('entry')}
                        className="cg-mode-switch-btn"
                    >
                        切換模式
                    </button>
                    <BackToHomeButton />
                </div>
            }
            scrollable={false}
        >
            <div className="cg-entry-container">
                <h2 className="cg-entry-title">
                    請選擇遊戲模式
                </h2>

                <div className="cg-entry-options">
                    <button
                        onClick={() => setMode('coloring')}
                        className="cg-entry-btn cg-entry-btn--free"
                    >
                        <span className="cg-entry-icon">🖍️</span>
                        <span className="cg-entry-label">自由著色</span>
                        <span className="cg-entry-sublabel">Free Coloring</span>
                    </button>

                    <button
                        onClick={() => setMode('learning')}
                        className="cg-entry-btn cg-entry-btn--learning"
                    >
                        <span className="cg-entry-icon">🌈</span>
                        <span className="cg-entry-label">顏色學習</span>
                        <span className="cg-entry-sublabel">Color Learning</span>
                    </button>
                </div>
            </div>
        </PageContainer >
    );
};

export default ColorGardenEntry;
