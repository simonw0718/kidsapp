import { useState, useEffect, useCallback, useRef } from 'react';
import { type GameMode, type Direction, type Position, getModeConfig, getRandomLevel } from '../data/levels';

export type CommandType = 'forward' | 'left' | 'right' | 'jump';

export const useAnimalGame = (initialMode: GameMode = 1) => {
    const [gameMode, setGameMode] = useState<GameMode>(initialMode);
    const [currentLevel, setCurrentLevel] = useState(() => getRandomLevel(gameMode));
    const [commands, setCommands] = useState<CommandType[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isWon, setIsWon] = useState(false);
    const [isLost, setIsLost] = useState(false);

    const [isJumping, setIsJumping] = useState(false);

    const [isCollision, setIsCollision] = useState(false);

    // Player state
    const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
    const [playerDir, setPlayerDir] = useState<Direction>('right');
    const [currentCommandIndex, setCurrentCommandIndex] = useState(-1);

    const modeConfig = getModeConfig(gameMode);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const initialPosRef = useRef<Position & { dir: Direction }>(currentLevel.start);

    // Initialize level when mode changes
    useEffect(() => {
        const newLevel = getRandomLevel(gameMode);
        setCurrentLevel(newLevel);
        setPlayerPos({ x: newLevel.start.x, y: newLevel.start.y });
        setPlayerDir(newLevel.start.dir);
        initialPosRef.current = newLevel.start;
        setCommands([]);
        setIsWon(false);
        setIsLost(false);
        setIsJumping(false);
        setIsCollision(false);
        setCurrentCommandIndex(-1);
    }, [gameMode]);

    const resetLevel = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsPlaying(false);
        setIsWon(false);
        setIsLost(false);
        setIsJumping(false);
        setIsCollision(false);
        setPlayerPos({ x: initialPosRef.current.x, y: initialPosRef.current.y });
        setPlayerDir(initialPosRef.current.dir);
        setCurrentCommandIndex(-1);
        setCommands([]);
    }, []);

    const nextLevel = () => {
        const newLevel = getRandomLevel(gameMode);
        setCurrentLevel(newLevel);
        setPlayerPos({ x: newLevel.start.x, y: newLevel.start.y });
        setPlayerDir(newLevel.start.dir);
        initialPosRef.current = newLevel.start;
        setCommands([]);
        setIsWon(false);
        setIsLost(false);
        setIsJumping(false);
        setIsCollision(false);
        setCurrentCommandIndex(-1);
    };

    const addCommand = (cmd: CommandType) => {
        if (isPlaying || isWon || modeConfig.isDirect) return;
        if (currentLevel.maxCommands && commands.length >= currentLevel.maxCommands) return;
        setCommands([...commands, cmd]);
    };

    const removeCommand = (index: number) => {
        if (isPlaying || isWon || modeConfig.isDirect) return;
        const newCmds = [...commands];
        newCmds.splice(index, 1);
        setCommands(newCmds);
    };

    const clearCommands = () => {
        if (isPlaying) return;
        setCommands([]);
    };

    const calculateNextState = (pos: Position, dir: Direction, cmd: CommandType) => {
        let newPos = { ...pos };
        let newDir = dir;
        let hitObstacle = false;
        let outOfBounds = false;

        const getForwardPos = (p: Position, d: Direction, steps: number = 1) => {
            const next = { ...p };
            switch (d) {
                case 'up': next.y -= steps; break;
                case 'down': next.y += steps; break;
                case 'left': next.x -= steps; break;
                case 'right': next.x += steps; break;
            }
            return next;
        };

        const isObstacle = (x: number, y: number) => currentLevel.obstacles.some(o => o.x === x && o.y === y);
        const isLake = (x: number, y: number) => currentLevel.lakes?.some(l => l.x === x && l.y === y) ?? false;

        if (cmd === 'left') {
            const dirs: Direction[] = ['up', 'left', 'down', 'right'];
            const idx = dirs.indexOf(dir);
            newDir = dirs[(idx + 1) % 4];
        } else if (cmd === 'right') {
            const dirs: Direction[] = ['up', 'right', 'down', 'left'];
            const idx = dirs.indexOf(dir);
            newDir = dirs[(idx + 1) % 4];
        } else if (cmd === 'forward') {
            const next = getForwardPos(pos, dir, 1);
            if (next.x < 0 || next.x >= currentLevel.gridSize || next.y < 0 || next.y >= currentLevel.gridSize) {
                outOfBounds = true;
            } else if (isObstacle(next.x, next.y) || isLake(next.x, next.y)) {
                hitObstacle = true;
            } else {
                newPos = next;
            }
        } else if (cmd === 'jump') {
            const next = getForwardPos(pos, dir, 2);
            const mid = getForwardPos(pos, dir, 1); // The tile we are jumping over

            if (next.x < 0 || next.x >= currentLevel.gridSize || next.y < 0 || next.y >= currentLevel.gridSize) {
                outOfBounds = true;
            } else if (isObstacle(next.x, next.y) || isLake(next.x, next.y)) {
                // Cannot land on obstacle or lake
                hitObstacle = true;
            } else if (isLake(mid.x, mid.y)) {
                // Cannot jump OVER a lake
                hitObstacle = true;
            } else {
                newPos = next;
            }
        }

        return { newPos, newDir, hitObstacle, outOfBounds };
    };

    // Direct control: execute command immediately
    const executeDirectCommand = (cmd: CommandType) => {
        if (isWon || isLost || isJumping) return;

        const { newPos, newDir, hitObstacle, outOfBounds } = calculateNextState(playerPos, playerDir, cmd);

        // In direct control mode, ignore invalid moves instead of setting isLost
        if (hitObstacle || outOfBounds) {
            setIsCollision(true);
            setTimeout(() => setIsCollision(false), 500);
            return;
        }

        if (cmd === 'jump') {
            setIsJumping(true);
            // [調整] 跳躍動畫時間 1秒
            setTimeout(() => {
                setPlayerPos(newPos);
                setPlayerDir(newDir);
                setIsJumping(false);

                // Check win
                if (newPos.x === currentLevel.goal.x && newPos.y === currentLevel.goal.y) {
                    setIsWon(true);
                }
            }, 1000);
        } else {
            setPlayerPos(newPos);
            setPlayerDir(newDir);

            // Check win
            if (newPos.x === currentLevel.goal.x && newPos.y === currentLevel.goal.y) {
                setIsWon(true);
            }
        }
    };

    // Pre-programmed execution
    const stateRef = useRef({ playerPos, playerDir });
    useEffect(() => {
        stateRef.current = { playerPos, playerDir };
    }, [playerPos, playerDir]);

    const executeStepRef = useRef<((index: number) => void) | null>(null);

    const executeStep = useCallback((stepIndex: number) => {
        if (stepIndex >= commands.length) {
            // Finished all commands
            const { playerPos: finalPos } = stateRef.current;
            if (finalPos.x === currentLevel.goal.x && finalPos.y === currentLevel.goal.y) {
                setIsWon(true);
            } else {
                setIsLost(true);
                // Mode 4: Reset on failure
                if (modeConfig.resetOnFail) {
                    setTimeout(() => {
                        setPlayerPos({ x: initialPosRef.current.x, y: initialPosRef.current.y });
                        setPlayerDir(initialPosRef.current.dir);
                        setCommands([]);
                    }, 1000);
                }
            }
            setIsPlaying(false);
            // Mode 3: Clear commands after execution
            // [修復] 確保執行完畢後清空指令序列
            setTimeout(() => setCommands([]), 500);
            return;
        }

        setCurrentCommandIndex(stepIndex);
        const cmd = commands[stepIndex];
        const { playerPos: currPos, playerDir: currDir } = stateRef.current;

        const { newPos, newDir, hitObstacle, outOfBounds } = calculateNextState(currPos, currDir, cmd);

        if (hitObstacle || outOfBounds) {
            setIsCollision(true);
            setTimeout(() => setIsCollision(false), 500);

            setIsLost(true);
            setIsPlaying(false);
            // Mode 4: Reset on failure
            if (modeConfig.resetOnFail) {
                setTimeout(() => {
                    setPlayerPos({ x: initialPosRef.current.x, y: initialPosRef.current.y });
                    setPlayerDir(initialPosRef.current.dir);
                    setCommands([]);
                }, 1000);
            }
            return;
        }

        if (cmd === 'jump') {
            setIsJumping(true);
            // [調整] 跳躍動畫時間 1秒
            timerRef.current = setTimeout(() => {
                setPlayerPos(newPos);
                setPlayerDir(newDir);
                setIsJumping(false);
                timerRef.current = setTimeout(() => executeStepRef.current?.(stepIndex + 1), 600);
            }, 1000);
        } else {
            setPlayerPos(newPos);
            setPlayerDir(newDir);
            timerRef.current = setTimeout(() => executeStepRef.current?.(stepIndex + 1), 600);
        }
    }, [commands, currentLevel, modeConfig]);

    useEffect(() => {
        executeStepRef.current = executeStep;
    }, [executeStep]);

    const startGame = () => {
        if (commands.length === 0 || modeConfig.isDirect) return;
        setIsPlaying(true);
        setIsWon(false);
        setIsLost(false);
        setIsJumping(false);
        setIsCollision(false);
        setCurrentCommandIndex(-1);

        timerRef.current = setTimeout(() => executeStep(0), 500);
    };

    const stopGame = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setIsPlaying(false);
        setIsJumping(false);
        setIsCollision(false);
        setCurrentCommandIndex(-1);
    };

    return {
        gameMode,
        setGameMode,
        modeConfig,
        currentLevel,
        commands,
        addCommand,
        removeCommand,
        clearCommands,
        isPlaying,
        isWon,
        isLost,
        isJumping,
        isCollision,
        playerPos,
        playerDir,
        currentCommandIndex,
        startGame,
        stopGame,
        resetLevel,
        nextLevel,
        executeDirectCommand
    };
};
