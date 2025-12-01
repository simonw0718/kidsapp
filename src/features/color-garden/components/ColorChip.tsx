import React, { useRef } from 'react';
import type { ColorData } from '../data/colors';
import { BpmWord } from '../../../components/common/BpmWord';

interface ColorChipProps {
    color: ColorData;
    size?: number;
    showLabel?: boolean;
    onClick?: (color: ColorData) => void;
    className?: string;
    active?: boolean;
}

export const ColorChip: React.FC<ColorChipProps> = ({
    color,
    size = 100,
    showLabel = false,
    onClick,
    className = '',
    active = false
}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleClick = () => {
        // Play audio
        if (color.audio) {
            if (!audioRef.current) {
                audioRef.current = new Audio(color.audio);
            }
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.warn('Audio play failed', e));
        }

        if (onClick) {
            onClick(color);
        }
    };

    return (
        <div
            className={`color-chip-container ${className} ${active ? 'active' : ''}`}
            onClick={handleClick}
            style={{ width: size, cursor: 'pointer' }}
        >
            <div
                className="color-chip-circle"
                style={{
                    backgroundColor: color.hex,
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    border: color.hex.toLowerCase() === '#ffffff' ? '1px solid #ddd' : 'none'
                }}
            />

            {showLabel && (
                <div className="color-chip-label" style={{ marginTop: '12px', textAlign: 'center' }}>
                    <div className="color-chip-zhuyin" style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '4px' }}>
                        {color.zhuyin.map((z, index) => (
                            <BpmWord
                                key={index}
                                char={z.char}
                                onset={z.onset}
                                rime={z.rime}
                                tone={z.tone as any}
                            />
                        ))}
                    </div>
                    <div className="color-chip-en" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#555' }}>
                        {color.nameEn}
                    </div>
                </div>
            )}
        </div>
    );
};
