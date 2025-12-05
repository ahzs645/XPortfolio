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
  { id: 'themes', label: 'Themes', enabled: true },
  { id: 'desktop', label: 'Desktop', enabled: true },
  { id: 'screensaver', label: 'Screen Saver', enabled: true },
  { id: 'appearance', label: 'Appearance', enabled: true },
  { id: 'settings', label: 'Settings', enabled: true },
];

const THEMES = [
  { id: 'xp', name: 'Windows XP', preview: '/gui/display/reference/preview.png' },
  { id: 'silver', name: 'Windows XP (Silver)', preview: '/gui/display/reference/appearance.png' },
  { id: 'olive', name: 'Windows XP (Olive)', preview: '/gui/display/reference/appearance.png' },
  { id: 'classic', name: 'Windows Classic', preview: '/gui/display/reference/appearance.png' },
];

const COLOR_SCHEMES = [
  { id: 'blue', label: 'Default (Blue)' },
  { id: 'silver', label: 'Silver' },
  { id: 'olive', label: 'Olive Green' },
  { id: 'classic', label: 'Windows Classic' },
];

const WINDOW_STYLES = [
  { id: 'xp', label: 'Windows XP style' },
  { id: 'classic', label: 'Windows Classic style' },
];

const FONT_SIZES = [
  { id: 'normal', label: 'Normal' },
  { id: 'large', label: 'Large Fonts' },
  { id: 'extra', label: 'Extra Large Fonts' },
];

const RESOLUTIONS = ['640 x 480', '800 x 600', '1024 x 768', '1152 x 864', '1280 x 1024'];

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
  { id: 'windows', name: 'Windows Logo', preview: '/gui/display/reference/systemmonitor.png' },
  { id: 'starfield', name: 'Starfield', preview: '/gui/display/reference/displaysettings.png' },
  { id: 'mystify', name: 'Mystify', preview: '/gui/display/reference/appearance.png' },
  { id: 'ribbons', name: 'Ribbons', preview: '/gui/display/reference/resolutionsetting.png' },
  { id: 'balls', name: 'Bouncing Balls', preview: '/gui/display/reference/displaysettings.png' },
  { id: 'matrix', name: 'Matrix', preview: '/gui/display/reference/preview.png' },
  { id: 'rain', name: 'Digital Rain', preview: '/gui/display/reference/appearance.png' },
  { id: 'blank', name: 'Blank', preview: '/gui/display/sample.png' },
];

function DisplayProperties({ onClose, onMinimize }) {
  const { getWallpaperPath, setWallpaperPath } = useConfig();
  const currentDesktop = getWallpaperPath(false);
  const [selected, setSelected] = useState(currentDesktop);
  const [activeTab, setActiveTab] = useState('desktop');
  const [applyToMobile, setApplyToMobile] = useState(true);
  const [screenSaver, setScreenSaver] = useState('windows');
  const [waitMinutes, setWaitMinutes] = useState(60);
  const [requirePassword, setRequirePassword] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [customWallpapers, setCustomWallpapers] = useState([]);
  const [theme, setTheme] = useState('xp');
  const [colorScheme, setColorScheme] = useState('blue');
  const [windowStyle, setWindowStyle] = useState('xp');
  const [fontSize, setFontSize] = useState('normal');
  const [resolutionIndex, setResolutionIndex] = useState(2);
  const [colorQuality, setColorQuality] = useState('32');
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
          <TabsBar role="tablist" aria-label="Display Properties">
            {TABS.map((tab) => (
              <TabButton
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`tab-${tab.id}`}
                disabled={!tab.enabled}
                $active={activeTab === tab.id}
                onClick={() => handleTabClick(tab)}
              >
                {tab.label}
              </TabButton>
            ))}
          </TabsBar>

          <TabPanel
            role="tabpanel"
            id="tab-desktop"
            hidden={activeTab !== 'desktop'}
            $active={activeTab === 'desktop'}
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
          </TabPanel>

          {TABS.filter(tab => tab.id !== 'desktop').map((tab) => (
            <TabPanel
              key={tab.id}
              role="tabpanel"
              id={`tab-${tab.id}`}
              hidden={activeTab !== tab.id}
              $active={activeTab === tab.id}
            >
              {tab.id === 'themes' && (
                <ThemesPane>
                  <ThemeControls>
                    <SmallText>A theme is a background plus a set of sounds, icons, and other elements to help you personalize your computer.</SmallText>
                    <Label>Theme:</Label>
                    <Row style={{ alignItems: 'stretch', gap: '6px' }}>
                      <SideSelect
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        style={{ flex: 1 }}
                      >
                        {THEMES.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </SideSelect>
                      <ThemeActions style={{ margin: 0 }}>
                        <SideButton type="button" disabled $disabled>Save As...</SideButton>
                        <SideButton type="button" disabled $disabled>Delete</SideButton>
                      </ThemeActions>
                    </Row>
                  </ThemeControls>
                  <SmallText style={{ marginTop: 6 }}>Sample:</SmallText>
                  <ThemePreview>
                    <img src={THEMES.find(t => t.id === theme)?.preview} alt={`${theme} preview`} />
                  </ThemePreview>
                </ThemesPane>
              )}

              {tab.id === 'screensaver' && (
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
                        <SideButton type="button" disabled $disabled>Settings</SideButton>
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
                      <SideButton type="button" disabled $disabled style={{ alignSelf: 'flex-start' }}>
                        Power...
                      </SideButton>
                    </GroupBox>
                  </ScreensaverControls>
                </ScreensaverPane>
              )}

              {tab.id === 'appearance' && (
                <AppearancePane>
                  <AppearancePreview>
                    <img src="/gui/display/reference/appearance.png" alt="Appearance preview" />
                  </AppearancePreview>
                  <AppearanceControls>
                    <GroupBox>
                      <GroupTitle>Windows and buttons</GroupTitle>
                      <SideSelect value={windowStyle} onChange={(e) => setWindowStyle(e.target.value)}>
                        {WINDOW_STYLES.map(option => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </SideSelect>
                    </GroupBox>
                    <GroupBox>
                      <GroupTitle>Color scheme</GroupTitle>
                      <SideSelect value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
                        {COLOR_SCHEMES.map(option => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </SideSelect>
                    </GroupBox>
                    <GroupBox>
                      <GroupTitle>Font size</GroupTitle>
                      <SideSelect value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
                        {FONT_SIZES.map(option => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </SideSelect>
                      <SideButton type="button" disabled $disabled style={{ marginTop: 6 }}>Effects...</SideButton>
                    </GroupBox>
                  </AppearanceControls>
                </AppearancePane>
              )}

              {tab.id === 'settings' && (
                <SettingsPane>
                  <SettingsPreview>
                    <img src="/gui/display/reference/displaysettings.png" alt="Display settings preview" />
                  </SettingsPreview>
                  <SettingsControls>
                    <GroupBox>
                      <GroupTitle>Screen resolution</GroupTitle>
                      <ResolutionRow>
                        <SideLabel>Less</SideLabel>
                        <ResolutionSlider
                          type="range"
                          min="0"
                          max={RESOLUTIONS.length - 1}
                          value={resolutionIndex}
                          onChange={(e) => setResolutionIndex(Number(e.target.value))}
                        />
                        <SideLabel>More</SideLabel>
                      </ResolutionRow>
                      <SmallText>{RESOLUTIONS[resolutionIndex]} pixels</SmallText>
                    </GroupBox>

                    <GroupBox>
                      <GroupTitle>Color quality</GroupTitle>
                      <SideSelect value={colorQuality} onChange={(e) => setColorQuality(e.target.value)}>
                        <option value="32">Highest (32 bit)</option>
                        <option value="24">24 bit</option>
                        <option value="16">Medium (16 bit)</option>
                      </SideSelect>
                    </GroupBox>

                    <SettingsActions>
                      <SideButton type="button" disabled $disabled>Identify</SideButton>
                      <SideButton type="button" disabled $disabled>Troubleshoot...</SideButton>
                      <SideButton type="button" disabled $disabled>Advanced...</SideButton>
                    </SettingsActions>
                  </SettingsControls>
                </SettingsPane>
              )}
            </TabPanel>
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
  background: linear-gradient(180deg, #f7f6f0 0%, #ece9d8 45%, #e2dfcf 100%);
  padding: 8px;
  gap: 10px;
  overflow: hidden;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;

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
  background: linear-gradient(180deg, #f8f8f4 0%, #eae7d9 100%);
  border: 1px solid #919b9c;
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
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.65 : 1)};

  &:hover:not(:disabled) {
    border-top: 1px solid #e68b2c;
    box-shadow: inset 0 2px #ffc73c;
  }
`;

const TabPanel = styled.article`
  flex: 1;
  padding: 10px;
  overflow: hidden;
  background: #fbfbfc;
  border: 1px solid #919b9c;
  border-top: 1px solid #919b9c;
  box-shadow: inset 1px 1px #fcfcfe, inset -1px -1px #fcfcfe, 1px 2px 2px 0 rgba(208, 206, 191, 0.75);
  border-radius: 0 0 4px 4px;
  margin-top: 0;
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
  background: linear-gradient(180deg, #ffffff 0%, #f8f8f4 100%);
  border: 2px solid #716f64;
  box-shadow: inset 1px 1px 0 #f1efe2, inset -1px -1px 0 #f1efe2;
  padding: 10px;
  min-height: 150px;
`;

const MonitorShell = styled.div`
  position: relative;
  width: 185px;
  height: 163px;
  overflow: hidden;
  filter: drop-shadow(2px 3px 4px rgba(0, 0, 0, 0.25));
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
  font-weight: 500;
`;

const List = styled.div`
  flex: 1;
  border: 1px solid #7f9db9;
  background: linear-gradient(180deg, #ffffff 0%, #f7f7f7 100%);
  overflow-y: auto;
  overflow-x: hidden;
  box-shadow: inset 1px 1px 0 #dfe9f5, inset -1px -1px 0 #dfe9f5;
  padding: 3px;
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
  font-size: 12px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  border-radius: 2px;

  &:hover {
    background: ${({ $active }) => ($active ? '#316ac5' : '#dbe9f6')};
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
  padding: 4px 10px;
  font-size: 11px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  min-width: 90px;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  box-shadow: none;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  color: ${({ $disabled }) => ($disabled ? '#666' : '#000')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

  &:hover:not(:disabled) {
    box-shadow: inset -1px 1px #fff0cf, inset 1px 2px #fdd889, inset -2px 2px #fbc761, inset 2px -2px #e5a01a;
  }
`;

const SideSelect = styled.select`
  font-size: 12px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  min-width: 90px;
  padding: 3px 4px;
  border: 1px solid #7f9db9;
  background-color: #fff;
`;

const ColorSwatch = styled.div`
  width: 100px;
  height: 24px;
  border: 1px solid #7f9db9;
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
  border-radius: 3px;
`;

const GroupTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: #1b59d7;
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

const ThemesPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  align-items: stretch;
`;

const ThemePreview = styled.div`
  border: 2px solid;
  border-color: #716f64 #f1efe2 #f1efe2 #716f64;
  background: linear-gradient(180deg, #ffffff 0%, #f6f6f2 100%);
  box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #d6d3c7;
  padding: 8px;
  min-height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  max-width: 100%;
  width: 100%;
  align-self: center;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    border-radius: 3px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
`;

const ThemeControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  width: 100%;
`;

const SmallText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #333;
`;

const ThemeActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 2px;
`;

const AppearancePane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
`;

const AppearancePreview = styled.div`
  border: 1px solid #b5b5b5;
  background: linear-gradient(180deg, #ffffff 0%, #f2f2f2 100%);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #9a9a9a;
  border-radius: 3px;
  max-width: 520px;
  width: 100%;
  align-self: center;

  img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
    border-radius: 3px;
  }
`;

const AppearanceControls = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  align-content: start;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
`;

const SettingsPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
`;

const SettingsPreview = styled.div`
  border: 1px solid #b5b5b5;
  background: linear-gradient(180deg, #ffffff 0%, #f2f2f2 100%);
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #9a9a9a;
  border-radius: 3px;
  max-width: 520px;
  width: 100%;
  align-self: center;

  img {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }
`;

const SettingsControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ResolutionRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
`;

const ResolutionSlider = styled.input`
  width: 100%;
  height: 6px;
  appearance: none;
  background: linear-gradient(180deg, #e6e6e6, #cfcfcf);
  border: 1px solid #7f9db9;
  box-shadow: inset 1px 1px 0 #fff;
  border-radius: 2px;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 22px;
    background: linear-gradient(#fefefe, #d9d9d9);
    border: 1px solid #7f9db9;
    box-shadow: inset -1px 1px #fff0cf, inset 1px 2px #fdd889, inset -2px 2px #fbc761, inset 2px -2px #e5a01a;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 14px;
    height: 22px;
    background: linear-gradient(#fefefe, #d9d9d9);
    border: 1px solid #7f9db9;
    box-shadow: inset -1px 1px #fff0cf, inset 1px 2px #fdd889, inset -2px 2px #fbc761, inset 2px -2px #e5a01a;
    cursor: pointer;
  }
`;

const SettingsActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  box-shadow: none;
  cursor: pointer;

  &:active {
    background: linear-gradient(180deg, #cdcac3, #e3e3db 8%, #e5e5de 94%, #f2f2f1);
  }
`;

export default DisplayProperties;
