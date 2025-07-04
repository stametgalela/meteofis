const CACHE_NAME = 'metaryx-cache-v1';
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
  '/meteofis/android-chrome-512x512.png'
];

// ✅ Install: simpan file ke cache
self.addEventListener('install', event => {
  console.log('📦 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📁 Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // aktifkan langsung
});

// ✅ Activate: hapus cache lama jika ada
self.addEventListener('activate', event => {
  console.log('✅ Service Worker: Activated');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(key => {
          if (key !== CACHE_NAME) {
            console.log('🧹 Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // aktifkan untuk semua tab
});

// ✅ Fetch: ambil dari cache dulu, kalau gagal baru dari jaringan
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log('✅ [SW] Serving from cache:', event.request.url);
        return response;
      }

      console.log('🌐 [SW] Fetching from network:', event.request.url);
      return fetch(event.request).catch(() => {
        // Jika gagal dan permintaan ke HTML → fallback ke index.html
        if (event.request.headers.get('accept')?.includes('text/html')) {
          console.warn('⚠️ Offline fallback for:', event.request.url);
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
