import { useMemo, useCallback } from 'react';
import { XP_ICONS } from '../../contexts/FileSystemContext';

/**
 * Shared hook for generating file/folder context menu items
 * Used by both Desktop and File Explorer for consistent behavior
 */
export function useFileContextMenu({
  // The item(s) being right-clicked
  selectedItems = [],
  selectedItem = null,

  // Available operations from FileSystemContext
  onOpen,
  onExplore,
  onCut,
  onCopy,
  onDelete,
  onRename,
  onProperties,

  // Clipboard state
  clipboard = [],
  clipboardOp = 'copy',

  // Optional: additional context
  isMultiSelect = false,
}) {
  // Get file extension
  const getFileExtension = useCallback((name) => {
    if (!name) return '';
    const dotIndex = name.lastIndexOf('.');
    return dotIndex === -1 ? '' : name.slice(dotIndex).toLowerCase();
  }, []);

  const extension = selectedItem?.name ? getFileExtension(selectedItem.name) : '';
  const isArchive = extension === '.rar' || extension === '.zip' || extension === '.7z';
  const isFolder = selectedItem?.type === 'folder' || selectedItem?.type === 'drive';

  const menuItems = useMemo(() => {
    if (!selectedItem) return [];

    // Send To submenu items
    const sendToItems = [
      {
        label: 'Compressed (Zipped) Folder',
        icon: XP_ICONS.zipFolder,
        onClick: () => console.log('Send to: Compressed folder', selectedItem.name),
      },
      {
        label: 'Desktop (create shortcut)',
        icon: XP_ICONS.desktop,
        onClick: () => console.log('Send to: Desktop shortcut', selectedItem.name),
      },
      {
        label: 'Mail Recipient',
        icon: XP_ICONS.email,
        onClick: () => console.log('Send to: Mail', selectedItem.name),
      },
      {
        label: 'Floppy (A:)',
        icon: XP_ICONS.floppy,
        onClick: () => console.log('Send to: Floppy', selectedItem.name),
      },
    ];

    const items = [];

    // Open (always first, always bold)
    items.push({
      label: 'Open',
      bold: true,
      onClick: onOpen,
    });

    // Explore (for folders)
    if (isFolder && onExplore) {
      items.push({
        label: 'Explore',
        onClick: onExplore,
      });
    }

    items.push({ type: 'divider' });

    // Archive-specific options
    if (isArchive) {
      items.push({
        label: 'Extract here...',
        icon: XP_ICONS.rar,
        onClick: () => console.log('Extract here:', selectedItem.name),
      });
    }

    // Add to archive (for any file/folder)
    items.push({
      label: 'Add to archive...',
      icon: XP_ICONS.rar,
      onClick: () => console.log('Add to archive:', selectedItem.name),
    });

    items.push({ type: 'divider' });

    // Send To submenu
    items.push({
      label: 'Send To',
      submenu: sendToItems,
    });

    items.push({ type: 'divider' });

    // Cut/Copy
    if (onCut) {
      items.push({
        label: 'Cut',
        onClick: onCut,
      });
    }
    if (onCopy) {
      items.push({
        label: 'Copy',
        onClick: onCopy,
      });
    }

    items.push({ type: 'divider' });

    // Delete
    if (onDelete) {
      items.push({
        label: 'Delete',
        onClick: onDelete,
      });
    }

    // Rename (disabled for multi-select)
    if (onRename) {
      items.push({
        label: 'Rename',
        onClick: onRename,
        disabled: isMultiSelect,
      });
    }

    items.push({ type: 'divider' });

    // Properties (always last)
    if (onProperties) {
      items.push({
        label: 'Properties',
        onClick: onProperties,
      });
    }

    return items;
  }, [
    selectedItem,
    isFolder,
    isArchive,
    isMultiSelect,
    onOpen,
    onExplore,
    onCut,
    onCopy,
    onDelete,
    onRename,
    onProperties,
  ]);

  return menuItems;
}

/**
 * Generate background context menu items (right-click on empty space)
 */
export function useBackgroundContextMenu({
  onNewFolder,
  onNewTextDoc,
  onPaste,
  onRefresh,
  onUpload,
  onSelectAll,
  onProperties,

  // Clipboard state
  clipboard = [],
}) {
  const hasClipboard = clipboard.length > 0;

  const menuItems = useMemo(() => {
    const items = [];

    // Refresh
    if (onRefresh) {
      items.push({
        label: 'Refresh',
        onClick: onRefresh,
      });
      items.push({ type: 'divider' });
    }

    // Paste
    if (onPaste) {
      items.push({
        label: 'Paste',
        onClick: onPaste,
        disabled: !hasClipboard,
      });
    }

    items.push({
      label: 'Paste Shortcut',
      disabled: true,
    });

    items.push({ type: 'divider' });

    // New submenu
    const newSubmenu = [];

    if (onNewFolder) {
      newSubmenu.push({
        label: 'Folder',
        icon: XP_ICONS.folder,
        onClick: onNewFolder,
      });
    }

    newSubmenu.push({
      label: 'Shortcut',
      icon: XP_ICONS.shortcut,
      onClick: () => console.log('Create shortcut'),
    });

    newSubmenu.push({
      label: 'Briefcase',
      icon: XP_ICONS.briefcase,
      onClick: () => console.log('Create briefcase'),
    });

    newSubmenu.push({
      label: 'Bitmap Image',
      icon: XP_ICONS.bitmap,
      onClick: () => console.log('Create bitmap image'),
    });

    if (onNewTextDoc) {
      newSubmenu.push({
        label: 'Text Document',
        icon: XP_ICONS.textDoc,
        onClick: onNewTextDoc,
      });
    }

    newSubmenu.push({
      label: 'Wave Sound',
      icon: XP_ICONS.wav,
      onClick: () => console.log('Create wave sound'),
    });

    newSubmenu.push({
      label: 'Compressed (zipped) Folder',
      icon: XP_ICONS.zipFolder,
      onClick: () => console.log('Create compressed folder'),
    });

    items.push({
      label: 'New',
      submenu: newSubmenu,
    });

    items.push({ type: 'divider' });

    // Upload (file explorer only)
    if (onUpload) {
      items.push({
        label: 'Upload Files...',
        onClick: onUpload,
      });
    }

    // Select All (file explorer only)
    if (onSelectAll) {
      items.push({
        label: 'Select All',
        onClick: onSelectAll,
      });
    }

    // Properties
    if (onProperties) {
      if (onUpload || onSelectAll) {
        items.push({ type: 'divider' });
      }
      items.push({
        label: 'Properties',
        onClick: onProperties,
      });
    }

    return items;
  }, [
    hasClipboard,
    onNewFolder,
    onNewTextDoc,
    onPaste,
    onRefresh,
    onUpload,
    onSelectAll,
    onProperties,
  ]);

  return menuItems;
}
