// LagiButuh offline service worker.
//
// Bump STRATEGY whenever the caching strategy changes. BUILD_ID is stamped per
// deploy by tool/stamp_web_build.mjs, so every build installs a new worker —
// that is what raises the in-app "update available" banner while the old one
// keeps serving the open page. activate() drops every lagibutuh-* cache that
// is not part of the new pair. The worker lives at <base>/sw.js, so its scope —
// and BASE below — follows the deployed sub-path (e.g. /LagiButuh/ on GitHub
// Pages) without hard-coding it.
'use strict';

const STRATEGY = 'v2';
const BUILD_ID = '10c6c0cfaf';
const VERSION = `${STRATEGY}-${BUILD_ID}`;
const SHELL_CACHE = `lagibutuh-shell-${VERSION}`;
const RUNTIME_CACHE = `lagibutuh-runtime-${VERSION}`;
const CACHE_PREFIX = 'lagibutuh-';
const BASE = new URL(self.registration.scope).pathname;

// Small shell, cached as one unit.
const SHELL_URLS = [
  BASE,
  `${BASE}index.html`,
  // The loader itself. Network-first for these would put a round trip in front
  // of the engine download and leave an offline visit with no bootstrapper at
  // all; they change only when the build does, and the shell cache is versioned
  // by BUILD_ID.
  `${BASE}flutter_bootstrap.js`,
  `${BASE}flutter.js`,
  `${BASE}version.json`,
  `${BASE}manifest.json`,
  `${BASE}favicon.png`,
  `${BASE}icons/Icon-192.png`,
  `${BASE}icons/Icon-512.png`,
  // The status-bar badge a worker-displayed notification needs; without it
  // precached an offline notification falls back to a bare square.
  `${BASE}icons/badge-96.png`,
];

// Images and fonts never change bytes under the same URL in a build, so they
// can be served from cache and refreshed in the background. Small code and JSON
// go through the network first so a new deploy is picked up on the next launch.
const IMMUTABLE_ASSET = /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|otf)$/i;

// The engine and the app bundle: multi-megabyte, and byte-identical for a given
// build. These are cache-first, not network-first. The cache name carries the
// BUILD_ID, so a new deploy writes a new cache and a cached engine can never be
// stale — while re-downloading main.dart.wasm on every visit is what made a
// warm boot as slow as a cold one. `.symbols` files are build tooling, never
// fetched by the app, and must not be pulled into the cache.
const ENGINE_ASSET =
  /(?:^|\/)(?:flutter_bootstrap\.js|flutter\.js|version\.json|main\.dart\.(?:js|wasm|mjs)|canvaskit\/[^/]+)$/;
const SYMBOLS_ASSET = /\.symbols$/;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)),
  );
});

// The page asks the waiting worker to take over only after the update banner's
// "Muat ulang" tap. No automatic skipWaiting: swapping assets under a running
// screen can break an in-flight write.
self.addEventListener('message', (event) => {
  const message = event.data || {};
  if (message.type === 'SKIP_WAITING') self.skipWaiting();
  if (message.type === 'warm-engine' && Array.isArray(message.urls)) {
    event.waitUntil(warmEngine(message.urls.slice(0, 20)));
  }
});

// A browser notification the page could not construct itself (mobile Chrome)
// is displayed through this worker, so its click lands here. The payload is
// posted back to an existing tab instead of opening a cold one: the open tab
// still holds the session and the screen the user was on, and Flutter routes
// from there. Without a tab the app is simply opened at the splash.
self.addEventListener('notificationclick', (event) => {
  const data = event.notification.data || {};
  event.notification.close();
  event.waitUntil(
    (async () => {
      const scope = self.registration.scope;
      const windows = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      const inScope = windows.filter((client) => client.url.startsWith(scope));
      const target =
        inScope.find((client) => client.focused) || inScope[0] || windows[0];
      if (target) {
        await target.focus();
        target.postMessage({ type: 'notification-click', data });
        return;
      }
      await self.clients.openWindow(scope);
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL_CACHE, RUNTIME_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && !keep.has(key))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(BASE)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  if (SYMBOLS_ASSET.test(url.pathname)) return;

  event.respondWith(
    ENGINE_ASSET.test(url.pathname)
      ? cacheFirst(request, RUNTIME_CACHE)
      : IMMUTABLE_ASSET.test(url.pathname)
      ? staleWhileRevalidate(request, RUNTIME_CACHE)
      : networkFirst(request, RUNTIME_CACHE),
  );
});

// The page reports the engine files it actually loaded, right after the app
// starts, and the worker stores exactly those. Install-time precaching cannot do
// this: a build ships both the wasm engine and the JS fallback plus the whole
// canvaskit directory (~16 MB), and only a few of those files are ever fetched.
// Every reported URL was just downloaded, so warming is an HTTP-cache read, not
// a second download — and the very next visit is served entirely from Cache
// Storage, offline included.
async function warmEngine(urls) {
  const cache = await caches.open(RUNTIME_CACHE);
  await Promise.all(
    urls.map(async (url) => {
      try {
        if (!url.startsWith(self.registration.scope)) return;
        if (await cache.match(url)) return;
        const response = await fetch(url);
        if (!response.ok) return;
        const type = response.headers.get('content-type') || '';
        const expected = url.endsWith('.wasm') ? /wasm/ : /javascript/;
        if (!expected.test(type)) return;
        await cache.put(url, response);
      } catch (error) {
        // A revoked file or a dropped connection: cacheFirst retries on demand.
      }
    }),
  );
}

// Serve a build asset straight from Cache Storage once this build has stored
// it; no revalidation, no network. A build that did not cache the file yet
// (the first visit of a deploy) fetches and stores it.
async function cacheFirst(request, cacheName) {
  // Precache and runtime entries live in different caches (the loader is part
  // of the shell), so look across both.
  const cached = await caches.match(request);
  if (cached) return cached;
  const cache = await caches.open(cacheName);
  const response = await fetch(request);
  if (response && response.ok) await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      // A GET navigation under the base path is always the app shell.
      const shell =
        (await caches.match(`${BASE}index.html`)) ||
        (await caches.match(BASE));
      if (shell) return shell;
    }
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);
  return cached || (await network) || Response.error();
}
