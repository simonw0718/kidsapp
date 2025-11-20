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
      title="小小算珠加減樂"
      headerRight={<BackToHomeButton />}
    >
      <div className="abacus-entry-container">
        <div className="abacus-entry-visual">
          {/* Custom entry image */}
          <img
            src="/icons/abacus_entry.png"
            alt="算珠加減樂"
            className="abacus-entry-image"
          />
        </div>

        <div className="abacus-entry-content">
          <h2 className="abacus-entry-subtitle">準備好開始數數了嗎？</h2>

          <button
            type="button"
            className="abacus-start-button-large"
            onClick={() => navigate("/games/abacus/play")}
          >
            <span className="start-icon">▶</span>
            開始遊戲
          </button>
        </div>
      </div>
    </PageContainer>
  );
};