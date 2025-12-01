import React, { useState, useEffect } from 'react';
import { COLORS, type ColorData } from '../data/colors';
import { ColorChip } from '../components/ColorChip';

type GameTopic = 'light-dark' | 'warm-cool' | 'rainbow';
type GameState = 'playing' | 'success';

export const ColorSortingGame: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('playing');
    const [topic, setTopic] = useState<GameTopic>('light-dark');
    const [targetColors, setTargetColors] = useState<ColorData[]>([]);
    const [placedColors, setPlacedColors] = useState<(ColorData | null)[]>([]);
    const [availableColors, setAvailableColors] = useState<ColorData[]>([]);
    const [selectedSourceIndex, setSelectedSourceIndex] = useState<number | null>(null);
    const [incorrectSlots, setIncorrectSlots] = useState<number[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    const [draggedColor, setDraggedColor] = useState<{ color: ColorData; fromSlot: number | null } | null>(null);

    // Initialize game with random topic
    const startNewGame = () => {
        const topics: GameTopic[] = ['light-dark', 'warm-cool', 'rainbow'];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];

        setTopic(randomTopic);
        let targets: ColorData[] = [];

        if (randomTopic === 'rainbow') {
            // Fixed rainbow colors
            targets = COLORS
                .filter(c => c.rainbowOrder !== undefined)
                .sort((a, b) => (a.rainbowOrder || 0) - (b.rainbowOrder || 0));
        } else if (randomTopic === 'warm-cool') {
            // Warm-Cool: Only use specific colors
            const allowedIds = ['red', 'orange', 'yellow', 'pink', 'brown', 'green', 'cyan', 'blue'];
            const allowedColors = COLORS.filter(c => allowedIds.includes(c.id));
            const shuffled = [...allowedColors].sort(() => 0.5 - Math.random());
            targets = shuffled.slice(0, 5);
            // Warm (100) -> Cool (0)
            targets.sort((a, b) => b.temperature - a.temperature);
        } else if (randomTopic === 'light-dark') {
            // Light-Dark: Only use specific colors
            const allowedIds = ['yellow', 'beige', 'pink', 'orange', 'red', 'green', 'purple', 'black'];
            const allowedColors = COLORS.filter(c => allowedIds.includes(c.id));
            const shuffled = [...allowedColors].sort(() => 0.5 - Math.random());
            targets = shuffled.slice(0, 5);
            // Light (100) -> Dark (0)
            targets.sort((a, b) => b.brightness - a.brightness);
        }

        setTargetColors(targets);
        setPlacedColors(new Array(targets.length).fill(null));
        // Scramble available colors
        setAvailableColors([...targets].sort(() => 0.5 - Math.random()));
        setGameState('playing');
        setSelectedSourceIndex(null);
        setIncorrectSlots([]);
        setIsChecking(false);
    };

    // Start game on mount
    useEffect(() => {
        startNewGame();
    }, []);

    const handleSourceClick = (index: number) => {
        if (selectedSourceIndex === index) {
            setSelectedSourceIndex(null);
        } else {
            setSelectedSourceIndex(index);
        }
        // Clear error when interacting
        setIncorrectSlots([]);
    };

    const handleSlotClick = (index: number) => {
        // Clear error when interacting
        setIncorrectSlots([]);

        if (selectedSourceIndex !== null) {
            // Move color to slot
            const colorToMove = availableColors[selectedSourceIndex];
            const currentSlotColor = placedColors[index];

            const newPlaced = [...placedColors];
            newPlaced[index] = colorToMove;
            setPlacedColors(newPlaced);

            const newAvailable = [...availableColors];
            if (currentSlotColor) {
                newAvailable[selectedSourceIndex] = currentSlotColor;
            } else {
                newAvailable.splice(selectedSourceIndex, 1);
            }
            setAvailableColors(newAvailable);
            setSelectedSourceIndex(null);
        } else if (placedColors[index]) {
            // Click placed color to return to pool
            const colorToReturn = placedColors[index];
            const newPlaced = [...placedColors];
            newPlaced[index] = null;
            setPlacedColors(newPlaced);
            setAvailableColors([...availableColors, colorToReturn!]);
        }
    };

    // Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent, color: ColorData, fromSlot: number | null) => {
        setDraggedColor({ color, fromSlot });
        e.dataTransfer.effectAllowed = 'move';
        setIncorrectSlots([]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropOnSlot = (e: React.DragEvent, slotIndex: number) => {
        e.preventDefault();
        if (!draggedColor) return;

        const { color: droppedColor, fromSlot } = draggedColor;
        const currentSlotColor = placedColors[slotIndex];

        if (fromSlot !== null) {
            // Dragged from another slot - swap
            const newPlaced = [...placedColors];
            newPlaced[fromSlot] = currentSlotColor;
            newPlaced[slotIndex] = droppedColor;
            setPlacedColors(newPlaced);
        } else {
            // Dragged from pool
            const poolIndex = availableColors.findIndex(c => c.id === droppedColor.id);
            if (poolIndex === -1) return;

            const newPlaced = [...placedColors];
            newPlaced[slotIndex] = droppedColor;
            setPlacedColors(newPlaced);

            const newAvailable = [...availableColors];
            if (currentSlotColor) {
                newAvailable[poolIndex] = currentSlotColor;
            } else {
                newAvailable.splice(poolIndex, 1);
            }
            setAvailableColors(newAvailable);
        }

        setDraggedColor(null);
    };

    const handleDropOnPool = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedColor || draggedColor.fromSlot === null) return;

        // Return color from slot to pool
        const { color: droppedColor, fromSlot } = draggedColor;
        const newPlaced = [...placedColors];
        newPlaced[fromSlot] = null;
        setPlacedColors(newPlaced);
        setAvailableColors([...availableColors, droppedColor]);
        setDraggedColor(null);
    };

    const handleSubmit = () => {
        if (placedColors.some(c => c === null)) {
            // Optional: Alert user to fill all slots
            return;
        }

        setIsChecking(true);
        const newIncorrectSlots: number[] = [];

        placedColors.forEach((c, i) => {
            if (c?.id !== targetColors[i].id) {
                newIncorrectSlots.push(i);
            }
        });

        if (newIncorrectSlots.length === 0) {
            // Success!
            setTimeout(() => setGameState('success'), 500);
        } else {
            // Failure
            setIncorrectSlots(newIncorrectSlots);
            setTimeout(() => setIsChecking(false), 1000); // Reset checking state after animation
        }
    };

    const getTopicTitle = (t: GameTopic) => {
        switch (t) {
            case 'light-dark': return '亮 → 暗';
            case 'warm-cool': return '暖 → 冷';
            case 'rainbow': return '彩虹顏色';
        }
    };

    if (gameState === 'success') {
        return (
            <div className="cl-game-success">
                <div className="cl-success-icon">🎉</div>
                <h3>太棒了！答對了！</h3>
                <div className="cl-success-grid">
                    {targetColors.map(c => (
                        <ColorChip key={c.id} color={c} size={80} showLabel={false} />
                    ))}
                </div>
                <button onClick={startNewGame} className="cl-retry-btn">
                    下一題 (Next Level)
                </button>
            </div>
        );
    }

    return (
        <div className="cl-sorting-game">
            <div className="cl-game-header">
                <div className="cl-game-instruction">
                    請依序排列：{getTopicTitle(topic)}
                </div>
            </div>

            {/* Target Slots */}
            <div className="cl-slots-container">
                {placedColors.map((color, index) => (
                    <div
                        key={index}
                        className={`cl-slot ${!color ? 'empty' : ''} ${incorrectSlots.includes(index) ? 'error shake' : ''}`}
                        onClick={() => handleSlotClick(index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnSlot(e, index)}
                    >
                        {color ? (
                            <div
                                draggable
                                onDragStart={(e) => handleDragStart(e, color, index)}
                            >
                                <ColorChip color={color} size={90} className="cl-slot-chip" />
                            </div>
                        ) : (
                            <div className="cl-slot-placeholder">{index + 1}</div>
                        )}
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="cl-submit-container">
                <button
                    className={`cl-submit-btn ${placedColors.some(c => c === null) ? 'disabled' : ''}`}
                    onClick={handleSubmit}
                    disabled={placedColors.some(c => c === null) || isChecking}
                >
                    GO!
                </button>
            </div>

            {/* Source Pool */}
            <div
                className="cl-pool-container"
                onDragOver={handleDragOver}
                onDrop={handleDropOnPool}
            >
                {availableColors.map((color, index) => (
                    <div
                        key={color.id}
                        className={`cl-pool-item ${selectedSourceIndex === index ? 'selected' : ''}`}
                        onClick={() => handleSourceClick(index)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, color, null)}
                    >
                        <ColorChip color={color} size={80} />
                    </div>
                ))}
            </div>
        </div>
    );
};
