const CACHE_NAME = "metaryx-v1";

const urlsToCache = [
  "/meteofis/",
  "/meteofis/index.html",
  "/meteofis/manifest.json",
  "/meteofis/service-worker.js",
  "/meteofis/android-chrome-512x512.png",
  "/meteofis/favicon-32x32.png",
  "/meteofis/favicon-16x16.png",
  "/meteofis/site.webmanifest",
  "/meteofis/styles.css", // opsional
  "/meteofis/app.js"      // opsional
];

// Saat install: simpan ke cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting(); // aktifkan SW segera
});

// Saat activate: bersihkan cache lama
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim(); // ambil kendali langsung
});

// Saat fetch: ambil dari cache, fallback ke index jika offline
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // jika ada di cache, pakai
      if (response) return response;
      // jika tidak, ambil dari jaringan
      return fetch(event.request).catch(() => {
        // fallback saat offline
        if (event.request.mode === 'navigate') {
          return caches.match("/meteofis/index.html");
        }
      });
    })
  );
});
