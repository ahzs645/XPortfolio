import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as idb from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';

// Sort options
export const SortOptions = Object.freeze({
  NONE: 0,
  NAME: 1,
  SIZE: 2,
  DATE_CREATED: 3,
  DATE_MODIFIED: 4,
});

export const SortOrders = Object.freeze({
  ASCENDING: 0,
  DESCENDING: 1,
});

// File type icons mapping
export const fileIcons = {
  '.txt': '/icons/notepad.png',
  '.mp3': '/icons/media-player.png',
  '.mp4': '/icons/media-player.png',
  '.jpg': '/icons/image-viewer.png',
  '.jpeg': '/icons/image-viewer.png',
  '.png': '/icons/image-viewer.png',
  '.gif': '/icons/image-viewer.png',
  '.bmp': '/icons/paint.webp',
  '.pdf': '/icons/resume.webp',
};

// XP-style icons
export const XP_ICONS = {
  myComputer: '/icons/xp/MyComputer.png',
  folder: '/icons/xp/FolderClosed.png',
  folderOpen: '/icons/xp/FolderOpened.png',
  localDisk: '/icons/xp/LocalDisk.png',
  myDocuments: '/icons/xp/MyDocuments.png',
  myMusic: '/icons/xp/MyMusic.png',
  myPictures: '/icons/xp/MyPictures.png',
  desktop: '/icons/xp/Desktop.png',
  recycleBinEmpty: '/icons/xp/RecycleBinempty.png',
  recycleBinFull: '/icons/xp/RecycleBinfull.png',
  calculator: '/icons/xp/Calculator.png',
  minesweeper: '/icons/xp/Minesweeper.png',
  notepad: '/icons/xp/Notepad.png',
  file: '/icons/xp/JPG.png',
};

// Special folder IDs
export const SYSTEM_IDS = {
  C_DRIVE: 'c-drive',
  MY_DOCUMENTS: 'my-documents',
  MY_PICTURES: 'my-pictures',
  MY_MUSIC: 'my-music',
  DESKTOP: 'desktop-folder',
  RECYCLE_BIN: 'recycle-bin',
};

// Protected items that cannot be deleted
const PROTECTED_ITEMS = [
  SYSTEM_IDS.C_DRIVE,
  SYSTEM_IDS.MY_DOCUMENTS,
  SYSTEM_IDS.MY_PICTURES,
  SYSTEM_IDS.MY_MUSIC,
  SYSTEM_IDS.DESKTOP,
  SYSTEM_IDS.RECYCLE_BIN,
];

// Desktop shortcut definitions
const DESKTOP_SHORTCUTS = [
  { id: 'shortcut-my-computer', name: 'My Computer', icon: XP_ICONS.myComputer, target: 'My Computer' },
  { id: 'shortcut-recycle-bin', name: 'Recycle Bin', icon: XP_ICONS.recycleBinEmpty, target: 'Recycle Bin' },
  { id: 'shortcut-about', name: 'About Me', icon: '/icons/about.webp', target: 'About Me' },
  { id: 'shortcut-resume', name: 'Resume', icon: '/icons/resume.webp', target: 'Resume' },
  { id: 'shortcut-projects', name: 'Projects', icon: '/icons/projects.webp', target: 'Projects' },
  { id: 'shortcut-contact', name: 'Contact', icon: '/icons/contact.webp', target: 'Contact' },
  { id: 'shortcut-calculator', name: 'Calculator', icon: XP_ICONS.calculator, target: 'Calculator' },
  { id: 'shortcut-minesweeper', name: 'Minesweeper', icon: XP_ICONS.minesweeper, target: 'Minesweeper' },
];

// Initial file system structure
const createInitialFileSystem = () => {
  const now = Date.now();

  // Create shortcut entries
  const shortcuts = {};
  const shortcutIds = [];
  DESKTOP_SHORTCUTS.forEach(shortcut => {
    shortcuts[shortcut.id] = {
      id: shortcut.id,
      type: 'shortcut',
      name: shortcut.name,
      icon: shortcut.icon,
      target: shortcut.target,
      parent: SYSTEM_IDS.DESKTOP,
      dateCreated: now,
      dateModified: now,
    };
    shortcutIds.push(shortcut.id);
  });

  return {
    [SYSTEM_IDS.C_DRIVE]: {
      id: SYSTEM_IDS.C_DRIVE,
      type: 'drive',
      name: 'Local Disk (C:)',
      icon: XP_ICONS.localDisk,
      parent: null,
      children: [SYSTEM_IDS.MY_DOCUMENTS, SYSTEM_IDS.MY_PICTURES, SYSTEM_IDS.MY_MUSIC, SYSTEM_IDS.DESKTOP],
      dateCreated: now,
      dateModified: now,
    },
    [SYSTEM_IDS.MY_DOCUMENTS]: {
      id: SYSTEM_IDS.MY_DOCUMENTS,
      type: 'folder',
      name: 'My Documents',
      icon: XP_ICONS.myDocuments,
      parent: SYSTEM_IDS.C_DRIVE,
      children: [],
      dateCreated: now,
      dateModified: now,
    },
    [SYSTEM_IDS.MY_PICTURES]: {
      id: SYSTEM_IDS.MY_PICTURES,
      type: 'folder',
      name: 'My Pictures',
      icon: XP_ICONS.myPictures,
      parent: SYSTEM_IDS.C_DRIVE,
      children: [],
      dateCreated: now,
      dateModified: now,
    },
    [SYSTEM_IDS.MY_MUSIC]: {
      id: SYSTEM_IDS.MY_MUSIC,
      type: 'folder',
      name: 'My Music',
      icon: XP_ICONS.myMusic,
      parent: SYSTEM_IDS.C_DRIVE,
      children: [],
      dateCreated: now,
      dateModified: now,
    },
    [SYSTEM_IDS.DESKTOP]: {
      id: SYSTEM_IDS.DESKTOP,
      type: 'folder',
      name: 'Desktop',
      icon: XP_ICONS.desktop,
      parent: SYSTEM_IDS.C_DRIVE,
      children: shortcutIds,
      dateCreated: now,
      dateModified: now,
    },
    [SYSTEM_IDS.RECYCLE_BIN]: {
      id: SYSTEM_IDS.RECYCLE_BIN,
      type: 'folder',
      name: 'Recycle Bin',
      icon: XP_ICONS.recycleBinEmpty,
      parent: null,
      children: [],
      dateCreated: now,
      dateModified: now,
    },
    ...shortcuts,
  };
};

const FileSystemContext = createContext(null);

export function FileSystemProvider({ children }) {
  const [fileSystem, setFileSystem] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  const [clipboardOp, setClipboardOp] = useState('copy'); // 'copy' or 'cut'
  const [isLoading, setIsLoading] = useState(true);

  // Load file system from IndexedDB on mount
  useEffect(() => {
    const loadFileSystem = async () => {
      try {
        let fs = await idb.get('fileSystem');
        if (!fs) {
          fs = createInitialFileSystem();
          await idb.set('fileSystem', fs);
        }
        setFileSystem(fs);
      } catch (error) {
        console.error('Failed to load file system:', error);
        setFileSystem(createInitialFileSystem());
      } finally {
        setIsLoading(false);
      }
    };
    loadFileSystem();
  }, []);

  // Save file system to IndexedDB whenever it changes
  useEffect(() => {
    if (fileSystem && !isLoading) {
      idb.set('fileSystem', fileSystem).catch(console.error);
    }
  }, [fileSystem, isLoading]);

  // Get file extension
  const getExtension = useCallback((filename) => {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot).toLowerCase() : '';
  }, []);

  // Get basename without extension
  const getBasename = useCallback((filename) => {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(0, lastDot) : filename;
  }, []);

  // Get icon for file type
  const getFileIcon = useCallback((filename, type) => {
    if (type === 'folder') return XP_ICONS.folder;
    if (type === 'drive') return XP_ICONS.localDisk;
    const ext = getExtension(filename);
    return fileIcons[ext] || '/icons/notepad.png';
  }, [getExtension]);

  // Generate unique name if duplicate exists
  const generateUniqueName = useCallback((parentId, baseName, extension) => {
    if (!fileSystem || !fileSystem[parentId]) return baseName + extension;

    const siblings = fileSystem[parentId].children
      .map(id => fileSystem[id]?.name)
      .filter(Boolean);

    let name = baseName + extension;
    let counter = 2;

    while (siblings.includes(name)) {
      name = `${baseName} (${counter})${extension}`;
      counter++;
    }

    return name;
  }, [fileSystem]);

  // Create new file or folder
  const createItem = useCallback(async (parentId, name, type, file = null) => {
    if (!fileSystem || !fileSystem[parentId]) return null;

    const now = Date.now();
    const id = uuidv4();
    const ext = type === 'file' ? getExtension(name) : '';
    const baseName = type === 'file' ? getBasename(name) : name;
    const uniqueName = generateUniqueName(parentId, baseName, ext);

    const newItem = {
      id,
      type,
      name: uniqueName,
      basename: baseName,
      ext,
      icon: getFileIcon(uniqueName, type),
      parent: parentId,
      children: type === 'folder' ? [] : undefined,
      size: file ? Math.ceil(file.size / 1024) : 0,
      storageType: file ? 'local' : 'none',
      storageKey: file ? uuidv4() : null,
      dateCreated: now,
      dateModified: now,
    };

    // Store file in IndexedDB if provided
    if (file) {
      await idb.set(newItem.storageKey, file);
    }

    setFileSystem(prev => ({
      ...prev,
      [id]: newItem,
      [parentId]: {
        ...prev[parentId],
        children: [...prev[parentId].children, id],
        dateModified: now,
      },
    }));

    return id;
  }, [fileSystem, getExtension, getBasename, getFileIcon, generateUniqueName]);

  // Delete item
  const deleteItem = useCallback(async (id) => {
    if (!fileSystem || !fileSystem[id]) return false;
    if (PROTECTED_ITEMS.includes(id)) {
      console.warn('Cannot delete protected item:', id);
      return false;
    }

    const item = fileSystem[id];
    const parentId = item.parent;

    // Recursively collect all children to delete
    const collectChildren = (itemId) => {
      const item = fileSystem[itemId];
      if (!item) return [];
      const children = item.children || [];
      return [itemId, ...children.flatMap(collectChildren)];
    };

    const toDelete = collectChildren(id);

    // Delete files from IndexedDB
    for (const itemId of toDelete) {
      const item = fileSystem[itemId];
      if (item?.storageKey) {
        await idb.del(item.storageKey);
      }
    }

    setFileSystem(prev => {
      const next = { ...prev };

      // Remove from parent's children
      if (parentId && next[parentId]) {
        next[parentId] = {
          ...next[parentId],
          children: next[parentId].children.filter(cid => cid !== id),
          dateModified: Date.now(),
        };
      }

      // Delete all items
      toDelete.forEach(itemId => delete next[itemId]);

      return next;
    });

    return true;
  }, [fileSystem]);

  // Move to recycle bin
  const moveToRecycleBin = useCallback((id) => {
    if (!fileSystem || !fileSystem[id]) return false;
    if (PROTECTED_ITEMS.includes(id)) return false;

    const item = fileSystem[id];
    const oldParentId = item.parent;
    const now = Date.now();

    setFileSystem(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        parent: SYSTEM_IDS.RECYCLE_BIN,
        originalParent: oldParentId,
        deletedAt: now,
      },
      [oldParentId]: {
        ...prev[oldParentId],
        children: prev[oldParentId].children.filter(cid => cid !== id),
        dateModified: now,
      },
      [SYSTEM_IDS.RECYCLE_BIN]: {
        ...prev[SYSTEM_IDS.RECYCLE_BIN],
        children: [...prev[SYSTEM_IDS.RECYCLE_BIN].children, id],
        dateModified: now,
      },
    }));

    return true;
  }, [fileSystem]);

  // Restore from recycle bin
  const restoreFromRecycleBin = useCallback((id) => {
    if (!fileSystem || !fileSystem[id]) return false;

    const item = fileSystem[id];
    if (item.parent !== SYSTEM_IDS.RECYCLE_BIN) return false;

    const originalParent = item.originalParent || SYSTEM_IDS.MY_DOCUMENTS;
    const now = Date.now();

    setFileSystem(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        parent: originalParent,
        originalParent: undefined,
        deletedAt: undefined,
      },
      [SYSTEM_IDS.RECYCLE_BIN]: {
        ...prev[SYSTEM_IDS.RECYCLE_BIN],
        children: prev[SYSTEM_IDS.RECYCLE_BIN].children.filter(cid => cid !== id),
        dateModified: now,
      },
      [originalParent]: {
        ...prev[originalParent],
        children: [...prev[originalParent].children, id],
        dateModified: now,
      },
    }));

    return true;
  }, [fileSystem]);

  // Copy items to clipboard
  const copy = useCallback((ids) => {
    setClipboard(Array.isArray(ids) ? ids : [ids]);
    setClipboardOp('copy');
  }, []);

  // Cut items to clipboard
  const cut = useCallback((ids) => {
    setClipboard(Array.isArray(ids) ? ids : [ids]);
    setClipboardOp('cut');
  }, []);

  // Clone an item (used for paste)
  const cloneItem = useCallback(async (sourceId, targetParentId) => {
    if (!fileSystem || !fileSystem[sourceId] || !fileSystem[targetParentId]) return null;

    const source = fileSystem[sourceId];
    const now = Date.now();
    const newId = uuidv4();
    const uniqueName = generateUniqueName(targetParentId, source.basename || source.name, source.ext || '');

    const newItem = {
      ...source,
      id: newId,
      name: uniqueName,
      parent: targetParentId,
      children: source.type === 'folder' ? [] : undefined,
      dateCreated: now,
      dateModified: now,
      storageKey: source.storageKey ? uuidv4() : null,
    };

    // Copy file data if exists
    if (source.storageKey && newItem.storageKey) {
      const fileData = await idb.get(source.storageKey);
      if (fileData) {
        await idb.set(newItem.storageKey, fileData);
      }
    }

    setFileSystem(prev => ({
      ...prev,
      [newId]: newItem,
      [targetParentId]: {
        ...prev[targetParentId],
        children: [...prev[targetParentId].children, newId],
        dateModified: now,
      },
    }));

    // Recursively clone children for folders
    if (source.type === 'folder' && source.children) {
      for (const childId of source.children) {
        await cloneItem(childId, newId);
      }
    }

    return newId;
  }, [fileSystem, generateUniqueName]);

  // Paste items from clipboard
  const paste = useCallback(async (targetParentId) => {
    if (!fileSystem || !fileSystem[targetParentId] || clipboard.length === 0) return;
    if (fileSystem[targetParentId].type === 'file') return;

    for (const sourceId of clipboard) {
      // Prevent pasting into itself
      if (sourceId === targetParentId) continue;

      // Check if trying to paste a folder into its own child
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

      await cloneItem(sourceId, targetParentId);

      // If cut, delete the original
      if (clipboardOp === 'cut') {
        await deleteItem(sourceId);
      }
    }

    // Clear clipboard after cut operation
    if (clipboardOp === 'cut') {
      setClipboard([]);
      setClipboardOp('copy');
    }
  }, [fileSystem, clipboard, clipboardOp, cloneItem, deleteItem]);

  // Rename item
  const renameItem = useCallback((id, newName) => {
    if (!fileSystem || !fileSystem[id]) return false;
    if (PROTECTED_ITEMS.includes(id)) return false;

    const item = fileSystem[id];
    const ext = item.type === 'file' ? getExtension(newName) || item.ext : '';
    const baseName = item.type === 'file' ? getBasename(newName) : newName;

    setFileSystem(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        name: baseName + ext,
        basename: baseName,
        ext,
        dateModified: Date.now(),
      },
    }));

    return true;
  }, [fileSystem, getExtension, getBasename]);

  // Get file content
  const getFileContent = useCallback(async (id) => {
    if (!fileSystem || !fileSystem[id]) return null;
    const item = fileSystem[id];

    if (item.storageType === 'local' && item.storageKey) {
      return await idb.get(item.storageKey);
    }
    if (item.storageType === 'remote' && item.url) {
      const response = await fetch(item.url);
      return await response.blob();
    }
    return null;
  }, [fileSystem]);

  // Save file content
  const saveFileContent = useCallback(async (id, content) => {
    if (!fileSystem || !fileSystem[id]) return false;

    const item = fileSystem[id];
    let storageKey = item.storageKey;

    if (!storageKey) {
      storageKey = uuidv4();
    }

    await idb.set(storageKey, content);

    setFileSystem(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        storageType: 'local',
        storageKey,
        size: content instanceof Blob ? Math.ceil(content.size / 1024) : 0,
        dateModified: Date.now(),
      },
    }));

    return true;
  }, [fileSystem]);

  // Get path string for an item
  const getPath = useCallback((id) => {
    if (!fileSystem || !fileSystem[id]) return '';

    const parts = [];
    let current = fileSystem[id];

    while (current) {
      parts.unshift(current.name);
      current = current.parent ? fileSystem[current.parent] : null;
    }

    return parts.join('\\');
  }, [fileSystem]);

  // Get items in a folder
  const getFolderContents = useCallback((folderId) => {
    if (!fileSystem || !fileSystem[folderId]) return [];
    const folder = fileSystem[folderId];
    if (!folder.children) return [];

    return folder.children
      .map(id => fileSystem[id])
      .filter(Boolean);
  }, [fileSystem]);

  // Empty recycle bin
  const emptyRecycleBin = useCallback(async () => {
    const recycleBin = fileSystem?.[SYSTEM_IDS.RECYCLE_BIN];
    if (!recycleBin) return;

    for (const id of [...recycleBin.children]) {
      await deleteItem(id);
    }
  }, [fileSystem, deleteItem]);

  // Reset file system to initial state
  const resetFileSystem = useCallback(async () => {
    const initial = createInitialFileSystem();
    await idb.set('fileSystem', initial);
    setFileSystem(initial);
  }, []);

  const value = {
    fileSystem,
    isLoading,
    clipboard,
    clipboardOp,
    // Operations
    createItem,
    deleteItem,
    moveToRecycleBin,
    restoreFromRecycleBin,
    renameItem,
    copy,
    cut,
    paste,
    // File content
    getFileContent,
    saveFileContent,
    // Utilities
    getPath,
    getFolderContents,
    getFileIcon,
    getExtension,
    emptyRecycleBin,
    resetFileSystem,
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
