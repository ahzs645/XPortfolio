import { useCallback, useState, useEffect, useRef } from 'react';
import { UPDATE_ICON_POSITIONS, SET_ICONS } from '../constants/actions';
import { SYSTEM_IDS, SYSTEM_DESKTOP_ICONS } from '../../contexts/FileSystemContext';
import {
  convertToDesktopIcons,
  ICON_GRID,
  getPixelPositionFromIndex,
  getGridIndexFromPosition,
  findNearestAvailableIndex,
} from '../helpers/iconUtils';

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
  const iconIndicesRef = useRef({});
  const [, _ForceUpdate] = useState(0); // For triggering re-renders on resize

  // Update desktop icons from file system Desktop folder + system icons
  useEffect(() => {
    if (!fsLoading && fileSystem) {
      const desktopContents = getFolderContents(SYSTEM_IDS.DESKTOP);
      const savedIndices = getDesktopIconPositions(); // Now stores gridIndex

      // Convert file system items to icons
      const fileIcons = convertToDesktopIcons(desktopContents, appSettings, {});

      // Build occupied indices map
      const occupiedIndices = {};

      // Add system icons (My Computer, Recycle Bin) - these are not in the file system
      const systemIcons = Object.values(SYSTEM_DESKTOP_ICONS).map((sysIcon, index) => {
        // System icons get indices 0, 1, 2, etc. by default
        const savedIndex = savedIndices[sysIcon.id];
        const gridIndex = savedIndex?.gridIndex ?? index;
        occupiedIndices[sysIcon.id] = gridIndex;

        const pos = getPixelPositionFromIndex(gridIndex);

        return {
          id: sysIcon.id,
          programId: sysIcon.id,
          icon: sysIcon.icon,
          title: sysIcon.name,
          fullName: sysIcon.name,
          component: appSettings[sysIcon.target]?.component,
          isFocus: false,
          x: pos.x,
          y: pos.y,
          gridIndex,
          type: 'system',
          target: sysIcon.target,
        };
      });

      // Assign grid indices to file icons
      const systemCount = systemIcons.length;
      const fileIconsWithIndex = fileIcons.map((icon, index) => {
        const savedIndex = savedIndices[icon.id];
        let gridIndex;

        if (savedIndex?.gridIndex !== undefined) {
          gridIndex = savedIndex.gridIndex;
        } else {
          // Default: place after system icons
          gridIndex = systemCount + index;
        }

        // Find available index if occupied
        gridIndex = findNearestAvailableIndex(gridIndex, occupiedIndices, icon.id);
        occupiedIndices[icon.id] = gridIndex;

        const pos = getPixelPositionFromIndex(gridIndex);

        return {
          ...icon,
          x: pos.x,
          y: pos.y,
          gridIndex,
        };
      });

      const allIcons = [...systemIcons, ...fileIconsWithIndex];
      dispatch({ type: SET_ICONS, payload: allIcons });
    }
  }, [fsLoading, fileSystem, getFolderContents, getDesktopIconPositions, appSettings, dispatch]);

  // Save icon grid indices when they change (per-user)
  useEffect(() => {
    const indices = {};
    icons.forEach((icon) => {
      if (icon.gridIndex !== undefined) {
        indices[icon.id] = { gridIndex: icon.gridIndex };
      }
    });

    const indicesStr = JSON.stringify(indices);
    if (indicesStr !== JSON.stringify(iconIndicesRef.current) && Object.keys(indices).length > 0) {
      iconIndicesRef.current = indices;
      setDesktopIconPositions(indices);
    }
  }, [icons, setDesktopIconPositions]);

  // Handle window resize - recalculate pixel positions from grid indices
  useEffect(() => {
    const handleResize = () => {
      if (icons.length === 0) return;

      // Recalculate pixel positions from grid indices
      const updates = {};
      icons.forEach((icon) => {
        if (icon.gridIndex !== undefined) {
          const pos = getPixelPositionFromIndex(icon.gridIndex);
          if (pos.x !== icon.x || pos.y !== icon.y) {
            updates[icon.id] = { x: pos.x, y: pos.y };
          }
        }
      });

      if (Object.keys(updates).length > 0) {
        dispatch({ type: UPDATE_ICON_POSITIONS, payload: updates });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [icons, dispatch]);

  // Update icon positions handler - converts pixel positions to grid indices
  const onUpdateIconPositions = useCallback((positions) => {
    // Build current occupied indices map
    const occupiedIndices = {};
    icons.forEach((icon) => {
      if (icon.gridIndex !== undefined) {
        occupiedIndices[icon.id] = icon.gridIndex;
      }
    });

    const updates = {};

    Object.entries(positions).forEach(([id, pos]) => {
      // Convert pixel position to grid index
      let targetIndex = getGridIndexFromPosition(pos.x, pos.y);

      if (alignToGridEnabled) {
        // Find nearest available index
        targetIndex = findNearestAvailableIndex(targetIndex, occupiedIndices, id);
      }

      // Update occupied indices for next iteration
      occupiedIndices[id] = targetIndex;

      // Calculate pixel position from grid index
      const pixelPos = getPixelPositionFromIndex(targetIndex);

      updates[id] = {
        x: pixelPos.x,
        y: pixelPos.y,
        gridIndex: targetIndex,
      };
    });

    dispatch({ type: UPDATE_ICON_POSITIONS, payload: updates });
  }, [alignToGridEnabled, icons, dispatch]);

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
      if (a.type === 'system' && b.type !== 'system') return -1;
      if (a.type !== 'system' && b.type === 'system') return 1;
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    });

    const updates = {};
    sortedIcons.forEach((icon, index) => {
      const pos = getPixelPositionFromIndex(index);
      updates[icon.id] = { x: pos.x, y: pos.y, gridIndex: index };
    });

    dispatch({ type: UPDATE_ICON_POSITIONS, payload: updates });
  }, [icons, dispatch]);

  // Arrange icons by size
  const handleArrangeBySize = useCallback(() => {
    const sortedIcons = [...icons].sort((a, b) => {
      if (a.type === 'system' && b.type !== 'system') return -1;
      if (a.type !== 'system' && b.type === 'system') return 1;
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return (b.size || 0) - (a.size || 0);
    });

    const updates = {};
    sortedIcons.forEach((icon, index) => {
      const pos = getPixelPositionFromIndex(index);
      updates[icon.id] = { x: pos.x, y: pos.y, gridIndex: index };
    });

    dispatch({ type: UPDATE_ICON_POSITIONS, payload: updates });
  }, [icons, dispatch]);

  // Arrange icons by type
  const handleArrangeByType = useCallback(() => {
    const getTypeOrder = (icon) => {
      if (icon.type === 'system') return 0;
      if (icon.type === 'folder') return 1;
      if (icon.type === 'shortcut') return 2;
      const ext = icon.title?.split('.').pop()?.toLowerCase() || '';
      return ext;
    };

    const sortedIcons = [...icons].sort((a, b) => {
      const typeA = getTypeOrder(a);
      const typeB = getTypeOrder(b);
      if (typeA < typeB) return -1;
      if (typeA > typeB) return 1;
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    });

    const updates = {};
    sortedIcons.forEach((icon, index) => {
      const pos = getPixelPositionFromIndex(index);
      updates[icon.id] = { x: pos.x, y: pos.y, gridIndex: index };
    });

    dispatch({ type: UPDATE_ICON_POSITIONS, payload: updates });
  }, [icons, dispatch]);

  // Arrange icons by modified date
  const handleArrangeByModified = useCallback(() => {
    const sortedIcons = [...icons].sort((a, b) => {
      if (a.type === 'system' && b.type !== 'system') return -1;
      if (a.type !== 'system' && b.type === 'system') return 1;
      return (b.dateModified || 0) - (a.dateModified || 0);
    });

    const updates = {};
    sortedIcons.forEach((icon, index) => {
      const pos = getPixelPositionFromIndex(index);
      updates[icon.id] = { x: pos.x, y: pos.y, gridIndex: index };
    });

    dispatch({ type: UPDATE_ICON_POSITIONS, payload: updates });
  }, [icons, dispatch]);

  // Toggle auto arrange
  const handleAutoArrange = useCallback(() => {
    const newAutoArrange = !autoArrangeEnabled;
    setAutoArrangeEnabled(newAutoArrange);

    if (newAutoArrange) {
      handleArrangeByName();
    }
  }, [autoArrangeEnabled, handleArrangeByName]);

  // Toggle align to grid
  const handleAlignToGrid = useCallback(() => {
    const newAlignToGrid = !alignToGridEnabled;
    setAlignToGridEnabled(newAlignToGrid);

    // If enabling, re-snap all icons to proper grid positions
    if (newAlignToGrid) {
      const occupiedIndices = {};
      const updates = {};

      icons.forEach((icon) => {
        let gridIndex = icon.gridIndex ?? getGridIndexFromPosition(icon.x, icon.y);
        gridIndex = findNearestAvailableIndex(gridIndex, occupiedIndices, icon.id);
        occupiedIndices[icon.id] = gridIndex;

        const pos = getPixelPositionFromIndex(gridIndex);
        updates[icon.id] = { x: pos.x, y: pos.y, gridIndex };
      });

      dispatch({ type: UPDATE_ICON_POSITIONS, payload: updates });
    }
  }, [alignToGridEnabled, icons, dispatch]);

  // Refresh desktop icons
  const refreshIcons = useCallback(() => {
    const desktopContents = getFolderContents(SYSTEM_IDS.DESKTOP);
    const savedIndices = getDesktopIconPositions();
    const fileIcons = convertToDesktopIcons(desktopContents, appSettings, {});

    const occupiedIndices = {};

    const systemIcons = Object.values(SYSTEM_DESKTOP_ICONS).map((sysIcon, index) => {
      const savedIndex = savedIndices[sysIcon.id];
      const gridIndex = savedIndex?.gridIndex ?? index;
      occupiedIndices[sysIcon.id] = gridIndex;
      const pos = getPixelPositionFromIndex(gridIndex);

      return {
        id: sysIcon.id,
        programId: sysIcon.id,
        icon: sysIcon.icon,
        title: sysIcon.name,
        fullName: sysIcon.name,
        component: appSettings[sysIcon.target]?.component,
        isFocus: false,
        x: pos.x,
        y: pos.y,
        gridIndex,
        type: 'system',
        target: sysIcon.target,
      };
    });

    const systemCount = systemIcons.length;
    const fileIconsWithIndex = fileIcons.map((icon, index) => {
      const savedIndex = savedIndices[icon.id];
      let gridIndex = savedIndex?.gridIndex ?? (systemCount + index);
      gridIndex = findNearestAvailableIndex(gridIndex, occupiedIndices, icon.id);
      occupiedIndices[icon.id] = gridIndex;
      const pos = getPixelPositionFromIndex(gridIndex);

      return {
        ...icon,
        x: pos.x,
        y: pos.y,
        gridIndex,
      };
    });

    const allIcons = [...systemIcons, ...fileIconsWithIndex];
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
