import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useFileSystem, XP_ICONS } from '../../../contexts/FileSystemContext';

// Helper function to format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Helper function to format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
};

function Properties({ onClose, itemId, itemData }) {
  const { fileSystem, getPath } = useFileSystem();
  const [activeTab, setActiveTab] = useState('General');
  const [readOnly, setReadOnly] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Get item from file system or use provided itemData
  const item = useMemo(() => {
    if (itemData) return itemData;
    if (itemId && fileSystem?.[itemId]) return fileSystem[itemId];
    return null;
  }, [itemId, itemData, fileSystem]);

  // Calculate folder size recursively
  const calculateFolderSize = (folderId) => {
    if (!fileSystem || !fileSystem[folderId]) return 0;
    const folder = fileSystem[folderId];
    if (!folder.children) return folder.size || 0;

    let totalSize = 0;
    for (const childId of folder.children) {
      const child = fileSystem[childId];
      if (!child) continue;
      if (child.type === 'file') {
        totalSize += child.size || 0;
      } else if (child.type === 'folder') {
        totalSize += calculateFolderSize(childId);
      }
    }
    return totalSize;
  };

  // Count files and folders in a folder
  const countContents = (folderId) => {
    if (!fileSystem || !fileSystem[folderId]) return { files: 0, folders: 0 };
    const folder = fileSystem[folderId];
    if (!folder.children) return { files: 0, folders: 0 };

    let files = 0;
    let folders = 0;
    for (const childId of folder.children) {
      const child = fileSystem[childId];
      if (!child) continue;
      if (child.type === 'file') {
        files++;
      } else if (child.type === 'folder') {
        folders++;
      }
    }
    return { files, folders };
  };

  // Get item details
  const details = useMemo(() => {
    if (!item) return [];

    const result = [];

    // Type
    const typeMap = {
      file: 'File',
      folder: 'File Folder',
      drive: 'Local Disk',
      shortcut: 'Shortcut',
    };
    result.push(['Type', typeMap[item.type] || 'Unknown']);

    // Location
    const path = getPath ? getPath(item.id) : item.name;
    const location = path ? `C:\\${path.split('\\').slice(0, -1).join('\\')}` : 'C:\\';
    result.push(['Location', location || 'C:\\']);

    // Size
    let sizeBytes;
    if (item.type === 'file') {
      sizeBytes = (item.size || 0) * 1024;
    } else if (item.type === 'folder') {
      sizeBytes = calculateFolderSize(item.id) * 1024;
    } else {
      sizeBytes = 0;
    }
    result.push(['Size', formatBytes(sizeBytes)]);

    // Size on disk (rounded to 4KB clusters)
    const sizeOnDisk = Math.ceil(sizeBytes / 4096) * 4096;
    result.push(['Size on disk', formatBytes(sizeOnDisk)]);

    // Contains (for folders)
    if (item.type === 'folder' || item.type === 'drive') {
      const { files, folders } = countContents(item.id);
      result.push(['Contains', `${files} Files, ${folders} Folders`]);
    }

    // Date Created
    result.push(['Created', formatDate(item.dateCreated)]);

    // Date Modified
    result.push(['Modified', formatDate(item.dateModified)]);

    return result;
  }, [item, fileSystem, getPath]);

  // Get icon for the item
  const getItemIcon = () => {
    if (!item) return XP_ICONS.default;
    if (item.icon) return item.icon;
    if (item.type === 'folder') return XP_ICONS.folder;
    if (item.type === 'drive') return XP_ICONS.localDisk;
    return XP_ICONS.default;
  };

  if (!item) {
    return (
      <Container>
        <ErrorMessage>No item selected</ErrorMessage>
        <Actions>
          <ActionButton onClick={onClose}>Close</ActionButton>
        </Actions>
      </Container>
    );
  }

  return (
    <Container>
      <TabContainer>
        <TabList>
          {['General', 'Sharing', 'Customize'].map((tab) => (
            <Tab
              key={tab}
              $active={activeTab === tab}
              $enabled={tab === 'General'}
              onClick={() => tab === 'General' && setActiveTab(tab)}
            >
              {tab}
            </Tab>
          ))}
        </TabList>

        <TabContent>
          {activeTab === 'General' && (
            <GeneralTab>
              {/* Header with icon and name */}
              <HeaderSection>
                <IconWrapper>
                  <ItemIcon src={getItemIcon()} alt="" />
                </IconWrapper>
                <NameInput
                  type="text"
                  value={item.name}
                  disabled
                  readOnly
                />
              </HeaderSection>

              <Divider />

              {/* Details list */}
              <DetailsList>
                {details.map(([label, value]) => (
                  <DetailRow key={label}>
                    <DetailLabel>{label}</DetailLabel>
                    <DetailValue $breakAll={label === 'Location'}>
                      {value}
                    </DetailValue>
                  </DetailRow>
                ))}
              </DetailsList>

              <Divider />

              {/* Attributes */}
              <AttributesSection>
                <DetailLabel>Attributes</DetailLabel>
                <AttributesContent>
                  <CheckboxGroup>
                    <CheckboxRow>
                      <Checkbox
                        type="checkbox"
                        checked={readOnly}
                        onChange={(e) => setReadOnly(e.target.checked)}
                      />
                      <CheckboxLabel>Read-only</CheckboxLabel>
                    </CheckboxRow>
                    <CheckboxRow>
                      <Checkbox
                        type="checkbox"
                        checked={hidden}
                        onChange={(e) => setHidden(e.target.checked)}
                      />
                      <CheckboxLabel>Hidden</CheckboxLabel>
                    </CheckboxRow>
                  </CheckboxGroup>
                  <AdvancedButton type="button" disabled>
                    Advanced...
                  </AdvancedButton>
                </AttributesContent>
              </AttributesSection>
            </GeneralTab>
          )}
        </TabContent>
      </TabContainer>

      <Actions>
        <ActionButton onClick={onClose}>OK</ActionButton>
        <ActionButton onClick={onClose}>Cancel</ActionButton>
      </Actions>
    </Container>
  );
}

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ece9d8;
  padding: 8px;
  gap: 8px;
  overflow: hidden;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  font-size: 11px;
`;

const ErrorMessage = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
`;

const TabContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const TabList = styled.div`
  display: flex;
  gap: 0;
  padding: 0 2px;
`;

const Tab = styled.button`
  padding: 4px 12px;
  font-size: 11px;
  background: ${({ $active }) => ($active ? '#fafaf9' : '#d4d0c8')};
  border: 1px solid #919b9c;
  border-bottom: ${({ $active }) => ($active ? 'none' : '1px solid #919b9c')};
  border-radius: 3px 3px 0 0;
  cursor: ${({ $enabled }) => ($enabled ? 'pointer' : 'default')};
  color: ${({ $enabled }) => ($enabled ? '#000' : '#888')};
  position: relative;
  z-index: ${({ $active }) => ($active ? 2 : 1)};
  margin-bottom: -1px;
  min-width: 70px;

  &:hover {
    background: ${({ $active, $enabled }) =>
      $enabled ? ($active ? '#fafaf9' : '#e8e8e8') : '#d4d0c8'};
  }
`;

const TabContent = styled.div`
  flex: 1;
  background: #fafaf9;
  border: 1px solid #919b9c;
  padding: 12px;
  overflow-y: auto;
  overflow-x: hidden;
`;

const GeneralTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-bottom: 1px solid #d4d0c8;
  margin-bottom: 8px;
`;

const IconWrapper = styled.div`
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ItemIcon = styled.img`
  width: 48px;
  height: 48px;
  object-fit: contain;
`;

const NameInput = styled.input`
  flex: 1;
  padding: 4px 6px;
  font-size: 11px;
  border: 1px solid #7f9db9;
  background: #fff;

  &:disabled {
    background: #f5f5f5;
    color: #000;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #d4d0c8;
  margin: 4px 0;
`;

const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 2px 4px;
`;

const DetailLabel = styled.div`
  width: 70px;
  flex-shrink: 0;
  color: #000;
  font-size: 11px;
`;

const DetailValue = styled.div`
  flex: 1;
  color: #000;
  font-size: 11px;
  word-break: ${({ $breakAll }) => ($breakAll ? 'break-all' : 'break-word')};
`;

const AttributesSection = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 4px;
`;

const AttributesContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 13px;
  height: 13px;
  margin: 0;
  cursor: pointer;
`;

const CheckboxLabel = styled.span`
  font-size: 11px;
  color: #000;
`;

const AdvancedButton = styled.button`
  padding: 4px 12px;
  font-size: 11px;
  min-width: 75px;
  background: linear-gradient(#fff, #ece9d8);
  border: 1px solid #919b9c;
  cursor: pointer;

  &:disabled {
    cursor: default;
    color: #888;
  }

  &:active:not(:disabled) {
    background: linear-gradient(#ece9d8, #d4d0c8);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 4px;
`;

const ActionButton = styled.button`
  min-width: 72px;
  padding: 5px 12px;
  font-size: 11px;
  background: linear-gradient(#fff, #ece9d8);
  border: 1px solid #919b9c;
  cursor: pointer;

  &:active {
    background: linear-gradient(#ece9d8, #d4d0c8);
  }

  &:focus {
    outline: 1px dotted #000;
    outline-offset: -4px;
  }
`;

export default Properties;
