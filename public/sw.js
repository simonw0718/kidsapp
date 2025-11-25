// /public/sw.js
const CACHE_NAME = 'kidsapp-v11'; // 記得改版號，確保新 SW 生效 (Sync with SettingsPage.tsx)
const OFFLINE_URL = '/index.html';

const ASSETS = [
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Helper: Clean a response to remove "redirected" status
// We use blob() to ensure we have a clean body source that works across all browsers
const cleanResponse = async (response) => {
  const blob = await response.blob();
  const clean = new Response(blob, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  return clean;
};

// Helper: Fetch, Clean, and Cache (Ingress Sanitization)
const fetchAndCache = async (request, cacheName) => {
  const cache = await caches.open(cacheName);
  const response = await fetch(request);

  if (!response || response.status !== 200 || response.type === 'opaque') {
    return response;
  }

  // Always clean before putting into cache, even if not redirected, to be safe
  const clean = await cleanResponse(response.clone());
  await cache.put(request, clean);

  return response;
};

// 安裝階段：預先快取核心資源 (Manual Fetch-Clean-Put)
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Process assets one by one or in parallel
      await Promise.all(ASSETS.map((url) => fetchAndCache(url, CACHE_NAME)));
    })()
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

  // 導航請求：Network First -> Cache Fallback (支援離線開啟 App)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          // Egress Sanitization for Network response
          if (response.redirected) {
            return await cleanResponse(response);
          }
          return response;
        } catch (error) {
          return caches.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  // 其他靜態資源：Cache First -> Network Fallback
  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) {
        // Egress Sanitization for Cached response (Safety Net)
        if (cached.redirected) {
          return await cleanResponse(cached);
        }
        return cached;
      }

      // Network Fallback with Ingress Sanitization
      try {
        const response = await fetch(request);

        // Check validity
        if (
          !response ||
          response.status !== 200 ||
          response.type === 'opaque'
        ) {
          if (response.redirected) {
            return await cleanResponse(response);
          }
          return response;
        }

        // Clone, Clean, and Cache
        const clone = response.clone();
        const clean = await cleanResponse(clone);

        const cache = await caches.open(CACHE_NAME);
        cache.put(request, clean);

        return response;
      } catch (error) {
        // Offline fallback for specific assets if needed, or just fail
        // For now, we only have global offline fallback for navigation
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })()
  );
});