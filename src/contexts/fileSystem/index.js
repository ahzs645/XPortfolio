// Barrel file — re-exports everything for backward compatibility.
// Consumers can continue importing from 'contexts/FileSystemContext'.

export { FileSystemProvider, useFileSystem } from './FileSystemProvider';
export { default } from './FileSystemProvider';
export {
  createVirtualFileSystemAdapter,
  normalizeVirtualPath,
  joinVirtualPath,
  dirnameVirtualPath,
  basenameVirtualPath,
  VFS_ROOT_PATH,
  VFS_ROOT_LABEL,
  VFS_RECYCLE_BIN_PATH,
} from './virtualFileSystem';
export {
  getStoredItemIcon,
  resolveFileSystemItemIcon,
} from './iconResolver';
export {
  isShortcutItem,
  isHiddenFileSystemItem,
  filterVisibleFileSystemItems,
  getFileSystemItemDisplayName,
} from './shellDisplay';

// Constants
export {
  SortOptions,
  SortOrders,
  fileIcons,
  XP_ICONS,
  SYSTEM_IDS,
  PROTECTED_ITEMS,
  SHORTCUT_SIZE,
  SYSTEM_DESKTOP_ICONS,
} from './constants';

// Desktop shortcuts
export {
  DESKTOP_SHORTCUT_CATALOG,
  DEFAULT_DESKTOP_PROGRAMS,
  buildDesktopShortcuts,
} from './desktopShortcuts';
