import React, { useMemo, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { XP_ICONS } from '../../../../contexts/FileSystemContext';

/**
 * Folder tree navigation pane inspired by the XP "Folders" view.
 * Shows drives/folders and lets users jump between them.
 */
function FolderTree({ roots = [], fileSystem, currentFolder, onNavigate }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set(['my-computer-root']));

  // Expand ancestors of the current folder so it stays visible
  useEffect(() => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.add('my-computer-root');
      let cursor = currentFolder;
      while (cursor) {
        next.add(cursor);
        cursor = fileSystem?.[cursor]?.parent || null;
      }
      return next;
    });
  }, [currentFolder, fileSystem]);

  const rootLookup = useMemo(() => {
    const map = new Map();
    roots.forEach(root => map.set(root.id, root));
    return map;
  }, [roots]);

  const getNode = useCallback((id) => {
    if (rootLookup.has(id)) {
      return rootLookup.get(id);
    }
    const item = fileSystem?.[id];
    if (!item) return null;
    if (item.type !== 'folder' && item.type !== 'drive') return null;
    return {
      id,
      name: item.name,
      icon: item.icon || XP_ICONS.folder,
      type: item.type,
      children: item.children || [],
    };
  }, [fileSystem, rootLookup]);

  const toggleExpanded = (id, hasChildren) => {
    if (!hasChildren) return;
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNavigate = (id) => {
    if (!onNavigate) return;
    if (id === 'my-computer-root') {
      onNavigate(null);
    } else {
      onNavigate(id);
    }
  };

  const renderNode = (id, depth = 0) => {
    const node = getNode(id);
    if (!node) return null;

    const childrenIds = (node.children || []).filter(childId => {
      const child = fileSystem?.[childId];
      return child && (child.type === 'folder' || child.type === 'drive');
    });

    const isExpanded = expandedIds.has(node.id);
    const hasChildren = childrenIds.length > 0;
    const isSelected = (node.id === 'my-computer-root' && currentFolder === null) || currentFolder === node.id;

    return (
      <Node key={node.id}>
        <NodeRow
          $depth={depth}
          $selected={isSelected}
          onClick={() => handleNavigate(node.id)}
          onDoubleClick={() => toggleExpanded(node.id, hasChildren)}
        >
          <Caret
            $visible={hasChildren}
            $expanded={isExpanded}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(node.id, hasChildren);
            }}
          />
          <FolderIcon
            src={isExpanded ? XP_ICONS.folderOpen : (node.icon || XP_ICONS.folder)}
            alt=""
          />
          <NodeLabel>{node.name}</NodeLabel>
        </NodeRow>
        {hasChildren && isExpanded && (
          <Children>
            {childrenIds.map(childId => renderNode(childId, depth + 1))}
          </Children>
        )}
      </Node>
    );
  };

  return (
    <Pane>
      <PaneHeader>Folders</PaneHeader>
      <PaneBody>
        {roots.map(root => renderNode(root.id))}
      </PaneBody>
    </Pane>
  );
}

const Pane = styled.div`
  width: 210px;
  min-width: 210px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f7f7f7 0%, #ededed 100%);
  border-right: 1px solid #b5b5b5;
  box-sizing: border-box;
`;

const PaneHeader = styled.div`
  padding: 8px 10px;
  font-size: 11px;
  font-weight: bold;
  color: #215dc6;
  background: white;
  border-bottom: 1px solid #c3c3c3;
`;

const PaneBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 6px 6px 12px 6px;
  background: white;
`;

const Node = styled.div`
  display: flex;
  flex-direction: column;
`;

const NodeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border-radius: 3px;
  margin-left: ${({ $depth }) => $depth * 10}px;
  cursor: default;
  background: ${({ $selected }) => $selected ? '#316ac5' : 'transparent'};
  color: ${({ $selected }) => $selected ? 'white' : 'black'};

  &:hover {
    background: ${({ $selected }) => $selected ? '#316ac5' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const Children = styled.div`
  margin-left: 10px;
  border-left: 1px dashed #c3c3c3;
`;

const NodeLabel = styled.span`
  font-size: 11px;
  user-select: none;
`;

const FolderIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const Caret = styled.div`
  width: 10px;
  height: 10px;
  margin-left: 4px;
  flex-shrink: 0;
  cursor: ${({ $visible }) => $visible ? 'pointer' : 'default'};
  visibility: ${({ $visible }) => $visible ? 'visible' : 'hidden'};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 5px solid ${({ $expanded }) => $expanded ? '#215dc6' : '#555'};
    transform: rotate(${({ $expanded }) => $expanded ? '90deg' : '0deg'});
    transform-origin: 3px 4px;
  }
`;

export default FolderTree;
