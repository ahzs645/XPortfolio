import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useFileSystem, SYSTEM_IDS, XP_ICONS } from './FileSystemContext';
import { useInstalledApps } from './InstalledAppsContext';
import {
  START_MENU_CATALOG,
  PINNED_LEFT,
  PINNED_RIGHT,
  START_MENU_FOLDERS,
  ALL_PROGRAMS_ORDER,
  getMenuItem,
} from '../WinXP/config/startMenuConfig';

// Re-export relevant SYSTEM_IDS for Start Menu
export const START_MENU_IDS = {
  PROGRAMS: SYSTEM_IDS.START_MENU_PROGRAMS,
  STARTUP: SYSTEM_IDS.START_MENU_STARTUP,
  ACCESSORIES: SYSTEM_IDS.START_MENU_ACCESSORIES,
  GAMES: SYSTEM_IDS.START_MENU_GAMES,
  ENTERTAINMENT: SYSTEM_IDS.START_MENU_ENTERTAINMENT,
};

const StartMenuContext = createContext(null);

export function StartMenuProvider({ children }) {
  const { fileSystem, createItem, deleteItem, getFolderContents } = useFileSystem();
  useInstalledApps(); // Hook needed for context connection
  const [startupAppsRun, setStartupAppsRun] = useState(false);
  const [startMenuVersion, setStartMenuVersion] = useState(0);

  // Force refresh the Start menu
  const refreshStartMenu = useCallback(() => {
    setStartMenuVersion(v => v + 1);
  }, []);

  // Get the Programs folder contents from filesystem
  const getProgramsFolderContents = useCallback(() => {
    if (!fileSystem || !fileSystem[START_MENU_IDS.PROGRAMS]) {
      return [];
    }
    return getFolderContents(START_MENU_IDS.PROGRAMS);
  }, [fileSystem, getFolderContents]);

  // Get items from a specific Start Menu subfolder
  const getStartMenuFolderContents = useCallback((folderId) => {
    if (!fileSystem || !fileSystem[folderId]) {
      return [];
    }
    return getFolderContents(folderId);
  }, [fileSystem, getFolderContents]);

  // Check if an app is pinned to Start Menu
  const isAppPinnedToStartMenu = useCallback((appKey) => {
    if (!fileSystem || !fileSystem[START_MENU_IDS.PROGRAMS]) {
      return false;
    }
    const programsContents = getFolderContents(START_MENU_IDS.PROGRAMS);
    return programsContents.some(item => item.target === appKey);
  }, [fileSystem, getFolderContents]);

  // Pin an app to Start Menu Programs folder
  const pinToStartMenu = useCallback(async (appKey, options = {}) => {
    if (!fileSystem || !fileSystem[START_MENU_IDS.PROGRAMS]) {
      console.error('Start Menu Programs folder not found');
      return null;
    }

    // Check if already pinned
    if (isAppPinnedToStartMenu(appKey)) {
      console.log('App already pinned to Start Menu:', appKey);
      return null;
    }

    // Get app info from catalog or options
    const catalogItem = START_MENU_CATALOG[appKey] || {};
    const name = options.name || catalogItem.title || appKey;
    const icon = options.icon || catalogItem.icon || XP_ICONS.programs;

    const shortcutId = await createItem(
      START_MENU_IDS.PROGRAMS,
      `${name}.lnk`,
      'shortcut',
      { icon, target: appKey }
    );

    if (shortcutId) {
      refreshStartMenu();
    }

    return shortcutId;
  }, [fileSystem, createItem, isAppPinnedToStartMenu, refreshStartMenu]);

  // Unpin an app from Start Menu
  const unpinFromStartMenu = useCallback(async (appKey) => {
    if (!fileSystem || !fileSystem[START_MENU_IDS.PROGRAMS]) {
      return false;
    }

    const programsContents = getFolderContents(START_MENU_IDS.PROGRAMS);
    const shortcut = programsContents.find(item => item.target === appKey);

    if (shortcut) {
      const result = await deleteItem(shortcut.id);
      if (result) {
        refreshStartMenu();
      }
      return result;
    }

    return false;
  }, [fileSystem, getFolderContents, deleteItem, refreshStartMenu]);

  // Add an app to the Startup folder
  const addToStartup = useCallback(async (appKey, options = {}) => {
    if (!fileSystem || !fileSystem[START_MENU_IDS.STARTUP]) {
      console.error('Startup folder not found');
      return null;
    }

    // Check if already in startup
    const startupContents = getFolderContents(START_MENU_IDS.STARTUP);
    if (startupContents.some(item => item.target === appKey)) {
      console.log('App already in Startup:', appKey);
      return null;
    }

    const catalogItem = START_MENU_CATALOG[appKey] || {};
    const name = options.name || catalogItem.title || appKey;
    const icon = options.icon || catalogItem.icon || XP_ICONS.programs;

    const shortcutId = await createItem(
      START_MENU_IDS.STARTUP,
      `${name}.lnk`,
      'shortcut',
      { icon, target: appKey }
    );

    return shortcutId;
  }, [fileSystem, createItem, getFolderContents]);

  // Remove an app from Startup folder
  const removeFromStartup = useCallback(async (appKey) => {
    if (!fileSystem || !fileSystem[START_MENU_IDS.STARTUP]) {
      return false;
    }

    const startupContents = getFolderContents(START_MENU_IDS.STARTUP);
    const shortcut = startupContents.find(item => item.target === appKey);

    if (shortcut) {
      return await deleteItem(shortcut.id);
    }

    return false;
  }, [fileSystem, getFolderContents, deleteItem]);

  // Check if app is in Startup folder
  const isInStartup = useCallback((appKey) => {
    if (!fileSystem || !fileSystem[START_MENU_IDS.STARTUP]) {
      return false;
    }
    const startupContents = getFolderContents(START_MENU_IDS.STARTUP);
    return startupContents.some(item => item.target === appKey);
  }, [fileSystem, getFolderContents]);

  // Get Startup folder contents
  const getStartupItems = useCallback(() => {
    if (!fileSystem || !fileSystem[START_MENU_IDS.STARTUP]) {
      return [];
    }
    return getFolderContents(START_MENU_IDS.STARTUP);
  }, [fileSystem, getFolderContents]);

  // Build menu items from filesystem - merges static catalog with dynamic filesystem items
  const buildDynamicMenuItems = useCallback(() => {
    // Start with the static catalog items
    const staticLeftItems = PINNED_LEFT.map((key) => ({
      key,
      ...getMenuItem(key),
    })).filter((item) => item.type);

    const staticRightItems = PINNED_RIGHT.map((key) => ({
      key,
      ...getMenuItem(key),
    })).filter((item) => item.type);

    // Build All Programs from filesystem + static fallback
    const allProgramsItems = [];

    // Get filesystem-based items
    if (fileSystem && fileSystem[START_MENU_IDS.PROGRAMS]) {
      const fsItems = getFolderContents(START_MENU_IDS.PROGRAMS);

      // Add filesystem shortcuts that aren't folders
      fsItems.forEach(item => {
        if (item.type === 'shortcut' && item.target) {
          allProgramsItems.push({
            key: `fs-${item.id}`,
            type: 'program',
            appKey: item.target,
            icon: item.icon,
            title: item.name.replace(/\.lnk$/i, ''),
            description: null,
            fsId: item.id,
          });
        }
      });
    }

    // Add static catalog items that aren't already in filesystem
    ALL_PROGRAMS_ORDER.forEach(key => {
      const item = getMenuItem(key);
      if (!item) return;

      // Check if this item is already in filesystem items
      if (item.type === 'program' && item.appKey) {
        const existsInFs = allProgramsItems.some(
          fsItem => fsItem.appKey === item.appKey
        );
        if (!existsInFs) {
          allProgramsItems.push({ key, ...item });
        }
      } else {
        // Add folders and separators from static config
        allProgramsItems.push({ key, ...item });
      }
    });

    return {
      leftItems: staticLeftItems,
      rightItems: staticRightItems,
      allProgramsItems,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileSystem, getFolderContents]);

  // Memoized menu items - rebuilds when filesystem changes or when startMenuVersion is incremented
  const menuItems = useMemo(() => {
    return buildDynamicMenuItems();
  }, [buildDynamicMenuItems, startMenuVersion]);

  // Get recently used programs (from filesystem or static list)
  const getRecentPrograms = useCallback(() => {
    // For now, return static recent items
    // Could be enhanced to track actual usage
    return [];
  }, []);

  const value = {
    // Menu data
    menuItems,
    startMenuVersion,

    // Folder operations
    getProgramsFolderContents,
    getStartMenuFolderContents,

    // Pin operations
    pinToStartMenu,
    unpinFromStartMenu,
    isAppPinnedToStartMenu,

    // Startup operations
    addToStartup,
    removeFromStartup,
    isInStartup,
    getStartupItems,
    startupAppsRun,
    setStartupAppsRun,

    // Utilities
    refreshStartMenu,
    getRecentPrograms,

    // Constants
    START_MENU_IDS,
  };

  return (
    <StartMenuContext.Provider value={value}>
      {children}
    </StartMenuContext.Provider>
  );
}

export function useStartMenu() {
  const context = useContext(StartMenuContext);
  if (!context) {
    throw new Error('useStartMenu must be used within a StartMenuProvider');
  }
  return context;
}

export default StartMenuContext;
