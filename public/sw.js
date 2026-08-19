/* eslint-disable no-restricted-globals */
/**
 * XPortfolio service worker.
 *
 * This worker is only registered when the user explicitly opts into
 * offline mode (see src/utils/pwaManager.js). It uses a simple
 * strategy so that the portfolio remains usable without the network
 * after it has been visited at least once:
 *
 *   - Precache a small "app shell" (index.html + root icons) on install
 *   - Network-first for version.json so update checks still work
 *   - Stale-while-revalidate for other same-origin GET requests, keeping
 *     responses in a runtime cache bounded by entry count
 *   - Navigation requests fall back to the cached index.html when offline
 *
 * When the user disables offline mode the page sends a `SKIP_WAITING`
 * style `UNREGISTER` message; we clear our caches so nothing stale
 * is left behind before the registration itself is removed.
 */

const VERSION = 'v3';
const PRECACHE = `xportfolio-precache-${VERSION}`;
const RUNTIME = `xportfolio-runtime-${VERSION}`;
const RUNTIME_MAX_ENTRIES = 150;
const RUNTIME_MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const LARGE_ASSET_PATHS = [
  /\/(?:games|ruffle)\//i,
  /\/objects\/sha256\//i,
  /\/apps\/xp-tour\//i,
  /\/apps\/jspaint\/lib\/tracky-mouse\//i,
  /\/content\/sample-music\//i,
  /\/assets\/apps\/wow\//i,
];
const LARGE_MEDIA_EXTENSION = /\.(?:bin|data|mp3|mp4|ogg|pack|wasm|webm)(?:$|\?)/i;

// Resolve base-aware URLs (e.g. when deployed under /repo-name/).
const SCOPE_PATH = new URL(self.registration ? self.registration.scope : self.location.href).pathname;

function scoped(path) {
  const clean = path.replace(/^\/+/, '');
  return `${SCOPE_PATH}${clean}`;
}

function withIsolationHeaders(response) {
  if (!response || response.type === 'opaque' || response.type === 'error' || response.status === 0) {
    return response;
  }

  const headers = new Headers(response.headers);
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Embedder-Policy', 'credentialless');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const APP_SHELL = [
  scoped(''),
  scoped('index.html'),
  scoped('favicon.ico'),
  scoped('favicon.png'),
  scoped('favicon.webp'),
  scoped('manifest.webmanifest'),
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) =>
      Promise.all(
        APP_SHELL.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {
            // Missing optional assets shouldn't block install.
          })
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== PRECACHE && key !== RUNTIME && key.startsWith('xportfolio-'))
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'UNREGISTER') {
    event.waitUntil(
      (async () => {
        const keys = await caches.keys();
        await Promise.all(
          keys.filter((key) => key.startsWith('xportfolio-')).map((key) => caches.delete(key))
        );
      })()
    );
  }
});

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const removals = keys.slice(0, keys.length - maxEntries);
  await Promise.all(removals.map((request) => cache.delete(request)));
}

function shouldCacheResponse(request, response) {
  const url = new URL(request.url);
  const path = `${url.pathname}${url.search}`;
  const contentLength = Number(response?.headers?.get('content-length') || 0);
  const isShellSound = /\/sounds\/[^/]+\.wav(?:$|\?)/i.test(path);

  return Boolean(
    response &&
    response.ok &&
    response.status === 200 &&
    !request.headers.has('range') &&
    !LARGE_ASSET_PATHS.some((pattern) => pattern.test(path)) &&
    (!LARGE_MEDIA_EXTENSION.test(path) || isShellSound) &&
    (contentLength === 0 || contentLength <= RUNTIME_MAX_RESPONSE_BYTES)
  );
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (shouldCacheResponse(request, response)) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (shouldCacheResponse(request, response)) {
        cache.put(request, response.clone()).then(() => trimCache(RUNTIME, RUNTIME_MAX_ENTRIES));
      }
      return response;
    })
    .catch(() => null);

  return cached || (await networkPromise) || Response.error();
}

async function handleNavigate(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached =
      (await caches.match(request)) ||
      (await caches.match(scoped('index.html'))) ||
      (await caches.match(scoped('')));
    if (cached) return cached;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Only handle same-origin requests; let everything else hit the network.
  if (url.origin !== self.location.origin) return;

  // Requests that opt out of caching still receive the isolation headers
  // required by the embedded playsrc WebAssembly runtime.
  if (request.cache === 'no-store') {
    event.respondWith(fetch(request).then(withIsolationHeaders));
    return;
  }

  // Navigation requests (full document loads) use network-first with an
  // offline fallback to the cached app shell.
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request).then(withIsolationHeaders));
    return;
  }

  // Keep update checks fresh.
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(networkFirst(request).then(withIsolationHeaders));
    return;
  }

  event.respondWith(staleWhileRevalidate(request).then(withIsolationHeaders));
});
