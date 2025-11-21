import React from 'react';
import './direct-control-panel.css';

interface DirectControlPanelProps {
    allowedCommands: string[];
    onCommand: (cmd: string) => void;
    disabled: boolean;
}

export const DirectControlPanel: React.FC<DirectControlPanelProps> = ({
    allowedCommands,
    onCommand,
    disabled
}) => {
    // [修改] 這裡修改按鈕圖示
    const getIcon = (cmd: string) => {
        switch (cmd) {
            case 'forward': return '⬆️';
            case 'left': return '↩️'; // Turn left
            case 'right': return '↪️'; // Turn right
            case 'jump': return '🦘';
            default: return '?';
        }
    };

    // [修改] 這裡修改按鈕文字
    const getLabel = (cmd: string) => {
        switch (cmd) {
            case 'forward': return '前進';
            case 'left': return '左轉';
            case 'right': return '右轉';
            case 'jump': return '跳躍';
            default: return cmd;
        }
    };

    return (
        <div className="dc-panel">
            <div className="dc-buttons">
                {allowedCommands.map(cmd => (
                    <button
                        key={cmd}
                        className={`dc-btn dc-btn-${cmd}`}
                        onClick={() => onCommand(cmd)}
                        disabled={disabled}
                    >
                        <span className="dc-btn-icon">{getIcon(cmd)}</span>
                        <span className="dc-btn-label">{getLabel(cmd)}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
