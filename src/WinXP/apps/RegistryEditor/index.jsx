import React, { useState, useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useRegistry } from '../../../contexts/RegistryContext';
import { useApp } from '../../../contexts/AppContext';

const MY_COMPUTER_ICON = '/icons/luna/computer_explorer.png';
const ROOT_KEY_ICON = '/icons/regedit/root.png';
const KEY_ICON_OPEN = '/icons/regedit/folder_open.png';
const KEY_ICON_CLOSED = '/icons/regedit/folder.png';

const VALUE_ICON_PATHS = {
  REG_SZ: '/icons/regedit/sz.png',
  REG_EXPAND_SZ: '/icons/regedit/sz.png',
  REG_MULTI_SZ: '/icons/regedit/sz.png',
  REG_DWORD: '/icons/regedit/dword.png',
  REG_BINARY: '/icons/regedit/dword.png',
};

function getValueIcon(type) {
  return VALUE_ICON_PATHS[type] || VALUE_ICON_PATHS.REG_SZ;
}

function getDisplayData(value) {
  if (!value) return '';
  if (value.type === 'REG_DWORD') {
    const num = value.data || 0;
    return `0x${num.toString(16).padStart(8, '0')} (${num})`;
  }
  if (value.type === 'REG_BINARY') {
    return value.data || '(zero-length binary value)';
  }
  return value.data !== undefined && value.data !== '' ? String(value.data) : '(value not set)';
}

function getLeafName(path) {
  if (!path) return 'My Computer';
  const parts = path.split('\\').filter(Boolean);
  return parts[parts.length - 1] || 'My Computer';
}

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
  const [selectedValueName, setSelectedValueName] = useState(null);
  const [expandedKeys, setExpandedKeys] = useState(new Set(['HKEY_LOCAL_MACHINE', 'HKEY_CURRENT_USER']));
  const [contextMenu, setContextMenu] = useState(null);
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  const currentValues = useMemo(
    () => (selectedPath ? getValues(selectedPath) : {}),
    [getValues, selectedPath]
  );
  const currentValueEntries = useMemo(
    () => Object.entries(currentValues),
    [currentValues]
  );

  const selectedKeyProtected = selectedPath ? isProtectedKey(selectedPath) : false;
  const selectedKeyHasBoundValues = selectedPath
    ? currentValueEntries.some(([name]) => isBoundValue(selectedPath, name))
    : false;
  const effectiveSelectedValueName = useMemo(() => {
    if (!selectedPath) {
      return null;
    }

    if (selectedValueName && currentValues[selectedValueName]) {
      return selectedValueName;
    }

    if (currentValues['(Default)']) {
      return '(Default)';
    }

    return Object.keys(currentValues)[0] || null;
  }, [currentValues, selectedPath, selectedValueName]);

  const selectedValueIsBound = selectedPath && effectiveSelectedValueName
    ? isBoundValue(selectedPath, effectiveSelectedValueName)
    : false;

  useEffect(() => {
    if (!contextMenu) return;
    const handler = () => {
      setContextMenu(null);
      setSubMenuOpen(false);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [contextMenu]);

  const toggleExpand = useCallback((path) => {
    setExpandedKeys((prev) => {
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
    setSelectedValueName(null);
    setContextMenu(null);
  }, []);

  const handleSelectValue = useCallback((name) => {
    setSelectedValueName(name);
    setContextMenu(null);
  }, []);

  const handleTreeNodeClick = useCallback((path) => {
    handleSelectKey(path);
    if (!expandedKeys.has(path)) {
      toggleExpand(path);
    }
  }, [expandedKeys, handleSelectKey, toggleExpand]);

  const handleNewValue = useCallback((type) => {
    setContextMenu(null);
    openApp(
      'Registry Editor - New Value',
      {
        type,
        selectedPath,
        onSave: (path, name, valueType, data) => {
          setValue(path, name, valueType, data);
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
      }
    );
  }, [openApp, selectedPath, setValue]);

  const handleEditValue = useCallback((name, value) => {
    const dialogTitle = value.type === 'REG_DWORD'
      ? 'Edit DWORD Value'
      : value.type === 'REG_BINARY'
        ? 'Edit Binary Value'
        : 'Edit String';

    openApp(
      'Registry Editor - Edit Value',
      {
        name,
        type: value.type,
        data: value.data,
        selectedPath,
        onSave: (path, valueName, valueType, data) => {
          setValue(path, valueName, valueType, data);
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
      }
    );
  }, [openApp, selectedPath, setValue]);

  const handleDeleteValue = useCallback((name) => {
    if (name === '(Default)') return;
    deleteValue(selectedPath, name);
  }, [deleteValue, selectedPath]);

  const handleNewKey = useCallback(() => {
    setContextMenu(null);
    openApp(
      'Registry Editor - New Key',
      {
        selectedPath,
        onSave: (path, name) => {
          createKey(path, name);
          setExpandedKeys((prev) => new Set([...prev, path]));
        },
      },
      {
        defaultOffset: {
          x: 270 + Math.round(Math.random() * 40),
          y: 200 + Math.round(Math.random() * 40),
        },
      }
    );
  }, [createKey, openApp, selectedPath]);

  const handleDeleteKey = useCallback(() => {
    if (!selectedPath) return;
    const parentParts = selectedPath.split('\\');
    const name = parentParts.pop();
    const parentPath = parentParts.join('\\');
    if (!parentPath) return;
    deleteKey(parentPath, name);
    setSelectedPath(parentPath);
  }, [deleteKey, selectedPath]);

  const handleMenuAction = useCallback((action) => {
    switch (action) {
      case 'newKey':
        handleNewKey();
        break;
      case 'newStringValue':
        handleNewValue('REG_SZ');
        break;
      case 'newDwordValue':
        handleNewValue('REG_DWORD');
        break;
      case 'newBinaryValue':
        handleNewValue('REG_BINARY');
        break;
      case 'deleteKey':
        handleDeleteKey();
        break;
      default:
        break;
    }
  }, [handleDeleteKey, handleNewKey, handleNewValue]);

  const renderTreeNode = (name, path, depth = 0, isLast = false) => {
    const isExpanded = expandedKeys.has(path);
    const isSelected = selectedPath === path;
    const subKeys = getSubKeys(path);
    const hasChildren = subKeys.length > 0;
    const keyProtected = isProtectedKey(path);
    const iconSrc = depth === 0 ? ROOT_KEY_ICON : (isExpanded ? KEY_ICON_OPEN : KEY_ICON_CLOSED);

    return (
      <TreeLi key={path} $isLast={isLast}>
        <TreeItemRow
          $selected={isSelected}
          onClick={() => handleTreeNodeClick(path)}
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
            handleSelectKey(path);
            setContextMenu({ x: event.clientX, y: event.clientY, type: 'tree', path });
          }}
        >
          {hasChildren ? (
            <ExpandBox
              onClick={(event) => {
                event.stopPropagation();
                toggleExpand(path);
              }}
            >
              {isExpanded ? '\u2212' : '+'}
            </ExpandBox>
          ) : (
            <ExpandBoxPlaceholder />
          )}
          <TreeImg src={iconSrc} alt="" draggable={false} />
          <TreeLabelWrap>
            <TreeLabel $selected={isSelected}>{name}</TreeLabel>
            {isSelected && keyProtected && (
              <TreeBadge $variant="protected">Protected</TreeBadge>
            )}
          </TreeLabelWrap>
        </TreeItemRow>
        {isExpanded && hasChildren && (
          <TreeUl>
            {subKeys.map((subKey, index) =>
              renderTreeNode(subKey, `${path}\\${subKey}`, depth + 1, index === subKeys.length - 1)
            )}
          </TreeUl>
        )}
      </TreeLi>
    );
  };

  const treeCanDeleteKey = Boolean(selectedPath && selectedPath.includes('\\') && !selectedKeyProtected);
  const contextValueIsBound = contextMenu?.type === 'value'
    ? isBoundValue(selectedPath, contextMenu.name)
    : false;
  const contextValueCanDelete = Boolean(
    contextMenu?.type === 'value' &&
    contextMenu.name !== '(Default)' &&
    !contextValueIsBound
  );

  const statusFields = useMemo(() => {
    const fields = [selectedPath || 'My Computer'];

    if (effectiveSelectedValueName) {
      fields.push(effectiveSelectedValueName);
    }

    if (selectedValueIsBound) {
      fields.push('Live shell value');
    } else if (selectedKeyProtected) {
      fields.push('Protected key');
    } else if (selectedKeyHasBoundValues) {
      fields.push('Contains live shell values');
    }

    return fields;
  }, [
    selectedKeyHasBoundValues,
    selectedKeyProtected,
    selectedPath,
    selectedValueIsBound,
    effectiveSelectedValueName,
  ]);

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
        {
          label: 'Delete Key',
          action: 'deleteKey',
          disabled: !selectedPath || !selectedPath.includes('\\') || selectedKeyProtected,
        },
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
      statusFields={statusFields}
      showStatusBar={true}
    >
      <Container>
        <TreePane>
          <TreeScroll>
            <TreeViewRoot>
              <TreeLi $isLast={true}>
                <TreeItemRow
                  $selected={selectedPath === ''}
                  onClick={() => {
                    setSelectedPath('');
                    setSelectedValueName(null);
                    setContextMenu(null);
                  }}
                >
                  <ExpandBox
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    {'\u2212'}
                  </ExpandBox>
                  <TreeImg src={MY_COMPUTER_ICON} alt="" draggable={false} />
                  <TreeLabelWrap>
                    <TreeLabel $selected={selectedPath === ''} $strong={true}>
                      My Computer
                    </TreeLabel>
                  </TreeLabelWrap>
                </TreeItemRow>
                <TreeUl>
                  {getRootKeys().map((rootKey, index, allKeys) =>
                    renderTreeNode(rootKey, rootKey, 0, index === allKeys.length - 1)
                  )}
                </TreeUl>
              </TreeLi>
            </TreeViewRoot>
          </TreeScroll>
        </TreePane>

        <Divider />

        <ValuePane
          onContextMenu={(event) => {
            if (event.target.closest('tr') && event.target.closest('tbody')) return;
            event.preventDefault();
            if (selectedPath) {
              setContextMenu({ x: event.clientX, y: event.clientY, type: 'pane' });
            }
          }}
        >
          {selectedPath && (
            <SelectionBanner>
              <SelectionHeader>
                <SelectionTitle>{getLeafName(selectedPath)}</SelectionTitle>
                <SelectionBadges>
                  {selectedKeyProtected && (
                    <SelectionBadge $variant="protected">Protected key</SelectionBadge>
                  )}
                  {selectedKeyHasBoundValues && (
                    <SelectionBadge $variant="live">Contains live values</SelectionBadge>
                  )}
                </SelectionBadges>
              </SelectionHeader>
              {(selectedKeyProtected || selectedKeyHasBoundValues) && (
                <SelectionText>
                  {selectedKeyProtected
                    ? 'This key is part of the built-in registry schema, so destructive edits are restricted.'
                    : 'Values marked Live write directly to Explorer, taskbar, or audio shell settings.'}
                </SelectionText>
              )}
            </SelectionBanner>
          )}

          <ValueTable>
            <thead>
              <tr>
                <ValueTH style={{ width: '38%' }}>Name</ValueTH>
                <ValueTH style={{ width: '20%' }}>Type</ValueTH>
                <ValueTH style={{ width: '42%' }}>Data</ValueTH>
              </tr>
            </thead>
            <tbody>
              {currentValueEntries.map(([name, value]) => {
                const isSelected = effectiveSelectedValueName === name;
                const valueIsBound = selectedPath ? isBoundValue(selectedPath, name) : false;
                const canDelete = name !== '(Default)' && !valueIsBound;

                return (
                  <ValueRow
                    key={name}
                    $selected={isSelected}
                    $bound={valueIsBound}
                    onClick={() => handleSelectValue(name)}
                    onDoubleClick={() => handleEditValue(name, value)}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      setSelectedValueName(name);
                      setContextMenu({
                        x: event.clientX,
                        y: event.clientY,
                        type: 'value',
                        name,
                        value,
                        canDelete,
                      });
                    }}
                  >
                    <ValueTD>
                      <ValueNameCell>
                        <ValueIconImg src={getValueIcon(value.type)} alt="" />
                        <ValueNameText>{name}</ValueNameText>
                        <ValueMeta>
                          {valueIsBound && <ValueBadge $variant="live">Live</ValueBadge>}
                          {name === '(Default)' && <ValueBadge $variant="default">Default</ValueBadge>}
                        </ValueMeta>
                      </ValueNameCell>
                    </ValueTD>
                    <ValueTD>
                      <ValueTypeText $bound={valueIsBound}>{value.type}</ValueTypeText>
                    </ValueTD>
                    <ValueTD $monospace={value.type === 'REG_DWORD' || value.type === 'REG_BINARY'}>
                      {getDisplayData(value)}
                    </ValueTD>
                  </ValueRow>
                );
              })}
              {currentValueEntries.length === 0 && selectedPath && (
                <ValueRow>
                  <ValueTD colSpan={3}>
                    <EmptyState>(No values)</EmptyState>
                  </ValueTD>
                </ValueRow>
              )}
            </tbody>
          </ValueTable>
        </ValuePane>

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
                {selectedPath && selectedPath.includes('\\') && (
                  <>
                    <CtxSep />
                    <CtxItem
                      $disabled={!treeCanDeleteKey}
                      onClick={() => {
                        if (!treeCanDeleteKey) return;
                        handleDeleteKey();
                        setContextMenu(null);
                      }}
                    >
                      Delete
                    </CtxItem>
                  </>
                )}
              </>
            )}
            {contextMenu.type === 'value' && (
              <>
                <CtxItem
                  onClick={() => {
                    handleEditValue(contextMenu.name, contextMenu.value);
                    setContextMenu(null);
                  }}
                >
                  Modify...
                </CtxItem>
                <CtxSep />
                <CtxItem
                  $disabled={!contextValueCanDelete}
                  onClick={() => {
                    if (!contextValueCanDelete) return;
                    handleDeleteValue(contextMenu.name);
                    setContextMenu(null);
                  }}
                >
                  Delete
                </CtxItem>
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
  width: 270px;
  min-width: 190px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #9f9f9f;
  background: linear-gradient(180deg, #ffffff 0%, #ffffff 78%, #fbfbfb 100%);
`;

const TreeScroll = styled.div`
  flex: 1;
  overflow: auto;
  padding: 5px 0 6px 4px;
`;

const TreeViewRoot = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const TreeUl = styled.ul`
  margin: 0 0 0 7px;
  padding: 0 0 0 16px;
  list-style: none;
  border-left: 1px dotted #8a8a8a;
`;

const TreeLi = styled.li`
  position: relative;
  margin: 0;
  padding: 0;

  &::before {
    content: '';
    position: absolute;
    top: 9px;
    left: -9px;
    width: 9px;
    border-top: 1px dotted #8a8a8a;
  }

  ${TreeViewRoot} > &::before {
    display: none;
  }

  ${({ $isLast }) => $isLast ? `
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
  gap: 2px;
  padding: 1px 2px;
  cursor: pointer;
  white-space: nowrap;
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
  color: #000;
  font-size: 9px;
  line-height: 1;
  cursor: pointer;
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
`;

const TreeLabelWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const TreeLabel = styled.span`
  display: inline-block;
  padding: 0 2px;
  font-size: 11px;
  font-weight: ${({ $strong }) => $strong ? 'bold' : 'normal'};
  background: ${({ $selected }) => $selected ? '#316ac5' : 'transparent'};
  color: ${({ $selected }) => $selected ? '#fff' : '#000'};
  outline: ${({ $selected }) => $selected ? '1px dotted #000' : 'none'};
`;

const TreeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 9px;
  line-height: 1.4;
  color: ${({ $variant }) => $variant === 'protected' ? '#7a4a00' : '#0d4a84'};
  background: ${({ $variant }) => $variant === 'protected' ? '#ffefc8' : '#dcefff'};
  border: 1px solid ${({ $variant }) => $variant === 'protected' ? '#e3c16d' : '#9bc6ec'};
`;

const Divider = styled.div`
  width: 4px;
  background: linear-gradient(180deg, #e8e8e8 0%, #d4d4d4 100%);
  border-left: 1px solid #f7f7f7;
  border-right: 1px solid #9f9f9f;
  cursor: col-resize;
`;

const ValuePane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  background: #fff;
`;

const SelectionBanner = styled.div`
  padding: 10px 12px 8px;
  border-bottom: 1px solid #d8d8d8;
  background: linear-gradient(180deg, #fbfdff 0%, #f0f6ff 100%);
`;

const SelectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

const SelectionTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: #1f1f1f;
`;

const SelectionBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const SelectionBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 9px;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: ${({ $variant }) => $variant === 'protected' ? '#7a4a00' : '#0d4a84'};
  background: ${({ $variant }) => $variant === 'protected' ? '#ffefc8' : '#dcefff'};
  border: 1px solid ${({ $variant }) => $variant === 'protected' ? '#e3c16d' : '#9bc6ec'};
`;

const SelectionText = styled.div`
  margin-top: 6px;
  color: #4c4c4c;
  line-height: 1.45;
`;

const ValueTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
  table-layout: fixed;
`;

const ValueTH = styled.th`
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 4px 7px;
  text-align: left;
  font-weight: normal;
  color: #000;
  background: linear-gradient(180deg, #ffffff 0%, #f4f1e8 55%, #e5ddcf 100%);
  border-bottom: 1px solid #9f9f9f;
  border-right: 1px solid #d7d2c7;
  cursor: default;

  &:last-child {
    border-right: 0;
  }
`;

const ValueRow = styled.tr`
  cursor: default;
  background: ${({ $selected, $bound }) => {
    if ($selected) return '#316ac5';
    if ($bound) return '#f3f9ff';
    return '#fff';
  }};
  color: ${({ $selected }) => $selected ? '#fff' : '#000'};

  &:hover {
    background: ${({ $selected, $bound }) => {
      if ($selected) return '#316ac5';
      if ($bound) return '#e9f4ff';
      return '#f6f6f6';
    }};
  }
`;

const ValueTD = styled.td`
  padding: 4px 7px;
  border-bottom: 1px solid #efefef;
  border-right: 1px solid #f2f2f2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ${({ $monospace }) => $monospace ? '\'Courier New\', monospace' : 'inherit'};

  &:last-child {
    border-right: 0;
  }
`;

const ValueNameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const ValueIconImg = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const ValueNameText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ValueMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  flex-shrink: 0;
`;

const ValueBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1px 5px;
  border-radius: 9px;
  font-size: 9px;
  line-height: 1.35;
  text-transform: uppercase;
  color: ${({ $variant }) => {
    if ($variant === 'live') return '#0d4a84';
    if ($variant === 'default') return '#6d6d6d';
    return '#3a3a3a';
  }};
  background: ${({ $variant }) => {
    if ($variant === 'live') return '#dcefff';
    if ($variant === 'default') return '#f2f2f2';
    return '#ececec';
  }};
  border: 1px solid ${({ $variant }) => {
    if ($variant === 'live') return '#9bc6ec';
    if ($variant === 'default') return '#d2d2d2';
    return '#d2d2d2';
  }};
`;

const ValueTypeText = styled.span`
  color: ${({ $bound }) => $bound ? '#17568e' : 'inherit'};
`;

const EmptyState = styled.div`
  color: #7a7a7a;
  font-style: italic;
`;

const CtxMenu = styled.div`
  position: fixed;
  min-width: 176px;
  padding: 2px 0;
  background: #f5f5f5;
  border: 1px solid #888;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10000;
`;

const CtxItem = styled.div`
  padding: 4px 24px 4px 8px;
  font-size: 11px;
  color: ${({ $disabled }) => $disabled ? '#8e8e8e' : '#000'};
  cursor: ${({ $disabled }) => $disabled ? 'default' : 'pointer'};

  &:hover {
    background: ${({ $disabled }) => $disabled ? 'transparent' : '#316ac5'};
    color: ${({ $disabled }) => $disabled ? '#8e8e8e' : '#fff'};
  }
`;

const CtxSubmenuItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  font-size: 11px;
  cursor: pointer;

  &:hover {
    background: #316ac5;
    color: #fff;
  }
`;

const CtxArrow = styled.span`
  margin-left: 16px;
  font-size: 8px;
`;

const CtxSubMenu = styled.div`
  position: absolute;
  left: 100%;
  top: -2px;
  min-width: 180px;
  padding: 2px 0;
  background: #f5f5f5;
  border: 1px solid #888;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 10001;
`;

const CtxSep = styled.div`
  height: 1px;
  margin: 2px 4px;
  background: #ccc;
`;

export default RegistryEditor;
