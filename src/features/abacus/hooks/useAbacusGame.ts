// src/features/abacus/hooks/useAbacusGame.ts
import { useCallback, useMemo, useState } from "react";
import type { AbacusQuestion, Operator } from "../types";
import { audioManager } from "../../../core/audio/audioPlayer";

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

/** 檢查題目是否重複 */
const isDuplicateQuestion = (q1: AbacusQuestion, q2: AbacusQuestion): boolean => {
  return q1.a === q2.a && q1.b === q2.b && q1.operator === q2.operator;
};

/** 檢查是否為 +1/-1 題目 */
const isSimpleQuestion = (q: AbacusQuestion): boolean => {
  return q.b === 1;
};

/** 出題：會依照 maxResult 限制答案大小，減法也保證不會出現負數 */
const generateQuestion = (
  minValue: number,
  maxValue: number,
  maxResult: number,
  allowedOperators: Operator[],
  existingQuestions: AbacusQuestion[] = [],
  recentSimpleCount: number = 0
): AbacusQuestion => {
  // 保證一定找到符合條件的題目
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    attempts++;
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

    const newQuestion: AbacusQuestion = { a, b, operator, answer, options: [] };

    // 檢查是否與現有題目重複
    const isDuplicate = existingQuestions.some(q => isDuplicateQuestion(q, newQuestion));
    if (isDuplicate) continue;

    // 限制連續 +1/-1 題目（如果最近2題都是簡單題，跳過）
    if (recentSimpleCount >= 2 && isSimpleQuestion(newQuestion)) {
      continue;
    }

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

    newQuestion.options = options;
    return newQuestion;
  }

  // 如果嘗試太多次還找不到，放寬限制重新生成
  const operator = allowedOperators[randomInt(0, allowedOperators.length - 1)];
  let a = randomInt(minValue, maxValue);
  let b = randomInt(minValue, maxValue);
  if (operator === "-" && b > a) [a, b] = [b, a];
  const answer = operator === "+" ? a + b : a - b;
  const optionsSet = new Set<number>([answer]);
  while (optionsSet.size < 3) {
    const delta = randomInt(1, 4);
    const candidate = answer + (Math.random() < 0.5 ? -delta : delta);
    if (candidate >= 0 && candidate <= maxResult) optionsSet.add(candidate);
  }
  const options = Array.from(optionsSet);
  for (let i = options.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { a, b, operator, answer, options };
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

  // Game round management (5 questions per round)
  const [questionIndex, setQuestionIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]); // Track correct/incorrect for each question
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [hasAnsweredCurrent, setHasAnsweredCurrent] = useState(false); // Track if user has attempted current question
  const [allQuestions, setAllQuestions] = useState<AbacusQuestion[]>([question]); // Track all questions in this round
  const totalQuestions = 5;

  const nextQuestion = useCallback(() => {
    if (questionIndex >= totalQuestions - 1) {
      // Game finished
      setIsGameFinished(true);
    } else {
      // Calculate recent simple question count (last 2 questions)
      const recentQuestions = allQuestions.slice(-2);
      const simpleCount = recentQuestions.filter(isSimpleQuestion).length;

      // Generate next question with duplicate prevention and simple question limiting
      const newQuestion = generateQuestion(
        minValue,
        maxValue,
        maxResult,
        allowedOperators,
        allQuestions,
        simpleCount
      );

      // Move to next question
      setQuestionIndex(prev => prev + 1);
      setQuestion(newQuestion);
      setAllQuestions(prev => [...prev, newQuestion]);
      setStatus("idle");
      setSelected(null);
      setHasAnsweredCurrent(false);
    }
  }, [minValue, maxValue, maxResult, allowedOperators, questionIndex, totalQuestions, allQuestions]);

  const submitAnswer = useCallback(
    (value: number) => {
      // Prevent multiple submissions when already correct
      if (status === "correct" || isGameFinished) return;

      setSelected(value);
      const isCorrect = value === question.answer;

      // Only record result on first attempt for this question
      if (!hasAnsweredCurrent) {
        setResults(prev => [...prev, isCorrect]);
        setHasAnsweredCurrent(true);
        if (isCorrect) {
          setScore(prev => prev + 1);
        }
      }

      if (isCorrect) {
        // Play correct sound using AudioManager
        audioManager.play('correct', 0.2);
        setStatus("correct");
      } else {
        // Play failure sound using AudioManager
        audioManager.play('failure', 0.2);
        setStatus("incorrect");
      }
    },
    [question.answer, status, isGameFinished, hasAnsweredCurrent]
  );

  const restartGame = useCallback(() => {
    const newQuestion = generateQuestion(minValue, maxValue, maxResult, allowedOperators);
    setQuestionIndex(0);
    setResults([]);
    setIsGameFinished(false);
    setScore(0);
    setQuestion(newQuestion);
    setAllQuestions([newQuestion]);
    setStatus("idle");
    setSelected(null);
    setHasAnsweredCurrent(false);
  }, [minValue, maxValue, maxResult, allowedOperators]);

  return {
    question,
    status,
    selected,
    submitAnswer,
    nextQuestion,
    questionIndex,
    results,
    isGameFinished,
    score,
    totalQuestions,
    restartGame,
  };
};