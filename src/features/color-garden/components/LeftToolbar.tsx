import React from 'react';
import '../color-garden.css';

interface LeftToolbarProps {
    brushSize: number;
    onBrushSizeChange: (size: number) => void;
    mode: 'brush' | 'eraser';
    onModeChange: (mode: 'brush' | 'eraser') => void;
    onClear: () => void;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
    brushSize,
    onBrushSizeChange,
    mode,
    onModeChange,
    onClear,
}) => {
    return (
        <div className="cg-left-toolbar">
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
                <span className="text-xs font-bold text-white drop-shadow-md">Size</span>
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

            {/* Clear Button - Kept here for quick access or move to bottom? 
                User reference shows tools on left. Let's keep Clear here as "Trash".
            */}
            <button
                onClick={onClear}
                className="cg-tool-btn text-red-500"
                title="Clear All"
            >
                🗑️
            </button>
        </div>
    );
};
