import React, { useState } from 'react';
import { COLORS } from '../data/colors';
import { ColorChip } from '../components/ColorChip';

const MIXING_PAIRS = [
    { id: 1, c1: 'red', c2: 'yellow', result: 'orange' },
    { id: 2, c1: 'blue', c2: 'yellow', result: 'green' },
    { id: 3, c1: 'red', c2: 'blue', result: 'purple' },
    { id: 4, c1: 'white', c2: 'black', result: 'gray' }
];

export const ColorMixingMode: React.FC = () => {
    const [activePairId, setActivePairId] = useState<number | null>(null);
    const [animationState, setAnimationState] = useState<'idle' | 'mixing' | 'result'>('idle');

    const handlePairClick = (pairId: number) => {
        if (animationState === 'mixing') return;

        setActivePairId(pairId);
        setAnimationState('mixing');

        // Animation sequence
        setTimeout(() => {
            setAnimationState('result');
        }, 1500);
    };

    const getColor = (id: string) => COLORS.find(c => c.id === id)!;

    return (
        <div className="cl-mixing-container">
            <div className="cl-mixing-pairs">
                {MIXING_PAIRS.map(pair => (
                    <button
                        key={pair.id}
                        className={`cl-mixing-pair-btn ${activePairId === pair.id ? 'active' : ''}`}
                        onClick={() => handlePairClick(pair.id)}
                    >
                        <div className="cl-mini-chip" style={{ background: getColor(pair.c1).hex }} />
                        <span>+</span>
                        <div className="cl-mini-chip" style={{ background: getColor(pair.c2).hex }} />
                    </button>
                ))}
            </div>

            <div className="cl-mixing-stage">
                {activePairId && (
                    <div className={`cl-mixing-animation ${animationState}`}>
                        <div className="cl-mixing-source">
                            <ColorChip
                                color={getColor(MIXING_PAIRS.find(p => p.id === activePairId)!.c1)}
                                size={120}
                                className="cl-mix-left"
                            />
                            <span className="cl-mix-plus">+</span>
                            <ColorChip
                                color={getColor(MIXING_PAIRS.find(p => p.id === activePairId)!.c2)}
                                size={120}
                                className="cl-mix-right"
                            />
                        </div>

                        <div className="cl-mixing-arrow">⬇</div>

                        <div className="cl-mixing-result-container">
                            {animationState === 'result' && (
                                <ColorChip
                                    color={getColor(MIXING_PAIRS.find(p => p.id === activePairId)!.result)}
                                    size={160}
                                    showLabel={true}
                                    className="cl-mix-result"
                                />
                            )}
                        </div>
                    </div>
                )}
                {!activePairId && (
                    <div className="cl-mixing-placeholder">
                        請選擇上方配對開始混色
                    </div>
                )}
            </div>
        </div>
    );
};
