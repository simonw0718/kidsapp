//src/components/common/PageContainer.tsx
import React from "react";

interface PageContainerProps {
  title?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  scrollable?: boolean; // 允許頁面捲動（用於首頁、入口頁面等非遊戲頁面）
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  children,
  headerRight,
  scrollable = false,
}) => {
  return (
    <div className={`page-container ${scrollable ? 'scrollable' : ''}`}>
      {(title || headerRight) && (
        <div className="page-header">
          {title && <h1 className="page-title">{title}</h1>}
          {headerRight && <div className="page-header-right">{headerRight}</div>}
        </div>
      )}
      <div className="page-content">{children}</div>
    </div>
  );
};
