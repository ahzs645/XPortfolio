import { useCallback, useState, useEffect, useRef } from 'react';
import { UPDATE_ICON_POSITIONS, SET_ICONS } from '../constants/actions';
import { SYSTEM_IDS, SYSTEM_DESKTOP_ICONS } from '../../contexts/FileSystemContext';
import { convertToDesktopIcons, snapToGrid, calculateGridPositions } from '../helpers/iconUtils';

export function useIconManager({
  dispatch,
  icons,
  fileSystem,
  fsLoading,
  getFolderContents,
  getDesktopIconPositions,
  setDesktopIconPositions,
  appSettings,
  moveItem,
}) {
  const [alignToGridEnabled, setAlignToGridEnabled] = useState(true);
  const [autoArrangeEnabled, setAutoArrangeEnabled] = useState(false);
  const iconPositionsRef = useRef({});

  // Update desktop icons from file system Desktop folder + system icons
  useEffect(() => {
    if (!fsLoading && fileSystem) {
      const desktopContents = getFolderContents(SYSTEM_IDS.DESKTOP);
      const savedPositions = getDesktopIconPositions();

      // Convert file system items to icons
      const fileIcons = convertToDesktopIcons(desktopContents, appSettings, savedPositions);

      // Add system icons (My Computer, Recycle Bin) - these are not in the file system
      const systemIcons = Object.values(SYSTEM_DESKTOP_ICONS).map((sysIcon, index) => {
        const savedPos = savedPositions[sysIcon.id];
        // System icons go at the top of the desktop
        const defaultX = 10;
        const defaultY = 10 + index * 90;

        return {
          id: sysIcon.id,
          programId: sysIcon.id,
          icon: sysIcon.icon,
          title: sysIcon.name,
          fullName: sysIcon.name,
          component: appSettings[sysIcon.target]?.component,
          isFocus: false,
          x: savedPos?.x ?? defaultX,
          y: savedPos?.y ?? defaultY,
          type: 'system', // Special type - no shortcut overlay
          target: sysIcon.target,
        };
      });

      // Combine: system icons first, then file icons (offset their positions)
      const allIcons = [...systemIcons, ...fileIcons.map((icon) => ({
        ...icon,
        // If no saved position, offset below system icons
        x: savedPositions[icon.id]?.x ?? icon.x,
        y: savedPositions[icon.id]?.y ?? (icon.y + systemIcons.length * 90),
      }))];

      dispatch({ type: SET_ICONS, payload: allIcons });
    }
  }, [fsLoading, fileSystem, getFolderContents, getDesktopIconPositions, appSettings, dispatch]);

  // Save icon positions when they change (per-user)
  useEffect(() => {
    // Build positions map from current icons
    const positions = {};
    icons.forEach((icon) => {
      if (icon.x !== undefined && icon.y !== undefined) {
        positions[icon.id] = { x: icon.x, y: icon.y };
      }
    });

    // Only save if positions actually changed
    const positionsStr = JSON.stringify(positions);
    if (positionsStr !== JSON.stringify(iconPositionsRef.current) && Object.keys(positions).length > 0) {
      iconPositionsRef.current = positions;
      setDesktopIconPositions(positions);
    }
  }, [icons, setDesktopIconPositions]);

  // Update icon positions handler
  const onUpdateIconPositions = useCallback((positions) => {
    // If align to grid is enabled, snap all positions to the grid
    if (alignToGridEnabled) {
      const snappedPositions = {};
      Object.entries(positions).forEach(([id, pos]) => {
        const snapped = snapToGrid(pos.x, pos.y);
        snappedPositions[id] = snapped;
      });
      dispatch({ type: UPDATE_ICON_POSITIONS, payload: snappedPositions });
    } else {
      dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
    }
  }, [alignToGridEnabled, dispatch]);

  // Handle moving icons to a folder via drag-and-drop
  const onMoveToFolder = useCallback((iconIds, targetFolderId) => {
    if (!moveItem) return;
    for (const id of iconIds) {
      const success = moveItem(id, targetFolderId);
      if (success) {
        console.log(`Moved ${id} to folder ${targetFolderId}`);
      }
    }
  }, [moveItem]);

  // Arrange icons by name
  const handleArrangeByName = useCallback(() => {
    const sortedIcons = [...icons].sort((a, b) => {
      // System icons first (My Computer, Recycle Bin)
      if (a.type === 'system' && b.type !== 'system') return -1;
      if (a.type !== 'system' && b.type === 'system') return 1;
      // Then alphabetically by title
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    });
    const positions = calculateGridPositions(sortedIcons);
    dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
  }, [icons, dispatch]);

  // Arrange icons by size
  const handleArrangeBySize = useCallback(() => {
    const sortedIcons = [...icons].sort((a, b) => {
      // System icons first
      if (a.type === 'system' && b.type !== 'system') return -1;
      if (a.type !== 'system' && b.type === 'system') return 1;
      // Folders before files
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      // Then by size (larger first)
      return (b.size || 0) - (a.size || 0);
    });
    const positions = calculateGridPositions(sortedIcons);
    dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
  }, [icons, dispatch]);

  // Arrange icons by type
  const handleArrangeByType = useCallback(() => {
    const getTypeOrder = (icon) => {
      if (icon.type === 'system') return 0;
      if (icon.type === 'folder') return 1;
      if (icon.type === 'shortcut') return 2;
      // For files, group by extension
      const ext = icon.title?.split('.').pop()?.toLowerCase() || '';
      return ext;
    };
    const sortedIcons = [...icons].sort((a, b) => {
      const typeA = getTypeOrder(a);
      const typeB = getTypeOrder(b);
      if (typeA < typeB) return -1;
      if (typeA > typeB) return 1;
      // Same type, sort by name
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    });
    const positions = calculateGridPositions(sortedIcons);
    dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
  }, [icons, dispatch]);

  // Arrange icons by modified date
  const handleArrangeByModified = useCallback(() => {
    const sortedIcons = [...icons].sort((a, b) => {
      // System icons first
      if (a.type === 'system' && b.type !== 'system') return -1;
      if (a.type !== 'system' && b.type === 'system') return 1;
      // Then by modified date (newest first)
      return (b.dateModified || 0) - (a.dateModified || 0);
    });
    const positions = calculateGridPositions(sortedIcons);
    dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
  }, [icons, dispatch]);

  // Toggle auto arrange
  const handleAutoArrange = useCallback(() => {
    const newAutoArrange = !autoArrangeEnabled;
    setAutoArrangeEnabled(newAutoArrange);

    // If enabling auto arrange, arrange icons now
    if (newAutoArrange) {
      const sortedIcons = [...icons].sort((a, b) => {
        if (a.type === 'system' && b.type !== 'system') return -1;
        if (a.type !== 'system' && b.type === 'system') return 1;
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      });
      const positions = calculateGridPositions(sortedIcons);
      dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
    }
  }, [autoArrangeEnabled, icons, dispatch]);

  // Toggle align to grid
  const handleAlignToGrid = useCallback(() => {
    const newAlignToGrid = !alignToGridEnabled;
    setAlignToGridEnabled(newAlignToGrid);

    // If enabling align to grid, snap all icons now
    if (newAlignToGrid) {
      const positions = {};
      icons.forEach((icon) => {
        const snapped = snapToGrid(icon.x, icon.y);
        positions[icon.id] = snapped;
      });
      dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
    }
  }, [alignToGridEnabled, icons, dispatch]);

  // Refresh desktop icons
  const refreshIcons = useCallback(() => {
    const desktopContents = getFolderContents(SYSTEM_IDS.DESKTOP);
    const savedPositions = getDesktopIconPositions();
    const fileIcons = convertToDesktopIcons(desktopContents, appSettings, savedPositions);

    // Add system icons
    const systemIcons = Object.values(SYSTEM_DESKTOP_ICONS).map((sysIcon, index) => {
      const savedPos = savedPositions[sysIcon.id];
      return {
        id: sysIcon.id,
        programId: sysIcon.id,
        icon: sysIcon.icon,
        title: sysIcon.name,
        fullName: sysIcon.name,
        component: appSettings[sysIcon.target]?.component,
        isFocus: false,
        x: savedPos?.x ?? 10,
        y: savedPos?.y ?? (10 + index * 90),
        type: 'system',
        target: sysIcon.target,
      };
    });

    const allIcons = [...systemIcons, ...fileIcons.map((icon) => ({
      ...icon,
      x: savedPositions[icon.id]?.x ?? icon.x,
      y: savedPositions[icon.id]?.y ?? (icon.y + systemIcons.length * 90),
    }))];

    dispatch({ type: SET_ICONS, payload: allIcons });
  }, [getFolderContents, getDesktopIconPositions, appSettings, dispatch]);

  return {
    alignToGridEnabled,
    autoArrangeEnabled,
    onUpdateIconPositions,
    onMoveToFolder,
    handleArrangeByName,
    handleArrangeBySize,
    handleArrangeByType,
    handleArrangeByModified,
    handleAutoArrange,
    handleAlignToGrid,
    refreshIcons,
  };
}

export default useIconManager;
