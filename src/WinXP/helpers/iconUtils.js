import { XP_ICONS, fileIcons } from '../../contexts/FileSystemContext';

// Get icon for a file item - dynamically compute from extension
const getItemIcon = (item) => {
  // For folders, drives, and special items, use stored icon
  if (item.type === 'folder' || item.type === 'drive' || item.type === 'shortcut') {
    return item.icon || XP_ICONS.folder;
  }

  // For files, compute icon from extension
  const ext = item.name?.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (ext && fileIcons[ext]) {
    return fileIcons[ext];
  }

  // Fall back to stored icon or default file icon
  return item.icon || XP_ICONS.file;
};

// Icon grid layout constants (used for arranging icons)
export const ICON_GRID = {
  iconWidth: 80,
  iconHeight: 90,
  iconGapX: 10,
  iconGapY: 10,
  startX: 10,
  startY: 10,
};

// Convert file system items to desktop icon format
export const convertToDesktopIcons = (items, appSettings, savedPositions = {}) => {
  const { iconWidth, iconHeight, iconGapX, iconGapY, startX, startY } = ICON_GRID;
  // Calculate max icons per column based on viewport (leave room for taskbar)
  const maxHeight = window.innerHeight - 60; // 60px for taskbar
  const iconsPerColumn = Math.floor((maxHeight - startY) / (iconHeight + iconGapY));

  return items.map((item, index) => {
    const savedPos = savedPositions[item.id];
    // Calculate column and row for grid layout
    const column = Math.floor(index / iconsPerColumn);
    const row = index % iconsPerColumn;
    const defaultX = startX + column * (iconWidth + iconGapX);
    const defaultY = startY + row * (iconHeight + iconGapY);

    // Ensure positions are valid numbers
    const validX = (savedPos?.x !== undefined && !isNaN(savedPos.x)) ? savedPos.x : defaultX;
    const validY = (savedPos?.y !== undefined && !isNaN(savedPos.y)) ? savedPos.y : defaultY;

    // For shortcuts, find the matching app component
    let component = null;
    if (item.type === 'shortcut' && item.target) {
      const appSetting = appSettings[item.target];
      if (appSetting) {
        component = appSetting.component;
      }
    }

    // For shortcuts, strip the .lnk extension from display title
    let displayTitle = item.name;
    if (item.type === 'shortcut' && item.name.endsWith('.lnk')) {
      displayTitle = item.name.slice(0, -4);
    }

    return {
      id: item.id,
      programId: item.id,
      icon: getItemIcon(item),
      title: displayTitle,
      fullName: item.name, // Keep the full name with .lnk for properties
      component: component,
      isFocus: false,
      x: validX,
      y: validY,
      // Extra info for file handling
      type: item.type,
      target: item.target,
      data: item.data,
      fileType: item.type === 'file' ? item.contentType : null,
      size: item.size,
      dateCreated: item.dateCreated,
      dateModified: item.dateModified,
    };
  });
};

// Snap a position to the grid
export const snapToGrid = (x, y) => {
  const { iconWidth, iconHeight, iconGapX, iconGapY, startX, startY } = ICON_GRID;
  const cellWidth = iconWidth + iconGapX;
  const cellHeight = iconHeight + iconGapY;

  const snappedX = Math.max(startX, Math.round((x - startX) / cellWidth) * cellWidth + startX);
  const snappedY = Math.max(startY, Math.round((y - startY) / cellHeight) * cellHeight + startY);

  return { x: snappedX, y: snappedY };
};

// Calculate grid positions for a list of icons
export const calculateGridPositions = (iconsList) => {
  const { iconWidth, iconHeight, iconGapX, iconGapY, startX, startY } = ICON_GRID;
  const maxHeight = window.innerHeight - 60; // Leave room for taskbar
  const iconsPerColumn = Math.floor((maxHeight - startY) / (iconHeight + iconGapY));

  const positions = {};
  iconsList.forEach((icon, index) => {
    const column = Math.floor(index / iconsPerColumn);
    const row = index % iconsPerColumn;
    positions[icon.id] = {
      x: startX + column * (iconWidth + iconGapX),
      y: startY + row * (iconHeight + iconGapY),
    };
  });
  return positions;
};
