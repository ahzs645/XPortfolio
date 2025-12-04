/**
 * Device detection utilities for mobile/desktop differentiation
 * Ported from original XPortfolio project
 */

let isMobileCache = null;
let isFirefoxCache = null;
let isInitialized = false;

/**
 * Detect if the browser is Firefox
 */
export function isFirefox() {
  if (isFirefoxCache === null) {
    const userAgent = navigator.userAgent || '';
    isFirefoxCache = /Firefox/i.test(userAgent);
  }
  return isFirefoxCache;
}

/**
 * Comprehensive mobile device detection
 * Checks user agent, touch capability, and screen dimensions
 */
export function isMobileDevice() {
  if (isMobileCache === null) {
    const userAgent = navigator.userAgent || '';

    // Check for mobile keywords in user agent
    const hasMobileKeywords = /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent);

    // Check for iPad masquerading as Mac (iPadOS 13+)
    const isTouchMac = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;

    if (hasMobileKeywords || isTouchMac) {
      isMobileCache = true;
      return true;
    }

    try {
      const hasTouch = navigator.maxTouchPoints > 0;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const minDimension = Math.min(width, height);
      const smallScreen = width <= 1200 && height <= 1200;

      // Consider it mobile if has touch capability and small screen
      isMobileCache = hasTouch && minDimension < 780 && smallScreen;
    } catch (err) {
      isMobileCache = false;
    }
  }
  return isMobileCache;
}

/**
 * Initialize device detection and add CSS classes to document
 */
export function initializeDeviceDetection() {
  if (isInitialized) return;

  const mobile = isMobileDevice();
  const firefox = isFirefox();

  if (mobile) {
    document.documentElement.classList.add('mobile-device');
    document.body.classList.add('mobile-device');
  }

  if (firefox) {
    document.documentElement.classList.add('firefox-browser');
  }

  isInitialized = true;
}

/**
 * Reset the cache (useful for testing or orientation changes)
 */
export function resetDeviceCache() {
  isMobileCache = null;
  isInitialized = false;
}

/**
 * Apps that are restricted on mobile devices
 * Keys match the app names used in appSettings
 */
export const MOBILE_RESTRICTED_APPS = {
  'Media Player': {
    title: 'Windows Media Player',
    icon: '/icons/xp/WindowsMediaPlayer9.png',
  },
  'Windows Media Player': {
    title: 'Windows Media Player',
    icon: '/icons/xp/WindowsMediaPlayer9.png',
  },
  'Paint': {
    title: 'Paint',
    icon: '/icons/xp/Paint.png',
  },
  'Pinball': {
    title: '3D Pinball',
    icon: '/icons/pinball-icon.png',
  },
};

/**
 * Check if an app is restricted on mobile
 */
export function isAppMobileRestricted(appName) {
  return Object.keys(MOBILE_RESTRICTED_APPS).includes(appName);
}

/**
 * Get the mobile restriction info for an app
 */
export function getMobileRestrictionInfo(appName) {
  return MOBILE_RESTRICTED_APPS[appName] || null;
}
