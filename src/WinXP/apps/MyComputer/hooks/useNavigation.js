import { useState, useCallback } from 'react';

/**
 * Hook for managing navigation history in the file explorer
 * Handles back, forward, up, and folder navigation
 */
export function useNavigation({ fileSystem, initialPath = null }) {
  // null = My Computer root view, otherwise folder ID
  const [currentFolder, setCurrentFolder] = useState(initialPath || null);
  const [history, setHistory] = useState([null]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const isMyComputerRoot = currentFolder === null;
  const currentFolderData = isMyComputerRoot ? null : fileSystem?.[currentFolder];

  const navigateTo = useCallback((folderId) => {
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

    // If at a top-level folder (like C: drive), go to My Computer root
    if (!currentFolderData?.parent || currentFolderData?.parent === null) {
      goToRoot();
    } else {
      navigateTo(currentFolderData.parent);
    }
  }, [currentFolderData, isMyComputerRoot, navigateTo, goToRoot]);

  const handleTreeNavigate = useCallback((folderId) => {
    if (folderId === null) {
      goToRoot();
      return;
    }
    navigateTo(folderId);
  }, [goToRoot, navigateTo]);

  return {
    currentFolder,
    setCurrentFolder,
    isMyComputerRoot,
    currentFolderData,
    history,
    historyIndex,
    navigateTo,
    goBack,
    goForward,
    goUp,
    goToRoot,
    handleTreeNavigate,
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < history.length - 1,
  };
}
