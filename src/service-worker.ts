const CACHE_NAME = 'fat2fit-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

const EXCLUDED_PREFIXES = [
  '/api/',
  '/supabase/',
];

// Use any to bypass TS redeclare issues in global scope
const sw = (self as any);

sw.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  sw.skipWaiting();
});

sw.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve(false);
        })
      );
    })
  );
  sw.clients.claim();
});

sw.addEventListener('fetch', (event: any) => {
  const url = new URL(event.request.url);

  if (
    event.request.method !== 'GET' ||
    EXCLUDED_PREFIXES.some(prefix => url.pathname.startsWith(prefix)) ||
    url.hostname.includes('supabase.co')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse || 
          networkResponse.status !== 200 || 
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return new Response('Network error occurred', { status: 408 });
      });
    })
  );
});
