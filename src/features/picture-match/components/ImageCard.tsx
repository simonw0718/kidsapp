//src/features/picture-match/components/ImageCard.tsx
import React from 'react';
import type { VocabItem } from '../data/vocab';

interface ImageCardProps {
    item: VocabItem;
    onClick: (item: VocabItem) => void;
    state: 'idle' | 'correct' | 'incorrect';
    disabled: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({ item, onClick, state, disabled }) => {
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

    const isImagePath = item.image && (item.image.startsWith('/') || item.image.startsWith('http'));

    return (
        <button
            onClick={() => onClick(item)}
            disabled={disabled}
            style={{
                /* [卡片尺寸設定] */
                width: '100%',
                /* [卡片高度比例] aspect-ratio: 1 代表正方形，4/3 代表 4:3 長方形 */
                aspectRatio: '1',
                borderRadius: '24px',
                border: 'none',
                backgroundColor: getBackgroundColor(),
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all 0.2s',
                transform: state === 'idle' ? 'scale(1)' : 'scale(0.98)',
                boxShadow: state === 'idle'
                    ? '0 4px 12px rgba(0,0,0,0.1)'
                    : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                position: 'relative',
                overflow: 'hidden',
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
        </button>
    );
};
