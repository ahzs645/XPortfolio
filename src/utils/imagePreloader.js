import { withBaseUrl } from './baseUrl';

const preloadedImages = new Set();
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

export function preloadImage(path) {
  if (!canPreloadImages() || !path || typeof window === 'undefined') return;

  const href = withBaseUrl(path);
  if (preloadedImages.has(href)) return;
  preloadedImages.add(href);

  const img = new Image();
  img.src = href;
}

export function preloadImages(paths) {
  if (!Array.isArray(paths)) return;
  paths.forEach(preloadImage);
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
