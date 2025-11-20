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

    return (
        <div style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'baseline',
        }}>
            {Array.from({ length: maxLength }).map((_, index) => {
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
};
