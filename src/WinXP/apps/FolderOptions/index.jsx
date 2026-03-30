import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { withBaseUrl } from '../../../utils/baseUrl';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'view', label: 'View' },
];

const SETTINGS_CONFIG = [
  {
    key: 'sidebarOption',
    type: 'radio',
    storageKey: 'folderopt_noExplorerSidebar',
    defaultValue: 'show',
    values: { show: false, classic: true },
  },
  {
    key: 'browseFoldersOption',
    type: 'radio',
    storageKey: 'folderopt_openFoldersInNewWindow',
    defaultValue: 'same',
    values: { same: false, new: true },
  },
  {
    key: 'displayFullPathTitle',
    type: 'checkbox',
    storageKey: 'folderopt_fullPathInTitle',
    defaultChecked: false,
  },
  {
    key: 'hiddenFilesOption',
    type: 'radio',
    storageKey: 'folderopt_showHiddenContents',
    defaultValue: 'dontshow',
    values: { dontshow: false, show: true },
  },
  {
    key: 'hideFileExt',
    type: 'checkbox',
    storageKey: 'folderopt_showFileExtensions',
    defaultChecked: false,
    inverted: true,
  },
];

function loadSettings() {
  const settings = {};
  SETTINGS_CONFIG.forEach((cfg) => {
    const stored = localStorage.getItem(cfg.storageKey);
    if (cfg.type === 'radio') {
      if (stored !== null) {
        // Find which radio value maps to stored boolean
        const storedBool = stored === 'true';
        const entry = Object.entries(cfg.values).find(([, v]) => v === storedBool);
        settings[cfg.key] = entry ? entry[0] : cfg.defaultValue;
      } else {
        settings[cfg.key] = cfg.defaultValue;
      }
    } else {
      if (stored !== null) {
        const val = stored === 'true';
        settings[cfg.key] = cfg.inverted ? !val : val;
      } else {
        settings[cfg.key] = cfg.defaultChecked;
      }
    }
  });
  return settings;
}

function saveSettings(settings) {
  SETTINGS_CONFIG.forEach((cfg) => {
    if (cfg.type === 'radio') {
      const val = cfg.values[settings[cfg.key]];
      localStorage.setItem(cfg.storageKey, String(val));
    } else {
      const val = cfg.inverted ? !settings[cfg.key] : settings[cfg.key];
      localStorage.setItem(cfg.storageKey, String(val));
    }
  });
}

function FolderOptions({ onClose }) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(loadSettings);
  const [savedSettings, setSavedSettings] = useState(loadSettings);
  const [isDirty, setIsDirty] = useState(false);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  const handleApply = useCallback(() => {
    saveSettings(settings);
    setSavedSettings({ ...settings });
    setIsDirty(false);
  }, [settings]);

  const handleOk = useCallback(() => {
    saveSettings(settings);
    onClose();
  }, [settings, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <ProgramLayout
      windowActions={{ onClose }}
      showToolbar={false}
      showAddressBar={false}
      statusFields={null}
      showStatusBar={false}
    >
      <WindowSurface>
        <section className="tabs">
          <TabsBar>
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                $active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </TabButton>
            ))}
          </TabsBar>

          <TabPanel $active={true}>
            {activeTab === 'general' && (
              <GeneralTab>
                <Grouper>
                  <GrouperHeading>Tasks</GrouperHeading>
                  <GrouperContent>
                    <GrouperIcon src={withBaseUrl('/icons/xp/FolderClosed.png')} alt="" />
                    <RadioGroup>
                      <RadioLabel>
                        <input
                          type="radio"
                          name="sidebarOption"
                          value="show"
                          checked={settings.sidebarOption === 'show'}
                          onChange={() => updateSetting('sidebarOption', 'show')}
                        />
                        Show common tasks in folders
                      </RadioLabel>
                      <RadioLabel>
                        <input
                          type="radio"
                          name="sidebarOption"
                          value="classic"
                          checked={settings.sidebarOption === 'classic'}
                          onChange={() => updateSetting('sidebarOption', 'classic')}
                        />
                        Use Windows classic folders
                      </RadioLabel>
                    </RadioGroup>
                  </GrouperContent>
                </Grouper>

                <Grouper>
                  <GrouperHeading>Browse Folders</GrouperHeading>
                  <GrouperContent>
                    <GrouperIcon src={withBaseUrl('/icons/xp/MyComputer.png')} alt="" />
                    <RadioGroup>
                      <RadioLabel>
                        <input
                          type="radio"
                          name="browseFoldersOption"
                          value="same"
                          checked={settings.browseFoldersOption === 'same'}
                          onChange={() => updateSetting('browseFoldersOption', 'same')}
                        />
                        Open each folder in the same window
                      </RadioLabel>
                      <RadioLabel>
                        <input
                          type="radio"
                          name="browseFoldersOption"
                          value="new"
                          checked={settings.browseFoldersOption === 'new'}
                          onChange={() => updateSetting('browseFoldersOption', 'new')}
                        />
                        Open each folder in its own window
                      </RadioLabel>
                    </RadioGroup>
                  </GrouperContent>
                </Grouper>

                <Grouper>
                  <GrouperHeading>Click items as follows</GrouperHeading>
                  <GrouperContent>
                    <GrouperIcon src={withBaseUrl('/icons/xp/Default.png')} alt="" />
                    <RadioGroup>
                      <RadioLabel $disabled>
                        <input type="radio" name="clickStyle" value="single" disabled />
                        Single-click to open an item (point to select)
                      </RadioLabel>
                      <SubRadioLabel $disabled>
                        <input type="radio" name="underlineStyle" value="browser" disabled />
                        Underline icon titles consistent with my browser
                      </SubRadioLabel>
                      <SubRadioLabel $disabled>
                        <input type="radio" name="underlineStyle" value="hover" disabled />
                        Underline icon titles only when I point at them
                      </SubRadioLabel>
                      <RadioLabel $disabled>
                        <input type="radio" name="clickStyle" value="double" disabled defaultChecked />
                        Double-click to open an item (single-click to select)
                      </RadioLabel>
                    </RadioGroup>
                  </GrouperContent>
                </Grouper>

                <RestoreDefaultsRow>
                  <XPButton disabled>Restore Defaults</XPButton>
                </RestoreDefaultsRow>
              </GeneralTab>
            )}

            {activeTab === 'view' && (
              <ViewTab>
                <Grouper>
                  <GrouperHeading>Folder views</GrouperHeading>
                  <GrouperContent>
                    <GrouperIcon src={withBaseUrl('/icons/xp/Programs.png')} alt="" />
                    <FolderViewsText>
                      You can apply the view (such as Details or Tiles) that
                      you are using for this folder to all folders.
                    </FolderViewsText>
                  </GrouperContent>
                  <FolderViewButtons>
                    <XPButton disabled>Apply to All Folders</XPButton>
                    <XPButton disabled>Reset All Folders</XPButton>
                  </FolderViewButtons>
                </Grouper>

                <AdvancedLabel>Advanced settings:</AdvancedLabel>
                <AdvancedPane>
                  <TreeEntry>
                    <TreeIcon src={withBaseUrl('/icons/xp/FolderClosed.png')} alt="" />
                    <TreeName>Files and Folders</TreeName>
                  </TreeEntry>
                  <CheckboxGroup style={{ marginLeft: 16 }}>
                    <CheckboxLabel $disabled>
                      <input type="checkbox" disabled />
                      Display the contents of system folders
                    </CheckboxLabel>
                    <CheckboxLabel $disabled>
                      <input type="checkbox" disabled />
                      Display the full path in the address bar
                    </CheckboxLabel>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={settings.displayFullPathTitle}
                        onChange={(e) => updateSetting('displayFullPathTitle', e.target.checked)}
                      />
                      Display the full path in the title bar
                    </CheckboxLabel>
                  </CheckboxGroup>

                  <TreeEntry style={{ marginLeft: 22 }}>
                    <TreeIcon src={withBaseUrl('/icons/xp/FolderClosed.png')} alt="" />
                    <TreeName>Hidden files and folders</TreeName>
                  </TreeEntry>
                  <RadioGroup style={{ marginLeft: 44 }}>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="hiddenFilesOption"
                        value="dontshow"
                        checked={settings.hiddenFilesOption === 'dontshow'}
                        onChange={() => updateSetting('hiddenFilesOption', 'dontshow')}
                      />
                      Do not show hidden files and folders
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="hiddenFilesOption"
                        value="show"
                        checked={settings.hiddenFilesOption === 'show'}
                        onChange={() => updateSetting('hiddenFilesOption', 'show')}
                      />
                      Show hidden files and folders
                    </RadioLabel>
                  </RadioGroup>

                  <CheckboxGroup style={{ marginLeft: 16 }}>
                    <CheckboxLabel>
                      <input
                        type="checkbox"
                        checked={settings.hideFileExt}
                        onChange={(e) => updateSetting('hideFileExt', e.target.checked)}
                      />
                      Hide extensions for known file types
                    </CheckboxLabel>
                    <CheckboxLabel $disabled>
                      <input type="checkbox" disabled defaultChecked />
                      Hide protected operating system files (Recommended)
                    </CheckboxLabel>
                    <CheckboxLabel $disabled>
                      <input type="checkbox" disabled />
                      Restore previous folder windows at logon
                    </CheckboxLabel>
                    <CheckboxLabel $disabled>
                      <input type="checkbox" disabled />
                      Show Control Panel in My Computer
                    </CheckboxLabel>
                  </CheckboxGroup>
                </AdvancedPane>

                <RestoreDefaultsRow>
                  <XPButton disabled>Restore Defaults</XPButton>
                </RestoreDefaultsRow>
              </ViewTab>
            )}
          </TabPanel>
        </section>

        <Actions>
          <ActionButton onClick={handleOk}>OK</ActionButton>
          <ActionButton onClick={handleCancel}>Cancel</ActionButton>
          <ActionButton disabled={!isDirty} onClick={handleApply}>Apply</ActionButton>
        </Actions>
      </WindowSurface>
    </ProgramLayout>
  );
}

/* ── Styled Components ── */

const WindowSurface = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: linear-gradient(180deg, #f7f6f0 0%, #ece9d8 45%, #e2dfcf 100%);
  padding: 8px;
  gap: 10px;
  overflow: hidden;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  font-size: 11px;

  section.tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-top: 2px;
  }
`;

const TabsBar = styled.menu`
  margin: 0;
  padding: 6px 6px 0 6px;
  display: flex;
  gap: 2px;
  border-radius: 4px 4px 0 0;
  border-bottom: none;
  margin-bottom: -1px;
`;

const TabButton = styled.button`
  min-width: 76px;
  padding: 5px 10px 6px 10px;
  font-size: 12px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  border: 1px solid #91a7b4;
  border-bottom: ${({ $active }) => ($active ? '1px solid #fbfbfc' : '1px solid #919b9c')};
  border-radius: 3px 3px 0 0;
  background: ${({ $active }) => ($active
    ? 'linear-gradient(180deg, #fff, #fafaf9 26%, #f0f0ea 95%, #ecebe5)'
    : 'linear-gradient(180deg, #f7f7f7, #ededeb 40%, #e7e7e0 95%, #e2e2d8)')};
  color: ${({ $active }) => ($active ? '#000' : '#222')};
  box-shadow: ${({ $active }) => ($active ? 'inset 0 2px #ffc73c, inset 0 1px 0 #fff' : 'none')};
  position: relative;
  top: ${({ $active }) => ($active ? '0' : '1px')};
  margin-bottom: ${({ $active }) => ($active ? '-1px' : '0')};
  cursor: pointer;

  &:hover {
    border-top: 1px solid #e68b2c;
    box-shadow: inset 0 2px #ffc73c;
  }
`;

const TabPanel = styled.article`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background: #fbfbfc;
  border: 1px solid #919b9c;
  border-top: 1px solid #919b9c;
  box-shadow: inset 1px 1px #fcfcfe, inset -1px -1px #fcfcfe, 1px 2px 2px 0 rgba(208, 206, 191, 0.75);
  border-radius: 0 0 4px 4px;
  margin-top: 0;
`;

const GeneralTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ViewTab = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Grouper = styled.fieldset`
  border: 1px solid #c0c0c0;
  border-radius: 2px;
  padding: 6px 8px;
  margin: 0;
`;

const GrouperHeading = styled.legend`
  font-size: 11px;
  font-weight: normal;
  color: #000;
  padding: 0 4px;
`;

const GrouperContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const GrouperIcon = styled.img`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  color: ${({ $disabled }) => ($disabled ? '#808080' : '#000')};

  input[type="radio"] {
    margin: 0 2px 0 0;
  }
`;

const SubRadioLabel = styled(RadioLabel)`
  margin-left: 16px;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  color: ${({ $disabled }) => ($disabled ? '#808080' : '#000')};

  input[type="checkbox"] {
    margin: 0 2px 0 0;
  }
`;

const FolderViewsText = styled.span`
  font-size: 11px;
  line-height: 1.4;
  flex: 1;
`;

const FolderViewButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 4px;
`;

const AdvancedLabel = styled.span`
  font-size: 11px;
  margin-top: 4px;
`;

const AdvancedPane = styled.div`
  flex: 1;
  border: 1px solid #808080;
  border-top: 1px solid #404040;
  background: #fff;
  padding: 4px;
  overflow-y: auto;
  min-height: 120px;
`;

const TreeEntry = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;
`;

const TreeIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const TreeName = styled.span`
  font-size: 11px;
  font-weight: bold;
`;

const RestoreDefaultsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`;

const XPButton = styled.button`
  min-width: 72px;
  padding: 4px 10px;
  font-size: 11px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: pointer;

  &:active:not(:disabled) {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }

  &:disabled {
    color: #808080;
    cursor: default;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid #c6c6c6;
  background: #ece9d8;
`;

const ActionButton = styled.button`
  min-width: 72px;
  padding: 6px 12px;
  font-size: 11px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  box-shadow: none;
  cursor: pointer;

  &:active:not(:disabled) {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }

  &:disabled {
    color: #808080;
    cursor: default;
  }
`;

export default FolderOptions;
