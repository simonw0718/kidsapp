import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { BackToHomeButton } from '../../components/common/BackToHomeButton';
import { useAnimalGame } from './hooks/useAnimalGame';
import { GridMap } from './components/GridMap';
import { DirectControlPanel } from './components/DirectControlPanel';
import { CommandPalette } from './components/CommandPalette';
import { CommandSequence } from './components/CommandSequence';
import { ControlPanel } from './components/ControlPanel';
import type { Difficulty } from './data/levelTemplates';
import './animal-commands.css';

import { useGameLock } from '../../core/hooks/useGameLock';
import { audioManager } from '../../core/audio/audioPlayer';

// Helper component to handle audio playback on mount
const CelebrationWithAudio: React.FC<{ character: string; navigate: (path: string) => void; shouldPlayAudio: boolean }> = ({ character, navigate, shouldPlayAudio }) => {
    useEffect(() => {
        // Only play audio once when component mounts and shouldPlayAudio is true
        if (shouldPlayAudio) {
            audioManager.play('/audio/victory.mp3');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - only run on mount

    return (
        <>
            <img
                src={`/images/animals-game/celebration_${character}.jpg`}
                alt="Celebration"
                className="ac-celebration-img"
            />
            <div className="ac-celebration-actions">
                <button className="ac-btn-primary" onClick={() => navigate('/animal-commands')}>
                    回首頁
                </button>
            </div>
        </>
    );
};

export const AnimalGame: React.FC = () => {
    // [Zoom Lock] Lock viewport for game
    useGameLock();

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Parse params
    const initialMode = Number(searchParams.get('mode') || 1) as 1 | 2 | 3;
    const initialDifficulty = (searchParams.get('difficulty') as Difficulty) || 'Easy';
    const adventureType = searchParams.get('adventureType') as 'daily' | 'normal' | null;
    const character = (searchParams.get('character') as 'rabbit' | 'dino') || 'rabbit';

    // State for Adventure progression
    const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>(initialDifficulty);
    // Track if all three levels have been completed (for victory audio)
    const [hasCompletedAllLevels, setHasCompletedAllLevels] = useState(false);

    // Generate seed for Adventure
    const getSeed = () => {
        if (adventureType === 'daily') {
            const date = new Date();
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${currentDifficulty}`;
        } else if (adventureType === 'normal') {
            return `${Math.random()}`; // Random seed for normal adventure
        }
        return undefined; // Free play (random)
    };

    const [seed, setSeed] = useState(getSeed());

    // Update seed when difficulty changes in Adventure
    useEffect(() => {
        if (adventureType) {
            setSeed(getSeed());
        }
    }, [currentDifficulty, adventureType]);

    const {
        currentLevel,
        commands,
        isPlaying,
        isWon,
        isLost,
        isJumping,
        isCollision,
        playerPos,
        playerDir,
        currentCommandIndex,
        addCommand,
        removeCommand,
        executeDirectCommand,
        resetLevel,
        nextLevel,
        startGame,
        stopGame
    } = useAnimalGame(initialMode, currentDifficulty, seed);

    // Detect when Hard level is won to mark all levels as completed
    useEffect(() => {
        if (isWon && adventureType && currentDifficulty === 'Hard' && !hasCompletedAllLevels) {
            setHasCompletedAllLevels(true);
        }
    }, [isWon, adventureType, currentDifficulty, hasCompletedAllLevels]);

    // Reset game state when difficulty changes (to prevent isWon from persisting)
    useEffect(() => {
        if (adventureType) {
            resetLevel();
        }
    }, [currentDifficulty, adventureType, resetLevel]);

    const handleNextLevel = () => {
        if (adventureType) {
            // Adventure Progression
            if (currentDifficulty === 'Easy') {
                setCurrentDifficulty('Medium');
            } else if (currentDifficulty === 'Medium') {
                setCurrentDifficulty('Hard');
            } else {
                // Finished Hard -> Back to Menu
                navigate('/animal-commands');
            }
        } else {
            // Free Play -> Just next random level
            nextLevel();
        }
    };

    // Calculate progress for adventure modes
    const getProgressText = () => {
        if (!adventureType) return '';

        const levelNumber = currentDifficulty === 'Easy' ? 1 : currentDifficulty === 'Medium' ? 2 : 3;
        const modeText = adventureType === 'daily' ? '每日挑戰' : '隨機闖關';
        return `${modeText} - 第 ${levelNumber} 關 / 3 (${currentDifficulty})`;
    };

    const getTitle = () => {
        if (adventureType) {
            return `動物指令大冒險 - ${getProgressText()}`;
        }
        return `動物指令大冒險 - 自由模式 (${currentDifficulty})`;
    };

    return (
        <PageContainer
            title={getTitle()}
            headerRight={
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Mode Switcher Button */}
                    <button
                        className="ac-mode-switcher-btn"
                        onClick={() => navigate('/animal-commands')}
                    >
                        切換模式
                    </button>
                    <BackToHomeButton />
                </div>
            }
            scrollable={false}
        >
            <div className={`ac-game-container ${isWon && adventureType && currentDifficulty === 'Hard' ? 'ac-hidden' : ''}`}>
                <div className="ac-game-layout">
                    {/* Left: Grid Map */}
                    <div className="ac-map-section">
                        <GridMap
                            gridSize={currentLevel.gridSize}
                            playerPos={playerPos}
                            playerDir={playerDir}
                            goal={currentLevel.goal}
                            obstacles={currentLevel.obstacles}
                            lakes={currentLevel.lakes || []}
                            character={character}
                            isWon={isWon}
                            isLost={isLost}
                            isJumping={isJumping}
                            isCollision={isCollision}
                        />
                    </div>

                    {/* Right: Controls */}
                    <div className="ac-control-section">
                        {currentLevel.mode === 1 ? (
                            <DirectControlPanel
                                onCommand={executeDirectCommand}
                                allowedCommands={currentLevel.allowedCommands}
                                disabled={isPlaying}
                            />
                        ) : (
                            <>
                                <CommandPalette
                                    allowedCommands={currentLevel.allowedCommands}
                                    onAddCommand={addCommand}
                                    disabled={isPlaying || isWon}
                                />
                                <CommandSequence
                                    commands={commands}
                                    maxCommands={currentLevel.maxCommands || 0}
                                    currentIndex={currentCommandIndex}
                                    onRemoveCommand={removeCommand}
                                    disabled={isPlaying}
                                />
                                <ControlPanel
                                    isPlaying={isPlaying}
                                    onStart={startGame}
                                    onStop={stopGame}
                                    onReset={resetLevel}
                                    disabled={commands.length === 0 || isWon}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Win Modal - MOVED OUTSIDE game container */}
            {isWon && (
                <div className="ac-win-modal">
                    {/* Show celebration image ONLY when all three levels are completed */}
                    {hasCompletedAllLevels ? (
                        <div className="ac-celebration-content">
                            <CelebrationWithAudio character={character} navigate={navigate} shouldPlayAudio={hasCompletedAllLevels} />
                        </div>
                    ) : (
                        <div className="ac-win-content">
                            <h2>🎉 過關了！</h2>
                            <p>太棒了！你成功幫助{character === 'rabbit' ? '小兔子' : '小恐龍'}吃到食物了！</p>
                            <div className="ac-win-actions">
                                <button className="ac-btn-primary" onClick={handleNextLevel}>
                                    {adventureType && currentDifficulty === 'Hard' ? '完成挑戰' : '下一關'}
                                </button>
                                <button className="ac-btn-secondary" onClick={() => navigate('/animal-commands')}>
                                    回首頁
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Lost Modal - MOVED OUTSIDE game container */}
            {isLost && (
                <div className="ac-win-modal">
                    <div className="ac-win-content">
                        <h2>😢 失敗了</h2>
                        <p>哎呀！撞到了！再試一次吧！</p>
                        <div className="ac-win-actions">
                            <button className="ac-btn-primary" onClick={resetLevel}>
                                重新開始
                            </button>
                            <button className="ac-btn-secondary" onClick={() => navigate('/animal-commands')}>
                                回首頁
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageContainer>
    );
};
