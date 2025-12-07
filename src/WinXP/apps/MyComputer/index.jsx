import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useFileSystem, SYSTEM_IDS, XP_ICONS } from '../../../contexts/FileSystemContext';
import { useApp } from '../../../contexts/AppContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { isMobileDevice } from '../../../utils/deviceDetection';
import { ProgramLayout, TaskPanel } from '../../../components';
import { ContextMenu } from '../../components/ContextMenu';
import { useFileContextMenu, useBackgroundContextMenu } from '../../hooks/useFileContextMenu';
import { createArchive, extractArchive } from '../../../utils/archiveUtils';
import { ExplorerContent, ViewMenu, SearchPanel, FolderTree } from './components';
import { getFileExtension, getSimpleFileType, sortItems, filterItems, formatDetailDate } from './utils';
import {
  useNavigation,
  useSelection,
  useFileOperations,
  useDragDrop,
  useKeyboardShortcuts,
} from './hooks';
import {
  LoadingContainer,
  OuterWrapper,
  Container,
  HiddenFileInput,
  DragOverlay,
  DragOverlayContent,
  UploadProgressOverlay,
  UploadProgressDialog,
  UploadProgressTitle,
  CopyingAnimation,
  UploadProgressFile,
  UploadProgressBar,
  UploadProgressFill,
  UploadProgressText,
  DetailsSpacer,
  FolderLayout,
  MyComputerLayout,
  MyComputerContent,
  MyComputerEmptyMessage,
  CategorySection,
  CategoryHeader,
  CategoryIcon,
  CategoryTitle,
  CategoryDivider,
  CategoryItems,
  MyComputerFileItem,
  MyComputerFileIcon,
  MyComputerFileName,
  MyComputerListItem,
  MyComputerListIcon,
  MyComputerListName,
  MyComputerDetailsHeader,
  MyComputerDetailsHeaderCell,
  MyComputerDetailsRow,
  MyComputerDetailsCell,
  MyComputerDetailsIcon,
  MyComputerTileItem,
  MyComputerTileIcon,
  MyComputerTileInfo,
  MyComputerTileName,
  MyComputerTileType,
} from './styles';

const DOUBLE_TAP_DELAY = 400; // ms for double-tap detection
const LONG_PRESS_DELAY = 500; // ms for long-press context menu

function MyComputer({ onClose, onMinimize, onMaximize, onUpdateHeader, initialPath }) {
  const {
    fileSystem,
    isLoading,
    getFolderContents,
    getPath,
    createItem,
    createFile,
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
  const { isFileDropUploadEnabled, isFileDropOverlayEnabled } = useConfig();

  // Refs
  const wrapperRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const itemRefs = useRef({});
  const lastTapRef = useRef(null); // For mobile double-tap detection
  const longPressTimerRef = useRef(null); // For long-press context menu

  // Mobile detection
  const isMobile = isMobileDevice();

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // View state
  const [viewMode, setViewMode] = useState('icons');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [viewMenuPosition, setViewMenuPosition] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showFoldersPane, setShowFoldersPane] = useState(false);

  // Navigation hook
  const {
    currentFolder,
    isMyComputerRoot,
    currentFolderData,
    history,
    historyIndex,
    navigateTo,
    goBack,
    goForward,
    goUp,
    goToRoot,
    handleTreeNavigate,
    canGoBack,
    canGoForward,
  } = useNavigation({ fileSystem, initialPath });

  // Computed values
  const contents = isMyComputerRoot ? [] : getFolderContents(currentFolder);
  const pathString = isMyComputerRoot ? 'My Computer' : getPath(currentFolder);

  // Selection hook
  const {
    selectedItems,
    setSelectedItems,
    selectionBox,
    handleItemClick,
    handleContainerClick: baseHandleContainerClick,
    handleContentMouseDown,
    selectAll,
  } = useSelection({ contents, contentRef, itemRefs });

  // File operations hook
  const {
    renamingItem,
    renameValue,
    setRenameValue,
    contextMenu,
    setContextMenu,
    handleCreateFolder,
    handleDelete,
    handleCopy,
    handleCut,
    handlePaste,
    handleRename,
    handleRenameSubmit,
    handleContextMenu,
    closeContextMenu,
  } = useFileOperations({
    fileSystem,
    currentFolder,
    selectedItems,
    setSelectedItems,
    createItem,
    moveToRecycleBin,
    renameItem,
    copy,
    cut,
    paste,
  });

  // Drag and drop hook
  const {
    isDragOver,
    uploadProgress,
    draggingItems,
    dropTargetId,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileInputChange,
    handleUploadClick,
    handleItemDragStart,
    handleItemDragEnd,
    handleItemDragOver,
    handleItemDragLeave,
    handleItemDrop,
  } = useDragDrop({
    currentFolder,
    currentFolderData,
    selectedItems,
    createItem,
    moveItem,
    isFileDropUploadEnabled,
  });

  // Keyboard shortcuts hook
  useKeyboardShortcuts({
    containerRef,
    selectedItems,
    contents,
    onDelete: handleDelete,
    onRename: handleRename,
    onCopy: handleCopy,
    onCut: handleCut,
    onPaste: handlePaste,
    onSelectAll: selectAll,
    onGoUp: goUp,
  });

  // Get context menu selected item
  const selectedItemId = contextMenu?.itemId || selectedItems[0];
  const selectedItem = contextMenu?.isItem ? fileSystem?.[selectedItemId] : null;

  // Sort and filter contents
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

  const filteredMyComputerItems = React.useMemo(() => ({
    folders: filterItems(myComputerItems.folders, searchQuery),
    drives: filterItems(myComputerItems.drives, searchQuery),
  }), [myComputerItems, searchQuery]);

  const folderTreeRoots = React.useMemo(() => {
    const driveIds = myComputerItems.drives.map(item => item.id);
    return [{
      id: 'my-computer-root',
      name: 'My Computer',
      icon: XP_ICONS.myComputer,
      children: driveIds,
    }];
  }, [myComputerItems]);

  // Format path as shorter string
  const formatShortPath = useCallback((path) => {
    if (!path || path === 'My Computer') return 'My Computer';
    return path.replace('Local Disk (C:)', 'C:').replace(/\\/g, '\\');
  }, []);

  const shortPathString = formatShortPath(pathString);

  const closeSearch = useCallback(() => {
    setIsSearching(false);
    setSearchQuery('');
  }, []);

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

  const handleItemDoubleClick = useCallback((item) => {
    if (item.type === 'folder' || item.type === 'drive') {
      navigateTo(item.id);
    } else if (item.type === 'file') {
      openFile(item);
    }
  }, [navigateTo, openFile]);

  const handleContainerClick = useCallback(() => {
    baseHandleContainerClick();
    setContextMenu(null);
  }, [baseHandleContainerClick, setContextMenu]);

  // Archive handlers
  const handleAddToArchive = useCallback(async () => {
    if (selectedItems.length === 0) return;
    try {
      const { blob, filename } = await createArchive(fileSystem, selectedItems, getFileContent);
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

  // Context menu items
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

  const backgroundMenuItems = useBackgroundContextMenu({
    clipboard,
    onNewFolder: withClose(handleCreateFolder),
    onPaste: withClose(handlePaste),
    onUpload: withClose(handleUploadClick),
    onSelectAll: () => {
      selectAll();
      closeContextMenu();
    },
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
      case 'folders':
        setIsSearching(false);
        setShowFoldersPane(prev => !prev);
        break;
      case 'views':
        if (event?.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          setViewMenuPosition({ top: rect.bottom, left: rect.left });
        }
        setShowViewMenu(prev => !prev);
        break;
      case 'search':
        setIsSearching(prev => !prev);
        if (isSearching) setSearchQuery('');
        break;
      default:
        console.log('Toolbar action:', action);
    }
  }, [goBack, goForward, goUp, isSearching]);

  // Menu action handler
  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'newFolder': handleCreateFolder(); break;
      case 'delete': handleDelete(); break;
      case 'copy': handleCopy(); break;
      case 'cut': handleCut(); break;
      case 'paste': handlePaste(); break;
      case 'selectAll': selectAll(); break;
      case 'refresh': break;
      case 'exitProgram': onClose(); break;
      case 'rename': handleRename(); break;
      case 'viewTiles': setViewMode('tiles'); break;
      case 'viewIcons': setViewMode('icons'); break;
      case 'viewList': setViewMode('list'); break;
      case 'viewDetails': setViewMode('details'); break;
      case 'sortByName': setSortBy('name'); break;
      case 'sortBySize': setSortBy('size'); break;
      case 'sortByType': setSortBy('type'); break;
      case 'sortByModified': setSortBy('modified'); break;
      default: console.log('Menu action:', action);
    }
  }, [handleCreateFolder, handleDelete, handleCopy, handleCut, handlePaste, handleRename, selectAll, onClose]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu, setContextMenu]);

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
    { type: 'button', id: 'back', icon: '/gui/toolbar/back.webp', label: 'Back', action: 'back', disabled: !canGoBack },
    { type: 'button', id: 'forward', icon: '/gui/toolbar/forward.webp', label: 'Forward', action: 'forward', disabled: !canGoForward },
    { type: 'button', id: 'up', icon: '/gui/toolbar/up.webp', label: 'Up', action: 'up', disabled: isMyComputerRoot },
    { type: 'separator' },
    { type: 'button', id: 'search', icon: '/gui/toolbar/search.webp', label: 'Search', action: 'search' },
    { type: 'button', id: 'folders', icon: '/gui/toolbar/favorites.webp', label: 'Folders', action: 'folders' },
    { type: 'separator' },
    { type: 'button', id: 'views', icon: '/gui/toolbar/views.webp', label: 'Views', action: 'views', hasDropdown: true },
  ];

  const totalItems = isMyComputerRoot
    ? myComputerItems.folders.length + myComputerItems.drives.length
    : contents.length;
  const visibleItems = isMyComputerRoot
    ? filteredMyComputerItems.folders.length + filteredMyComputerItems.drives.length
    : filteredContents.length;
  const statusText = selectedItems.length > 0
    ? `${selectedItems.length} object(s) selected`
    : searchQuery.trim()
    ? `${visibleItems} of ${totalItems} object(s)`
    : `${visibleItems} object(s)`;

  // Mobile touch handler for My Computer root view
  const handleMyComputerItemTouchStart = useCallback((e, item) => {
    if (!isMobile) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const now = Date.now();

    // Clear any existing long press timer
    clearLongPressTimer();

    // Check for double-tap
    if (lastTapRef.current &&
        lastTapRef.current.id === item.id &&
        now - lastTapRef.current.time < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      e.stopPropagation();
      lastTapRef.current = null;
      setTimeout(() => handleItemDoubleClick(item), 0);
      return;
    }

    // Record this tap
    lastTapRef.current = { id: item.id, time: now };

    // Start long press timer for context menu
    longPressTimerRef.current = setTimeout(() => {
      // Create a synthetic event with touch coordinates
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        clientX: touch.clientX,
        clientY: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY,
      };
      handleContextMenu(syntheticEvent, item);
      lastTapRef.current = null;
    }, LONG_PRESS_DELAY);

    // Trigger click/select
    handleItemClick(e, item);
  }, [isMobile, handleItemClick, handleItemDoubleClick, handleContextMenu, clearLongPressTimer]);

  // Mobile touch end handler
  const handleMyComputerItemTouchEnd = useCallback(() => {
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  // Render item for My Computer root view
  const renderMyComputerItem = (item) => {
    const commonProps = {
      $selected: selectedItems.includes(item.id),
      onClick: (e) => handleItemClick(e, item),
      onDoubleClick: () => !isMobile && handleItemDoubleClick(item),
      onTouchStart: (e) => handleMyComputerItemTouchStart(e, item),
      onTouchEnd: handleMyComputerItemTouchEnd,
    };

    switch (viewMode) {
      case 'details':
        return (
          <MyComputerDetailsRow key={item.id} {...commonProps}>
            <MyComputerDetailsCell $width="50%">
              <MyComputerDetailsIcon src={item.icon || XP_ICONS.folder} alt="" />
              <span>{item.name}</span>
            </MyComputerDetailsCell>
            <MyComputerDetailsCell $width="25%">
              {item.type === 'drive' ? 'Local Disk' : 'File Folder'}
            </MyComputerDetailsCell>
            <MyComputerDetailsCell $width="25%">
              {item.type === 'drive' ? '' : ''}
            </MyComputerDetailsCell>
          </MyComputerDetailsRow>
        );
      case 'list':
        return (
          <MyComputerListItem key={item.id} {...commonProps}>
            <MyComputerListIcon src={item.icon || XP_ICONS.folder} alt="" />
            <MyComputerListName>{item.name}</MyComputerListName>
          </MyComputerListItem>
        );
      case 'tiles':
        return (
          <MyComputerTileItem key={item.id} {...commonProps}>
            <MyComputerTileIcon src={item.icon || XP_ICONS.folder} alt="" />
            <MyComputerTileInfo>
              <MyComputerTileName>{item.name}</MyComputerTileName>
              <MyComputerTileType>
                {item.type === 'drive' ? 'Local Disk' : 'File Folder'}
              </MyComputerTileType>
            </MyComputerTileInfo>
          </MyComputerTileItem>
        );
      default:
        return (
          <MyComputerFileItem key={item.id} {...commonProps}>
            <MyComputerFileIcon src={item.icon || XP_ICONS.folder} alt="" />
            <MyComputerFileName>{item.name}</MyComputerFileName>
          </MyComputerFileItem>
        );
    }
  };

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
              {isSearching ? (
                <SearchPanel
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onClose={closeSearch}
                />
              ) : showFoldersPane ? (
                <FolderTree
                  roots={folderTreeRoots}
                  fileSystem={fileSystem}
                  currentFolder={currentFolder}
                  onNavigate={handleTreeNavigate}
                />
              ) : (
                <TaskPanel width={180}>
                  <TaskPanel.Section title="System Tasks" variant="primary">
                    <TaskPanel.Item icon={XP_ICONS.help} onClick={() => console.log('View system info')}>
                      View system information
                    </TaskPanel.Item>
                    <TaskPanel.Item icon={XP_ICONS.programs} onClick={() => console.log('Add/remove programs')}>
                      Add or remove programs
                    </TaskPanel.Item>
                    <TaskPanel.Item icon={XP_ICONS.controlPanel} onClick={() => console.log('Change a setting')}>
                      Change a setting
                    </TaskPanel.Item>
                  </TaskPanel.Section>
                  <TaskPanel.Section title="Other Places">
                    <TaskPanel.Item icon={XP_ICONS.folder} onClick={() => console.log('My Network Places')}>
                      My Network Places
                    </TaskPanel.Item>
                    <TaskPanel.Item icon={XP_ICONS.myDocuments} onClick={() => navigateTo(SYSTEM_IDS.MY_DOCUMENTS)}>
                      My Documents
                    </TaskPanel.Item>
                    <TaskPanel.Item icon={XP_ICONS.controlPanel} onClick={() => console.log('Control Panel')}>
                      Control Panel
                    </TaskPanel.Item>
                  </TaskPanel.Section>
                  <TaskPanel.Section title="Details" defaultExpanded={true}>
                    {selectedItems.length === 0 ? (
                      <>
                        <TaskPanel.Text><strong>My Computer</strong></TaskPanel.Text>
                        <TaskPanel.Text>System Folder</TaskPanel.Text>
                      </>
                    ) : selectedItems.length === 1 ? (
                      <>
                        <TaskPanel.Text><strong>{fileSystem[selectedItems[0]]?.name}</strong></TaskPanel.Text>
                        <TaskPanel.Text>
                          {fileSystem[selectedItems[0]]?.type === 'drive' ? 'Local Disk' : 'System Folder'}
                        </TaskPanel.Text>
                        <DetailsSpacer />
                        <TaskPanel.Text>
                          Date Modified: {formatDetailDate(fileSystem[selectedItems[0]]?.dateModified || fileSystem[selectedItems[0]]?.dateCreated || Date.now())}
                        </TaskPanel.Text>
                      </>
                    ) : (
                      <TaskPanel.Text><strong>{selectedItems.length} objects selected</strong></TaskPanel.Text>
                    )}
                  </TaskPanel.Section>
                </TaskPanel>
              )}
              <MyComputerContent>
                {filteredMyComputerItems.folders.length > 0 && (
                  <CategorySection>
                    <CategoryHeader>
                      <CategoryIcon src="/gui/mycomputer/files_header.png" alt="" onError={(e) => e.target.style.display = 'none'} />
                      <CategoryTitle>Files Stored on This Computer</CategoryTitle>
                    </CategoryHeader>
                    <CategoryDivider />
                    {viewMode === 'details' && (
                      <MyComputerDetailsHeader>
                        <MyComputerDetailsHeaderCell $width="50%">Name</MyComputerDetailsHeaderCell>
                        <MyComputerDetailsHeaderCell $width="25%">Type</MyComputerDetailsHeaderCell>
                        <MyComputerDetailsHeaderCell $width="25%">Total Size</MyComputerDetailsHeaderCell>
                      </MyComputerDetailsHeader>
                    )}
                    <CategoryItems $viewMode={viewMode}>
                      {filteredMyComputerItems.folders.map(renderMyComputerItem)}
                    </CategoryItems>
                  </CategorySection>
                )}
                {filteredMyComputerItems.drives.length > 0 && (
                  <CategorySection>
                    <CategoryHeader>
                      <CategoryIcon src="/gui/mycomputer/drives_header.png" alt="" onError={(e) => e.target.style.display = 'none'} />
                      <CategoryTitle>Hard Disk Drives</CategoryTitle>
                    </CategoryHeader>
                    <CategoryDivider />
                    {viewMode === 'details' && (
                      <MyComputerDetailsHeader>
                        <MyComputerDetailsHeaderCell $width="50%">Name</MyComputerDetailsHeaderCell>
                        <MyComputerDetailsHeaderCell $width="25%">Type</MyComputerDetailsHeaderCell>
                        <MyComputerDetailsHeaderCell $width="25%">Total Size</MyComputerDetailsHeaderCell>
                      </MyComputerDetailsHeader>
                    )}
                    <CategoryItems $viewMode={viewMode}>
                      {filteredMyComputerItems.drives.map(renderMyComputerItem)}
                    </CategoryItems>
                  </CategorySection>
                )}
                {filteredMyComputerItems.folders.length === 0 && filteredMyComputerItems.drives.length === 0 && (
                  <MyComputerEmptyMessage>
                    {searchQuery.trim() ? 'No items match your search.' : 'No drives or folders available.'}
                  </MyComputerEmptyMessage>
                )}
              </MyComputerContent>
            </MyComputerLayout>
          ) : (
            <FolderLayout>
              {isSearching ? (
                <SearchPanel
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onClose={closeSearch}
                />
              ) : showFoldersPane ? (
                <FolderTree
                  roots={folderTreeRoots}
                  fileSystem={fileSystem}
                  currentFolder={currentFolder}
                  onNavigate={handleTreeNavigate}
                />
              ) : (
                <TaskPanel width={180}>
                  <TaskPanel.Section title="File and Folder Tasks" variant="primary">
                    <TaskPanel.Item icon={XP_ICONS.folder} onClick={handleCreateFolder}>
                      Make a new folder
                    </TaskPanel.Item>
                    {selectedItems.length > 0 && (
                      <>
                        <TaskPanel.Item
                          icon={XP_ICONS.rename || XP_ICONS.file}
                          onClick={handleRename}
                          disabled={selectedItems.length !== 1}
                        >
                          Rename this {selectedItems.length === 1 && fileSystem[selectedItems[0]]?.type === 'folder' ? 'folder' : 'file'}
                        </TaskPanel.Item>
                        <TaskPanel.Item icon={XP_ICONS.copy || XP_ICONS.file} onClick={handleCopy}>
                          Copy {selectedItems.length > 1 ? 'these items' : 'this item'}
                        </TaskPanel.Item>
                        <TaskPanel.Item icon={XP_ICONS.delete || XP_ICONS.recycleBin} onClick={handleDelete}>
                          Delete {selectedItems.length > 1 ? 'these items' : 'this item'}
                        </TaskPanel.Item>
                      </>
                    )}
                  </TaskPanel.Section>
                  <TaskPanel.Section title="Other Places">
                    <TaskPanel.Item icon={XP_ICONS.myComputer} onClick={goToRoot}>
                      My Computer
                    </TaskPanel.Item>
                    <TaskPanel.Item icon={XP_ICONS.myDocuments} onClick={() => navigateTo(SYSTEM_IDS.MY_DOCUMENTS)}>
                      My Documents
                    </TaskPanel.Item>
                    <TaskPanel.Item icon={XP_ICONS.desktop || XP_ICONS.folder} onClick={() => navigateTo(SYSTEM_IDS.DESKTOP)}>
                      Desktop
                    </TaskPanel.Item>
                  </TaskPanel.Section>
                  <TaskPanel.Section title="Details" defaultExpanded={true}>
                    {selectedItems.length === 0 ? (
                      <>
                        <TaskPanel.Text><strong>{currentFolderData?.name || 'Folder'}</strong></TaskPanel.Text>
                        <TaskPanel.Text>File Folder</TaskPanel.Text>
                        <DetailsSpacer />
                        <TaskPanel.Text>
                          Date Modified: {formatDetailDate(currentFolderData?.dateModified || currentFolderData?.dateCreated || Date.now())}
                        </TaskPanel.Text>
                      </>
                    ) : selectedItems.length === 1 ? (
                      <>
                        <TaskPanel.Text><strong>{fileSystem[selectedItems[0]]?.name}</strong></TaskPanel.Text>
                        <TaskPanel.Text>{getSimpleFileType(fileSystem[selectedItems[0]])}</TaskPanel.Text>
                        <DetailsSpacer />
                        <TaskPanel.Text>
                          Date Modified: {formatDetailDate(fileSystem[selectedItems[0]]?.dateModified || fileSystem[selectedItems[0]]?.dateCreated || Date.now())}
                        </TaskPanel.Text>
                      </>
                    ) : (
                      <TaskPanel.Text><strong>{selectedItems.length} objects selected</strong></TaskPanel.Text>
                    )}
                  </TaskPanel.Section>
                </TaskPanel>
              )}
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
                fileSystem={fileSystem}
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
            </FolderLayout>
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

          {isDragOver && isFileDropOverlayEnabled() && (
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
                <UploadProgressFile>{uploadProgress.fileName}</UploadProgressFile>
                <UploadProgressBar>
                  <UploadProgressFill style={{ width: `${((uploadProgress.current + 1) / uploadProgress.total) * 100}%` }} />
                </UploadProgressBar>
                <UploadProgressText>
                  {uploadProgress.current + 1} of {uploadProgress.total}
                </UploadProgressText>
              </UploadProgressDialog>
            </UploadProgressOverlay>
          )}
        </Container>

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

export default MyComputer;
