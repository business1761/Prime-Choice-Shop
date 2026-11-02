/* Prime Choice app helper. It never keeps prices, products or settings: every page is fetched fresh,
   so the shop ON/OFF switch, sale prices and stock always show what is current.
   It only keeps the shop page itself so the app can open with a friendly message when the phone is offline. */
const CACHE = 'pc-shell-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;   // never touch the backend or other sites
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./', copy)); return res; })
      .catch(() => caches.match('./').then(r => r || new Response('You are offline. Please check your internet and open the app again.', { status: 503, headers: { 'Content-Type': 'text/plain' } }))));
  }
});
