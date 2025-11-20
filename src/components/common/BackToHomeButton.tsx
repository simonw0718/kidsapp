import React from "react";
import { useNavigate } from "react-router-dom";

export const BackToHomeButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      className="back-to-home-button"
      onClick={() => navigate("/")}
      aria-label="回到首頁"
      title="回到首頁"
    >
      🏠
    </button>
  );
};
