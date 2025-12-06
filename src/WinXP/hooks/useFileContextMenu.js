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
  onSearch,
  onCut,
  onCopy,
  onDelete,
  onRename,
  onProperties,

  // Archive operations
  onAddToArchive,
  onExtractHere,

  // Clipboard state
  clipboard = [],
  clipboardOp = 'copy',

  // Optional: additional context
  isMultiSelect = false,
  isMyComputer = false,
  isRecycleBin = false,
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
  const isFile = selectedItem?.type === 'file';

  const menuItems = useMemo(() => {
    if (!selectedItem) return [];

    const items = [];

    // My Computer specific menu
    if (isMyComputer) {
      items.push({
        label: 'Open',
        bold: true,
        onClick: onOpen,
      });

      items.push({
        label: 'Explore',
        onClick: onExplore || onOpen,
      });

      items.push({
        label: 'Search...',
        disabled: true,
      });

      items.push({ type: 'divider' });

      items.push({
        label: 'Manage',
        disabled: true,
      });

      items.push({ type: 'divider' });

      items.push({
        label: 'Map Network Drive...',
        disabled: true,
      });

      items.push({
        label: 'Disconnect Network Drive...',
        disabled: true,
      });

      items.push({ type: 'divider' });

      if (onProperties) {
        items.push({
          label: 'Properties',
          onClick: onProperties,
        });
      }

      return items;
    }

    // Recycle Bin specific menu
    if (isRecycleBin) {
      items.push({
        label: 'Open',
        bold: true,
        onClick: onOpen,
      });

      items.push({
        label: 'Explore',
        onClick: onExplore || onOpen,
      });

      items.push({ type: 'divider' });

      items.push({
        label: 'Empty Recycle Bin',
        disabled: true,
      });

      items.push({ type: 'divider' });

      if (onProperties) {
        items.push({
          label: 'Properties',
          onClick: onProperties,
        });
      }

      return items;
    }

    // Folder context menu
    if (isFolder) {
      items.push({
        label: 'Open',
        bold: true,
        onClick: onOpen,
      });

      if (onExplore) {
        items.push({
          label: 'Explore',
          onClick: onExplore,
        });
      }

      items.push({
        label: 'Search...',
        disabled: true,
      });

      items.push({ type: 'divider' });

      // WinRAR options for folders
      if (onAddToArchive) {
        items.push({
          label: 'Add to archive...',
          icon: XP_ICONS.rar,
          onClick: onAddToArchive,
        });

        items.push({
          label: `Add to "${selectedItem?.name || 'folder'}.zip"`,
          icon: XP_ICONS.rar,
          onClick: onAddToArchive,
        });

        items.push({ type: 'divider' });
      }

      items.push({
        label: 'Sharing and Security...',
        disabled: true,
      });

      items.push({ type: 'divider' });

      // Send To submenu
      const sendToItems = [
        {
          label: 'Desktop (create shortcut)',
          onClick: () => console.log('Send to: Desktop shortcut', selectedItem.name),
        },
        {
          label: 'My Documents',
          disabled: true,
        },
        {
          label: '3½ Floppy (A:)',
          disabled: true,
        },
        {
          label: 'Mail Recipient',
          disabled: true,
        },
        {
          label: 'Compressed (zipped) Folder',
          icon: XP_ICONS.zipFolder,
          onClick: onAddToArchive,
        },
      ];

      items.push({
        label: 'Send To',
        submenu: sendToItems,
      });

      items.push({ type: 'divider' });

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

      if (onDelete) {
        items.push({
          label: 'Delete',
          onClick: onDelete,
        });
      }

      if (onRename) {
        items.push({
          label: 'Rename',
          onClick: onRename,
          disabled: isMultiSelect,
        });
      }

      items.push({ type: 'divider' });

      if (onProperties) {
        items.push({
          label: 'Properties',
          onClick: onProperties,
        });
      }

      return items;
    }

    // File context menu
    if (isFile) {
      items.push({
        label: 'Open',
        bold: true,
        onClick: onOpen,
      });

      items.push({
        label: 'Open Containing Folder',
        disabled: true,
      });

      items.push({ type: 'divider' });

      // Archive-specific options (for .zip, .rar, .7z files)
      if (isArchive && onExtractHere) {
        items.push({
          label: 'Extract files...',
          icon: XP_ICONS.rar,
          onClick: onExtractHere,
        });

        items.push({
          label: 'Extract Here',
          icon: XP_ICONS.rar,
          onClick: onExtractHere,
        });

        items.push({
          label: `Extract to "${selectedItem?.name?.replace(/\.[^/.]+$/, '') || 'folder'}/"`,
          icon: XP_ICONS.rar,
          onClick: onExtractHere,
        });

        items.push({ type: 'divider' });
      }

      // WinRAR options for non-archive files
      if (onAddToArchive) {
        items.push({
          label: 'Add to archive...',
          icon: XP_ICONS.rar,
          onClick: onAddToArchive,
        });

        items.push({
          label: `Add to "${selectedItem?.name || 'file'}.zip"`,
          icon: XP_ICONS.rar,
          onClick: onAddToArchive,
        });

        items.push({ type: 'divider' });
      }

      // Send To submenu for files
      const sendToItems = [
        {
          label: 'Desktop (create shortcut)',
          onClick: () => console.log('Send to: Desktop shortcut', selectedItem.name),
        },
        {
          label: 'My Documents',
          disabled: true,
        },
        {
          label: '3½ Floppy (A:)',
          disabled: true,
        },
        {
          label: 'Mail Recipient',
          disabled: true,
        },
        {
          label: 'Compressed (zipped) Folder',
          icon: XP_ICONS.zipFolder,
          onClick: onAddToArchive,
        },
      ];

      items.push({
        label: 'Send To',
        submenu: sendToItems,
      });

      items.push({ type: 'divider' });

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

      if (onDelete) {
        items.push({
          label: 'Delete',
          onClick: onDelete,
        });
      }

      if (onRename) {
        items.push({
          label: 'Rename',
          onClick: onRename,
          disabled: isMultiSelect,
        });
      }

      items.push({ type: 'divider' });

      if (onProperties) {
        items.push({
          label: 'Properties',
          onClick: onProperties,
        });
      }

      return items;
    }

    // Default/shortcut context menu (for desktop shortcuts)
    items.push({
      label: 'Open',
      bold: true,
      onClick: onOpen,
    });

    if (isFolder && onExplore) {
      items.push({
        label: 'Explore',
        onClick: onExplore,
      });
    }

    items.push({ type: 'divider' });

    // WinRAR options
    if (onAddToArchive) {
      items.push({
        label: 'Add to archive...',
        icon: XP_ICONS.rar,
        onClick: onAddToArchive,
      });

      items.push({
        label: `Add to "${selectedItem?.name || 'item'}.zip"`,
        icon: XP_ICONS.rar,
        onClick: onAddToArchive,
      });

      items.push({ type: 'divider' });
    }

    // Send To submenu
    const sendToItems = [
      {
        label: 'Desktop (create shortcut)',
        onClick: () => console.log('Send to: Desktop shortcut', selectedItem.name),
      },
      {
        label: 'Compressed (zipped) Folder',
        icon: XP_ICONS.zipFolder,
        onClick: onAddToArchive,
      },
    ];

    items.push({
      label: 'Send To',
      submenu: sendToItems,
    });

    items.push({ type: 'divider' });

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

    if (onDelete) {
      items.push({
        label: 'Delete',
        onClick: onDelete,
      });
    }

    if (onRename) {
      items.push({
        label: 'Rename',
        onClick: onRename,
        disabled: isMultiSelect,
      });
    }

    items.push({ type: 'divider' });

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
    isFile,
    isArchive,
    isMultiSelect,
    isMyComputer,
    isRecycleBin,
    onOpen,
    onExplore,
    onCut,
    onCopy,
    onDelete,
    onRename,
    onProperties,
    onAddToArchive,
    onExtractHere,
  ]);

  return menuItems;
}

/**
 * Generate background context menu items (right-click on empty space)
 */
export function useBackgroundContextMenu({
  onNewFolder,
  onNewTextDoc,
  onNewRichTextDoc,
  onNewBitmapImage,
  onPaste,
  onRefresh,
  onUpload,
  onSelectAll,
  onProperties,

  // Arrange icons handlers
  onArrangeByName,
  onArrangeBySize,
  onArrangeByType,
  onArrangeByModified,
  onAutoArrange,
  onAlignToGrid,
  autoArrangeEnabled = false,
  alignToGridEnabled = true,

  // Clipboard state
  clipboard = [],
}) {
  const hasClipboard = clipboard.length > 0;

  const menuItems = useMemo(() => {
    const items = [];

    // Arrange Icons By submenu
    const arrangeIconsSubmenu = [
      {
        label: 'Name',
        onClick: onArrangeByName,
      },
      {
        label: 'Size',
        onClick: onArrangeBySize,
      },
      {
        label: 'Type',
        onClick: onArrangeByType,
      },
      {
        label: 'Modified',
        onClick: onArrangeByModified,
      },
      { type: 'divider' },
      {
        label: 'Auto Arrange',
        onClick: onAutoArrange,
        checked: autoArrangeEnabled,
      },
      {
        label: 'Align to Grid',
        onClick: onAlignToGrid,
        checked: alignToGridEnabled,
      },
    ];

    items.push({
      label: 'Arrange Icons By',
      submenu: arrangeIconsSubmenu,
    });

    // Refresh
    if (onRefresh) {
      items.push({
        label: 'Refresh',
        onClick: onRefresh,
      });
    }

    items.push({ type: 'divider' });

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

    newSubmenu.push({ type: 'divider' });

    if (onNewTextDoc) {
      newSubmenu.push({
        label: 'Text Document',
        icon: XP_ICONS.textDoc,
        onClick: onNewTextDoc,
      });
    }

    newSubmenu.push({
      label: 'Rich Text Document',
      icon: XP_ICONS.textDoc,
      onClick: onNewRichTextDoc,
      disabled: !onNewRichTextDoc,
    });

    newSubmenu.push({
      label: 'Bitmap Image',
      icon: XP_ICONS.bitmap,
      onClick: onNewBitmapImage,
      disabled: !onNewBitmapImage,
    });

    newSubmenu.push({ type: 'divider' });

    // Upload (file explorer only)
    if (onUpload) {
      newSubmenu.push({
        label: 'Upload',
        onClick: onUpload,
      });
    }

    items.push({
      label: 'New',
      submenu: newSubmenu,
    });

    items.push({ type: 'divider' });

    // Properties
    if (onProperties) {
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
    onNewRichTextDoc,
    onNewBitmapImage,
    onPaste,
    onRefresh,
    onUpload,
    onSelectAll,
    onProperties,
    onArrangeByName,
    onArrangeBySize,
    onArrangeByType,
    onArrangeByModified,
    onAutoArrange,
    onAlignToGrid,
    autoArrangeEnabled,
    alignToGridEnabled,
  ]);

  return menuItems;
}
