//src/components/common/PageContainer.tsx
import React from "react";

interface PageContainerProps {
  title?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  children,
  headerRight,
}) => {
  return (
    <div className="page-container">
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
