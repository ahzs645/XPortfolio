import { useCallback } from 'react';
import * as idb from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import { XP_ICONS, SYSTEM_IDS, fileIcons, PROTECTED_ITEMS } from './constants';

// File utility helpers
const getExtension = (filename) => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(lastDot).toLowerCase() : '';
};

const getBasename = (filename) => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot > 0 ? filename.substring(0, lastDot) : filename;
};

const getFileIcon = (filename, type) => {
  if (type === 'folder') return XP_ICONS.folder;
  if (type === 'drive') return XP_ICONS.localDisk;
  const ext = getExtension(filename);
  return fileIcons[ext] || '/icons/notepad.png';
};

/**
 * Extracts all file system CRUD operations into a standalone hook.
 * Receives fileSystem state and setFileSystem setter from the provider.
 */
export function useFileSystemOperations(fileSystem, setFileSystem) {
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

  // Generate Windows XP-style copy name: "Copy of X", "Copy (2) of X", etc.
  const generateCopyName = useCallback((parentId, originalName, extension) => {
    if (!fileSystem || !fileSystem[parentId]) return `Copy of ${originalName}${extension}`;

    const siblings = fileSystem[parentId].children
      .map(id => fileSystem[id]?.name)
      .filter(Boolean);

    // Extract the original base name (remove any existing "Copy of" or "Copy (N) of" prefix)
    let cleanBaseName = originalName;
    const copyOfMatch = originalName.match(/^Copy of (.+)$/);
    const copyNOfMatch = originalName.match(/^Copy \((\d+)\) of (.+)$/);

    if (copyNOfMatch) {
      cleanBaseName = copyNOfMatch[2];
    } else if (copyOfMatch) {
      cleanBaseName = copyOfMatch[1];
    }

    // Try "Copy of X" first
    let name = `Copy of ${cleanBaseName}${extension}`;
    if (!siblings.includes(name)) {
      return name;
    }

    // Try "Copy (2) of X", "Copy (3) of X", etc.
    let counter = 2;
    while (siblings.includes(name)) {
      name = `Copy (${counter}) of ${cleanBaseName}${extension}`;
      counter++;
    }

    return name;
  }, [fileSystem]);

  // Create new file, folder, or shortcut
  const createItem = useCallback(async (parentId, name, type, fileOrOptions = null) => {
    if (!fileSystem || !fileSystem[parentId]) return null;

    const isOptions = fileOrOptions && typeof fileOrOptions === 'object' && !(fileOrOptions instanceof File) && !fileOrOptions.size;
    const file = isOptions ? null : fileOrOptions;
    const options = isOptions ? fileOrOptions : {};

    const now = Date.now();
    const id = uuidv4();

    const isShortcut = type === 'shortcut';
    const ext = isShortcut ? '.lnk' : (type === 'file' ? getExtension(name) : '');
    const baseName = type === 'file' || isShortcut ? getBasename(name) : name;
    const uniqueName = generateUniqueName(parentId, baseName, ext);

    const newItem = {
      id,
      type,
      name: uniqueName,
      basename: baseName,
      ext,
      icon: options.icon || getFileIcon(uniqueName, type),
      parent: parentId,
      children: type === 'folder' ? [] : undefined,
      size: file ? file.size : (isShortcut ? 90 : 0),
      storageType: file ? 'local' : 'none',
      storageKey: file ? uuidv4() : null,
      dateCreated: now,
      dateModified: now,
    };

    if (isShortcut && options.target) {
      newItem.target = options.target;
    }
    if (isShortcut && options.fsId) {
      newItem.fsId = options.fsId;
    }
    if (isShortcut && options.targetType) {
      newItem.targetType = options.targetType;
    }

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
  }, [fileSystem, generateUniqueName, setFileSystem]);

  // Delete item
  const deleteItem = useCallback(async (id) => {
    if (!fileSystem || !fileSystem[id]) return false;
    if (PROTECTED_ITEMS.includes(id)) {
      console.warn('Cannot delete protected item:', id);
      return false;
    }

    const item = fileSystem[id];
    const parentId = item.parent;

    const collectChildren = (itemId) => {
      const item = fileSystem[itemId];
      if (!item) return [];
      const children = item.children || [];
      return [itemId, ...children.flatMap(collectChildren)];
    };

    const toDelete = collectChildren(id);

    for (const itemId of toDelete) {
      const item = fileSystem[itemId];
      if (item?.storageKey) {
        await idb.del(item.storageKey);
      }
    }

    setFileSystem(prev => {
      const next = { ...prev };

      if (parentId && next[parentId]) {
        next[parentId] = {
          ...next[parentId],
          children: next[parentId].children.filter(cid => cid !== id),
          dateModified: Date.now(),
        };
      }

      toDelete.forEach(itemId => delete next[itemId]);

      return next;
    });

    return true;
  }, [fileSystem, setFileSystem]);

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
  }, [fileSystem, setFileSystem]);

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
  }, [fileSystem, setFileSystem]);

  // Clone an item (used for paste)
  const cloneItem = useCallback(async (sourceId, targetParentId) => {
    if (!fileSystem || !fileSystem[sourceId] || !fileSystem[targetParentId]) return null;

    const source = fileSystem[sourceId];
    const now = Date.now();
    const newId = uuidv4();

    const baseName = source.basename || source.name?.replace(/\.[^/.]+$/, '') || source.name;
    const uniqueName = generateCopyName(targetParentId, baseName, source.ext || '');

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
  }, [fileSystem, generateCopyName, setFileSystem]);

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
  }, [fileSystem, setFileSystem]);

  // Move item to a new parent folder
  const moveItem = useCallback((id, newParentId) => {
    if (!fileSystem || !fileSystem[id] || !fileSystem[newParentId]) return false;
    if (PROTECTED_ITEMS.includes(id)) return false;

    const item = fileSystem[id];
    const oldParentId = item.parent;

    if (oldParentId === newParentId) return false;
    if (id === newParentId) return false;
    if (fileSystem[newParentId].type === 'file') return false;

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
  }, [fileSystem, setFileSystem]);

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

    await idb.set(storageKey, fileContent.data);

    let icon = XP_ICONS.default;
    const lowerExt = ext.toLowerCase();

    if (['.zip', '.rar', '.7z', '.tar', '.gz'].includes(lowerExt)) {
      icon = XP_ICONS.rar;
    } else if (['.html', '.htm'].includes(lowerExt)) {
      icon = '/icons/xp/InternetExplorer6.png';
    } else if (['.txt', '.log', '.md'].includes(lowerExt)) {
      icon = XP_ICONS.notepad;
    } else if (['.ttf', '.otf', '.woff', '.woff2', '.fon'].includes(lowerExt)) {
      icon = '/icons/xp/font.png';
    } else if (lowerExt === '.eml') {
      icon = XP_ICONS.email;
    } else if (fileContent.type) {
      if (fileContent.type.startsWith('image/')) {
        icon = '/icons/xp/JPG.png';
      } else if (fileContent.type.startsWith('audio/')) {
        icon = '/icons/media-player.png';
      } else if (fileContent.type.startsWith('video/')) {
        icon = '/icons/media-player.png';
      } else if (fileContent.type === 'application/pdf') {
        icon = '/icons/pdf/PDF.ico';
      } else if (fileContent.type === 'application/zip' || fileContent.type === 'application/x-rar-compressed') {
        icon = XP_ICONS.rar;
      } else if (fileContent.type === 'text/plain') {
        icon = XP_ICONS.notepad;
      }
    }

    setFileSystem(prev => {
      if (!prev || !prev[parentId]) {
        console.error('Parent folder not found:', parentId);
        return prev;
      }

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
  }, [setFileSystem]);

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
  }, [fileSystem, setFileSystem]);

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

  return {
    createItem,
    createFile,
    deleteItem,
    moveToRecycleBin,
    restoreFromRecycleBin,
    renameItem,
    moveItem,
    cloneItem,
    getFileContent,
    saveFileContent,
    getPath,
    getFolderContents,
    getFileIcon: useCallback((filename, type) => getFileIcon(filename, type), []),
    getExtension: useCallback((filename) => getExtension(filename), []),
    emptyRecycleBin,
  };
}
