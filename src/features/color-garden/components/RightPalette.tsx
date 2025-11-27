import React from 'react';
import '../color-garden.css';

interface RightPaletteProps {
    selectedColor: string;
    onColorSelect: (color: string) => void;
    mode: 'brush' | 'eraser';
    onModeChange: (mode: 'brush' | 'eraser') => void;
}

const COLORS = [
    '#FF0000', '#FF7F00', '#FFFF00', // Red, Orange, Yellow
    '#00FF00', '#0000FF', '#4B0082', // Green, Blue, Indigo
    '#8B00FF', '#FFC0CB', '#8B4513', // Violet, Pink, Brown
    '#000000', '#808080', '#FFFFFF', // Black, Gray, White
    '#00FFFF', '#FF00FF', '#C0C0C0', // Cyan, Magenta, Silver
];

export const RightPalette: React.FC<RightPaletteProps> = ({
    selectedColor,
    onColorSelect,
    mode,
    onModeChange,
}) => {
    return (
        <div className="cg-right-palette">
            <div className="cg-color-grid">
                {COLORS.map((color) => (
                    <button
                        key={color}
                        onClick={() => {
                            onColorSelect(color);
                            onModeChange('brush');
                        }}
                        className={`cg-color-btn ${selectedColor === color && mode === 'brush' ? 'cg-color-btn--selected' : ''}`}
                        style={{ backgroundColor: color }}
                        aria-label={color}
                    />
                ))}
            </div>
        </div>
    );
};
