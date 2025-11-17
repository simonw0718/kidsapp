// src/features/abacus/AbacusEntryPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "../../components/common/PageContainer";
import { BackToHomeButton } from "../../components/common/BackToHomeButton";

export const AbacusEntryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageContainer
      title="小小算珠加減樂"
      headerRight={<BackToHomeButton />}
    >
      <p>
        滑動算珠，感受數量的變化，再選出正確的答案！
      </p>
      <p>一開始先從簡單的加法練習開始，不用怕算錯，慢慢玩就會越來越熟。</p>

      <button
        type="button"
        className="abacus-start-button"
        onClick={() => navigate("/games/abacus/play")}
      >
        開始加法練習 ➜
      </button>
    </PageContainer>
  );
};