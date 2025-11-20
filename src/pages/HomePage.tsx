// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
        // [iOS 安全區域 Padding] 使用 CSS 變數確保內容不被系統 UI 遮住
        paddingTop: "calc(var(--safe-area-top) + var(--page-padding-top) + 12px)",
        paddingLeft: "calc(var(--safe-area-left) + var(--page-padding-horizontal) + 8px)",
        paddingRight: "calc(var(--safe-area-right) + var(--page-padding-horizontal) + 8px)",
        paddingBottom: "calc(var(--safe-area-bottom) + var(--page-padding-bottom) + 12px)",
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
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <Link
          to="/abacus"
          style={{
            display: "block",
            textDecoration: "none",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)";
          }}
        >
          <img
            src="/icons/abacus_entry.png"
            alt="小小算珠加減樂"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </Link>

        <Link
          to="/picture-match"
          style={{
            display: "block",
            textDecoration: "none",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)";
          }}
        >
          <img
            src="/icons/match_entry.png"
            alt="圖像字卡配對"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
            }}
          />
        </Link>
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