import React from 'react';
import styled from 'styled-components';
import { XP_ICONS } from '../../../../contexts/FileSystemContext';
import { getFileType, formatFileSize, formatDate } from '../utils';

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
    >
      <IconImage src={item.icon || XP_ICONS.folder} alt="" />
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
        <IconName>{item.name}</IconName>
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
    >
      <ListIcon src={item.icon || XP_ICONS.folder} alt="" />
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
        <ListFileName>{item.name}</ListFileName>
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
  itemRef,
}) {
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
    >
      <DetailsCell $width="40%">
        <DetailsIcon src={item.icon || XP_ICONS.folder} alt="" />
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
          <span>{item.name}</span>
        )}
      </DetailsCell>
      <DetailsCell $width="15%" $align="right">
        {item.type === 'folder' ? '' : formatFileSize(item.size)}
      </DetailsCell>
      <DetailsCell $width="20%">{getFileType(item)}</DetailsCell>
      <DetailsCell $width="25%">{formatDate(item.modified)}</DetailsCell>
    </DetailsRowContainer>
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
    >
      <TileIcon src={item.icon || XP_ICONS.folder} alt="" />
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
            <TileName>{item.name}</TileName>
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
  border-radius: ${({ $isDropTarget }) => $isDropTarget ? '4px' : '2px'};
  background: ${({ $selected, $isDropTarget }) =>
    $isDropTarget
      ? 'rgba(11, 97, 255, 0.4)'
      : $selected
      ? 'rgba(11, 97, 255, 0.2)'
      : 'transparent'};
  border-color: ${({ $selected, $isDropTarget }) =>
    $isDropTarget
      ? '#0b61ff'
      : $selected
      ? 'rgba(11, 97, 255, 0.5)'
      : 'transparent'};
  opacity: ${({ $isCut, $isDragging }) => ($isDragging ? 0.5 : $isCut ? 0.5 : 1)};
  transition: ${({ $isDropTarget }) => ($isDropTarget ? 'background 0.15s, border 0.15s' : 'none')};

  &:hover {
    background: ${({ $selected, $isDropTarget }) =>
      $isDropTarget
        ? 'rgba(11, 97, 255, 0.5)'
        : $selected
        ? 'rgba(11, 97, 255, 0.3)'
        : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const IconImage = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
`;

const IconName = styled.span`
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  line-height: 1.2;
  max-height: 2.4em;
  overflow: hidden;
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

const ListIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
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

const DetailsIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

// Tiles View Styles
const TileItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  width: 200px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  background: ${({ $selected, $isDropTarget }) =>
    $isDropTarget ? 'rgba(11, 97, 255, 0.4)' : $selected ? 'rgba(11, 97, 255, 0.2)' : 'transparent'};
  border-color: ${({ $selected, $isDropTarget }) =>
    $isDropTarget ? '#0b61ff' : $selected ? 'rgba(11, 97, 255, 0.5)' : 'transparent'};
  opacity: ${({ $isCut, $isDragging }) => ($isDragging ? 0.5 : $isCut ? 0.5 : 1)};
  &:hover {
    background: ${({ $selected, $isDropTarget }) =>
      $isDropTarget ? 'rgba(11, 97, 255, 0.5)' : $selected ? 'rgba(11, 97, 255, 0.3)' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

const TileIcon = styled.img`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
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
`;

const TileType = styled.span`
  font-size: 10px;
  color: #666;
`;

const TileSize = styled.span`
  font-size: 10px;
  color: #666;
`;
