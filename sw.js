const CACHE_NAME = 'meraki-app-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// Un manejador de "fetch" es requisito técnico para que el navegador
// considere la app instalable. No cacheamos nada a propósito, para que
// la app siempre muestre la versión más reciente publicada.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
