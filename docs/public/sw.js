// Service Worker for Casual's Blog
const CACHE_NAME = 'casual-blog-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/img/logo.png'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Failed to cache some static assets:', err);
        // Continue installation even if some assets fail to cache
        return Promise.resolve();
      });
    })
  );
  // Force the new service worker to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - implement cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) protocols
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip external resources - 跳过所有外部域名的请求，避免拦截导致加载失败
  if (
    url.hostname !== self.location.hostname &&
    !url.hostname.includes('blog.itpiggy.top') &&
    !url.hostname.includes('image.itpiggy.top')
  ) {
    // 跳过所有外部域名：Google Fonts, Cloudflare Insights, Analytics等
    return;
  }

  // Network-first strategy for API calls and dynamic content
  if (url.pathname.startsWith('/api/') || url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Cache-first strategy for images and fonts
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif|woff|woff2|ttf|eot)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Cache-first strategy for CSS and JS assets with hash in filename
  if (
    url.pathname.includes('/assets/') ||
    url.pathname.includes('/_assets/') ||
    url.pathname.match(/\.[a-f0-9]{8}\.(css|js)$/i)
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Stale-while-revalidate strategy for HTML pages
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => {
          // If offline and no cache, return cached homepage or 404 page
          if (!cachedResponse) {
            return caches.match('/').then(homepage => {
              return homepage || caches.match('/404.html');
            });
          }
          return cachedResponse;
        });

        // Return cached response immediately if available, while updating in background
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Message event - handle cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
});