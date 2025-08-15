// Service Worker for background mining
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
  
  // Cache app shell and assets
  event.waitUntil(
    caches.open('ghost-wallet-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icons/icon-72x72.png',
        '/icons/icon-96x96.png',
        '/icons/icon-128x128.png',
        '/icons/icon-144x144.png',
        '/icons/icon-152x152.png',
        '/icons/icon-192x192.png',
        '/icons/icon-384x384.png',
        '/icons/icon-512x512.png'
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== 'ghost-wallet-v1')
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Keep service worker alive
self.addEventListener('fetch', (event) => {
  // Respond with cached resources
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});