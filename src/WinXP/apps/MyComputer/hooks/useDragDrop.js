import { useState, useCallback, useRef } from 'react';
import { parseDroppedFiles } from '../../../../utils/fileDropParser';

/**
 * Hook for managing drag and drop operations
 * Handles both internal file movement and external file uploads
 */
export function useDragDrop({
  currentFolder,
  currentFolderData,
  selectedItems,
  createItem,
  moveItem,
  isFileDropUploadEnabled,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [draggingItems, setDraggingItems] = useState(null); // Array of item IDs being dragged
  const [dropTargetId, setDropTargetId] = useState(null); // Folder being hovered during drag
  const isDraggingInternalRef = useRef(false); // Sync ref for drag state
  const fileInputRef = useRef(null);

  // File upload handlers (for external files dragged from computer or cross-window)
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Don't show overlay for internal drags within this window
    if (isDraggingInternalRef.current) return;

    // Allow cross-window file system item drops (from other explorer windows or desktop)
    const hasXPortfolioItems = e.dataTransfer?.types?.includes('application/x-xportfolio-items');
    const hasDesktopIcon = e.dataTransfer?.types?.includes('application/x-desktop-icon');
    if (hasXPortfolioItems || hasDesktopIcon) {
      e.dataTransfer.dropEffect = 'move';
      return;
    }

    // Show upload overlay only for external file uploads
    if (!isFileDropUploadEnabled()) return;
    const hasExternalFiles = e.dataTransfer?.types?.includes('Files');
    if (hasExternalFiles) {
      setIsDragOver(true);
    }
  }, [isFileDropUploadEnabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // If this is an internal drag within this window, don't handle here
    if (isDraggingInternalRef.current) return;

    if (currentFolderData?.type === 'file') return;

    // Check for cross-window file system item drops (from desktop or other file explorer)
    const xportfolioData = e.dataTransfer.getData('application/x-xportfolio-items');
    if (xportfolioData && moveItem) {
      try {
        const itemIds = JSON.parse(xportfolioData);
        for (const itemId of itemIds) {
          moveItem(itemId, currentFolder);
        }
      } catch (error) {
        console.error('Error moving items:', error);
      }
      return;
    }

    // Handle external file uploads
    if (!isFileDropUploadEnabled()) return;

    try {
      const files = await parseDroppedFiles(e);
      if (files.length === 0) return;

      setUploadProgress({ current: 0, total: files.length, fileName: files[0].name });

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i, total: files.length, fileName: file.name });
        await createItem(currentFolder, file.name, 'file', file.fileObject);
      }

      setUploadProgress(null);
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadProgress(null);
    }
  }, [currentFolder, currentFolderData, createItem, isFileDropUploadEnabled, moveItem]);

  const handleFileInputChange = useCallback(async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadProgress({ current: 0, total: files.length, fileName: files[0].name });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i, total: files.length, fileName: file.name });
      await createItem(currentFolder, file.name, 'file', file);
    }

    setUploadProgress(null);
    e.target.value = '';
  }, [currentFolder, createItem]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Internal drag-and-drop handlers (moving files to folders)
  const handleItemDragStart = useCallback((e, item) => {
    // Mark as internal drag immediately (sync, before React state update)
    isDraggingInternalRef.current = true;

    // Determine which items to drag (selected items or just this one)
    const itemsToDrag = selectedItems.includes(item.id) && selectedItems.length > 0
      ? selectedItems
      : [item.id];

    setDraggingItems(itemsToDrag);

    // Set drag data with consistent MIME type for cross-window support
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('application/x-xportfolio-items', JSON.stringify(itemsToDrag));

    // Also set data for Quick Launch bar drops
    const dragData = {
      id: item.id,
      title: item.name,
      icon: item.icon,
      appName: item.name,
      type: item.type,
      path: item.path,
    };
    e.dataTransfer.setData('application/x-desktop-icon', JSON.stringify(dragData));
    e.dataTransfer.setData('text/plain', item.name);

    // Create a custom drag image (optional)
    if (e.dataTransfer.setDragImage && e.target) {
      e.dataTransfer.setDragImage(e.target, 40, 40);
    }
  }, [selectedItems]);

  const handleItemDragEnd = useCallback(() => {
    isDraggingInternalRef.current = false;
    setDraggingItems(null);
    setDropTargetId(null);
  }, []);

  const handleItemDragOver = useCallback((e, item) => {
    e.preventDefault();
    e.stopPropagation();

    // Only allow dropping on folders
    if (item.type !== 'folder') return;

    // Don't allow dropping on itself or an item being dragged
    if (draggingItems?.includes(item.id)) return;

    e.dataTransfer.dropEffect = 'move';
    setDropTargetId(item.id);
  }, [draggingItems]);

  // Handle drops from desktop icons onto folders in explorer
  const handleItemDropFromDesktop = useCallback((e, targetFolder) => {
    // Only allow dropping on folders
    if (targetFolder.type !== 'folder') return;

    const xportfolioData = e.dataTransfer.getData('application/x-xportfolio-items');
    if (xportfolioData && moveItem) {
      try {
        const itemIds = JSON.parse(xportfolioData);
        for (const itemId of itemIds) {
          moveItem(itemId, targetFolder.id);
        }
      } catch (error) {
        console.error('Error moving desktop items to folder:', error);
      }
      return true;
    }
    return false;
  }, [moveItem]);

  const handleItemDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if we're actually leaving the item
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropTargetId(null);
    }
  }, []);

  const handleItemDrop = useCallback((e, targetFolder) => {
    e.preventDefault();
    e.stopPropagation();

    // Only allow dropping on folders
    if (targetFolder.type !== 'folder') return;

    // Don't allow dropping on an item being dragged
    if (draggingItems?.includes(targetFolder.id)) return;

    // Move all dragged items to the target folder
    if (draggingItems && moveItem) {
      for (const itemId of draggingItems) {
        moveItem(itemId, targetFolder.id);
      }
    } else {
      // Try cross-window drop (from desktop or other explorer)
      handleItemDropFromDesktop(e, targetFolder);
    }

    setDraggingItems(null);
    setDropTargetId(null);
  }, [draggingItems, moveItem, handleItemDropFromDesktop]);

  return {
    // State
    isDragOver,
    uploadProgress,
    draggingItems,
    dropTargetId,
    fileInputRef,
    isDraggingInternalRef,
    // External drop handlers
    handleDragOver,
    handleDragLeave,
    handleDrop,
    // File input handlers
    handleFileInputChange,
    handleUploadClick,
    // Internal drag handlers
    handleItemDragStart,
    handleItemDragEnd,
    handleItemDragOver,
    handleItemDragLeave,
    handleItemDrop,
  };
}
