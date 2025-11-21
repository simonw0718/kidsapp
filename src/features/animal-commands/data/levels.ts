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
    obstacles: Position[];
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
        allowedCommands: ['forward', 'left', 'right', 'jump'],
        isDirect: true,
        clearOnExecute: false,
        resetOnFail: false
    },
    {
        id: 3,
        name: '預排指令 (連續)',
        description: '預先排列指令，執行後可繼續輸入',
        gridSize: 5,
        allowedCommands: ['forward', 'left', 'right', 'jump'],
        isDirect: false,
        clearOnExecute: true,
        resetOnFail: false
    },
    {
        id: 4,
        name: '預排指令 (一次完成)',
        description: '預先排列指令，失敗會重置到起點',
        gridSize: 5,
        allowedCommands: ['forward', 'left', 'right', 'jump'],
        isDirect: false,
        clearOnExecute: false,
        resetOnFail: true
    }
];

// Level templates for each mode (5 levels per mode)
export const MODE_LEVELS: Record<GameMode, LevelConfig[]> = {
    1: [
        // Mode 1: Direct control, 4x4, simple paths
        {
            id: 1,
            mode: 1,
            gridSize: 4,
            start: { x: 0, y: 0, dir: 'right' },
            goal: { x: 2, y: 0 },
            obstacles: [],
            allowedCommands: ['forward', 'left', 'right']
        },
        {
            id: 2,
            mode: 1,
            gridSize: 4,
            start: { x: 0, y: 0, dir: 'right' },
            goal: { x: 3, y: 3 },
            obstacles: [],
            allowedCommands: ['forward', 'left', 'right']
        },
        {
            id: 3,
            mode: 1,
            gridSize: 4,
            start: { x: 3, y: 0, dir: 'down' },
            goal: { x: 0, y: 3 },
            obstacles: [],
            allowedCommands: ['forward', 'left', 'right']
        },
        {
            id: 4,
            mode: 1,
            gridSize: 4,
            start: { x: 1, y: 1, dir: 'up' },
            goal: { x: 2, y: 2 },
            obstacles: [],
            allowedCommands: ['forward', 'left', 'right']
        },
        {
            id: 5,
            mode: 1,
            gridSize: 4,
            start: { x: 0, y: 3, dir: 'right' },
            goal: { x: 3, y: 0 },
            obstacles: [],
            allowedCommands: ['forward', 'left', 'right']
        }
    ],
    2: [
        // Mode 2: Direct control with jump, 5x5, obstacles
        {
            id: 1,
            mode: 2,
            gridSize: 5,
            start: { x: 0, y: 0, dir: 'right' },
            goal: { x: 4, y: 0 },
            obstacles: [{ x: 2, y: 0 }],
            allowedCommands: ['forward', 'left', 'right', 'jump']
        },
        {
            id: 2,
            mode: 2,
            gridSize: 5,
            start: { x: 0, y: 0, dir: 'right' },
            goal: { x: 4, y: 4 },
            obstacles: [{ x: 2, y: 0 }, { x: 0, y: 2 }],
            allowedCommands: ['forward', 'left', 'right', 'jump']
        },
        {
            id: 3,
            mode: 2,
            gridSize: 5,
            start: { x: 2, y: 2, dir: 'up' },
            goal: { x: 4, y: 4 },
            obstacles: [{ x: 2, y: 3 }, { x: 3, y: 2 }],
            allowedCommands: ['forward', 'left', 'right', 'jump']
        },
        {
            id: 4,
            mode: 2,
            gridSize: 5,
            start: { x: 0, y: 4, dir: 'right' },
            goal: { x: 4, y: 0 },
            obstacles: [{ x: 2, y: 4 }, { x: 2, y: 2 }, { x: 4, y: 2 }],
            allowedCommands: ['forward', 'left', 'right', 'jump']
        },
        {
            id: 5,
            mode: 2,
            gridSize: 5,
            start: { x: 1, y: 1, dir: 'right' },
            goal: { x: 3, y: 3 },
            obstacles: [{ x: 2, y: 1 }, { x: 1, y: 2 }],
            allowedCommands: ['forward', 'left', 'right', 'jump']
        }
    ],
    3: [
        // Mode 3: Pre-programmed, clears after execute, 5x5
        {
            id: 1,
            mode: 3,
            gridSize: 5,
            start: { x: 0, y: 0, dir: 'right' },
            goal: { x: 4, y: 4 },
            obstacles: [{ x: 2, y: 0 }],
            allowedCommands: ['forward', 'left', 'right', 'jump'],
            maxCommands: 8
        },
        {
            id: 2,
            mode: 3,
            gridSize: 5,
            start: { x: 0, y: 0, dir: 'up' },
            goal: { x: 4, y: 4 },
            obstacles: [{ x: 0, y: 2 }, { x: 2, y: 4 }],
            allowedCommands: ['forward', 'left', 'right', 'jump'],
            maxCommands: 8
        },
        {
            id: 3,
            mode: 3,
            gridSize: 5,
            start: { x: 2, y: 2, dir: 'up' },
            goal: { x: 0, y: 0 },
            obstacles: [{ x: 2, y: 1 }, { x: 1, y: 2 }],
            allowedCommands: ['forward', 'left', 'right', 'jump'],
            maxCommands: 8
        },
        {
            id: 4,
            mode: 3,
            gridSize: 5,
            start: { x: 4, y: 0, dir: 'down' },
            goal: { x: 0, y: 4 },
            obstacles: [{ x: 4, y: 2 }, { x: 2, y: 4 }],
            allowedCommands: ['forward', 'left', 'right', 'jump'],
            maxCommands: 10
        },
        {
            id: 5,
            mode: 3,
            gridSize: 5,
            start: { x: 1, y: 1, dir: 'right' },
            goal: { x: 3, y: 3 },
            obstacles: [{ x: 2, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 2 }],
            allowedCommands: ['forward', 'left', 'right', 'jump'],
            maxCommands: 10
        }
    ],
    4: [
        // Mode 4: Pre-programmed, one-shot, reset on fail, 5x5
        {
            id: 1,
            mode: 4,
            gridSize: 5,
            start: { x: 0, y: 0, dir: 'right' },
            goal: { x: 3, y: 0 },
            obstacles: [{ x: 1, y: 0 }],
            allowedCommands: ['forward', 'left', 'right', 'jump'],
            maxCommands: 4
        },
        {
            id: 2,
            mode: 4,
            gridSize: 5,
            start: { x: 0, y: 0, dir: 'right' },
            goal: { x: 4, y: 0 },
            obstacles: [{ x: 2, y: 0 }],
            allowedCommands: ['forward', 'left', 'right', 'jump'],
            maxCommands: 5
        },
        {
            id: 3,
            mode: 4,
            gridSize: 5,
            start: { x: 0, y: 0, dir: 'up' },
            goal: { x: 4, y: 4 },
            obstacles: [{ x: 0, y: 2 }, { x: 2, y: 4 }],
            allowedCommands: ['forward', 'left', 'right', 'jump'],
            maxCommands: 10
        },
        {
            id: 4,
            mode: 4,
            gridSize: 5,
            start: { x: 2, y: 2, dir: 'up' },
            goal: { x: 4, y: 4 },
            obstacles: [{ x: 2, y: 3 }, { x: 3, y: 2 }],
            allowedCommands: ['forward', 'left', 'right', 'jump'],
            maxCommands: 8
        },
        {
            id: 5,
            mode: 4,
            gridSize: 5,
            start: { x: 0, y: 4, dir: 'right' },
            goal: { x: 4, y: 0 },
            obstacles: [{ x: 2, y: 4 }, { x: 2, y: 2 }, { x: 4, y: 2 }],
            allowedCommands: ['forward', 'left', 'right', 'jump'],
            maxCommands: 12
        }
    ]
};

// Helper to get a random level for a mode
export const getRandomLevel = (mode: GameMode): LevelConfig => {
    const levels = MODE_LEVELS[mode];
    const randomIndex = Math.floor(Math.random() * levels.length);
    return levels[randomIndex];
};

// Helper to get mode config
export const getModeConfig = (mode: GameMode): ModeConfig => {
    return GAME_MODES.find(m => m.id === mode) || GAME_MODES[0];
};
