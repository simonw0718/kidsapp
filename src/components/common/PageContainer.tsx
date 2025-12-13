//src/components/common/PageContainer.tsx
import React from "react";

interface PageContainerProps {
  title?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  scrollable?: boolean; // 允許頁面捲動（用於首頁、入口頁面等非遊戲頁面）
  className?: string; // 允許傳入額外的 className
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  children,
  headerRight,
  scrollable = false,
  className = '',
}) => {
  return (
    <div className={`page-container ${scrollable ? 'scrollable' : ''} ${className}`}>
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
