import React from "react";
import "./layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-layout-root">
      <div className="app-layout-safe-area">
        {children}
      </div>
    </div>
  );
};
