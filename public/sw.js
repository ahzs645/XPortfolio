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

const VERSION = 'v1';
const PRECACHE = `xportfolio-precache-${VERSION}`;
const RUNTIME = `xportfolio-runtime-${VERSION}`;
const RUNTIME_MAX_ENTRIES = 150;

// Resolve base-aware URLs (e.g. when deployed under /repo-name/).
const SCOPE_PATH = new URL(self.registration ? self.registration.scope : self.location.href).pathname;

function scoped(path) {
  const clean = path.replace(/^\/+/, '');
  return `${SCOPE_PATH}${clean}`;
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

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
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
      if (response && response.ok) {
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

  // Skip SW for requests that explicitly opt-out of caching.
  if (request.cache === 'no-store') return;

  // Navigation requests (full document loads) use network-first with an
  // offline fallback to the cached app shell.
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request));
    return;
  }

  // Keep update checks fresh.
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
