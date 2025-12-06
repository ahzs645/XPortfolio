import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import * as idb from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import { useConfig } from './ConfigContext';
import { useUserAccounts } from './UserAccountsContext';

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
  '.txt': '/icons/xp/Notepad.png',
  '.mp3': '/icons/media-player.png',
  '.mp4': '/icons/media-player.png',
  '.jpg': '/icons/image-viewer.png',
  '.jpeg': '/icons/image-viewer.png',
  '.png': '/icons/image-viewer.png',
  '.gif': '/icons/image-viewer.png',
  '.bmp': '/icons/paint.webp',
  '.pdf': '/icons/xp/PDF.png',
  '.html': '/icons/xp/InternetExplorer6.png',
  '.htm': '/icons/xp/InternetExplorer6.png',
  '.lnk': '/icons/xp/Shortcutoverlay.png',
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
  displayProperties: '/icons/xp/DisplayProperties.png',
  file: '/icons/xp/JPG.png',
  rar: '/icons/xp/RAR.png',
  zipFolder: '/icons/xp/Zipfolder.png',
  email: '/icons/xp/Email.png',
  floppy: '/icons/xp/FloppyDisk.png',
  briefcase: '/icons/xp/Briefcase.png',
  bitmap: '/icons/xp/Bitmap.png',
  textDoc: '/icons/xp/GenericTextDocument.png',
  wav: '/icons/xp/WMV.png',
  shortcut: '/icons/xp/Shortcutoverlay.png',
  default: '/icons/xp/Default.png',
  controlPanel: '/icons/xp/ControlPanel.png',
  search: '/icons/xp/Search.png',
  help: '/icons/xp/HelpandSupport.png',
  programs: '/icons/xp/Programs.png',
  run: '/icons/xp/Run.png',
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

// Shortcut file size in bytes (Windows .lnk files are typically small)
const SHORTCUT_SIZE = 90; // 90 bytes like in reference

// Special system icons (not shortcuts, don't appear in Desktop folder)
export const SYSTEM_DESKTOP_ICONS = {
  myComputer: { id: 'system-my-computer', name: 'My Computer', icon: XP_ICONS.myComputer, target: 'My Computer', type: 'system' },
  recycleBin: { id: 'system-recycle-bin', name: 'Recycle Bin', icon: XP_ICONS.recycleBinEmpty, target: 'Recycle Bin', type: 'system' },
};

// Full catalog of available desktop shortcuts (program ID -> shortcut definition)
// These map to the appSettings keys in src/WinXP/apps/index.js
export const DESKTOP_SHORTCUT_CATALOG = {
  about: { id: 'shortcut-about', name: 'About Me.lnk', icon: '/icons/about.webp', target: 'About Me', size: SHORTCUT_SIZE },
  resume: { id: 'shortcut-resume', name: 'Resume.lnk', icon: '/icons/resume.webp', target: 'Resume', size: SHORTCUT_SIZE },
  projects: { id: 'shortcut-projects', name: 'Projects.lnk', icon: '/icons/projects.webp', target: 'Projects', size: SHORTCUT_SIZE },
  contact: { id: 'shortcut-contact', name: 'Contact.lnk', icon: '/icons/contact.webp', target: 'Contact', size: SHORTCUT_SIZE },
  calculator: { id: 'shortcut-calculator', name: 'Calculator.lnk', icon: XP_ICONS.calculator, target: 'Calculator', size: SHORTCUT_SIZE },
  minesweeper: { id: 'shortcut-minesweeper', name: 'Minesweeper.lnk', icon: XP_ICONS.minesweeper, target: 'Minesweeper', size: SHORTCUT_SIZE },
  notepad: { id: 'shortcut-notepad', name: 'Notepad.lnk', icon: XP_ICONS.notepad, target: 'Notepad', size: SHORTCUT_SIZE },
  paint: { id: 'shortcut-paint', name: 'Paint.lnk', icon: '/icons/xp/Paint.png', target: 'Paint', size: SHORTCUT_SIZE },
  cmd: { id: 'shortcut-cmd', name: 'Command Prompt.lnk', icon: '/icons/xp/CommandPrompt.png', target: 'Command Prompt', size: SHORTCUT_SIZE },
  mediaPlayer: { id: 'shortcut-media-player', name: 'Windows Media Player.lnk', icon: '/icons/xp/WindowsMediaPlayer9.png', target: 'Windows Media Player', size: SHORTCUT_SIZE },
  internetExplorer: { id: 'shortcut-ie', name: 'Internet Explorer.lnk', icon: '/icons/xp/InternetExplorer6.png', target: 'Internet Explorer', size: SHORTCUT_SIZE },
  solitaire: { id: 'shortcut-solitaire', name: 'Solitaire.lnk', icon: '/icons/solitaire-icon.png', target: 'Solitaire', size: SHORTCUT_SIZE },
  spiderSolitaire: { id: 'shortcut-spider-solitaire', name: 'Spider Solitaire.lnk', icon: '/icons/spider-solitaire-icon.webp', target: 'Spider Solitaire', size: SHORTCUT_SIZE },
  pinball: { id: 'shortcut-pinball', name: '3D Pinball.lnk', icon: '/icons/pinball-icon.png', target: 'Pinball', size: SHORTCUT_SIZE },
  soundRecorder: { id: 'shortcut-sound-recorder', name: 'Sound Recorder.lnk', icon: '/icons/xp/SoundRecorder.webp', target: 'Sound Recorder', size: SHORTCUT_SIZE },
  winamp: { id: 'shortcut-winamp', name: 'Winamp.lnk', icon: '/icons/winamp.png', target: 'Winamp', size: SHORTCUT_SIZE },
  displayProperties: { id: 'shortcut-display', name: 'Display Properties.lnk', icon: XP_ICONS.displayProperties, target: 'Display Properties', size: SHORTCUT_SIZE },
};

// Default desktop programs if not specified in config (excludes system icons like My Computer and Recycle Bin)
const DEFAULT_DESKTOP_PROGRAMS = ['about', 'resume', 'projects', 'contact', 'calculator', 'minesweeper'];

// Build desktop shortcuts array from program IDs
const buildDesktopShortcuts = (programIds) => {
  return programIds
    .map(id => DESKTOP_SHORTCUT_CATALOG[id])
    .filter(Boolean);
};

// Initial file system structure
const createInitialFileSystem = (desktopShortcuts) => {
  const now = Date.now();

  // Create shortcut entries from provided list
  const shortcuts = {};
  const shortcutIds = [];
  desktopShortcuts.forEach(shortcut => {
    shortcuts[shortcut.id] = {
      id: shortcut.id,
      type: 'shortcut',
      name: shortcut.name,
      ext: '.lnk',
      icon: shortcut.icon,
      target: shortcut.target,
      parent: SYSTEM_IDS.DESKTOP,
      size: shortcut.size || SHORTCUT_SIZE,
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

// Helper to get storage key for a user's file system
const getFileSystemKey = (userId) => userId ? `fileSystem-${userId}` : 'fileSystem';

export function FileSystemProvider({ children }) {
  const { getDesktopPrograms, isLoading: configLoading } = useConfig();
  const { activeUserId, isLoading: userLoading } = useUserAccounts();
  const [fileSystem, setFileSystem] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  const [clipboardOp, setClipboardOp] = useState('copy'); // 'copy' or 'cut'
  const [isLoading, setIsLoading] = useState(true);
  const currentUserIdRef = useRef(null);

  // Build desktop shortcuts from config
  const desktopShortcuts = useMemo(() => {
    if (configLoading) return buildDesktopShortcuts(DEFAULT_DESKTOP_PROGRAMS);
    const programIds = getDesktopPrograms();
    return buildDesktopShortcuts(programIds);
  }, [configLoading, getDesktopPrograms]);

  // IDs of old shortcuts that should be removed (now system icons)
  const OLD_SHORTCUT_IDS = ['shortcut-my-computer', 'shortcut-recycle-bin'];

  // Ensure desktop shortcuts exist in file system
  const ensureDesktopShortcuts = (fs, desktopShortcuts) => {
    const now = Date.now();
    let modified = false;

    // Remove old My Computer and Recycle Bin shortcuts (now system icons)
    for (const oldId of OLD_SHORTCUT_IDS) {
      if (fs[oldId]) {
        delete fs[oldId];
        modified = true;
      }
      // Also remove from desktop children if present
      if (fs[SYSTEM_IDS.DESKTOP]?.children?.includes(oldId)) {
        fs[SYSTEM_IDS.DESKTOP].children = fs[SYSTEM_IDS.DESKTOP].children.filter(id => id !== oldId);
        modified = true;
      }
    }

    // Ensure Desktop folder exists
    if (!fs[SYSTEM_IDS.DESKTOP]) {
      fs[SYSTEM_IDS.DESKTOP] = {
        id: SYSTEM_IDS.DESKTOP,
        type: 'folder',
        name: 'Desktop',
        icon: XP_ICONS.desktop,
        parent: SYSTEM_IDS.C_DRIVE,
        children: [],
        dateCreated: now,
        dateModified: now,
      };
      modified = true;
    }

    // Ensure each shortcut exists
    desktopShortcuts.forEach(shortcut => {
      if (!fs[shortcut.id]) {
        fs[shortcut.id] = {
          id: shortcut.id,
          type: 'shortcut',
          name: shortcut.name,
          ext: '.lnk',
          icon: shortcut.icon,
          target: shortcut.target,
          parent: SYSTEM_IDS.DESKTOP,
          size: shortcut.size || SHORTCUT_SIZE,
          dateCreated: now,
          dateModified: now,
        };
        modified = true;
      } else {
        // Migrate existing items to be proper shortcuts
        const item = fs[shortcut.id];
        if (item.type !== 'shortcut') {
          fs[shortcut.id].type = 'shortcut';
          modified = true;
        }
        if (!item.ext) {
          fs[shortcut.id].ext = '.lnk';
          modified = true;
        }
        if (!item.size) {
          fs[shortcut.id].size = shortcut.size || SHORTCUT_SIZE;
          modified = true;
        }
        // Update name to include .lnk if not present
        if (!item.name.endsWith('.lnk')) {
          fs[shortcut.id].name = item.name + '.lnk';
          modified = true;
        }
        // Ensure icon and target are set
        if (!item.icon) {
          fs[shortcut.id].icon = shortcut.icon;
          modified = true;
        }
        if (!item.target) {
          fs[shortcut.id].target = shortcut.target;
          modified = true;
        }
      }

      // Ensure shortcut is in desktop's children
      if (!fs[SYSTEM_IDS.DESKTOP].children.includes(shortcut.id)) {
        fs[SYSTEM_IDS.DESKTOP].children.push(shortcut.id);
        modified = true;
      }
    });

    return modified;
  };

  // Migrate old file sizes from KB to bytes
  const migrateFileSizes = (fs) => {
    if (!fs || fs._sizesMigrated) return fs;

    const migrated = { ...fs, _sizesMigrated: true };
    for (const id of Object.keys(migrated)) {
      if (id.startsWith('_')) continue; // Skip metadata keys
      const item = migrated[id];
      if (item && item.type === 'file' && typeof item.size === 'number' && item.size > 0) {
        // If size is small (likely stored in KB), convert to bytes
        // Heuristic: if size < 10000, it was probably stored in KB
        if (item.size < 10000) {
          migrated[id] = { ...item, size: item.size * 1024 };
        }
      }
    }
    return migrated;
  };

  // Load file system from IndexedDB when user changes
  useEffect(() => {
    // Wait for config and user to load before initializing file system
    if (configLoading || userLoading) return;

    // If no active user, don't load file system (show login screen)
    if (!activeUserId) {
      setFileSystem(null);
      setIsLoading(false);
      return;
    }

    // Skip if already loaded for this user
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
            // Migrate old global file system to first user
            fs = { ...oldFs, _migratedToPerUser: true };
            // Mark the old one as migrated so we don't do it again
            await idb.set('fileSystem', { ...oldFs, _migratedToPerUser: true });
          }
        }

        if (!fs) {
          fs = createInitialFileSystem(desktopShortcuts);
        } else {
          // Ensure desktop shortcuts exist
          ensureDesktopShortcuts(fs, desktopShortcuts);
          // Migrate old file sizes from KB to bytes
          fs = migrateFileSizes(fs);
        }

        await idb.set(storageKey, fs);
        currentUserIdRef.current = activeUserId;
        setFileSystem(fs);
      } catch (error) {
        console.error('Failed to load file system:', error);
        setFileSystem(createInitialFileSystem(desktopShortcuts));
        currentUserIdRef.current = activeUserId;
      } finally {
        setIsLoading(false);
      }
    };

    loadFileSystem();
  }, [configLoading, userLoading, activeUserId, desktopShortcuts]);

  // Save file system to IndexedDB whenever it changes
  useEffect(() => {
    if (fileSystem && !isLoading && activeUserId) {
      const storageKey = getFileSystemKey(activeUserId);
      idb.set(storageKey, fileSystem).catch(console.error);
    }
  }, [fileSystem, isLoading, activeUserId]);

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
      size: file ? file.size : 0,
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

  // Move item to a new parent folder
  const moveItem = useCallback((id, newParentId) => {
    if (!fileSystem || !fileSystem[id] || !fileSystem[newParentId]) return false;
    if (PROTECTED_ITEMS.includes(id)) return false;

    const item = fileSystem[id];
    const oldParentId = item.parent;

    // Can't move to same parent
    if (oldParentId === newParentId) return false;

    // Can't move into itself
    if (id === newParentId) return false;

    // Can't move into a file
    if (fileSystem[newParentId].type === 'file') return false;

    // Can't move a folder into its own descendant
    let checkParent = fileSystem[newParentId];
    while (checkParent) {
      if (checkParent.id === id) return false;
      checkParent = checkParent.parent ? fileSystem[checkParent.parent] : null;
    }

    const now = Date.now();

    setFileSystem(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        parent: newParentId,
        dateModified: now,
      },
      [oldParentId]: {
        ...prev[oldParentId],
        children: prev[oldParentId].children.filter(cid => cid !== id),
        dateModified: now,
      },
      [newParentId]: {
        ...prev[newParentId],
        children: [...prev[newParentId].children, id],
        dateModified: now,
      },
    }));

    return true;
  }, [fileSystem]);

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

  // Create a file with content (convenience wrapper)
  const createFile = useCallback(async (parentId, name, fileContent) => {
    const now = Date.now();
    const id = uuidv4();
    const ext = getExtension(name);
    const baseName = getBasename(name);
    const storageKey = uuidv4();

    // Store file data in IndexedDB
    await idb.set(storageKey, fileContent.data);

    // Determine icon based on content type and extension
    let icon = XP_ICONS.default; // Use default icon for unknown file types
    const lowerExt = ext.toLowerCase();

    // Check extension first for specific file types
    if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(lowerExt)) {
      icon = XP_ICONS.rar;
    } else if (['.html', '.htm'].includes(lowerExt)) {
      icon = '/icons/xp/InternetExplorer6.png';
    } else if (['.txt', '.log', '.md'].includes(lowerExt)) {
      icon = XP_ICONS.notepad;
    } else if (fileContent.type) {
      if (fileContent.type.startsWith('image/')) {
        icon = '/icons/xp/JPG.png';
      } else if (fileContent.type.startsWith('audio/')) {
        icon = '/icons/media-player.png';
      } else if (fileContent.type.startsWith('video/')) {
        icon = '/icons/media-player.png';
      } else if (fileContent.type === 'application/pdf') {
        icon = '/icons/resume.webp';
      } else if (fileContent.type === 'application/zip' || fileContent.type === 'application/x-rar-compressed') {
        icon = XP_ICONS.rar;
      } else if (fileContent.type === 'text/plain') {
        icon = XP_ICONS.notepad;
      }
      // Other types will use the default icon set above
    }

    // Use functional update to work with latest state
    setFileSystem(prev => {
      if (!prev || !prev[parentId]) {
        console.error('Parent folder not found:', parentId);
        return prev;
      }

      // Generate unique name based on current state
      const siblings = prev[parentId].children
        .map(cid => prev[cid]?.name)
        .filter(Boolean);

      let uniqueName = baseName + ext;
      let counter = 2;
      while (siblings.includes(uniqueName)) {
        uniqueName = `${baseName} (${counter})${ext}`;
        counter++;
      }

      const newItem = {
        id,
        type: 'file',
        name: uniqueName,
        basename: baseName,
        ext,
        icon,
        parent: parentId,
        size: fileContent.size || 0,
        contentType: fileContent.type,
        storageType: 'local',
        storageKey,
        data: fileContent.data,
        dateCreated: now,
        dateModified: now,
      };

      return {
        ...prev,
        [id]: newItem,
        [parentId]: {
          ...prev[parentId],
          children: [...prev[parentId].children, id],
          dateModified: now,
        },
      };
    });

    return id;
  }, [getExtension, getBasename]);

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
        size: content instanceof Blob ? content.size : 0,
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
    createFile,
    deleteItem,
    moveToRecycleBin,
    restoreFromRecycleBin,
    renameItem,
    moveItem,
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
