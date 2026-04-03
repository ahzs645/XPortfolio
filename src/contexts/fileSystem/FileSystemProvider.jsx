import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as idb from 'idb-keyval';
import { useConfig } from '../ConfigContext';
import { useUserAccounts } from '../UserAccountsContext';
import { SYSTEM_IDS } from './constants';
import { buildDesktopShortcuts, DEFAULT_DESKTOP_PROGRAMS } from './desktopShortcuts';
import { convertCvProjectToFolderProject } from './projectHelpers';
import { createInitialFileSystem } from './initialFileSystem';
import {
  migrateToNewStructure,
  ensureDesktopShortcuts,
  migrateShortcuts,
  ensureProjectsFolder,
  ensureProgramFilesExecutables,
  ensureMetadataIcons,
  migrateFileSizes,
} from './migrations';
import { useFileSystemOperations } from './useFileSystemOperations';
import { createVirtualFileSystemAdapter } from './virtualFileSystem';

const FileSystemContext = createContext(null);

// Helper to get storage key for a user's file system
const getFileSystemKey = (userId) => userId ? `fileSystem-${userId}` : 'fileSystem';

export function FileSystemProvider({ children }) {
  const { getDesktopPrograms, cvData, getUsername, isLoading: configLoading } = useConfig();
  const { activeUserId, isLoading: userLoading } = useUserAccounts();
  const [fileSystem, setFileSystem] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  const [clipboardOp, setClipboardOp] = useState('copy');
  const [isLoading, setIsLoading] = useState(true);
  const currentUserIdRef = useRef(null);

  // Build desktop shortcuts from config
  const desktopShortcuts = useMemo(() => {
    if (configLoading) return buildDesktopShortcuts(DEFAULT_DESKTOP_PROGRAMS);
    const programIds = getDesktopPrograms();
    return buildDesktopShortcuts(programIds);
  }, [configLoading, getDesktopPrograms]);

  // Convert CV projects to folder-friendly format
  const folderProjects = useMemo(() => {
    const cvProjects = cvData?.cv?.sections?.projects || [];
    return cvProjects.map(convertCvProjectToFolderProject);
  }, [cvData]);

  // Get user name for folder structure
  const userName = useMemo(() => {
    if (configLoading) return 'User';
    return getUsername() || 'User';
  }, [configLoading, getUsername]);

  // Load file system from IndexedDB when user changes
  useEffect(() => {
    if (configLoading || userLoading) return;

    if (!activeUserId) {
      setFileSystem(null);
      setIsLoading(false);
      return;
    }

    if (currentUserIdRef.current === activeUserId && fileSystem) {
      return;
    }

    const loadFileSystem = async () => {
      setIsLoading(true);
      const storageKey = getFileSystemKey(activeUserId);

      try {
        let fs = await idb.get(storageKey);

        // Migration: Check if there's an old global file system to migrate
        if (!fs && activeUserId) {
          const oldFs = await idb.get('fileSystem');
          if (oldFs && !oldFs._migratedToPerUser) {
            fs = { ...oldFs, _migratedToPerUser: true };
            await idb.set('fileSystem', { ...oldFs, _migratedToPerUser: true });
          }
        }

        if (!fs) {
          fs = createInitialFileSystem(desktopShortcuts, folderProjects, userName);
        } else {
          migrateToNewStructure(fs, userName);
          ensureDesktopShortcuts(fs, desktopShortcuts);
          migrateShortcuts(fs, desktopShortcuts);
          ensureProjectsFolder(fs, folderProjects);
          ensureProgramFilesExecutables(fs);
          fs = migrateFileSizes(fs);
        }

        ensureMetadataIcons(fs);

        await idb.set(storageKey, fs);
        currentUserIdRef.current = activeUserId;
        setFileSystem(fs);
      } catch (error) {
        console.error('Failed to load file system:', error);
        setFileSystem(createInitialFileSystem(desktopShortcuts, folderProjects, userName));
        currentUserIdRef.current = activeUserId;
      } finally {
        setIsLoading(false);
      }
    };

    loadFileSystem();
  }, [configLoading, userLoading, activeUserId, fileSystem, desktopShortcuts, folderProjects, userName]);

  // Save file system to IndexedDB whenever it changes
  useEffect(() => {
    if (fileSystem && !isLoading && activeUserId) {
      const storageKey = getFileSystemKey(activeUserId);
      idb.set(storageKey, fileSystem).catch(console.error);
    }
  }, [fileSystem, isLoading, activeUserId]);

  // CRUD operations (extracted to separate hook)
  const operations = useFileSystemOperations(fileSystem, setFileSystem);

  const vfs = useMemo(() => createVirtualFileSystemAdapter({
    fileSystem,
    createItem: operations.createItem,
    createFile: operations.createFile,
    deleteItem: operations.deleteItem,
    renameItem: operations.renameItem,
    moveItem: operations.moveItem,
    getFileContent: operations.getFileContent,
    saveFileContent: operations.saveFileContent,
  }), [
    fileSystem,
    operations.createItem,
    operations.createFile,
    operations.deleteItem,
    operations.renameItem,
    operations.moveItem,
    operations.getFileContent,
    operations.saveFileContent,
  ]);

  // Clipboard operations
  const copy = useCallback((ids) => {
    setClipboard(Array.isArray(ids) ? ids : [ids]);
    setClipboardOp('copy');
  }, []);

  const cut = useCallback((ids) => {
    setClipboard(Array.isArray(ids) ? ids : [ids]);
    setClipboardOp('cut');
  }, []);

  const paste = useCallback(async (targetParentId) => {
    if (!fileSystem || !fileSystem[targetParentId] || clipboard.length === 0) return;
    if (fileSystem[targetParentId].type === 'file') return;

    for (const sourceId of clipboard) {
      if (sourceId === targetParentId) continue;

      let parent = fileSystem[targetParentId];
      let isChild = false;
      while (parent) {
        if (parent.id === sourceId) {
          isChild = true;
          break;
        }
        parent = parent.parent ? fileSystem[parent.parent] : null;
      }
      if (isChild) continue;

      await operations.cloneItem(sourceId, targetParentId);

      if (clipboardOp === 'cut') {
        await operations.deleteItem(sourceId);
      }
    }

    if (clipboardOp === 'cut') {
      setClipboard([]);
      setClipboardOp('copy');
    }
  }, [fileSystem, clipboard, clipboardOp, operations]);

  // Reset file system to initial state
  const resetFileSystem = useCallback(async () => {
    const initial = createInitialFileSystem(desktopShortcuts, folderProjects, userName);
    await idb.set('fileSystem', initial);
    setFileSystem(initial);
  }, [desktopShortcuts, folderProjects, userName]);

  const value = {
    fileSystem,
    isLoading,
    clipboard,
    clipboardOp,
    // Operations
    createItem: operations.createItem,
    createFile: operations.createFile,
    deleteItem: operations.deleteItem,
    moveToRecycleBin: operations.moveToRecycleBin,
    restoreFromRecycleBin: operations.restoreFromRecycleBin,
    renameItem: operations.renameItem,
    moveItem: operations.moveItem,
    copy,
    cut,
    paste,
    // File content
    getFileContent: operations.getFileContent,
    saveFileContent: operations.saveFileContent,
    updateFile: operations.saveFileContent,
    // Utilities
    getPath: operations.getPath,
    getFolderContents: operations.getFolderContents,
    getFileIcon: operations.getFileIcon,
    getExtension: operations.getExtension,
    emptyRecycleBin: operations.emptyRecycleBin,
    resetFileSystem,
    // Path-based VFS facade
    vfs,
    getVfsPath: vfs.getPathForId,
    resolveVfsPath: vfs.getIdForPath,
    // Constants
    SYSTEM_IDS,
  };

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
}

export default FileSystemContext;
