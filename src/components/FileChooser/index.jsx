import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import {
  useFileSystem,
  SYSTEM_IDS,
  XP_ICONS,
  resolveFileSystemItemIcon,
  filterVisibleFileSystemItems,
  getFileSystemItemDisplayName,
} from '../../contexts/FileSystemContext';
import { useShellSettings } from '../../contexts/ShellSettingsContext';
import { isMobileDevice } from '../../utils/deviceDetection';
import { withBaseUrl } from '../../utils/baseUrl';

const DOUBLE_TAP_DELAY = 400; // ms for double-tap detection

const QUICK_ACCESS = [
  { id: SYSTEM_IDS.DESKTOP, name: 'Desktop', icon: XP_ICONS.desktop },
  { id: SYSTEM_IDS.MY_PICTURES, name: 'My Pictures', icon: XP_ICONS.myPictures },
  { id: SYSTEM_IDS.MY_MUSIC, name: 'My Music', icon: XP_ICONS.myMusic },
  { id: null, name: 'My Computer', icon: XP_ICONS.myComputer },
];

const MY_COMPUTER_FOLDERS = [
  { id: SYSTEM_IDS.MY_DOCUMENTS, name: 'My Documents', icon: XP_ICONS.myDocuments },
  { id: SYSTEM_IDS.MY_PICTURES, name: 'My Pictures', icon: XP_ICONS.myPictures },
  { id: SYSTEM_IDS.MY_MUSIC, name: 'My Music', icon: XP_ICONS.myMusic },
];

const MY_COMPUTER_DRIVES = [
  { id: SYSTEM_IDS.C_DRIVE, name: 'Local Disk (C:)', icon: XP_ICONS.localDisk },
];

function FileChooser({
  isOpen,
  onClose,
  onSelect,
  title = 'Open',
  fileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'],
  fileTypesDesc = 'Image Files',
  showFoldersOnly = false,
}) {
  const { fileSystem, getFolderContents, getPath, getFileContent } = useFileSystem();
  const { explorer } = useShellSettings();
  // null = My Computer view
  const [currentFolder, setCurrentFolder] = useState(SYSTEM_IDS.DESKTOP);
  const [selectedItems, setSelectedItems] = useState([]);
  const [history, setHistory] = useState([SYSTEM_IDS.DESKTOP]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Drag state for moveable window
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const dialogRef = useRef(null);

  const isMyComputer = currentFolder === null;
  const contents = useMemo(
    () => (isMyComputer ? [] : getFolderContents(currentFolder)),
    [currentFolder, getFolderContents, isMyComputer]
  );
  const visibleContents = useMemo(
    () => filterVisibleFileSystemItems(contents, {
      showHiddenContents: explorer.showHiddenContents,
    }),
    [contents, explorer.showHiddenContents]
  );
  const currentFolderData = isMyComputer ? null : fileSystem?.[currentFolder];
  const pathString = isMyComputer ? 'My Computer' : getPath(currentFolder);

  // Format path as shorter string (e.g., "C:\Desktop" instead of "Local Disk (C:)\Desktop")
  const formatShortPath = useCallback((path) => {
    if (!path || path === 'My Computer') return 'My Computer';
    return path.replace('Local Disk (C:)', 'C:');
  }, []);

  const shortPathString = formatShortPath(pathString);

  // Filter contents based on file types
  const filteredContents = visibleContents.filter(item => {
    if (item.type === 'folder' || item.type === 'drive') return true;
    if (showFoldersOnly) return false;
    if (!fileTypes || fileTypes.length === 0) return true;
    return fileTypes.includes(item.contentType);
  });

  const isDesiredFile = useCallback((item) => {
    if (item.type === 'folder' || item.type === 'drive') return true;
    if (!fileTypes || fileTypes.length === 0) return true;
    return fileTypes.includes(item.contentType);
  }, [fileTypes]);

  const navigateTo = useCallback((folderId) => {
    // Allow null for My Computer view
    if (folderId !== null && !fileSystem?.[folderId]) return;
    setCurrentFolder(folderId);
    setSelectedItems([]);
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
    if (isMyComputer) return;
    if (currentFolderData?.parent) {
      navigateTo(currentFolderData.parent);
    } else {
      // Go to My Computer
      navigateTo(null);
    }
  }, [currentFolderData, isMyComputer, navigateTo]);

  const handleItemClick = useCallback((e, item) => {
    if (!isDesiredFile(item) && item.type === 'file') return;

    if ((e.ctrlKey || e.metaKey) && item.type === 'file') {
      setSelectedItems(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else {
      setSelectedItems(item.type === 'file' ? [item.id] : []);
    }
  }, [isDesiredFile]);

  const handleOpen = useCallback(async (itemIds = selectedItems) => {
    if (!itemIds || itemIds.length === 0) return;

    const selectedFiles = [];
    for (const itemId of itemIds) {
      const item = fileSystem[itemId];
      if (!item || item.type === 'folder' || item.type === 'drive') continue;

      // Get file data
      let fileData = item.data;
      if (!fileData && item.storageKey) {
        const blob = await getFileContent(item.id);
        if (blob) {
          fileData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      }

      selectedFiles.push({
        ...item,
        data: fileData,
        path: getPath(item.id),
      });
    }

    if (selectedFiles.length > 0 && onSelect) {
      onSelect(selectedFiles.length === 1 ? selectedFiles[0] : selectedFiles);
    }
    onClose?.();
  }, [selectedItems, fileSystem, getFileContent, getPath, onSelect, onClose]);

  const handleItemDoubleClick = useCallback((item) => {
    if (item.type === 'folder' || item.type === 'drive') {
      navigateTo(item.id);
    } else if (isDesiredFile(item)) {
      handleOpen([item.id]);
    }
  }, [navigateTo, isDesiredFile, handleOpen]);

  // Mobile touch handling for double-tap
  const lastTapRef = useRef(null);
  const isMobile = isMobileDevice();

  const handleItemTouchStart = useCallback((e, item, action) => {
    if (!isMobile) return;
    if (e.touches.length !== 1) return;

    const now = Date.now();

    // Check for double-tap
    if (lastTapRef.current &&
        lastTapRef.current.id === item.id &&
        now - lastTapRef.current.time < DOUBLE_TAP_DELAY) {
      e.preventDefault();
      e.stopPropagation();
      lastTapRef.current = null;
      setTimeout(() => action(item), 0);
      return;
    }

    // Record this tap
    lastTapRef.current = { id: item.id, time: now };
  }, [isMobile]);

  const handleQuickAccess = useCallback((folderId) => {
    navigateTo(folderId);
  }, [navigateTo]);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Drag handlers for moveable window
  const handleTitleBarMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return; // Don't drag when clicking buttons
    e.preventDefault();
    setIsDragging(true);

    const dialog = dialogRef.current;
    let currentX = position.x;
    let currentY = position.y;

    // If position is null, calculate centered position
    if (currentX === null || currentY === null) {
      const rect = dialog.getBoundingClientRect();
      currentX = rect.left;
      currentY = rect.top;
    }

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: currentX,
      startPosY: currentY,
    };
  }, [position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      setPosition({
        x: dragRef.current.startPosX + deltaX,
        y: dragRef.current.startPosY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Reset state when dialog opens
  /* eslint-disable react-hooks/set-state-in-effect -- reset form state when dialog opens */
  useEffect(() => {
    if (isOpen) {
      setCurrentFolder(SYSTEM_IDS.DESKTOP);
      setSelectedItems([]);
      setHistory([SYSTEM_IDS.DESKTOP]);
      setHistoryIndex(0);
      setPosition({ x: null, y: null }); // Reset to centered
    }
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const selectedFileNames = selectedItems
    .map(id => fileSystem[id]?.name)
    .filter(Boolean)
    .join(', ');

  // Calculate dialog style based on position
  const dialogStyle = position.x !== null && position.y !== null
    ? { left: position.x, top: position.y, transform: 'none' }
    : {};

  return (
    <Dialog
      ref={dialogRef}
      className="window"
      style={dialogStyle}
      $isDragging={isDragging}
      $hasPosition={position.x !== null}
    >
      <div className="title-bar" onMouseDown={handleTitleBarMouseDown}>
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          <button aria-label="Close" onClick={onClose} />
        </div>
      </div>

        <Content>
          <Sidebar>
            <SidebarLabel>Look in:</SidebarLabel>
            <QuickAccessList>
              {QUICK_ACCESS.map((item) => (
                <QuickAccessItem
                  key={item.id || 'mycomputer'}
                  $active={currentFolder === item.id}
                  onClick={() => handleQuickAccess(item.id)}
                >
                  <QuickAccessIcon src={item.icon} alt="" />
                  <QuickAccessName>{item.name}</QuickAccessName>
                </QuickAccessItem>
              ))}
            </QuickAccessList>
          </Sidebar>

          <MainArea>
            <Toolbar>
              <PathInput>
                <FolderIcon
                  src={isMyComputer ? XP_ICONS.myComputer : resolveFileSystemItemIcon(currentFolderData, {
                    folderIcon: XP_ICONS.folder,
                    driveIcon: XP_ICONS.localDisk,
                    fileIcon: XP_ICONS.file,
                  })}
                  alt=""
                />
                <PathText>{shortPathString}</PathText>
              </PathInput>
              <ToolbarButton
                onClick={goBack}
                disabled={historyIndex === 0}
                title="Back"
              >
                <img src={withBaseUrl('/gui/toolbar/back.webp')} alt="Back" />
              </ToolbarButton>
              <ToolbarButton
                onClick={goForward}
                disabled={historyIndex >= history.length - 1}
                title="Forward"
              >
                <img src={withBaseUrl('/gui/toolbar/forward.webp')} alt="Forward" />
              </ToolbarButton>
              <ToolbarButton
                onClick={goUp}
                disabled={isMyComputer}
                title="Up"
              >
                <img src={withBaseUrl('/gui/toolbar/up.webp')} alt="Up" />
              </ToolbarButton>
            </Toolbar>

            {/* Regular folder view */}
            {!isMyComputer && (
              <FileList onClick={clearSelection}>
                {filteredContents.length === 0 ? (
                  <EmptyMessage>This folder is empty.</EmptyMessage>
                ) : (
                  filteredContents.map((item) => (
                    <FileItem
                      key={item.id}
                      $selected={selectedItems.includes(item.id)}
                      $dimmed={!isDesiredFile(item)}
                      onClick={(e) => { e.stopPropagation(); handleItemClick(e, item); }}
                      onDoubleClick={() => !isMobile && handleItemDoubleClick(item)}
                      onTouchStart={(e) => handleItemTouchStart(e, item, handleItemDoubleClick)}
                    >
                      <FileIcon
                        src={resolveFileSystemItemIcon(item, {
                          folderIcon: XP_ICONS.folder,
                          driveIcon: XP_ICONS.localDisk,
                          fileIcon: XP_ICONS.file,
                        })}
                        alt=""
                      />
                      <FileName $selected={selectedItems.includes(item.id)}>
                        {getFileSystemItemDisplayName(item, {
                          showFileExtensions: explorer.showFileExtensions,
                        })}
                      </FileName>
                    </FileItem>
                  ))
                )}
              </FileList>
            )}

            {/* My Computer view */}
            {isMyComputer && (
              <MyComputerView>
                <SectionTitle>Files Stored on This Computer</SectionTitle>
                <SectionDivider />
                <SectionItems>
                  {MY_COMPUTER_FOLDERS.map((item) => (
                    <MyComputerItem
                      key={item.id}
                      onDoubleClick={() => !isMobile && navigateTo(item.id)}
                      onTouchStart={(e) => handleItemTouchStart(e, item, () => navigateTo(item.id))}
                    >
                      <MyComputerIcon src={item.icon} alt="" />
                      <MyComputerName>{item.name}</MyComputerName>
                    </MyComputerItem>
                  ))}
                </SectionItems>

                <SectionTitle>Hard Disk Drives</SectionTitle>
                <SectionDivider />
                <SectionItems>
                  {MY_COMPUTER_DRIVES.map((item) => (
                    <MyComputerItem
                      key={item.id}
                      onDoubleClick={() => !isMobile && navigateTo(item.id)}
                      onTouchStart={(e) => handleItemTouchStart(e, item, () => navigateTo(item.id))}
                    >
                      <MyComputerDriveIcon src={item.icon} alt="" />
                      <MyComputerName>{item.name}</MyComputerName>
                    </MyComputerItem>
                  ))}
                </SectionItems>
              </MyComputerView>
            )}

            <BottomControls>
              <ControlRow>
                <ControlLabel>File name:</ControlLabel>
                <FileNameInput
                  type="text"
                  value={selectedFileNames}
                  readOnly
                />
                <ActionButton
                  onClick={() => handleOpen()}
                  disabled={selectedItems.length === 0}
                >
                  Open
                </ActionButton>
              </ControlRow>
              <ControlRow>
                <ControlLabel>Files of type:</ControlLabel>
                <FileTypeInput
                  type="text"
                  value={`${fileTypesDesc} (${fileTypes.map(t => '.' + t.split('/')[1]).join(', ')})`}
                  readOnly
                />
                <ActionButton onClick={onClose}>Cancel</ActionButton>
              </ControlRow>
            </BottomControls>
          </MainArea>
        </Content>
    </Dialog>
  );
}

const Dialog = styled.div`
  width: 600px;
  height: 500px;
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 10000;
  user-select: ${({ $isDragging }) => $isDragging ? 'none' : 'auto'};

  /* Center when no position set */
  ${({ $hasPosition }) => !$hasPosition && `
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  `}

  .title-bar {
    height: 28px;
    min-height: 28px;
    padding: 0 3px;
  }

  .title-bar-text {
    pointer-events: none;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  padding: 8px;
  gap: 4px;
  overflow: hidden;
  margin: 0 3px 3px 3px;
  background: #ece9d8;
`;

const Sidebar = styled.div`
  width: 100px;
  display: flex;
  flex-direction: column;
  padding-right: 4px;
`;

const SidebarLabel = styled.div`
  font-size: 11px;
  color: #000;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
`;

const QuickAccessList = styled.div`
  background: #f5f0e1;
  border-radius: 4px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.1);
`;

const QuickAccessItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  border-radius: 4px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? 'rgba(200, 200, 200, 0.5)' : 'transparent')};

  &:hover {
    background: rgba(200, 200, 200, 0.5);
  }
`;

const QuickAccessIcon = styled.img`
  width: 32px;
  height: 32px;
`;

const QuickAccessName = styled.span`
  font-size: 11px;
  text-align: center;
  margin-top: 4px;
  color: #000;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 24px;
`;

const PathInput = styled.div`
  width: 300px;
  height: 100%;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #7f9db9;
  padding: 0 4px;
`;

const FolderIcon = styled.img`
  width: 17px;
  height: 17px;
  margin-right: 4px;
`;

const PathText = styled.span`
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ToolbarButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
  padding: 2px;
  filter: ${({ disabled }) => (disabled ? 'grayscale(1)' : 'none')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  img {
    height: 20px;
    width: auto;
  }
`;

const FileList = styled.div`
  flex: 1;
  background: #fafafa;
  border: 1px solid #7f9db9;
  overflow: auto;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
`;

const EmptyMessage = styled.div`
  width: 100%;
  text-align: center;
  color: #808080;
  font-size: 11px;
  margin-top: 40px;
`;

const FileItem = styled.div`
  width: 100px;
  display: inline-flex;
  align-items: center;
  padding: 4px;
  margin: 4px;
  cursor: pointer;
  border-radius: 2px;
  opacity: ${({ $dimmed }) => ($dimmed ? 0.5 : 1)};
  pointer-events: ${({ $dimmed }) => ($dimmed ? 'none' : 'auto')};
`;

const FileIcon = styled.img`
  width: 30px;
  height: 30px;
  flex-shrink: 0;
`;

const FileName = styled.span`
  font-size: 11px;
  margin-left: 4px;
  word-break: break-word;
  line-height: 1.2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  background: ${({ $selected }) => ($selected ? '#0b61ff' : 'transparent')};
  color: ${({ $selected }) => ($selected ? 'white' : '#000')};
  padding: 1px 2px;
`;

const MyComputerView = styled.div`
  flex: 1;
  background: #fafafa;
  border: 1px solid #7f9db9;
  overflow: auto;
  padding: 8px;
`;

const SectionTitle = styled.p`
  font-size: 11px;
  font-weight: bold;
  color: #000;
  margin: 8px 0 4px 4px;
`;

const SectionDivider = styled.div`
  width: 300px;
  height: 2px;
  background: linear-gradient(to right, #0054e3, #fafafa);
  margin-bottom: 8px;
`;

const SectionItems = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const MyComputerItem = styled.div`
  width: 150px;
  display: inline-flex;
  align-items: center;
  padding: 4px;
  margin: 4px 16px;
  cursor: pointer;

  &:hover {
    background: rgba(11, 97, 255, 0.1);
    border-radius: 2px;
  }
`;

const MyComputerIcon = styled.img`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
`;

const MyComputerDriveIcon = styled.img`
  width: 50px;
  height: 50px;
  flex-shrink: 0;
`;

const MyComputerName = styled.span`
  font-size: 11px;
  margin-left: 4px;
  line-height: 1.2;
`;

const BottomControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlLabel = styled.span`
  width: 80px;
  font-size: 11px;
  flex-shrink: 0;
  color: #000;
`;

const FileNameInput = styled.input`
  flex: 1;
  height: 24px;
  font-size: 11px;
  border: 1px solid #7f9db9;
  padding: 0 4px;
  background: #fafafa;
`;

const FileTypeInput = styled.input`
  flex: 1;
  height: 24px;
  font-size: 11px;
  border: 1px solid #7f9db9;
  padding: 0 4px;
  background: #fafafa;
`;

const ActionButton = styled.button`
  width: 80px;
  height: 24px;
  font-size: 11px;
  background: linear-gradient(#f3f3f3, #dcdcdc);
  border: 1px solid #8a8a8a;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #b5b5b5;
  cursor: pointer;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    background: linear-gradient(#dcdcdc, #c2c2c2);
  }
`;

export default FileChooser;
