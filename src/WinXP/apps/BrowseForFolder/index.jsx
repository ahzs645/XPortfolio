import { useState, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useFileSystem, SYSTEM_IDS, XP_ICONS } from '../../../contexts/FileSystemContext';

// Container
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
  padding: 12px;
`;

const Description = styled.div`
  font-size: 11px;
  color: #000;
  margin-bottom: 12px;
`;

const TreeContainer = styled.div`
  flex: 1;
  background: #fff;
  border: 1px solid #7f9db9;
  overflow: auto;
  min-height: 200px;
`;

const TreeItemRow = styled.div`
  display: flex;
  align-items: center;
  padding: 1px 4px;
  padding-left: ${props => props.$level * 16 + 4}px;
  cursor: pointer;
  background: ${props => props.$selected ? '#316ac5' : 'transparent'};
  color: ${props => props.$selected ? '#fff' : '#000'};
  font-size: 11px;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background: ${props => props.$selected ? '#316ac5' : '#e8f0fa'};
  }
`;

const ExpandButton = styled.span`
  width: 9px;
  height: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 3px;
  border: 1px solid #808080;
  background: #fff;
  font-size: 9px;
  font-family: monospace;
  line-height: 1;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    border-color: #000;
  }
`;

const ExpandPlaceholder = styled.span`
  width: 9px;
  height: 9px;
  margin-right: 3px;
  flex-shrink: 0;
`;

const ItemIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 4px;
  flex-shrink: 0;
`;

const ItemLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding-top: 8px;
`;

const Button = styled.button`
  min-width: 90px;
  padding: 4px 14px;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: linear-gradient(180deg, #fff0cf 0%, #fdd889 50%, #fbc761 100%);
  }

  &:active:not(:disabled) {
    background: linear-gradient(180deg, #e5e5de 0%, #e3e3db 8%, #cdcac3 100%);
  }

  &:disabled {
    color: #a0a0a0;
    cursor: default;
    border-color: #a0a0a0;
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

// Icons for different item types (should match XP_ICONS from FileSystemContext)
const TREE_ICONS = {
  desktop: '/icons/xp/Desktop.png',
  myDocuments: '/icons/xp/MyDocuments.png',
  myComputer: '/icons/xp/MyComputer.png',
  folder: '/icons/xp/FolderClosed.png',
  folderOpen: '/icons/xp/FolderOpened.png',
  briefcase: '/icons/xp/Briefcase.png',
  myPictures: '/icons/xp/MyPictures.png',
  myMusic: '/icons/xp/MyMusic.png',
  localDisk: '/icons/xp/LocalDisk.png',
};

function BrowseForFolder({ onClose, onSelect, title = 'Select the target of the shortcut below:' }) {
  const { fileSystem, getFolderContents } = useFileSystem();
  const [selectedId, setSelectedId] = useState('desktop');
  const [expandedIds, setExpandedIds] = useState(['desktop']);

  // Build tree structure from file system (handles all item types)
  const buildTreeNode = useCallback((item) => {
    if (!item) return null;

    // For folders and drives, include children
    const isContainer = item.type === 'folder' || item.type === 'drive';
    const children = isContainer ? (item.children || []) : [];

    const childNodes = children
      .map(childId => fileSystem[childId])
      .filter(Boolean)
      .map(child => buildTreeNode(child))
      .filter(Boolean);

    // Determine icon based on type
    let icon = item.icon;
    if (!icon) {
      if (item.type === 'folder') icon = TREE_ICONS.folder;
      else if (item.type === 'drive') icon = TREE_ICONS.localDisk;
      else icon = TREE_ICONS.folder;
    }

    return {
      id: item.id,
      name: item.name,
      icon,
      type: item.type,
      target: item.target || item.name, // Use target for shortcuts/executables, name otherwise
      fsId: item.id,
      children: childNodes,
      hasChildren: childNodes.length > 0,
      isSelectable: true,
    };
  }, [fileSystem]);

  // Build the complete tree structure
  const treeData = useMemo(() => {
    if (!fileSystem) return [];

    // Get desktop folders (user-created folders on desktop, not system folders)
    const desktopContents = fileSystem[SYSTEM_IDS.DESKTOP]?.children || [];
    const desktopFolders = desktopContents
      .map(id => fileSystem[id])
      .filter(item => item && item.type === 'folder')
      .map(folder => buildFolderNode(folder))
      .filter(Boolean);

    // Build My Documents tree (virtual shortcut in desktop view)
    const myDocumentsNode = buildFolderNode(fileSystem[SYSTEM_IDS.MY_DOCUMENTS]);

    // Build C: drive tree (this now includes Documents and Settings and Program Files)
    const cDriveNode = buildFolderNode(fileSystem[SYSTEM_IDS.C_DRIVE]);

    // My Computer shows Local Disk (C:) with its full structure
    const myComputerChildren = [];

    if (cDriveNode) {
      myComputerChildren.push({
        ...cDriveNode,
        name: 'Local Disk (C:)',
        icon: XP_ICONS.localDisk || TREE_ICONS.localDisk,
        target: 'Local Disk (C:)',
      });
    }

    return [
      {
        id: 'desktop',
        name: 'Desktop',
        icon: TREE_ICONS.desktop,
        type: 'special',
        target: 'Desktop',
        hasChildren: true,
        children: [
          {
            id: 'my-documents-shortcut',
            name: 'My Documents',
            icon: TREE_ICONS.myDocuments,
            type: 'special',
            target: 'My Documents',
            fsId: SYSTEM_IDS.MY_DOCUMENTS,
            hasChildren: myDocumentsNode?.hasChildren || false,
            children: myDocumentsNode?.children || [],
          },
          {
            id: 'my-computer',
            name: 'My Computer',
            icon: TREE_ICONS.myComputer,
            type: 'special',
            target: 'My Computer',
            hasChildren: myComputerChildren.length > 0,
            children: myComputerChildren,
          },
          ...desktopFolders,
        ],
      },
    ];
  }, [fileSystem, buildFolderNode]);

  const toggleExpand = useCallback((id, e) => {
    e.stopPropagation();
    setExpandedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  }, []);

  const handleSelect = useCallback((item) => {
    if (!item.disabled) {
      setSelectedId(item.id);
    }
  }, []);

  const handleDoubleClick = useCallback((item) => {
    if (item.hasChildren) {
      setExpandedIds(prev =>
        prev.includes(item.id)
          ? prev
          : [...prev, item.id]
      );
    }
  }, []);

  const handleOk = useCallback(() => {
    // Find selected item in tree
    const findItem = (items, id) => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children && item.children.length > 0) {
          const found = findItem(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const selected = findItem(treeData, selectedId);
    if (selected && onSelect) {
      onSelect({
        name: selected.name,
        target: selected.target,
        icon: selected.icon,
        type: selected.type,
        fsId: selected.fsId,
      });
    }
    onClose?.();
  }, [selectedId, treeData, onSelect, onClose]);

  const renderTreeItem = (item, level = 0) => {
    const hasChildren = item.hasChildren || (item.children && item.children.length > 0);
    const isExpanded = expandedIds.includes(item.id);
    const isSelected = selectedId === item.id;

    return (
      <div key={item.id}>
        <TreeItemRow
          $level={level}
          $selected={isSelected}
          onClick={() => handleSelect(item)}
          onDoubleClick={() => handleDoubleClick(item)}
          style={{ opacity: item.disabled ? 0.5 : 1 }}
        >
          {hasChildren ? (
            <ExpandButton onClick={(e) => toggleExpand(item.id, e)}>
              {isExpanded ? '−' : '+'}
            </ExpandButton>
          ) : (
            <ExpandPlaceholder />
          )}
          <ItemIcon src={item.icon} alt="" />
          <ItemLabel>{item.name}</ItemLabel>
        </TreeItemRow>
        {hasChildren && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Container>
      <Description>{title}</Description>
      <TreeContainer>
        {treeData.map(item => renderTreeItem(item))}
      </TreeContainer>
      <ButtonRow>
        <Button onClick={() => {}} disabled>Make New Folder</Button>
        <Spacer />
        <Button onClick={handleOk}>OK</Button>
        <Button onClick={onClose}>Cancel</Button>
      </ButtonRow>
    </Container>
  );
}

export default BrowseForFolder;
