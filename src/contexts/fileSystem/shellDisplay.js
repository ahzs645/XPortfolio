const HIDEABLE_TYPES = new Set(['file', 'shortcut', 'executable']);

export function isShortcutItem(item) {
  return Boolean(item && (item.type === 'shortcut' || item.name?.toLowerCase().endsWith('.lnk')));
}

export function isHiddenFileSystemItem(item) {
  return Boolean(item?.metadata?.hidden);
}

export function filterVisibleFileSystemItems(items, { showHiddenContents = false } = {}) {
  if (!Array.isArray(items)) {
    return [];
  }

  if (showHiddenContents) {
    return items;
  }

  return items.filter((item) => !isHiddenFileSystemItem(item));
}

export function getFileSystemItemDisplayName(
  item,
  { showFileExtensions = true } = {}
) {
  const name = item?.name || '';
  if (!name) {
    return '';
  }

  if (isShortcutItem(item) && name.toLowerCase().endsWith('.lnk')) {
    return name.slice(0, -4);
  }

  if (showFileExtensions || !HIDEABLE_TYPES.has(item?.type)) {
    return name;
  }

  const lastDot = name.lastIndexOf('.');
  if (lastDot <= 0) {
    return name;
  }

  return name.slice(0, lastDot);
}
