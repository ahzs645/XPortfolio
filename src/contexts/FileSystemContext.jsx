// This file is a backward-compatible re-export.
// The actual implementation has been modularized into src/contexts/fileSystem/.
export {
  FileSystemProvider,
  useFileSystem,
  default,
  SortOptions,
  SortOrders,
  fileIcons,
  XP_ICONS,
  SYSTEM_IDS,
  PROTECTED_ITEMS,
  SHORTCUT_SIZE,
  SYSTEM_DESKTOP_ICONS,
  DESKTOP_SHORTCUT_CATALOG,
  DEFAULT_DESKTOP_PROGRAMS,
  buildDesktopShortcuts,
  getStoredItemIcon,
  resolveFileSystemItemIcon,
} from './fileSystem/index';
