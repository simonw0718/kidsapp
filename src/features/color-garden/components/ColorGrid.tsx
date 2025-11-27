import React from 'react';
import '../color-garden.css';

interface ColorGridProps {
    selectedColor: string;
    onColorSelect: (color: string) => void;
}

const COLORS = [
    '#FF0000', // Red
    '#808080', // Grey
    '#000000', // Black

    '#00FFFF', // Cyan
    '#8B4513', // Brown
    '#FF8C00', // Dark Orange

    '#FFFF00', // Yellow
    '#FFDAB9', // Peach/Flesh
    '#008000', // Green

    '#7FFF00', // Chartreuse
    '#0000FF', // Blue
    '#8B0000', // Dark Red

    '#800080', // Purple
    '#FF69B4', // Hot Pink
    '#4B0082', // Indigo

    '#FFFFFF', // White
    '#FFC0CB', // Pink
    '#A52A2A', // Red Brown
];

export const ColorGrid: React.FC<ColorGridProps> = ({ selectedColor, onColorSelect }) => {
    return (
        <div className="cg-color-panel-frame">
            <div className="cg-color-grid-container">
                {COLORS.map((color) => (
                    <button
                        key={color}
                        onClick={() => onColorSelect(color)}
                        className={`cg-color-swatch ${selectedColor === color ? 'cg-color-swatch--selected' : ''}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                    >
                        {selectedColor === color && (
                            <span className="cg-color-checkmark">✓</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
