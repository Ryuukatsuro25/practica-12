// RappiWAO — Service Worker (opcional): cachea archivos estáticos para uso offline.
// Datos (DB) se guardan en localStorage (no en Cache API).
const CACHE = 'rappiwao-static-v1';
const ASSETS = [
  './',
  './index.html',
  './assets/css/styles.css',
  './assets/js/app.js',
  './assets/js/auth.js',
  './assets/js/admin.js',
  './assets/js/marketplace.js',
  './assets/js/router.js',
  './assets/js/seed.js',
  './assets/js/storage.js',
  './assets/js/store.js',
  './assets/js/ui.js',
  './assets/js/util.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : Promise.resolve())));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if(req.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if(cached) return cached;
    try {
      const fresh = await fetch(req);
      return fresh;
    } catch (e) {
      // fallback: app shell
      const shell = await caches.match('./index.html');
      return shell || new Response('Offline', { status: 503 });
    }
  })());
});
