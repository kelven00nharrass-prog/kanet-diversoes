const CACHE_NAME = 'kanet-cache-v8';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/qrcode.min.js',
  '/words.json',
  '/logo.png',
  '/favicon.png',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia Network-First: garante que o código mais recente é sempre descarregado
self.addEventListener('fetch', (e) => {
  // Evitar interceptar conexões WebSocket
  if (e.request.url.startsWith('ws:') || e.request.url.startsWith('wss:')) {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Se a resposta for válida, atualizar cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar a rede (offline), usar cache
        return caches.match(e.request);
      })
  );
});
