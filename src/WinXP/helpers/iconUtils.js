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
  iconWidth: 75,
  iconHeight: 70,
  iconGapX: 0,
  iconGapY: 0,
  startX: 10,
  startY: 10,
};

// Calculate how many rows fit in the current viewport
export const getMaxRows = () => {
  const { iconHeight, iconGapY, startY } = ICON_GRID;
  const cellHeight = iconHeight + iconGapY;
  const maxHeight = window.innerHeight - 60; // 60px for taskbar
  return Math.max(1, Math.floor((maxHeight - startY) / cellHeight));
};

// Calculate pixel position from grid index
export const getPixelPositionFromIndex = (gridIndex) => {
  const { iconWidth, iconHeight, iconGapX, iconGapY, startX, startY } = ICON_GRID;
  const cellWidth = iconWidth + iconGapX;
  const cellHeight = iconHeight + iconGapY;
  const maxRows = getMaxRows();

  const column = Math.floor(gridIndex / maxRows);
  const row = gridIndex % maxRows;

  return {
    x: startX + column * cellWidth,
    y: startY + row * cellHeight,
  };
};

// Calculate grid index from pixel position
export const getGridIndexFromPosition = (x, y) => {
  const { iconWidth, iconHeight, iconGapX, iconGapY, startX, startY } = ICON_GRID;
  const cellWidth = iconWidth + iconGapX;
  const cellHeight = iconHeight + iconGapY;
  const maxRows = getMaxRows();

  const column = Math.max(0, Math.round((x - startX) / cellWidth));
  const row = Math.max(0, Math.min(maxRows - 1, Math.round((y - startY) / cellHeight)));

  return column * maxRows + row;
};

// Find nearest available grid index
export const findNearestAvailableIndex = (targetIndex, occupiedIndices, excludeId = null) => {
  const occupied = new Set(
    Object.entries(occupiedIndices)
      .filter(([id]) => id !== excludeId)
      .map(([, idx]) => idx)
  );

  // If target is available, use it
  if (!occupied.has(targetIndex)) {
    return targetIndex;
  }

  // Search outward for nearest available
  for (let offset = 1; offset < 1000; offset++) {
    if (!occupied.has(targetIndex + offset)) {
      return targetIndex + offset;
    }
    if (targetIndex - offset >= 0 && !occupied.has(targetIndex - offset)) {
      return targetIndex - offset;
    }
  }

  return targetIndex; // Fallback
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

// Snap a position to the grid (respecting taskbar boundary)
export const snapToGrid = (x, y) => {
  const { iconWidth, iconHeight, iconGapX, iconGapY, startX, startY } = ICON_GRID;
  const cellWidth = iconWidth + iconGapX;
  const cellHeight = iconHeight + iconGapY;

  // Calculate max Y position to stay above taskbar
  const maxHeight = window.innerHeight - 60; // 60px for taskbar
  const maxRows = Math.floor((maxHeight - startY) / cellHeight);
  const maxY = startY + (maxRows - 1) * cellHeight;

  const snappedX = Math.max(startX, Math.round((x - startX) / cellWidth) * cellWidth + startX);
  let snappedY = Math.max(startY, Math.round((y - startY) / cellHeight) * cellHeight + startY);

  // Ensure Y doesn't go below taskbar
  snappedY = Math.min(snappedY, maxY);

  return { x: snappedX, y: snappedY };
};

// Get all grid positions currently occupied by icons
const getOccupiedPositions = (icons, excludeIds = []) => {
  const { iconWidth, iconHeight, iconGapX, iconGapY, startX, startY } = ICON_GRID;
  const cellWidth = iconWidth + iconGapX;
  const cellHeight = iconHeight + iconGapY;
  const occupied = new Set();

  icons.forEach((icon) => {
    if (excludeIds.includes(icon.id)) return;
    // Snap the icon position to grid to get its cell
    const col = Math.round((icon.x - startX) / cellWidth);
    const row = Math.round((icon.y - startY) / cellHeight);
    occupied.add(`${col},${row}`);
  });

  return occupied;
};

// Find nearest available grid position
export const snapToNearestAvailable = (x, y, icons, iconId) => {
  const { iconWidth, iconHeight, iconGapX, iconGapY, startX, startY } = ICON_GRID;
  const cellWidth = iconWidth + iconGapX;
  const cellHeight = iconHeight + iconGapY;

  // Get occupied positions excluding the current icon being moved
  const occupied = getOccupiedPositions(icons, [iconId]);

  // Calculate the target grid cell
  const targetCol = Math.round((x - startX) / cellWidth);
  const targetRow = Math.round((y - startY) / cellHeight);

  // Calculate max columns and rows based on viewport
  const maxHeight = window.innerHeight - 60;
  const maxWidth = window.innerWidth;
  const maxCols = Math.floor((maxWidth - startX) / cellWidth);
  const maxRows = Math.floor((maxHeight - startY) / cellHeight);

  // Check if target position is available and within bounds
  const targetKey = `${targetCol},${targetRow}`;
  if (!occupied.has(targetKey) && targetCol >= 0 && targetRow >= 0 && targetCol < maxCols && targetRow < maxRows) {
    return {
      x: Math.max(startX, targetCol * cellWidth + startX),
      y: Math.max(startY, targetRow * cellHeight + startY),
    };
  }

  // Search for nearest available position in expanding rings
  for (let radius = 1; radius <= Math.max(maxCols, maxRows); radius++) {
    let nearestDist = Infinity;
    let nearestPos = null;

    // Check all positions in the current ring
    for (let dc = -radius; dc <= radius; dc++) {
      for (let dr = -radius; dr <= radius; dr++) {
        // Skip positions not on the ring edge
        if (Math.abs(dc) !== radius && Math.abs(dr) !== radius) continue;

        const col = targetCol + dc;
        const row = targetRow + dr;

        // Skip invalid positions
        if (col < 0 || row < 0 || col >= maxCols || row >= maxRows) continue;

        const key = `${col},${row}`;
        if (!occupied.has(key)) {
          // Calculate actual pixel distance
          const posX = col * cellWidth + startX;
          const posY = row * cellHeight + startY;
          const dist = Math.sqrt(Math.pow(x - posX, 2) + Math.pow(y - posY, 2));

          if (dist < nearestDist) {
            nearestDist = dist;
            nearestPos = { x: posX, y: posY };
          }
        }
      }
    }

    if (nearestPos) {
      return nearestPos;
    }
  }

  // Fallback: return original snapped position if no available spot found
  return snapToGrid(x, y);
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
