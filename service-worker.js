const CACHE_NAME = 'metaryx-cache-v3'; // ⚠️ Ganti versi jika ada perubahan
const OFFLINE_URL = '/meteofis/index.html';

const urlsToCache = [
  '/meteofis/',
  '/meteofis/index.html',
  '/meteofis/manifest.json',
  '/meteofis/service-worker.js',
  '/meteofis/apple-touch-icon.png',
  '/meteofis/favicon-16x16.png',
  '/meteofis/favicon-32x32.png',
  '/meteofis/favicon.ico',
  '/meteofis/android-chrome-192x192.png',
  '/meteofis/android-chrome-512x512.png'
];

// ✅ Install
self.addEventListener('install', event => {
  console.log('📦 Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📁 Caching app shell...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// ✅ Activate
self.addEventListener('activate', event => {
  console.log('✅ Activating Service Worker...');
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🧹 Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );

      // 🔄 Kirim pesan ke semua tab aktif
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({ type: 'NEW_VERSION_AVAILABLE' });
      });
    })()
  );
  self.clients.claim();
});

// ✅ Fetch
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (
            !cachedResponse &&
            event.request.headers.get('accept')?.includes('text/html')
          ) {
            return caches.match(OFFLINE_URL);
          }
          return cachedResponse || new Response('', { status: 404 });
        });

      return cachedResponse || fetchPromise;
    })
  );
});
