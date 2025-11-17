// src/components/common/BpmWord.tsx
import React from "react";

interface BpmWordProps {
  char: string;          // 國字
  onset?: string;        // 聲母，例如 "ㄉ"、"ㄕ"
  rime?: string;         // 韻母，可以是一個或多個，例如 "ㄧ" 或 "ㄧㄚ"
  tone?: "˙" | "ˊ" | "ˇ" | "ˋ"; // 調號（可省略）
}

/**
 * BpmWord
 * - 國字在左，注音直排在右
 * - onset / rime 如果有多個符號，會自動拆成多行堆疊
 * - tone:
 *   - "˙" 用 .bpm-tone-dot 畫在上方
 *   - 其它調號用 .bpm-tone 畫在右側
 */
export const BpmWord: React.FC<BpmWordProps> = ({
  char,
  onset,
  rime,
  tone,
}) => {
  const splitSymbols = (s?: string) =>
    s ? s.replace(/\s+/g, "").split("") : [];

  const onsetList = splitSymbols(onset);
  const rimeList = splitSymbols(rime);

  const hasBpm =
    onsetList.length > 0 || rimeList.length > 0 || !!tone;

  return (
    <span className="bpm-word">
      <span className="bpm-main-char">{char}</span>

      {hasBpm && (
        <span className="bpm-column">
          {/* 聲母（可能 0～多個） */}
          {onsetList.map((sym, idx) => (
            <span key={`on-${idx}`} className="bpm-onset">
              {sym}
            </span>
          ))}

          {/* 韻母（可能 0～多個） */}
          {rimeList.map((sym, idx) => (
            <span key={`ri-${idx}`} className="bpm-rime">
              {sym}
            </span>
          ))}

          {/* 調號：˙ → 上方；其他 → 右側 */}
          {tone === "˙" && <span className="bpm-tone-dot">˙</span>}
          {tone && tone !== "˙" && (
            <span className="bpm-tone">{tone}</span>
          )}
        </span>
      )}
    </span>
  );
};