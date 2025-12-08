import React, { useRef, useCallback } from 'react';
import styled from 'styled-components';
import { IconItem, ListItem, DetailsRow, TileItem, ThumbnailItem, DetailsHeader } from './FileItemViews';
import { VIEW_MODES } from '../constants';
import { isMobileDevice } from '../../../../utils/deviceDetection';
import { useTooltip } from '../../../../contexts/TooltipContext';
import { getFileType, formatFileSize, formatDate, calculateFolderSize } from '../utils';

const DOUBLE_TAP_DELAY = 400; // ms for double-tap detection
const LONG_PRESS_DELAY = 500; // ms for long-press context menu

function ExplorerContent({
  items,
  viewMode,
  sortBy,
  sortOrder,
  searchQuery,
  isSearching,
  selectedItems,
  clipboard,
  clipboardOp,
  renamingItem,
  renameValue,
  draggingItems,
  dropTargetId,
  selectionBox,
  isDragOver,
  itemRefs,
  contentRef,
  fileSystem,
  onSortChange,
  onSearchChange,
  onSearchClear,
  onRenameChange,
  onRenameSubmit,
  onItemClick,
  onItemDoubleClick,
  onContextMenu,
  onItemDragStart,
  onItemDragEnd,
  onItemDragOver,
  onItemDragLeave,
  onItemDrop,
  onContentMouseDown,
  onBackgroundContextMenu,
}) {
  const lastTapRef = useRef(null);
  const longPressTimerRef = useRef(null);
  const isMobile = isMobileDevice();

  // Tooltip support
  const { tooltip, showTooltip, hideTooltip, updatePosition } = useTooltip();
  const CURSOR_OFFSET_X = 12;
  const CURSOR_OFFSET_Y = 20;

  // Image file extensions
  const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.ico', '.svg'];

  // Get tooltip text for an item
  const getTooltipText = useCallback((item) => {
    if (!item) return null;

    // For folders: show size and file list
    if (item.type === 'folder') {
      const size = calculateFolderSize(item.id, fileSystem);
      const children = item.children || [];
      const fileNames = children
        .map(id => fileSystem[id]?.name)
        .filter(Boolean)
        .slice(0, 3);

      let filesText = fileNames.join(', ');
      if (children.length > 3) {
        filesText += ', ...';
      }

      return `Size: ${formatFileSize(size)}\nFiles: ${filesText || '(empty)'}`;
    }

    // For drives
    if (item.type === 'drive') {
      return null; // No tooltip for drives
    }

    // Check if it's an image
    const ext = item.name ? item.name.substring(item.name.lastIndexOf('.')).toLowerCase() : '';
    const isImage = IMAGE_EXTENSIONS.includes(ext);

    if (isImage) {
      // For images: show dimensions (if available), type, and size
      const type = getFileType(item);
      const size = formatFileSize(item.size);
      // We might have dimensions stored in item.width/item.height
      if (item.width && item.height) {
        return `Dimensions: ${item.width} x ${item.height}\nType: ${type}\nSize: ${size}`;
      }
      return `Type: ${type}\nSize: ${size}`;
    }

    // For regular files: show type, date modified, and size
    const type = getFileType(item);
    const dateModified = formatDate(item.dateModified || item.dateCreated);
    const size = formatFileSize(item.size);

    return `Type: ${type}\nDate Modified: ${dateModified}\nSize: ${size}`;
  }, [fileSystem]);

  // Handle tooltip on mouse enter
  const handleItemMouseEnter = useCallback((e, item) => {
    if (isMobile) return;
    const tooltipText = getTooltipText(item);
    if (tooltipText) {
      const x = e.clientX + CURSOR_OFFSET_X;
      const y = e.clientY + CURSOR_OFFSET_Y;
      showTooltip(tooltipText, x, y, { delay: 1000 });
    }
  }, [isMobile, getTooltipText, showTooltip]);

  // Handle tooltip position update on mouse move (only if already visible)
  const handleItemMouseMove = useCallback((e) => {
    if (isMobile || !tooltip.visible) return;
    const x = e.clientX + CURSOR_OFFSET_X;
    const y = e.clientY + CURSOR_OFFSET_Y;
    updatePosition(x, y);
  }, [isMobile, tooltip.visible, updatePosition]);

  // Handle tooltip hide on mouse leave
  const handleItemMouseLeave = useCallback(() => {
    hideTooltip(true);
  }, [hideTooltip]);

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Handle touch start for double-tap and long-press detection
  const handleTouchStart = useCallback((e, item) => {
    if (!isMobile) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const now = Date.now();

    // Clear any existing long press timer
    clearLongPressTimer();

    // Check for double-tap on same item
    if (lastTapRef.current &&
        lastTapRef.current.id === item.id &&
        now - lastTapRef.current.time < DOUBLE_TAP_DELAY) {
      // Double-tap detected
      e.preventDefault();
      e.stopPropagation();
      lastTapRef.current = null;
      // Trigger double-click action
      setTimeout(() => onItemDoubleClick(item), 0);
      return;
    }

    // Record this tap for potential double-tap
    lastTapRef.current = { id: item.id, time: now };

    // Start long press timer for context menu
    longPressTimerRef.current = setTimeout(() => {
      // Create a synthetic event with touch coordinates
      const syntheticEvent = {
        preventDefault: () => {},
        stopPropagation: () => {},
        clientX: touch.clientX,
        clientY: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY,
      };
      onContextMenu(syntheticEvent, item);
      lastTapRef.current = null;
    }, LONG_PRESS_DELAY);

    // Also trigger the click/select
    onItemClick(e, item);
  }, [isMobile, onItemClick, onItemDoubleClick, onContextMenu, clearLongPressTimer]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    // Clear long press timer
    clearLongPressTimer();
  }, [clearLongPressTimer]);

  const renderItem = (item) => {
    const commonProps = {
      item,
      selected: selectedItems.includes(item.id),
      isCut: clipboardOp === 'cut' && clipboard.includes(item.id),
      isDragging: draggingItems?.includes(item.id),
      isDropTarget: dropTargetId === item.id && item.type === 'folder',
      isRenaming: renamingItem === item.id,
      renameValue,
      onRenameChange,
      onRenameSubmit,
      onClick: (e) => onItemClick(e, item),
      onDoubleClick: () => !isMobile && onItemDoubleClick(item), // Disable on mobile, use touch instead
      onContextMenu: (e) => onContextMenu(e, item),
      onDragStart: (e) => onItemDragStart(e, item),
      onDragEnd: onItemDragEnd,
      onDragOver: (e) => onItemDragOver(e, item),
      onDragLeave: onItemDragLeave,
      onDrop: (e) => onItemDrop(e, item),
      onTouchStart: (e) => handleTouchStart(e, item),
      onTouchEnd: handleTouchEnd,
      onMouseEnter: (e) => handleItemMouseEnter(e, item),
      onMouseMove: handleItemMouseMove,
      onMouseLeave: handleItemMouseLeave,
      itemRef: (el) => { itemRefs.current[item.id] = el; },
    };

    switch (viewMode) {
      case VIEW_MODES.DETAILS:
        return <DetailsRow key={item.id} {...commonProps} fileSystem={fileSystem} />;
      case VIEW_MODES.LIST:
        return <ListItem key={item.id} {...commonProps} />;
      case VIEW_MODES.TILES:
        return <TileItem key={item.id} {...commonProps} />;
      case VIEW_MODES.THUMBNAILS:
        return <ThumbnailItem key={item.id} {...commonProps} />;
      default:
        return <IconItem key={item.id} {...commonProps} />;
    }
  };

  return (
    <Wrapper>
      {/* Details View Header */}
      {viewMode === VIEW_MODES.DETAILS && items.length > 0 && (
        <DetailsHeader
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={onSortChange}
        />
      )}

      {/* Content Area */}
      <Content
        ref={contentRef}
        onContextMenu={onBackgroundContextMenu}
        onMouseDown={onContentMouseDown}
        $isDragOver={isDragOver}
        $viewMode={viewMode}
      >
        {items.length === 0 ? (
          <EmptyMessage>
            {searchQuery.trim() ? (
              <>No items match your search.</>
            ) : (
              <>
                This folder is empty.
                <br />
                <br />
                Drag files here to upload them.
              </>
            )}
          </EmptyMessage>
        ) : (
          items.map(renderItem)
        )}

        {selectionBox && (
          <SelectionBox
            style={{
              left: selectionBox.left,
              top: selectionBox.top,
              width: selectionBox.width,
              height: selectionBox.height,
            }}
          />
        )}
      </Content>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const Content = styled.div`
  flex: 1;
  padding: 8px;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: ${({ $viewMode }) => $viewMode === 'details' || $viewMode === 'list' ? '0' : '4px'};
  flex-direction: ${({ $viewMode }) => $viewMode === 'details' ? 'column' : $viewMode === 'list' ? 'column' : 'row'};
  background: ${({ $isDragOver }) => $isDragOver ? 'rgba(11, 97, 255, 0.05)' : 'white'};
  border: 1px solid #808080;
  border-top: 1px solid #404040;
  border-left: 1px solid #404040;
  position: relative;
`;

const EmptyMessage = styled.div`
  width: 100%;
  text-align: center;
  color: #808080;
  margin-top: 60px;
  font-size: 11px;
  line-height: 1.5;
`;

const SelectionBox = styled.div`
  position: absolute;
  border: 1px dashed #0b61ff;
  background: rgba(11, 97, 255, 0.1);
  pointer-events: none;
  z-index: 50;
`;

export default ExplorerContent;
