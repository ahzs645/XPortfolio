import React, { useState, useCallback, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useFileSystem, SYSTEM_IDS, XP_ICONS } from '../../../contexts/FileSystemContext';
import { useMessageBox } from '../../../contexts/MessageBoxContext';
import { useApp } from '../../../contexts/AppContext';
import { ProgramLayout, TaskPanel } from '../../../components';
import { ContextMenu } from '../../components/ContextMenu';
import useSystemSounds from '../../../hooks/useSystemSounds';

function RecycleBin({ onClose, onMinimize, onMaximize }) {
  const {
    fileSystem,
    isLoading,
    getFolderContents,
    restoreFromRecycleBin,
    deleteItem,
    emptyRecycleBin,
  } = useFileSystem();

  const { openApp } = useApp();
  const { playRecycle } = useSystemSounds();
  const { showMessageBox } = useMessageBox();

  const [selectedItems, setSelectedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [viewMode, setViewMode] = useState('tiles');
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [viewMenuPosition, setViewMenuPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  const contents = getFolderContents(SYSTEM_IDS.RECYCLE_BIN);

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

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleRestore = useCallback(async () => {
    for (const id of selectedItems) {
      await restoreFromRecycleBin(id);
    }
    setSelectedItems([]);
    setContextMenu(null);
  }, [selectedItems, restoreFromRecycleBin]);

  const handleRestoreAll = useCallback(async () => {
    for (const item of contents) {
      await restoreFromRecycleBin(item.id);
    }
    setSelectedItems([]);
  }, [contents, restoreFromRecycleBin]);

  const handleDeletePermanently = useCallback(async () => {
    if (selectedItems.length === 0) return;
    playRecycle();
    for (const id of selectedItems) {
      await deleteItem(id);
    }
    setSelectedItems([]);
    setContextMenu(null);
  }, [selectedItems, deleteItem, playRecycle]);

  const handleEmptyRecycleBin = useCallback(async () => {
    if (contents.length === 0) return;
    const itemCount = contents.length;
    const message = itemCount === 1
      ? `Are you sure you want to delete '${contents[0].name}'?`
      : `Are you sure you want to delete these ${itemCount} items?`;
    const title = itemCount === 1 ? 'Confirm File Delete' : 'Confirm Multiple File Delete';

    const result = await showMessageBox({
      title,
      message,
      icon: 'question',
      iconSrc: '/icons/luna/bin.png', // Use recycle bin icon
      buttons: [
        { label: 'Yes', value: 'yes', primary: true },
        { label: 'No', value: 'no' },
      ],
    });

    if (result === 'yes') {
      playRecycle();
      await emptyRecycleBin();
    }
    setContextMenu(null);
  }, [contents, emptyRecycleBin, playRecycle, showMessageBox]);

  const handleContainerClick = useCallback(() => {
    setSelectedItems([]);
    setContextMenu(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Toolbar action handler
  const handleToolbarAction = useCallback((action, event) => {
    switch (action) {
      case 'views':
        if (event?.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          setViewMenuPosition({ top: rect.bottom, left: rect.left });
        }
        setShowViewMenu(prev => !prev);
        break;
      case 'search':
      case 'folders':
      case 'back':
      case 'forward':
      case 'up':
        // These are disabled for Recycle Bin
        break;
      default:
        console.log('Toolbar action:', action);
    }
  }, []);

  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'restore':
        handleRestore();
        break;
      case 'delete':
        handleDeletePermanently();
        break;
      case 'empty':
        handleEmptyRecycleBin();
        break;
      case 'exitProgram':
        onClose();
        break;
      case 'viewThumbnails':
        setViewMode('thumbnails');
        break;
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
      default:
        console.log('Menu action:', action);
    }
  }, [handleRestore, handleDeletePermanently, handleEmptyRecycleBin, onClose]);

  // Get file type display name
  const getFileType = useCallback((item) => {
    if (!item) return '';
    if (item.type === 'folder') return 'File Folder';
    const ext = item.name?.split('.').pop()?.toLowerCase();
    const typeMap = {
      txt: 'Text Document',
      doc: 'Microsoft Word Document',
      docx: 'Microsoft Word Document',
      xls: 'Microsoft Excel Worksheet',
      xlsx: 'Microsoft Excel Worksheet',
      ppt: 'Microsoft PowerPoint Presentation',
      pptx: 'Microsoft PowerPoint Presentation',
      pdf: 'PDF Document',
      jpg: 'JPEG Image',
      jpeg: 'JPEG Image',
      png: 'PNG Image',
      gif: 'GIF Image',
      bmp: 'Bitmap Image',
      mp3: 'MP3 Audio',
      wav: 'WAV Audio',
      mp4: 'MP4 Video',
      zip: 'Compressed (zipped) Folder',
      rar: 'WinRAR Archive',
    };
    return typeMap[ext] || `${ext?.toUpperCase() || 'Unknown'} File`;
  }, []);

  // Format file size
  const formatSize = useCallback((size) => {
    if (!size) return '0 KB';
    if (size < 1024) return '1 KB';
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }, []);

  // Navigate to folder in My Computer
  const navigateToFolder = useCallback((folderId) => {
    openApp('My Computer', { initialPath: folderId });
  }, [openApp]);

  if (isLoading) {
    return (
      <ProgramLayout
        windowActions={{ onClose, onMinimize, onMaximize }}
        addressTitle="Recycle Bin"
        addressIcon={XP_ICONS.recycleBinEmpty}
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
        { label: 'Empty Recycle Bin', action: 'empty', disabled: contents.length === 0 },
        { separator: true },
        { label: 'Close', action: 'exitProgram' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Restore', action: 'restore', disabled: selectedItems.length === 0 },
        { label: 'Delete', action: 'delete', disabled: selectedItems.length === 0 },
        { separator: true },
        { label: 'Select All', action: 'selectAll', disabled: contents.length === 0 },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Thumbnails', action: 'viewThumbnails', checked: viewMode === 'thumbnails' },
        { label: 'Tiles', action: 'viewTiles', checked: viewMode === 'tiles' },
        { label: 'Icons', action: 'viewIcons', checked: viewMode === 'icons' },
        { label: 'List', action: 'viewList', checked: viewMode === 'list' },
        { label: 'Details', action: 'viewDetails', checked: viewMode === 'details' },
        { separator: true },
        { label: 'Refresh', action: 'refresh' },
      ],
    },
    { id: 'favorites', label: 'Favorites', disabled: true },
    { id: 'tools', label: 'Tools', disabled: true },
    { id: 'help', label: 'Help', disabled: true },
  ];

  const toolbarItems = [
    { type: 'button', id: 'back', icon: '/gui/toolbar/back.webp', label: 'Back', action: 'back', disabled: true },
    { type: 'button', id: 'forward', icon: '/gui/toolbar/forward.webp', label: 'Forward', action: 'forward', disabled: true },
    { type: 'button', id: 'up', icon: '/gui/toolbar/up.webp', label: 'Up', action: 'up', disabled: true },
    { type: 'separator' },
    { type: 'button', id: 'search', icon: '/gui/toolbar/search.webp', label: 'Search', action: 'search', disabled: true },
    { type: 'button', id: 'folders', icon: '/gui/toolbar/favorites.webp', label: 'Folders', action: 'folders', disabled: true },
    { type: 'separator' },
    { type: 'button', id: 'views', icon: '/gui/toolbar/views.webp', label: 'Views', action: 'views', hasDropdown: true },
  ];

  const statusText = selectedItems.length > 0
    ? `${selectedItems.length} object(s) selected`
    : `${contents.length} object(s)`;

  const recycleBinIcon = contents.length > 0 ? XP_ICONS.recycleBinFull : XP_ICONS.recycleBinEmpty;

  // Context menu items for items
  const itemContextMenuItems = [
    { label: 'Restore', onClick: handleRestore },
    { type: 'divider' },
    { label: 'Cut', disabled: true },
    { type: 'divider' },
    { label: 'Delete', onClick: handleDeletePermanently },
    { type: 'divider' },
    { label: 'Properties', disabled: true },
  ];

  // Context menu items for background
  const backgroundContextMenuItems = [
    { label: 'Empty Recycle Bin', onClick: handleEmptyRecycleBin, disabled: contents.length === 0 },
    { type: 'divider' },
    { label: 'Paste', disabled: true },
    { type: 'divider' },
    { label: 'Properties', disabled: true },
  ];

  // Render item based on view mode
  const renderItem = (item) => {
    const isSelected = selectedItems.includes(item.id);
    const fileType = getFileType(item);
    const fileSize = formatSize(item.size);

    switch (viewMode) {
      case 'details':
        return (
          <DetailsRow
            key={item.id}
            $selected={isSelected}
            onClick={(e) => handleItemClick(e, item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            <DetailsCell $width="40%">
              <DetailsIcon src={item.icon || XP_ICONS.file} alt="" />
              <span>{item.name}</span>
            </DetailsCell>
            <DetailsCell $width="15%">{item.originalLocation || ''}</DetailsCell>
            <DetailsCell $width="20%">{fileType}</DetailsCell>
            <DetailsCell $width="10%">{fileSize}</DetailsCell>
            <DetailsCell $width="15%">{item.deletedAt ? new Date(item.deletedAt).toLocaleDateString() : ''}</DetailsCell>
          </DetailsRow>
        );
      case 'list':
        return (
          <ListItem
            key={item.id}
            $selected={isSelected}
            onClick={(e) => handleItemClick(e, item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            <ListIcon src={item.icon || XP_ICONS.file} alt="" />
            <ListName $selected={isSelected}>{item.name}</ListName>
          </ListItem>
        );
      case 'tiles':
        return (
          <TileItem
            key={item.id}
            $selected={isSelected}
            onClick={(e) => handleItemClick(e, item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            <TileIcon src={item.icon || XP_ICONS.file} alt="" $selected={isSelected} />
            <TileInfo>
              <TileName $selected={isSelected}>{item.name}</TileName>
              <TileType>{fileType}</TileType>
              <TileSize>{fileSize}</TileSize>
            </TileInfo>
          </TileItem>
        );
      case 'thumbnails':
        return (
          <ThumbnailItem
            key={item.id}
            $selected={isSelected}
            onClick={(e) => handleItemClick(e, item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            <ThumbnailImageWrapper $selected={isSelected}>
              <ThumbnailIcon src={item.icon || XP_ICONS.file} alt="" />
            </ThumbnailImageWrapper>
            <ThumbnailName $selected={isSelected}>{item.name}</ThumbnailName>
          </ThumbnailItem>
        );
      default: // icons
        return (
          <FileItem
            key={item.id}
            $selected={isSelected}
            onClick={(e) => handleItemClick(e, item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            <FileIcon src={item.icon || XP_ICONS.file} alt="" $selected={isSelected} />
            <FileName $selected={isSelected}>{item.name}</FileName>
          </FileItem>
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
      addressTitle="Recycle Bin"
      addressIcon={recycleBinIcon}
      statusFields={statusText}
    >
      <OuterWrapper>
        <Container ref={containerRef} tabIndex={0} onClick={handleContainerClick}>
          <MainLayout>
            <TaskPanel width={180}>
              <TaskPanel.Section title="Recycle Bin Tasks" variant="primary">
                <TaskPanel.Item
                  icon={XP_ICONS.recycleBinEmpty}
                  onClick={handleEmptyRecycleBin}
                  disabled={contents.length === 0}
                >
                  Empty the Recycle Bin
                </TaskPanel.Item>
                <TaskPanel.Item
                  icon={XP_ICONS.restore || XP_ICONS.folder}
                  onClick={handleRestoreAll}
                  disabled={contents.length === 0}
                >
                  Restore all items
                </TaskPanel.Item>
              </TaskPanel.Section>
              <TaskPanel.Section title="Other Places">
                <TaskPanel.Item icon={XP_ICONS.desktop || XP_ICONS.folder} onClick={() => navigateToFolder(SYSTEM_IDS.DESKTOP)}>
                  Desktop
                </TaskPanel.Item>
                <TaskPanel.Item icon={XP_ICONS.myDocuments} onClick={() => navigateToFolder(SYSTEM_IDS.MY_DOCUMENTS)}>
                  My Documents
                </TaskPanel.Item>
                <TaskPanel.Item icon={XP_ICONS.myComputer} onClick={() => openApp('My Computer')}>
                  My Computer
                </TaskPanel.Item>
                <TaskPanel.Item icon={XP_ICONS.networkPlaces || XP_ICONS.folder} disabled>
                  My Network Places
                </TaskPanel.Item>
              </TaskPanel.Section>
              <TaskPanel.Section title="Details" defaultExpanded={true}>
                {selectedItems.length === 0 ? (
                  <>
                    <TaskPanel.Text><strong>Recycle Bin</strong></TaskPanel.Text>
                    <TaskPanel.Text>System Folder</TaskPanel.Text>
                  </>
                ) : selectedItems.length === 1 ? (
                  <>
                    <TaskPanel.Text><strong>{fileSystem[selectedItems[0]]?.name}</strong></TaskPanel.Text>
                    <TaskPanel.Text>{getFileType(fileSystem[selectedItems[0]])}</TaskPanel.Text>
                    {fileSystem[selectedItems[0]]?.size && (
                      <TaskPanel.Text>Size: {formatSize(fileSystem[selectedItems[0]]?.size)}</TaskPanel.Text>
                    )}
                  </>
                ) : (
                  <TaskPanel.Text><strong>{selectedItems.length} objects selected</strong></TaskPanel.Text>
                )}
              </TaskPanel.Section>
            </TaskPanel>

            <ContentArea ref={contentRef} onContextMenu={(e) => handleContextMenu(e, null)}>
              {viewMode === 'details' && (
                <DetailsHeader>
                  <DetailsHeaderCell $width="40%">Name</DetailsHeaderCell>
                  <DetailsHeaderCell $width="15%">Original Location</DetailsHeaderCell>
                  <DetailsHeaderCell $width="20%">Type</DetailsHeaderCell>
                  <DetailsHeaderCell $width="10%">Size</DetailsHeaderCell>
                  <DetailsHeaderCell $width="15%">Date Deleted</DetailsHeaderCell>
                </DetailsHeader>
              )}
              <Content $viewMode={viewMode}>
                {contents.length === 0 ? (
                  <EmptyMessage>
                    The Recycle Bin is empty.
                  </EmptyMessage>
                ) : (
                  contents.map(renderItem)
                )}
              </Content>
            </ContentArea>
          </MainLayout>

          {contextMenu && (
            <ContextMenu
              overlayType="fixed"
              zIndex={10000}
              position={{ x: contextMenu.x, y: contextMenu.y }}
              items={contextMenu.isItem ? itemContextMenuItems : backgroundContextMenuItems}
              onClose={closeContextMenu}
            />
          )}
        </Container>

        {showViewMenu && (
          <ViewMenu style={{ top: viewMenuPosition.top, left: viewMenuPosition.left }}>
            <ViewMenuItem onClick={() => { setViewMode('thumbnails'); setShowViewMenu(false); }} $active={viewMode === 'thumbnails'}>
              <img src="/gui/toolbar/view-thumbnails.png" alt="" onError={(e) => e.target.style.display = 'none'} />
              <span>Thumbnails</span>
            </ViewMenuItem>
            <ViewMenuItem onClick={() => { setViewMode('tiles'); setShowViewMenu(false); }} $active={viewMode === 'tiles'}>
              <img src="/gui/toolbar/view-tiles.png" alt="" onError={(e) => e.target.style.display = 'none'} />
              <span>Tiles</span>
            </ViewMenuItem>
            <ViewMenuItem onClick={() => { setViewMode('icons'); setShowViewMenu(false); }} $active={viewMode === 'icons'}>
              <img src="/gui/toolbar/view-icons.png" alt="" onError={(e) => e.target.style.display = 'none'} />
              <span>Icons</span>
            </ViewMenuItem>
            <ViewMenuItem onClick={() => { setViewMode('list'); setShowViewMenu(false); }} $active={viewMode === 'list'}>
              <img src="/gui/toolbar/view-list.png" alt="" onError={(e) => e.target.style.display = 'none'} />
              <span>List</span>
            </ViewMenuItem>
            <ViewMenuItem onClick={() => { setViewMode('details'); setShowViewMenu(false); }} $active={viewMode === 'details'}>
              <img src="/gui/toolbar/view-details.png" alt="" onError={(e) => e.target.style.display = 'none'} />
              <span>Details</span>
            </ViewMenuItem>
          </ViewMenu>
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
  overflow: hidden;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  outline: none;
  position: relative;
  overflow: hidden;
`;

const MainLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border: 2px inset #808080;
  overflow: hidden;
`;

const Content = styled.div`
  flex: 1;
  padding: 8px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: ${({ $viewMode }) => $viewMode === 'details' ? '0' : $viewMode === 'list' ? '2px' : '4px'};
  flex-direction: ${({ $viewMode }) => $viewMode === 'details' || $viewMode === 'list' ? 'column' : 'row'};
  background: white;
`;

const EmptyMessage = styled.div`
  width: 100%;
  text-align: center;
  color: #808080;
  margin-top: 60px;
  font-size: 11px;
`;

// Icon View Styles
const FileItem = styled.div`
  width: 75px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.2)' : 'transparent'};
  border-color: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.5)' : 'transparent'};

  &:hover {
    background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.3)' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const FileIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
  ${({ $selected }) => $selected && `
    filter: drop-shadow(1px 1px 0 #0b61ff) drop-shadow(-1px -1px 0 #0b61ff);
  `}
`;

const FileName = styled.span`
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  line-height: 1.2;
  max-height: 2.4em;
  overflow: hidden;
  ${({ $selected }) => $selected && `
    background: #0b61ff;
    color: white;
    padding: 0 2px;
  `}
`;

// Tile View Styles
const TileItem = styled.div`
  width: 200px;
  min-height: 60px;
  padding: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.2)' : 'transparent'};
  border-color: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.5)' : 'transparent'};

  &:hover {
    background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.3)' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const TileIcon = styled.img`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  ${({ $selected }) => $selected && `
    filter: drop-shadow(1px 1px 0 #0b61ff) drop-shadow(-1px -1px 0 #0b61ff);
  `}
`;

const TileInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TileName = styled.span`
  font-size: 11px;
  font-weight: ${({ $selected }) => $selected ? 'bold' : 'normal'};
  word-break: break-word;
  line-height: 1.2;
  ${({ $selected }) => $selected && `
    color: #0b61ff;
  `}
`;

const TileType = styled.span`
  font-size: 11px;
  color: #808080;
`;

const TileSize = styled.span`
  font-size: 11px;
  color: #808080;
`;

// List View Styles
const ListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? '#0b61ff' : 'transparent'};

  &:hover {
    background: ${({ $selected }) => $selected ? '#0b61ff' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const ListIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const ListName = styled.span`
  font-size: 11px;
  color: ${({ $selected }) => $selected ? 'white' : 'inherit'};
`;

// Details View Styles
const DetailsHeader = styled.div`
  display: flex;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border-bottom: 1px solid #808080;
  font-size: 11px;
  font-weight: bold;
`;

const DetailsHeaderCell = styled.div`
  width: ${props => props.$width};
  padding: 2px 8px;
  border-right: 1px solid #808080;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: linear-gradient(180deg, #fff 0%, #d8d0c4 100%);
  }
`;

const DetailsRow = styled.div`
  display: flex;
  font-size: 11px;
  background: ${({ $selected }) => $selected ? '#0b61ff' : 'transparent'};
  color: ${({ $selected }) => $selected ? 'white' : 'inherit'};
  cursor: pointer;

  &:hover {
    background: ${({ $selected }) => $selected ? '#0b61ff' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const DetailsCell = styled.div`
  width: ${props => props.$width};
  padding: 2px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DetailsIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

// Thumbnail View Styles
const ThumbnailItem = styled.div`
  width: 120px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.2)' : 'transparent'};
  border-color: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.5)' : 'transparent'};

  &:hover {
    background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.3)' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const ThumbnailImageWrapper = styled.div`
  width: 96px;
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid ${({ $selected }) => $selected ? '#0b61ff' : '#c0c0c0'};
  margin-bottom: 4px;
`;

const ThumbnailIcon = styled.img`
  max-width: 64px;
  max-height: 64px;
`;

const ThumbnailName = styled.span`
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  line-height: 1.2;
  max-height: 2.4em;
  overflow: hidden;
  ${({ $selected }) => $selected && `
    background: #0b61ff;
    color: white;
    padding: 0 2px;
  `}
`;

// View Menu
const ViewMenu = styled.div`
  position: fixed;
  background: #f5f5f5;
  border: 1px solid #808080;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  padding: 4px 0;
  z-index: 10001;
`;

const ViewMenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  font-size: 11px;
  cursor: pointer;
  background: ${({ $active }) => $active ? 'rgba(11, 97, 255, 0.2)' : 'transparent'};

  &:hover {
    background: #0b61ff;
    color: white;
  }

  img {
    width: 16px;
    height: 16px;
  }
`;

export default RecycleBin;
