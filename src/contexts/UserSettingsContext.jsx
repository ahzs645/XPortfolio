import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useUserAccounts } from './UserAccountsContext';
import { useConfig } from './ConfigContext';

const UserSettingsContext = createContext(null);

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
