// src/features/abacus/AbacusPlayPage.tsx
import React, { useMemo, useState } from "react";
import "./abacus.css"; // Import feature-specific styles
import { PageContainer } from "../../components/common/PageContainer";
import { BackToHomeButton } from "../../components/common/BackToHomeButton";
import {
  useAbacusGame,
  type UseAbacusGameOptions,
} from "./hooks/useAbacusGame";
import type { Operator } from "./types";
import { AbacusBoard } from "./components/AbacusBoard";
import { avatarPairs } from "./utils/avatarAssets";
import { BpmWord } from "../../components/common/BpmWord";

type DifficultyLevel = 1 | 2 | 3;

const difficultyDescriptions: Record<DifficultyLevel, string> = {
  1: "難度 1：1～19 的加法練習，答案不超過 60。",
  2: "難度 2：1～19 的加減混合，答案不超過 60，減法不會出現負數。",
  3: "難度 3：1～40 的加減混合，答案不超過 60，減法不會出現負數。",
};

export const AbacusPlayPage: React.FC = () => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(1);

  // operator 陣列用 useMemo 固定參考，不會每次 render 都重新 new 陣列
  const plusOnly: Operator[] = useMemo(() => ["+"], []);
  const plusMinus: Operator[] = useMemo(() => ["+", "-"], []);

  // 根據難度決定出題設定
  const gameOptions = useMemo<UseAbacusGameOptions>(() => {
    if (difficulty === 1) {
      // 難度 1：只加法、1～19、答 ≤ 60
      return {
        minValue: 1,
        maxValue: 19,
        maxResult: 60,
        allowedOperators: plusOnly,
      };
    }
    if (difficulty === 2) {
      // 難度 2：1～19，加減混合，答 ≤ 60
      return {
        minValue: 1,
        maxValue: 19,
        maxResult: 60,
        allowedOperators: plusMinus,
      };
    }
    // 難度 3：1～40，加減混合，答 ≤ 60
    return {
      minValue: 1,
      maxValue: 40,
      maxResult: 60,
      allowedOperators: plusMinus,
    };
  }, [difficulty, plusOnly, plusMinus]);

  const { question, status, selected, submitAnswer, nextQuestion } =
    useAbacusGame(gameOptions);

  // 目前有幾組圖（think-X / answer-X）
  const avatarCount = avatarPairs.length;

  // 每一題隨機決定使用哪一組（index: 0 ~ avatarCount-1）
  const [avatarIndex, setAvatarIndex] = useState<number>(() => {
    if (avatarCount === 0) return -1;
    return Math.floor(Math.random() * avatarCount);
  });

  // 點選答案
  const handleOptionClick = (value: number) => {
    // 已經答對就不要再處理
    if (status === "correct") return;

    // 如果這個選項已經是錯誤並被反灰，就不再送（保險用）
    if (
      status === "incorrect" &&
      selected === value &&
      value !== question.answer
    ) {
      return;
    }

    submitAnswer(value);
  };

  // 下一題：只有在「答對」時才可以按
  const handleNext = () => {
    if (status !== "correct") return;

    nextQuestion();

    // 下一題重新抽一組圖
    if (avatarCount > 0) {
      setAvatarIndex(Math.floor(Math.random() * avatarCount));
    }
  };

  // 切換難度：重抽題目、重抽角色圖組，並彈出說明視窗
  const handleDifficultyChange = (level: DifficultyLevel) => {
    if (level === difficulty) return;

    setDifficulty(level);
    nextQuestion();

    if (avatarCount > 0) {
      setAvatarIndex(Math.floor(Math.random() * avatarCount));
    }

    window.alert(difficultyDescriptions[level]);
  };

  // 根據 avatarIndex & 狀態選圖
  const currentPair =
    avatarIndex >= 0 && avatarIndex < avatarPairs.length
      ? avatarPairs[avatarIndex]
      : null;

  const isAnswerState = status === "correct";
  const statusImg = currentPair
    ? isAnswerState
      ? currentPair.answer
      : currentPair.think
    : undefined;
  const statusImgAlt = isAnswerState ? "答對了！" : "想一想答案喔～";

  return (
    <PageContainer
      title="算數練習"
      headerRight={
        <div className="abacus-header-right">
          {/* 難度選擇：1 / 2 / 3 紅圈圈 */}
          <div className="abacus-difficulty-toggle">
            <span className="abacus-difficulty-label">難度</span>
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                type="button"
                className={
                  "abacus-difficulty-pill" +
                  (difficulty === level
                    ? " abacus-difficulty-pill--active"
                    : "")
                }
                onClick={() =>
                  handleDifficultyChange(level as DifficultyLevel)
                }
              >
                {level}
              </button>
            ))}
          </div>

          <BackToHomeButton />
        </div>
      }
    >
      <div className="abacus-play-layout">
        {/* 左側：算盤區 */}
        <div className="abacus-left">
          <div className="abacus-left-inner">
            <AbacusBoard />
          </div>
        </div>

        {/* 右側：題目＋選項 */}
        <div className="abacus-right">
          {/* 題目區塊 */}
          <div className="abacus-question-panel">
            <div className="abacus-question-text">
              {question.a} {question.operator} {question.b} = ?
            </div>

            {/* 題目下方插圖：think / answer 成對切換 */}
            {statusImg && (
              <img
                key={statusImg} // 🔑 用圖片 URL 當 key，強制 Safari 重建 <img>，避免不更新
                src={statusImg}
                alt={statusImgAlt}
                className="abacus-question-illustration"
              />
            )}
          </div>

          {/* 選項區塊 */}
          <div className="abacus-options-panel">
            {/* 答案是～（用 BpmWord 元件） */}
            <div className="abacus-answer-label">
              <BpmWord char="答" onset="ㄉ" rime="ㄚ" tone="ˊ" />
              <BpmWord char="案" rime="ㄢ" tone="ˋ" />
              <BpmWord char="是" onset="ㄕ" tone="ˋ" />
              <span className="bpm-tilde">～</span>
            </div>

            <div className="abacus-options">
              {question.options.map((option) => {
                const isSelected = selected === option;
                const isCorrect = option === question.answer;

                let className = "abacus-option-button";
                if (status !== "idle" && isSelected) {
                  className += isCorrect
                    ? " abacus-option-button--correct"
                    : " abacus-option-button--incorrect abacus-option-button--disabled";
                }

                const disabled =
                  status === "correct" ||
                  (status === "incorrect" && isSelected && !isCorrect);

                return (
                  <button
                    key={option}
                    type="button"
                    className={className}
                    onClick={() => handleOptionClick(option)}
                    disabled={disabled}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {/* 預留「下一題」固定高度，避免版面跳動 */}
            <div className="abacus-next-button-slot">
              {status === "correct" && (
                <button
                  type="button"
                  className="abacus-next-button"
                  onClick={handleNext}
                >
                  <span className="abacus-next-button-inner">
                    <BpmWord
                      char="下"
                      onset="ㄒ"
                      rime="ㄧㄚ"
                      tone="ˋ"
                    />
                    <BpmWord char="一" onset="ㄧ" />
                    <BpmWord
                      char="題"
                      onset="ㄊ"
                      rime="ㄧ"
                      tone="ˊ"
                    />
                    <span className="abacus-next-arrow">➜</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};