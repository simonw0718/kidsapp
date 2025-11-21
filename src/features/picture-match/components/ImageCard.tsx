//src/features/picture-match/components/ImageCard.tsx
import React from 'react';
import type { VocabItem } from '../data/vocab';
import { ZhuyinWord } from './ZhuyinWord';

interface ImageCardProps {
    item: VocabItem;
    onClick: (item: VocabItem) => void;
    state: 'idle' | 'correct' | 'incorrect';
    disabled: boolean;
    showFlipped?: boolean; // New prop to control flip animation
}

export const ImageCard: React.FC<ImageCardProps> = ({ item, onClick, state, disabled, showFlipped = false }) => {
    // Helper function to determine background color based on state
    /* [卡片背景色設定] */
    const getBackgroundColor = () => {
        if (state === 'correct') {
            return '#D4EDDA'; // Light green for correct
        } else if (state === 'incorrect') {
            return '#F8D7DA'; // Light red for incorrect
        }
        return 'white'; // Default white
    };

    /* [翻牌字體大小自動調整] 根據中文字數自動調整字體大小 */
    const getFlipFontSize = () => {
        const chineseLength = item.chinese.length; // 只計算中文字數
        if (chineseLength >= 3) {
            return '1.5rem'; // 3個字或以上：較小字體
        } else {
            return '3rem'; // 1-2個字：較大字體
        }
    };

    const isImagePath = item.image && (item.image.startsWith('/') || item.image.startsWith('http'));

    return (
        <button
            onClick={() => onClick(item)}
            disabled={disabled}
            className={`pm-image-card ${showFlipped ? 'pm-card--flipped' : ''}`}
            style={{
                /* [卡片尺寸設定] */
                width: '100%',
                /* [卡片高度比例] aspect-ratio: 1 代表正方形，4/3 代表 4:3 長方形 */
                aspectRatio: '1',
                borderRadius: '24px',
                border: 'none',
                backgroundColor: getBackgroundColor(),
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all 0.2s, transform 0.6s',
                transform: showFlipped ? 'rotateY(180deg)' : (state === 'idle' ? 'scale(1)' : 'scale(0.98)'),
                boxShadow: state === 'idle'
                    ? '0 4px 12px rgba(0,0,0,0.1)'
                    : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                position: 'relative',
                transformStyle: 'preserve-3d',
                zIndex: showFlipped ? 10 : 1, /* [調整] 翻牌後的卡片顯示在最前面，防止被其他卡片遮擋 */
            }}
        >
            {/* Front Face - Image */}
            <div
                className="pm-card-face pm-card-face--front"
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                }}
            >
                {isImagePath ? (
                    <img
                        src={item.image}
                        alt={item.word}
                        style={{
                            /* [圖片尺寸設定] */
                            width: '80%',
                            height: '80%',
                            objectFit: 'contain',
                            pointerEvents: 'none',
                        }}
                    />
                ) : (
                    <span style={{
                        /* [Emoji 圖片大小] 當沒有圖片時顯示 Emoji 的大小 */
                        fontSize: '5rem',
                        pointerEvents: 'none',
                    }}>
                        {item.image || item.emoji || '❓'}
                    </span>
                )}
            </div>

            {/* Back Face - Chinese + Zhuyin */}
            <div
                className="pm-card-face pm-card-face--back"
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    gap: '8px',
                    backgroundColor: '#FFF9E6', /* [調整] 翻牌背面背景色 */
                    borderRadius: '24px',
                    fontSize: getFlipFontSize(), /* [自動調整] 根據中文字數自動調整：3字以上=1.5rem，1-2字=3rem */
                }}
            >
                <ZhuyinWord chinese={item.chinese} zhuyin={item.zhuyin} />
            </div>
        </button>
    );
};
