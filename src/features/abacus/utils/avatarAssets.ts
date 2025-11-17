// src/features/abacus/utils/avatarAssets.ts

export interface AvatarPair {
  index: number;
  think: string;
  answer: string;
}

// 自動收集 abacus 資料夾底下的 think-*.png / answer-*.png
// 路徑是相對於這個檔案的位置：features/abacus/utils → ../../.. → src
const thinkModules = import.meta.glob(
  "../../../assets/abacus/think-*.png",
  {
    eager: true,
  }
);

const answerModules = import.meta.glob(
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
    if (!index) return null;

    // 預期對應檔名：answer-X.png
    const expectedAnswerPath = thinkPath.replace("think-", "answer-");
    const answerModule = answerModules[expectedAnswerPath];

    if (!answerModule) {
      // 如果找不到對應 answer，就跳過這組，避免壞掉
      return null;
    }

    const think = (thinkModules[thinkPath] as any).default as string;
    const answer = (answerModule as any).default as string;

    return { index, think, answer } as AvatarPair;
  })
  .filter((pair): pair is AvatarPair => pair !== null)
  .sort((a, b) => a.index - b.index); // 依照編號排序（1,2,3,...）