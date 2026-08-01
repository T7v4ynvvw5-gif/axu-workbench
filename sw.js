// WorkBuddy 工作台 Service Worker — 极简缓存
const CACHE = 'workbuddy-v1';
const ASSETS = ['./', './index.html', './icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // 仅缓存同源 GET 请求
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return; // 跨域请求（如抖音API）直接放行，不缓存
  }
  e.respondWith(
    caches.match(req).then((cached) =>
      cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => cached)
    )
  );
});
