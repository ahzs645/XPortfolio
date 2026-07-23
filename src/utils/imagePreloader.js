import { withBaseUrl } from './baseUrl';

const preloadedImages = new Set();
const retainedImages = new Map();
let imagePreloadMode = 'balanced';

export function setImagePreloadMode(mode) {
  imagePreloadMode = ['off', 'balanced', 'eager'].includes(mode) ? mode : 'balanced';
}

export function getImagePreloadMode() {
  return imagePreloadMode;
}

export function canPreloadImages(level = 'balanced') {
  if (imagePreloadMode === 'off') return false;
  if (level === 'eager') return imagePreloadMode === 'eager';
  return true;
}

export function preloadImage(path, { retain = false } = {}) {
  if (!canPreloadImages() || !path || typeof window === 'undefined') return;

  const href = withBaseUrl(path);
  if (preloadedImages.has(href) && (!retain || retainedImages.has(href))) return;
  preloadedImages.add(href);

  const img = new Image();
  img.decoding = 'async';
  if (retain) retainedImages.set(href, img);
  img.addEventListener('error', () => {
    preloadedImages.delete(href);
    retainedImages.delete(href);
  }, { once: true });
  img.src = href;
  img.decode?.().catch(() => {
    // A failed speculative decode should not affect the eventual visible image.
  });
}

export function preloadImages(paths, options) {
  if (!Array.isArray(paths)) return;
  paths.forEach((path) => preloadImage(path, options));
}

export function preloadImagesOnIdle(paths, options = {}) {
  if (!Array.isArray(paths) || typeof window === 'undefined') return () => {};

  const run = () => preloadImages(paths, options);
  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(run, { timeout: options.timeout || 1500 });
    return () => window.cancelIdleCallback?.(idleId);
  }

  const timeoutId = window.setTimeout(run, 0);
  return () => window.clearTimeout(timeoutId);
}

export function addImagePreloadLinks(paths) {
  if (!canPreloadImages() || typeof document === 'undefined' || !Array.isArray(paths)) return () => {};

  const links = paths
    .filter(Boolean)
    .map(withBaseUrl)
    .filter((href, index, list) => list.indexOf(href) === index)
    .map((href) => {
      preloadImage(href);

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = href;
      document.head.appendChild(link);
      return link;
    });

  return () => {
    links.forEach((link) => link.remove());
  };
}
