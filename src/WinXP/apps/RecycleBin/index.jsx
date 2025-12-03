import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useFileSystem, SYSTEM_IDS, XP_ICONS } from '../../../contexts/FileSystemContext';
import { ProgramLayout } from '../../../components';

function RecycleBin({ onClose, onMinimize, onMaximize }) {
  const {
    fileSystem,
    isLoading,
    getFolderContents,
    restoreFromRecycleBin,
    deleteItem,
    emptyRecycleBin,
  } = useFileSystem();

  const [selectedItems, setSelectedItems] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);

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

  const handleRestore = useCallback(async () => {
    for (const id of selectedItems) {
      await restoreFromRecycleBin(id);
    }
    setSelectedItems([]);
    setContextMenu(null);
  }, [selectedItems, restoreFromRecycleBin]);

  const handleDeletePermanently = useCallback(async () => {
    for (const id of selectedItems) {
      await deleteItem(id);
    }
    setSelectedItems([]);
    setContextMenu(null);
  }, [selectedItems, deleteItem]);

  const handleEmptyRecycleBin = useCallback(async () => {
    if (contents.length === 0) return;
    if (window.confirm('Are you sure you want to permanently delete all items in the Recycle Bin?')) {
      await emptyRecycleBin();
    }
    setContextMenu(null);
  }, [contents.length, emptyRecycleBin]);

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
      default:
        console.log('Menu action:', action);
    }
  }, [handleRestore, handleDeletePermanently, handleEmptyRecycleBin]);

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
      ],
    },
    { id: 'view', label: 'View', disabled: true },
    { id: 'help', label: 'Help', disabled: true },
  ];

  const statusText = selectedItems.length > 0
    ? `${selectedItems.length} object(s) selected`
    : `${contents.length} object(s)`;

  const recycleBinIcon = contents.length > 0 ? XP_ICONS.recycleBinFull : XP_ICONS.recycleBinEmpty;

  return (
    <ProgramLayout
      windowActions={{ onClose, onMinimize, onMaximize }}
      menus={menus}
      onMenuAction={handleMenuAction}
      addressTitle="Recycle Bin"
      addressIcon={recycleBinIcon}
      statusFields={statusText}
    >
      <Container tabIndex={0} onClick={handleContainerClick}>
        <Content onContextMenu={(e) => handleContextMenu(e, null)}>
          {contents.length === 0 ? (
            <EmptyMessage>
              The Recycle Bin is empty.
            </EmptyMessage>
          ) : (
            contents.map(item => (
              <FileItem
                key={item.id}
                $selected={selectedItems.includes(item.id)}
                onClick={(e) => handleItemClick(e, item)}
                onContextMenu={(e) => handleContextMenu(e, item)}
              >
                <FileIcon src={item.icon || XP_ICONS.folder} alt="" />
                <FileName>{item.name}</FileName>
              </FileItem>
            ))
          )}
        </Content>

        {contextMenu && (
          <ContextMenuOverlay>
            <ContextMenuBox style={{ left: contextMenu.x, top: contextMenu.y }}>
              {contextMenu.isItem ? (
                <>
                  <MenuItem onClick={handleRestore}>Restore</MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={handleDeletePermanently}>Delete</MenuItem>
                </>
              ) : (
                <>
                  <MenuItem onClick={handleEmptyRecycleBin} disabled={contents.length === 0}>
                    Empty Recycle Bin
                  </MenuItem>
                </>
              )}
            </ContextMenuBox>
          </ContextMenuOverlay>
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

const Content = styled.div`
  flex: 1;
  padding: 8px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 4px;
  background: white;
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

export default RecycleBin;
