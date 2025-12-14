import { useState, useCallback } from 'react';
import useSystemSounds from '../../../../hooks/useSystemSounds';

/**
 * Hook for managing file operations (create, delete, rename, copy, cut, paste)
 */
export function useFileOperations({
  fileSystem,
  currentFolder,
  selectedItems,
  setSelectedItems,
  createItem,
  moveToRecycleBin,
  renameItem: fsRenameItem,
  copy: fsCopy,
  cut: fsCut,
  paste: fsPaste,
}) {
  const { playRecycle } = useSystemSounds();
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  const handleCreateFolder = useCallback(async () => {
    const id = await createItem(currentFolder, 'New Folder', 'folder');
    if (id) {
      setRenamingItem(id);
      setRenameValue('New Folder');
      setSelectedItems([id]);
    }
    setContextMenu(null);
  }, [createItem, currentFolder, setSelectedItems]);

  const handleDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;
    playRecycle();
    for (const id of selectedItems) {
      await moveToRecycleBin(id);
    }
    setSelectedItems([]);
    setContextMenu(null);
  }, [selectedItems, moveToRecycleBin, setSelectedItems, playRecycle]);

  const handleCopy = useCallback(() => {
    fsCopy(selectedItems);
    setContextMenu(null);
  }, [fsCopy, selectedItems]);

  const handleCut = useCallback(() => {
    fsCut(selectedItems);
    setContextMenu(null);
  }, [fsCut, selectedItems]);

  const handlePaste = useCallback(async () => {
    await fsPaste(currentFolder);
    setContextMenu(null);
  }, [fsPaste, currentFolder]);

  const handleRename = useCallback(() => {
    if (selectedItems.length === 1) {
      const item = fileSystem[selectedItems[0]];
      setRenamingItem(selectedItems[0]);
      setRenameValue(item.name);
    }
    setContextMenu(null);
  }, [selectedItems, fileSystem]);

  const handleRenameSubmit = useCallback((e) => {
    e.preventDefault();
    if (renamingItem && renameValue.trim()) {
      fsRenameItem(renamingItem, renameValue.trim());
    }
    setRenamingItem(null);
    setRenameValue('');
  }, [renamingItem, renameValue, fsRenameItem]);

  const handleContextMenu = useCallback((e, item = null) => {
    e.preventDefault();
    e.stopPropagation();

    if (item && !selectedItems.includes(item.id)) {
      setSelectedItems([item.id]);
    }

    // Use clientX/clientY directly for fixed positioning
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isItem: !!item,
      itemId: item?.id || null,
    });
  }, [selectedItems, setSelectedItems]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    // Rename state
    renamingItem,
    setRenamingItem,
    renameValue,
    setRenameValue,
    // Context menu state
    contextMenu,
    setContextMenu,
    // Handlers
    handleCreateFolder,
    handleDelete,
    handleCopy,
    handleCut,
    handlePaste,
    handleRename,
    handleRenameSubmit,
    handleContextMenu,
    closeContextMenu: handleCloseContextMenu,
  };
}
