import React from 'react';
import styled from 'styled-components';
import { XP_ICONS, fileIcons } from '../../../../contexts/FileSystemContext';
import { getFileType, formatFileSize, formatDate, calculateFolderSize } from '../utils';
import { withBaseUrl } from '../../../../utils/baseUrl';

// Check if item is a shortcut
const isShortcut = (item) => item.type === 'shortcut' || item.name?.endsWith('.lnk');

// Get icon for item - dynamically compute from extension, falling back to stored icon
const getItemIcon = (item) => {
  // For folders and special items, use stored icon
  if (item.type === 'folder' || item.type === 'drive') {
    return item.icon || XP_ICONS.folder;
  }

  // For files, compute icon from extension
  const ext = item.name?.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (ext && fileIcons[ext]) {
    return fileIcons[ext];
  }

  // Fall back to stored icon or default
  return item.icon || XP_ICONS.folder;
};

// Get display name (strip .lnk extension for shortcuts)
const getDisplayName = (item) => {
  if (isShortcut(item) && item.name?.endsWith('.lnk')) {
    return item.name.slice(0, -4);
  }
  return item.name;
};

// Icon View Item
export function IconItem({
  item,
  selected,
  isCut,
  isDragging,
  isDropTarget,
  isRenaming,
  renameValue,
  onRenameChange,
  onRenameSubmit,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchStart,
  onTouchEnd,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  itemRef,
}) {
  return (
    <IconItemContainer
      ref={itemRef}
      $selected={selected}
      $isCut={isCut}
      $isDragging={isDragging}
      $isDropTarget={isDropTarget}
      draggable={!isRenaming}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <IconImageWrapper>
        <IconImage src={withBaseUrl(getItemIcon(item))} alt="" $selected={selected} />
        {isShortcut(item) && <ShortcutOverlay src={withBaseUrl('/icons/xp/Shortcutoverlay.png')} alt="" />}
      </IconImageWrapper>
      {isRenaming ? (
        <RenameForm onSubmit={onRenameSubmit}>
          <RenameInput
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onRenameSubmit}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        </RenameForm>
      ) : (
        <IconName $selected={selected}>{getDisplayName(item)}</IconName>
      )}
    </IconItemContainer>
  );
}

// List View Item
export function ListItem({
  item,
  selected,
  isCut,
  isDragging,
  isDropTarget,
  isRenaming,
  renameValue,
  onRenameChange,
  onRenameSubmit,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchStart,
  onTouchEnd,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  itemRef,
}) {
  return (
    <ListItemContainer
      ref={itemRef}
      $selected={selected}
      $isCut={isCut}
      $isDragging={isDragging}
      $isDropTarget={isDropTarget}
      draggable={!isRenaming}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <ListIconWrapper>
        <ListIcon src={withBaseUrl(getItemIcon(item))} alt="" $selected={selected} />
        {isShortcut(item) && <SmallShortcutOverlay src={withBaseUrl('/icons/xp/Shortcutoverlay.png')} alt="" />}
      </ListIconWrapper>
      {isRenaming ? (
        <RenameForm onSubmit={onRenameSubmit}>
          <RenameInput
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onRenameSubmit}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        </RenameForm>
      ) : (
        <ListFileName>{getDisplayName(item)}</ListFileName>
      )}
    </ListItemContainer>
  );
}

// Details View Row
export function DetailsRow({
  item,
  selected,
  isCut,
  isDragging,
  isDropTarget,
  isRenaming,
  renameValue,
  onRenameChange,
  onRenameSubmit,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchStart,
  onTouchEnd,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  itemRef,
  fileSystem,
}) {
  const size = item.type === 'folder'
    ? calculateFolderSize(item.id, fileSystem)
    : item.size;

  return (
    <DetailsRowContainer
      ref={itemRef}
      $selected={selected}
      $isCut={isCut}
      $isDragging={isDragging}
      $isDropTarget={isDropTarget}
      draggable={!isRenaming}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <DetailsCell $width="40%">
        <DetailsIconWrapper>
          <DetailsIcon src={withBaseUrl(getItemIcon(item))} alt="" $selected={selected} />
          {isShortcut(item) && <SmallShortcutOverlay src={withBaseUrl('/icons/xp/Shortcutoverlay.png')} alt="" />}
        </DetailsIconWrapper>
        {isRenaming ? (
          <RenameForm onSubmit={onRenameSubmit}>
            <RenameInput
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              onBlur={onRenameSubmit}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </RenameForm>
        ) : (
          <span>{getDisplayName(item)}</span>
        )}
      </DetailsCell>
      <DetailsCell $width="15%" $align="right">
        {formatFileSize(size)}
      </DetailsCell>
      <DetailsCell $width="20%">{getFileType(item)}</DetailsCell>
      <DetailsCell $width="25%">{formatDate(item.dateModified || item.dateCreated)}</DetailsCell>
    </DetailsRowContainer>
  );
}

// Thumbnail View Item
export function ThumbnailItem({
  item,
  selected,
  isCut,
  isDragging,
  isDropTarget,
  isRenaming,
  renameValue,
  onRenameChange,
  onRenameSubmit,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchStart,
  onTouchEnd,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  itemRef,
}) {
  return (
    <ThumbnailItemContainer
      ref={itemRef}
      $selected={selected}
      $isCut={isCut}
      $isDragging={isDragging}
      $isDropTarget={isDropTarget}
      draggable={!isRenaming}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <ThumbnailImageWrapper $selected={selected}>
        <ThumbnailImage src={withBaseUrl(getItemIcon(item))} alt="" />
        {isShortcut(item) && <ShortcutOverlay src={withBaseUrl('/icons/xp/Shortcutoverlay.png')} alt="" />}
      </ThumbnailImageWrapper>
      {isRenaming ? (
        <RenameForm onSubmit={onRenameSubmit}>
          <RenameInput
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onRenameSubmit}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        </RenameForm>
      ) : (
        <ThumbnailName $selected={selected}>{getDisplayName(item)}</ThumbnailName>
      )}
    </ThumbnailItemContainer>
  );
}

// Tiles View Item
export function TileItem({
  item,
  selected,
  isCut,
  isDragging,
  isDropTarget,
  isRenaming,
  renameValue,
  onRenameChange,
  onRenameSubmit,
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchStart,
  onTouchEnd,
  onMouseEnter,
  onMouseMove,
  onMouseLeave,
  itemRef,
}) {
  return (
    <TileItemContainer
      ref={itemRef}
      $selected={selected}
      $isCut={isCut}
      $isDragging={isDragging}
      $isDropTarget={isDropTarget}
      draggable={!isRenaming}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <TileIconWrapper>
        <TileIcon src={withBaseUrl(getItemIcon(item))} alt="" $selected={selected} />
        {isShortcut(item) && <TileShortcutOverlay src={withBaseUrl('/icons/xp/Shortcutoverlay.png')} alt="" />}
      </TileIconWrapper>
      <TileInfo>
        {isRenaming ? (
          <RenameForm onSubmit={onRenameSubmit}>
            <RenameInput
              value={renameValue}
              onChange={(e) => onRenameChange(e.target.value)}
              onBlur={onRenameSubmit}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </RenameForm>
        ) : (
          <>
            <TileName $selected={selected}>{getDisplayName(item)}</TileName>
            <TileType>{getFileType(item)}</TileType>
            {item.type !== 'folder' && <TileSize>{formatFileSize(item.size)}</TileSize>}
          </>
        )}
      </TileInfo>
    </TileItemContainer>
  );
}

// Details View Header
export function DetailsHeader({ sortBy, sortOrder, onSort }) {
  return (
    <DetailsHeaderContainer>
      <DetailsHeaderCell
        $width="40%"
        $sortable
        $active={sortBy === 'name'}
        onClick={() => onSort('name')}
      >
        Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
      </DetailsHeaderCell>
      <DetailsHeaderCell
        $width="15%"
        $sortable
        $active={sortBy === 'size'}
        onClick={() => onSort('size')}
      >
        Size {sortBy === 'size' && (sortOrder === 'asc' ? '▲' : '▼')}
      </DetailsHeaderCell>
      <DetailsHeaderCell
        $width="20%"
        $sortable
        $active={sortBy === 'type'}
        onClick={() => onSort('type')}
      >
        Type {sortBy === 'type' && (sortOrder === 'asc' ? '▲' : '▼')}
      </DetailsHeaderCell>
      <DetailsHeaderCell
        $width="25%"
        $sortable
        $active={sortBy === 'modified'}
        onClick={() => onSort('modified')}
      >
        Date Modified {sortBy === 'modified' && (sortOrder === 'asc' ? '▲' : '▼')}
      </DetailsHeaderCell>
    </DetailsHeaderContainer>
  );
}

// Shared Styles
const RenameForm = styled.form`
  width: 100%;
`;

const RenameInput = styled.input`
  width: 100%;
  font-size: 11px;
  text-align: center;
  border: 1px solid #000;
  padding: 1px 2px;
`;

// Icon View Styles
const IconItemContainer = styled.div`
  width: 80px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: ${({ $isDropTarget }) => $isDropTarget ? '2px solid #0b61ff' : '1px solid transparent'};
  border-radius: ${({ $isDropTarget }) => $isDropTarget ? '4px' : '0'};
  background: ${({ $isDropTarget }) =>
    $isDropTarget ? 'rgba(11, 97, 255, 0.4)' : 'transparent'};
  opacity: ${({ $isCut, $isDragging }) => ($isDragging ? 0.5 : $isCut ? 0.5 : 1)};
  transition: ${({ $isDropTarget }) => ($isDropTarget ? 'background 0.15s, border 0.15s' : 'none')};
`;

const IconImageWrapper = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
`;

const IconImage = styled.img`
  width: 32px;
  height: 32px;
  filter: ${({ $selected }) => $selected
    ? 'brightness(50%) invert(10%) sepia(100%) saturate(300%) hue-rotate(180deg)'
    : 'none'};
`;

const ShortcutOverlay = styled.img`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 11px;
  height: 11px;
  pointer-events: none;
`;

const IconName = styled.span`
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  line-height: 1.2;
  max-height: 2.4em;
  overflow: hidden;
  padding: 1px 2px;
  background: ${({ $selected }) => $selected ? '#316ac5' : 'transparent'};
  color: ${({ $selected }) => $selected ? '#fff' : '#000'};
`;

// List View Styles
const ListItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  width: 200px;
  cursor: pointer;
  background: ${({ $selected, $isDropTarget }) =>
    $isDropTarget ? 'rgba(11, 97, 255, 0.4)' : $selected ? '#316ac5' : 'transparent'};
  color: ${({ $selected }) => $selected ? 'white' : 'black'};
  opacity: ${({ $isCut, $isDragging }) => ($isDragging ? 0.5 : $isCut ? 0.5 : 1)};
  &:hover {
    background: ${({ $selected, $isDropTarget }) =>
      $isDropTarget ? 'rgba(11, 97, 255, 0.5)' : $selected ? '#316ac5' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const ListIconWrapper = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const ListIcon = styled.img`
  width: 16px;
  height: 16px;
  filter: ${({ $selected }) => $selected
    ? 'brightness(50%) invert(10%) sepia(100%) saturate(300%) hue-rotate(180deg)'
    : 'none'};
`;

const SmallShortcutOverlay = styled.img`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 8px;
  height: 8px;
  pointer-events: none;
`;

const ListFileName = styled.span`
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Details View Styles
const DetailsHeaderContainer = styled.div`
  display: flex;
  background: #ece9d8;
  border-bottom: 1px solid #808080;
  user-select: none;
`;

const DetailsHeaderCell = styled.div`
  width: ${({ $width }) => $width || 'auto'};
  padding: 3px 8px;
  font-size: 11px;
  font-weight: ${({ $active }) => $active ? 'bold' : 'normal'};
  cursor: ${({ $sortable }) => $sortable ? 'pointer' : 'default'};
  border-right: 1px solid #808080;
  background: ${({ $active }) => $active ? '#d4d0c8' : 'transparent'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:hover {
    background: ${({ $sortable }) => $sortable ? '#d4d0c8' : 'transparent'};
  }
  &:last-child {
    border-right: none;
  }
`;

const DetailsRowContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 2px 0;
  cursor: pointer;
  background: ${({ $selected, $isDropTarget }) =>
    $isDropTarget ? 'rgba(11, 97, 255, 0.4)' : $selected ? '#316ac5' : 'transparent'};
  color: ${({ $selected }) => $selected ? 'white' : 'black'};
  opacity: ${({ $isCut, $isDragging }) => ($isDragging ? 0.5 : $isCut ? 0.5 : 1)};
  &:hover {
    background: ${({ $selected, $isDropTarget }) =>
      $isDropTarget ? 'rgba(11, 97, 255, 0.5)' : $selected ? '#316ac5' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const DetailsCell = styled.div`
  width: ${({ $width }) => $width || 'auto'};
  padding: 2px 8px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  text-align: ${({ $align }) => $align || 'left'};
  justify-content: ${({ $align }) => $align === 'right' ? 'flex-end' : 'flex-start'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DetailsIconWrapper = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

const DetailsIcon = styled.img`
  width: 16px;
  height: 16px;
  filter: ${({ $selected }) => $selected
    ? 'brightness(50%) invert(10%) sepia(100%) saturate(300%) hue-rotate(180deg)'
    : 'none'};
`;

// Tiles View Styles
const TileItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  width: 200px;
  cursor: pointer;
  border: ${({ $isDropTarget }) => $isDropTarget ? '2px solid #0b61ff' : '1px solid transparent'};
  border-radius: ${({ $isDropTarget }) => $isDropTarget ? '4px' : '0'};
  background: ${({ $isDropTarget }) =>
    $isDropTarget ? 'rgba(11, 97, 255, 0.4)' : 'transparent'};
  opacity: ${({ $isCut, $isDragging }) => ($isDragging ? 0.5 : $isCut ? 0.5 : 1)};
`;

const TileIconWrapper = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
`;

const TileIcon = styled.img`
  width: 48px;
  height: 48px;
  filter: ${({ $selected }) => $selected
    ? 'brightness(50%) invert(10%) sepia(100%) saturate(300%) hue-rotate(180deg)'
    : 'none'};
`;

const TileShortcutOverlay = styled.img`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 11px;
  height: 11px;
  pointer-events: none;
`;

const TileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

const TileName = styled.span`
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1px 2px;
  background: ${({ $selected }) => $selected ? '#316ac5' : 'transparent'};
  color: ${({ $selected }) => $selected ? '#fff' : '#000'};
`;

const TileType = styled.span`
  font-size: 10px;
  color: #666;
`;

const TileSize = styled.span`
  font-size: 10px;
  color: #666;
`;

// Thumbnail View Styles (Windows XP style with border around icon)
const ThumbnailItemContainer = styled.div`
  width: 102px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  margin: 2px 10px 15px 10px;
  vertical-align: top;
  text-align: center;
  opacity: ${({ $isCut, $isDragging }) => ($isDragging ? 0.5 : $isCut ? 0.5 : 1)};
`;

const ThumbnailImageWrapper = styled.div`
  position: relative;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ $selected }) => $selected ? '#316AC5' : '#e0dfe3'};
  background: transparent;
  margin-bottom: 4px;
`;

const ThumbnailImage = styled.img`
  width: 48px;
  height: 48px;
`;

const ThumbnailName = styled.span`
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  line-height: 1.2;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  padding: 2px 4px;
  background: ${({ $selected }) => $selected ? '#316AC5' : 'transparent'};
  color: ${({ $selected }) => $selected ? '#fff' : '#000'};
`;
