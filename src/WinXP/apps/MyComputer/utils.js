import { FILE_TYPES } from './constants';

/**
 * Get file extension from filename
 */
export const getFileExtension = (name) => {
  if (!name) return '';
  const dotIndex = name.lastIndexOf('.');
  return dotIndex === -1 ? '' : name.slice(dotIndex).toLowerCase();
};

/**
 * Get file type description for an item (detailed version for column views)
 */
export const getFileType = (item) => {
  if (!item) return 'Unknown';
  if (item.type === 'folder') return 'File Folder';
  if (item.type === 'drive') return 'Local Disk';
  if (item.type === 'shortcut') return 'Shortcut File';
  const ext = getFileExtension(item.name).replace('.', '');
  return FILE_TYPES[ext] || `${ext.toUpperCase()} File` || 'File';
};

/**
 * Get simple file type for Details pane (e.g., "JPG File", "RAR File")
 */
export const getSimpleFileType = (item) => {
  if (!item) return 'Unknown';
  if (item.type === 'folder') return 'File Folder';
  if (item.type === 'drive') return 'Local Disk';
  if (item.type === 'shortcut') return 'Shortcut File';
  const ext = getFileExtension(item.name).replace('.', '');
  if (!ext) return 'File';
  return `${ext.toUpperCase()} File`;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return '';
  if (bytes === 0) return '0 KB';
  if (bytes < 1024) return '1 KB';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

/**
 * Calculate folder size recursively (sum of all files inside)
 */
export const calculateFolderSize = (folderId, fileSystem) => {
  if (!fileSystem || !fileSystem[folderId]) return 0;

  const folder = fileSystem[folderId];
  if (folder.type !== 'folder' || !folder.children) return folder.size || 0;

  let totalSize = 0;
  for (const childId of folder.children) {
    const child = fileSystem[childId];
    if (!child) continue;

    if (child.type === 'folder') {
      totalSize += calculateFolderSize(childId, fileSystem);
    } else {
      totalSize += child.size || 0;
    }
  }

  return totalSize;
};

/**
 * Format date for display (short format for details view)
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format date for Details pane (long format with day name)
 */
export const formatDetailDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Sort items based on sort settings
 */
export const sortItems = (items, sortBy, sortOrder) => {
  if (!items || items.length === 0) return [];

  return [...items].sort((a, b) => {
    // Folders always come first
    const aIsFolder = a.type === 'folder' || a.type === 'drive';
    const bIsFolder = b.type === 'folder' || b.type === 'drive';
    if (aIsFolder !== bIsFolder) return aIsFolder ? -1 : 1;

    let aVal, bVal;
    switch (sortBy) {
      case 'name':
        aVal = (a.name || '').toLowerCase();
        bVal = (b.name || '').toLowerCase();
        break;
      case 'size':
        aVal = a.size || 0;
        bVal = b.size || 0;
        break;
      case 'type':
        aVal = getFileType(a).toLowerCase();
        bVal = getFileType(b).toLowerCase();
        break;
      case 'modified':
        aVal = a.modified || 0;
        bVal = b.modified || 0;
        break;
      default:
        aVal = (a.name || '').toLowerCase();
        bVal = (b.name || '').toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Filter items by search query
 */
export const filterItems = (items, searchQuery) => {
  if (!searchQuery.trim()) return items;
  const query = searchQuery.toLowerCase();
  return items.filter(item =>
    (item.name || '').toLowerCase().includes(query)
  );
};

/**
 * Format path for display (shorter format)
 */
export const formatShortPath = (path) => {
  if (!path || path === 'My Computer') return 'My Computer';
  return path
    .replace('Local Disk (C:)', 'C:')
    .replace(/\\/g, '\\');
};
