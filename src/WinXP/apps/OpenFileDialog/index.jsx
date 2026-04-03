import { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import {
  useFileSystem,
  SYSTEM_IDS,
  XP_ICONS,
  resolveFileSystemItemIcon,
  filterVisibleFileSystemItems,
  getFileSystemItemDisplayName,
} from '../../../contexts/FileSystemContext';
import { useShellSettings } from '../../../contexts/ShellSettingsContext';
import { withBaseUrl } from '../../../utils/baseUrl';

// Container
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ece9d8;
  padding: 8px;
`;

const LookInRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
`;

const LookInLabel = styled.span`
  font-size: 11px;
  color: #000;
  white-space: nowrap;
`;

const LookInSelect = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  background: #fff;
  border: 1px solid #7f9db9;
  cursor: pointer;
  min-width: 0;

  img {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  span {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11px;
  }
`;

const ToolbarButton = styled.button`
  width: 24px;
  height: 22px;
  padding: 2px;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #fff;
    border: 1px solid #316ac5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
    &:hover {
      background: transparent;
      border-color: transparent;
    }
  }

  img {
    width: 16px;
    height: 16px;
  }
`;

const FileListContainer = styled.div`
  flex: 1;
  min-height: 200px;
  background: #fff;
  border: 1px solid #7f9db9;
  overflow: auto;
`;

const FileList = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 8px;
  gap: 8px;
`;

const FileItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 72px;
  padding: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 2px;

  &:hover {
    background: #e8f4fc;
  }

  &.selected {
    background: #316ac5;
    color: #fff;
  }

  img {
    width: 32px;
    height: 32px;
    margin-bottom: 4px;
  }

  span {
    font-size: 11px;
    text-align: center;
    word-break: break-word;
    max-width: 100%;
  }
`;

const BottomSection = styled.div`
  margin-top: 8px;
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const InputLabel = styled.span`
  font-size: 11px;
  color: #000;
  white-space: nowrap;
  min-width: 70px;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 3px 4px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  background: #fff;

  &:focus {
    outline: none;
  }
`;

const SelectInput = styled.select`
  flex: 1;
  padding: 2px 4px;
  border: 1px solid #7f9db9;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  background: #fff;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button`
  min-width: 75px;
  padding: 4px 14px;
  background: linear-gradient(180deg, #fff 0%, #ecebe5 86%, #d8d0c4 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: linear-gradient(180deg, #fff0cf 0%, #fdd889 50%, #fbc761 100%);
  }

  &:active:not(:disabled) {
    background: linear-gradient(180deg, #e5e5de 0%, #e3e3db 8%, #cdcac3 100%);
  }

  &:disabled {
    color: #a0a0a0;
    cursor: default;
    border-color: #a0a0a0;
  }
`;

const EmptyMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 11px;
`;

// File type filters
const FILE_FILTERS = {
  pdf: {
    label: 'PDF Files (*.pdf)',
    extensions: ['.pdf'],
  },
  image: {
    label: 'Image Files (*.jpg, *.png, *.gif, *.bmp)',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'],
  },
  text: {
    label: 'Text Files (*.txt)',
    extensions: ['.txt'],
  },
  all: {
    label: 'All Files (*.*)',
    extensions: [],
  },
};

// Icons for file types
const FILE_ICONS = {
  folder: '/icons/xp/FolderClosed.png',
  pdf: '/icons/pdf/PDF.ico',
  image: '/icons/xp/image.png',
  text: '/icons/xp/Notepad.png',
  default: '/icons/xp/Default.png',
};

function getFileIcon(item) {
  const resolvedIcon = resolveFileSystemItemIcon(item, {
    folderIcon: FILE_ICONS.folder,
    driveIcon: XP_ICONS.localDisk,
    fileIcon: FILE_ICONS.default,
  });

  if (resolvedIcon) {
    return resolvedIcon;
  }

  const name = item.name?.toLowerCase() || '';
  if (name.endsWith('.pdf')) return FILE_ICONS.pdf;
  if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name)) return FILE_ICONS.image;
  if (name.endsWith('.txt')) return FILE_ICONS.text;

  return FILE_ICONS.default;
}

function OpenFileDialog({
  onClose,
  onSelect,
  filter = 'all',
  allowedFilters = ['all'],
}) {
  const { fileSystem } = useFileSystem();
  const { explorer } = useShellSettings();
  const [currentFolderId, setCurrentFolderId] = useState(SYSTEM_IDS.MY_DOCUMENTS);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [fileName, setFileName] = useState('');
  const [currentFilter, setCurrentFilter] = useState(filter);
  const [history, setHistory] = useState([]);

  // Get current folder
  const currentFolder = fileSystem[currentFolderId];

  // Get items in current folder
  const items = useMemo(() => {
    if (!currentFolder?.children) return [];

    const filterConfig = FILE_FILTERS[currentFilter];
    const extensions = filterConfig?.extensions || [];

    return filterVisibleFileSystemItems(
      currentFolder.children
      .map(id => fileSystem[id])
      .filter(Boolean),
      { showHiddenContents: explorer.showHiddenContents }
    )
      .filter(item => {
        // Always show folders
        if (item.type === 'folder' || item.type === 'drive') return true;
        // Skip shortcuts and other non-file types
        if (item.type !== 'file') return false;
        // If no extension filter, show all files
        if (extensions.length === 0) return true;
        // Check extension
        const name = item.name?.toLowerCase() || '';
        return extensions.some(ext => name.endsWith(ext));
      })
      .sort((a, b) => {
        // Folders first
        const aIsFolder = a.type === 'folder' || a.type === 'drive';
        const bIsFolder = b.type === 'folder' || b.type === 'drive';
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [currentFolder, explorer.showHiddenContents, fileSystem, currentFilter]);

  // Navigate to folder
  const navigateTo = useCallback((folderId) => {
    setHistory(prev => [...prev, currentFolderId]);
    setCurrentFolderId(folderId);
    setSelectedItemId(null);
    setFileName('');
  }, [currentFolderId]);

  // Go up one level
  const goUp = useCallback(() => {
    if (currentFolder?.parent) {
      setHistory(prev => [...prev, currentFolderId]);
      setCurrentFolderId(currentFolder.parent);
      setSelectedItemId(null);
      setFileName('');
    }
  }, [currentFolder, currentFolderId]);

  // Go back in history
  const goBack = useCallback(() => {
    if (history.length > 0) {
      const prevId = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentFolderId(prevId);
      setSelectedItemId(null);
      setFileName('');
    }
  }, [history]);

  // Handle item click
  const handleItemClick = useCallback((item) => {
    setSelectedItemId(item.id);
    if (item.type === 'file') {
      setFileName(item.name);
    }
  }, []);

  // Handle item double-click
  const handleItemDoubleClick = useCallback((item) => {
    if (item.type === 'folder' || item.type === 'drive') {
      navigateTo(item.id);
    } else if (item.type === 'file') {
      // Open the file
      if (onSelect) {
        onSelect({
          id: item.id,
          name: item.name,
          content: item.content,
          path: item.path,
        });
      }
      onClose?.();
    }
  }, [navigateTo, onSelect, onClose]);

  // Handle Open button
  const handleOpen = useCallback(() => {
    if (!selectedItemId) return;

    const selectedItem = fileSystem[selectedItemId];
    if (!selectedItem) return;

    if (selectedItem.type === 'folder' || selectedItem.type === 'drive') {
      navigateTo(selectedItemId);
    } else if (selectedItem.type === 'file') {
      if (onSelect) {
        onSelect({
          id: selectedItem.id,
          name: selectedItem.name,
          content: selectedItem.content,
          path: selectedItem.path,
        });
      }
      onClose?.();
    }
  }, [selectedItemId, fileSystem, navigateTo, onSelect, onClose]);

  // Get folder display name
  const getFolderDisplayName = () => {
    if (currentFolderId === SYSTEM_IDS.MY_DOCUMENTS) return 'My Documents';
    if (currentFolderId === SYSTEM_IDS.DESKTOP) return 'Desktop';
    if (currentFolderId === SYSTEM_IDS.C_DRIVE) return 'Local Disk (C:)';
    return getFileSystemItemDisplayName(currentFolder, {
      showFileExtensions: explorer.showFileExtensions,
    }) || 'Unknown';
  };

  // Get folder icon
  const getFolderIcon = () => {
    if (currentFolderId === SYSTEM_IDS.MY_DOCUMENTS) return XP_ICONS.myDocuments || '/icons/xp/MyDocuments.png';
    if (currentFolderId === SYSTEM_IDS.DESKTOP) return '/icons/xp/Desktop.png';
    if (currentFolderId === SYSTEM_IDS.C_DRIVE) return XP_ICONS.localDisk || '/icons/xp/LocalDisk.png';
    return resolveFileSystemItemIcon(currentFolder, {
      folderIcon: FILE_ICONS.folder,
      driveIcon: XP_ICONS.localDisk,
      fileIcon: FILE_ICONS.default,
    });
  };

  return (
    <Container>
      <LookInRow>
        <LookInLabel>Look in:</LookInLabel>
        <LookInSelect>
          <img src={withBaseUrl(getFolderIcon())} alt="" />
          <span>{getFolderDisplayName()}</span>
        </LookInSelect>
        <ToolbarButton onClick={goBack} disabled={history.length === 0} title="Back">
          <img src={withBaseUrl('/gui/toolbar/back.webp')} alt="Back" />
        </ToolbarButton>
        <ToolbarButton onClick={goUp} disabled={!currentFolder?.parent} title="Up One Level">
          <img src={withBaseUrl('/icons/xp/FolderUp.png')} alt="Up" />
        </ToolbarButton>
      </LookInRow>

      <FileListContainer>
        {items.length === 0 ? (
          <EmptyMessage>This folder is empty</EmptyMessage>
        ) : (
          <FileList>
            {items.map(item => (
              <FileItem
                key={item.id}
                className={selectedItemId === item.id ? 'selected' : ''}
                onClick={() => handleItemClick(item)}
                onDoubleClick={() => handleItemDoubleClick(item)}
              >
                <img src={withBaseUrl(getFileIcon(item))} alt="" />
                <span>{getFileSystemItemDisplayName(item, {
                  showFileExtensions: explorer.showFileExtensions,
                })}</span>
              </FileItem>
            ))}
          </FileList>
        )}
      </FileListContainer>

      <BottomSection>
        <InputRow>
          <InputLabel>File name:</InputLabel>
          <TextInput
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
        </InputRow>
        <InputRow>
          <InputLabel>Files of type:</InputLabel>
          <SelectInput
            value={currentFilter}
            onChange={(e) => setCurrentFilter(e.target.value)}
          >
            {allowedFilters.map(filterKey => (
              <option key={filterKey} value={filterKey}>
                {FILE_FILTERS[filterKey]?.label || filterKey}
              </option>
            ))}
          </SelectInput>
        </InputRow>
        <ButtonRow>
          <Button onClick={handleOpen} disabled={!selectedItemId}>
            Open
          </Button>
          <Button onClick={onClose}>
            Cancel
          </Button>
        </ButtonRow>
      </BottomSection>
    </Container>
  );
}

export default OpenFileDialog;
