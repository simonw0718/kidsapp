import React from 'react';
import type { VocabItem } from '../data/vocab';
import { ZhuyinWord } from './ZhuyinWord';

interface StimulusDisplayProps {
    item: VocabItem;
    mode: 'english' | 'zhuyin' | 'dinosaur';
    onReplay: () => void;
    isPlaying: boolean;
}

export const StimulusDisplay: React.FC<StimulusDisplayProps> = ({ item, mode, onReplay, isPlaying }) => {
    const isEnglishOrDino = mode === 'english' || mode === 'dinosaur';
    return (
        <div className="pm-stimulus-container">
            <div
                onClick={isEnglishOrDino ? onReplay : undefined}
                className={`pm-stimulus-card ${isPlaying ? 'pm-stimulus-card--playing' : ''} ${isEnglishOrDino ? 'pm-stimulus-card--clickable' : ''}`}
                style={{
                    /* [題目字體大小控制] */
                    fontSize: isEnglishOrDino ? '2.5rem' : '2.5rem', // 英文/恐龍模式: 4rem, 注音模式: 由 ZhuyinWord 組件控制
                }}
            >
                {isEnglishOrDino ? (
                    <>
                        {item.word}
                        <span className="pm-stimulus-card__audio-icon">
                            🔊
                        </span>
                    </>
                ) : (
                    <ZhuyinWord chinese={item.chinese} zhuyin={item.zhuyin} />
                )}
            </div>

            <div className="pm-stimulus-label">
                {isEnglishOrDino ? '聽音辨圖' : '看字辨圖'}
            </div>
        </div>
    );
};
