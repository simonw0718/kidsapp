import type { LevelConfig, Direction, Position } from '../data/levels';

export interface GameContext {
    playerPos: Position;
    playerDir: Direction;
    level: LevelConfig;
    gridSize: number;
    gameMode: number;
}

export interface CommandResult {
    ok: boolean;
    nextPos?: Position;
    nextDir?: Direction;
    error?: string;
    hitObstacle?: boolean;
    outOfBounds?: boolean;
}

export interface Command {
    id: string;
    label: string;
    icon?: string;
    params?: Record<string, any>;

    validate: (ctx: GameContext) => CommandResult;
    resolve: (ctx: GameContext) => CommandResult;
    // animate is handled by the UI layer based on the command ID usually, 
    // but we can keep it in the interface if we want to support custom animation logic later.
    // For now, we'll stick to the core logic.
}
