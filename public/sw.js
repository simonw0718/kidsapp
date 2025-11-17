// public/sw.js

// 每次有重大前端改版，手動改這個版本字串就可以清掉舊 cache
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `kid-app-cache-${CACHE_VERSION}`;

// 會在安裝階段預先 cache 的「App Shell」資源
const APP_SHELL = [
  "/",                     // 入口
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// 安裝：預先把 App Shell 放進 cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );

  // 讓新的 SW 安裝完就接管（避免要多一次 reload）
  self.skipWaiting();
});

// 啟用：清掉舊版 cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("kid-app-cache-") && key !== CACHE_NAME)
          .map((oldKey) => caches.delete(oldKey))
      )
    )
  );

  // 讓目前開著的頁面立刻受新的 SW 控制
  self.clients.claim();
});

// 取得是否是「導覽請求」（打開 /abacus、/games/abacus/play 這種）
const isNavigationRequest = (request) =>
  request.mode === "navigate" ||
  (request.method === "GET" &&
    request.headers.get("accept")?.includes("text/html"));

// 主要 fetch handler
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // 1) 導覽類請求：離線時一律回傳 cached index.html（讓 SPA 路由可以工作）
  if (isNavigationRequest(request)) {
    event.respondWith(
      caches.match("/index.html").then((cached) => {
        if (cached) return cached;
        // 若 cache 裡沒有，就回網路；第一次載入時會被 install 階段補上
        return fetch("/index.html");
      })
    );
    return;
  }

  // 2) 靜態資源（js / css / image / font）：採用 cache-first 策略
  const dest = request.destination;
  if (["script", "style", "image", "font"].includes(dest)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // 已在 cache 就直接用
          return cached;
        }

        // 沒 cache 時走網路，成功後丟進 cache
        return fetch(request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
            return response;
          })
          .catch(() => {
            // 網路失敗又沒有 cache → 這裡可考慮放預設圖或靜態 fallback
          });
      })
    );
    return;
  }

  // 3) 其他請求（目前專案幾乎用不到 API）→ 直接走網路
  event.respondWith(fetch(request));
});