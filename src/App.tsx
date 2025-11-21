//src/App.tsx
import React from "react";
import { AppRouter } from "./routes/AppRouter";

import { ErrorBoundary } from "./components/common/ErrorBoundary";

const App: React.FC = () => {
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