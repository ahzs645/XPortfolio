import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ShellSettingsContext = createContext(null);

const STORAGE_KEYS = {
  explorer: {
    noExplorerSidebar: 'folderopt_noExplorerSidebar',
    openFoldersInNewWindow: 'folderopt_openFoldersInNewWindow',
    fullPathInTitle: 'folderopt_fullPathInTitle',
    showHiddenContents: 'folderopt_showHiddenContents',
    showFileExtensions: 'folderopt_showFileExtensions',
  },
  taskbar: {
    lockTaskbar: 'xp-taskbar-lock',
    autoHide: 'xp-taskbar-auto-hide',
    keepOnTop: 'xp-taskbar-keep-on-top',
    groupButtons: 'xp-taskbar-group-buttons',
    showQuickLaunch: 'xp-quick-launch-enabled',
    showClock: 'xp-taskbar-show-clock',
    hideInactiveIcons: 'xp-taskbar-hide-inactive-icons',
    startMenuStyle: 'xp-start-menu-style',
  },
  audio: {
    volume: 'xp-volume',
    muted: 'xp-muted',
  },
};

export const DEFAULT_SHELL_SETTINGS = {
  explorer: {
    sidebarMode: 'show',
    openFoldersInNewWindow: false,
    fullPathInTitle: false,
    showHiddenContents: false,
    showFileExtensions: true,
  },
  taskbar: {
    lockTaskbar: true,
    autoHide: false,
    keepOnTop: true,
    groupButtons: false,
    showQuickLaunch: true,
    showClock: true,
    hideInactiveIcons: false,
    startMenuStyle: 'modern',
  },
  audio: {
    volume: 50,
    muted: false,
  },
};

function cloneDefaultSettings() {
  return JSON.parse(JSON.stringify(DEFAULT_SHELL_SETTINGS));
}

function readBoolean(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return defaultValue;
    return saved === 'true' || saved === '1' || saved === 'yes' || saved === 'on'
      ? true
      : saved === 'false' || saved === '0' || saved === 'no' || saved === 'off'
      ? false
      : JSON.parse(saved);
  } catch {
    return defaultValue;
  }
}

function readNumber(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);
    if (saved === null) return defaultValue;
    const parsed = Number.parseInt(saved, 10);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

function readString(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? defaultValue : saved;
  } catch {
    return defaultValue;
  }
}

function loadShellSettings() {
  const defaults = cloneDefaultSettings();

  return {
    explorer: {
      sidebarMode: readBoolean(
        STORAGE_KEYS.explorer.noExplorerSidebar,
        defaults.explorer.sidebarMode === 'classic'
      ) ? 'classic' : 'show',
      openFoldersInNewWindow: readBoolean(
        STORAGE_KEYS.explorer.openFoldersInNewWindow,
        defaults.explorer.openFoldersInNewWindow
      ),
      fullPathInTitle: readBoolean(
        STORAGE_KEYS.explorer.fullPathInTitle,
        defaults.explorer.fullPathInTitle
      ),
      showHiddenContents: readBoolean(
        STORAGE_KEYS.explorer.showHiddenContents,
        defaults.explorer.showHiddenContents
      ),
      showFileExtensions: readBoolean(
        STORAGE_KEYS.explorer.showFileExtensions,
        defaults.explorer.showFileExtensions
      ),
    },
    taskbar: {
      lockTaskbar: readBoolean(STORAGE_KEYS.taskbar.lockTaskbar, defaults.taskbar.lockTaskbar),
      autoHide: readBoolean(STORAGE_KEYS.taskbar.autoHide, defaults.taskbar.autoHide),
      keepOnTop: readBoolean(STORAGE_KEYS.taskbar.keepOnTop, defaults.taskbar.keepOnTop),
      groupButtons: readBoolean(STORAGE_KEYS.taskbar.groupButtons, defaults.taskbar.groupButtons),
      showQuickLaunch: readBoolean(STORAGE_KEYS.taskbar.showQuickLaunch, defaults.taskbar.showQuickLaunch),
      showClock: readBoolean(STORAGE_KEYS.taskbar.showClock, defaults.taskbar.showClock),
      hideInactiveIcons: readBoolean(STORAGE_KEYS.taskbar.hideInactiveIcons, defaults.taskbar.hideInactiveIcons),
      startMenuStyle: readString(STORAGE_KEYS.taskbar.startMenuStyle, defaults.taskbar.startMenuStyle) === 'classic'
        ? 'classic'
        : 'modern',
    },
    audio: {
      volume: Math.max(0, Math.min(100, readNumber(STORAGE_KEYS.audio.volume, defaults.audio.volume))),
      muted: readBoolean(STORAGE_KEYS.audio.muted, defaults.audio.muted),
    },
  };
}

function persistShellSettings(settings) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.explorer.noExplorerSidebar,
      String(settings.explorer.sidebarMode === 'classic')
    );
    localStorage.setItem(
      STORAGE_KEYS.explorer.openFoldersInNewWindow,
      String(settings.explorer.openFoldersInNewWindow)
    );
    localStorage.setItem(
      STORAGE_KEYS.explorer.fullPathInTitle,
      String(settings.explorer.fullPathInTitle)
    );
    localStorage.setItem(
      STORAGE_KEYS.explorer.showHiddenContents,
      String(settings.explorer.showHiddenContents)
    );
    localStorage.setItem(
      STORAGE_KEYS.explorer.showFileExtensions,
      String(settings.explorer.showFileExtensions)
    );

    localStorage.setItem(STORAGE_KEYS.taskbar.lockTaskbar, String(settings.taskbar.lockTaskbar));
    localStorage.setItem(STORAGE_KEYS.taskbar.autoHide, String(settings.taskbar.autoHide));
    localStorage.setItem(STORAGE_KEYS.taskbar.keepOnTop, String(settings.taskbar.keepOnTop));
    localStorage.setItem(STORAGE_KEYS.taskbar.groupButtons, String(settings.taskbar.groupButtons));
    localStorage.setItem(STORAGE_KEYS.taskbar.showQuickLaunch, JSON.stringify(settings.taskbar.showQuickLaunch));
    localStorage.setItem(STORAGE_KEYS.taskbar.showClock, String(settings.taskbar.showClock));
    localStorage.setItem(STORAGE_KEYS.taskbar.hideInactiveIcons, String(settings.taskbar.hideInactiveIcons));
    localStorage.setItem(STORAGE_KEYS.taskbar.startMenuStyle, settings.taskbar.startMenuStyle);

    localStorage.setItem(STORAGE_KEYS.audio.volume, String(settings.audio.volume));
    localStorage.setItem(STORAGE_KEYS.audio.muted, JSON.stringify(settings.audio.muted));
  } catch (error) {
    console.warn('Failed to persist shell settings:', error);
  }
}

function getSettingValue(settings, path) {
  return path.split('.').reduce((current, segment) => current?.[segment], settings);
}

function setSettingValue(settings, path, value) {
  const next = {
    ...settings,
    explorer: { ...settings.explorer },
    taskbar: { ...settings.taskbar },
    audio: { ...settings.audio },
  };

  const parts = path.split('.');
  let current = next;

  for (let index = 0; index < parts.length - 1; index += 1) {
    current = current[parts[index]];
  }

  current[parts[parts.length - 1]] = value;
  return next;
}

export function ShellSettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadShellSettings);

  useEffect(() => {
    persistShellSettings(settings);
  }, [settings]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('xp:volume-change', {
      detail: {
        volume: settings.audio.muted ? 0 : settings.audio.volume,
        muted: settings.audio.muted,
      },
    }));
  }, [settings.audio.muted, settings.audio.volume]);

  const setSetting = useCallback((path, value) => {
    setSettings((prev) => {
      if (getSettingValue(prev, path) === value) {
        return prev;
      }
      return setSettingValue(prev, path, value);
    });
  }, []);

  const resetSetting = useCallback((path) => {
    setSetting(path, getSettingValue(DEFAULT_SHELL_SETTINGS, path));
  }, [setSetting]);

  const setExplorerSettings = useCallback((updates) => {
    setSettings((prev) => ({
      ...prev,
      explorer: {
        ...prev.explorer,
        ...updates,
      },
    }));
  }, []);

  const setTaskbarSettings = useCallback((updates) => {
    setSettings((prev) => ({
      ...prev,
      taskbar: {
        ...prev.taskbar,
        ...updates,
      },
    }));
  }, []);

  const setAudioSettings = useCallback((updates) => {
    setSettings((prev) => {
      const nextVolume = updates.volume === undefined
        ? prev.audio.volume
        : Math.max(0, Math.min(100, Number.parseInt(String(updates.volume), 10) || 0));

      return {
        ...prev,
        audio: {
          ...prev.audio,
          ...updates,
          volume: nextVolume,
        },
      };
    });
  }, []);

  const resetShellSettings = useCallback(() => {
    setSettings(cloneDefaultSettings());
  }, []);

  const value = useMemo(() => ({
    settings,
    explorer: settings.explorer,
    taskbar: settings.taskbar,
    audio: settings.audio,
    getSetting: (path) => getSettingValue(settings, path),
    setSetting,
    resetSetting,
    setExplorerSettings,
    setTaskbarSettings,
    setAudioSettings,
    resetShellSettings,
  }), [
    settings,
    setSetting,
    resetSetting,
    setExplorerSettings,
    setTaskbarSettings,
    setAudioSettings,
    resetShellSettings,
  ]);

  return (
    <ShellSettingsContext.Provider value={value}>
      {children}
    </ShellSettingsContext.Provider>
  );
}

export function useShellSettings() {
  const context = useContext(ShellSettingsContext);
  if (!context) {
    throw new Error('useShellSettings must be used within a ShellSettingsProvider');
  }
  return context;
}

export default ShellSettingsContext;
