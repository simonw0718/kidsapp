// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { GameCard } from "../components/home/GameCard";
import { usePwaInstallPrompt } from "../core/pwa/usePwaInstallPrompt";

export const HomePage: React.FC = () => {
  const { isInstallable, isInstalled, promptInstall } = usePwaInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [isIosLike, setIsIosLike] = useState(false);

useEffect(() => {
  if (typeof window === "undefined") return;

  const ua = window.navigator.userAgent || "";
  const isIphoneOrIpad = /iPhone|iPad|iPod/.test(ua);

  // iPadOS 很常回報成 Macintosh，但有觸控
  const isTouchMac =
    ua.includes("Macintosh") && "ontouchend" in window;

  setIsIosLike(isIphoneOrIpad || isTouchMac);
}, []);

  const shouldShowBanner =
    !dismissed && !isInstalled && (isInstallable || isIosLike);

  const handleInstallClick = async () => {
    if (!isInstallable) return;
    await promptInstall();
    // 不管使用者接受或拒絕，先把 banner 收起來
    setDismissed(true);
  };

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        boxSizing: "border-box",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        background: "#f7f4ff",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
            }}
          >
            小小練習樂園
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              fontSize: "14px",
              opacity: 0.8,
            }}
          >
            選一個想玩的遊戲開始吧！
          </p>
        </div>
      </header>

      <section
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <GameCard
          to="/abacus"
          subtitle="數學小遊戲"
          title="小小算珠加減樂"
          description="用虛擬算盤玩加減，慢慢練習不用急。"
        />
        <GameCard
          to="/picture-match"
          subtitle="語文小遊戲"
          title="圖像字卡配對"
          description="聽一聽、看一看，把圖像跟注音/單字連在一起。"
        />
      </section>

      {shouldShowBanner && (
        <div
          style={{
            marginTop: "8px",
            padding: "12px 16px",
            borderRadius: "16px",
            border: "1px solid rgba(0,0,0,0.12)",
            background: "#ffffffcc",
            fontSize: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontWeight: 600, marginBottom: 2 }}>
              把「小小練習樂園」安裝到這台裝置
            </div>
            {isIosLike ? (
              <div style={{ opacity: 0.8 }}>
                在 Safari 中點右上角的「分享」圖示，再選
                <b>「加入主畫面」</b>，就可以像 App 一樣打開。
              </div>
            ) : (
              <div style={{ opacity: 0.8 }}>
                點一下安裝，就能從主畫面或桌面直接打開，不用再輸入網址。
              </div>
            )}
          </div>

          {/* 非 iOS，且瀏覽器真的有 beforeinstallprompt 才顯示安裝按鈕 */}
          {!isIosLike && isInstallable && (
            <button
              type="button"
              style={{
                borderRadius: 999,
                border: "none",
                padding: "8px 14px",
                fontSize: 14,
                fontWeight: 600,
                background: "#4f46e5",
                color: "#fff",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
              onClick={handleInstallClick}
            >
              安裝到這台裝置
            </button>
          )}

          <button
            type="button"
            onClick={() => setDismissed(true)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 18,
              lineHeight: 1,
              cursor: "pointer",
              padding: 4,
            }}
            aria-label="關閉安裝提示"
          >
            ×
          </button>
        </div>
      )}
    </main>
  );
};