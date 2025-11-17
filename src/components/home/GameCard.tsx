//src/components/home/GameCard.tsx
import { Link } from "react-router-dom";

type GameCardProps = {
  to: string;
  title: string;
  subtitle?: string;
  description?: string;
};

export const GameCard: React.FC<GameCardProps> = ({
  to,
  title,
  subtitle,
  description
}) => {
  return (
    <Link
      to={to}
      className="game-card"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "16px",
        borderRadius: "16px",
        border: "2px solid #222",
        textDecoration: "none",
        background: "#fff",
        boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
        color: "#222",
        minHeight: "140px"
      }}
    >
      <div>
        <div
          style={{
            fontSize: "14px",
            opacity: 0.7,
            marginBottom: "4px"
          }}
        >
          {subtitle}
        </div>
        <h2
          style={{
            fontSize: "20px",
            margin: 0,
            marginBottom: "8px"
          }}
        >
          {title}
        </h2>
        {description && (
          <p
            style={{
              fontSize: "14px",
              margin: 0
            }}
          >
            {description}
          </p>
        )}
      </div>
      <div
        style={{
          marginTop: "12px",
          fontSize: "14px",
          fontWeight: 600,
          textAlign: "right"
        }}
      >
        👉 點我開始
      </div>
    </Link>
  );
};