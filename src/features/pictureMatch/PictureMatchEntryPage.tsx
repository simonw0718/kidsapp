import React from "react";
import { PageContainer } from "../../components/common/PageContainer";
import { BackToHomeButton } from "../../components/common/BackToHomeButton";

export const PictureMatchEntryPage: React.FC = () => {
  return (
    <PageContainer
      title="圖像字卡配對"
      headerRight={<BackToHomeButton />}
    >
      <p>這裡是「圖像字卡配對」遊戲的入口畫面。</p>
      <p>之後會在這裡放：</p>
      <ul>
        <li>英文語音 → 圖片 模式</li>
        <li>注音 → 圖片 模式</li>
        <li>關卡／主題選擇區</li>
      </ul>
    </PageContainer>
  );
};
