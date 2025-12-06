import styled from 'styled-components';

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #808080;
`;

export const OuterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  position: relative;
  overflow: visible;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  outline: none;
  position: relative;
  overflow: hidden;
`;

export const HiddenFileInput = styled.input`
  display: none;
`;

export const DragOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(11, 97, 255, 0.1);
  border: 2px dashed #0b61ff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  pointer-events: none;
`;

export const DragOverlayContent = styled.div`
  padding: 20px 40px;
  background: white;
  border: 1px solid #0b61ff;
  border-radius: 4px;
  font-size: 14px;
  color: #0b61ff;
  font-weight: bold;
`;

export const UploadProgressOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
`;

export const UploadProgressDialog = styled.div`
  background: #ece9d8;
  border: 2px solid #0054e3;
  border-radius: 4px;
  padding: 16px;
  min-width: 320px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
`;

export const UploadProgressTitle = styled.div`
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 8px;
`;

export const CopyingAnimation = styled.div`
  margin-bottom: 8px;
  img {
    width: 100%;
    max-width: 280px;
  }
`;

export const UploadProgressFile = styled.div`
  font-size: 11px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UploadProgressBar = styled.div`
  height: 16px;
  background: white;
  border: 1px solid #808080;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
`;

export const UploadProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(to bottom, #3a6ea5 0%, #1e4d8c 100%);
  transition: width 0.2s ease;
`;

export const UploadProgressText = styled.div`
  font-size: 11px;
  text-align: center;
  color: #808080;
`;

// Details pane spacer
export const DetailsSpacer = styled.div`
  padding: 2px 0;
`;

// Folder view layout with TaskPanel
export const FolderLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

// My Computer root view styles
export const MyComputerLayout = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const MyComputerContent = styled.div`
  flex: 1;
  padding: 8px 16px;
  overflow: auto;
  background: white;
  border: 1px solid #808080;
  border-top: 1px solid #404040;
  border-left: 1px solid #404040;
`;

export const MyComputerEmptyMessage = styled.div`
  padding: 16px 0;
  font-size: 11px;
  color: #808080;
`;

export const CategorySection = styled.div`
  margin-bottom: 16px;
`;

export const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

export const CategoryIcon = styled.img`
  width: 24px;
  height: 24px;
`;

export const CategoryTitle = styled.h3`
  font-size: 11px;
  font-weight: bold;
  color: #215DC6;
  margin: 0;
`;

export const CategoryDivider = styled.div`
  height: 1px;
  background: linear-gradient(to right, #215DC6 0%, #215DC6 40%, transparent 100%);
  margin: 4px 0 12px 0;
`;

export const CategoryItems = styled.div`
  display: flex;
  flex-wrap: ${({ $viewMode }) => $viewMode === 'details' || $viewMode === 'list' ? 'nowrap' : 'wrap'};
  flex-direction: ${({ $viewMode }) => $viewMode === 'details' || $viewMode === 'list' ? 'column' : 'row'};
  gap: ${({ $viewMode }) => $viewMode === 'details' ? '0' : '8px'};
  padding-left: ${({ $viewMode }) => $viewMode === 'details' ? '0' : '4px'};
`;

// Icons view
export const MyComputerFileItem = styled.div`
  width: 100px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 3px;
  background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.2)' : 'transparent'};
  border-color: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.5)' : 'transparent'};

  &:hover {
    background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.3)' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

export const MyComputerFileIcon = styled.img`
  width: 48px;
  height: 48px;
  margin-bottom: 6px;
`;

export const MyComputerFileName = styled.span`
  font-size: 11px;
  text-align: center;
  word-break: break-word;
  line-height: 1.3;
`;

// List view
export const MyComputerListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  width: 200px;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? '#316ac5' : 'transparent'};
  color: ${({ $selected }) => $selected ? 'white' : 'black'};
  &:hover {
    background: ${({ $selected }) => $selected ? '#316ac5' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

export const MyComputerListIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

export const MyComputerListName = styled.span`
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Details view
export const MyComputerDetailsHeader = styled.div`
  display: flex;
  background: #ece9d8;
  border-bottom: 1px solid #808080;
  margin-bottom: 2px;
`;

export const MyComputerDetailsHeaderCell = styled.div`
  width: ${({ $width }) => $width || 'auto'};
  padding: 3px 8px;
  font-size: 11px;
  font-weight: normal;
  border-right: 1px solid #808080;
  &:last-child {
    border-right: none;
  }
`;

export const MyComputerDetailsRow = styled.div`
  display: flex;
  width: 100%;
  padding: 2px 0;
  cursor: pointer;
  background: ${({ $selected }) => $selected ? '#316ac5' : 'transparent'};
  color: ${({ $selected }) => $selected ? 'white' : 'black'};
  &:hover {
    background: ${({ $selected }) => $selected ? '#316ac5' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

export const MyComputerDetailsCell = styled.div`
  width: ${({ $width }) => $width || 'auto'};
  padding: 2px 8px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MyComputerDetailsIcon = styled.img`
  width: 16px;
  height: 16px;
  flex-shrink: 0;
`;

// Tiles view
export const MyComputerTileItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  width: 200px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;
  background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.2)' : 'transparent'};
  border-color: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.5)' : 'transparent'};
  &:hover {
    background: ${({ $selected }) => $selected ? 'rgba(11, 97, 255, 0.3)' : 'rgba(11, 97, 255, 0.1)'};
  }
`;

export const MyComputerTileIcon = styled.img`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
`;

export const MyComputerTileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`;

export const MyComputerTileName = styled.span`
  font-size: 11px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const MyComputerTileType = styled.span`
  font-size: 10px;
  color: #666;
`;
