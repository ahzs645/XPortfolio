import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useFileSystem, SYSTEM_IDS, XP_ICONS } from '../../../contexts/FileSystemContext';
import { useApp } from '../../../contexts/AppContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { parseDroppedFiles } from '../../../utils/fileDropParser';
import { ProgramLayout, TaskPanel } from '../../../components';
import { ContextMenu } from '../../components/ContextMenu';
import { useFileContextMenu, useBackgroundContextMenu } from '../../hooks/useFileContextMenu';
import { createArchive, extractArchive } from '../../../utils/archiveUtils';
import { ExplorerContent, ViewMenu } from './components';
import { getFileExtension, getFileType, sortItems, filterItems } from './utils';
import { VIEW_MODES } from './constants';

function MyComputer({ onClose, onMinimize, onMaximize, onUpdateHeader, initialPath }) {
  const {
    fileSystem,
    isLoading,
    getFolderContents,
    getPath,
    createItem,
    createFile,
    deleteItem,
    moveToRecycleBin,
    renameItem,
    copy,
    cut,
    paste,
    clipboard,
    clipboardOp,
    getFileContent,
    moveItem,
  } = useFileSystem();

  const { openFile } = useApp();
  const { isFileDropUploadEnabled } = useConfig();

  // null = My Computer root view, otherwise folder ID
  const [currentFolder, setCurrentFolder] = useState(initialPath || null);
  const isMyComputerRoot = currentFolder === null;
  const [selectedItems, setSelectedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [draggingItems, setDraggingItems] = useState(null); // Array of item IDs being dragged
  const [dropTargetId, setDropTargetId] = useState(null); // Folder being hovered during drag
  const [selecting, setSelecting] = useState(null); // { startX, startY } for drag selection
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // Current mouse position during selection
  const [viewMode, setViewMode] = useState('icons'); // icons, list, details, tiles
  const [sortBy, setSortBy] = useState('name'); // name, size, type, modified
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [viewMenuPosition, setViewMenuPosition] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const isDraggingInternalRef = useRef(false); // Sync ref for drag state (React state updates are async)
  const justFinishedSelectingRef = useRef(false); // Prevent click from clearing selection after drag
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const itemRefs = useRef({});

  const currentFolderData = isMyComputerRoot ? null : fileSystem?.[currentFolder];
  const contents = isMyComputerRoot ? [] : getFolderContents(currentFolder);
  const pathString = isMyComputerRoot ? 'My Computer' : getPath(currentFolder);
  const selectedItemId = contextMenu?.itemId || selectedItems[0];
  const selectedItem = contextMenu?.isItem ? fileSystem?.[selectedItemId] : null;
  const selectedExtension = selectedItem?.name ? getFileExtension(selectedItem.name) : '';
  const isArchive = selectedExtension === '.rar' || selectedExtension === '.zip';

  // Sort and filter contents using imported utilities
  const sortedContents = React.useMemo(() => sortItems(contents, sortBy, sortOrder), [contents, sortBy, sortOrder]);
  const filteredContents = React.useMemo(() => filterItems(sortedContents, searchQuery), [sortedContents, searchQuery]);

  // Handle column header click for sorting
  const handleColumnSort = useCallback((column) => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy]);

  // Get items for My Computer root view
  const myComputerItems = React.useMemo(() => {
    if (!fileSystem) return { folders: [], drives: [] };

    const folders = [
      fileSystem[SYSTEM_IDS.MY_DOCUMENTS],
      fileSystem[SYSTEM_IDS.MY_PICTURES],
      fileSystem[SYSTEM_IDS.MY_MUSIC],
    ].filter(Boolean);

    const drives = [
      fileSystem[SYSTEM_IDS.C_DRIVE],
    ].filter(Boolean);

    return { folders, drives };
  }, [fileSystem]);

  // Format path as shorter string (e.g., "C:\Desktop\folder" instead of "Local Disk (C:)\Desktop\folder")
  const formatShortPath = useCallback((path) => {
    if (!path || path === 'My Computer') return 'My Computer';
    return path
      .replace('Local Disk (C:)', 'C:')
      .replace(/\\/g, '\\');
  }, []);

  const shortPathString = formatShortPath(pathString);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);
  const withClose = useCallback((fn) => () => {
    if (fn) fn();
    closeContextMenu();
  }, [closeContextMenu]);

  // Update window header when folder changes
  useEffect(() => {
    if (onUpdateHeader) {
      if (isMyComputerRoot) {
        onUpdateHeader({
          icon: XP_ICONS.myComputer,
          title: 'My Computer',
          buttons: ['minimize', 'maximize', 'close'],
        });
      } else if (currentFolderData) {
        onUpdateHeader({
          icon: currentFolderData.icon || XP_ICONS.folder,
          title: currentFolderData.name || 'My Computer',
          buttons: ['minimize', 'maximize', 'close'],
        });
      }
    }
  }, [currentFolder, currentFolderData, isMyComputerRoot, onUpdateHeader]);

  // Navigation history (null = My Computer root)
  const [history, setHistory] = useState([null]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const navigateTo = useCallback((folderId) => {
    if (!fileSystem?.[folderId]) return;

    setCurrentFolder(folderId);
    setSelectedItems([]);
    setContextMenu(null);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(folderId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [fileSystem, history, historyIndex]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentFolder(history[historyIndex - 1]);
      setSelectedItems([]);
    }
  }, [historyIndex, history]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentFolder(history[historyIndex + 1]);
      setSelectedItems([]);
    }
  }, [historyIndex, history]);

  const goUp = useCallback(() => {
    if (isMyComputerRoot) return;

    // If at a top-level folder (like C: drive), go to My Computer root
    if (!currentFolderData?.parent || currentFolderData?.parent === null) {
      setCurrentFolder(null);
      setSelectedItems([]);
      setContextMenu(null);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(null);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else {
      navigateTo(currentFolderData.parent);
    }
  }, [currentFolderData, isMyComputerRoot, navigateTo, history, historyIndex]);

  const handleItemClick = useCallback((e, item) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else {
      setSelectedItems([item.id]);
    }
  }, []);

  const handleItemDoubleClick = useCallback((item) => {
    if (item.type === 'folder' || item.type === 'drive') {
      navigateTo(item.id);
    } else if (item.type === 'file') {
      // Open file with appropriate application
      openFile(item);
    }
  }, [navigateTo, openFile]);

  const handleContextMenu = useCallback((e, item = null) => {
    e.preventDefault();
    e.stopPropagation();

    if (item && !selectedItems.includes(item.id)) {
      setSelectedItems([item.id]);
    }

    // Use clientX/clientY directly for fixed positioning
    // This ensures the menu appears at the cursor and isn't clipped by overflow:hidden
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isItem: !!item,
      itemId: item?.id || null,
    });
  }, [selectedItems]);

  const handleCreateFolder = useCallback(async () => {
    const id = await createItem(currentFolder, 'New Folder', 'folder');
    if (id) {
      setRenamingItem(id);
      setRenameValue('New Folder');
      setSelectedItems([id]);
    }
    setContextMenu(null);
  }, [createItem, currentFolder]);

  const handleDelete = useCallback(async () => {
    for (const id of selectedItems) {
      await moveToRecycleBin(id);
    }
    setSelectedItems([]);
    setContextMenu(null);
  }, [selectedItems, moveToRecycleBin]);

  const handleCopy = useCallback(() => {
    copy(selectedItems);
    setContextMenu(null);
  }, [copy, selectedItems]);

  const handleCut = useCallback(() => {
    cut(selectedItems);
    setContextMenu(null);
  }, [cut, selectedItems]);

  const handlePaste = useCallback(async () => {
    await paste(currentFolder);
    setContextMenu(null);
  }, [paste, currentFolder]);

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
      renameItem(renamingItem, renameValue.trim());
    }
    setRenamingItem(null);
    setRenameValue('');
  }, [renamingItem, renameValue, renameItem]);

  const handleContainerClick = useCallback(() => {
    // Don't clear selection if we just finished a drag selection
    if (justFinishedSelectingRef.current) {
      justFinishedSelectingRef.current = false;
      return;
    }
    setSelectedItems([]);
    setContextMenu(null);
  }, []);

  // Drag selection handlers
  const handleContentMouseDown = useCallback((e) => {
    // Only start selection if clicking on the content background (not on items)
    if (e.target !== e.currentTarget) return;
    // Don't start selection on right-click
    if (e.button !== 0) return;

    const contentRect = contentRef.current?.getBoundingClientRect();
    if (!contentRect) return;

    const startX = e.clientX - contentRect.left + (contentRef.current?.scrollLeft || 0);
    const startY = e.clientY - contentRect.top + (contentRef.current?.scrollTop || 0);

    setSelecting({ startX, startY });
    setMousePos({ x: startX, y: startY });
    setSelectedItems([]);
  }, []);

  // Handle mouse move and mouse up for selection
  useEffect(() => {
    if (!selecting) return;

    const handleMouseMove = (e) => {
      const contentRect = contentRef.current?.getBoundingClientRect();
      if (!contentRect) return;

      const x = e.clientX - contentRect.left + (contentRef.current?.scrollLeft || 0);
      const y = e.clientY - contentRect.top + (contentRef.current?.scrollTop || 0);
      setMousePos({ x, y });

      // Calculate selection rectangle
      const left = Math.min(selecting.startX, x);
      const top = Math.min(selecting.startY, y);
      const width = Math.abs(x - selecting.startX);
      const height = Math.abs(y - selecting.startY);

      // Check which items intersect with the selection rectangle
      const selectedIds = [];
      for (const item of contents) {
        const itemEl = itemRefs.current[item.id];
        if (!itemEl) continue;

        const itemRect = itemEl.getBoundingClientRect();
        const contentRect = contentRef.current?.getBoundingClientRect();
        if (!contentRect) continue;

        // Get item position relative to content (accounting for scroll)
        const itemLeft = itemRect.left - contentRect.left + (contentRef.current?.scrollLeft || 0);
        const itemTop = itemRect.top - contentRect.top + (contentRef.current?.scrollTop || 0);
        const itemRight = itemLeft + itemRect.width;
        const itemBottom = itemTop + itemRect.height;

        // Check intersection
        const intersects = !(
          itemRight < left ||
          itemLeft > left + width ||
          itemBottom < top ||
          itemTop > top + height
        );

        if (intersects) {
          selectedIds.push(item.id);
        }
      }

      setSelectedItems(selectedIds);
    };

    const handleMouseUp = () => {
      // Mark that we just finished selecting to prevent click from clearing selection
      justFinishedSelectingRef.current = true;
      setSelecting(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selecting, contents]);

  // Calculate selection box dimensions
  const selectionBox = selecting ? {
    left: Math.min(selecting.startX, mousePos.x),
    top: Math.min(selecting.startY, mousePos.y),
    width: Math.abs(mousePos.x - selecting.startX),
    height: Math.abs(mousePos.y - selecting.startY),
  } : null;

  // File upload handlers (for external files dragged from computer or cross-window)
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Don't show overlay for internal drags within this window
    if (isDraggingInternalRef.current) return;

    // Allow cross-window file system item drops
    const hasXPortfolioItems = e.dataTransfer?.types?.includes('application/x-xportfolio-items');
    if (hasXPortfolioItems) {
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
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-xportfolio-items', JSON.stringify(itemsToDrag));

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
    }

    setDraggingItems(null);
    setDropTargetId(null);
  }, [draggingItems, moveItem]);

  // Archive handlers
  const handleAddToArchive = useCallback(async () => {
    if (selectedItems.length === 0) return;
    try {
      const { blob, filename } = await createArchive(fileSystem, selectedItems, getFileContent);
      // Convert blob to data URL and save as file
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      await createFile(currentFolder || SYSTEM_IDS.MY_DOCUMENTS, filename, {
        data: dataUrl,
        size: blob.size,
        type: 'application/zip',
      });
    } catch (error) {
      console.error('Failed to create archive:', error);
    }
  }, [selectedItems, fileSystem, getFileContent, createFile, currentFolder]);

  const handleExtractHere = useCallback(async () => {
    if (!selectedItem || selectedItems.length !== 1) return;
    try {
      const content = await getFileContent(selectedItem.id);
      if (content) {
        const targetFolder = currentFolder || SYSTEM_IDS.MY_DOCUMENTS;
        await extractArchive(content, fileSystem, targetFolder, createItem, createFile);
      }
    } catch (error) {
      console.error('Failed to extract archive:', error);
    }
  }, [selectedItem, selectedItems, getFileContent, fileSystem, currentFolder, createItem, createFile]);

  // Use the shared hook for file/folder context menu
  const itemMenuItems = useFileContextMenu({
    selectedItem: contextMenu?.isItem ? selectedItem : null,
    isMultiSelect: selectedItems.length > 1,
    clipboard,
    clipboardOp,
    onOpen: withClose(() => handleItemDoubleClick(selectedItem)),
    onExplore: withClose(() => handleItemDoubleClick(selectedItem)),
    onCut: withClose(handleCut),
    onCopy: withClose(handleCopy),
    onDelete: withClose(handleDelete),
    onRename: withClose(handleRename),
    onProperties: withClose(() => console.log('Properties for', selectedItem?.name)),
    onAddToArchive: withClose(handleAddToArchive),
    onExtractHere: withClose(handleExtractHere),
  });

  // Use the shared hook for background context menu
  const backgroundMenuItems = useBackgroundContextMenu({
    clipboard,
    onNewFolder: withClose(handleCreateFolder),
    onPaste: withClose(handlePaste),
    onUpload: withClose(handleUploadClick),
    onSelectAll: () => {
      setSelectedItems(contents.map(i => i.id));
      closeContextMenu();
    },
    // Note: No Refresh or Properties in file explorer background
  });

  // Toolbar action handler
  const handleToolbarAction = useCallback((action, event) => {
    switch (action) {
      case 'back':
        goBack();
        break;
      case 'forward':
        goForward();
        break;
      case 'up':
        goUp();
        break;
      case 'views':
        if (event?.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          // Use viewport coordinates for fixed positioning
          setViewMenuPosition({
            top: rect.bottom,
            left: rect.left,
          });
        }
        setShowViewMenu(prev => !prev);
        break;
      case 'search':
        setIsSearching(prev => !prev);
        if (isSearching) setSearchQuery(''); // Clear search when toggling off
        break;
      default:
        console.log('Toolbar action:', action);
    }
  }, [goBack, goForward, goUp, isSearching]);

  // Menu action handler
  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'newFolder':
        handleCreateFolder();
        break;
      case 'delete':
        handleDelete();
        break;
      case 'copy':
        handleCopy();
        break;
      case 'cut':
        handleCut();
        break;
      case 'paste':
        handlePaste();
        break;
      case 'selectAll':
        setSelectedItems(contents.map(i => i.id));
        break;
      case 'refresh':
        // Refresh is a no-op for now, filesystem updates automatically
        break;
      case 'exitProgram':
        onClose();
        break;
      case 'rename':
        handleRename();
        break;
      // View mode actions
      case 'viewTiles':
        setViewMode('tiles');
        break;
      case 'viewIcons':
        setViewMode('icons');
        break;
      case 'viewList':
        setViewMode('list');
        break;
      case 'viewDetails':
        setViewMode('details');
        break;
      // Sort actions
      case 'sortByName':
        setSortBy('name');
        break;
      case 'sortBySize':
        setSortBy('size');
        break;
      case 'sortByType':
        setSortBy('type');
        break;
      case 'sortByModified':
        setSortBy('modified');
        break;
      default:
        console.log('Menu action:', action);
    }
  }, [handleCreateFolder, handleDelete, handleCopy, handleCut, handlePaste, handleRename, contents, onClose]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.key === 'Delete' && selectedItems.length > 0) {
        handleDelete();
      } else if (e.key === 'F2' && selectedItems.length === 1) {
        handleRename();
      } else if (e.key === 'Backspace') {
        goUp();
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c') {
          e.preventDefault();
          handleCopy();
        } else if (e.key === 'x') {
          e.preventDefault();
          handleCut();
        } else if (e.key === 'v') {
          e.preventDefault();
          handlePaste();
        } else if (e.key === 'a') {
          e.preventDefault();
          setSelectedItems(contents.map(item => item.id));
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedItems, contents, handleDelete, handleRename, handleCopy, handleCut, handlePaste, goUp]);

  if (isLoading) {
    return (
      <ProgramLayout
        windowActions={{ onClose, onMinimize, onMaximize }}
        addressTitle="C:"
        addressIcon={XP_ICONS.localDisk}
        statusFields="Loading..."
      >
        <LoadingContainer>Loading...</LoadingContainer>
      </ProgramLayout>
    );
  }

  const menus = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New Folder', action: 'newFolder' },
        { separator: true },
        { label: 'Delete', action: 'delete', disabled: selectedItems.length === 0 },
        { label: 'Rename', action: 'rename', disabled: selectedItems.length !== 1 },
        { separator: true },
        { label: 'Close', action: 'exitProgram' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Cut', action: 'cut', disabled: selectedItems.length === 0 },
        { label: 'Copy', action: 'copy', disabled: selectedItems.length === 0 },
        { label: 'Paste', action: 'paste', disabled: clipboard.length === 0 },
        { separator: true },
        { label: 'Select All', action: 'selectAll' },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Tiles', action: 'viewTiles', checked: viewMode === 'tiles' },
        { label: 'Icons', action: 'viewIcons', checked: viewMode === 'icons' },
        { label: 'List', action: 'viewList', checked: viewMode === 'list' },
        { label: 'Details', action: 'viewDetails', checked: viewMode === 'details' },
        { separator: true },
        {
          label: 'Arrange Icons by',
          submenu: [
            { label: 'Name', action: 'sortByName', checked: sortBy === 'name' },
            { label: 'Size', action: 'sortBySize', checked: sortBy === 'size' },
            { label: 'Type', action: 'sortByType', checked: sortBy === 'type' },
            { label: 'Modified', action: 'sortByModified', checked: sortBy === 'modified' },
          ],
        },
        { separator: true },
        { label: 'Refresh', action: 'refresh' },
      ],
    },
    { id: 'help', label: 'Help', disabled: true },
  ];

  const toolbarItems = [
    { type: 'button', id: 'back', icon: '/gui/toolbar/back.webp', label: 'Back', action: 'back', disabled: historyIndex === 0 },
    { type: 'button', id: 'forward', icon: '/gui/toolbar/forward.webp', label: 'Forward', action: 'forward', disabled: historyIndex >= history.length - 1 },
    { type: 'button', id: 'up', icon: '/gui/toolbar/up.webp', label: 'Up', action: 'up', disabled: isMyComputerRoot },
    { type: 'separator' },
    { type: 'button', id: 'search', icon: '/gui/toolbar/search.webp', label: 'Search', action: 'search', disabled: isMyComputerRoot },
    { type: 'button', id: 'folders', icon: '/gui/toolbar/favorites.webp', label: 'Folders', disabled: true },
    { type: 'separator' },
    { type: 'button', id: 'views', icon: '/gui/toolbar/views.webp', label: 'Views', action: 'views', hasDropdown: true },
  ];

  const itemCount = isMyComputerRoot
    ? myComputerItems.folders.length + myComputerItems.drives.length
    : filteredContents.length;
  const statusText = selectedItems.length > 0
    ? `${selectedItems.length} object(s) selected`
    : searchQuery.trim()
    ? `${filteredContents.length} of ${contents.length} object(s)`
    : `${itemCount} object(s)`;

  // Render item for My Computer root view (larger icons)
  const renderMyComputerItem = (item) => (
    <MyComputerFileItem
      key={item.id}
      $selected={selectedItems.includes(item.id)}
      onClick={(e) => handleItemClick(e, item)}
      onDoubleClick={() => handleItemDoubleClick(item)}
    >
      <MyComputerFileIcon src={item.icon || XP_ICONS.folder} alt="" />
      <MyComputerFileName>{item.name}</MyComputerFileName>
    </MyComputerFileItem>
  );

  return (
    <ProgramLayout
      windowActions={{ onClose, onMinimize, onMaximize }}
      menus={menus}
      onMenuAction={handleMenuAction}
      toolbarItems={toolbarItems}
      onToolbarAction={handleToolbarAction}
      addressTitle={shortPathString || 'My Computer'}
      addressIcon={currentFolderData?.icon || XP_ICONS.myComputer}
      statusFields={statusText}
    >
      <OuterWrapper ref={wrapperRef}>
        <Container
          ref={containerRef}
          tabIndex={0}
          onClick={handleContainerClick}
          onDragOver={!isMyComputerRoot ? handleDragOver : undefined}
          onDragLeave={!isMyComputerRoot ? handleDragLeave : undefined}
          onDrop={!isMyComputerRoot ? handleDrop : undefined}
        >
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
        />

        {isMyComputerRoot ? (
          <MyComputerLayout>
            <TaskPanel width={180}>
              <TaskPanel.Section title="System Tasks" variant="primary">
                <TaskPanel.Item
                  icon={XP_ICONS.help}
                  onClick={() => console.log('View system info')}
                >
                  View system information
                </TaskPanel.Item>
                <TaskPanel.Item
                  icon={XP_ICONS.programs}
                  onClick={() => console.log('Add/remove programs')}
                >
                  Add or remove programs
                </TaskPanel.Item>
                <TaskPanel.Item
                  icon={XP_ICONS.controlPanel}
                  onClick={() => console.log('Change a setting')}
                >
                  Change a setting
                </TaskPanel.Item>
              </TaskPanel.Section>
              <TaskPanel.Section title="Other Places">
                <TaskPanel.Item
                  icon={XP_ICONS.folder}
                  onClick={() => console.log('My Network Places')}
                >
                  My Network Places
                </TaskPanel.Item>
                <TaskPanel.Item
                  icon={XP_ICONS.myDocuments}
                  onClick={() => navigateTo(SYSTEM_IDS.MY_DOCUMENTS)}
                >
                  My Documents
                </TaskPanel.Item>
                <TaskPanel.Item
                  icon={XP_ICONS.controlPanel}
                  onClick={() => console.log('Control Panel')}
                >
                  Control Panel
                </TaskPanel.Item>
              </TaskPanel.Section>
              <TaskPanel.Section title="Details" defaultExpanded={false}>
                <TaskPanel.Text icon={XP_ICONS.myComputer}>
                  My Computer
                </TaskPanel.Text>
                <TaskPanel.Text>
                  System Folder
                </TaskPanel.Text>
              </TaskPanel.Section>
            </TaskPanel>
            <MyComputerContent>
              {myComputerItems.folders.length > 0 && (
                <CategorySection>
                  <CategoryHeader>
                    <CategoryIcon src="/gui/mycomputer/files_header.png" alt="" onError={(e) => e.target.style.display = 'none'} />
                    <CategoryTitle>Files Stored on This Computer</CategoryTitle>
                  </CategoryHeader>
                  <CategoryDivider />
                  <CategoryItems>
                    {myComputerItems.folders.map(renderMyComputerItem)}
                  </CategoryItems>
                </CategorySection>
              )}
              {myComputerItems.drives.length > 0 && (
                <CategorySection>
                  <CategoryHeader>
                    <CategoryIcon src="/gui/mycomputer/drives_header.png" alt="" onError={(e) => e.target.style.display = 'none'} />
                    <CategoryTitle>Hard Disk Drives</CategoryTitle>
                  </CategoryHeader>
                  <CategoryDivider />
                  <CategoryItems>
                    {myComputerItems.drives.map(renderMyComputerItem)}
                  </CategoryItems>
                </CategorySection>
              )}
            </MyComputerContent>
          </MyComputerLayout>
        ) : (
          <ExplorerContent
            items={filteredContents}
            viewMode={viewMode}
            sortBy={sortBy}
            sortOrder={sortOrder}
            searchQuery={searchQuery}
            isSearching={isSearching}
            selectedItems={selectedItems}
            clipboard={clipboard}
            clipboardOp={clipboardOp}
            renamingItem={renamingItem}
            renameValue={renameValue}
            draggingItems={draggingItems}
            dropTargetId={dropTargetId}
            selectionBox={selectionBox}
            isDragOver={isDragOver}
            itemRefs={itemRefs}
            contentRef={contentRef}
            onSortChange={handleColumnSort}
            onSearchChange={setSearchQuery}
            onSearchClear={() => setSearchQuery('')}
            onRenameChange={setRenameValue}
            onRenameSubmit={handleRenameSubmit}
            onItemClick={handleItemClick}
            onItemDoubleClick={handleItemDoubleClick}
            onContextMenu={handleContextMenu}
            onItemDragStart={handleItemDragStart}
            onItemDragEnd={handleItemDragEnd}
            onItemDragOver={handleItemDragOver}
            onItemDragLeave={handleItemDragLeave}
            onItemDrop={handleItemDrop}
            onContentMouseDown={handleContentMouseDown}
            onBackgroundContextMenu={(e) => handleContextMenu(e, null)}
          />
        )}

        {contextMenu && (
          <ContextMenu
            overlayType="fixed"
            zIndex={10000}
            position={{ x: contextMenu.x, y: contextMenu.y }}
            items={contextMenu.isItem ? itemMenuItems : backgroundMenuItems}
            onClose={closeContextMenu}
          />
        )}

        {isDragOver && (
          <DragOverlay>
            <DragOverlayContent>
              Drop files here to upload
            </DragOverlayContent>
          </DragOverlay>
        )}

        {uploadProgress && (
          <UploadProgressOverlay>
            <UploadProgressDialog>
              <UploadProgressTitle>Copying...</UploadProgressTitle>
              <CopyingAnimation>
                <img src="/gui/copying.gif" alt="Copying" onError={(e) => e.target.style.display = 'none'} />
              </CopyingAnimation>
              <UploadProgressFile>
                {uploadProgress.fileName}
              </UploadProgressFile>
              <UploadProgressBar>
                <UploadProgressFill
                  style={{ width: `${((uploadProgress.current + 1) / uploadProgress.total) * 100}%` }}
                />
              </UploadProgressBar>
              <UploadProgressText>
                {uploadProgress.current + 1} of {uploadProgress.total}
              </UploadProgressText>
            </UploadProgressDialog>
          </UploadProgressOverlay>
        )}
      </Container>

      {/* View Menu Dropdown - positioned below toolbar button */}
      {showViewMenu && (
        <ViewMenu
          viewMode={viewMode}
          onViewChange={setViewMode}
          onClose={() => setShowViewMenu(false)}
          position={viewMenuPosition}
        />
      )}
      </OuterWrapper>
    </ProgramLayout>
  );
}

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #808080;
`;

const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  overflow: visible;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  outline: none;
  position: relative;
  overflow: hidden;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const DragOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(11, 97, 255, 0.1);
  border: 2px dashed #0b61ff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
`;

const DragOverlayContent = styled.div`
  padding: 20px 40px;
  background: white;
  border: 1px solid #0b61ff;
  border-radius: 4px;
  font-size: 14px;
  color: #0b61ff;
  font-weight: bold;
`;

const UploadProgressOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
`;

const UploadProgressDialog = styled.div`
  background: #ece9d8;
  border: 2px solid #0054e3;
  border-radius: 4px;
  padding: 16px;
  min-width: 320px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
`;

const UploadProgressTitle = styled.div`
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const CopyingAnimation = styled.div`
  margin-bottom: 8px;
  img {
    width: 100%;
    max-width: 280px;
  }
`;

const UploadProgressFile = styled.div`
  font-size: 11px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UploadProgressBar = styled.div`
  height: 16px;
  background: white;
  border: 1px solid #808080;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const UploadProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(to bottom, #3a6ea5 0%, #1e4d8c 100%);
  transition: width 0.2s ease;
`;

const UploadProgressText = styled.div`
  font-size: 11px;
  text-align: center;
  color: #808080;
`;

// My Computer root view styles
const MyComputerLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const MyComputerContent = styled.div`
  flex: 1;
  padding: 8px 16px;
  overflow: auto;
  background: white;
  border: 1px solid #808080;
  border-top: 1px solid #404040;
  border-left: 1px solid #404040;
`;

const CategorySection = styled.div`
  margin-bottom: 16px;
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

const CategoryIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const CategoryTitle = styled.h3`
  font-size: 11px;
  font-weight: bold;
  color: #215DC6;
  margin: 0;
`;

const CategoryDivider = styled.div`
  height: 1px;
  background: linear-gradient(to right, #215DC6 0%, #215DC6 40%, transparent 100%);
  margin: 4px 0 12px 0;
`;

const CategoryItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-left: 4px;
`;

const MyComputerFileItem = styled.div`
  width: 100px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 3px;
  background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.2)' : 'transparent'};
  border-color: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.5)' : 'transparent'};

  &:hover {
    background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.3)' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const MyComputerFileIcon = styled.img`
  width: 48px;
  height: 48px;
  margin-bottom: 6px;
`;

const MyComputerFileName = styled.span`
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  line-height: 1.3;
`;

export default MyComputer;
