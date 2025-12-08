import { useState, useCallback } from 'react';
import { SYSTEM_IDS, XP_ICONS } from '../../../../contexts/FileSystemContext';

// Special virtual location ID for Control Panel
const CONTROL_PANEL_ID = SYSTEM_IDS.CONTROL_PANEL;

/**
 * Hook for managing navigation history in the file explorer
 * Handles back, forward, up, and folder navigation
 * Supports virtual locations like Control Panel
 */
export function useNavigation({ fileSystem, initialPath = null }) {
  // null = My Computer root view, folder ID, or CONTROL_PANEL_ID
  const [currentFolder, setCurrentFolder] = useState(initialPath || null);
  const [history, setHistory] = useState([null]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const isMyComputerRoot = currentFolder === null;
  const isControlPanel = currentFolder === CONTROL_PANEL_ID;

  // For Control Panel, return a virtual folder data object
  const currentFolderData = isMyComputerRoot
    ? null
    : isControlPanel
      ? { id: CONTROL_PANEL_ID, name: 'Control Panel', icon: XP_ICONS.controlPanel, parent: null }
      : fileSystem?.[currentFolder];

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

  return {
    currentFolder,
    setCurrentFolder,
    isMyComputerRoot,
    isControlPanel,
    currentFolderData,
    history,
    historyIndex,
    navigateTo,
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
