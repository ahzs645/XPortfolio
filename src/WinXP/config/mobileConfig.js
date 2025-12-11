/**
 * Mobile Configuration for Apps
 *
 * This file contains mobile-specific settings that are applied when running on mobile devices.
 * App availability (mobileAvailable) is defined in appSettings (apps/index.js).
 * This file handles fullscreen behavior and other mobile-specific overrides.
 */

// Default mobile behavior for all apps
export const MOBILE_DEFAULTS = {
  fullscreen: true,  // Apps open maximized by default on mobile
};

/**
 * Apps that override the default mobile behavior.
 * Only list apps that should NOT open fullscreen on mobile.
 * Apps not listed here will use MOBILE_DEFAULTS.
 */
export const MOBILE_APP_OVERRIDES = {
  // Small utility apps that work fine in windowed mode
  'Calculator': { fullscreen: false },
  'Minesweeper': { fullscreen: false },
  'Solitaire': { fullscreen: false },

  // Apps with fixed/small sizes
  'Run': { fullscreen: false },
  'Winamp': { fullscreen: false },
  'Media Player Classic': { fullscreen: false },

  // Dialog-style apps
  'Error': { fullscreen: false },
  'Properties': { fullscreen: false },
};

/**
 * Get the mobile configuration for a specific app.
 * Merges defaults with any app-specific overrides.
 *
 * @param {string} appName - The name of the app (key from appSettings)
 * @returns {Object} Mobile configuration for the app
 */
export function getMobileConfig(appName) {
  return {
    ...MOBILE_DEFAULTS,
    ...(MOBILE_APP_OVERRIDES[appName] || {}),
  };
}

/**
 * Check if an app should open fullscreen on mobile.
 *
 * @param {string} appName - The name of the app
 * @returns {boolean} Whether the app should open fullscreen on mobile
 */
export function shouldOpenFullscreenOnMobile(appName) {
  const config = getMobileConfig(appName);
  return config.fullscreen;
}
