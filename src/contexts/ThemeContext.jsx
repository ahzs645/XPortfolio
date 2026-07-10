import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { appDataClient } from '../storage';
import { withBaseUrl } from '../utils/baseUrl';
import { useUserSettings } from './UserSettingsContext';
import { BUILTIN_THEMES, BUILTIN_THEME_MAP, BUNDLED_WBA_THEMES } from '../WinXP/styles/themes';
import { LUNA_THEME } from '../WinXP/styles/themes/luna';

const STORAGE_KEY_ACTIVE = 'xp-active-theme';
const STORAGE_KEY_INSTALLED = 'xp-installed-themes';
// Bump when wbaInstaller's output shape changes so cached bundled themes refresh.
const PARSER_VERSION = 'v1';

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

/**
 * Parse a bundled WindowBlinds skin into a theme object, using a cached result
 * when available (parsing decodes BMPs via canvas, so we avoid redoing it).
 */
async function loadBundledTheme(entry, parseWbaFile) {
  const cacheKey = `xp-bundled-theme:${PARSER_VERSION}:${entry.id}`;
  try {
    const cached = await appDataClient.localSettings.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // fall through to parse
  }

  const res = await fetch(withBaseUrl(entry.url));
  if (!res.ok) throw new Error(`fetch ${entry.url} -> ${res.status}`);
  const buf = await res.arrayBuffer();
  const theme = await parseWbaFile(buf, { archiveName: entry.url });

  // Stable identity + presentation from the manifest.
  theme.id = entry.id;
  theme.name = entry.name || theme.name;
  theme.source = 'builtin';
  if (entry.wallpaperOverride) theme.wallpaper = entry.wallpaperOverride;

  appDataClient.localSettings.set(cacheKey, JSON.stringify(theme)).catch(() => {});
  return theme;
}

export function ThemeProvider({ children }) {
  const [installedThemes, setInstalledThemes] = useState(loadInstalledThemes);
  const [bundledThemes, setBundledThemes] = useState([]);
  const [activeThemeId, setActiveThemeIdState] = useState(loadActiveThemeId);

  // ThemeProvider is mounted inside UserSettingsProvider, so this is safe.
  const { setWallpaperPath } = useUserSettings();

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      appDataClient.localSettings.get(STORAGE_KEY_INSTALLED),
      appDataClient.localSettings.get(STORAGE_KEY_ACTIVE),
    ]).then(([storedThemes, storedActiveTheme]) => {
      if (!isMounted) return;
      if (storedThemes) setInstalledThemes(JSON.parse(storedThemes));
      if (storedActiveTheme) setActiveThemeIdState(storedActiveTheme);
    }).catch((err) => {
      console.warn('Failed to load theme settings', err);
    });

    return () => { isMounted = false; };
  }, []);

  // Parse the bundled WindowBlinds skins (cached after first run).
  useEffect(() => {
    if (BUNDLED_WBA_THEMES.length === 0) return undefined;

    let isMounted = true;
    (async () => {
      const { parseWbaFile } = await import('../utils/wbaInstaller');
      const results = await Promise.all(
        BUNDLED_WBA_THEMES.map((entry) =>
          loadBundledTheme(entry, parseWbaFile).catch((err) => {
            console.warn('Failed to load bundled theme', entry.id, err);
            return null;
          }),
        ),
      );
      if (isMounted) setBundledThemes(results.filter(Boolean));
    })();
    return () => { isMounted = false; };
  }, []);

  // Built-ins available to pickers: Luna + parsed bundled skins.
  const builtinThemes = useMemo(
    () => [...BUILTIN_THEMES, ...bundledThemes],
    [bundledThemes],
  );

  // Combined map: builtins + bundled + installed (later wins on id collision).
  const allThemes = useMemo(() => {
    const map = { ...BUILTIN_THEME_MAP };
    for (const theme of bundledThemes) map[theme.id] = theme;
    for (const theme of installedThemes) map[theme.id] = theme;
    return map;
  }, [bundledThemes, installedThemes]);

  // Keep a ref so imperative callbacks read the latest themes without re-binding.
  const allThemesRef = useRef(allThemes);
  allThemesRef.current = allThemes;

  const activeTheme = useMemo(
    () => allThemes[activeThemeId] || LUNA_THEME,
    [allThemes, activeThemeId],
  );

  const setActiveTheme = useCallback((id) => {
    setActiveThemeIdState(id);
    saveActiveThemeId(id);
    // Applying a theme also switches the wallpaper, when the theme ships one.
    const theme = allThemesRef.current[id];
    if (theme?.wallpaper && setWallpaperPath) {
      setWallpaperPath(withBaseUrl(theme.wallpaper));
    }
  }, [setWallpaperPath]);

  const installTheme = useCallback((theme) => {
    setInstalledThemes(prev => {
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
    setActiveThemeIdState(prev => {
      if (prev === themeId) {
        saveActiveThemeId('luna');
        return 'luna';
      }
      return prev;
    });
  }, []);

  // Install events from the file opener (pre-parsed theme objects).
  useEffect(() => {
    const handleInstall = (e) => {
      const { theme } = e.detail || {};
      if (theme) {
        installTheme(theme);
        window.dispatchEvent(new CustomEvent('xp:theme-installed', { detail: { theme } }));
      }
    };
    window.addEventListener('xp:theme-install', handleInstall);
    return () => window.removeEventListener('xp:theme-install', handleInstall);
  }, [installTheme]);

  // Activate-by-id events (e.g. from shell file handlers).
  useEffect(() => {
    const handleActivate = (e) => {
      const { themeId } = e.detail || {};
      if (themeId && allThemesRef.current[themeId]) {
        setActiveTheme(themeId);
      }
    };
    window.addEventListener('xp:theme-activate', handleActivate);
    return () => window.removeEventListener('xp:theme-activate', handleActivate);
  }, [setActiveTheme]);

  // WBA file open requests (from fileOpener.js): parse then install.
  useEffect(() => {
    const handleWbaRequest = async (e) => {
      const { fileData, fileName } = e.detail || {};
      if (!fileData) return;
      try {
        const { parseWbaFile } = await import('../utils/wbaInstaller');
        const theme = await parseWbaFile(fileData, { archiveName: fileName });
        installTheme(theme);
        window.dispatchEvent(new CustomEvent('xp:theme-installed', { detail: { theme } }));
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
    builtinThemes,
    installedThemes,
    setActiveTheme,
    installTheme,
    uninstallTheme,
  }), [activeTheme, activeThemeId, allThemes, builtinThemes, installedThemes, setActiveTheme, installTheme, uninstallTheme]);

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
