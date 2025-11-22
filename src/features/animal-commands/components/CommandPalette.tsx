import React from 'react';
import type { CommandType } from '../hooks/useAnimalGame';
import './command-palette.css';

interface CommandPaletteProps {
    allowedCommands: string[];
    onAddCommand: (cmd: CommandType) => void;
    disabled: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
    allowedCommands,
    onAddCommand,
    disabled
}) => {
    // [修改] 這裡修改按鈕圖示
    const getIcon = (cmd: string) => {
        switch (cmd) {
            case 'forward': return '⬆️';
            case 'left': return '⬅️'; // Turn left icon
            case 'right': return '➡️'; // Turn right icon
            case 'jump': return '🦘';
            default: return '?';
        }
    };

    return (
        <div className="ac-palette">
            {allowedCommands.map(cmd => (
                <button
                    key={cmd}
                    className={`ac-command-btn ac-btn-${cmd}`}
                    onClick={() => onAddCommand(cmd as CommandType)}
                    disabled={disabled}
                >
                    <span className="ac-cmd-icon">{getIcon(cmd)}</span>
                </button>
            ))}
        </div>
    );
};
