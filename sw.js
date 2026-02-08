const CACHE_NAME = "rr-lyrics-v1";

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/music/index.html",
  "/manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

/* FETCH */
self.addEventListener("fetch", event => {
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
