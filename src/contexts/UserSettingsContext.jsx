import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useUserAccounts } from './UserAccountsContext';
import { useConfig } from './ConfigContext';
import { getDefaultDisplayZoom } from '../utils/displaySettings';

const UserSettingsContext = createContext(null);

function getStoredDisplayZoom() {
  try {
    const storedZoom = localStorage.getItem('userPreferredZoom');
    const parsedZoom = Number.parseInt(storedZoom || '', 10);

    if (Number.isFinite(parsedZoom) && parsedZoom > 0) {
      return parsedZoom;
    }
  } catch {
    // Ignore storage failures and use the runtime default.
  }

  return getDefaultDisplayZoom();
}

function applyDisplayZoomToDocument(zoom) {
  if (typeof document === 'undefined') {
    return;
  }

  const numericZoom = Number.parseInt(String(zoom), 10);
  const safeZoom = Number.isFinite(numericZoom) && numericZoom > 0
    ? numericZoom
    : getDefaultDisplayZoom();
  const inverseScale = `${100 / (safeZoom / 100)}%`;
  const html = document.documentElement;
  const body = document.body;
  const root = document.getElementById('root');

  if (!body || !root) {
    return;
  }

  if (html) {
    html.style.width = '';
    html.style.height = '';
    html.style.minHeight = '';
  }

  body.style.zoom = '';
  body.style.width = '';
  body.style.height = '';
  body.style.minWidth = '';
  body.style.minHeight = '';

  root.style.zoom = '';
  root.style.transformOrigin = 'top left';
  root.style.transform = `scale(${safeZoom / 100})`;
  root.style.width = inverseScale;
  root.style.height = inverseScale;
  root.style.minWidth = inverseScale;
  root.style.minHeight = inverseScale;
}

/**
 * UserSettingsProvider bridges UserAccountsContext and ConfigContext
 * to provide per-user settings for wallpaper, screensaver, and desktop icons.
 *
 * It sits after UserAccountsProvider in the component tree and provides
 * user-aware versions of settings getters/setters.
 */
export function UserSettingsProvider({ children }) {
  const {
    getCurrentUser,
    updateCurrentUserSettings,
    getCurrentUserSettings,
    isLoggedIn,
    activeUserId,
  } = useUserAccounts();

  const {
    getWallpaperPath: getGlobalWallpaperPath,
    getScreensaverSettings: getGlobalScreensaverSettings,
  } = useConfig();

  const currentUser = getCurrentUser();
  const userSettings = getCurrentUserSettings();

  // Get wallpaper path - user setting takes priority over global
  const getWallpaperPath = useCallback((isMobile = false) => {
    if (!isLoggedIn || !currentUser) {
      return getGlobalWallpaperPath(isMobile);
    }

    const userWallpaper = isMobile
      ? userSettings?.wallpaperMobile
      : userSettings?.wallpaper;

    if (userWallpaper) {
      return userWallpaper;
    }

    // Fall back to global config
    return getGlobalWallpaperPath(isMobile);
  }, [isLoggedIn, currentUser, userSettings, getGlobalWallpaperPath]);

  // Set wallpaper path - saves to user profile
  const setWallpaperPath = useCallback((path, options = {}) => {
    if (!isLoggedIn) return;

    const key = options.isMobile ? 'wallpaperMobile' : 'wallpaper';
    updateCurrentUserSettings({ [key]: path || null });
  }, [isLoggedIn, updateCurrentUserSettings]);

  // Get screensaver settings - user setting takes priority
  const getScreensaverSettings = useCallback(() => {
    if (!isLoggedIn || !currentUser) {
      return getGlobalScreensaverSettings();
    }

    const userScreensaver = userSettings?.screensaver;
    if (userScreensaver) {
      return {
        name: userScreensaver.name || 'windows',
        waitMinutes: userScreensaver.waitMinutes || 5,
        enabled: userScreensaver.enabled !== false,
      };
    }

    // Fall back to global settings
    return getGlobalScreensaverSettings();
  }, [isLoggedIn, currentUser, userSettings, getGlobalScreensaverSettings]);

  // Set screensaver settings - saves to user profile
  const setScreensaverSettings = useCallback((updates) => {
    if (!isLoggedIn) return;

    const current = userSettings?.screensaver || {
      name: 'windows',
      waitMinutes: 5,
      enabled: true,
    };

    updateCurrentUserSettings({
      screensaver: { ...current, ...updates },
    });
  }, [isLoggedIn, userSettings, updateCurrentUserSettings]);

  // Get desktop icon positions - user-specific
  const getDesktopIconPositions = useCallback(() => {
    if (!isLoggedIn || !currentUser) {
      // Fall back to global localStorage for non-logged-in state
      try {
        const saved = localStorage.getItem('desktopIconPositions');
        return saved ? JSON.parse(saved) : {};
      } catch {
        return {};
      }
    }

    return userSettings?.desktopIconPositions || {};
  }, [isLoggedIn, currentUser, userSettings]);

  // Set desktop icon positions - saves to user profile
  const setDesktopIconPositions = useCallback((positions) => {
    if (!isLoggedIn) {
      // Save to global localStorage for non-logged-in state
      try {
        localStorage.setItem('desktopIconPositions', JSON.stringify(positions));
      } catch (err) {
        console.warn('Failed to save desktop icon positions', err);
      }
      return;
    }

    updateCurrentUserSettings({ desktopIconPositions: positions });
  }, [isLoggedIn, updateCurrentUserSettings]);

  // Sync screensaver name for compatibility with ScreensaverContext
  const screensaverName = useMemo(() => {
    return getScreensaverSettings().name;
  }, [getScreensaverSettings]);

  const setScreensaverName = useCallback((name) => {
    setScreensaverSettings({ name });
  }, [setScreensaverSettings]);

  const waitMinutes = useMemo(() => {
    return getScreensaverSettings().waitMinutes;
  }, [getScreensaverSettings]);

  const setWaitMinutes = useCallback((minutes) => {
    setScreensaverSettings({ waitMinutes: minutes });
  }, [setScreensaverSettings]);

  // Get window sounds enabled setting - user-specific, defaults to false
  const getWindowSoundsEnabled = useCallback(() => {
    if (!isLoggedIn || !currentUser) {
      // Fall back to localStorage for non-logged-in state
      try {
        const saved = localStorage.getItem('windowSoundsEnabled');
        return saved === 'true';
      } catch {
        return false;
      }
    }
    return userSettings?.windowSoundsEnabled || false;
  }, [isLoggedIn, currentUser, userSettings]);

  // Set window sounds enabled - saves to user profile
  const setWindowSoundsEnabled = useCallback((enabled) => {
    if (!isLoggedIn) {
      // Save to localStorage for non-logged-in state
      try {
        localStorage.setItem('windowSoundsEnabled', String(enabled));
      } catch (err) {
        console.warn('Failed to save window sounds setting', err);
      }
      return;
    }
    updateCurrentUserSettings({ windowSoundsEnabled: enabled });
  }, [isLoggedIn, updateCurrentUserSettings]);

  // Local state for color depth (ensures reactivity for non-logged-in users)
  const [localColorDepth, setLocalColorDepth] = useState(() => {
    try {
      return localStorage.getItem('colorDepth') || '32';
    } catch {
      return '32';
    }
  });

  const [localDisplayZoom, setLocalDisplayZoom] = useState(getStoredDisplayZoom);

  // Set color depth - saves to user profile or localStorage
  const setColorDepth = useCallback((depth) => {
    if (!isLoggedIn) {
      try {
        localStorage.setItem('colorDepth', depth);
      } catch (err) {
        console.warn('Failed to save color depth setting', err);
      }
      setLocalColorDepth(depth);
      return;
    }
    updateCurrentUserSettings({ colorDepth: depth });
    setLocalColorDepth(depth);
  }, [isLoggedIn, updateCurrentUserSettings]);

  // Color depth: prefer user settings when logged in, fall back to local state
  const colorDepth = useMemo(() => {
    if (isLoggedIn && currentUser && userSettings?.colorDepth) {
      return userSettings.colorDepth;
    }
    return localColorDepth;
  }, [isLoggedIn, currentUser, userSettings, localColorDepth]);

  const setDisplayZoom = useCallback((zoom) => {
    const parsedZoom = Number.parseInt(String(zoom), 10);
    const nextZoom = Number.isFinite(parsedZoom) && parsedZoom > 0
      ? parsedZoom
      : getDefaultDisplayZoom();

    try {
      localStorage.setItem('userPreferredZoom', String(nextZoom));
    } catch (err) {
      console.warn('Failed to save display zoom setting', err);
    }

    if (isLoggedIn) {
      updateCurrentUserSettings({ displayZoom: nextZoom });
    }

    setLocalDisplayZoom(nextZoom);
  }, [isLoggedIn, updateCurrentUserSettings]);

  const displayZoom = useMemo(() => {
    if (isLoggedIn && currentUser) {
      const savedZoom = Number.parseInt(String(userSettings?.displayZoom ?? ''), 10);

      if (Number.isFinite(savedZoom) && savedZoom > 0) {
        return savedZoom;
      }
    }

    return localDisplayZoom;
  }, [isLoggedIn, currentUser, userSettings, localDisplayZoom]);

  useEffect(() => {
    applyDisplayZoomToDocument(displayZoom);
  }, [displayZoom]);

  // Memoized value for direct access
  const windowSoundsEnabled = useMemo(() => {
    return getWindowSoundsEnabled();
  }, [getWindowSoundsEnabled]);

  const value = {
    // Wallpaper
    getWallpaperPath,
    setWallpaperPath,

    // Screensaver
    getScreensaverSettings,
    setScreensaverSettings,
    screensaverName,
    setScreensaverName,
    waitMinutes,
    setWaitMinutes,

    // Desktop icons
    getDesktopIconPositions,
    setDesktopIconPositions,

    // Sound settings
    windowSoundsEnabled,
    getWindowSoundsEnabled,
    setWindowSoundsEnabled,

    // Display settings
    colorDepth,
    setColorDepth,
    displayZoom,
    setDisplayZoom,

    // User info
    isLoggedIn,
    currentUserId: activeUserId,
    currentUserName: currentUser?.name,
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
}

export default UserSettingsContext;
