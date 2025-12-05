import React from 'react';
import styled from 'styled-components';
import { IconItem, ListItem, DetailsRow, TileItem, DetailsHeader } from './FileItemViews';
import SearchBar from './SearchBar';
import { VIEW_MODES } from '../constants';

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
  const renderItem = (item) => {
    const commonProps = {
      key: item.id,
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
      onDoubleClick: () => onItemDoubleClick(item),
      onContextMenu: (e) => onContextMenu(e, item),
      onDragStart: (e) => onItemDragStart(e, item),
      onDragEnd: onItemDragEnd,
      onDragOver: (e) => onItemDragOver(e, item),
      onDragLeave: onItemDragLeave,
      onDrop: (e) => onItemDrop(e, item),
      itemRef: (el) => { itemRefs.current[item.id] = el; },
    };

    switch (viewMode) {
      case VIEW_MODES.DETAILS:
        return <DetailsRow {...commonProps} fileSystem={fileSystem} />;
      case VIEW_MODES.LIST:
        return <ListItem {...commonProps} />;
      case VIEW_MODES.TILES:
        return <TileItem {...commonProps} />;
      default:
        return <IconItem {...commonProps} />;
    }
  };

  return (
    <Wrapper>
      {/* Search Bar */}
      {isSearching && (
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onClear={onSearchClear}
        />
      )}

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
