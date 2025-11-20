export interface ParsedZhuyin {
    onset?: string;
    rime?: string;
    tone?: "˙" | "ˊ" | "ˇ" | "ˋ";
}

const ONSETS = new Set(['ㄅ', 'ㄆ', 'ㄇ', 'ㄈ', 'ㄉ', 'ㄊ', 'ㄋ', 'ㄌ', 'ㄍ', 'ㄎ', 'ㄏ', 'ㄐ', 'ㄑ', 'ㄒ', 'ㄓ', 'ㄔ', 'ㄕ', 'ㄖ', 'ㄗ', 'ㄘ', 'ㄙ']);
const TONES = new Set(['ˊ', 'ˇ', 'ˋ', '˙']);

export const parseZhuyin = (zhuyinStr: string): ParsedZhuyin => {
    let remaining = zhuyinStr;
    let tone: ParsedZhuyin['tone'] | undefined;

    // 1. Extract Tone (usually at the end)
    const lastChar = remaining[remaining.length - 1];
    if (TONES.has(lastChar)) {
        tone = lastChar as ParsedZhuyin['tone'];
        remaining = remaining.slice(0, -1);
    }

    // 2. Extract Onset
    let onset: string | undefined;
    if (remaining.length > 0 && ONSETS.has(remaining[0])) {
        onset = remaining[0];
        remaining = remaining.slice(1);
    }

    // 3. The rest is Rime
    const rime = remaining.length > 0 ? remaining : undefined;

    return { onset, rime, tone };
};
