const CACHE_NAME = 'kidsapp-v3';
const OFFLINE_URL = '/index.html';

const ASSETS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 安裝階段：預先快取核心資源（注意：這裡是 index.html，不是根目錄 /）
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

// 取用階段：cache-first，並處理 SPA 導航 & redirect 問題
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // 只處理 GET
  if (request.method !== 'GET') {
    return;
  }

  // 導航請求（使用者在 PWA 裡換頁）
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 其他資源：一般 cache-first
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
        .catch(() => caches.match(OFFLINE_URL));
    })
  );
});