import { useState, useEffect, useCallback, useRef } from 'react';
import { generateLevel, getModeConfig, type GameMode, type Position, type Direction, type CommandType } from '../data/levels';
import type { Difficulty } from '../data/levelTemplates';
import { commandRegistry } from '../commands/CommandRegistry';
import { forwardCommand } from '../commands/forward';
import { turnLeftCommand } from '../commands/turnLeft';
import { turnRightCommand } from '../commands/turnRight';
import { jumpCommand } from '../commands/jump';
import type { GameContext } from '../commands/types';
import { audioManager } from '../../../core/audio/audioPlayer';

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

// Track active audio instances for cleanup
const activeAudioInstances: HTMLAudioElement[] = [];

// Helper function to play audio with duration limit
const playAudio = (audio: HTMLAudioElement, maxDuration: number = 1000) => {
    // Limit total active audio instances to prevent memory issues
    const MAX_AUDIO_INSTANCES = 10;
    if (activeAudioInstances.length >= MAX_AUDIO_INSTANCES) {
        // Stop and remove oldest instance
        const oldest = activeAudioInstances.shift();
        if (oldest) {
            oldest.pause();
            oldest.currentTime = 0;
        }
    }

    const sound = audio.cloneNode() as HTMLAudioElement;
    // Use master volume from audioManager
    sound.volume = audioManager.getVolume();

    // Track this instance
    activeAudioInstances.push(sound);

    // Play the sound
    sound.play().catch(e => console.warn('Audio play failed:', e));

    // Stop after max duration and cleanup
    const timeoutId = setTimeout(() => {
        sound.pause();
        sound.currentTime = 0;
        const index = activeAudioInstances.indexOf(sound);
        if (index > -1) {
            activeAudioInstances.splice(index, 1);
        }
    }, maxDuration);

    // Also cleanup when sound ends naturally
    sound.addEventListener('ended', () => {
        clearTimeout(timeoutId);
        const index = activeAudioInstances.indexOf(sound);
        if (index > -1) {
            activeAudioInstances.splice(index, 1);
        }
    });
};

// Helper to stop all active audio
const stopAllAudio = () => {
    activeAudioInstances.forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
    });
    activeAudioInstances.length = 0;
};

export const useAnimalGame = (initialMode: GameMode = 1, difficulty: Difficulty = 'Easy', seed?: string) => {
    const [gameMode, setGameMode] = useState<GameMode>(initialMode);
    const [currentLevel, setCurrentLevel] = useState(() => generateLevel(gameMode, difficulty, seed));
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

    // Initialize level when mode or difficulty changes
    useEffect(() => {
        const newLevel = generateLevel(gameMode, difficulty, seed);
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
    }, [gameMode, difficulty, seed]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            stopAllAudio();
        };
    }, []);

    const resetLevel = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        stopAllAudio();
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
        stopAllAudio();
        // For Adventure, the seed should change or be handled by parent
        // For Free Play, we generate a new random level (no seed)
        // Note: If seed is provided (Adventure), nextLevel logic needs to be handled by parent changing the seed/difficulty
        // But for simple "Play Again" in Free Play, we want a new random level.

        const newLevel = generateLevel(gameMode, difficulty, undefined); // Always random for next level in Free Play context
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
            playAudio(walkAudio);
            setTimeout(() => {
                setPlayerPos(nextPos);
                setPlayerDir(nextDir);
                setIsJumping(false);
                checkWin(nextPos);
            }, 1000);
        } else if (cmdId === 'forward') {
            playAudio(walkAudio);
            setPlayerPos(nextPos);
            setPlayerDir(nextDir);
            checkWin(nextPos);
        } else if (cmdId === 'left' || cmdId === 'right') {
            playAudio(turnAudio);
            setPlayerPos(nextPos);
            setPlayerDir(nextDir);
            checkWin(nextPos);
        }
    };

    const checkWin = (pos: Position) => {
        if (pos.x === currentLevel.goal.x && pos.y === currentLevel.goal.y) {
            setIsWon(true);
            playAudio(winAudio);
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
                playAudio(winAudio);
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
                playAudio(hitAudio);
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
            playAudio(walkAudio);
            timerRef.current = setTimeout(() => {
                setPlayerPos(nextPos);
                setPlayerDir(nextDir);
                setIsJumping(false);
                timerRef.current = setTimeout(() => executeStepRef.current?.(stepIndex + 1), 600);
            }, 1000);
        } else if (cmdId === 'forward') {
            playAudio(walkAudio);
            setPlayerPos(nextPos);
            setPlayerDir(nextDir);
            timerRef.current = setTimeout(() => executeStepRef.current?.(stepIndex + 1), 600);
        } else if (cmdId === 'left' || cmdId === 'right') {
            playAudio(turnAudio);
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
        // Prevent multiple simultaneous executions
        if (isPlaying) return;

        // Clear any existing timers and audio
        if (timerRef.current) clearTimeout(timerRef.current);
        stopAllAudio();

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
        stopAllAudio();
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
