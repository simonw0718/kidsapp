// src/features/abacus/hooks/useAbacusGame.ts
import { useCallback, useMemo, useState } from "react";
import type { AbacusQuestion, Operator } from "../types";

type Status = "idle" | "correct" | "incorrect";

/** 取隨機整數 [min, max] */
const randomInt = (min: number, max: number): number => {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
};

/** 給外面用的設定型別（★ 要 export） */
export type UseAbacusGameOptions = {
  minValue?: number;
  maxValue?: number;
  maxResult?: number;
  allowedOperators?: Operator[];
};

/** 出題：會依照 maxResult 限制答案大小，減法也保證不會出現負數 */
const generateQuestion = (
  minValue: number,
  maxValue: number,
  maxResult: number,
  allowedOperators: Operator[]
): AbacusQuestion => {
  // 保證一定找到符合條件的題目
  // 保證一定找到符合條件的題目
  while (true) {
    const operator =
      allowedOperators[randomInt(0, allowedOperators.length - 1)];

    let a = randomInt(minValue, maxValue);
    let b = randomInt(minValue, maxValue);

    // 減法時：強迫 a >= b，避免負數
    if (operator === "-" && b > a) {
      [a, b] = [b, a];
    }

    const answer = operator === "+" ? a + b : a - b;

    // 超過最大總和就丟掉重抽
    if (answer > maxResult) continue;

    // 選項產生
    const optionsSet = new Set<number>();
    optionsSet.add(answer);

    while (optionsSet.size < 3) {
      const delta = randomInt(1, 4);
      const candidate =
        answer + (Math.random() < 0.5 ? -delta : delta);

      if (candidate >= 0 && candidate <= maxResult) {
        optionsSet.add(candidate);
      }
    }

    const options = Array.from(optionsSet);
    for (let i = options.length - 1; i > 0; i -= 1) {
      const j = randomInt(0, i);
      [options[i], options[j]] = [options[j], options[i]];
    }

    return { a, b, operator, answer, options };
  }
};

export const useAbacusGame = (options?: UseAbacusGameOptions) => {
  const minValue = options?.minValue ?? 1;
  const maxValue = options?.maxValue ?? 19;
  const maxResult = options?.maxResult ?? 60;      // ★ 最大總和

  // Memoize default operators to avoid re-renders
  const defaultOperators = useMemo<Operator[]>(() => ["+"], []);
  const allowedOperators = options?.allowedOperators ?? defaultOperators;

  const [question, setQuestion] = useState<AbacusQuestion>(() =>
    generateQuestion(minValue, maxValue, maxResult, allowedOperators)
  );
  const [status, setStatus] = useState<Status>("idle");
  const [selected, setSelected] = useState<number | null>(null);

  const nextQuestion = useCallback(() => {
    setQuestion(
      generateQuestion(minValue, maxValue, maxResult, allowedOperators)
    );
    setStatus("idle");
    setSelected(null);
  }, [minValue, maxValue, maxResult, allowedOperators]);

  const submitAnswer = useCallback(
    (value: number) => {
      setSelected(value);
      if (value === question.answer) {
        // Play correct sound
        const correctAudio = new Audio('/audio/correct_sound.mp3');
        correctAudio.volume = 0.2; // 音量控制：0.0 (靜音) ~ 1.0 (最大)，預設 0.5
        correctAudio.play().catch(err => console.warn('Failed to play correct sound:', err));

        setStatus("correct");
      } else {
        // Play failure sound
        const failureAudio = new Audio('/audio/failure_sound.mp3');
        failureAudio.volume = 0.2; // 音量控制：0.0 (靜音) ~ 1.0 (最大)，預設 0.5
        failureAudio.play().catch(err => console.warn('Failed to play failure sound:', err));

        setStatus("incorrect");
      }
    },
    [question.answer]
  );

  return {
    question,
    status,
    selected,
    submitAnswer,
    nextQuestion,
  };
};