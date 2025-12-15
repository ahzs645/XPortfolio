/**
 * Build version utility for cache busting static assets.
 * The BUILD_VERSION is injected at build time by Vite's define plugin.
 * Falls back to timestamp for development mode.
 */

// This will be replaced at build time by Vite's define config
// In dev mode, it falls back to a timestamp
export const BUILD_VERSION = typeof __BUILD_VERSION__ !== 'undefined'
  ? __BUILD_VERSION__
  : Date.now().toString(36);

/**
 * Append cache-busting version query parameter to a URL
 * @param {string} url - The URL to append version to
 * @returns {string} URL with version query parameter
 */
export function withCacheBust(url) {
  if (!url) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${BUILD_VERSION}`;
}
