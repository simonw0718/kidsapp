// src/features/abacus/utils/avatarAssets.ts

export interface AvatarPair {
  index: number;
  think: string;
  answer: string;
}

// 幫 Vite 的 import.meta.glob 補型別
type ImageModule = { default: string };

// 自動收集 abacus 資料夾底下的 think-*.png / answer-*.png
// 路徑是相對於這個檔案的位置：features/abacus/utils → ../../../assets/abacus
const thinkModules = import.meta.glob<ImageModule>(
  "../../../assets/abacus/think-*.png",
  {
    eager: true,
  }
);

const answerModules = import.meta.glob<ImageModule>(
  "../../../assets/abacus/answer-*.png",
  {
    eager: true,
  }
);

// 從檔名裡抓出數字：think-3.png → 3
const extractIndex = (path: string): number | null => {
  const match = path.match(/think-(\d+)\.png$/);
  if (!match) return null;
  return Number(match[1]);
};

// 把 think-X / answer-X 配對成 AvatarPair
export const avatarPairs: AvatarPair[] = Object.keys(thinkModules)
  .map((thinkPath) => {
    const index = extractIndex(thinkPath);
    if (!index) return null; // 目前檔名從 1 開始，所以 index=0 不會被用到

    // 預期對應檔名：answer-X.png
    const expectedAnswerPath = thinkPath.replace("think-", "answer-");
    const answerModule = answerModules[expectedAnswerPath];

    if (!answerModule) {
      // 如果找不到對應 answer，就跳過這組，避免壞掉
      return null;
    }

    const think = thinkModules[thinkPath].default;
    const answer = answerModule.default;

    return { index, think, answer } as AvatarPair;
  })
  .filter((pair): pair is AvatarPair => pair !== null)
  .sort((a, b) => a.index - b.index); // 依照編號排序（1,2,3,...）