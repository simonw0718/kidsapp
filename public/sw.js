const CACHE_NAME = 'kidsapp-v4'; // 記得改版號，確保新 SW 生效
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

  // ⚠ 關鍵修正：
  // 導航請求一律交給瀏覽器，不用 SW 介入
  // 避免把「含 redirect 的 response」丟給 iOS，造成白畫面
  if (request.mode === 'navigate') {
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
        // （選擇性）如果真的離線，對非導航請求就放棄，或回 offline 頁
        .catch(() => caches.match(OFFLINE_URL));
    })
  );
});