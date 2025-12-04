/**
 * Update checker utility for checking new versions
 *
 * Flow:
 * 1. On load, check /version.json against stored version in localStorage
 * 2. If buildNumber changed, show update notification
 * 3. Periodically check every 5 minutes for updates
 */

// Storage keys
const VERSION_KEY = 'xportfolio-version';
const BUILD_KEY = 'xportfolio-build-number';

// Check interval (5 minutes)
const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000;

// Callbacks for UI updates
let onUpdateAvailable = null;

/**
 * Get stored version info from localStorage
 */
function getStoredVersion() {
  try {
    return {
      version: localStorage.getItem(VERSION_KEY),
      buildNumber: localStorage.getItem(BUILD_KEY),
    };
  } catch {
    return { version: null, buildNumber: null };
  }
}

/**
 * Store version info in localStorage
 */
function storeVersion(version, buildNumber) {
  try {
    localStorage.setItem(VERSION_KEY, version);
    localStorage.setItem(BUILD_KEY, buildNumber);
    console.log(`[Update] Stored version: ${version} (${buildNumber})`);
  } catch {
    // localStorage might not be available
  }
}

/**
 * Fetch version info from server
 */
async function fetchServerVersion() {
  try {
    const response = await fetch('/version.json', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    });

    if (!response.ok) {
      console.warn('[Update] Could not fetch version.json');
      return null;
    }

    const data = await response.json();
    if (data.version && data.buildNumber) {
      return {
        version: data.version,
        buildNumber: data.buildNumber,
        buildTime: data.buildTime,
      };
    }

    console.warn('[Update] version.json missing required fields');
    return null;
  } catch (error) {
    console.warn('[Update] Failed to fetch server version:', error);
    return null;
  }
}

/**
 * Check for updates and trigger callback if available
 */
async function checkForUpdates() {
  const serverVersion = await fetchServerVersion();

  if (!serverVersion) {
    return { hasUpdate: false };
  }

  const stored = getStoredVersion();

  // First-time user - just store the version silently
  if (!stored.buildNumber) {
    console.log('[Update] First-time user, storing version');
    storeVersion(serverVersion.version, serverVersion.buildNumber);
    return { hasUpdate: false, firstTime: true };
  }

  // Check if versions differ
  if (serverVersion.buildNumber !== stored.buildNumber) {
    console.log(`[Update] Update available: ${stored.buildNumber} → ${serverVersion.buildNumber}`);
    return {
      hasUpdate: true,
      currentVersion: stored.version,
      currentBuild: stored.buildNumber,
      newVersion: serverVersion.version,
      newBuild: serverVersion.buildNumber,
      buildTime: serverVersion.buildTime,
    };
  }

  console.log('[Update] Already on latest version');
  return { hasUpdate: false };
}

/**
 * Apply the update (reload the page)
 */
function applyUpdate(version, buildNumber) {
  // Store the new version before reloading
  storeVersion(version, buildNumber);

  // Add cache-busting query param to force fresh fetch
  const url = new URL(window.location.href);
  url.searchParams.set('_cb', Date.now().toString());
  window.location.href = url.toString();
}

/**
 * Set the callback for when an update is available
 */
export function setUpdateCallback(callback) {
  onUpdateAvailable = callback;
}

/**
 * Initialize update checking
 * @param {Function} onUpdate - Callback when update is available
 */
export function initUpdateChecker(onUpdate) {
  onUpdateAvailable = onUpdate;

  // Clean up cache-busting param from URL after reload
  const url = new URL(window.location.href);
  if (url.searchParams.has('_cb')) {
    url.searchParams.delete('_cb');
    window.history.replaceState({}, '', url.toString());
  }

  const runCheck = async () => {
    const result = await checkForUpdates();

    if (result.hasUpdate && onUpdateAvailable) {
      onUpdateAvailable({
        version: result.newVersion,
        buildNumber: result.newBuild,
        buildTime: result.buildTime,
        onReload: () => applyUpdate(result.newVersion, result.newBuild),
      });
    }
  };

  // Run initial check after a delay (don't block initial render)
  if (document.readyState === 'complete') {
    setTimeout(runCheck, 2000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(runCheck, 2000);
    }, { once: true });
  }

  // Set up periodic checking
  setInterval(runCheck, UPDATE_CHECK_INTERVAL);
  console.log(`[Update] Started periodic checks every ${UPDATE_CHECK_INTERVAL / 1000}s`);
}

/**
 * Manually trigger an update check
 */
export async function manualUpdateCheck() {
  const result = await checkForUpdates();

  if (result.hasUpdate && onUpdateAvailable) {
    onUpdateAvailable({
      version: result.newVersion,
      buildNumber: result.newBuild,
      buildTime: result.buildTime,
      onReload: () => applyUpdate(result.newVersion, result.newBuild),
    });
    return true;
  }

  return false;
}

export { checkForUpdates, applyUpdate };
