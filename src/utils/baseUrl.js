export const BASE_URL = import.meta.env.BASE_URL || '/';

const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\\d+\\-.]*:/;

/**
 * Prefix a public (or app-relative) path with Vite's base URL.
 *
 * - Leaves absolute URLs (`https:`, `data:`, `blob:`, etc) unchanged
 * - Treats leading `/` as app-root relative (not domain-root)
 */
export function withBaseUrl(path) {
  if (!path) return path;
  if (ABSOLUTE_URL_REGEX.test(path) || path.startsWith('//')) return path;

  if (path.startsWith(BASE_URL)) return path;

  const trimmed = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}${trimmed}`;
}
