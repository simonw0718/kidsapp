import type { Direction, Position } from './levels';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface DifficultyParams {
    minSteps: number;
    maxSteps: number;
    requiredJumps: number;
    obstacleDensity: [number, number]; // min, max
    lakeDensity: [number, number]; // min, max
    branchComplexity: 0 | 1 | 2;
    deadEndTolerance: 0 | 1 | 2;
    mazeLevel: 0 | 1 | 2;
}

export interface LevelTemplate {
    name: string;
    difficulty: Difficulty;
    start: Position & { dir: Direction };
    goalOptions: Position[];
    obstacleZones: Position[];
    lakeZones: Position[];
    difficultyParams: DifficultyParams;
}

export const LEVEL_TEMPLATES: LevelTemplate[] = [
    // Easy Templates
    {
        name: 'Easy-1',
        difficulty: 'Easy',
        start: { x: 0, y: 2, dir: 'right' },
        goalOptions: [{ x: 4, y: 2 }, { x: 3, y: 2 }],
        obstacleZones: [{ x: 2, y: 2 }],
        lakeZones: [],
        difficultyParams: {
            minSteps: 3, maxSteps: 6, requiredJumps: 0,
            obstacleDensity: [1, 3], lakeDensity: [0, 0],
            branchComplexity: 0, deadEndTolerance: 0, mazeLevel: 0
        }
    },
    {
        name: 'Easy-2',
        difficulty: 'Easy',
        start: { x: 0, y: 1, dir: 'right' },
        goalOptions: [{ x: 4, y: 3 }, { x: 4, y: 1 }],
        obstacleZones: [{ x: 2, y: 1 }, { x: 3, y: 2 }],
        lakeZones: [],
        difficultyParams: {
            minSteps: 4, maxSteps: 6, requiredJumps: 0,
            obstacleDensity: [1, 3], lakeDensity: [0, 0],
            branchComplexity: 0, deadEndTolerance: 0, mazeLevel: 0
        }
    },
    {
        name: 'Easy-3',
        difficulty: 'Easy',
        start: { x: 1, y: 4, dir: 'up' },
        goalOptions: [{ x: 4, y: 0 }, { x: 3, y: 1 }],
        obstacleZones: [{ x: 2, y: 3 }],
        lakeZones: [],
        difficultyParams: {
            minSteps: 4, maxSteps: 6, requiredJumps: 0,
            obstacleDensity: [1, 3], lakeDensity: [0, 0],
            branchComplexity: 0, deadEndTolerance: 0, mazeLevel: 0
        }
    },
    {
        name: 'Easy-4',
        difficulty: 'Easy',
        start: { x: 2, y: 0, dir: 'down' },
        goalOptions: [{ x: 4, y: 4 }, { x: 3, y: 3 }],
        obstacleZones: [{ x: 2, y: 2 }],
        lakeZones: [],
        difficultyParams: {
            minSteps: 4, maxSteps: 6, requiredJumps: 0,
            obstacleDensity: [1, 3], lakeDensity: [0, 0],
            branchComplexity: 0, deadEndTolerance: 0, mazeLevel: 0
        }
    },
    {
        name: 'Easy-5',
        difficulty: 'Easy',
        start: { x: 0, y: 0, dir: 'right' },
        goalOptions: [{ x: 4, y: 1 }, { x: 4, y: 4 }],
        obstacleZones: [{ x: 1, y: 1 }, { x: 2, y: 0 }],
        lakeZones: [],
        difficultyParams: {
            minSteps: 3, maxSteps: 6, requiredJumps: 0,
            obstacleDensity: [1, 3], lakeDensity: [0, 0],
            branchComplexity: 0, deadEndTolerance: 0, mazeLevel: 0
        }
    },
    // Medium Templates
    {
        name: 'Medium-1',
        difficulty: 'Medium',
        start: { x: 0, y: 2, dir: 'right' },
        goalOptions: [{ x: 4, y: 4 }, { x: 4, y: 1 }],
        obstacleZones: [{ x: 2, y: 2 }, { x: 3, y: 3 }],
        lakeZones: [{ x: 2, y: 3 }],
        difficultyParams: {
            minSteps: 5, maxSteps: 8, requiredJumps: 1,
            obstacleDensity: [1, 3], lakeDensity: [0, 1],
            branchComplexity: 1, deadEndTolerance: 1, mazeLevel: 1
        }
    },
    {
        name: 'Medium-2',
        difficulty: 'Medium',
        start: { x: 1, y: 4, dir: 'up' },
        goalOptions: [{ x: 4, y: 0 }, { x: 3, y: 1 }],
        obstacleZones: [{ x: 2, y: 3 }, { x: 3, y: 2 }],
        lakeZones: [{ x: 1, y: 2 }],
        difficultyParams: {
            minSteps: 5, maxSteps: 8, requiredJumps: 1,
            obstacleDensity: [1, 3], lakeDensity: [0, 1],
            branchComplexity: 1, deadEndTolerance: 1, mazeLevel: 1
        }
    },
    {
        name: 'Medium-3',
        difficulty: 'Medium',
        start: { x: 4, y: 0, dir: 'down' },
        goalOptions: [{ x: 0, y: 4 }, { x: 1, y: 3 }],
        obstacleZones: [{ x: 3, y: 1 }, { x: 2, y: 2 }],
        lakeZones: [{ x: 1, y: 1 }],
        difficultyParams: {
            minSteps: 6, maxSteps: 8, requiredJumps: 1,
            obstacleDensity: [1, 3], lakeDensity: [0, 1],
            branchComplexity: 1, deadEndTolerance: 1, mazeLevel: 1
        }
    },
    {
        name: 'Medium-4',
        difficulty: 'Medium',
        start: { x: 0, y: 3, dir: 'right' },
        goalOptions: [{ x: 4, y: 0 }, { x: 3, y: 4 }],
        obstacleZones: [{ x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 2 }],
        lakeZones: [{ x: 2, y: 1 }],
        difficultyParams: {
            minSteps: 5, maxSteps: 8, requiredJumps: 1,
            obstacleDensity: [1, 3], lakeDensity: [0, 1],
            branchComplexity: 1, deadEndTolerance: 1, mazeLevel: 1
        }
    },
    {
        name: 'Medium-5',
        difficulty: 'Medium',
        start: { x: 2, y: 4, dir: 'up' },
        goalOptions: [{ x: 4, y: 2 }, { x: 1, y: 0 }],
        obstacleZones: [{ x: 2, y: 3 }, { x: 3, y: 2 }],
        lakeZones: [{ x: 1, y: 3 }],
        difficultyParams: {
            minSteps: 5, maxSteps: 8, requiredJumps: 1,
            obstacleDensity: [1, 3], lakeDensity: [0, 1],
            branchComplexity: 1, deadEndTolerance: 1, mazeLevel: 1
        }
    },
    // Hard Templates
    {
        name: 'Hard-1',
        difficulty: 'Hard',
        start: { x: 0, y: 4, dir: 'up' },
        goalOptions: [{ x: 4, y: 0 }, { x: 3, y: 1 }],
        obstacleZones: [{ x: 1, y: 4 }, { x: 2, y: 3 }, { x: 3, y: 2 }],
        lakeZones: [{ x: 1, y: 2 }, { x: 2, y: 1 }],
        difficultyParams: {
            minSteps: 8, maxSteps: 12, requiredJumps: 2,
            obstacleDensity: [2, 4], lakeDensity: [1, 2],
            branchComplexity: 2, deadEndTolerance: 2, mazeLevel: 2
        }
    },
    {
        name: 'Hard-2',
        difficulty: 'Hard',
        start: { x: 4, y: 4, dir: 'left' },
        goalOptions: [{ x: 0, y: 0 }, { x: 1, y: 2 }],
        obstacleZones: [{ x: 3, y: 4 }, { x: 2, y: 3 }, { x: 2, y: 1 }],
        lakeZones: [{ x: 1, y: 3 }, { x: 3, y: 2 }],
        difficultyParams: {
            minSteps: 8, maxSteps: 12, requiredJumps: 2,
            obstacleDensity: [2, 4], lakeDensity: [1, 2],
            branchComplexity: 2, deadEndTolerance: 2, mazeLevel: 2
        }
    },
    {
        name: 'Hard-3',
        difficulty: 'Hard',
        start: { x: 0, y: 1, dir: 'right' },
        goalOptions: [{ x: 4, y: 3 }, { x: 3, y: 4 }],
        obstacleZones: [{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 2, y: 3 }],
        lakeZones: [{ x: 1, y: 2 }, { x: 3, y: 2 }],
        difficultyParams: {
            minSteps: 9, maxSteps: 12, requiredJumps: 2,
            obstacleDensity: [2, 4], lakeDensity: [1, 2],
            branchComplexity: 2, deadEndTolerance: 2, mazeLevel: 2
        }
    },
    {
        name: 'Hard-4',
        difficulty: 'Hard',
        start: { x: 4, y: 0, dir: 'down' },
        goalOptions: [{ x: 0, y: 4 }, { x: 2, y: 3 }],
        obstacleZones: [{ x: 3, y: 1 }, { x: 2, y: 2 }, { x: 1, y: 3 }],
        lakeZones: [{ x: 3, y: 3 }, { x: 1, y: 1 }],
        difficultyParams: {
            minSteps: 8, maxSteps: 12, requiredJumps: 2,
            obstacleDensity: [2, 4], lakeDensity: [1, 2],
            branchComplexity: 2, deadEndTolerance: 2, mazeLevel: 2
        }
    },
    {
        name: 'Hard-5',
        difficulty: 'Hard',
        start: { x: 1, y: 0, dir: 'down' },
        goalOptions: [{ x: 4, y: 4 }, { x: 0, y: 3 }],
        obstacleZones: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }],
        lakeZones: [{ x: 2, y: 1 }, { x: 1, y: 3 }],
        difficultyParams: {
            minSteps: 8, maxSteps: 12, requiredJumps: 2,
            obstacleDensity: [2, 4], lakeDensity: [1, 2],
            branchComplexity: 2, deadEndTolerance: 2, mazeLevel: 2
        }
    }
];
