import { useState, useCallback, useMemo } from 'react';
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
  overflow: auto;
  min-height: 200px;

  .tree-view {
    border: none;
    padding: 0;
    margin: 0;
  }

  .tree-view summary {
    list-style: none;
  }

  .tree-view summary::-webkit-details-marker {
    display: none;
  }

  .expand-button {
    width: 9px;
    height: 9px;
    margin-right: 5px;
    border: 1px solid #808080;
    background: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    line-height: 1;
    cursor: pointer;
    flex-shrink: 0;
    font-family: monospace;
  }

  .tree-item-content.selected {
    background: #316ac5;
    color: #fff;
  }

  .tree-item-content {
    display: flex;
    align-items: center;
    padding: 1px 2px;
    cursor: pointer;
    user-select: none;
  }


  .tree-item-icon {
    width: 16px;
    height: 16px;
    margin-right: 4px;
    flex-shrink: 0;
  }

  .tree-item-label {
    white-space: nowrap;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  margin-top: 12px;
  padding-top: 8px;
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
  const { fileSystem } = useFileSystem();
  const [selectedId, setSelectedId] = useState('desktop');
  const [expandedIds, setExpandedIds] = useState([]);

  // Build tree structure from file system (handles all item types including files and executables)
  const buildTreeNode = useCallback((item) => {
    if (!item) return null;

    // Skip shortcuts - we don't want to create shortcuts to shortcuts
    if (item.type === 'shortcut') return null;

    // For folders and drives, include children
    const isContainer = item.type === 'folder' || item.type === 'drive';
    const children = isContainer ? (item.children || []) : [];

    // Build child nodes - include folders, files, executables (but not shortcuts)
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

    // Get ALL desktop items (folders, files, shortcuts, etc.)
    const desktopContents = fileSystem[SYSTEM_IDS.DESKTOP]?.children || [];
    const desktopItems = desktopContents
      .map(id => fileSystem[id])
      .filter(Boolean)
      .map(item => buildTreeNode(item))
      .filter(Boolean);

    // Build My Documents tree (virtual shortcut in desktop view)
    const myDocumentsNode = buildTreeNode(fileSystem[SYSTEM_IDS.MY_DOCUMENTS]);

    // Build C: drive tree (this now includes Documents and Settings and Program Files)
    const cDriveNode = buildTreeNode(fileSystem[SYSTEM_IDS.C_DRIVE]);

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
          ...desktopItems,
        ],
      },
    ];
  }, [fileSystem, buildTreeNode]);

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

  const renderTreeItem = (item) => {
    const hasChildren = item.hasChildren || (item.children && item.children.length > 0);
    const isExpanded = expandedIds.includes(item.id);
    const isSelected = selectedId === item.id;

    if (hasChildren) {
      return (
        <li key={item.id}>
          <div
            className={`tree-item-content ${isSelected ? 'selected' : ''}`}
            onClick={() => setSelectedId(item.id)}
            style={{ opacity: item.disabled ? 0.5 : 1 }}
          >
            <span
              className="expand-button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedIds(prev =>
                  isExpanded
                    ? prev.filter(id => id !== item.id)
                    : [...prev, item.id]
                );
              }}
            >
              {isExpanded ? '−' : '+'}
            </span>
            <img src={item.icon} alt="" className="tree-item-icon" />
            <span className="tree-item-label">{item.name}</span>
          </div>
          {isExpanded && (
            <ul>
              {item.children.map(child => renderTreeItem(child))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.id}>
        <div
          className={`tree-item-content ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedId(item.id)}
          style={{ opacity: item.disabled ? 0.5 : 1 }}
        >
          <img src={item.icon} alt="" className="tree-item-icon" />
          <span className="tree-item-label">{item.name}</span>
        </div>
      </li>
    );
  };

  return (
    <Container>
      <Description>{title}</Description>
      <TreeContainer>
        <ul className="tree-view">
          {treeData.map(item => renderTreeItem(item))}
        </ul>
      </TreeContainer>
      <ButtonRow>
        <button className="btn" onClick={() => {}} disabled>Make New Folder</button>
        <Spacer />
        <button className="btn" onClick={handleOk}>OK</button>
        <button className="btn" onClick={onClose}>Cancel</button>
      </ButtonRow>
    </Container>
  );
}

export default BrowseForFolder;
