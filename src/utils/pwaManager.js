import { withBaseUrl } from './baseUrl';

/**
 * PWA / offline mode manager.
 *
 * Offline mode is strictly opt-in. By default the site behaves exactly
 * as it did before any service worker existed: no SW is registered, no
 * runtime caching happens, and installability is left to the browser's
 * default heuristics.
 *
 * When the user enables offline mode (via the OfflineToast UI) we:
 *   1. Persist the preference in localStorage
 *   2. Register /sw.js
 *   3. Stash the `beforeinstallprompt` event so the UI can trigger
 *      the native install prompt on demand
 *
 * When the user disables offline mode we unregister the worker and
 * tell it to wipe its caches first, so the site reverts cleanly to
 * a plain web page on the next reload.
 */

const STORAGE_KEY = 'xportfolio-offline-mode';
const INSTALL_DISMISSED_KEY = 'xportfolio-offline-prompt-dismissed';

const listeners = new Set();
let deferredInstallPrompt = null;
let _currentRegistration = null;

function isSupported() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeStored(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures.
  }
}

function emit() {
  const snapshot = getState();
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (err) {
      console.warn('[PWA] listener failed', err);
    }
  });
}

export function getState() {
  return {
    supported: isSupported(),
    enabled: readStored(),
    canInstall: Boolean(deferredInstallPrompt),
    promptDismissed: readPromptDismissed(),
  };
}

export function subscribe(listener) {
  listeners.add(listener);
  listener(getState());
  return () => listeners.delete(listener);
}

function readPromptDismissed() {
  try {
    return localStorage.getItem(INSTALL_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function dismissInstallPrompt() {
  try {
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
  } catch {
    // Ignore storage failures.
  }
  emit();
}

export function resetInstallPromptDismissal() {
  try {
    localStorage.removeItem(INSTALL_DISMISSED_KEY);
  } catch {
    // Ignore storage failures.
  }
  emit();
}

export async function enableOfflineMode() {
  if (!isSupported()) {
    return { ok: false, reason: 'unsupported' };
  }

  writeStored(true);

  try {
    const registration = await navigator.serviceWorker.register(withBaseUrl('/sw.js'), {
      scope: withBaseUrl('/'),
    });
    _currentRegistration = registration;
    emit();
    return { ok: true, registration };
  } catch (err) {
    console.warn('[PWA] Service worker registration failed', err);
    writeStored(false);
    emit();
    return { ok: false, reason: 'register-failed', error: err };
  }
}

export async function disableOfflineMode() {
  writeStored(false);

  if (!isSupported()) {
    emit();
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map(async (registration) => {
        try {
          registration.active?.postMessage({ type: 'UNREGISTER' });
        } catch {
          // ignore
        }
        await registration.unregister();
      })
    );
  } catch (err) {
    console.warn('[PWA] Failed to unregister service worker', err);
  }

  _currentRegistration = null;
  emit();
}

export async function promptInstall() {
  if (!deferredInstallPrompt) {
    return { ok: false, reason: 'no-prompt' };
  }

  try {
    deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    emit();
    return { ok: true, outcome: choice?.outcome };
  } catch (err) {
    console.warn('[PWA] Install prompt failed', err);
    deferredInstallPrompt = null;
    emit();
    return { ok: false, reason: 'prompt-failed', error: err };
  }
}

let initialized = false;

export function initPwaManager() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    emit();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    emit();
  });

  // If the user previously enabled offline mode, re-register the worker
  // so caches stay warm across reloads.
  if (isSupported() && readStored()) {
    navigator.serviceWorker
      .register(withBaseUrl('/sw.js'), { scope: withBaseUrl('/') })
      .then((registration) => {
        _currentRegistration = registration;
        emit();
      })
      .catch((err) => {
        console.warn('[PWA] Re-registration failed', err);
      });
  } else if (isSupported()) {
    // If offline mode is disabled but a stale SW is still present
    // (e.g. from a previous session where the user toggled it off and
    // didn't reload), make sure nothing is left running.
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations
        .filter((registration) => {
          const scriptURL = registration.active?.scriptURL || '';
          return scriptURL.endsWith('/sw.js');
        })
        .forEach((registration) => {
          registration.unregister().catch(() => {});
        });
    });
  }
}
