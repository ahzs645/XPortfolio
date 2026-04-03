import React, { useState } from 'react';
import styled from 'styled-components';
import { ProgramLayout } from '../../../components';
import { useConfig } from '../../../contexts/ConfigContext';
import { useShellSettings } from '../../../contexts/ShellSettingsContext';
import { withBaseUrl } from '../../../utils/baseUrl';

const TABS = [
  { id: 'taskbar', label: 'Taskbar' },
  { id: 'startmenu', label: 'Start Menu' },
];

function TaskbarProperties({ onClose, onMinimize }) {
  const { getUsername } = useConfig();
  const { taskbar, setTaskbarSettings } = useShellSettings();
  const [activeTab, setActiveTab] = useState('taskbar');
  const [lockTaskbar, setLockTaskbar] = useState(taskbar.lockTaskbar);
  const [autoHide, setAutoHide] = useState(taskbar.autoHide);
  const [keepOnTop, setKeepOnTop] = useState(taskbar.keepOnTop);
  const [groupButtons, setGroupButtons] = useState(taskbar.groupButtons);
  const [showQuickLaunch, setShowQuickLaunch] = useState(taskbar.showQuickLaunch);
  const [showClock, setShowClock] = useState(taskbar.showClock);
  const [hideInactive, setHideInactive] = useState(taskbar.hideInactiveIcons);
  const [startMenuStyle, setStartMenuStyle] = useState(taskbar.startMenuStyle);
  const isDirty = (
    lockTaskbar !== taskbar.lockTaskbar
    || autoHide !== taskbar.autoHide
    || keepOnTop !== taskbar.keepOnTop
    || groupButtons !== taskbar.groupButtons
    || showQuickLaunch !== taskbar.showQuickLaunch
    || showClock !== taskbar.showClock
    || hideInactive !== taskbar.hideInactiveIcons
    || startMenuStyle !== taskbar.startMenuStyle
  );

  const handleApply = () => {
    setTaskbarSettings({
      lockTaskbar,
      autoHide,
      keepOnTop,
      groupButtons,
      showQuickLaunch,
      showClock,
      hideInactiveIcons: hideInactive,
      startMenuStyle,
    });
  };

  return (
    <ProgramLayout
      menus={[]}
      windowActions={{ onClose, onMinimize }}
      showMenuBar={false}
      showToolbar={false}
      showAddressBar={false}
      statusFields={null}
      showStatusBar={false}
    >
      <WindowSurface>
        <section className="tabs">
          <TabsBar role="tablist">
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                $active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </TabButton>
            ))}
          </TabsBar>

          <TabPanel $active={activeTab === 'taskbar'} hidden={activeTab !== 'taskbar'}>
            <Fieldset>
              <Legend>Taskbar appearance</Legend>
              <TaskbarPreviewContainer>
                <TaskbarPreviewDesktop>
                  <TaskbarPreviewBar>
                    <StartButtonPreview />
                    <WindowButton $active>
                      <img src={withBaseUrl('/icons/xp/InternetExplorer6.png')} alt="" />
                      <span>2 Internet...</span>
                      <DropdownArrow>▼</DropdownArrow>
                    </WindowButton>
                    <WindowButton>
                      <img src={withBaseUrl('/icons/xp/FolderClosed.png')} alt="" />
                      <span>Folder</span>
                    </WindowButton>
                    <QuickLaunchSpacer />
                    <TrayPlayButton>▶</TrayPlayButton>
                  </TaskbarPreviewBar>
                </TaskbarPreviewDesktop>
              </TaskbarPreviewContainer>
              <div className="field-row">
                <input type="checkbox" id="lockTaskbar" checked={lockTaskbar} onChange={(e) => setLockTaskbar(e.target.checked)} />
                <label htmlFor="lockTaskbar">Lock the taskbar</label>
              </div>
              <div className="field-row">
                <input type="checkbox" id="autoHide" checked={autoHide} onChange={(e) => setAutoHide(e.target.checked)} />
                <label htmlFor="autoHide">Auto-hide the taskbar</label>
              </div>
              <div className="field-row">
                <input type="checkbox" id="keepOnTop" checked={keepOnTop} onChange={(e) => setKeepOnTop(e.target.checked)} />
                <label htmlFor="keepOnTop">Keep the taskbar on top of other windows</label>
              </div>
              <div className="field-row">
                <input type="checkbox" id="groupButtons" checked={groupButtons} onChange={(e) => setGroupButtons(e.target.checked)} />
                <label htmlFor="groupButtons">Group similar taskbar buttons</label>
              </div>
              <div className="field-row">
                <input type="checkbox" id="showQuickLaunch" checked={showQuickLaunch} onChange={(e) => setShowQuickLaunch(e.target.checked)} />
                <label htmlFor="showQuickLaunch">Show Quick Launch</label>
              </div>
            </Fieldset>

            <Fieldset>
              <Legend>Notification area</Legend>
              <NotificationPreviewContainer>
                <NotificationPreviewBar>
                  <ChevronIcon>«</ChevronIcon>
                  <TrayIcons>
                    <TrayIconSmall>🖨</TrayIconSmall>
                    <TrayIconSmall>🔧</TrayIconSmall>
                  </TrayIcons>
                  <TrayTime>1:23 PM</TrayTime>
                </NotificationPreviewBar>
              </NotificationPreviewContainer>
              <div className="field-row">
                <input type="checkbox" id="showClock" checked={showClock} onChange={(e) => setShowClock(e.target.checked)} />
                <label htmlFor="showClock">Show the clock</label>
              </div>
              <SmallText>
                You can keep the notification area uncluttered by hiding icons that you have not clicked recently.
              </SmallText>
              <CheckboxRowWithButton>
                <div className="field-row">
                  <input type="checkbox" id="hideInactive" checked={hideInactive} onChange={(e) => setHideInactive(e.target.checked)} />
                  <label htmlFor="hideInactive">Hide inactive icons</label>
                </div>
                <SideButton type="button" disabled>Customize...</SideButton>
              </CheckboxRowWithButton>
            </Fieldset>
          </TabPanel>

          <TabPanel $active={activeTab === 'startmenu'} hidden={activeTab !== 'startmenu'}>
            <StartMenuContent>
              <StartMenuPreviewContainer>
                <StartMenuPreviewDesktop>
                  <StartMenuPreviewMenu>
                    <StartMenuHeader>
                      <UserAvatar />
                      <UserName>{getUsername()}</UserName>
                    </StartMenuHeader>
                    <StartMenuBody>
                      <StartMenuLeft>
                        <MenuItem><MenuIcon src={withBaseUrl('/icons/xp/InternetExplorer6.png')} /><MenuLabel>Internet<br/><small>Internet Explorer</small></MenuLabel></MenuItem>
                        <MenuItem><MenuIcon src={withBaseUrl('/icons/outlook/outlook.png')} /><MenuLabel>E-mail<br/><small>Outlook Express</small></MenuLabel></MenuItem>
                        <MenuDividerLine />
                        <MenuItem><MenuIcon src={withBaseUrl('/icons/xp/WindowsMediaPlayer9.png')} /><MenuLabel>Windows Media Player</MenuLabel></MenuItem>
                        <MenuItem><MenuIcon src={withBaseUrl('/icons/xp/messenger.png')} /><MenuLabel>Windows Messenger</MenuLabel></MenuItem>
                        <MenuItem><MenuIcon src={withBaseUrl('/icons/solitaire-icon.png')} /><MenuLabel>Hearts</MenuLabel></MenuItem>
                        <MenuItem><MenuIcon src={withBaseUrl('/icons/xp/Notepad.png')} /><MenuLabel>Notepad</MenuLabel></MenuItem>
                        <MenuItem><MenuIcon src={withBaseUrl('/icons/xp/WindowsMediaPlayer9.png')} /><MenuLabel>Windows Movie Maker</MenuLabel></MenuItem>
                        <AllProgramsButton>All Programs ▸</AllProgramsButton>
                      </StartMenuLeft>
                      <StartMenuRight>
                        <MenuItemRight><MenuIcon src={withBaseUrl('/icons/xp/MyDocuments.png')} /><MenuLabel>My Documents</MenuLabel></MenuItemRight>
                        <MenuItemRight><MenuIcon src={withBaseUrl('/icons/xp/MyPictures.png')} /><MenuLabel>My Pictures</MenuLabel></MenuItemRight>
                        <MenuItemRight><MenuIcon src={withBaseUrl('/icons/xp/MyMusic.png')} /><MenuLabel>My Music</MenuLabel></MenuItemRight>
                        <MenuItemRight><MenuIcon src={withBaseUrl('/icons/xp/MyComputer.png')} /><MenuLabel>My Computer</MenuLabel></MenuItemRight>
                        <MenuDividerLine />
                        <MenuItemRight><MenuIcon src={withBaseUrl('/icons/xp/ControlPanel.png')} /><MenuLabel>Control Panel</MenuLabel></MenuItemRight>
                        <MenuItemRight><MenuIcon src={withBaseUrl('/icons/help.png')} /><MenuLabel>Help and Support</MenuLabel></MenuItemRight>
                        <MenuItemRight><MenuIcon src={withBaseUrl('/icons/xp/Search.png')} /><MenuLabel>Search</MenuLabel></MenuItemRight>
                      </StartMenuRight>
                    </StartMenuBody>
                    <StartMenuFooter>
                      <FooterButton>Log Off</FooterButton>
                      <FooterButton>Turn Off Computer</FooterButton>
                    </StartMenuFooter>
                  </StartMenuPreviewMenu>
                  <StartMenuTaskbar>
                    <StartButtonSmall>start</StartButtonSmall>
                  </StartMenuTaskbar>
                </StartMenuPreviewDesktop>
              </StartMenuPreviewContainer>

              <RadioGroup>
                <SideButton type="button" disabled>Customize...</SideButton>
                <div className="field-row">
                  <input type="radio" id="startMenuModern" name="startMenuStyle" checked={startMenuStyle === 'modern'} onChange={() => setStartMenuStyle('modern')} />
                  <label htmlFor="startMenuModern">Start menu</label>
                </div>
                <RadioDescription>
                  Select this menu style for easy access to the Internet, e-mail, and your favorite programs.
                </RadioDescription>
              </RadioGroup>

              <RadioGroup>
                <SideButton type="button" disabled>Customize...</SideButton>
                <div className="field-row">
                  <input type="radio" id="startMenuClassic" name="startMenuStyle" checked={startMenuStyle === 'classic'} onChange={() => setStartMenuStyle('classic')} />
                  <label htmlFor="startMenuClassic">Classic Start menu</label>
                </div>
                <RadioDescription>
                  Select this option to use the menu style from earlier versions of Windows.
                </RadioDescription>
              </RadioGroup>
            </StartMenuContent>
          </TabPanel>
        </section>

        <Actions>
          <ActionButton onClick={() => { handleApply(); onClose?.(); }}>OK</ActionButton>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton disabled={!isDirty} onClick={handleApply}>Apply</ActionButton>
        </Actions>
      </WindowSurface>
    </ProgramLayout>
  );
}

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

  section.tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-top: 2px;
  }

  .field-row {
    display: flex;
    align-items: center;
    margin: 4px 0;
  }

  .field-row > input {
    margin-right: 6px;
  }

  .field-row > label {
    font-size: 11px;
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
  box-shadow: inset 1px 1px #fcfcfe, inset -1px -1px #fcfcfe, 1px 2px 2px 0 rgba(208, 206, 191, 0.75);
  border-radius: 0 0 4px 4px;
  display: ${({ $active }) => ($active ? 'block' : 'none')};
`;

const Fieldset = styled.fieldset`
  margin: 0 0 10px 0;
  padding: 8px 10px 10px 10px;
  border: 1px solid #0054e3;
  border-radius: 3px;
`;

const Legend = styled.legend`
  background: #fbfbfc;
  padding: 0 4px;
  font-size: 11px;
  color: #0046d5;
`;

/* Taskbar Preview Styles */
const TaskbarPreviewContainer = styled.div`
  margin: 0 0 10px 0;
  border: 2px solid;
  border-color: #808080 #fff #fff #808080;
  background: #808080;
`;

const TaskbarPreviewDesktop = styled.div`
  background: #3a6ea5;
  height: 60px;
  position: relative;
`;

const TaskbarPreviewBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 26px;
  background: linear-gradient(
    to bottom,
    #1f2f86 0,
    #3165c4 3%,
    #3682e5 6%,
    #4490e6 10%,
    #3883e5 12%,
    #2b71e0 15%,
    #2663da 18%,
    #235bd6 20%,
    #2258d5 100%
  );
  display: flex;
  align-items: center;
  padding: 2px;
`;

const StartButtonPreview = styled.div`
  width: 70px;
  height: 22px;
  background: url(${withBaseUrl('/start-button.webp')}) no-repeat left center;
  background-size: contain;
  margin-right: 4px;
`;

const WindowButton = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  margin-right: 2px;
  height: 20px;
  font-size: 9px;
  color: #fff;
  border-radius: 2px;
  background: ${({ $active }) => $active
    ? 'linear-gradient(to bottom, #1a4aad 0%, #1644a3 15%, #123e99 50%, #0e388f 100%)'
    : 'linear-gradient(to bottom, #4e9ef8 0%, #3888e8 20%, #3482e3 60%, #2a79da 100%)'};
  box-shadow: ${({ $active }) => $active
    ? 'inset 1px 1px 2px rgba(0,0,0,0.5)'
    : 'inset 1px 1px 1px rgba(255,255,255,0.4)'};

  img {
    width: 14px;
    height: 14px;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60px;
  }
`;

const DropdownArrow = styled.span`
  font-size: 6px;
  margin-left: 2px;
`;

const QuickLaunchSpacer = styled.div`
  flex: 1;
`;

const TrayPlayButton = styled.div`
  width: 16px;
  height: 16px;
  background: linear-gradient(to bottom, #7dc37d 0%, #5eb35e 50%, #3a9a3a 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #fff;
  margin-right: 4px;
`;

/* Notification Preview Styles */
const NotificationPreviewContainer = styled.div`
  margin: 0 0 10px 0;
  border: 2px solid;
  border-color: #808080 #fff #fff #808080;
  background: #808080;
`;

const NotificationPreviewBar = styled.div`
  height: 26px;
  background: linear-gradient(
    to bottom,
    #0c59b9 1%,
    #139ee9 6%,
    #18b5f2 10%,
    #139beb 14%,
    #1290e8 50%,
    #0d8dea 80%,
    #0d9ff1 100%
  );
  display: flex;
  align-items: center;
  padding: 2px 8px;
`;

const ChevronIcon = styled.div`
  color: #fff;
  font-size: 10px;
  margin-right: 6px;
  background: rgba(255,255,255,0.2);
  padding: 1px 4px;
  border-radius: 2px;
`;

const TrayIcons = styled.div`
  display: flex;
  gap: 4px;
  flex: 1;
`;

const TrayIconSmall = styled.div`
  font-size: 12px;
`;

const TrayTime = styled.div`
  color: #fff;
  font-size: 10px;
  font-weight: bold;
`;

/* Start Menu Preview Styles */
const StartMenuContent = styled.div`
  padding: 5px;
`;

const StartMenuPreviewContainer = styled.div`
  margin: 0 auto 15px auto;
  border: 2px solid;
  border-color: #808080 #fff #fff #808080;
  background: #808080;
  max-width: 320px;
`;

const StartMenuPreviewDesktop = styled.div`
  background: url(${withBaseUrl('/wallpapers/Bliss.jpg')}) center center;
  background-size: cover;
  height: 220px;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const StartMenuPreviewMenu = styled.div`
  position: absolute;
  bottom: 22px;
  left: 0;
  width: 200px;
  background: #fff;
  border: 2px solid #0054e3;
  border-radius: 6px 6px 0 6px;
  overflow: hidden;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
  transform: scale(0.75);
  transform-origin: bottom left;
`;

const StartMenuHeader = styled.div`
  background: linear-gradient(to bottom, #1955c8 0%, #2667d8 50%, #1955c8 100%);
  padding: 6px 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  background: #ddd url(${withBaseUrl('/icons/xp/UserAccounts.png')}) center center no-repeat;
  background-size: contain;
  border: 2px solid #fff;
  border-radius: 3px;
`;

const UserName = styled.div`
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.3);
`;

const StartMenuBody = styled.div`
  display: flex;
  min-height: 140px;
`;

const StartMenuLeft = styled.div`
  flex: 1;
  background: #fff;
  padding: 4px;
  border-right: 1px solid #d5e2f5;
`;

const StartMenuRight = styled.div`
  flex: 1;
  background: #d5e2f5;
  padding: 4px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
  font-size: 8px;
  cursor: default;

  &:hover {
    background: #316ac5;
    color: #fff;
  }
`;

const MenuItemRight = styled(MenuItem)`
  &:hover {
    background: #316ac5;
    color: #fff;
  }
`;

const MenuIcon = styled.img`
  width: 18px;
  height: 18px;
`;

const MenuLabel = styled.span`
  line-height: 1.1;

  small {
    font-size: 7px;
    color: #808080;
  }
`;

const MenuDividerLine = styled.div`
  height: 1px;
  background: linear-gradient(to right, transparent, #808080, transparent);
  margin: 4px 0;
`;

const AllProgramsButton = styled.div`
  font-size: 8px;
  padding: 4px;
  margin-top: auto;
  text-align: right;
  color: #000;
  font-weight: bold;

  &:hover {
    background: #316ac5;
    color: #fff;
  }
`;

const StartMenuFooter = styled.div`
  background: linear-gradient(to bottom, #1e54c1 0%, #0d429e 100%);
  padding: 4px 8px;
  display: flex;
  justify-content: space-around;
`;

const FooterButton = styled.div`
  color: #fff;
  font-size: 8px;
  padding: 2px 6px;

  &:hover {
    background: rgba(255,255,255,0.2);
    border-radius: 2px;
  }
`;

const StartMenuTaskbar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 22px;
  background: linear-gradient(
    to bottom,
    #1f2f86 0,
    #3165c4 3%,
    #3682e5 6%,
    #4490e6 10%,
    #2258d5 100%
  );
  display: flex;
  align-items: center;
  padding: 0 2px;
`;

const StartButtonSmall = styled.div`
  background: url(${withBaseUrl('/start-button.webp')}) no-repeat left center;
  background-size: contain;
  width: 55px;
  height: 20px;
  font-size: 0;
`;

const CheckboxRowWithButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 5px 0;

  > div {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;

    input {
      margin: 0;
    }
  }
`;

const SmallText = styled.p`
  margin: 8px 0;
  font-size: 11px;
  color: #000;
`;

const SideButton = styled.button`
  padding: 4px 10px;
  font-size: 11px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  min-width: 90px;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  color: ${({ disabled }) => (disabled ? '#808080' : '#000')};

  &:disabled {
    opacity: 0.6;
  }

  &:hover:not(:disabled) {
    box-shadow: inset -1px 1px #fff0cf, inset 1px 2px #fdd889, inset -2px 2px #fbc761, inset 2px -2px #e5a01a;
  }
`;

const RadioGroup = styled.div`
  margin: 15px 0;
  color: #000;
  position: relative;

  ${SideButton} {
    float: right;
    margin-left: 10px;
  }

  .field-row {
    margin-bottom: 2px;
  }
`;

const RadioDescription = styled.div`
  margin-left: 19px;
  font-size: 11px;
  line-height: 1.4;
  color: #000;
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
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  color: ${({ disabled }) => (disabled ? '#808080' : '#000')};

  &:disabled {
    opacity: 0.6;
  }

  &:active:not(:disabled) {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }
`;

export default TaskbarProperties;
