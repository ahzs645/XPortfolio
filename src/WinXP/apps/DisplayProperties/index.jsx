import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { ProgramLayout, FileChooser } from '../../../components';
import { useConfig } from '../../../contexts/ConfigContext';

const WALLPAPERS = [
  { id: 'none', name: '(None)', path: null },
  { id: 'ascent', name: 'Ascent', path: '/wallpapers/Ascent.jpg' },
  { id: 'autumn', name: 'Autumn', path: '/wallpapers/Autumn.jpg' },
  { id: 'azul', name: 'Azul', path: '/wallpapers/Azul.jpg' },
  { id: 'bliss', name: 'Bliss', path: '/wallpapers/Bliss.jpg' },
  { id: 'follow', name: 'Follow', path: '/wallpapers/Follow.jpg' },
  { id: 'friend', name: 'Friend', path: '/wallpapers/Friend.jpg' },
  { id: 'moonflower', name: 'Moonflower', path: '/wallpapers/Moonflower.jpg' },
  { id: 'radiance', name: 'Radiance', path: '/wallpapers/Radiance.jpg' },
  { id: 'redmoon', name: 'Red Moon Desert', path: '/wallpapers/Redmoondesert.jpg' },
  { id: 'tulips', name: 'Tulips', path: '/wallpapers/Tulips.jpg' },
  { id: 'wind', name: 'Wind', path: '/wallpapers/Wind.jpg' },
  { id: 'custom', name: 'Ahmad XP', path: '/Ahmadxp.png' },
];

const TABS = [
  { id: 'themes', label: 'Themes', enabled: false },
  { id: 'desktop', label: 'Desktop', enabled: true },
  { id: 'screensaver', label: 'Screen Saver', enabled: true },
  { id: 'appearance', label: 'Appearance', enabled: false },
  { id: 'settings', label: 'Settings', enabled: false },
];

const SCREENSAVERS = [
  {
    id: 'pipes',
    name: '3D Pipes',
    preview: '/screensavers/pipes/images/meta/screencap.gif',
    embed: '/screensavers/pipes/index.html',
  },
  {
    id: 'flowerbox',
    name: '3D FlowerBox',
    preview: '/screensavers/flowerbox/img/FlowerBox.PNG',
    embed: '/screensavers/flowerbox/index.html',
  },
  { id: 'blank', name: 'Blank', preview: '/gui/display/sample.png' },
];

function DisplayProperties({ onClose, onMinimize }) {
  const { getWallpaperPath, setWallpaperPath } = useConfig();
  const currentDesktop = getWallpaperPath(false);
  const [selected, setSelected] = useState(currentDesktop);
  const [activeTab, setActiveTab] = useState('desktop');
  const [applyToMobile, setApplyToMobile] = useState(true);
  const [screenSaver, setScreenSaver] = useState('pipes');
  const [waitMinutes, setWaitMinutes] = useState(60);
  const [requirePassword, setRequirePassword] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [customWallpapers, setCustomWallpapers] = useState([]);
  const previewRef = useRef(null);

  useEffect(() => {
    if (showPreview && previewRef.current) {
      previewRef.current.focus();
    }
  }, [showPreview]);

  useEffect(() => {
    if (!showPreview) return;
    const handler = () => setShowPreview(false);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showPreview]);

  const applySelection = () => {
    const wallpaperPath = selected || '';
    setWallpaperPath(wallpaperPath, { isMobile: false });
    if (applyToMobile) {
      setWallpaperPath(wallpaperPath, { isMobile: true });
    }
    onClose?.();
  };

  const handleTabClick = (tab) => {
    if (!tab.enabled) return;
    setActiveTab(tab.id);
  };

  const handleBrowseSelect = (file) => {
    if (file && file.data) {
      // Add to custom wallpapers list
      const newWallpaper = {
        id: `custom-${Date.now()}`,
        name: file.name,
        path: file.data,
      };
      setCustomWallpapers(prev => [...prev, newWallpaper]);
      setSelected(file.data);
    }
    setShowBrowse(false);
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
        <section className="tabs" aria-label="Display Properties Tabs">
          <menu role="tablist" aria-label="Display Properties">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tab-${tab.id}`}
                disabled={!tab.enabled}
                onClick={() => handleTabClick(tab)}
              >
                {tab.label}
              </button>
            ))}
          </menu>

          <article
            role="tabpanel"
            id="tab-desktop"
            hidden={activeTab !== 'desktop'}
          >
            <DesktopPane>
              <PreviewArea>
                <MonitorShell>
                  <MonitorFrame />
                  <MonitorPreview style={{
                    backgroundImage: selected ? `url(${selected})` : 'none',
                    backgroundColor: selected ? 'transparent' : '#3a6ea5'
                  }} />
                </MonitorShell>
              </PreviewArea>

              <OptionsRow>
                <ListArea>
                  <Label>Background:</Label>
                  <List role="listbox" aria-label="Wallpapers">
                    {WALLPAPERS.map((item) => (
                      <ListItem
                        key={item.id}
                        $active={selected === item.path}
                        onClick={() => setSelected(item.path)}
                        role="option"
                        aria-selected={selected === item.path}
                      >
                        {item.path && <WallpaperIcon src="/icons/xp/JPG.png" alt="" />}
                        <span>{item.name}</span>
                      </ListItem>
                    ))}
                    {customWallpapers.map((item) => (
                      <ListItem
                        key={item.id}
                        $active={selected === item.path}
                        onClick={() => setSelected(item.path)}
                        role="option"
                        aria-selected={selected === item.path}
                      >
                        <WallpaperIcon src="/icons/xp/JPG.png" alt="" />
                        <span>{item.name}</span>
                      </ListItem>
                    ))}
                  </List>
                  <CustomizeButton type="button">Customize Desktop...</CustomizeButton>
                </ListArea>

                <SideControls>
                  <SideRow>
                    <SideLabel>Browse...</SideLabel>
                    <SideButton type="button" onClick={() => setShowBrowse(true)}>
                      Browse...
                    </SideButton>
                  </SideRow>
                  <SideRow>
                    <SideLabel>Position:</SideLabel>
                    <SideSelect disabled defaultValue="stretch">
                      <option value="stretch">Stretch</option>
                      <option value="center">Center</option>
                      <option value="tile">Tile</option>
                    </SideSelect>
                  </SideRow>
                  <SideRow>
                    <SideLabel>Color:</SideLabel>
                    <ColorSwatch>
                      <span />
                    </ColorSwatch>
                  </SideRow>
                  <MobileRow>
                    <input
                      id="apply-mobile"
                      type="checkbox"
                      checked={applyToMobile}
                      onChange={(e) => setApplyToMobile(e.target.checked)}
                    />
                    <label htmlFor="apply-mobile">Use for mobile too</label>
                  </MobileRow>
                </SideControls>
              </OptionsRow>
            </DesktopPane>
          </article>

          {TABS.filter(tab => tab.id !== 'desktop').map((tab) => (
            <article
              key={tab.id}
              role="tabpanel"
              id={`tab-${tab.id}`}
              hidden={activeTab !== tab.id}
            >
              {tab.id === 'screensaver' ? (
                <ScreensaverPane>
                  <PreviewArea>
                    <MonitorShell>
                      <MonitorFrame />
                      <MonitorPreview
                        style={{
                          backgroundImage: `url(${
                            SCREENSAVERS.find(s => s.id === screenSaver)?.preview || '/gui/display/sample.png'
                          })`,
                        }}
                      />
                    </MonitorShell>
                  </PreviewArea>

                  <ScreensaverControls>
                    <GroupBox>
                      <GroupTitle>Screen saver</GroupTitle>
                      <Row>
                        <SideSelect
                          value={screenSaver}
                          onChange={(e) => setScreenSaver(e.target.value)}
                        >
                          {SCREENSAVERS.map((item) => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </SideSelect>
                        <SideButton type="button" $disabled>Settings</SideButton>
                        <SideButton type="button" onClick={() => setShowPreview(true)}>
                          Preview
                        </SideButton>
                      </Row>
                      <Row>
                        <SideLabel>Wait:</SideLabel>
                        <WaitInput
                          type="number"
                          min="1"
                          value={waitMinutes}
                          onChange={(e) => setWaitMinutes(Number(e.target.value) || 0)}
                        />
                        <span>minutes</span>
                        <CheckboxRow>
                          <input
                            id="resume-password"
                            type="checkbox"
                            checked={requirePassword}
                            onChange={(e) => setRequirePassword(e.target.checked)}
                          />
                          <label htmlFor="resume-password">On resume, password protect</label>
                        </CheckboxRow>
                      </Row>
                    </GroupBox>

                    <GroupBox>
                      <GroupTitle>Monitor power</GroupTitle>
                      <p>To adjust monitor power settings and save energy, click Power.</p>
                      <SideButton type="button" disabled style={{ alignSelf: 'flex-start' }}>
                        Power...
                      </SideButton>
                    </GroupBox>
                  </ScreensaverControls>
                </ScreensaverPane>
              ) : (
                <Placeholder>({tab.label} tab is unavailable)</Placeholder>
              )}
            </article>
          ))}
        </section>

        <Actions>
          <ActionButton onClick={applySelection}>OK</ActionButton>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
        </Actions>

        {showPreview && (
          createPortal(
            <PreviewOverlay
              ref={previewRef}
              tabIndex={-1}
              onClick={() => setShowPreview(false)}
              onKeyDown={(e) => {
                e.preventDefault();
                setShowPreview(false);
              }}
            >
              {(() => {
                const saver = SCREENSAVERS.find(s => s.id === screenSaver);
                if (saver?.embed) {
                  return (
                    <PreviewFrame
                      src={saver.embed}
                      title={`${saver.name} screensaver preview`}
                    />
                  );
                }
                return (
                  <PreviewImage
                    style={{
                      backgroundImage: `url(${saver?.preview || '/gui/display/sample.png'})`,
                    }}
                  />
                );
              })()}
            </PreviewOverlay>,
            document.body
          )
        )}

      </WindowSurface>

      {showBrowse && createPortal(
        <FileChooser
          isOpen={showBrowse}
          onClose={() => setShowBrowse(false)}
          onSelect={handleBrowseSelect}
          title="Browse"
          fileTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']}
          fileTypesDesc="Image Files"
        />,
        document.body
      )}
    </ProgramLayout>
  );
}

const WindowSurface = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #ece9d8;
  padding: 6px;
  gap: 8px;
  overflow: hidden;

  section.tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding-top: 2px;
  }

  menu[role='tablist'] {
    margin: 0;
    padding: 2px 6px 0 6px;
    display: flex;
    gap: 2px;
  }

  menu[role='tablist'] button[role='tab'] {
    min-width: 70px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  article[role='tabpanel'] {
    flex: 1;
    padding: 6px;
    overflow: hidden;
    background: #f7f7f7;
    border: 1px solid #919b9c;
    border-top: none;
    box-shadow: none;
  }
`;

const DesktopPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  justify-content: flex-start;
  padding-bottom: 6px;
`;

const PreviewArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border: 1px solid #b5b5b5;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #9a9a9a;
  padding: 10px;
  min-height: 140px;
`;

const MonitorShell = styled.div`
  position: relative;
  width: 185px;
  height: 163px;
  overflow: hidden;
`;

const MonitorFrame = styled.div`
  position: absolute;
  inset: 0;
  background: url('/gui/display/monitor.png') no-repeat center center;
  background-size: contain;
`;

const MonitorPreview = styled.div`
  position: absolute;
  top: 17px;
  left: 16px;
  width: 152px;
  height: 112px;
  background-size: cover;
  background-position: center;
  border: 1px solid #6f6f6f;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.45);
`;

const ListArea = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 6px;
  flex: 1;
`;

const Label = styled.div`
  font-size: 13px;
  font-weight: 600;
`;

const List = styled.div`
  flex: 1;
  border: 1px solid #7f7f7f;
  background: #fff;
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: inset 1px 1px 0 #808080, inset -1px -1px 0 #fff;
  padding: 2px;
  min-height: 120px;
  max-height: 180px;
`;

const ListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 3px 6px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? '#316ac5' : 'transparent')};
  color: ${({ $active }) => ($active ? '#fff' : '#000')};
  font-size: 11px;
  border-radius: 2px;

  &:hover {
    background: ${({ $active }) => ($active ? '#316ac5' : '#e8f4ff')};
  }
`;

const WallpaperIcon = styled.img`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const MobileRow = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin-top: 6px;
`;

const OptionsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 190px;
  gap: 12px;
  align-items: start;
  flex: 1;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const SideControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-self: stretch;
`;

const SideRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const SideLabel = styled.span`
  font-size: 12px;
  color: #000;
`;

const SideButton = styled.button`
  padding: 4px 8px;
  font-size: 12px;
  min-width: 90px;
  background: linear-gradient(#f3f3f3, #dcdcdc);
  border: 1px solid #8a8a8a;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #b5b5b5;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  color: ${({ $disabled }) => ($disabled ? '#666' : '#000')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
`;

const SideSelect = styled.select`
  font-size: 12px;
  min-width: 90px;
  padding: 3px 4px;
`;

const ColorSwatch = styled.div`
  width: 100px;
  height: 24px;
  border: 1px solid #8a8a8a;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #b5b5b5;
  background: linear-gradient(90deg, #072c6c, #0a3f9a);
`;

const CustomizeButton = styled.button`
  margin-top: 6px;
  align-self: flex-start;
  padding: 6px 10px;
  font-size: 12px;
  background: linear-gradient(#f3f3f3, #dcdcdc);
  border: 1px solid #8a8a8a;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #b5b5b5;
  cursor: not-allowed;
  color: #666;
`;

const Placeholder = styled.div`
  font-size: 13px;
  color: #555;
`;

const ScreensaverPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding-bottom: 6px;
`;

const ScreensaverControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const GroupBox = styled.div`
  border: 1px solid #b5b5b5;
  background: #f6f6f6;
  padding: 8px;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #c6c6c6;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const GroupTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const WaitInput = styled.input`
  width: 50px;
  padding: 2px 4px;
  font-size: 12px;
`;

const CheckboxRow = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
`;

const PreviewOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  outline: none;
  background-color: #000;
  gap: 16px;
`;

const PreviewFrame = styled.iframe`
  position: relative;
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: none;
  background: #000;
`;

const PreviewImage = styled.div`
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: none;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ActionButton = styled.button`
  min-width: 72px;
  padding: 6px 12px;
  font-size: 12px;
  background: linear-gradient(#f3f3f3, #dcdcdc);
  border: 1px solid #8a8a8a;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #b5b5b5;
  cursor: pointer;

  &:active {
    background: linear-gradient(#dcdcdc, #c2c2c2);
  }
`;

export default DisplayProperties;
