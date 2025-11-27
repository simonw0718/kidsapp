//src/routes/AppRouter.tsx
import { Routes, Route } from "react-router-dom";
import { HomePage } from "../pages/HomePage";
import { AbacusPage } from "../pages/AbacusPage";
import { PictureMatchPage } from "../pages/PictureMatchPage";
import { AbacusPlayPage } from "../features/abacus"; // ← 從 feature 直接拉玩法頁
import { AnimalEntry, AnimalGame } from "../features/animal-commands";
import ColorGardenEntry from "../features/color-garden/ColorGardenEntry";
import { SettingsPage } from "../pages/SettingsPage";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* 首頁 */}
      <Route path="/" element={<HomePage />} />

      {/* 小算盤入口（兩個 path 都導到同一頁，兼容舊網址） */}
      <Route path="/abacus" element={<AbacusPage />} />
      <Route path="/games/abacus" element={<AbacusPage />} />

      {/* 小算盤玩法頁（對應 navigate("/games/abacus/play")） */}
      <Route path="/games/abacus/play" element={<AbacusPlayPage />} />

      {/* 圖像字卡 */}
      <Route path="/picture-match" element={<PictureMatchPage />} />

      {/* 動物指令大冒險 */}
      <Route path="/animal-commands" element={<AnimalEntry />} />
      <Route path="/animal-commands/play" element={<AnimalGame />} />

      {/* Color Garden */}
      <Route path="/color-garden" element={<ColorGardenEntry />} />

      {/* 設定頁面 */}
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
};