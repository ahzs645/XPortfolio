import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useFileSystem, XP_ICONS } from '../../../contexts/FileSystemContext';
import { withBaseUrl } from '../../../utils/baseUrl';

// Helper function to format bytes with both readable and raw bytes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB (${bytes.toLocaleString()} bytes)`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB (${bytes.toLocaleString()} bytes)`;
};

// Helper function to format date
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString();
};

function Properties({ onClose, itemId, itemData }) {
  const { fileSystem, getPath } = useFileSystem();
  const [activeTab, setActiveTab] = useState('General');
  const [readOnly, setReadOnly] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

  // Get item details
  const details = useMemo(() => {
    if (!item) return {};

    // Type - check for .lnk extension for shortcuts
    let itemType;
    if (item.type === 'shortcut' || item.name?.endsWith('.lnk')) {
      itemType = 'Shortcut File';
    } else {
      const typeMap = {
        file: 'File',
        folder: 'File Folder',
        drive: 'Local Disk',
      };
      itemType = typeMap[item.type] || 'Unknown';
    }

    // Location
    const path = getPath ? getPath(item.id) : item.name;
    const location = path ? `C:/${path.split('\\').slice(0, -1).join('/')}` : 'C:/';

    // Size - shortcuts and other items store size directly in bytes
    let sizeBytes;
    if (item.type === 'shortcut') {
      // Shortcuts store size directly in bytes
      sizeBytes = item.size || 90;
    } else if (item.type === 'file') {
      // Files might store size in bytes or KB, check magnitude
      sizeBytes = item.size || 0;
      // If size seems too small to be in bytes (likely KB), convert
      if (sizeBytes > 0 && sizeBytes < 10000) {
        sizeBytes = sizeBytes * 1024;
      }
    } else if (item.type === 'folder') {
      sizeBytes = calculateFolderSize(item.id) * 1024;
    } else {
      sizeBytes = 0;
    }

    // Size on disk (rounded to 4KB clusters)
    const sizeOnDisk = Math.ceil(sizeBytes / 4096) * 4096;

    return {
      type: itemType,
      location: location || 'C:/',
      size: formatBytes(sizeBytes),
      sizeOnDisk: formatBytes(sizeOnDisk),
      created: formatDate(item.dateCreated),
    };
  }, [item, fileSystem, getPath]);

  // Get icon for the item
  const getItemIcon = () => {
    if (!item) return XP_ICONS.default;
    if (item.icon) return item.icon;
    if (item.type === 'folder') return XP_ICONS.folder;
    if (item.type === 'drive') return XP_ICONS.localDisk;
    return XP_ICONS.default;
  };

  const handleCheckboxChange = (setter) => (e) => {
    setter(e.target.checked);
    setHasChanges(true);
  };

  const handleApply = () => {
    setHasChanges(false);
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
        <menu role="tablist">
          <button
            aria-selected={activeTab === 'General'}
            aria-controls="tab-general"
            onClick={() => setActiveTab('General')}
          >
            General
          </button>
          <button
            aria-selected={activeTab === 'Sharing'}
            aria-controls="tab-sharing"
            onClick={() => setActiveTab('Sharing')}
          >
            Sharing
          </button>
        </menu>

        <article role="tabpanel" id={activeTab === 'General' ? 'tab-general' : 'tab-sharing'}>
          {activeTab === 'General' && (
            <PanelContent>
              {/* Header with icon and name */}
              <SplitRow>
                <LeftCol>
                  <ItemIcon src={getItemIcon()} alt="" />
                </LeftCol>
                <RightCol>
                  <NameInput
                    type="text"
                    value={item.name}
                    disabled
                    readOnly
                  />
                </RightCol>
              </SplitRow>

              <Divider />

              <SplitRow>
                <LeftCol>Type:</LeftCol>
                <RightCol>{details.type}</RightCol>
              </SplitRow>

              <SplitRow>
                <LeftCol>Location:</LeftCol>
                <RightCol>{details.location}</RightCol>
              </SplitRow>

              <SplitRow>
                <LeftCol>Size:</LeftCol>
                <RightCol>{details.size}</RightCol>
              </SplitRow>

              <SplitRow>
                <LeftCol>Size on disk:</LeftCol>
                <RightCol>{details.sizeOnDisk}</RightCol>
              </SplitRow>

              <Divider />

              <SplitRow>
                <LeftCol>Created:</LeftCol>
                <RightCol>{details.created}</RightCol>
              </SplitRow>

              <Divider />

              <SplitRow>
                <LeftCol>Attributes:</LeftCol>
                <RightCol>
                  <CheckboxWrapper>
                    <input
                      type="checkbox"
                      id="attr-readonly"
                      checked={readOnly}
                      onChange={handleCheckboxChange(setReadOnly)}
                    />
                    <label htmlFor="attr-readonly">Read-only</label>
                  </CheckboxWrapper>
                  <CheckboxWrapper>
                    <input
                      type="checkbox"
                      id="attr-hidden"
                      checked={hidden}
                      onChange={handleCheckboxChange(setHidden)}
                    />
                    <label htmlFor="attr-hidden">Hidden</label>
                  </CheckboxWrapper>
                </RightCol>
                <AdvancedButton disabled>Advanced...</AdvancedButton>
              </SplitRow>
            </PanelContent>
          )}

          {activeTab === 'Sharing' && (
            <PanelContent>
              <GroupBox>
                <GroupPane>
                  <GroupTitle>Local sharing and security</GroupTitle>
                  <GroupContent>
                    <GroupIcon src={withBaseUrl('/icons/xp/MyComputer.png')} alt="" />
                    <GroupText>
                      <p>
                        To share this folder with other users of this computer
                        only, drag it to the <LinkText>Shared Documents</LinkText> folder.
                      </p>
                      <p>
                        To make this folder and its subfolders private so that
                        only you have access, select the following check box.
                      </p>
                      <CheckboxWrapper $disabled>
                        <input type="checkbox" id="folder-private" disabled />
                        <label htmlFor="folder-private">Make this folder private</label>
                      </CheckboxWrapper>
                    </GroupText>
                  </GroupContent>
                </GroupPane>
              </GroupBox>

              <GroupBox>
                <GroupPane>
                  <GroupTitle>Network sharing and security</GroupTitle>
                  <GroupContent>
                    <GroupIcon src={withBaseUrl('/icons/xp/Workgroup.png')} alt="" />
                    <GroupText>
                      <p>
                        As a security measure, Windows has disabled remote access
                        to this computer. However, you can enable remote access
                        and safely share files by running the{' '}
                        <LinkText>Network Setup Wizard</LinkText>.
                      </p>
                      <p>
                        <LinkText>
                          If you understand the security risks but want to share
                          files without running the wizard, click here.
                        </LinkText>
                      </p>
                      <p>
                        Learn more about <LinkText>sharing and security</LinkText>.
                      </p>
                    </GroupText>
                  </GroupContent>
                </GroupPane>
              </GroupBox>
            </PanelContent>
          )}
        </article>
      </TabContainer>

      <Actions>
        <ActionButton onClick={() => { handleApply(); onClose(); }}>OK</ActionButton>
        <ActionButton onClick={onClose}>Cancel</ActionButton>
        <ActionButton disabled={!hasChanges} onClick={handleApply}>
          Apply
        </ActionButton>
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
  min-height: 0;

  menu[role="tablist"] {
    position: relative;
    margin: 0;
    padding: 0;
    z-index: 2;

    button {
      position: relative;
      margin-bottom: -2px;
      margin-left: 0;
      margin-right: 0;

      &[aria-selected="true"] {
        z-index: 3;
        margin-left: 0;
      }
    }
  }

  article[role="tabpanel"] {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
    z-index: 1;
  }
`;

const PanelContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SplitRow = styled.div`
  display: flex;
  width: 100%;
  margin: 5px 0;
  align-items: center;
`;

const LeftCol = styled.div`
  width: 75px;
  flex-shrink: 0;
`;

const RightCol = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ItemIcon = styled.img`
  width: 30px;
  height: 30px;
  object-fit: contain;
`;

const NameInput = styled.input`
  width: 100%;
  padding: 2px 4px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  border: 1px solid #7f9db9;
  background: #fff;

  &:disabled {
    background: #f5f5f5;
    color: #000;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #d4d0c8;
  margin: 8px 0;
`;

const CheckboxWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  margin-right: 15px;

  label {
    cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  }
`;

const AdvancedButton = styled.button`
  padding: 3px 10px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  background: linear-gradient(#fff, #ece9d8);
  border: 1px solid #919b9c;
  cursor: pointer;
  margin-left: auto;

  &:disabled {
    cursor: default;
    color: #888;
  }

  &:active:not(:disabled) {
    background: linear-gradient(#ece9d8, #d4d0c8);
  }
`;

const GroupBox = styled.div`
  margin-bottom: 12px;
`;

const GroupPane = styled.div`
  border: 1px solid #d4d0c8;
  padding: 10px;
  position: relative;
`;

const GroupTitle = styled.div`
  position: absolute;
  top: -8px;
  left: 8px;
  background: #fafaf9;
  padding: 0 4px;
  font-weight: bold;
  font-size: 11px;
`;

const GroupContent = styled.div`
  display: flex;
  padding-top: 8px;
`;

const GroupIcon = styled.img`
  width: 30px;
  height: 30px;
  margin-right: 10px;
  flex-shrink: 0;
`;

const GroupText = styled.div`
  flex: 1;
  font-size: 11px;
  line-height: 1.4;

  p {
    margin: 0 0 10px 0;
  }
`;

const LinkText = styled.a`
  color: #0066cc;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: #0033cc;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
`;

const ActionButton = styled.button`
  min-width: 72px;
  padding: 5px 12px;
  font-size: 11px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
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

  &:focus {
    outline: 1px dotted #000;
    outline-offset: -4px;
  }
`;

export default Properties;
