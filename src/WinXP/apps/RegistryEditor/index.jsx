import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useRegistry } from '../../../contexts/RegistryContext';
import { useApp } from '../../../contexts/AppContext';

const REG_TYPES = ['REG_SZ', 'REG_DWORD', 'REG_BINARY', 'REG_MULTI_SZ', 'REG_EXPAND_SZ'];

const TYPE_ICONS = {
  REG_SZ: 'ab',
  REG_EXPAND_SZ: 'ab',
  REG_MULTI_SZ: 'ab',
  REG_DWORD: '#',
  REG_BINARY: '01',
};

// Icon paths
const COMPUTER_ICON = '/icons/luna/computer_explorer.png';
const FOLDER_ICON_OPEN = '/icons/luna/directory_open.png';
const FOLDER_ICON_CLOSED = '/icons/luna/directory_closed.png';

function RegistryEditor({ onClose, onMinimize }) {
  const {
    getRootKeys,
    getSubKeys,
    getValues,
    setValue,
    deleteValue,
    createKey,
    deleteKey,
    isBoundValue,
    isProtectedKey,
  } = useRegistry();

  const { openApp } = useApp();

  const [selectedPath, setSelectedPath] = useState('');
  const [expandedKeys, setExpandedKeys] = useState(new Set(['HKEY_LOCAL_MACHINE', 'HKEY_CURRENT_USER']));
  const [, setRenamingValue] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const containerRef = useRef(null);

  const toggleExpand = useCallback((path) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const handleSelectKey = useCallback((path) => {
    setSelectedPath(path);
    setContextMenu(null);
  }, []);

  const handleTreeNodeClick = useCallback((path) => {
    handleSelectKey(path);
    // Also expand if not expanded
    if (!expandedKeys.has(path)) {
      toggleExpand(path);
    }
  }, [handleSelectKey, expandedKeys, toggleExpand]);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => { setContextMenu(null); setSubMenuOpen(false); };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [contextMenu]);

  // Values for currently selected key
  const currentValues = selectedPath ? getValues(selectedPath) : {};

  // Handle creating a new value (opens as separate window)
  const handleNewValue = useCallback((type) => {
    setContextMenu(null);
    openApp(
      'Registry Editor - New Value',
      {
        type,
        selectedPath,
        onSave: (path, name, valType, data) => {
          setValue(path, name, valType, data);
        },
      },
      {
        header: {
          title: `New ${type} Value`,
        },
        defaultOffset: {
          x: 270 + Math.round(Math.random() * 40),
          y: 200 + Math.round(Math.random() * 40),
        },
      },
    );
  }, [openApp, selectedPath, setValue]);

  // Handle editing a value (opens as separate window)
  const handleEditValue = useCallback((name, val) => {
    const dialogTitle = val.type === 'REG_DWORD'
      ? 'Edit DWORD Value'
      : val.type === 'REG_BINARY'
        ? 'Edit Binary Value'
        : 'Edit String';
    openApp(
      'Registry Editor - Edit Value',
      {
        name,
        type: val.type,
        data: val.type === 'REG_DWORD' ? val.data : val.data,
        selectedPath,
        onSave: (path, valName, valType, data) => {
          setValue(path, valName, valType, data);
        },
      },
      {
        header: {
          title: dialogTitle,
        },
        defaultOffset: {
          x: 250 + Math.round(Math.random() * 40),
          y: 180 + Math.round(Math.random() * 40),
        },
      },
    );
  }, [openApp, selectedPath, setValue]);

  // Handle deleting a value
  const handleDeleteValue = useCallback((name) => {
    if (name === '(Default)') return; // Can't delete default
    deleteValue(selectedPath, name);
  }, [selectedPath, deleteValue]);

  // Handle creating a new key (opens as separate window)
  const handleNewKey = useCallback(() => {
    setContextMenu(null);
    openApp(
      'Registry Editor - New Key',
      {
        selectedPath,
        onSave: (path, name) => {
          createKey(path, name);
          setExpandedKeys(prev => new Set([...prev, path]));
        },
      },
      {
        defaultOffset: {
          x: 270 + Math.round(Math.random() * 40),
          y: 200 + Math.round(Math.random() * 40),
        },
      },
    );
  }, [openApp, selectedPath, createKey]);

  // Handle deleting a key
  const handleDeleteKey = useCallback(() => {
    if (!selectedPath) return;
    const parentParts = selectedPath.split('\\');
    const name = parentParts.pop();
    const parentPath = parentParts.join('\\');
    if (parentPath) {
      deleteKey(parentPath, name);
      setSelectedPath(parentPath);
    }
  }, [selectedPath, deleteKey]);

  // Render tree recursively
  const renderTreeNode = (name, path, depth = 0, isLast = false) => {
    const isExpanded = expandedKeys.has(path);
    const isSelected = selectedPath === path;
    const subKeys = getSubKeys(path);
    const hasChildren = subKeys.length > 0;
    const iconSrc = depth === 0 ? COMPUTER_ICON : (isExpanded ? FOLDER_ICON_OPEN : FOLDER_ICON_CLOSED);

    return (
      <TreeLi key={path} $isLast={isLast}>
        <TreeItemRow
          $selected={isSelected}
          onClick={() => handleTreeNodeClick(path)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSelectKey(path);
            setContextMenu({ x: e.clientX, y: e.clientY, type: 'tree', path });
          }}
        >
          {hasChildren ? (
            <ExpandBox
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(path);
              }}
            >
              {isExpanded ? '\u2212' : '+'}
            </ExpandBox>
          ) : (
            <ExpandBoxPlaceholder />
          )}
          <TreeImg src={iconSrc} alt="" draggable={false} />
          <TreeLabel $selected={isSelected}>{name}</TreeLabel>
        </TreeItemRow>
        {isExpanded && hasChildren && (
          <TreeUl>
            {subKeys.map((sub, i) =>
              renderTreeNode(sub, `${path}\\${sub}`, depth + 1, i === subKeys.length - 1)
            )}
          </TreeUl>
        )}
      </TreeLi>
    );
  };

  const formatDisplayData = (val) => {
    if (!val) return '';
    if (val.type === 'REG_DWORD') {
      const num = val.data || 0;
      return `0x${num.toString(16).padStart(8, '0')} (${num})`;
    }
    if (val.type === 'REG_BINARY') {
      return val.data || '(zero-length binary value)';
    }
    return val.data !== undefined && val.data !== '' ? String(val.data) : '(value not set)';
  };

  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'newKey': handleNewKey(); break;
      case 'newStringValue': handleNewValue('REG_SZ'); break;
      case 'newDwordValue': handleNewValue('REG_DWORD'); break;
      case 'newBinaryValue': handleNewValue('REG_BINARY'); break;
      case 'deleteKey': handleDeleteKey(); break;
      default: break;
    }
  }, [handleNewKey, handleNewValue, handleDeleteKey]);

  const selectedKeyProtected = selectedPath ? isProtectedKey(selectedPath) : false;
  const selectedValueBound = contextMenu?.type === 'value'
    ? isBoundValue(selectedPath, contextMenu.name)
    : false;

  const menus = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'Import...', disabled: true },
        { label: 'Export...', disabled: true },
        { separator: true },
        { label: 'Exit', action: 'exitProgram' },
      ],
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'New Key', action: 'newKey', disabled: !selectedPath },
        { separator: true },
        { label: 'New String Value', action: 'newStringValue', disabled: !selectedPath },
        { label: 'New DWORD Value', action: 'newDwordValue', disabled: !selectedPath },
        { label: 'New Binary Value', action: 'newBinaryValue', disabled: !selectedPath },
        { separator: true },
        { label: 'Delete Key', action: 'deleteKey', disabled: !selectedPath || !selectedPath.includes('\\') || selectedKeyProtected },
      ],
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Status Bar', disabled: true },
        { separator: true },
        { label: 'Refresh', disabled: true },
      ],
    },
    {
      id: 'favorites',
      label: 'Favorites',
      items: [
        { label: 'Add to Favorites...', disabled: true },
        { label: 'Remove Favorite...', disabled: true },
      ],
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Help Topics', disabled: true },
        { separator: true },
        { label: 'About Registry Editor', disabled: true },
      ],
    },
  ];

  return (
    <ProgramLayout
      menus={menus}
      onMenuAction={handleMenuAction}
      windowActions={{ onClose, onMinimize }}
      showMenuBar={true}
      showToolbar={false}
      showAddressBar={false}
      statusFields={selectedPath ? [selectedPath] : ['My Computer']}
      showStatusBar={true}
    >
      <Container ref={containerRef}>
        {/* Tree Pane */}
        <TreePane>
          <TreeScroll>
            <TreeViewRoot>
              <TreeLi $isLast={true}>
                <TreeItemRow
                  $selected={selectedPath === ''}
                  onClick={() => { setSelectedPath(''); setContextMenu(null); }}
                >
                  <ExpandBox
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {'\u2212'}
                  </ExpandBox>
                  <TreeImg src={COMPUTER_ICON} alt="" draggable={false} />
                  <TreeLabel $selected={selectedPath === ''} style={{ fontWeight: 'bold' }}>My Computer</TreeLabel>
                </TreeItemRow>
                <TreeUl>
                  {getRootKeys().map((rootKey, i, arr) =>
                    renderTreeNode(rootKey, rootKey, 0, i === arr.length - 1)
                  )}
                </TreeUl>
              </TreeLi>
            </TreeViewRoot>
          </TreeScroll>
        </TreePane>

        {/* Divider */}
        <Divider />

        {/* Value Pane */}
        <ValuePane
          onContextMenu={(e) => {
            // Only trigger if right-clicking on empty space (not on a value row)
            if (e.target.closest('tr') && e.target.closest('tbody')) return;
            e.preventDefault();
            if (selectedPath) {
              setContextMenu({ x: e.clientX, y: e.clientY, type: 'pane' });
            }
          }}
        >
          <ValueTable>
            <thead>
              <tr>
                <ValueTH style={{ width: '30%' }}>Name</ValueTH>
                <ValueTH style={{ width: '20%' }}>Type</ValueTH>
                <ValueTH style={{ width: '50%' }}>Data</ValueTH>
              </tr>
            </thead>
            <tbody>
              {Object.entries(currentValues).map(([name, val]) => (
                <ValueRow
                  key={name}
                  onDoubleClick={() => handleEditValue(name, val)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, type: 'value', name, val });
                  }}
                >
                  <ValueTD>
                    <ValueIcon>{TYPE_ICONS[val.type] || 'ab'}</ValueIcon>
                    {name}
                  </ValueTD>
                  <ValueTD>{val.type}</ValueTD>
                  <ValueTD>{formatDisplayData(val)}</ValueTD>
                </ValueRow>
              ))}
              {Object.keys(currentValues).length === 0 && selectedPath && (
                <ValueRow>
                  <ValueTD colSpan={3} style={{ color: '#888', fontStyle: 'italic' }}>
                    (No values)
                  </ValueTD>
                </ValueRow>
              )}
            </tbody>
          </ValueTable>
        </ValuePane>

        {/* Context Menu */}
        {contextMenu && (
          <CtxMenu style={{ left: contextMenu.x, top: contextMenu.y }}>
            {contextMenu.type === 'tree' && (
              <>
                <CtxSubmenuItem
                  onMouseEnter={() => setSubMenuOpen(true)}
                  onMouseLeave={() => setSubMenuOpen(false)}
                >
                  <span>New</span>
                  <CtxArrow>{'\u25B6'}</CtxArrow>
                  {subMenuOpen && (
                    <CtxSubMenu>
                      <CtxItem onClick={handleNewKey}>Key</CtxItem>
                      <CtxSep />
                      <CtxItem onClick={() => handleNewValue('REG_SZ')}>String Value</CtxItem>
                      <CtxItem onClick={() => handleNewValue('REG_BINARY')}>Binary Value</CtxItem>
                      <CtxItem onClick={() => handleNewValue('REG_DWORD')}>DWORD Value</CtxItem>
                      <CtxItem onClick={() => handleNewValue('REG_MULTI_SZ')}>Multi-String Value</CtxItem>
                      <CtxItem onClick={() => handleNewValue('REG_EXPAND_SZ')}>Expandable String Value</CtxItem>
                    </CtxSubMenu>
                  )}
                </CtxSubmenuItem>
                {selectedPath && selectedPath.includes('\\') && !selectedKeyProtected && (
                  <>
                    <CtxSep />
                    <CtxItem onClick={handleDeleteKey}>Delete</CtxItem>
                  </>
                )}
              </>
            )}
            {contextMenu.type === 'value' && (
              <>
                <CtxItem onClick={() => { handleEditValue(contextMenu.name, contextMenu.val); setContextMenu(null); }}>Modify...</CtxItem>
                {!selectedValueBound && (
                  <>
                    <CtxSep />
                    {contextMenu.name !== '(Default)' && (
                      <>
                        <CtxItem onClick={() => { handleDeleteValue(contextMenu.name); setContextMenu(null); }}>Delete</CtxItem>
                        <CtxItem onClick={() => { setRenamingValue(contextMenu.name); setContextMenu(null); }}>Rename</CtxItem>
                        <CtxSep />
                      </>
                    )}
                  </>
                )}
                <CtxSubmenuItem
                  onMouseEnter={() => setSubMenuOpen(true)}
                  onMouseLeave={() => setSubMenuOpen(false)}
                >
                  <span>New</span>
                  <CtxArrow>{'\u25B6'}</CtxArrow>
                  {subMenuOpen && (
                    <CtxSubMenu>
                      <CtxItem onClick={handleNewKey}>Key</CtxItem>
                      <CtxSep />
                      <CtxItem onClick={() => handleNewValue('REG_SZ')}>String Value</CtxItem>
                      <CtxItem onClick={() => handleNewValue('REG_BINARY')}>Binary Value</CtxItem>
                      <CtxItem onClick={() => handleNewValue('REG_DWORD')}>DWORD Value</CtxItem>
                      <CtxItem onClick={() => handleNewValue('REG_MULTI_SZ')}>Multi-String Value</CtxItem>
                      <CtxItem onClick={() => handleNewValue('REG_EXPAND_SZ')}>Expandable String Value</CtxItem>
                    </CtxSubMenu>
                  )}
                </CtxSubmenuItem>
              </>
            )}
            {contextMenu.type === 'pane' && (
              <CtxSubmenuItem
                onMouseEnter={() => setSubMenuOpen(true)}
                onMouseLeave={() => setSubMenuOpen(false)}
              >
                <span>New</span>
                <CtxArrow>{'\u25B6'}</CtxArrow>
                {subMenuOpen && (
                  <CtxSubMenu>
                    <CtxItem onClick={handleNewKey}>Key</CtxItem>
                    <CtxSep />
                    <CtxItem onClick={() => handleNewValue('REG_SZ')}>String Value</CtxItem>
                    <CtxItem onClick={() => handleNewValue('REG_BINARY')}>Binary Value</CtxItem>
                    <CtxItem onClick={() => handleNewValue('REG_DWORD')}>DWORD Value</CtxItem>
                    <CtxItem onClick={() => handleNewValue('REG_MULTI_SZ')}>Multi-String Value</CtxItem>
                    <CtxItem onClick={() => handleNewValue('REG_EXPAND_SZ')}>Expandable String Value</CtxItem>
                  </CtxSubMenu>
                )}
              </CtxSubmenuItem>
            )}
          </CtxMenu>
        )}

      </Container>
    </ProgramLayout>
  );
}

// --- Styled Components ---

const Container = styled.div`
  flex: 1;
  display: flex;
  position: relative;
  background: #fff;
  font-family: 'Tahoma', 'MS Sans Serif', sans-serif;
  font-size: 11px;
  overflow: hidden;
`;

const TreePane = styled.div`
  width: 260px;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #aaa;
  background: #fff;
`;

const TreeScroll = styled.div`
  flex: 1;
  overflow: auto;
  padding: 4px 0 4px 4px;
`;

const TreeViewRoot = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const TreeUl = styled.ul`
  margin: 0;
  padding: 0 0 0 16px;
  list-style: none;
  border-left: 1px dotted #808080;
  margin-left: 7px;
`;

const TreeLi = styled.li`
  position: relative;
  padding: 0;
  margin: 0;

  /* Horizontal dotted connector line */
  &::before {
    content: '';
    position: absolute;
    top: 9px;
    left: -9px;
    width: 9px;
    border-top: 1px dotted #808080;
  }

  /* Hide the connector on root-level items */
  ${TreeViewRoot} > & {
    &::before {
      display: none;
    }
  }

  /* For last child, mask the parent's vertical line below this node */
  ${props => props.$isLast ? `
    &::after {
      content: '';
      position: absolute;
      top: 9px;
      left: -10px;
      bottom: 0;
      width: 2px;
      background: #fff;
    }
  ` : ''}
`;

const TreeItemRow = styled.div`
  display: flex;
  align-items: center;
  padding: 1px 2px;
  cursor: pointer;
  white-space: nowrap;
  gap: 2px;
  user-select: none;
`;

const ExpandBox = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 9px;
  height: 9px;
  min-width: 9px;
  border: 1px solid #808080;
  background: #fff;
  font-size: 9px;
  line-height: 1;
  cursor: pointer;
  user-select: none;
  color: #000;
  margin-right: 2px;
`;

const ExpandBoxPlaceholder = styled.span`
  width: 9px;
  min-width: 9px;
  height: 9px;
  margin-right: 2px;
`;

const TreeImg = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 2px;
  user-select: none;
  image-rendering: pixelated;
`;

const TreeLabel = styled.span`
  font-size: 11px;
  user-select: none;
  padding: 0 2px;
  background: ${props => props.$selected ? '#316ac5' : 'transparent'};
  color: ${props => props.$selected ? '#fff' : '#000'};
  outline: ${props => props.$selected ? '1px dotted #000' : 'none'};
`;

const Divider = styled.div`
  width: 3px;
  cursor: col-resize;
  background: #ece9d8;
`;

const ValuePane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const ValueTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
`;

const ValueTH = styled.th`
  text-align: left;
  padding: 3px 6px;
  background: linear-gradient(180deg, #fff 0%, #ece9d8 100%);
  border-bottom: 1px solid #aaa;
  border-right: 1px solid #ddd;
  font-weight: normal;
  position: sticky;
  top: 0;
  z-index: 1;
  cursor: default;
`;

const ValueRow = styled.tr`
  cursor: default;

  &:hover {
    background: #e8e8e8;
  }

  &:active {
    background: #316ac5;
    color: #fff;
  }
`;

const ValueTD = styled.td`
  padding: 2px 6px;
  border-bottom: 1px solid #f0f0f0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
`;

const ValueIcon = styled.span`
  display: inline-block;
  width: 20px;
  font-size: 9px;
  font-weight: bold;
  color: #316ac5;
  text-align: center;
  margin-right: 4px;
  font-family: 'Courier New', monospace;
`;

// Context menu
const CtxMenu = styled.div`
  position: fixed;
  background: #f5f5f5;
  border: 1px solid #888;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  padding: 2px 0;
  z-index: 10000;
  min-width: 160px;
`;

const CtxItem = styled.div`
  padding: 4px 24px 4px 8px;
  cursor: pointer;
  font-size: 11px;
  &:hover {
    background: #316ac5;
    color: #fff;
  }
`;

const CtxSubmenuItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 11px;
  &:hover {
    background: #316ac5;
    color: #fff;
  }
`;

const CtxArrow = styled.span`
  font-size: 8px;
  margin-left: 16px;
`;

const CtxSubMenu = styled.div`
  position: absolute;
  left: 100%;
  top: -2px;
  background: #f5f5f5;
  border: 1px solid #888;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  padding: 2px 0;
  min-width: 180px;
  z-index: 10001;
`;

const CtxSep = styled.div`
  height: 1px;
  background: #ccc;
  margin: 2px 4px;
`;


export default RegistryEditor;
