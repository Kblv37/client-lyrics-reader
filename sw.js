const CACHE_NAME = "rr-lyrics-v3";

const CORE = [
  "/",
  "/index.html",
  "/music/index.html",
  "/manifest.json"
];

/* INSTALL */
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE))
  );
});

/* ACTIVATE */
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      )
    )
  );
});

/* FETCH */
self.addEventListener("fetch", event => {

  const url = new URL(event.request.url);

  /* === NAVIGATION REQUESTS === */
  if (event.request.mode === "navigate") {

    // Если переход в /music
    if (url.pathname.startsWith("/music")) {
      event.respondWith(
        caches.match("/music/index.html")
      );
      return;
    }

    // Все остальные страницы
    event.respondWith(
      caches.match("/index.html")
    );
    return;
  }

  /* === ASSETS / TXT === */
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      });
    })
  );

});
