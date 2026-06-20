const CACHE_NAME = 'dreflow-v3';

const PRECACHE_URLS = ['./', './index.html'];

function isCacheableRequest(request) {
  const url = new URL(request.url);
  if (request.method !== 'GET') return false;
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
  // Never intercept Vite dev server or extension URLs
  if (url.pathname.startsWith('/@')) return false;
  if (url.pathname.startsWith('/src/') && url.hostname === 'localhost') return false;
  return true;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => Promise.resolve())
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (!isCacheableRequest(event.request)) return;

  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok && networkResponse.type === 'basic') {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone).catch(() => {});
          });
        }
        return networkResponse;
      } catch {
        const cached = await caches.match(event.request);
        return cached || Response.error();
      }
    })()
  );
});
