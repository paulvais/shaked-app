const CACHE = 'shaked-v1';
const STATIC = ['/', '/index.html', '/manifest.json', '/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Never cache API calls
  const url = e.request.url;
  if (url.includes('googleapis') || url.includes('openstreetmap') || url.includes('osrm') || url.includes('nominatim') || url.includes('accounts.google')) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
    if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
    return r;
  })));
});
