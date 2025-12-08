import { useState, useCallback, useEffect, useMemo } from 'react';
import { ADD_APP } from '../constants/actions';
import { SYSTEM_IDS } from '../../contexts/FileSystemContext';
import { createArchive, extractArchive } from '../../utils/archiveUtils';

/**
 * Hook for handling desktop and icon context menu state and actions
 */
export function useContextMenuActions({
  dispatch,
  icons,
  appSettings,
  fileSystem,
  createItem,
  createFile,
  renameItem,
  moveToRecycleBin,
  copy,
  cut,
  paste,
  clipboard,
  clipboardOp,
  getFileContent,
  pinToStartMenu,
  unpinFromStartMenu,
  isAppPinnedToStartMenu,
  addToStartup,
  removeFromStartup,
  isInStartup,
  onDoubleClickIcon,
  refreshIcons,
}) {
  const [desktopContextMenu, setDesktopContextMenu] = useState(null);
  const [iconContextMenu, setIconContextMenu] = useState(null);
  const [renamingIconId, setRenamingIconId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // Desktop context menu handler
  const onDesktopContextMenu = useCallback((e) => {
    if (e.target === e.currentTarget || e.target.closest('[data-desktop-area]')) {
      e.preventDefault();
      setIconContextMenu(null);
      setDesktopContextMenu({
        x: e.clientX,
        y: e.clientY,
      });
    }
  }, []);

  // Icon context menu handler
  const onIconContextMenu = useCallback((e, icon) => {
    e.preventDefault();
    setDesktopContextMenu(null);
    setIconContextMenu({
      x: e.clientX,
      y: e.clientY,
      icon,
    });
  }, []);

  // Close menus when clicking elsewhere
  useEffect(() => {
    if (desktopContextMenu) {
      const handleClick = () => setDesktopContextMenu(null);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [desktopContextMenu]);

  useEffect(() => {
    if (iconContextMenu) {
      const handleClick = () => setIconContextMenu(null);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [iconContextMenu]);

  // Desktop menu action handler
  const handleDesktopMenuAction = useCallback(async (action) => {
    setDesktopContextMenu(null);
    switch (action) {
      case 'newFolder': {
        const id = await createItem(SYSTEM_IDS.DESKTOP, 'New Folder', 'folder');
        if (id) {
          setTimeout(() => {
            setRenamingIconId(id);
            setRenameValue('New Folder');
          }, 100);
        }
        break;
      }
      case 'newBriefcase': {
        const id = await createItem(SYSTEM_IDS.DESKTOP, 'New Briefcase', 'folder', { icon: '/icons/xp/Briefcase.png' });
        if (id) {
          setTimeout(() => {
            setRenamingIconId(id);
            setRenameValue('New Briefcase');
          }, 100);
        }
        break;
      }
      case 'newTextDoc': {
        const id = await createItem(SYSTEM_IDS.DESKTOP, 'New Text Document.txt', 'file');
        if (id) {
          setTimeout(() => {
            setRenamingIconId(id);
            setRenameValue('New Text Document.txt');
          }, 100);
        }
        break;
      }
      case 'paste':
        await paste(SYSTEM_IDS.DESKTOP);
        break;
      case 'refresh':
        refreshIcons();
        break;
      case 'properties':
        dispatch({ type: ADD_APP, payload: appSettings['Display Properties'] });
        break;
      case 'newShortcut':
        dispatch({ type: ADD_APP, payload: appSettings['Create Shortcut'] });
        break;
      default:
        console.log('Desktop action:', action);
    }
  }, [createItem, paste, refreshIcons, dispatch, appSettings]);

  // Icon menu action handler
  const handleIconMenuAction = useCallback(async (action) => {
    const icon = iconContextMenu?.icon;
    setIconContextMenu(null);
    if (!icon) return;

    // Get all selected icons or just the right-clicked one
    const selectedIconIds = icons.filter(i => i.isFocus).map(i => i.id);
    const targetIds = selectedIconIds.length > 0 ? selectedIconIds : [icon.id];

    switch (action) {
      case 'open':
        onDoubleClickIcon(icon);
        break;
      case 'explore':
        if (icon.type === 'folder') {
          const myComputerSetting = {
            ...appSettings['My Computer'],
            injectProps: {
              initialPath: icon.id,
            },
          };
          dispatch({ type: ADD_APP, payload: myComputerSetting });
        } else {
          onDoubleClickIcon(icon);
        }
        break;
      case 'cut':
        cut(targetIds);
        break;
      case 'copy':
        copy(targetIds);
        break;
      case 'delete':
        for (const id of targetIds) {
          moveToRecycleBin(id);
        }
        break;
      case 'rename': {
        const item = fileSystem?.[icon.id];
        if (item) {
          setRenamingIconId(icon.id);
          setRenameValue(item.name);
        }
        break;
      }
      case 'addToArchive': {
        try {
          const { blob, filename } = await createArchive(fileSystem, targetIds, getFileContent);
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          await createFile(SYSTEM_IDS.DESKTOP, filename, {
            data: dataUrl,
            size: blob.size,
            type: 'application/zip',
          });
        } catch (error) {
          console.error('Failed to create archive:', error);
        }
        break;
      }
      case 'extractHere': {
        try {
          const fileItem = fileSystem?.[icon.id];
          if (fileItem) {
            const content = await getFileContent(icon.id);
            if (content) {
              const parentFolder = fileItem.parent || SYSTEM_IDS.DESKTOP;
              await extractArchive(content, fileSystem, parentFolder, createItem, createFile);
            }
          }
        } catch (error) {
          console.error('Failed to extract archive:', error);
        }
        break;
      }
      case 'properties': {
        if (icon.target === 'My Computer' || icon.title === 'My Computer') {
          dispatch({ type: ADD_APP, payload: appSettings['System Properties'] });
        } else {
          const propName = icon.fullName || icon.title;
          const propertiesSetting = {
            ...appSettings['Properties'],
            header: {
              ...appSettings['Properties'].header,
              title: `${propName} Properties`,
            },
            injectProps: {
              itemId: icon.id,
              itemData: {
                id: icon.id,
                name: propName,
                type: icon.type || 'shortcut',
                icon: icon.icon,
                target: icon.target,
                size: icon.size || 90,
                dateCreated: icon.dateCreated || Date.now(),
                dateModified: icon.dateModified || Date.now(),
              },
            },
          };
          dispatch({ type: ADD_APP, payload: propertiesSetting });
        }
        break;
      }
      case 'pinToStartMenu': {
        if (icon.type === 'shortcut' && icon.target) {
          pinToStartMenu(icon.target, {
            name: icon.title,
            icon: icon.icon,
          });
        }
        break;
      }
      case 'unpinFromStartMenu': {
        if (icon.type === 'shortcut' && icon.target) {
          unpinFromStartMenu(icon.target);
        }
        break;
      }
      case 'addToStartup': {
        if (icon.type === 'shortcut' && icon.target) {
          addToStartup(icon.target, {
            name: icon.title,
            icon: icon.icon,
          });
        }
        break;
      }
      case 'removeFromStartup': {
        if (icon.type === 'shortcut' && icon.target) {
          removeFromStartup(icon.target);
        }
        break;
      }
      default:
        console.log('Icon action:', action);
    }
  }, [iconContextMenu, icons, fileSystem, appSettings, dispatch, onDoubleClickIcon, copy, cut, moveToRecycleBin, getFileContent, createFile, createItem, pinToStartMenu, unpinFromStartMenu, addToStartup, removeFromStartup]);

  // Handle rename submission
  const handleIconRenameSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    if (renamingIconId && renameValue.trim()) {
      renameItem(renamingIconId, renameValue.trim());
    }
    setRenamingIconId(null);
    setRenameValue('');
  }, [renamingIconId, renameValue, renameItem]);

  const handleIconRenameCancel = useCallback(() => {
    setRenamingIconId(null);
    setRenameValue('');
  }, []);

  // Get the selected item for context menu
  const iconContextMenuItem = useMemo(() => {
    if (!iconContextMenu?.icon) return null;
    const icon = iconContextMenu.icon;
    return {
      id: icon.id,
      name: icon.title,
      type: icon.type,
      icon: icon.icon,
      target: icon.target,
    };
  }, [iconContextMenu?.icon]);

  const selectedIconCount = icons.filter(i => i.isFocus).length;

  // Check if the selected icon is a system icon
  const isSystemIcon = iconContextMenuItem?.type === 'system';
  const isMyComputerIcon = iconContextMenuItem?.target === 'My Computer' || iconContextMenuItem?.name === 'My Computer';
  const isRecycleBinIcon = iconContextMenuItem?.target === 'Recycle Bin' || iconContextMenuItem?.name === 'Recycle Bin';

  // Check if the icon is pinned to start menu or in startup
  const isIconPinnedToStartMenu = iconContextMenuItem?.target
    ? isAppPinnedToStartMenu(iconContextMenuItem.target)
    : false;
  const isIconInStartup = iconContextMenuItem?.target
    ? isInStartup(iconContextMenuItem.target)
    : false;
  const isShortcutIcon = iconContextMenuItem?.type === 'shortcut';

  const closeIconContextMenu = useCallback(() => setIconContextMenu(null), []);

  return {
    desktopContextMenu,
    setDesktopContextMenu,
    iconContextMenu,
    setIconContextMenu,
    renamingIconId,
    renameValue,
    setRenameValue,
    onDesktopContextMenu,
    onIconContextMenu,
    handleDesktopMenuAction,
    handleIconMenuAction,
    handleIconRenameSubmit,
    handleIconRenameCancel,
    closeIconContextMenu,
    iconContextMenuItem,
    selectedIconCount,
    isSystemIcon,
    isMyComputerIcon,
    isRecycleBinIcon,
    isIconPinnedToStartMenu,
    isIconInStartup,
    isShortcutIcon,
    clipboard,
    clipboardOp,
  };
}

export default useContextMenuActions;
