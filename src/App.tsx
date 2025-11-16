import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppShell } from "./components/common/AppShell";
import { HomePage } from "./features/home/HomePage";
import { PictureMatchEntryPage } from "./features/pictureMatch/PictureMatchEntryPage";
import { AbacusEntryPage } from "./features/abacus/AbacusEntryPage";

export const App: React.FC = () => {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/games/picture-match" element={<PictureMatchEntryPage />} />
        <Route path="/games/abacus" element={<AbacusEntryPage />} />
      </Routes>
    </AppShell>
  );
};

export default App;
