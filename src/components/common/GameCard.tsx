import React from "react";
import { useNavigate } from "react-router-dom";

interface GameCardProps {
  title: string;
  description?: string;
  route: string;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  description,
  route,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <button className="game-card" onClick={handleClick}>
      <div className="game-card-title">{title}</div>
      {description && (
        <div className="game-card-description">{description}</div>
      )}
    </button>
  );
};
