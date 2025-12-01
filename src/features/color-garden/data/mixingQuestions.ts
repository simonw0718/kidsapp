// No imports needed - using only string IDs

export interface MixingQuestion {
    A: string; // Color ID
    B: string; // Color ID
    result: string; // Result color ID
}

export const MIXING_QUESTIONS: MixingQuestion[] = [
    // ① 基礎三原色混色（最容易）
    { A: 'red', B: 'yellow', result: 'orange' },    // 紅 + 黃 = 橘
    { A: 'red', B: 'blue', result: 'purple' },      // 紅 + 藍 = 紫
    { A: 'yellow', B: 'blue', result: 'green' },    // 黃 + 藍 = 綠

    // ② 兒童教材常見延伸混色
    { A: 'red', B: 'white', result: 'pink' },       // 紅 + 白 = 粉
    { A: 'brown', B: 'white', result: 'beige' },    // 咖 + 白 = 米
    { A: 'blue', B: 'white', result: 'light_blue' },// 藍 + 白 = 淺藍

    // ③ 深色混色（增加層次，不會太難）
    { A: 'blue', B: 'black', result: 'dark_blue' }, // 藍 + 黑 = 深藍

    // ④ 常見、直覺
    { A: 'red', B: 'green', result: 'brown' }       // 紅 + 綠 = 咖啡色
];

// Get all unique colors used in mixing questions
export const getAllMixingColors = (): string[] => {
    const colorSet = new Set<string>();
    MIXING_QUESTIONS.forEach(q => {
        colorSet.add(q.A);
        colorSet.add(q.B);
        colorSet.add(q.result);
    });
    return Array.from(colorSet);
};
