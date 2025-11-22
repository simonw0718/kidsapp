export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameMode = 1 | 2 | 3 | 4;

export interface Position {
    x: number;
    y: number;
}

export interface LevelConfig {
    id: number;
    mode: GameMode;
    gridSize: number;
    start: Position & { dir: Direction };
    goal: Position;
    obstacles: Position[]; // Rocks (can be jumped over)
    lakes?: Position[];    // Lakes (cannot be jumped over)
    allowedCommands: string[];
    maxCommands?: number; // Only for Mode 3-4
}

export interface ModeConfig {
    id: GameMode;
    name: string;
    description: string;
    gridSize: number;
    allowedCommands: string[];
    isDirect: boolean; // true for Mode 1-2 (direct control)
    clearOnExecute: boolean; // true for Mode 3
    resetOnFail: boolean; // true for Mode 4
}

export const GAME_MODES: ModeConfig[] = [
    {
        id: 1,
        name: '直接控制 (初級)',
        description: '使用按鈕直接控制小兔子移動',
        gridSize: 4,
        allowedCommands: ['forward', 'left', 'right'],
        isDirect: true,
        clearOnExecute: false,
        resetOnFail: false
    },
    {
        id: 2,
        name: '直接控制 (進階)',
        description: '使用按鈕控制，加入跳躍功能',
        gridSize: 5,
        allowedCommands: ['forward', 'jump', 'left', 'right'],
        isDirect: true,
        clearOnExecute: false,
        resetOnFail: false
    },
    {
        id: 3,
        name: '預排指令 (連續)',
        description: '預先排列指令，執行後可繼續輸入',
        gridSize: 5,
        allowedCommands: ['forward', 'jump', 'left', 'right'],
        isDirect: false,
        clearOnExecute: true,
        resetOnFail: false
    },
    {
        id: 4,
        name: '預排指令 (一次完成)',
        description: '預先排列指令，失敗會重置到起點',
        gridSize: 5,
        allowedCommands: ['forward', 'jump', 'left', 'right'],
        isDirect: false,
        clearOnExecute: false,
        resetOnFail: true
    }
];

// Path finding helper to ensure solvability
const hasPath = (
    start: Position,
    goal: Position,
    obstacles: Position[],
    lakes: Position[],
    gridSize: number,
    canJump: boolean
): boolean => {
    const queue: Position[] = [start];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    const isObstacle = (x: number, y: number) => obstacles.some(o => o.x === x && o.y === y);
    const isLake = (x: number, y: number) => lakes.some(l => l.x === x && l.y === y);
    const isValid = (x: number, y: number) => x >= 0 && x < gridSize && y >= 0 && y < gridSize;

    while (queue.length > 0) {
        const curr = queue.shift()!;
        if (curr.x === goal.x && curr.y === goal.y) return true;

        const moves = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];

        for (const move of moves) {
            // Try walking
            const nextX = curr.x + move.dx;
            const nextY = curr.y + move.dy;

            if (isValid(nextX, nextY) && !isLake(nextX, nextY)) {
                // If it's a rock, we can't walk into it, but we might be able to jump over it (handled below)
                // If it's NOT a rock, we can walk
                if (!isObstacle(nextX, nextY)) {
                    const key = `${nextX},${nextY}`;
                    if (!visited.has(key)) {
                        visited.add(key);
                        queue.push({ x: nextX, y: nextY });
                    }
                }
            }

            // Try jumping (if allowed)
            if (canJump) {
                const jumpX = curr.x + (move.dx * 2);
                const jumpY = curr.y + (move.dy * 2);
                const midX = curr.x + move.dx;
                const midY = curr.y + move.dy;

                // Can only jump if landing is valid, not a rock, not a lake
                // AND the intermediate tile is NOT a lake (cannot jump over lake)
                if (isValid(jumpX, jumpY) &&
                    !isObstacle(jumpX, jumpY) &&
                    !isLake(jumpX, jumpY) &&
                    !isLake(midX, midY)) { // Check if jumping over lake

                    const key = `${jumpX},${jumpY}`;
                    if (!visited.has(key)) {
                        visited.add(key);
                        queue.push({ x: jumpX, y: jumpY });
                    }
                }
            }
        }
    }
    return false;
};

// Generate a random level
export const generateLevel = (mode: GameMode): LevelConfig => {
    const config = GAME_MODES.find(m => m.id === mode)!;
    const gridSize = config.gridSize;
    const canJump = config.allowedCommands.includes('jump');

    let start: Position & { dir: Direction };
    let goal: Position;
    let obstacles: Position[] = [];
    let lakes: Position[] = [];
    let attempts = 0;

    while (attempts < 100) {
        attempts++;
        obstacles = [];
        lakes = [];

        // 1. Place Start and Goal
        const positions: Position[] = [];
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                positions.push({ x, y });
            }
        }

        // Shuffle positions
        for (let i = positions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [positions[i], positions[j]] = [positions[j], positions[i]];
        }

        start = { ...positions[0], dir: 'right' }; // Default dir, randomized later
        goal = positions[1];

        // Ensure start and goal are not too close (Manhattan distance >= 2)
        if (Math.abs(start.x - goal.x) + Math.abs(start.y - goal.y) < 2) continue;

        // Randomize start direction
        const dirs: Direction[] = ['up', 'down', 'left', 'right'];
        start.dir = dirs[Math.floor(Math.random() * dirs.length)];

        // 2. Place Obstacles and Lakes
        let availablePositions = positions.slice(2);

        // Config based on mode
        let numRocks = 0;
        let numLakes = 0;

        if (mode === 1) {
            numRocks = Math.floor(Math.random() * 2) + 1; // 1-2 rocks
        } else {
            // Mode 2, 3, 4
            numRocks = Math.floor(Math.random() * 3) + 3; // 3-5 rocks
            numLakes = Math.floor(Math.random() * 2) + 1; // 1-2 lakes
        }

        // Place Rocks
        for (let i = 0; i < numRocks && availablePositions.length > 0; i++) {
            obstacles.push(availablePositions.pop()!);
        }

        // Place Lakes
        for (let i = 0; i < numLakes && availablePositions.length > 0; i++) {
            lakes.push(availablePositions.pop()!);
        }

        // 3. Verify Path
        if (hasPath(start, goal, obstacles, lakes, gridSize, canJump)) {
            return {
                id: Date.now(), // Unique ID
                mode,
                gridSize,
                start,
                goal,
                obstacles,
                lakes,
                allowedCommands: config.allowedCommands,
                maxCommands: mode === 3 ? 8 : (mode === 4 ? 10 : undefined)
            };
        }
    }

    // Fallback if generation fails (should be rare)
    return {
        id: Date.now(),
        mode,
        gridSize,
        start: { x: 0, y: 0, dir: 'right' },
        goal: { x: gridSize - 1, y: gridSize - 1 },
        obstacles: [],
        lakes: [],
        allowedCommands: config.allowedCommands
    };
};

// Helper to get a random level for a mode (now uses generator)
export const getRandomLevel = (mode: GameMode): LevelConfig => {
    return generateLevel(mode);
};

// Helper to get mode config
export const getModeConfig = (mode: GameMode): ModeConfig => {
    return GAME_MODES.find(m => m.id === mode) || GAME_MODES[0];
};
