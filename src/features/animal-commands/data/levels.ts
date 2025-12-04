import { LEVEL_TEMPLATES, type Difficulty } from './levelTemplates';

export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameMode = 1 | 2 | 3;
export type CommandType = 'forward' | 'left' | 'right' | 'jump';

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
    allowedCommands: CommandType[];
    maxCommands?: number; // Only for Mode 2-3
}

export interface ModeConfig {
    id: GameMode;
    name: string;
    description: string;
    gridSize: number;
    allowedCommands: CommandType[];
    isDirect: boolean; // true for Mode 1
    clearOnExecute: boolean; // true for Mode 2
    resetOnFail: boolean; // true for Mode 3
}

export const GAME_MODES: ModeConfig[] = [
    {
        id: 1,
        name: '直接控制',
        description: '使用按鈕直接控制小兔子移動 (含跳躍)',
        gridSize: 5,
        allowedCommands: ['forward', 'jump', 'left', 'right'],
        isDirect: true,
        clearOnExecute: false,
        resetOnFail: false
    },
    {
        id: 2,
        name: '預排指令 (連續)',
        description: '預先排列指令，執行後可繼續輸入',
        gridSize: 5,
        allowedCommands: ['forward', 'jump', 'left', 'right'],
        isDirect: false,
        clearOnExecute: true,
        resetOnFail: false
    },
    {
        id: 3,
        name: '預排指令 (一次完成)',
        description: '預先排列指令，失敗會重置到起點',
        gridSize: 5,
        allowedCommands: ['forward', 'jump', 'left', 'right'],
        isDirect: false,
        clearOnExecute: false,
        resetOnFail: true
    }
];

// Seeded Random Number Generator
class SeededRNG {
    private seed: number;

    constructor(seed: string | number) {
        if (typeof seed === 'string') {
            // Simple hash for string seed
            let h = 0x811c9dc5;
            for (let i = 0; i < seed.length; i++) {
                h ^= seed.charCodeAt(i);
                h = Math.imul(h, 0x01000193);
            }
            this.seed = h >>> 0;
        } else {
            this.seed = seed;
        }
    }

    // Returns a float between 0 and 1
    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    // Returns integer between min and max (inclusive)
    range(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}

// Path finding helper to ensure solvability
const hasPath = (
    start: Position,
    goal: Position,
    obstacles: Position[],
    lakes: Position[],
    gridSize: number,
    canJump: boolean,
    requiredJumps: number
): boolean => {
    // State: x, y, jumps_performed
    interface State {
        x: number;
        y: number;
        jumps: number;
        path: string[];
    }

    const queue: State[] = [{ x: start.x, y: start.y, jumps: 0, path: [] }];
    const visited = new Set<string>(); // key: x,y,jumps
    visited.add(`${start.x},${start.y},0`);

    const isObstacle = (x: number, y: number) => obstacles.some(o => o.x === x && o.y === y);
    const isLake = (x: number, y: number) => lakes.some(l => l.x === x && l.y === y);
    const isValid = (x: number, y: number) => x >= 0 && x < gridSize && y >= 0 && y < gridSize;

    while (queue.length > 0) {
        const curr = queue.shift()!;

        if (curr.x === goal.x && curr.y === goal.y) {
            return curr.jumps >= requiredJumps;
        }

        const moves = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];

        for (const move of moves) {
            // Try walking
            const nextX = curr.x + move.dx;
            const nextY = curr.y + move.dy;

            if (isValid(nextX, nextY) && !isLake(nextX, nextY) && !isObstacle(nextX, nextY)) {
                const key = `${nextX},${nextY},${curr.jumps}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ x: nextX, y: nextY, jumps: curr.jumps, path: [...curr.path, 'walk'] });
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
                    !isLake(midX, midY)) {

                    const key = `${jumpX},${jumpY},${curr.jumps + 1}`;
                    if (!visited.has(key)) {
                        visited.add(key);
                        queue.push({ x: jumpX, y: jumpY, jumps: curr.jumps + 1, path: [...curr.path, 'jump'] });
                    }
                }
            }
        }
    }
    return false;
};

// Generate a level using templates
export const generateLevel = (mode: GameMode, difficulty: Difficulty, seed?: string): LevelConfig => {
    const config = GAME_MODES.find(m => m.id === mode)!;
    const gridSize = config.gridSize;
    const canJump = config.allowedCommands.includes('jump');

    // Use provided seed or random
    const rng = new SeededRNG(seed || Math.random());

    // Filter templates by difficulty
    const templates = LEVEL_TEMPLATES.filter(t => t.difficulty === difficulty);

    let attempts = 0;
    while (attempts < 50) {
        attempts++;

        // 1. Pick a template
        const template = templates[rng.range(0, templates.length - 1)];

        // 2. Setup Start
        const start = { ...template.start };

        // 3. Pick a Goal
        const goal = template.goalOptions[rng.range(0, template.goalOptions.length - 1)];

        // 4. Populate Obstacles and Lakes
        const obstacles: Position[] = [];
        const lakes: Position[] = [];

        const { obstacleDensity, lakeDensity, requiredJumps } = template.difficultyParams;

        // Determine counts
        const numObstacles = rng.range(obstacleDensity[0], obstacleDensity[1]);
        const numLakes = rng.range(lakeDensity[0], lakeDensity[1]);

        // Shuffle zones (using Fisher-Yates with seeded RNG)
        const shuffle = <T>(array: T[]) => {
            const arr = [...array];
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(rng.next() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };

        const shuffledObstacleZones = shuffle(template.obstacleZones);
        const shuffledLakeZones = shuffle(template.lakeZones);

        // Fill zones
        for (let i = 0; i < numObstacles && i < shuffledObstacleZones.length; i++) {
            obstacles.push(shuffledObstacleZones[i]);
        }

        for (let i = 0; i < numLakes && i < shuffledLakeZones.length; i++) {
            lakes.push(shuffledLakeZones[i]);
        }

        // 5. Verify Path
        if (hasPath(start, goal, obstacles, lakes, gridSize, canJump, requiredJumps)) {
            return {
                id: Date.now(),
                mode,
                gridSize,
                start,
                goal,
                obstacles,
                lakes,
                allowedCommands: config.allowedCommands,
                maxCommands: mode === 2 ? 8 : (mode === 3 ? 12 : undefined)
            };
        }
    }

    // Fallback: Return a simple level based on the first template of the difficulty
    const fallbackTemplate = templates[0];
    return {
        id: Date.now(),
        mode,
        gridSize,
        start: fallbackTemplate.start,
        goal: fallbackTemplate.goalOptions[0],
        obstacles: [],
        lakes: [],
        allowedCommands: config.allowedCommands,
        maxCommands: mode === 2 ? 8 : (mode === 3 ? 12 : undefined)
    };
};

// Helper to get mode config
export const getModeConfig = (mode: GameMode): ModeConfig => {
    return GAME_MODES.find(m => m.id === mode) || GAME_MODES[0];
};

// ===== Path Complexity Analysis =====

import type { PathComplexity } from './levelTemplates';
import { calculateComplexityScore, COMPLEXITY_RANGES } from './levelTemplates';

/**
 * Analyze path complexity by finding the shortest path and calculating metrics
 */
export function analyzePathComplexity(
    start: Position & { dir: Direction },
    goal: Position,
    obstacles: Position[],
    lakes: Position[],
    gridSize: number,
    canJump: boolean
): PathComplexity | null {
    interface PathState {
        x: number;
        y: number;
        dir: Direction;
        steps: number;
        jumps: number;
        turns: number;
        path: Array<{ x: number; y: number; action: string }>;
    }

    const queue: PathState[] = [{
        x: start.x,
        y: start.y,
        dir: start.dir,
        steps: 0,
        jumps: 0,
        turns: 0,
        path: []
    }];

    const visited = new Set<string>();
    visited.add(`${start.x},${start.y},${start.dir}`);

    const isObstacle = (x: number, y: number) => obstacles.some(o => o.x === x && o.y === y);
    const isLake = (x: number, y: number) => lakes.some(l => l.x === x && l.y === y);
    const isValid = (x: number, y: number) => x >= 0 && x < gridSize && y >= 0 && y < gridSize;

    const directionMap: Record<Direction, { dx: number; dy: number }> = {
        up: { dx: 0, dy: -1 },
        down: { dx: 0, dy: 1 },
        left: { dx: -1, dy: 0 },
        right: { dx: 1, dy: 0 }
    };

    const turnLeft: Record<Direction, Direction> = {
        up: 'left', left: 'down', down: 'right', right: 'up'
    };

    const turnRight: Record<Direction, Direction> = {
        up: 'right', right: 'down', down: 'left', left: 'up'
    };

    while (queue.length > 0) {
        const curr = queue.shift()!;

        if (curr.x === goal.x && curr.y === goal.y) {
            // Found path - calculate complexity metrics
            return {
                totalSteps: curr.steps,
                turnCount: curr.turns,
                jumpCount: curr.jumps,
                backtrackCount: calculateBacktracks(curr.path),
                choicePoints: 0, // Would need full map analysis
                deadEndEncounters: 0 // Would need full map analysis
            };
        }

        // Try moving forward
        const { dx, dy } = directionMap[curr.dir];
        const nextX = curr.x + dx;
        const nextY = curr.y + dy;

        if (isValid(nextX, nextY) && !isLake(nextX, nextY) && !isObstacle(nextX, nextY)) {
            const key = `${nextX},${nextY},${curr.dir}`;
            if (!visited.has(key)) {
                visited.add(key);
                queue.push({
                    x: nextX,
                    y: nextY,
                    dir: curr.dir,
                    steps: curr.steps + 1,
                    jumps: curr.jumps,
                    turns: curr.turns,
                    path: [...curr.path, { x: nextX, y: nextY, action: 'forward' }]
                });
            }
        }

        // Try jumping
        if (canJump) {
            const jumpX = curr.x + dx * 2;
            const jumpY = curr.y + dy * 2;
            const midX = curr.x + dx;
            const midY = curr.y + dy;

            if (isValid(jumpX, jumpY) && !isObstacle(jumpX, jumpY) && !isLake(jumpX, jumpY) && !isLake(midX, midY)) {
                const key = `${jumpX},${jumpY},${curr.dir}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({
                        x: jumpX,
                        y: jumpY,
                        dir: curr.dir,
                        steps: curr.steps + 1,
                        jumps: curr.jumps + 1,
                        turns: curr.turns,
                        path: [...curr.path, { x: jumpX, y: jumpY, action: 'jump' }]
                    });
                }
            }
        }

        // Try turning left
        const leftDir = turnLeft[curr.dir];
        const leftKey = `${curr.x},${curr.y},${leftDir}`;
        if (!visited.has(leftKey)) {
            visited.add(leftKey);
            queue.push({
                x: curr.x,
                y: curr.y,
                dir: leftDir,
                steps: curr.steps,
                jumps: curr.jumps,
                turns: curr.turns + 1,
                path: [...curr.path, { x: curr.x, y: curr.y, action: 'turnLeft' }]
            });
        }

        // Try turning right
        const rightDir = turnRight[curr.dir];
        const rightKey = `${curr.x},${curr.y},${rightDir}`;
        if (!visited.has(rightKey)) {
            visited.add(rightKey);
            queue.push({
                x: curr.x,
                y: curr.y,
                dir: rightDir,
                steps: curr.steps,
                jumps: curr.jumps,
                turns: curr.turns + 1,
                path: [...curr.path, { x: curr.x, y: curr.y, action: 'turnRight' }]
            });
        }
    }

    return null; // No path found
}

/**
 * Calculate number of backtracks in path
 */
function calculateBacktracks(path: Array<{ x: number; y: number; action: string }>): number {
    let backtracks = 0;
    for (let i = 2; i < path.length; i++) {
        const curr = path[i];
        const prevPrev = path[i - 2];

        // Check if we're returning to a previous position
        if (curr.x === prevPrev.x && curr.y === prevPrev.y) {
            backtracks++;
        }
    }
    return backtracks;
}

/**
 * Validate if a level matches its target difficulty based on complexity
 */
export function validateLevelDifficulty(
    level: LevelConfig,
    targetDifficulty: Difficulty
): boolean {
    const complexity = analyzePathComplexity(
        level.start,
        level.goal,
        level.obstacles,
        level.lakes || [],
        level.gridSize,
        level.allowedCommands.includes('jump')
    );

    if (!complexity) {
        return false; // No valid path
    }

    const score = calculateComplexityScore(complexity);
    const [minScore, maxScore] = COMPLEXITY_RANGES[targetDifficulty];

    return score >= minScore && score <= maxScore;
}

