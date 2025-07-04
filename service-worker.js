const CACHE_NAME = "metaryx-v1";

const urlsToCache = [
  "/meteofis/",
  "/meteofis/index.html",
  "/meteofis/manifest.json",
  "/meteofis/service-worker.js",
  "/meteofis/android-chrome-512x512.png", // sesuaikan dengan ikon yang kamu gunakan
  "/meteofis/favicon-32x32.png",          // opsional
  "/meteofis/favicon-16x16.png",          // opsional
  "/meteofis/site.webmanifest",          // opsional
  "/meteofis/styles.css",                // jika kamu punya file CSS terpisah
  "/meteofis/app.js"                     // jika script JavaScript kamu dipisah
];

// Install: simpan file ke cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Langsung aktif tanpa nunggu tab ditutup
});

// Activate: hapus cache lama
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // Ambil alih semua halaman
});

// Fetch: ambil dari cache dulu, kalau tidak ada ambil dari jaringan
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => caches.match("/meteofis/index.html")) // fallback saat offline
  );
});
