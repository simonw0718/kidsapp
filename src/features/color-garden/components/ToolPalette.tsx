import React from 'react';
import '../color-garden.css';

interface ToolPaletteProps {
    selectedColor: string;
    onColorSelect: (color: string) => void;
    brushSize: number;
    onBrushSizeChange: (size: number) => void;
    mode: 'brush' | 'eraser';
    onModeChange: (mode: 'brush' | 'eraser') => void;
    onClear: () => void;
}

const COLORS = [
    '#FF0000', '#FF7F00', '#FFFF00', // Red, Orange, Yellow
    '#00FF00', '#0000FF', '#4B0082', // Green, Blue, Indigo
    '#8B00FF', '#FFC0CB', '#8B4513', // Violet, Pink, Brown
    '#000000', '#808080', '#FFFFFF', // Black, Gray, White
    '#00FFFF', '#FF00FF', '#C0C0C0', // Cyan, Magenta, Silver
];

export const ToolPalette: React.FC<ToolPaletteProps> = ({
    selectedColor,
    onColorSelect,
    brushSize,
    onBrushSizeChange,
    mode,
    onModeChange,
    onClear,
}) => {
    return (
        <div className="cg-palette-container">
            {/* Color Grid (Left side of palette) */}
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

            {/* Tools Column (Right side of palette) */}
            <div className="cg-tool-column">
                <button
                    onClick={() => onModeChange('brush')}
                    className={`cg-tool-btn ${mode === 'brush' ? 'cg-tool-btn--active' : ''}`}
                    title="Brush"
                >
                    🖌️
                </button>
                <button
                    onClick={() => onModeChange('eraser')}
                    className={`cg-tool-btn ${mode === 'eraser' ? 'cg-tool-btn--active' : ''}`}
                    title="Eraser"
                >
                    🧼
                </button>

                {/* Brush Size Slider */}
                <div className="flex flex-col items-center w-full gap-1 my-2">
                    <span className="text-xs font-bold text-gray-500">Size</span>
                    <input
                        type="range"
                        min="5"
                        max="50"
                        value={brushSize}
                        onChange={(e) => onBrushSizeChange(Number(e.target.value))}
                        className="w-full h-32 -rotate-90 origin-center" // Vertical slider
                        style={{ width: '80px', height: '20px', margin: '30px 0' }}
                    />
                </div>

                <div className="flex-grow" /> {/* Spacer */}

                <button
                    onClick={onClear}
                    className="cg-tool-btn text-red-500 border-red-200 hover:bg-red-50"
                    title="Clear All"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};
