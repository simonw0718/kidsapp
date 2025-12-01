import type { Position, Direction } from '../data/levels';

export const getForwardPos = (pos: Position, dir: Direction, steps: number = 1): Position => {
    const next = { ...pos };
    switch (dir) {
        case 'up': next.y -= steps; break;
        case 'down': next.y += steps; break;
        case 'left': next.x -= steps; break;
        case 'right': next.x += steps; break;
    }
    return next;
};

export const checkBounds = (pos: Position, gridSize: number): boolean => {
    return pos.x >= 0 && pos.x < gridSize && pos.y >= 0 && pos.y < gridSize;
};

export const checkObstacle = (pos: Position, obstacles: Position[]): boolean => {
    return obstacles.some(o => o.x === pos.x && o.y === pos.y);
};

export const checkLake = (pos: Position, lakes?: Position[]): boolean => {
    return lakes?.some(l => l.x === pos.x && l.y === pos.y) ?? false;
};

export const getNextDir = (currentDir: Direction, turn: 'left' | 'right'): Direction => {
    const dirs: Direction[] = ['up', 'right', 'down', 'left'];
    const idx = dirs.indexOf(currentDir);
    if (turn === 'right') {
        return dirs[(idx + 1) % 4];
    } else {
        return dirs[(idx + 3) % 4]; // +3 is same as -1 modulo 4
    }
};
