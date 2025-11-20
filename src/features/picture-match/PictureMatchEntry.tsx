import React from 'react';
import { PageContainer } from '../../components/common/PageContainer';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import './picture-match.css';

interface PictureMatchEntryProps {
    onSelectMode: (mode: 'english' | 'zhuyin' | 'dinosaur') => void;
}

export const PictureMatchEntry: React.FC<PictureMatchEntryProps> = ({ onSelectMode }) => {
    return (
        <PageContainer
            title="圖像字卡配對"
            headerRight={<BackToHomeButton />}
        >
            <div className="pm-entry-container">

                <h2 className="pm-entry-title">
                    請選擇遊戲模式
                </h2>

                <div className="pm-entry-options">
                    <button
                        onClick={() => onSelectMode('english')}
                        className="pm-entry-btn pm-entry-btn--english"
                    >
                        <span className="pm-entry-icon">ABC</span>
                        <span className="pm-entry-label">英文模式</span>
                        <span className="pm-entry-sublabel">聽音辨圖</span>
                    </button>

                    <button
                        onClick={() => onSelectMode('zhuyin')}
                        className="pm-entry-btn pm-entry-btn--zhuyin"
                    >
                        <span className="pm-entry-icon">ㄅㄆㄇ</span>
                        <span className="pm-entry-label">注音模式</span>
                        <span className="pm-entry-sublabel">看字辨圖 (無聲)</span>
                    </button>

                    <button
                        onClick={() => onSelectMode('dinosaur')}
                        className="pm-entry-btn pm-entry-btn--dinosaur"
                    >
                        <span className="pm-entry-icon">🦖</span>
                        <span className="pm-entry-label">恐龍模式</span>
                        <span className="pm-entry-sublabel">Dinosaur Mode</span>
                    </button>
                </div>
            </div>
        </PageContainer>
    );
};
