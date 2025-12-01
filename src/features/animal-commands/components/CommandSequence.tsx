import React from 'react';
import type { CommandType } from '../data/levels';
import './command-sequence.css';

interface CommandSequenceProps {
    commands: CommandType[];
    maxCommands: number;
    currentIndex: number;
    onRemoveCommand: (index: number) => void;
    disabled: boolean;
}

export const CommandSequence: React.FC<CommandSequenceProps> = ({
    commands,
    maxCommands,
    currentIndex,
    onRemoveCommand,
    disabled
}) => {
    const getIcon = (cmd: string) => {
        switch (cmd) {
            case 'forward': return '⬆️';
            case 'left': return '⬅️';
            case 'right': return '➡️';
            case 'jump': return '🦘';
            default: return '?';
        }
    };

    // Create slots
    const slots = [];
    for (let i = 0; i < maxCommands; i++) {
        const cmd = commands[i];
        const isActive = i === currentIndex;

        slots.push(
            <div
                key={i}
                className={`ac-seq-slot ${isActive ? 'ac-slot-active' : ''} ${!cmd ? 'ac-slot-empty' : ''}`}
                onClick={() => cmd && !disabled && onRemoveCommand(i)}
            >
                {cmd && <span className="ac-seq-icon">{getIcon(cmd)}</span>}
                {!cmd && <span className="ac-slot-number">{i + 1}</span>}
            </div>
        );
    }

    return (
        <div className="ac-sequence-container">
            <div className="ac-sequence-label">指令序列 ({commands.length}/{maxCommands})</div>
            <div className="ac-sequence-list">
                {slots}
            </div>
        </div>
    );
};
