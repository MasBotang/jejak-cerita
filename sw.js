const CACHE_NAME = 'jejakcerita-cache-v1';
const API_CACHE_NAME = 'jejakcerita-api-cache-v1';
const STORY_API_BASE_URL = 'https://story-api.dicoding.dev';

const ASSETS_TO_CACHE = [
  '/jejak-cerita/', 
  '/jejak-cerita/index.html',
  '/jejak-cerita/manifest.json',
  '/jejak-cerita/src/styles/style.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css', 
  'https://unpkg.com/leaflet/dist/leaflet.css',
  '/jejak-cerita/src/main.js',
  'https://unpkg.com/leaflet/dist/leaflet.js', 
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', 
  '/jejak-cerita/src/assets/logo-jejakCerita.png',
  '/jejak-cerita/icons/icon-192x192.png',
  '/jejak-cerita/icons/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .catch(error => console.error('SW: Failed caching assets', error))
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName.startsWith('jejakcerita-cache-') &&
            cacheName !== CACHE_NAME &&
            cacheName !== API_CACHE_NAME
          ) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return null;
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith('http')) return;

  const requestUrl = new URL(event.request.url);

  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // API Requests: Stale-While-Revalidate
  if (requestUrl.origin === STORY_API_BASE_URL && requestUrl.pathname.startsWith('/v1/stories')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            console.warn('SW: Failed to fetch from network:', event.request.url);
            throw new Error('API fetch failed.');
          });

        return cachedResponse || networkFetch;
      }).catch(async () => {
        const fallback = await caches.match(event.request);
        if (fallback) return fallback;
        return new Response(JSON.stringify({ error: 'Offline, no cached data available.' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
          statusText: 'Service Unavailable (Offline)',
        });
      })
    );
    return;
  }

  // Static Assets: Cache-First Strategy
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok && (response.type === 'basic' || response.type === 'cors')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') return caches.match('/index.html');
          return new Response(null, { status: 503, statusText: 'Service Unavailable (Offline)' });
        });
    })
  );
});

// Push Notification Event
self.addEventListener('push', (event) => {
  console.log('SW: Push event received.');
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: 'Notifikasi Baru',
      body: event.data ? event.data.text() : 'Ada pembaruan cerita!',
    };
  }

  const title = data.title || 'Jejak Cerita';
  const options = {
    body: data.body || 'Ada pembaruan cerita terbaru!',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    image: data.image || undefined,
    data: data.data || {},
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification clicked.');
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
