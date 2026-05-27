import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { appDataClient } from '../storage';
import { BUILTIN_THEMES, BUILTIN_THEME_MAP } from '../WinXP/styles/themes';
import { LUNA_THEME } from '../WinXP/styles/themes/luna';

const STORAGE_KEY_ACTIVE = 'xp-active-theme';
const STORAGE_KEY_INSTALLED = 'xp-installed-themes';

const ThemeContext = createContext(null);

function loadInstalledThemes() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_INSTALLED);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn('Failed to read installed themes', err);
    return [];
  }
}

function saveInstalledThemes(themes) {
  appDataClient.localSettings.set(STORAGE_KEY_INSTALLED, JSON.stringify(themes)).catch((err) => {
    console.warn('Failed to persist installed themes', err);
  });
}

function loadActiveThemeId() {
  try {
    return localStorage.getItem(STORAGE_KEY_ACTIVE) || 'luna';
  } catch (err) {
    console.warn('Failed to read active theme', err);
    return 'luna';
  }
}

function saveActiveThemeId(id) {
  appDataClient.localSettings.set(STORAGE_KEY_ACTIVE, id).catch((err) => {
    console.warn('Failed to persist active theme', err);
  });
}

export function ThemeProvider({ children }) {
  const [installedThemes, setInstalledThemes] = useState(loadInstalledThemes);
  const [activeThemeId, setActiveThemeIdState] = useState(loadActiveThemeId);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      appDataClient.localSettings.get(STORAGE_KEY_INSTALLED),
      appDataClient.localSettings.get(STORAGE_KEY_ACTIVE),
    ]).then(([storedThemes, storedActiveTheme]) => {
      if (!isMounted) {
        return;
      }

      if (storedThemes) {
        setInstalledThemes(JSON.parse(storedThemes));
      }
      if (storedActiveTheme) {
        setActiveThemeIdState(storedActiveTheme);
      }
    }).catch((err) => {
      console.warn('Failed to load theme settings', err);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Build combined theme map: builtins + installed
  const allThemes = useMemo(() => {
    const map = { ...BUILTIN_THEME_MAP };
    for (const theme of installedThemes) {
      map[theme.id] = theme;
    }
    return map;
  }, [installedThemes]);

  // Resolve active theme (fall back to Luna if not found)
  const activeTheme = useMemo(() => {
    return allThemes[activeThemeId] || LUNA_THEME;
  }, [allThemes, activeThemeId]);

  const setActiveTheme = useCallback((id) => {
    setActiveThemeIdState(id);
    saveActiveThemeId(id);
  }, []);

  const installTheme = useCallback((theme) => {
    setInstalledThemes(prev => {
      // Replace if same id exists, otherwise append
      const filtered = prev.filter(t => t.id !== theme.id);
      const next = [...filtered, theme];
      saveInstalledThemes(next);
      return next;
    });
  }, []);

  const uninstallTheme = useCallback((themeId) => {
    setInstalledThemes(prev => {
      const next = prev.filter(t => t.id !== themeId);
      saveInstalledThemes(next);
      return next;
    });
    // If uninstalling the active theme, revert to Luna
    setActiveThemeIdState(prev => {
      if (prev === themeId) {
        saveActiveThemeId('luna');
        return 'luna';
      }
      return prev;
    });
  }, []);

  // Listen for theme install events from the file opener
  useEffect(() => {
    const handleInstall = (e) => {
      const { theme } = e.detail || {};
      if (theme) {
        installTheme(theme);
        // Dispatch installed event for balloon notification
        window.dispatchEvent(new CustomEvent('xp:theme-installed', {
          detail: { theme },
        }));
      }
    };

    window.addEventListener('xp:theme-install', handleInstall);
    return () => window.removeEventListener('xp:theme-install', handleInstall);
  }, [installTheme]);

  // Listen for built-in theme activation events from shell file handlers.
  useEffect(() => {
    const handleActivate = (e) => {
      const { themeId } = e.detail || {};
      if (themeId && BUILTIN_THEME_MAP[themeId]) {
        setActiveTheme(themeId);
      }
    };

    window.addEventListener('xp:theme-activate', handleActivate);
    return () => window.removeEventListener('xp:theme-activate', handleActivate);
  }, [setActiveTheme]);

  // Listen for WBA file open requests (from fileOpener.js)
  useEffect(() => {
    const handleWbaRequest = async (e) => {
      const { fileData } = e.detail || {};
      if (!fileData) return;

      try {
        const { parseWbaFile } = await import('../utils/wbaInstaller');
        const theme = await parseWbaFile(fileData);
        installTheme(theme);
        window.dispatchEvent(new CustomEvent('xp:theme-installed', {
          detail: { theme },
        }));
      } catch (err) {
        console.error('Failed to install WBA theme:', err);
      }
    };

    window.addEventListener('xp:theme-install-request', handleWbaRequest);
    return () => window.removeEventListener('xp:theme-install-request', handleWbaRequest);
  }, [installTheme]);

  const value = useMemo(() => ({
    activeTheme,
    activeThemeId,
    allThemes,
    builtinThemes: BUILTIN_THEMES,
    installedThemes,
    setActiveTheme,
    installTheme,
    uninstallTheme,
  }), [activeTheme, activeThemeId, allThemes, installedThemes, setActiveTheme, installTheme, uninstallTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}

export default ThemeContext;
