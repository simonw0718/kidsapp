import React, { useState } from 'react';
import { PictureMatchGame } from '../features/picture-match/PictureMatchGame';
import { PictureMatchEntry } from '../features/picture-match/PictureMatchEntry';

export const PictureMatchPage: React.FC = () => {
  const [gameMode, setGameMode] = useState<'english' | 'zhuyin' | 'dinosaur' | null>(null);

  if (!gameMode) {
    return <PictureMatchEntry onSelectMode={setGameMode} />;
  }

  return <PictureMatchGame mode={gameMode} onSwitchMode={() => setGameMode(null)} />;
};
