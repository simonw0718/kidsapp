//src/App.tsx
import React from "react";
import { AppRouter } from "./routes/AppRouter";

const App: React.FC = () => {
  return (
    <div className="app-layout-root">
      <div className="app-layout-safe-area">
        <div className="app-shell">
          <AppRouter />
        </div>
      </div>
    </div>
  );
};

export default App;