import { XP_ICONS, fileIcons } from './constants';

export function getStoredItemIcon(item) {
  if (!item) {
    return null;
  }

  return item.metadata?.icon || item.icon || null;
}

export function resolveFileSystemItemIcon(
  item,
  {
    folderIcon = XP_ICONS.folder,
    driveIcon = XP_ICONS.localDisk,
    fileIcon = XP_ICONS.file,
  } = {}
) {
  if (!item) {
    return fileIcon;
  }

  const storedIcon = getStoredItemIcon(item);

  if (item.type === 'folder') {
    return storedIcon || folderIcon;
  }

  if (item.type === 'drive') {
    return storedIcon || driveIcon;
  }

  if (item.type === 'shortcut' || item.type === 'executable') {
    return storedIcon || fileIcon;
  }

  if (storedIcon) {
    return storedIcon;
  }

  const ext = item.name?.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (ext && fileIcons[ext]) {
    return fileIcons[ext];
  }

  return fileIcon;
}
