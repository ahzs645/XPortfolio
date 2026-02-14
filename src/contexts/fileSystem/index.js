// Barrel file — re-exports everything for backward compatibility.
// Consumers can continue importing from 'contexts/FileSystemContext'.

export { FileSystemProvider, useFileSystem } from './FileSystemProvider';
export { default } from './FileSystemProvider';

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
