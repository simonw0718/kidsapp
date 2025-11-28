import React from 'react';
import { PageContainer } from '../../components/common/PageContainer';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import { weightManager } from '../../core/learning/weightManager';
import { useModal } from '../../components/common/CustomModal';
import './picture-match.css';

interface PictureMatchEntryProps {
    onSelectMode: (mode: 'english' | 'zhuyin' | 'dinosaur') => void;
}

export const PictureMatchEntry: React.FC<PictureMatchEntryProps> = ({ onSelectMode }) => {
    const { showConfirm, showAlert, CustomModalComponent } = useModal();

    const handleResetProgress = () => {
        showConfirm('確定要重置學習進度嗎？這將清除所有題目的練習記錄。', () => {
            weightManager.resetWeights();
            showAlert('學習進度已重置！');
        });
    };

    return (
        <PageContainer
            title="圖像字卡配對"
            headerRight={<BackToHomeButton />}
            scrollable={true}
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

                <button
                    onClick={handleResetProgress}
                    className="pm-reset-progress-btn"
                >
                    🔄 重置學習進度
                </button>
            </div>
            {CustomModalComponent}
        </PageContainer >
    );
};
