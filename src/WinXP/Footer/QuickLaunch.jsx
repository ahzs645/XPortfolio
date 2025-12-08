import React, { useState, useRef, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { ContextMenu } from '../components/ContextMenu';

const STORAGE_KEY = 'xp-quick-launch-items';
const MAX_VISIBLE = 3;

// Default Quick Launch items
const DEFAULT_ITEMS = [
  {
    id: 'show-desktop',
    name: 'Show Desktop',
    icon: '/icons/xp/Desktop.png',
    action: 'show-desktop',
  },
  {
    id: 'ie',
    name: 'Launch Internet Explorer Browser',
    icon: '/icons/xp/InternetExplorer6.png',
    appName: 'Internet Explorer',
  },
  {
    id: 'media-player',
    name: 'Windows Media Player',
    icon: '/icons/xp/WindowsMediaPlayer9.png',
    appName: 'Media Player',
  },
];

function QuickLaunch({
  onClickMenuItem,
  onMinimizeAll,
  enabled = true,
  onDrop,
}) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load Quick Launch items:', e);
    }
    return DEFAULT_ITEMS;
  });

  const [showOverflow, setShowOverflow] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [contextItem, setContextItem] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const overflowRef = useRef(null);
  const containerRef = useRef(null);

  // Persist items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save Quick Launch items:', e);
    }
  }, [items]);

  // Close overflow when clicking outside
  useEffect(() => {
    if (!showOverflow) return;

    const handleClickOutside = (e) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target)) {
        setShowOverflow(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showOverflow]);

  const handleItemClick = useCallback((item) => {
    if (item.action === 'show-desktop') {
      onMinimizeAll?.();
    } else if (item.url) {
      onClickMenuItem?.('Internet Explorer', { startUrl: item.url });
    } else if (item.path) {
      // For file system items, open with My Computer
      onClickMenuItem?.('My Computer', { startPath: item.path });
    } else if (item.appName) {
      onClickMenuItem?.(item.appName);
    }
    setShowOverflow(false);
  }, [onClickMenuItem, onMinimizeAll]);

  const handleContextMenu = useCallback((e, item) => {
    e.preventDefault();
    e.stopPropagation();
    setContextItem(item);
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleRemoveItem = useCallback(() => {
    if (contextItem) {
      setItems(prev => prev.filter(item => item.id !== contextItem.id));
    }
    setContextMenu(null);
    setContextItem(null);
  }, [contextItem]);

  const handleOpenItem = useCallback(() => {
    if (contextItem) {
      handleItemClick(contextItem);
    }
    setContextMenu(null);
    setContextItem(null);
  }, [contextItem, handleItemClick]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDropItem = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    // Try to get desktop icon data
    const iconData = e.dataTransfer.getData('application/x-desktop-icon');
    if (iconData) {
      try {
        const data = JSON.parse(iconData);
        const name = data.title || data.name;

        // For files with paths, store the path for launching
        const newItem = {
          id: `${data.id || name}-${Date.now()}`,
          name: name,
          icon: data.icon,
          appName: data.appName || data.title || name,
          path: data.path, // Store path for file system items
          type: data.type,
        };

        // Check if already exists
        const exists = items.some(item =>
          item.name === newItem.name ||
          item.appName === newItem.appName ||
          (item.path && item.path === newItem.path)
        );

        if (!exists && name) {
          setItems(prev => [...prev, newItem]);
        }
      } catch (err) {
        console.error('Failed to parse dropped icon:', err);
      }
      return;
    }

    // Also check for text/plain (URLs)
    const text = e.dataTransfer.getData('text/plain');
    if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
      const exists = items.some(item => item.url === text);
      if (!exists) {
        const newItem = {
          id: `url-${Date.now()}`,
          name: text.length > 30 ? text.substring(0, 30) + '...' : text,
          icon: '/icons/xp/InternetShortcut.png',
          url: text,
        };
        setItems(prev => [...prev, newItem]);
      }
    }

    onDrop?.(e);
  }, [items, onDrop]);

  const visibleItems = items.slice(0, MAX_VISIBLE);
  const overflowItems = items.slice(MAX_VISIBLE);
  const hasOverflow = overflowItems.length > 0;

  const quickLaunchContextItems = contextItem ? [
    {
      label: 'Open',
      bold: true,
      onClick: handleOpenItem,
    },
    { type: 'divider' },
    {
      label: 'Delete',
      onClick: handleRemoveItem,
      disabled: contextItem?.id === 'show-desktop', // Don't allow deleting Show Desktop
    },
  ] : [];

  if (!enabled) return null;

  return (
    <>
      <Container
        ref={containerRef}
        $dragOver={dragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDropItem}
      >
        <IconsWrapper>
          {visibleItems.map((item) => (
            <QuickLaunchIcon
              key={item.id}
              src={item.icon}
              alt={item.name}
              title={item.name}
              onClick={() => handleItemClick(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
              draggable={false}
            />
          ))}
        </IconsWrapper>
        {hasOverflow && (
          <ChevronWrapper ref={overflowRef}>
            <ChevronButton
              onClick={() => setShowOverflow(prev => !prev)}
              title="More icons"
            >
              &raquo;
            </ChevronButton>
            {showOverflow && (
              <OverflowMenu>
                {overflowItems.map((item) => (
                  <OverflowItem
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                  >
                    <img src={item.icon} alt="" />
                    <span>{item.name}</span>
                  </OverflowItem>
                ))}
              </OverflowMenu>
            )}
          </ChevronWrapper>
        )}
      </Container>

      {contextMenu && (
        <ContextMenu
          position={contextMenu}
          items={quickLaunchContextItems}
          onClose={() => {
            setContextMenu(null);
            setContextItem(null);
          }}
          overlayType="fixed"
          zIndex={10001}
        />
      )}
    </>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 4px;
  margin-left: 2px;
  background: ${({ $dragOver }) => $dragOver ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border-radius: 2px;
  transition: background 0.15s ease;
`;

const IconsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1px;
`;

const QuickLaunchIcon = styled.img`
  width: 22px;
  height: 22px;
  padding: 2px;
  cursor: pointer;
  border-radius: 3px;

  &:hover {
    background: linear-gradient(to bottom, #3a80f3, #3980f4);
    box-shadow: inset 1px 1px 2px #68a7f7, inset 0px -2px 2px #316fe8, inset 1px 0 0 #6da4f6;
  }

  &:active {
    background: linear-gradient(to bottom, #1951b9, #1a50b8);
    box-shadow: inset 1px 1px 0 #1848a6, inset 0px -2px 2px #2156b7;
  }
`;

const ChevronWrapper = styled.div`
  position: relative;
`;

const ChevronButton = styled.button`
  background: transparent;
  border: none;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  padding: 2px 3px;
  border-radius: 2px;
  line-height: 1;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
  min-width: 0;

  &:hover {
    background: linear-gradient(to bottom, #3a80f3, #3980f4);
    box-shadow: inset 1px 1px 2px #68a7f7, inset 0px -2px 2px #316fe8;
  }

  &:active {
    background: linear-gradient(to bottom, #1951b9, #1a50b8);
  }
`;

const OverflowMenu = styled.div`
  position: absolute;
  bottom: 100%;
  left: 0;
  background: #f5f5f5;
  border: 2px solid #c0c0c0;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  min-width: 180px;
  padding: 2px 0;
  margin-bottom: 4px;
  z-index: 10000;
`;

const OverflowItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 11px;
  color: #000;

  img {
    width: 16px;
    height: 16px;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover {
    background: #0b61ff;
    color: #fff;
  }
`;

export default QuickLaunch;
