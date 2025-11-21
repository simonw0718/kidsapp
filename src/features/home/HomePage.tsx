import React from "react";
import { PageContainer } from "../../components/common/PageContainer";
import { GameCard } from "../../components/common/GameCard";

export const HomePage: React.FC = () => {
  return (
    <PageContainer title="Kid App 小遊戲選單" scrollable={true}>
      <div className="home-games-grid">
        <GameCard
          title="圖像字卡配對"
          description="聽聲音、看圖圖，輕鬆連結單字與圖片。"
          to="/games/picture-match"
        />
        <GameCard
          title="小小算珠加減樂"
          description="滑動算珠、玩中學，加減法變好朋友。"
          to="/games/abacus"
        />
      </div>
    </PageContainer>
  );
};
