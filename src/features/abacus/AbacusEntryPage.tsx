// src/features/abacus/AbacusEntryPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../components/common/PageContainer";
import { BackToHomeButton } from "../../components/common/BackToHomeButton";
import "./abacus.css"; // Ensure CSS is imported

export const AbacusEntryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="珠算遊戲"
      headerRight={<BackToHomeButton />}
      scrollable={true}
    >
      <div className="abacus-entry-container">
        <h2 className="abacus-entry-title">請選擇遊戲模式</h2>

        <div className="abacus-mode-selection">
          <button
            type="button"
            className="abacus-mode-btn abacus-mode-btn--abacus"
            onClick={() => navigate("/games/abacus/play?mode=abacus")}
          >
            <span className="abacus-mode-icon">🧮</span>
            <span className="abacus-mode-label">算盤模式</span>
            <span className="abacus-mode-sublabel">使用算盤計算</span>
          </button>

          <button
            type="button"
            className="abacus-mode-btn abacus-mode-btn--math"
            onClick={() => navigate("/games/abacus/play?mode=math")}
          >
            <span className="abacus-mode-icon">🔢</span>
            <span className="abacus-mode-label">純數學模式</span>
            <span className="abacus-mode-sublabel">心算練習</span>
          </button>
        </div>
      </div>
    </PageContainer>
  );
};