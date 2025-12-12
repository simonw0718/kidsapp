import React from 'react';
import { BpmWord } from '../../../components/common/BpmWord';

interface AbacusEndScreenProps {
    score: number;
    total: number;
    onRestart: () => void;
}

// Helper function to parse zhuyin
const parseZhuyin = (zhuyinStr: string) => {
    const ONSETS = new Set(['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ']);
    const TONES = new Set(['ˊ', 'ˇ', 'ˋ', '˙']);

    let remaining = zhuyinStr;
    let tone: "˙" | "ˊ" | "ˇ" | "ˋ" | undefined;

    const lastChar = remaining[remaining.length - 1];
    if (TONES.has(lastChar)) {
        tone = lastChar as "˙" | "ˊ" | "ˇ" | "ˋ";
        remaining = remaining.slice(0, -1);
    }

    let onset: string | undefined;
    if (remaining.length > 0 && ONSETS.has(remaining[0])) {
        onset = remaining[0];
        remaining = remaining.slice(1);
    }

    const rime = remaining.length > 0 ? remaining : undefined;
    return { onset, rime, tone };
};

// Helper component to render a phrase with zhuyin
const ZhuyinPhrase: React.FC<{ text: string; zhuyin: string }> = ({ text, zhuyin }) => {
    const chars = text.split('');
    const zhuyinParts = zhuyin.split(' ');

    return (
        <span style={{ display: 'inline-flex', gap: '8px', alignItems: 'baseline' }}>
            {chars.map((char, idx) => {
                const z = zhuyinParts[idx] || '';
                const { onset, rime, tone } = parseZhuyin(z);
                return (
                    <BpmWord
                        key={idx}
                        char={char}
                        onset={onset}
                        rime={rime}
                        tone={tone}
                    />
                );
            })}
        </span>
    );
};

import { audioManager } from '../../../core/audio/audioPlayer';

import { useGameAudio } from "../../../hooks/useGameAudio";

export const AbacusEndScreen: React.FC<AbacusEndScreenProps> = ({ score, total, onRestart }) => {
    const { play } = useGameAudio();

    React.useEffect(() => {
        // Use direct file path for victory sound via HTML5 Audio
        play('/audio/victory.mp3');
    }, [play]);

    const percentage = Math.round((score / total) * 100);

    let messageText = '繼續加油！';
    let messageZhuyin = 'ㄐㄧˋ ㄒㄩˋ ㄐㄧㄚ ㄧㄡˊ';

    if (percentage === 100) {
        messageText = '太棒了！全部答對！';
        messageZhuyin = 'ㄊㄞˋ ㄅㄤˋ ㄌㄜ˙ ㄑㄩㄢˊ ㄅㄨˋ ㄉㄚˊ ㄉㄨㄟˋ';
    } else if (percentage >= 80) {
        messageText = '很棒！';
        messageZhuyin = 'ㄏㄣˇ ㄅㄤˋ';
    } else if (percentage >= 60) {
        messageText = '不錯喔！';
        messageZhuyin = 'ㄅㄨˋ ㄘㄨㄛˋ ㄛ';
    }

    return (
        <div className="abacus-end-screen">
            <div className="abacus-end-content">
                <img
                    src="/images/abacus/celebration.jpg"
                    alt="Celebration"
                    className="abacus-end-image"
                />
                <h2 className="abacus-end-title">
                    <ZhuyinPhrase text={messageText} zhuyin={messageZhuyin} />
                </h2>
                <div className="abacus-end-score">
                    <span className="abacus-end-score-number">{score}</span>
                    <span className="abacus-end-score-divider">/</span>
                    <span className="abacus-end-score-total">{total}</span>
                    <span className="abacus-end-score-label">
                        <ZhuyinPhrase text="正確" zhuyin="ㄓㄥˋ ㄑㄩㄝˋ" />
                    </span>
                </div>
                <button className="abacus-end-restart-btn" onClick={onRestart}>
                    <ZhuyinPhrase text="再玩一次" zhuyin="ㄗㄞˋ ㄨㄢˊ ㄧˊ ㄘˋ" />
                </button>
            </div>
        </div>
    );
};
