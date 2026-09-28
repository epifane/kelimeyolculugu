const CACHE = "ky-v3";
const TEMEL_DOSYALAR = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "data/kelimeler.json",
  "manifest.json",
  "icons/icon.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(TEMEL_DOSYALAR)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(anahtarlar =>
      Promise.all(anahtarlar.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res =>
      res || fetch(e.request).then(net => {
        if (e.request.method === "GET") {
          const kopya = net.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, kopya));
        }
        return net;
      }).catch(() => res)
    )
  );
});
