/*
  Garden State Coon — Service Worker
  Cache-First for images & fonts, Network-First for HTML,
  Stale-While-Revalidate for CSS & JS

  Cloudflare setup:
  - Speed > Optimization > HTTP/3 (QUIC) = ON
  - Speed > Optimization > Brotli = ON
  - Caching > Cache Rules: Cache Everything for /css/* /js/* /fonts/*
*/

const CACHE_NAME = 'garden-state-coon-v1';
const STATIC_CACHE = `${CACHE_NAME}-static`;
const HTML_CACHE = `${CACHE_NAME}-html`;

/* Derive base path from SW scope so caching works on any subpath */
const BASE = new URL('.', self.location).pathname;

const STATIC_ASSETS = [
  'css/variables.css',
  'css/base.css',
  'css/components.css',
  'css/pages/index.css',
  'css/pages/kittens.css',
  'css/pages/kitten-detail.css',
  'css/pages/gallery.css',
  'css/pages/our-cats.css',
  'css/pages/about.css',
  'css/pages/contact.css',
  'css/pages/faq.css',
  'css/pages/health-testing.css',
  'css/pages/shipping.css',
  'css/pages/waiting-list.css',
  'css/pages/purchase-contract.css',
  'css/pages/privacy-policy.css',
  'css/pages/terms-of-sale.css',
  'css/pages/cookie-policy.css',
  'css/pages/404.css',
  'js/nav.js',
  'js/lightbox.js',
  'js/form.js',
  'fonts/cormorant-garamond-regular.woff2',
  'fonts/jost-regular.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(c => c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== HTML_CACHE)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  if (request.destination === 'document') {
    /* === Network-First for HTML === */
    e.respondWith(
      fetch(request)
        .then(r => {
          caches.open(HTML_CACHE).then(c => c.put(request, r.clone()));
          return r;
        })
        .catch(() => caches.match(request))
    );
  } else if (
    request.destination === 'image' ||
    url.pathname.startsWith(BASE + 'fonts/') ||
    /\.(avif|webp|jpg|jpeg|woff2)$/i.test(url.pathname)
  ) {
    /* === Cache-First for images & fonts === */
    e.respondWith(
      caches.match(request).then(r => r || fetch(request).then(resp => {
        caches.open(STATIC_CACHE).then(c => c.put(request, resp.clone()));
        return resp;
      }))
    );
  } else if (
    url.pathname.startsWith(BASE + 'css/') ||
    url.pathname.startsWith(BASE + 'js/')
  ) {
    /* === Stale-While-Revalidate for CSS & JS === */
    e.respondWith(
      caches.match(request).then(cached => {
        const fetched = fetch(request).then(resp => {
          caches.open(STATIC_CACHE).then(c => c.put(request, resp.clone()));
          return resp;
        });
        return cached || fetched;
      })
    );
  } else {
    /* === Default: Network with cache fallback === */
    e.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  }
});
