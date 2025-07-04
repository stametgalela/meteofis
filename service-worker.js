const CACHE_NAME = "metaryx-v1";
const urlsToCache = [
  "index.html",
  "manifest.json",
  "icon.png",
  "service-worker.js"
];

// Install: simpan file ke cache
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// ✅ Tambahkan Activate di sini
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME) // hapus cache lama
          .map(name => caches.delete(name))
      );
    })
  );
});

// Fetch: ambil dari cache atau jaringan
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
