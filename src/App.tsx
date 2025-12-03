//src/App.tsx
import React from "react";
import { AppRouter } from "./routes/AppRouter";

import { ErrorBoundary } from "./components/common/ErrorBoundary";

const App: React.FC = () => {
  React.useEffect(() => {
    const unlockAudio = () => {
      import("./core/audio/audioPlayer").then(({ audioManager }) => {
        audioManager.unlock();
        // Global Preload for common sounds
        audioManager.preload('victory', '/audio/victory.mp3');
        audioManager.preload('correct', '/audio/correct_sound.mp3');
        audioManager.preload('failure', '/audio/failure_sound.mp3');
      });
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);
    document.addEventListener("keydown", unlockAudio);

    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="app-layout-root">
        <div className="app-layout-safe-area">
          <div className="app-shell">
            <AppRouter />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;