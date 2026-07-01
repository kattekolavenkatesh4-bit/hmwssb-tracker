const CACHE_NAME = "hmwssb-app-v2"; // Changed to v2 to force an update
const urlsToCache = [
  "index.html",
  "manifest.json",
  "icon-192.png"
];

// Install new worker and cache files
self.addEventListener("install", event => {
  self.skipWaiting(); // Forces the phone to use this new version immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Clean up old saved versions (removes v1)
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Network First strategy (Always get the latest code if online)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If we get a valid response from the internet, save a copy to the cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If the internet is down (fetch fails), load from the cache
        return caches.match(event.request);
      })
  );
});
