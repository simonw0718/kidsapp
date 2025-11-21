import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import { useAnimalGame, type CommandType } from './hooks/useAnimalGame';
import { GridMap } from './components/GridMap';
import { DirectControlPanel } from './components/DirectControlPanel';
import { CommandPalette } from './components/CommandPalette';
import { CommandSequence } from './components/CommandSequence';
import { ControlPanel } from './components/ControlPanel';
import './animal-commands.css';

import { useGameLock } from '../../core/hooks/useGameLock';

export const AnimalGame: React.FC = () => {
    // [Zoom Lock] Lock viewport for game
    useGameLock();

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialMode = Number(searchParams.get('mode') || 1) as 1 | 2 | 3 | 4;
    const character = (searchParams.get('character') as 'rabbit' | 'dino') || 'rabbit';

    const {
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
    } = useAnimalGame(initialMode);

    // Handle Win/Loss effects
    useEffect(() => {
        if (isWon) {
            const audio = new Audio('/sounds/correct_sound.mp3');
            audio.play().catch(() => { });
        }
    }, [isWon, nextLevel]);

    useEffect(() => {
        if (isLost) {
            const audio = new Audio('/sounds/failure_sound.mp3');
            audio.play().catch(() => { });
        }
    }, [isLost]);

    const handleReset = () => {
        clearCommands();
        resetLevel();
    };

    return (
        <PageContainer
            title="動物指令大冒險"
            headerRight={
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={nextLevel}
                        title="換一張地圖"
                        style={{
                            padding: '8px',
                            borderRadius: '50%',
                            border: '2px solid #4dd0e1',
                            background: 'white',
                            fontSize: '18px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            color: '#0097a7',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        🔄
                    </button>
                    <button
                        onClick={() => navigate('/animal-commands')}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '2px solid #4dd0e1',
                            background: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            color: '#0097a7'
                        }}
                    >
                        切換模式
                    </button>
                    <BackToHomeButton />
                </div>
            }
        >
            <div className="ac-game-layout">
                <div className="ac-left-panel">
                    <GridMap
                        gridSize={currentLevel.gridSize}
                        playerPos={playerPos}
                        playerDir={playerDir}
                        goal={currentLevel.goal}
                        obstacles={currentLevel.obstacles}
                        lakes={currentLevel.lakes}
                        isWon={isWon}
                        isLost={isLost}
                        isJumping={isJumping}
                        isCollision={isCollision}
                        character={character}
                    />
                </div>

                <div className="ac-right-panel">
                    {isWon ? (
                        <div className="ac-win-menu">
                            <button className="ac-win-btn ac-win-btn-next" onClick={nextLevel}>
                                NEXT ➡️
                            </button>
                            <button className="ac-win-btn ac-win-btn-mode" onClick={() => navigate('/animal-commands')}>
                                CHANGE MODE 🔄
                            </button>
                        </div>
                    ) : modeConfig.isDirect ? (
                        /* Mode 1-2: Direct Control */
                        <DirectControlPanel
                            allowedCommands={modeConfig.allowedCommands}
                            onCommand={(cmd) => executeDirectCommand(cmd as CommandType)}
                            disabled={isWon || isLost}
                        />
                    ) : (
                        /* Mode 3-4: Pre-programmed Commands */
                        <div className="ac-command-section">
                            <CommandPalette
                                allowedCommands={modeConfig.allowedCommands}
                                onAddCommand={addCommand}
                                disabled={isPlaying || isWon}
                            />
                            <div className="ac-sequence-wrapper">
                                <CommandSequence
                                    commands={commands}
                                    maxCommands={currentLevel.maxCommands || 10}
                                    currentIndex={currentCommandIndex}
                                    onRemoveCommand={removeCommand}
                                    disabled={isPlaying || isWon}
                                />
                                <ControlPanel
                                    isPlaying={isPlaying}
                                    onStart={startGame}
                                    onStop={stopGame}
                                    onReset={handleReset}
                                    disabled={commands.length === 0 || isWon}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};
