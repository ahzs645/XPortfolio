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
 * Get file type description for an item
 */
export const getFileType = (item) => {
  if (!item) return 'Unknown';
  if (item.type === 'folder') return 'File Folder';
  if (item.type === 'drive') return 'Local Disk';
  const ext = getFileExtension(item.name).replace('.', '');
  return FILE_TYPES[ext] || `${ext.toUpperCase()} File` || 'File';
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
 * Format date for display
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
