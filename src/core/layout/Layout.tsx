// src/core/layout/Layout.tsx
import React, { useEffect, useState } from "react";
import "./layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const getIsPortrait = () => {
  if (typeof window === "undefined") return false;
  return window.innerHeight > window.innerWidth;
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(getIsPortrait);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsPortrait(getIsPortrait());
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="app-layout-root">
      <div className="app-layout-safe-area">
        {children}
      </div>

      {isPortrait && (
        <div className="orientation-overlay">
          <div className="orientation-overlay-content">
            <div className="orientation-icon">🔄</div>
            <div className="orientation-title">請旋轉裝置</div>
            <div className="orientation-text">
              這個遊戲是為橫向模式設計的。
              <br />
              請把手機或平板轉成橫向再繼續玩。
            </div>
          </div>
        </div>
      )}
    </div>
  );
};