import React from 'react';
import { BpmWord } from '../../../components/common/BpmWord';
import { parseZhuyin } from '../utils/zhuyinParser';

interface ZhuyinWordProps {
    chinese: string;
    zhuyin: string;
}

export const ZhuyinWord: React.FC<ZhuyinWordProps> = ({ chinese, zhuyin }) => {
    // Split Chinese string into characters
    const chars = chinese.split('');

    // Split Zhuyin string by space
    const zhuyinParts = zhuyin.split(' ');

    // Ensure lengths match (fallback if data is inconsistent)
    const maxLength = Math.max(chars.length, zhuyinParts.length);

    /* [自動分行邏輯] 超過 3 個字則分成兩行顯示 */
    const shouldSplitRows = maxLength > 3;

    // 如果需要分行，計算每行的字數
    const firstRowLength = shouldSplitRows ? Math.ceil(maxLength / 2) : maxLength;

    const renderRow = (startIndex: number, endIndex: number) => (
        <div style={{
            display: 'flex',
            gap: '20px', /* [調整] 字與字之間的間距 */
            alignItems: 'baseline', /* [調整] 對齊方式：baseline 讓國字與注音基線對齊 */
        }}>
            {Array.from({ length: endIndex - startIndex }).map((_, idx) => {
                const index = startIndex + idx;
                const char = chars[index] || '';
                const z = zhuyinParts[index] || '';
                const { onset, rime, tone } = parseZhuyin(z);

                return (
                    <BpmWord
                        key={index}
                        char={char}
                        onset={onset}
                        rime={rime}
                        tone={tone}
                    />
                );
            })}
        </div>
    );

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column', /* [調整] 垂直排列，支援多行顯示 */
            gap: '12px', /* [調整] 行與行之間的間距 */
            alignItems: 'center',
        }}>
            {/* 第一行 */}
            {renderRow(0, firstRowLength)}

            {/* 第二行（如果需要分行） */}
            {shouldSplitRows && renderRow(firstRowLength, maxLength)}
        </div>
    );
};
