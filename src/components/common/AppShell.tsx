import React from "react";
import { Layout } from "../../core/layout/Layout";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <Layout>
      <div className="app-shell">
        {children}
      </div>
    </Layout>
  );
};
