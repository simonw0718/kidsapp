import { useState, useEffect, useCallback, useRef } from 'react';
import { type GameMode, type Direction, type Position, getModeConfig, getRandomLevel } from '../data/levels';
import { commandRegistry } from '../commands/CommandRegistry';
import { forwardCommand } from '../commands/forward';
import { turnLeftCommand } from '../commands/turnLeft';
import { turnRightCommand } from '../commands/turnRight';
import { jumpCommand } from '../commands/jump';
import type { GameContext } from '../commands/types';

// Register commands
commandRegistry.register(forwardCommand);
commandRegistry.register(turnLeftCommand);
commandRegistry.register(turnRightCommand);
commandRegistry.register(jumpCommand);

// Audio instances
const walkAudio = new Audio('/audio/walk.mp3');
const turnAudio = new Audio('/audio/walk_turn.mp3');
const winAudio = new Audio('/audio/animal_game_win.mp3');
const hitAudio = new Audio('/audio/hit_sound.mp3');

// Helper function to play audio for specified duration
const playAudioForDuration = (audio: HTMLAudioElement, duration: number) => {
    audio.currentTime = 0;
    audio.play().catch(e => console.warn('Audio play failed:', e));
    setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
    }, duration);
};

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

    // Unified Pipeline Execution
    const executePipeline = (cmdId: string, currentPos: Position, currentDir: Direction) => {
        const command = commandRegistry.get(cmdId);
        if (!command) {
            console.error(`Command ${cmdId} not found`);
            return { ok: false };
        }

        const ctx: GameContext = {
            playerPos: currentPos,
            playerDir: currentDir,
            level: currentLevel,
            gridSize: currentLevel.gridSize,
            gameMode: gameMode
        };

        // 1. Validate
        const validation = command.validate(ctx);
        if (!validation.ok) {
            return validation; // Return error result
        }

        // 2. Resolve
        const result = command.resolve(ctx);
        return result;
    };

    // Direct control: execute command immediately
    const executeDirectCommand = (cmdId: CommandType) => {
        if (isWon || isLost || isJumping) return;

        const result = executePipeline(cmdId, playerPos, playerDir);

        if (!result.ok) {
            if (result.hitObstacle || result.outOfBounds) {
                setIsCollision(true);
                // Play hit sound
                hitAudio.currentTime = 0;
                hitAudio.play().catch(e => console.warn('Hit audio play failed:', e));
                setTimeout(() => setIsCollision(false), 500);
            }
            return;
        }

        const { nextPos, nextDir } = result;
        if (!nextPos || !nextDir) return;

        // Animation & Audio Logic (UI Layer)
        if (cmdId === 'jump') {
            setIsJumping(true);
            playAudioForDuration(walkAudio, 1000);
            setTimeout(() => {
                setPlayerPos(nextPos);
                setPlayerDir(nextDir);
                setIsJumping(false);
                checkWin(nextPos);
            }, 1000);
        } else if (cmdId === 'forward') {
            playAudioForDuration(walkAudio, 1000);
            setPlayerPos(nextPos);
            setPlayerDir(nextDir);
            checkWin(nextPos);
        } else if (cmdId === 'left' || cmdId === 'right') {
            playAudioForDuration(turnAudio, 1000);
            setPlayerPos(nextPos);
            setPlayerDir(nextDir);
            checkWin(nextPos);
        }
    };

    const checkWin = (pos: Position) => {
        if (pos.x === currentLevel.goal.x && pos.y === currentLevel.goal.y) {
            setIsWon(true);
            winAudio.currentTime = 0;
            winAudio.play().catch(e => console.warn('Win audio play failed:', e));
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
                winAudio.currentTime = 0;
                winAudio.play().catch(e => console.warn('Win audio play failed:', e));
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
            setTimeout(() => setCommands([]), 500);
            return;
        }

        setCurrentCommandIndex(stepIndex);
        const cmdId = commands[stepIndex];
        const { playerPos: currPos, playerDir: currDir } = stateRef.current;

        const result = executePipeline(cmdId, currPos, currDir);

        if (!result.ok) {
            if (result.hitObstacle || result.outOfBounds) {
                setIsCollision(true);
                // Play hit sound
                hitAudio.currentTime = 0;
                hitAudio.play().catch(e => console.warn('Hit audio play failed:', e));
                setTimeout(() => setIsCollision(false), 500);
            }

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

        const { nextPos, nextDir } = result;
        if (!nextPos || !nextDir) return;

        // Animation & Audio Logic
        if (cmdId === 'jump') {
            setIsJumping(true);
            playAudioForDuration(walkAudio, 2000); // Slower in programmed mode? Or keep consistent?
            // Keeping consistent with previous logic which used 2000ms for programmed jump
            timerRef.current = setTimeout(() => {
                setPlayerPos(nextPos);
                setPlayerDir(nextDir);
                setIsJumping(false);
                timerRef.current = setTimeout(() => executeStepRef.current?.(stepIndex + 1), 600);
            }, 1000);
        } else if (cmdId === 'forward') {
            playAudioForDuration(walkAudio, 2000);
            setPlayerPos(nextPos);
            setPlayerDir(nextDir);
            timerRef.current = setTimeout(() => executeStepRef.current?.(stepIndex + 1), 600);
        } else if (cmdId === 'left' || cmdId === 'right') {
            playAudioForDuration(turnAudio, 1000);
            setPlayerPos(nextPos);
            setPlayerDir(nextDir);
            timerRef.current = setTimeout(() => executeStepRef.current?.(stepIndex + 1), 600);
        }
    }, [commands, currentLevel, modeConfig, gameMode]);

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
