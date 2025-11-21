import React from 'react';
import type { Position, Direction } from '../data/levels';
import './grid-map.css';

interface GridMapProps {
    gridSize: number;
    playerPos: Position;
    playerDir: Direction;
    goal: Position;
    obstacles: Position[];
    lakes?: Position[];
    isWon: boolean;
    isLost: boolean;
    character?: 'rabbit' | 'dino';
    isJumping?: boolean;
}

export const GridMap: React.FC<GridMapProps> = ({
    gridSize,
    playerPos,
    playerDir,
    goal,
    obstacles,
    lakes = [],
    isWon,
    isLost,
    character = 'rabbit',
    isJumping = false
}) => {
    // Create grid cells
    const cells = [];
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            cells.push({ x, y });
        }
    }

    const getPlayerImage = (char: 'rabbit' | 'dino', dir: Direction, jumping: boolean) => {
        if (jumping) {
            return char === 'rabbit'
                ? '/images/animals-game/rabbit_jump.png'
                : '/images/animals-game/dino_jump.png';
        }

        if (char === 'rabbit') {
            return `/images/animals-game/rabbit_to_${dir}.png`;
        } else {
            return `/images/animals-game/dino_${dir}.png`;
        }
    };

    const getGoalContent = (char: 'rabbit' | 'dino') => {
        return char === 'dino' ? '🥩' : '🥕';
    };

    return (
        <div
            className="ac-grid-container"
            style={{
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`
            }}
        >
            {cells.map((cell) => {
                const isGoal = cell.x === goal.x && cell.y === goal.y;
                const isObstacle = obstacles.some(o => o.x === cell.x && o.y === cell.y);
                const isLake = lakes.some(l => l.x === cell.x && l.y === cell.y);
                const isPlayer = cell.x === playerPos.x && cell.y === playerPos.y;

                return (
                    <div key={`${cell.x}-${cell.y}`} className="ac-grid-cell">
                        {isGoal && <div className="ac-grid-item ac-goal">{getGoalContent(character)}</div>}
                        {isObstacle && <div className="ac-grid-item ac-obstacle">🪨</div>}
                        {isLake && <div className="ac-grid-item ac-lake">🌊</div>}
                        {isPlayer && (
                            <div
                                className={`ac-grid-item ac-player ${isWon ? 'ac-player-win' : ''} ${isLost ? 'ac-player-lost' : ''} ${isJumping ? `ac-jump-${playerDir}` : ''}`}
                            >
                                <img
                                    src={getPlayerImage(character, playerDir, isJumping)}
                                    alt="player"
                                    style={{
                                        width: 'clamp(20px, 14vmin, 140px)',
                                        height: 'clamp(20px, 14vmin, 140px)',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
