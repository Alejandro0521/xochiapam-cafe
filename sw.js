/**
 * Service Worker — Xochiapam Café (PWA Offline Cache)
 * San Pedro Sochiapam, Oaxaca
 *
 * Estrategia de almacenamiento:
 * - App Shell y fuentes precacheadas en instalacion.
 * - Navegacion: Red con respaldo en cache (Network-first with offline fallback).
 * - Recursos estaticos: Cache con revalidacion en segundo plano (Stale-while-revalidate).
 */

const CACHE_NAME = 'xochiapam-v1';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './404.html',
  './manifest.json',
  './robots.txt',
  './css/tokens.css',
  './css/layout.css',
  './css/components.css',
  './js/bundle.js',
  './assets/fonts/Fredoka-Semibold.ttf',
  './assets/fonts/Nunito-Regular.ttf',
  './assets/fonts/Nunito-Bold.ttf',
  './assets/logos/horizontal-color.svg',
  './assets/logos/simbolo-color.svg',
  './assets/images/frontal-250g.svg',
  './assets/images/frontal-500g.svg',
  './assets/images/tarjeta-frente.svg',
  './assets/images/tarjeta-reverso.svg',
  './assets/images/adhesivo-circular.svg',
  './assets/images/origen-sochiapam-sierra.jpg',
  './assets/images/ritual-taza-madera.jpg',
  './assets/images/granos-molienda-textura.jpg',
  './assets/images/visualizacion-empaque.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
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

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Solo gestionar peticiones HTTP(S) de tipo GET
  if (request.method !== 'GET') return;
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) return;

  // Solicitudes de navegacion HTML (Network First)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const indexFallback = await caches.match('./index.html');
          if (indexFallback) return indexFallback;
          return caches.match('./404.html');
        })
    );
    return;
  }

  // Recursos estaticos (CSS, JS, Fuentes, Imagenes, SVG) -> Stale While Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
