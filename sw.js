/* ================================
   RR LYRICS — SERVICE WORKER
   Scope: /music/
   Viewer-first PWA routing
================================ */

const CACHE_NAME = "rr-lyrics-v1";

/* Файлы ядра приложения */
const CORE_ASSETS = [
  "/music/index.html",
  "/manifest.json"
];

/* ================= INSTALL ================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener("fetch", event => {

  const req = event.request;
  const url = new URL(req.url);

  /* ---------- NAVIGATION ---------- */
  if (req.mode === "navigate") {

    /* Любая навигация внутри /music → viewer */
    if (url.pathname.startsWith("/music")) {

      event.respondWith(
        caches.match("/music/index.html")
          .then(res => res || fetch("/music/index.html"))
      );

      return;
    }

  }

  /* ---------- TXT + ASSETS ---------- */
  event.respondWith(

    caches.match(req).then(cached => {

      if (cached) return cached;

      return fetch(req).then(networkRes => {

        /* Кешируем TXT и статику */
        if (
          req.method === "GET" &&
          url.pathname.startsWith("/txt/")
        ) {
          const clone = networkRes.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(req, clone));
        }

        return networkRes;

      }).catch(() => {

        /* Offline fallback для viewer */
        if (req.mode === "navigate") {
          return caches.match("/music/index.html");
        }

      });

    })

  );

});
