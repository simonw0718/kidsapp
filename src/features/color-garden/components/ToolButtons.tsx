import React from 'react';
import '../color-garden.css';

interface ToolButtonsProps {
    mode: 'brush' | 'eraser';
    onModeChange: (mode: 'brush' | 'eraser') => void;
    onClear: () => void;
    onBack: () => void;
}

export const ToolButtons: React.FC<ToolButtonsProps> = ({
    mode,
    onModeChange,
    onClear,
    onBack,
}) => {
    return (
        <div className="cg-tool-strip-frame">
            <div className="cg-tool-buttons-container">
                <div className="cg-tool-group">
                    <button
                        onClick={onBack}
                        className="cg-tool-square-btn cg-tool-back"
                        title="Back"
                    >
                        ↩️
                    </button>
                    <button
                        onClick={onClear}
                        className="cg-tool-square-btn cg-tool-clear"
                        title="Clear"
                    >
                        🗑️
                    </button>
                </div>

                <button
                    onClick={() => onModeChange('brush')}
                    className={`cg-tool-circle ${mode === 'brush' ? 'cg-tool-circle--active' : ''}`}
                    title="Brush"
                >
                    🖌️
                </button>

                <button
                    onClick={() => onModeChange('eraser')} // Using eraser as fill bucket placeholder or secondary tool
                    className={`cg-tool-circle ${mode === 'eraser' ? 'cg-tool-circle--active' : ''}`}
                    title="Fill"
                >
                    🪣
                </button>

                <button
                    onClick={() => onModeChange('eraser')}
                    className={`cg-tool-circle ${mode === 'eraser' ? 'cg-tool-circle--active' : ''}`}
                    title="Eraser"
                >
                    🧽
                </button>

                <div className="cg-tool-bottom-group">
                    <button
                        onClick={() => { }} // Undo placeholder
                        className="cg-tool-square-btn cg-tool-undo"
                        title="Undo"
                    >
                        ↩
                    </button>
                    <button
                        onClick={onClear}
                        className="cg-tool-square-btn cg-tool-delete"
                        title="Delete"
                    >
                        🗑
                    </button>
                </div>
            </div>
        </div>
    );
};
