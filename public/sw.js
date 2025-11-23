// /public/sw.js
const CACHE_NAME = 'kidsapp-v6'; // 記得改版號，確保新 SW 生效
const OFFLINE_URL = '/index.html';

const ASSETS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 安裝階段：預先快取核心資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 啟用階段：清掉舊版本 cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 取用階段
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只處理 GET
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 只處理同網域
  if (url.origin !== self.location.origin) {
    return;
  }

  // ⚠ 導航請求一律交給瀏覽器，不用 SW 介入
  if (request.mode === 'navigate') {
    return;
  }

  // [修改] 移除圖片排除邏輯，允許圖片使用快取以支援離線模式


  // 其他靜態資源：一般 cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // 如果是 redirect / opaque / 非 200，就不要放進 cache
          if (
            !response ||
            response.status !== 200 ||
            response.type === 'opaque' ||
            response.redirected
          ) {
            return response;
          }

          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });

          return response;
        })
        // 只對「我們有預先快取的東西」做離線 fallback
        .catch(() => caches.match(OFFLINE_URL));
    })
  );
});