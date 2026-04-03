import { useState, useCallback, useMemo } from 'react';
import { SYSTEM_IDS, XP_ICONS } from '../../../../contexts/FileSystemContext';

// Special virtual location ID for Control Panel
const CONTROL_PANEL_ID = SYSTEM_IDS.CONTROL_PANEL;

/**
 * Hook for managing navigation history in the file explorer
 * Handles back, forward, up, and folder navigation
 * Supports virtual locations like Control Panel
 */
export function useNavigation({ fileSystem, initialPath = null, resolveVfsPath = null }) {
  // null = My Computer root view, folder ID, or CONTROL_PANEL_ID
  const [currentFolder, setCurrentFolder] = useState(initialPath || null);
  const [history, setHistory] = useState([null]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const isMyComputerRoot = currentFolder === null;
  const isControlPanel = currentFolder === CONTROL_PANEL_ID;

  // For Control Panel, return a virtual folder data object
  const currentFolderData = useMemo(() => {
    if (isMyComputerRoot) return null;
    if (isControlPanel) {
      return { id: CONTROL_PANEL_ID, name: 'Control Panel', icon: XP_ICONS.controlPanel, parent: null };
    }
    return fileSystem?.[currentFolder];
  }, [isMyComputerRoot, isControlPanel, fileSystem, currentFolder]);

  const navigateTo = useCallback((folderId) => {
    // Allow navigation to Control Panel (virtual location)
    if (folderId === CONTROL_PANEL_ID) {
      setCurrentFolder(folderId);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(folderId);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      return;
    }

    if (!fileSystem?.[folderId]) return;

    setCurrentFolder(folderId);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(folderId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [fileSystem, history, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentFolder(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentFolder(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  const goToRoot = useCallback(() => {
    setCurrentFolder(null);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(null);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const goUp = useCallback(() => {
    if (isMyComputerRoot) return;

    // Control Panel goes up to My Computer root
    if (isControlPanel) {
      goToRoot();
      return;
    }

    // If at a top-level folder (like C: drive), go to My Computer root
    if (!currentFolderData?.parent || currentFolderData?.parent === null) {
      goToRoot();
    } else {
      navigateTo(currentFolderData.parent);
    }
  }, [currentFolderData, isMyComputerRoot, isControlPanel, navigateTo, goToRoot]);

  const handleTreeNavigate = useCallback((folderId) => {
    if (folderId === null) {
      goToRoot();
      return;
    }
    navigateTo(folderId);
  }, [goToRoot, navigateTo]);

  // Navigate to Control Panel
  const goToControlPanel = useCallback(() => {
    navigateTo(CONTROL_PANEL_ID);
  }, [navigateTo]);

  // Navigate to a path string (e.g., "C:\Documents and Settings\Ahmad\My Documents")
  const navigateToPath = useCallback((pathString) => {
    if (!pathString || !fileSystem) return false;

    const normalizedPath = pathString.trim();

    // Handle special locations
    if (normalizedPath.toLowerCase() === 'my computer') {
      goToRoot();
      return true;
    }

    if (normalizedPath.toLowerCase() === 'control panel') {
      goToControlPanel();
      return true;
    }

    if (resolveVfsPath) {
      const resolvedId = resolveVfsPath(normalizedPath);
      if (resolvedId && fileSystem[resolvedId]) {
        const resolvedItem = fileSystem[resolvedId];
        if (resolvedItem.type === 'folder' || resolvedItem.type === 'drive') {
          navigateTo(resolvedId);
          return true;
        }
      }
    }

    // Try to find the folder by matching the path
    // First, check for exact path matches in the file system
    for (const [id, item] of Object.entries(fileSystem)) {
      if (!item || !item.name) continue;

      // Check if this item's full path matches
      // Build the path for this item
      let itemPath = item.name;
      let current = item;
      while (current.parent && fileSystem[current.parent]) {
        current = fileSystem[current.parent];
        if (current.name) {
          itemPath = `${current.name}\\${itemPath}`;
        }
      }

      // Normalize paths for comparison
      const normalizedItemPath = itemPath.replace(/\//g, '\\').toLowerCase();
      const searchPath = normalizedPath.replace(/\//g, '\\').toLowerCase();

      if (normalizedItemPath === searchPath) {
        if (item.type === 'folder' || item.type === 'drive') {
          navigateTo(id);
          return true;
        }
      }
    }

    // Try matching by name alone for special folders
    const specialFolders = {
      'my documents': SYSTEM_IDS.MY_DOCUMENTS,
      'my pictures': SYSTEM_IDS.MY_PICTURES,
      'my music': SYSTEM_IDS.MY_MUSIC,
      'desktop': SYSTEM_IDS.DESKTOP,
      'c:': SYSTEM_IDS.C_DRIVE,
      'local disk (c:)': SYSTEM_IDS.C_DRIVE,
      'd:': SYSTEM_IDS.D_DRIVE,
      'local disk (d:)': SYSTEM_IDS.D_DRIVE,
      'e:': SYSTEM_IDS.E_DRIVE,
      'cd drive (e:)': SYSTEM_IDS.E_DRIVE,
    };

    const lowerPath = normalizedPath.toLowerCase();
    if (specialFolders[lowerPath]) {
      navigateTo(specialFolders[lowerPath]);
      return true;
    }

    // Map drive letters to system IDs
    const driveLetterMap = {
      'c': SYSTEM_IDS.C_DRIVE,
      'd': SYSTEM_IDS.D_DRIVE,
      'e': SYSTEM_IDS.E_DRIVE,
    };

    // If path starts with a drive letter, try to resolve it
    const driveMatch = lowerPath.match(/^([a-z]):/);
    const driveId = driveMatch ? driveLetterMap[driveMatch[1]] : null;
    if (driveId) {
      const pathParts = normalizedPath.replace(/^[A-Za-z]:[\\/]?/, '').split(/[\\/]/).filter(Boolean);

      if (pathParts.length === 0) {
        navigateTo(driveId);
        return true;
      }

      // Start from the drive and navigate through path parts
      let currentId = driveId;
      for (const part of pathParts) {
        const currentItem = fileSystem[currentId];
        if (!currentItem || !currentItem.children) {
          return false; // Path not found
        }

        // Find child with matching name
        const childId = currentItem.children.find(childId => {
          const child = fileSystem[childId];
          return child && child.name.toLowerCase() === part.toLowerCase();
        });

        if (!childId) {
          return false; // Path not found
        }

        currentId = childId;
      }

      const targetItem = fileSystem[currentId];
      if (targetItem && (targetItem.type === 'folder' || targetItem.type === 'drive')) {
        navigateTo(currentId);
        return true;
      }
    }

    return false; // Path not found
  }, [fileSystem, navigateTo, goToRoot, goToControlPanel, resolveVfsPath]);

  return {
    currentFolder,
    setCurrentFolder,
    isMyComputerRoot,
    isControlPanel,
    currentFolderData,
    history,
    historyIndex,
    navigateTo,
    navigateToPath,
    goBack,
    goForward,
    goUp,
    goToRoot,
    goToControlPanel,
    handleTreeNavigate,
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < history.length - 1,
  };
}
