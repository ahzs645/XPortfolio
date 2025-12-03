import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useFileSystem, SYSTEM_IDS, XP_ICONS } from '../../../contexts/FileSystemContext';
import { parseDroppedFiles } from '../../../utils/fileDropParser';
import { ProgramLayout } from '../../../components';

function MyComputer({ onClose, onMinimize, onMaximize, initialPath }) {
  const {
    fileSystem,
    isLoading,
    getFolderContents,
    getPath,
    createItem,
    deleteItem,
    moveToRecycleBin,
    renameItem,
    copy,
    cut,
    paste,
    clipboard,
    clipboardOp,
  } = useFileSystem();

  const [currentFolder, setCurrentFolder] = useState(initialPath || SYSTEM_IDS.C_DRIVE);
  const [selectedItems, setSelectedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentFolderData = fileSystem?.[currentFolder];
  const contents = getFolderContents(currentFolder);
  const pathString = getPath(currentFolder);

  // Navigation history
  const [history, setHistory] = useState([SYSTEM_IDS.C_DRIVE]);
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
    if (currentFolderData?.parent) {
      navigateTo(currentFolderData.parent);
    }
  }, [currentFolderData, navigateTo]);

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
    } else {
      console.log('Open file:', item);
    }
  }, [navigateTo]);

  const handleContextMenu = useCallback((e, item = null) => {
    e.preventDefault();
    e.stopPropagation();

    if (item && !selectedItems.includes(item.id)) {
      setSelectedItems([item.id]);
    }

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      isItem: !!item,
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
    setSelectedItems([]);
    setContextMenu(null);
  }, []);

  // File upload handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

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

    if (currentFolderData?.type === 'file') return;

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
  }, [currentFolder, currentFolderData, createItem]);

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

  // Toolbar action handler
  const handleToolbarAction = useCallback((action) => {
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
        // Could toggle view modes
        break;
      default:
        console.log('Toolbar action:', action);
    }
  }, [goBack, goForward, goUp]);

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
      default:
        console.log('Menu action:', action);
    }
  }, [handleCreateFolder, handleDelete, handleCopy, handleCut, handlePaste, contents]);

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
        addressTitle="My Computer"
        addressIcon={XP_ICONS.myComputer}
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
        { label: 'Refresh', action: 'refresh' },
      ],
    },
    { id: 'help', label: 'Help', disabled: true },
  ];

  const toolbarItems = [
    { type: 'button', id: 'back', icon: '/gui/toolbar/back.webp', label: 'Back', action: 'back', disabled: historyIndex === 0 },
    { type: 'button', id: 'forward', icon: '/gui/toolbar/forward.webp', label: 'Forward', action: 'forward', disabled: historyIndex >= history.length - 1 },
    { type: 'button', id: 'up', icon: '/gui/toolbar/up.webp', label: 'Up', action: 'up', disabled: !currentFolderData?.parent },
    { type: 'separator' },
    { type: 'button', id: 'search', icon: '/gui/toolbar/search.webp', label: 'Search', disabled: true },
    { type: 'button', id: 'folders', icon: '/gui/toolbar/favorites.webp', label: 'Folders', disabled: true },
    { type: 'separator' },
    { type: 'button', id: 'views', icon: '/gui/toolbar/views.webp', label: 'Views', action: 'views' },
  ];

  const statusText = selectedItems.length > 0
    ? `${selectedItems.length} object(s) selected`
    : `${contents.length} object(s)`;

  return (
    <ProgramLayout
      windowActions={{ onClose, onMinimize, onMaximize }}
      menus={menus}
      onMenuAction={handleMenuAction}
      toolbarItems={toolbarItems}
      onToolbarAction={handleToolbarAction}
      addressTitle={pathString || 'My Computer'}
      addressIcon={currentFolderData?.icon || XP_ICONS.myComputer}
      statusFields={statusText}
    >
      <Container
        ref={containerRef}
        tabIndex={0}
        onClick={handleContainerClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
        />

        <Content onContextMenu={(e) => handleContextMenu(e, null)} $isDragOver={isDragOver}>
          {contents.length === 0 ? (
            <EmptyMessage>
              This folder is empty.
              <br />
              <br />
              Drag files here to upload them.
            </EmptyMessage>
          ) : (
            contents.map(item => (
              <FileItem
                key={item.id}
                $selected={selectedItems.includes(item.id)}
                $isCut={clipboardOp === 'cut' && clipboard.includes(item.id)}
                onClick={(e) => handleItemClick(e, item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
                onContextMenu={(e) => handleContextMenu(e, item)}
              >
                <FileIcon src={item.icon || XP_ICONS.folder} alt="" />
                {renamingItem === item.id ? (
                  <RenameForm onSubmit={handleRenameSubmit}>
                    <RenameInput
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={handleRenameSubmit}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  </RenameForm>
                ) : (
                  <FileName>{item.name}</FileName>
                )}
              </FileItem>
            ))
          )}
        </Content>

        {contextMenu && (
          <ContextMenuOverlay>
            <ContextMenuBox style={{ left: contextMenu.x, top: contextMenu.y }}>
              {contextMenu.isItem ? (
                <>
                  <MenuItem onClick={() => handleItemDoubleClick(fileSystem[selectedItems[0]])}>
                    Open
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={handleCut}>Cut</MenuItem>
                  <MenuItem onClick={handleCopy}>Copy</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={handleDelete}>Delete</MenuItem>
                  <MenuItem onClick={handleRename} disabled={selectedItems.length !== 1}>
                    Rename
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={handleCreateFolder}>New Folder</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={handlePaste} disabled={clipboard.length === 0}>
                    Paste
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={handleUploadClick}>
                    Upload Files...
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={() => { setSelectedItems(contents.map(i => i.id)); setContextMenu(null); }}>
                    Select All
                  </MenuItem>
                </>
              )}
            </ContextMenuBox>
          </ContextMenuOverlay>
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

const Content = styled.div`
  flex: 1;
  padding: 8px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 4px;
  background: ${({ $isDragOver }) => $isDragOver ? 'rgba(11, 97, 255, 0.05)' : 'white'};
  border: 1px solid #808080;
  border-top: 1px solid #404040;
  border-left: 1px solid #404040;
`;

const EmptyMessage = styled.div`
  width: 100%;
  text-align: center;
  color: #808080;
  margin-top: 60px;
  font-size: 11px;
  line-height: 1.5;
`;

const FileItem = styled.div`
  width: 80px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.2)' : 'transparent'};
  border-color: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.5)' : 'transparent'};
  opacity: ${({ $isCut }) => $isCut ? 0.5 : 1};

  &:hover {
    background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.3)' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const FileIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
`;

const FileName = styled.span`
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  line-height: 1.2;
  max-height: 2.4em;
  overflow: hidden;
`;

const RenameForm = styled.form`
  width: 100%;
`;

const RenameInput = styled.input`
  width: 100%;
  font-size: 11px;
  text-align: center;
  border: 1px solid #000;
  padding: 1px 2px;
`;

const ContextMenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
`;

const ContextMenuBox = styled.div`
  position: absolute;
  background: #f5f5f5;
  border: 1px solid #808080;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 150px;
  padding: 2px 0;
`;

const MenuItem = styled.div`
  padding: 4px 20px;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #0b61ff;
    color: white;
  }

  ${({ disabled }) => disabled && `
    color: #808080;
    pointer-events: none;
  `}
`;

const MenuDivider = styled.div`
  height: 1px;
  background: #c0c0c0;
  margin: 2px 0;
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

export default MyComputer;
