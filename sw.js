/* VEXBIZ · Service worker: la app abre sin conexión.
   - Casco de la app (HTML, CSS, JS, fuentes, íconos): se guarda al instalar.
   - Catálogo (data/catalog.json): se muestra lo guardado y se actualiza por detrás.
   - Fotos de productos (storage.vexbiz.com): primero caché, tope de 400 imágenes.
   - API en vivo (marketplace-api): primero red, caché si no hay conexión.
   - Cuenta (/auth, /account-api, cualquier pedido con Authorization): nunca pasa por la caché.
   Subir VERSION en cada entrega para que los teléfonos reciban la versión nueva. */
const VERSION = 'vx-1.9.6';
const SHELL = `${VERSION}-shell`, DATA = `${VERSION}-data`, IMG = 'vx-img', API = 'vx-api';
const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'assets/css/app.css',
  'assets/css/fonts.css',
  'assets/css/tokens.css',
  'assets/fonts/host-grotesk-latin-400-normal.woff2',
  'assets/fonts/host-grotesk-latin-500-normal.woff2',
  'assets/fonts/host-grotesk-latin-600-normal.woff2',
  'assets/fonts/host-grotesk-latin-700-normal.woff2',
  'assets/fonts/host-grotesk-latin-800-normal.woff2',
  'assets/fonts/inter-latin-400-normal.woff2',
  'assets/fonts/inter-latin-500-normal.woff2',
  'assets/fonts/inter-latin-600-normal.woff2',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/favicon-64.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-512.png',
  'assets/img/banner-1.webp',
  'assets/img/banner-2.webp',
  'assets/img/banner-3.webp',
  'assets/img/logo-claro.webp',
  'assets/img/nichos/aut.webp',
  'assets/img/nichos/far.webp',
  'assets/img/nichos/fer.webp',
  'assets/img/nichos/gps.webp',
  'assets/img/nichos/ind.webp',
  'assets/img/nichos/mot.webp',
  'assets/img/nichos/ref.webp',
  'assets/img/nichos/res.webp',
  'assets/img/nichos/sol.webp',
  'assets/img/nichos/sup.webp',
  'assets/img/nichos/tlc.webp',
  'assets/img/logo-oscuro.webp',
  'assets/img/prov-refrihogar.webp',
  'assets/js/api.js',
  'assets/js/auth.js',
  'assets/js/config.js',
  'assets/js/format.js',
  'assets/js/main.js',
  'assets/js/nav.js',
  'assets/js/pwa.js',
  'assets/js/quick.js',
  'assets/js/router.js',
  'assets/js/store.js',
  'assets/js/ui.js',
  'assets/js/views/account.js',
  'assets/js/views/catalog.js',
  'assets/js/views/checkout.js',
  'assets/js/views/home.js',
  'assets/js/views/login.js',
  'assets/js/views/product.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => caches.open(DATA)).then((c) => c.add('data/catalog.json')));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('vx-') && ![SHELL, DATA, IMG, API].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (e) => { if (e.data === 'skip-waiting') self.skipWaiting(); });

async function trim(cacheName, max) {
  const c = await caches.open(cacheName), keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.headers.has('Authorization') || /\/(auth|account-api|payments-api)\//.test(url.pathname)) return;   // datos de la cuenta: siempre red, nunca caché

  if (url.hostname === 'storage.vexbiz.com') {                     // fotos
    e.respondWith(caches.open(IMG).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      try { const res = await fetch(req); if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); trim(IMG, 400); } return res; }
      catch (err) { return new Response('', { status: 504 }); }
    }));
    return;
  }
  if (url.pathname.includes('/marketplace-api/')) {                // API en vivo
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(API).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req)));
    return;
  }
  if (url.origin !== location.origin) return;

  if (url.pathname.endsWith('/data/catalog.json')) {               // catálogo
    e.respondWith(caches.open(DATA).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: true });
      const net = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (req.mode === 'navigate') {                                  // HTML: red primero
    e.respondWith(fetch(req).then((res) => { caches.open(SHELL).then((c) => c.put('index.html', res.clone())); return res; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) caches.open(SHELL).then((c) => c.put(req, res.clone())); return res; })));
});
