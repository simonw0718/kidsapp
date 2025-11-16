import React from "react";
import { PageContainer } from "../../components/common/PageContainer";
import { BackToHomeButton } from "../../components/common/BackToHomeButton";

export const AbacusEntryPage: React.FC = () => {
  return (
    <PageContainer
      title="小小算珠加減樂"
      headerRight={<BackToHomeButton />}
    >
      <p>這裡是「小小算珠加減樂」遊戲的入口畫面。</p>
      <p>之後會在這裡放：</p>
      <ul>
        <li>練習模式 / 關卡模式選擇</li>
        <li>題型難度設定（只加法 / 加減混合）</li>
        <li>簡單進度展示</li>
      </ul>
    </PageContainer>
  );
};
