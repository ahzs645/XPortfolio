import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { appDataClient } from '../storage';

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
  appDataClient.localSettings.setMany({
    [STORAGE_KEYS.explorer.noExplorerSidebar]: String(settings.explorer.sidebarMode === 'classic'),
    [STORAGE_KEYS.explorer.openFoldersInNewWindow]: String(settings.explorer.openFoldersInNewWindow),
    [STORAGE_KEYS.explorer.fullPathInTitle]: String(settings.explorer.fullPathInTitle),
    [STORAGE_KEYS.explorer.showHiddenContents]: String(settings.explorer.showHiddenContents),
    [STORAGE_KEYS.explorer.showFileExtensions]: String(settings.explorer.showFileExtensions),
    [STORAGE_KEYS.taskbar.lockTaskbar]: String(settings.taskbar.lockTaskbar),
    [STORAGE_KEYS.taskbar.autoHide]: String(settings.taskbar.autoHide),
    [STORAGE_KEYS.taskbar.keepOnTop]: String(settings.taskbar.keepOnTop),
    [STORAGE_KEYS.taskbar.groupButtons]: String(settings.taskbar.groupButtons),
    [STORAGE_KEYS.taskbar.showQuickLaunch]: JSON.stringify(settings.taskbar.showQuickLaunch),
    [STORAGE_KEYS.taskbar.showClock]: String(settings.taskbar.showClock),
    [STORAGE_KEYS.taskbar.hideInactiveIcons]: String(settings.taskbar.hideInactiveIcons),
    [STORAGE_KEYS.taskbar.startMenuStyle]: settings.taskbar.startMenuStyle,
    [STORAGE_KEYS.audio.volume]: String(settings.audio.volume),
    [STORAGE_KEYS.audio.muted]: JSON.stringify(settings.audio.muted),
  }).catch((error) => {
    console.warn('Failed to persist shell settings:', error);
  });
}

function readBooleanValue(saved, defaultValue) {
  if (saved === null) return defaultValue;
  return saved === 'true' || saved === '1' || saved === 'yes' || saved === 'on'
    ? true
    : saved === 'false' || saved === '0' || saved === 'no' || saved === 'off'
    ? false
    : JSON.parse(saved);
}

function buildShellSettingsFromStoredValues(values) {
  const defaults = cloneDefaultSettings();

  return {
    explorer: {
      sidebarMode: readBooleanValue(
        values[STORAGE_KEYS.explorer.noExplorerSidebar] ?? null,
        defaults.explorer.sidebarMode === 'classic'
      ) ? 'classic' : 'show',
      openFoldersInNewWindow: readBooleanValue(
        values[STORAGE_KEYS.explorer.openFoldersInNewWindow] ?? null,
        defaults.explorer.openFoldersInNewWindow
      ),
      fullPathInTitle: readBooleanValue(
        values[STORAGE_KEYS.explorer.fullPathInTitle] ?? null,
        defaults.explorer.fullPathInTitle
      ),
      showHiddenContents: readBooleanValue(
        values[STORAGE_KEYS.explorer.showHiddenContents] ?? null,
        defaults.explorer.showHiddenContents
      ),
      showFileExtensions: readBooleanValue(
        values[STORAGE_KEYS.explorer.showFileExtensions] ?? null,
        defaults.explorer.showFileExtensions
      ),
    },
    taskbar: {
      lockTaskbar: readBooleanValue(values[STORAGE_KEYS.taskbar.lockTaskbar] ?? null, defaults.taskbar.lockTaskbar),
      autoHide: readBooleanValue(values[STORAGE_KEYS.taskbar.autoHide] ?? null, defaults.taskbar.autoHide),
      keepOnTop: readBooleanValue(values[STORAGE_KEYS.taskbar.keepOnTop] ?? null, defaults.taskbar.keepOnTop),
      groupButtons: readBooleanValue(values[STORAGE_KEYS.taskbar.groupButtons] ?? null, defaults.taskbar.groupButtons),
      showQuickLaunch: readBooleanValue(values[STORAGE_KEYS.taskbar.showQuickLaunch] ?? null, defaults.taskbar.showQuickLaunch),
      showClock: readBooleanValue(values[STORAGE_KEYS.taskbar.showClock] ?? null, defaults.taskbar.showClock),
      hideInactiveIcons: readBooleanValue(values[STORAGE_KEYS.taskbar.hideInactiveIcons] ?? null, defaults.taskbar.hideInactiveIcons),
      startMenuStyle: values[STORAGE_KEYS.taskbar.startMenuStyle] === 'classic' ? 'classic' : 'modern',
    },
    audio: {
      volume: Math.max(0, Math.min(100, Number.parseInt(values[STORAGE_KEYS.audio.volume] ?? defaults.audio.volume, 10))),
      muted: readBooleanValue(values[STORAGE_KEYS.audio.muted] ?? null, defaults.audio.muted),
    },
  };
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
    let isMounted = true;
    const keys = [
      ...Object.values(STORAGE_KEYS.explorer),
      ...Object.values(STORAGE_KEYS.taskbar),
      ...Object.values(STORAGE_KEYS.audio),
    ];

    appDataClient.localSettings.getMany(keys)
      .then((values) => {
        if (isMounted && Object.keys(values).length > 0) {
          setSettings(buildShellSettingsFromStoredValues(values));
        }
      })
      .catch((error) => {
        console.warn('Failed to load shell settings:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
