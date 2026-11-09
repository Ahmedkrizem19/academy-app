const CACHE_NAME = 'academy-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/logo.jpg',
  './assets/team-photo.jpg',
  './assets/team-celebration.jpg',
  './assets/player-of-week.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // لا نخزّن طلبات Supabase أو أي بيانات خارج نطاق الموقع في Cache المتصفح.
  if (url.origin !== self.location.origin) return;

  // ملفات التطبيق الثابتة: الشبكة أولاً مع نسخة مخزنة كخيار احتياطي.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return Response.error();
      })
  );
});
