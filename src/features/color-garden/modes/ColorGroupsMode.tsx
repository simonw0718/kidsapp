import React, { useState, useMemo } from 'react';
import { COLORS } from '../data/colors';
import { ColorChip } from '../components/ColorChip';

type SortType = 'light-dark' | 'warm-cool' | 'rainbow' | 'hue';

export const ColorGroupsMode: React.FC = () => {
    const [sortType, setSortType] = useState<SortType>('rainbow');
    const [selectedColor, setSelectedColor] = useState<string | null>(null);

    const sortedColors = useMemo(() => {
        const colors = [...COLORS];
        switch (sortType) {
            case 'light-dark':
                // Group by Light then Dark (using tags)
                return [
                    ...colors.filter(c => c.tags.includes('light')),
                    ...colors.filter(c => c.tags.includes('neutral') && c.tags.includes('light')),
                    ...colors.filter(c => c.tags.includes('neutral') && c.tags.includes('dark')),
                    ...colors.filter(c => c.tags.includes('dark'))
                ];
            case 'warm-cool':
                // Group by Warm then Cool
                return [
                    ...colors.filter(c => c.tags.includes('warm')),
                    ...colors.filter(c => c.tags.includes('cool')),
                    ...colors.filter(c => c.tags.includes('neutral'))
                ];
            case 'rainbow':
                return colors.sort((a, b) => (a.rainbowOrder || 99) - (b.rainbowOrder || 99));
            case 'hue':
                return colors.sort((a, b) => a.hueOrder - b.hueOrder);
            default:
                return colors;
        }
    }, [sortType]);

    return (
        <div className="cl-groups-container">
            <div className="cl-groups-controls">
                <button
                    className={`cl-group-btn ${sortType === 'light-dark' ? 'active' : ''}`}
                    onClick={() => setSortType('light-dark')}
                >
                    亮 → 暗
                </button>
                <button
                    className={`cl-group-btn ${sortType === 'warm-cool' ? 'active' : ''}`}
                    onClick={() => setSortType('warm-cool')}
                >
                    暖 → 冷
                </button>
                <button
                    className={`cl-group-btn ${sortType === 'rainbow' ? 'active' : ''}`}
                    onClick={() => setSortType('rainbow')}
                >
                    彩虹排序
                </button>
                <button
                    className={`cl-group-btn ${sortType === 'hue' ? 'active' : ''}`}
                    onClick={() => setSortType('hue')}
                >
                    色相環
                </button>
            </div>

            <div className="cl-groups-display">
                {sortedColors.map(color => (
                    <ColorChip
                        key={color.id}
                        color={color}
                        size={selectedColor === color.id ? 120 : 80}
                        showLabel={selectedColor === color.id}
                        onClick={() => setSelectedColor(color.id)}
                        active={selectedColor === color.id}
                        className="cl-groups-chip"
                    />
                ))}
            </div>
        </div>
    );
};
