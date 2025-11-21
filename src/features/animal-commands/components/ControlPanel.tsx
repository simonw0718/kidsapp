import React from 'react';
import './control-panel.css';

interface ControlPanelProps {
    isPlaying: boolean;
    onStart: () => void;
    onStop: () => void;
    onReset: () => void;
    disabled: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    isPlaying,
    onStart,
    onStop,
    onReset,
    disabled
}) => {
    return (
        <div className="ac-controls">
            {!isPlaying ? (
                <button
                    className="ac-control-btn ac-btn-start"
                    onClick={onStart}
                    disabled={disabled}
                >
                    ▶ 開始執行
                </button>
            ) : (
                <button
                    className="ac-control-btn ac-btn-stop"
                    onClick={onStop}
                >
                    ⏹ 停止
                </button>
            )}

            <button
                className="ac-control-btn ac-btn-reset"
                onClick={onReset}
                disabled={isPlaying}
            >
                🔄 重置
            </button>
        </div>
    );
};
