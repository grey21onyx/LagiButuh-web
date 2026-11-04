// LagiButuh offline service worker.
//
// Bump VERSION whenever the caching strategy changes: activate() drops every
// lagibutuh-* cache that is not part of the new pair. The worker lives at
// <base>/sw.js, so its scope — and BASE below — follows the deployed sub-path
// (e.g. /LagiButuh-web/ on GitHub Pages) without hard-coding it.
'use strict';

const VERSION = 'v1';
const SHELL_CACHE = `lagibutuh-shell-${VERSION}`;
const RUNTIME_CACHE = `lagibutuh-runtime-${VERSION}`;
const CACHE_PREFIX = 'lagibutuh-';
const BASE = new URL(self.registration.scope).pathname;

// Small shell only. The multi-megabyte engine and main.dart.js are filled in by
// the runtime caches while the first visit loads them, which avoids
// double-downloading the app on install.
const SHELL_URLS = [
  BASE,
  `${BASE}index.html`,
  `${BASE}manifest.json`,
  `${BASE}favicon.png`,
  `${BASE}icons/Icon-192.png`,
  `${BASE}icons/Icon-512.png`,
];

// Images and fonts never change bytes under the same URL in a build, so they
// can be served from cache and refreshed in the background. Code and JSON go
// through the network first so a new deploy is picked up on the next launch.
const IMMUTABLE_ASSET = /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|otf)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS)),
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

  event.respondWith(
    IMMUTABLE_ASSET.test(url.pathname)
      ? staleWhileRevalidate(request, RUNTIME_CACHE)
      : networkFirst(request, RUNTIME_CACHE),
  );
});

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
