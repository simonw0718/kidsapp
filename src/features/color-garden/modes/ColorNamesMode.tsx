import React, { useState } from 'react';
import { COLORS, type ColorData } from '../data/colors';
import { ColorChip } from '../components/ColorChip';

export const ColorNamesMode: React.FC = () => {
    const [selectedColor, setSelectedColor] = useState<ColorData | null>(null);

    const handleColorClick = (color: ColorData) => {
        setSelectedColor(color);
    };

    return (
        <div className="cl-names-container">
            <div className="cl-names-grid">
                {COLORS.map(color => (
                    <ColorChip
                        key={color.id}
                        color={color}
                        size={selectedColor?.id === color.id ? 140 : 100}
                        showLabel={selectedColor?.id === color.id}
                        onClick={handleColorClick}
                        active={selectedColor?.id === color.id}
                        className="cl-names-chip"
                    />
                ))}
            </div>
        </div>
    );
};
