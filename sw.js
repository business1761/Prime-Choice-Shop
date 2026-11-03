/* Prime Choice app helper. It never keeps prices, products or settings: the shop asks for those fresh every time,
   so the shop ON/OFF switch, sale prices and stock always show what is current.
   It keeps only the shop page and the logo pictures on the phone, so the app opens at once and shows the loading line
   even on slow or no internet. A new version of the shop page appears the next time the app is opened. */
const CACHE = 'pc-shell-v2';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function fromCacheThenUpdate(key, req) {
  return caches.open(CACHE).then(c => c.match(key).then(hit => {
    const net = fetch(req).then(res => { if (res && res.ok) c.put(key, res.clone()); return res; });
    if (hit) { net.catch(() => {}); return hit; }   // open at once from the phone, refresh quietly for next time
    return net.catch(() => new Response('You are offline. Please check your internet and open the app again.', { status: 503, headers: { 'Content-Type': 'text/plain' } }));
  }));
}
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;   // never touch the backend or other sites
  if (req.mode === 'navigate') e.respondWith(fromCacheThenUpdate('./', req));
  else if (/\.(png|webmanifest)$/.test(url.pathname)) e.respondWith(fromCacheThenUpdate(url.pathname, req));
});
