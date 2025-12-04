//src/App.tsx
import React from "react";
import { AppRouter } from "./routes/AppRouter";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { audioManager } from "./core/audio/audioPlayer";

const App: React.FC = () => {
  React.useEffect(() => {
    const unlockAudio = () => {
      // CRITICAL: This must be synchronous for iOS
      audioManager.unlock();

      // Global Preload for common sounds
      // These paths match the actual file system: public/audio/filename.mp3 -> /audio/filename.mp3
      audioManager.preload('victory', '/audio/victory.mp3');
      audioManager.preload('correct', '/audio/correct_sound.mp3');
      audioManager.preload('failure', '/audio/failure_sound.mp3');

      // Remove listeners once unlocked
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