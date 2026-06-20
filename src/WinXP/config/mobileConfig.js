/**
 * Mobile Configuration for Apps
 *
 * Mobile behavior now lives with each app: a manifest sets `mobileFullscreen:
 * false` (alongside `mobileAvailable`) when the app should open windowed rather
 * than maximized on mobile. This module just reads that flag from the assembled
 * registry, so there's no separate name-keyed override list to drift or mistype.
 */
import { appSettings } from '../apps';

// Default mobile behavior for all apps
export const MOBILE_DEFAULTS = {
  fullscreen: true,  // Apps open maximized by default on mobile
};

// Callers pass either an appSettings key or a window title — resolve both.
function resolveSetting(name) {
  if (!name) return null;
  if (appSettings[name]) return appSettings[name];
  return Object.values(appSettings).find((s) => s.header?.title === name) || null;
}

/**
 * Get the mobile configuration for a specific app.
 *
 * @param {string} appName - appSettings key (or window title) of the app
 * @returns {Object} Mobile configuration for the app
 */
export function getMobileConfig(appName) {
  const setting = resolveSetting(appName);
  return {
    fullscreen: setting?.mobileFullscreen ?? MOBILE_DEFAULTS.fullscreen,
  };
}

/**
 * Check if an app should open fullscreen on mobile.
 *
 * @param {string} appName - The name of the app
 * @returns {boolean} Whether the app should open fullscreen on mobile
 */
export function shouldOpenFullscreenOnMobile(appName) {
  return getMobileConfig(appName).fullscreen;
}
