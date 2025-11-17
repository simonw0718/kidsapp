//src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// 基本 reset（你目前 index.css）
import "./index.css";

// ★★★ 關鍵：把你真正的 layout + abacus CSS 進來
import "./core/layout/layout.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Service Worker 註冊（PWA）
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.log("SW registration failed:", err));
  });
}