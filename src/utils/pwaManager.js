import { withBaseUrl } from './baseUrl';

/**
 * PWA / offline mode manager.
 *
 * We ship a web app manifest and a service worker so that the browser
 * can offer its own native install affordance:
 *
 *   - Desktop Chrome/Edge: install icon in the address bar
 *   - Android Chrome: "Install app" in the overflow menu
 *   - iOS Safari: Share → "Add to Home Screen"
 *
 * Registering the service worker is what makes the site both
 * installable *and* functional offline, so we register it once on
 * load. There is no in-app toggle; installing the PWA is entirely
 * driven by the browser's built-in UI, which the user can ignore to
 * keep using XPortfolio as a regular web page.
 */

function isSupported() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

let initialized = false;

export function initPwaManager() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  if (!isSupported()) return;

  const register = () => {
    navigator.serviceWorker
      .register(withBaseUrl('/sw.js'), { scope: withBaseUrl('/') })
      .catch((err) => {
        console.warn('[PWA] Service worker registration failed', err);
      });
  };

  if (document.readyState === 'complete') {
    register();
  } else {
    window.addEventListener('load', register, { once: true });
  }
}
