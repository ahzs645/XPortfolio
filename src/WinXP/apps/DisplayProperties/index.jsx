import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { ProgramLayout, FileChooser } from '../../../components';
import { useUserSettings } from '../../../contexts/UserSettingsContext';
import { useScreensaver } from '../../../contexts/ScreensaverContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { withBaseUrl } from '../../../utils/baseUrl';
import { getXpPortalRoot } from '../../../utils/portalRoot';
import {
  DISPLAY_ZOOM_LEVELS,
  getDisplayResolutionLabels,
  getResolutionIndexForZoom,
} from '../../../utils/displaySettings';
import WindowsScreensaver from '../../../components/Screensavers/WindowsScreensaver';

// Base wallpapers - the custom one will have its name derived from config
const BASE_WALLPAPERS = [
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
  // Custom wallpaper - name will be set dynamically using getOSName()
  { id: 'custom', name: null, path: '/Windowsxp.png' },
];

const TABS = [
  { id: 'themes', label: 'Themes', enabled: true },
  { id: 'desktop', label: 'Desktop', enabled: true },
  { id: 'screensaver', label: 'Screen Saver', enabled: true },
  { id: 'appearance', label: 'Appearance', enabled: true },
  { id: 'settings', label: 'Settings', enabled: true },
];

const BUILTIN_THEMES = [
  { id: 'xp', name: 'Windows XP', themeId: 'luna' },
  { id: 'silver', name: 'Windows XP (Silver)', themeId: 'luna' },
  { id: 'olive', name: 'Windows XP (Olive)', themeId: 'luna' },
  { id: 'classic', name: 'Windows Classic', themeId: 'luna' },
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

const THEME_PRESETS = {
  xp: { windowStyle: 'xp', colorScheme: 'blue' },
  silver: { windowStyle: 'xp', colorScheme: 'silver' },
  olive: { windowStyle: 'xp', colorScheme: 'olive' },
  classic: { windowStyle: 'classic', colorScheme: 'classic' },
};

const PREVIEW_THEMES = {
  blue: {
    titleStart: '#0a246a',
    titleEnd: '#4d8ae8',
    titleText: '#ffffff',
    frame: '#245edb',
    frameInner: '#9dbdff',
    surface: '#ece9d8',
    panel: '#f6f4ea',
    buttonTop: '#ffffff',
    buttonBottom: '#d9d1c5',
    buttonBorder: '#003c74',
    accent: '#2b7cff',
    taskbarStart: '#235edc',
    taskbarEnd: '#3a89ff',
    startStart: '#44b348',
    startEnd: '#2d7d2f',
    desktopTint: 'rgba(12, 57, 133, 0.15)',
  },
  silver: {
    titleStart: '#7b859d',
    titleEnd: '#bec6d8',
    titleText: '#ffffff',
    frame: '#7f8ea8',
    frameInner: '#d9deea',
    surface: '#ebe9f4',
    panel: '#f7f7fb',
    buttonTop: '#ffffff',
    buttonBottom: '#dcd9e8',
    buttonBorder: '#5a6477',
    accent: '#6e7d95',
    taskbarStart: '#6e788d',
    taskbarEnd: '#9ca6bc',
    startStart: '#5b8757',
    startEnd: '#416a3f',
    desktopTint: 'rgba(70, 77, 93, 0.18)',
  },
  olive: {
    titleStart: '#7b7f36',
    titleEnd: '#c8c97d',
    titleText: '#ffffff',
    frame: '#8a8e47',
    frameInner: '#d8db9d',
    surface: '#efeed7',
    panel: '#f8f7e9',
    buttonTop: '#ffffff',
    buttonBottom: '#dbd7b8',
    buttonBorder: '#5c6521',
    accent: '#7b8f24',
    taskbarStart: '#6c7a1a',
    taskbarEnd: '#94a63b',
    startStart: '#5ba445',
    startEnd: '#397029',
    desktopTint: 'rgba(94, 104, 26, 0.18)',
  },
  classic: {
    titleStart: '#0a246a',
    titleEnd: '#0a246a',
    titleText: '#ffffff',
    frame: '#808080',
    frameInner: '#dfdfdf',
    surface: '#c0c0c0',
    panel: '#d4d0c8',
    buttonTop: '#ffffff',
    buttonBottom: '#d4d0c8',
    buttonBorder: '#404040',
    accent: '#0a246a',
    taskbarStart: '#c0c0c0',
    taskbarEnd: '#c0c0c0',
    startStart: '#d4d0c8',
    startEnd: '#b6b2aa',
    desktopTint: 'rgba(0, 0, 0, 0.08)',
  },
};

const PREVIEW_FONT_SCALES = {
  normal: 1,
  large: 1.08,
  extra: 1.16,
};

function getPreviewPalette(windowStyle, colorScheme) {
  return PREVIEW_THEMES[
    windowStyle === 'classic' || colorScheme === 'classic' ? 'classic' : colorScheme
  ] || PREVIEW_THEMES.blue;
}

function NativePreviewScene({
  windowStyle,
  colorScheme,
  fontSize,
  wallpaperPath,
}) {
  const palette = getPreviewPalette(windowStyle, colorScheme);
  const isClassic = windowStyle === 'classic' || colorScheme === 'classic';
  const fontScale = PREVIEW_FONT_SCALES[fontSize] || 1;
  const wallpaperUrl = wallpaperPath ? withBaseUrl(wallpaperPath) : null;

  return (
    <NativePreviewRoot
      $scale={fontScale}
      $classic={isClassic}
      $palette={palette}
      $wallpaper={wallpaperUrl}
    >
      <div className="display-preview__desktop">
        <div className={`display-preview__window ${isClassic ? 'window preview-classic-window' : 'window dialogbox'}`}>
          <div className="title-bar">
            <div className="window-inactive-mask" />
            <div className="title-bar-text">Active Window</div>
            <div className="title-bar-controls">
              <button aria-label="Minimize" type="button" />
              <button aria-label="Maximize" type="button" />
              <button aria-label="Close" type="button" />
            </div>
          </div>

          <div className="window-body">
            <div className="display-preview__scroll-body">
              <div className="display-preview__text">Window Text</div>
              <div className="display-preview__scroll-spacer" />
            </div>
          </div>
        </div>

        <img
          alt=""
          className="display-preview__recycler"
          src={withBaseUrl('/icons/xp/RecycleBinfull.png')}
        />
      </div>
    </NativePreviewRoot>
  );
}

function AppearancePreviewScene({
  windowStyle,
  colorScheme,
  fontSize,
}) {
  const palette = getPreviewPalette(windowStyle, colorScheme);
  const isClassic = windowStyle === 'classic' || colorScheme === 'classic';
  const fontScale = PREVIEW_FONT_SCALES[fontSize] || 1;

  return (
    <AppearancePreviewRoot $classic={isClassic} $palette={palette} $scale={fontScale}>
      <div className="appearance-preview__desktop">
        <div className="appearance-preview__window appearance-preview__window--inactive window inactive">
          <div className="title-bar">
            <div className="window-inactive-mask" />
            <div className="title-bar-text">Inactive Window</div>
            <div className="title-bar-controls">
              <button type="button" aria-label="Minimize" />
              <button type="button" aria-label="Maximize" />
              <button type="button" aria-label="Close" />
            </div>
          </div>
          <div className="window-body appearance-preview__body appearance-preview__body--inactive" />
        </div>

        <div className="appearance-preview__window appearance-preview__window--active window">
          <div className="title-bar">
            <div className="window-inactive-mask" />
            <div className="title-bar-text">Active Window</div>
            <div className="title-bar-controls">
              <button type="button" aria-label="Minimize" />
              <button type="button" aria-label="Maximize" />
              <button type="button" aria-label="Close" />
            </div>
          </div>
          <div className="window-body appearance-preview__body appearance-preview__body--active">
            <div className="appearance-preview__scroll-body">
              <div className="appearance-preview__text">Window Text</div>
              <div className="appearance-preview__scroll-spacer" />
            </div>
          </div>
        </div>

        <div className="appearance-preview__dialog window">
          <div className="title-bar">
            <div className="window-inactive-mask" />
            <div className="title-bar-text">Message Box</div>
            <div className="title-bar-controls">
              <button type="button" aria-label="Close" />
            </div>
          </div>
          <div className="window-body appearance-preview__body appearance-preview__body--dialog">
            <div className="appearance-preview__dialog-button">OK</div>
          </div>
        </div>
      </div>
    </AppearancePreviewRoot>
  );
}

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
  {
    id: 'windows',
    name: 'Windows Logo',
    component: WindowsScreensaver,
  },
  {
    id: 'starfield',
    name: 'Starfield',
    embed: '/screensavers/canvas/starfield.html',
  },
  {
    id: 'mystify',
    name: 'Mystify',
    embed: '/screensavers/canvas/mystify.html',
  },
  {
    id: 'ribbons',
    name: 'Ribbons',
    embed: '/screensavers/canvas/ribbons.html',
  },
  {
    id: 'balls',
    name: 'Bouncing Balls',
    embed: '/screensavers/canvas/balls.html',
  },
  {
    id: 'matrix',
    name: 'Matrix',
    embed: '/screensavers/canvas/matrix.html',
  },
  {
    id: 'rain',
    name: 'Digital Rain',
    embed: '/screensavers/canvas/rain.html',
  },
  {
    id: 'blank',
    name: 'Blank',
    embed: '/screensavers/canvas/blank.html',
  },
];

function DisplayProperties({ onClose, onMinimize }) {
  // Use per-user settings for wallpaper
  const {
    getWallpaperPath,
    setWallpaperPath,
    colorDepth: savedColorDepth,
    setColorDepth,
    displayZoom: savedDisplayZoom,
    setDisplayZoom,
  } = useUserSettings();
  const {
    screensaverName,
    setScreensaverName,
    waitMinutes,
    setWaitMinutes,
    previewScreensaver,
  } = useScreensaver();
  const { getOSName } = useConfig();
  const { activeThemeId, installedThemes, setActiveTheme, allThemes } = useTheme();
  const currentDesktop = getWallpaperPath(false);

  // Build combined theme list: builtins + installed WindowBlinds themes
  const THEMES = useMemo(() => {
    const themes = [...BUILTIN_THEMES];
    for (const installed of installedThemes) {
      themes.push({
        id: installed.id,
        name: installed.name,
        themeId: installed.id,
      });
    }
    return themes;
  }, [installedThemes]);

  // Build wallpapers list with dynamic OS name for custom wallpaper
  const WALLPAPERS = useMemo(() => {
    const osName = getOSName();
    return BASE_WALLPAPERS.map(w =>
      w.id === 'custom' ? { ...w, name: osName } : w
    );
  }, [getOSName]);
  const resolutionOptions = useMemo(() => getDisplayResolutionLabels(), []);
  const [selected, setSelected] = useState(currentDesktop);
  const [activeTab, setActiveTab] = useState('desktop');
  const applyToMobile = true;
  const [showBrowse, setShowBrowse] = useState(false);
  const [customWallpapers, setCustomWallpapers] = useState([]);
  // Map active shell theme back to the theme dropdown value
  const [theme, setTheme] = useState(() => {
    if (activeThemeId === 'luna') return 'xp';
    // Check if the active theme is an installed theme
    const installed = installedThemes.find(t => t.id === activeThemeId);
    if (installed) return installed.id;
    return 'xp';
  });
  const [colorScheme, setColorScheme] = useState('blue');
  const [windowStyle, setWindowStyle] = useState('xp');
  const [fontSize, setFontSize] = useState('normal');
  const [resolutionIndex, setResolutionIndex] = useState(() => getResolutionIndexForZoom(savedDisplayZoom));
  const [colorQuality, setColorQuality] = useState(savedColorDepth);
  const hasPendingChanges = selected !== currentDesktop
    || DISPLAY_ZOOM_LEVELS[resolutionIndex] !== savedDisplayZoom
    || colorQuality !== savedColorDepth;

  const applySelection = ({ shouldClose = true } = {}) => {
    const wallpaperPath = selected || '';
    setWallpaperPath(wallpaperPath, { isMobile: false });
    if (applyToMobile) {
      setWallpaperPath(wallpaperPath, { isMobile: true });
    }
    setDisplayZoom(DISPLAY_ZOOM_LEVELS[resolutionIndex]);
    setColorDepth(colorQuality);
    if (shouldClose) {
      onClose?.();
    }
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

  const handleThemeChange = (value) => {
    const preset = THEME_PRESETS[value];
    setTheme(value);
    if (preset) {
      // Built-in XP theme variant
      setWindowStyle(preset.windowStyle);
      setColorScheme(preset.colorScheme);
      setActiveTheme('luna');
    } else {
      // Installed WindowBlinds theme
      setActiveTheme(value);
    }
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
              <DesktopMonitor>
                <DesktopWallpaperPreview
                  style={{
                    backgroundImage: selected ? `url(${withBaseUrl(selected)})` : 'none',
                    backgroundColor: selected ? 'transparent' : '#004e98'
                  }}
                />
              </DesktopMonitor>

              <ControlLabel style={{ marginTop: 0 }}>Background:</ControlLabel>
              <DesktopOptionsRow>
                <DesktopListArea>
                  <WallpaperSelect
                    size={8}
                    value={selected || ''}
                    onChange={(e) => setSelected(e.target.value || null)}
                  >
                    <option value="">🚫 (None)</option>
                    {WALLPAPERS.filter(w => w.path).map((item) => (
                      <option key={item.id} value={item.path}>🖼️ {item.name}</option>
                    ))}
                    {customWallpapers.map((item) => (
                      <option key={item.id} value={item.path}>🖼️ {item.name}</option>
                    ))}
                  </WallpaperSelect>
                </DesktopListArea>

                <DesktopSideControls>
                  <SideButton type="button" onClick={() => setShowBrowse(true)}>
                    Browse...
                  </SideButton>
                  <ControlLabel>Position:</ControlLabel>
                  <SideSelect defaultValue="stretch" style={{ width: '100%' }}>
                    <option value="center">Center</option>
                    <option value="tile">Tile</option>
                    <option value="stretch">Stretch</option>
                  </SideSelect>
                  <ControlLabel>Color:</ControlLabel>
                  <ColorInput type="color" defaultValue="#004e98" />
                </DesktopSideControls>
              </DesktopOptionsRow>
              <CustomizeButton type="button">Customize Desktop...</CustomizeButton>
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
                  <ThemeDescription>
                    A theme is a background plus a set of sounds, icons, and other elements to help you personalize your computer with one click.
                  </ThemeDescription>
                  <ThemeFieldLabel>Theme:</ThemeFieldLabel>
                  <ThemeSelectorRow>
                    <SideSelect
                      value={theme}
                      onChange={(e) => handleThemeChange(e.target.value)}
                      style={{ flex: 1 }}
                    >
                      {THEMES.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                      <option value="more-online" disabled>More themes online...</option>
                      <option value="browse-theme" disabled>Browse...</option>
                    </SideSelect>
                    <SideButton type="button" disabled $disabled>Save As...</SideButton>
                    <SideButton type="button" disabled $disabled>Delete...</SideButton>
                  </ThemeSelectorRow>
                  <ThemeFieldLabel>Sample:</ThemeFieldLabel>
                  <ThemePreview>
                    <NativePreviewScene
                      windowStyle={THEME_PRESETS[theme]?.windowStyle || 'xp'}
                      colorScheme={THEME_PRESETS[theme]?.colorScheme || 'blue'}
                      fontSize={fontSize}
                      wallpaperPath={selected}
                    />
                  </ThemePreview>
                </ThemesPane>
              )}

              {tab.id === 'screensaver' && (
                <ScreensaverPane>
                  <ScreensaverMonitor>
                    <ScreensaverMonitorFrame />
                    {(() => {
                      const screensaver = SCREENSAVERS.find(s => s.id === screensaverName);
                      if (screensaver?.component) {
                        const Component = screensaver.component;
                        return (
                          <ScreensaverComponentPreview>
                            <Component />
                          </ScreensaverComponentPreview>
                        );
                      }
                      if (screensaver?.embed) {
                        return (
                          <ScreensaverIframe
                            src={withBaseUrl(screensaver.embed)}
                            title="Screensaver preview"
                          />
                        );
                      }
                      return (
                        <ScreensaverPreviewImg
                          style={{
                            backgroundImage: `url(${withBaseUrl(screensaver?.preview || '/gui/display/sample.png')})`,
                          }}
                        />
                      );
                    })()}
                  </ScreensaverMonitor>

                  <Fieldset>
                    <Legend>Screen saver</Legend>
                    <ScreensaverRow>
                      <SideSelect
                        value={screensaverName}
                        onChange={(e) => setScreensaverName(e.target.value)}
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <option value="">(None)</option>
                        {SCREENSAVERS.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </SideSelect>
                      <SideButton type="button" disabled $disabled style={{ flexShrink: 0 }}>Settings</SideButton>
                      <SideButton type="button" onClick={previewScreensaver} style={{ flexShrink: 0 }}>
                        Preview
                      </SideButton>
                    </ScreensaverRow>
                    <FieldRow>
                      <span>Wait:</span>
                      <WaitInput
                        type="number"
                        min="1"
                        max="60"
                        value={waitMinutes}
                        onChange={(e) => setWaitMinutes(Number(e.target.value) || 1)}
                      />
                      <span>minutes</span>
                    </FieldRow>
                  </Fieldset>

                  <Fieldset>
                    <Legend>Monitor power</Legend>
                    <MonitorPowerContent>
                      <EnergyStarLogo src={withBaseUrl('/gui/display/energystar.png')} alt="Energy Star" />
                      <MonitorPowerText>
                        <p>To adjust monitor power settings and save energy, click Power.</p>
                        <MonitorPowerButton>
                          <SideButton type="button" disabled $disabled>Power...</SideButton>
                        </MonitorPowerButton>
                      </MonitorPowerText>
                    </MonitorPowerContent>
                  </Fieldset>
                </ScreensaverPane>
              )}

              {tab.id === 'appearance' && (
                <AppearancePane>
                  <AppearancePreview>
                    <AppearancePreviewScene
                      windowStyle={windowStyle}
                      colorScheme={colorScheme}
                      fontSize={fontSize}
                    />
                  </AppearancePreview>
                  <AppearanceControlsRow>
                    <AppearanceSelects>
                      <div>
                        <ControlLabel>Windows and buttons:</ControlLabel>
                        <SideSelect value={windowStyle} onChange={(e) => setWindowStyle(e.target.value)} style={{ width: '200px' }}>
                          {WINDOW_STYLES.map(option => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                        </SideSelect>
                      </div>
                      <div>
                        <ControlLabel>Color scheme:</ControlLabel>
                        <SideSelect value={colorScheme} onChange={(e) => setColorScheme(e.target.value)} style={{ width: '200px' }}>
                          {COLOR_SCHEMES.map(option => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                        </SideSelect>
                      </div>
                      <div>
                        <ControlLabel>Font size:</ControlLabel>
                        <SideSelect value={fontSize} onChange={(e) => setFontSize(e.target.value)} style={{ width: '200px' }}>
                          {FONT_SIZES.map(option => (
                            <option key={option.id} value={option.id}>{option.label}</option>
                          ))}
                        </SideSelect>
                      </div>
                    </AppearanceSelects>
                    <AppearanceButtons>
                      <SideButton type="button" disabled $disabled>Effects...</SideButton>
                      <SideButton type="button" disabled $disabled>Advanced</SideButton>
                    </AppearanceButtons>
                  </AppearanceControlsRow>
                </AppearancePane>
              )}

              {tab.id === 'settings' && (
                <SettingsPane>
                  <SettingsMonitor>
                    <SettingsMonitorImg src={withBaseUrl('/gui/display/reference/resolutionsetting.png')} alt="Resolution" />
                  </SettingsMonitor>
                  <SettingsDisplayInfo>Display:<br />Generic PnP Monitor on NVIDIA GeForce4 Ti 4600</SettingsDisplayInfo>
                  <SettingsGroup>
                    <Fieldset>
                      <Legend>Screen resolution</Legend>
                      <SliderLabels>
                        <span>Less</span>
                        <span>More</span>
                      </SliderLabels>
                      <ZoomSlider
                        type="range"
                        min="0"
                        max="5"
                        step="1"
                        value={resolutionIndex}
                        onChange={(e) => setResolutionIndex(Number(e.target.value))}
                      />
                      <ZoomLabel>{resolutionOptions[resolutionIndex]}</ZoomLabel>
                    </Fieldset>
                    <Fieldset>
                      <Legend>Color quality</Legend>
                      <SideSelect value={colorQuality} onChange={(e) => setColorQuality(e.target.value)} style={{ width: '100%' }}>
                        <option value="2col">Monochrome</option>
                        <option value="8col">8 Colors</option>
                        <option value="8+col">8 Colors (Enhanced)</option>
                        <option value="16col">16 Colors</option>
                        <option value="16+col">16 Colors (Enhanced)</option>
                        <option value="256col">256 Colors</option>
                        <option value="256+col">256 Colors (Enhanced)</option>
                        <option value="16bit">Medium (16 bit)</option>
                        <option value="32">Highest (32 bit)</option>
                      </SideSelect>
                      <ColorStrip />
                    </Fieldset>
                  </SettingsGroup>
                  <SettingsButtonRow>
                    <SideButton type="button" disabled $disabled>Troubleshoot...</SideButton>
                    <SideButton type="button" disabled $disabled>Advanced</SideButton>
                  </SettingsButtonRow>
                </SettingsPane>
              )}
            </TabPanel>
          ))}
        </section>

        <Actions>
          <ActionButton onClick={() => applySelection()}>OK</ActionButton>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton
            onClick={() => applySelection({ shouldClose: false })}
            disabled={!hasPendingChanges}
          >
            Apply
          </ActionButton>
        </Actions>

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
        getXpPortalRoot()
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
  overflow-y: auto;
`;

const DesktopMonitor = styled.div`
  position: relative;
  text-align: center;
  width: 177px;
  height: 159px;
  margin: 0 auto;
  background: url(${withBaseUrl('/gui/display/monitor.png')}) no-repeat center center;
  background-size: contain;
  flex-shrink: 0;
`;

const DesktopWallpaperPreview = styled.div`
  position: absolute;
  top: 15px;
  left: 12px;
  width: 152px;
  height: 112px;
  background-size: cover;
  background-position: center;
`;

const DesktopOptionsRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const DesktopListArea = styled.div`
  flex: 1;
  min-width: 0;
`;

const WallpaperSelect = styled.select`
  width: 100%;
  margin: 0;
  padding: 0;
  font-size: 12px;
  height: 100px;
`;

const DesktopSideControls = styled.div``;

const ColorInput = styled.input`
  width: 100%;
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
  background: url(${withBaseUrl('/gui/display/monitor.png')}) no-repeat center center;
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
  padding: 4px 10px;
  font-size: 11px;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
  background: linear-gradient(180deg, #fff, #ecebe5 86%, #d8d0c4);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: not-allowed;
  color: #666;
  opacity: 0.6;
  flex-shrink: 0;
  align-self: flex-start;
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
  overflow-y: auto;
`;

const ScreensaverMonitor = styled.div`
  position: relative;
  text-align: center;
  width: 177px;
  height: 159px;
  margin: 0 auto 10px auto;
  background: url(${withBaseUrl('/gui/display/monitor.png')}) no-repeat center center;
  background-size: contain;
`;

const ScreensaverMonitorFrame = styled.div`
  position: absolute;
  inset: 0;
`;

const ScreensaverIframe = styled.iframe`
  position: absolute;
  top: 15px;
  left: 12px;
  width: 152px;
  height: 112px;
  border: none;
  background: #000;
`;

const ScreensaverPreviewImg = styled.div`
  position: absolute;
  top: 15px;
  left: 12px;
  width: 152px;
  height: 112px;
  background-size: cover;
  background-position: center;
  background-color: #000;
`;

const ScreensaverComponentPreview = styled.div`
  position: absolute;
  top: 15px;
  left: 12px;
  width: 152px;
  height: 112px;
  overflow: hidden;
  background: #000;
`;

const ScreensaverRow = styled.div`
  display: flex;
  gap: 8px;
`;

const Fieldset = styled.fieldset`
  margin: 0;
  padding: 8px 10px 10px 10px;
  border: 1px solid #919b9c;
`;

const Legend = styled.legend`
  background: #fbfbfc;
  padding: 0 4px;
  font-size: 12px;
  color: #003399;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
`;

const WaitRow = styled.div`
  margin-top: 10px;
  font-size: 12px;
`;

const GroupPane = styled.div`
  padding: 8px;
`;

const MonitorPowerContent = styled.div`
  display: flex;
  align-items: flex-start;
`;

const EnergyStarLogo = styled.img`
  width: auto;
  height: auto;
  max-width: 80px;
  margin-right: 10px;
  flex-shrink: 0;
`;

const MonitorPowerText = styled.div`
  flex: 1;
  text-align: left;
  font-size: 12px;

  p {
    margin: 0 0 8px 0;
  }
`;

const MonitorPowerButton = styled.div`
  text-align: right;
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
  gap: 8px;
  height: 100%;
  align-items: stretch;
`;

const ThemeDescription = styled.p`
  margin: 0 0 2px 0;
  font-size: 12px;
  color: #333;
  line-height: 1.25;
`;

const ThemeFieldLabel = styled.span`
  font-size: 12px;
  color: #000;
`;

const ThemeSelectorRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 6px;
  align-items: center;
`;

const ThemePreview = styled.div`
  border: 1px solid #7f9db9;
  background: #d4d0c8;
  box-shadow: inset 1px 1px 0 #ffffff;
  min-height: 254px;
  display: flex;
  align-items: stretch;
  justify-content: center;
  max-width: 100%;
  width: 100%;
  align-self: center;
  font-family: "MS Sans Serif", "Tahoma", sans-serif;
`;

const NativePreviewRoot = styled.div`
  flex: 1;
  width: 100%;
  min-height: 232px;
  position: relative;
  overflow: hidden;
  border: 1px solid #7f7f7f;
  box-shadow: inset 1px 1px 0 rgba(255,255,255,0.8), inset -1px -1px 0 rgba(0,0,0,0.25);
  background: ${({ $classic }) => ($classic ? '#808080' : '#585768')};
  font-size: ${({ $scale }) => `${11 * $scale}px`};

  .display-preview__desktop {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 232px;
    background-color: ${({ $classic }) => ($classic ? '#3a6ea5' : '#004e98')};
    background-image: ${({ $wallpaper }) => ($wallpaper ? `url(${$wallpaper})` : 'none')};
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  .display-preview__window {
    position: absolute;
    top: 32px;
    left: 30px;
    width: 220px;
    filter: drop-shadow(2px 3px 8px rgba(0, 0, 0, 0.2));
  }

  .display-preview__window.window {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .display-preview__window.preview-classic-window {
    border-radius: 0;
  }

  .display-preview__window .title-bar {
    height: 28px;
    min-height: 28px;
    padding: 0 3px;
  }

  .display-preview__window .title-bar-controls button {
    min-width: 21px;
    width: 21px;
    padding: 0;
    flex-shrink: 0;
  }

  .display-preview__window .window-body {
    height: 96px;
    margin: 0 3px 3px;
    padding: 0;
    background: #ffffff;
    overflow: hidden;
  }

  .display-preview__scroll-body {
    height: 100%;
    padding: 4px 6px;
    overflow-y: scroll;
    scrollbar-gutter: stable;
    background: #ffffff;
    color: #000;
    line-height: 1.2;
  }

  .display-preview__text {
    margin-bottom: 0;
  }

  .display-preview__scroll-spacer {
    height: 200px;
  }

  .display-preview__recycler {
    position: absolute;
    right: 20px;
    bottom: 8px;
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
`;

const AppearancePane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
`;

const AppearancePreview = styled.div`
  border: 2px solid;
  border-color: #716f64 #f1efe2 #f1efe2 #716f64;
  background: #d4d0c8;
  box-sizing: border-box;
  overflow: hidden;
  min-height: 254px;
  display: flex;
`;

const AppearancePreviewRoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  width: 100%;
  min-height: 250px;
  background: #ece9d8;
  border: 1px solid #7f9db9;
  box-shadow: inset 1px 1px 0 #ffffff;
  font-size: ${({ $scale }) => `${11 * $scale}px`};

  .appearance-preview__desktop {
    position: relative;
    width: 411px;
    height: 219px;
    max-width: 100%;
    overflow: hidden;
    background: ${({ $classic }) => ($classic ? '#d4d0c8' : '#004e98')};
    border: 1px solid #aca899;
    flex-shrink: 0;
  }

  .appearance-preview__window,
  .appearance-preview__dialog {
    position: absolute;
    filter: drop-shadow(2px 3px 6px rgba(0, 0, 0, 0.18));
  }

  .appearance-preview__window.window,
  .appearance-preview__dialog.window {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .appearance-preview__window--inactive {
    top: 10px;
    left: 10px;
    width: 371px;
    height: 175px;
    z-index: 1;
  }

  .appearance-preview__window--active {
    top: 33px;
    left: 14px;
    width: 389px;
    height: 157px;
    z-index: 2;
  }

  .appearance-preview__dialog {
    top: 133px;
    left: 22px;
    width: 239px;
    height: 80px;
    z-index: 3;
  }

  .appearance-preview__window .title-bar,
  .appearance-preview__dialog .title-bar {
    height: 28px;
    min-height: 28px;
    padding: 0 3px;
    border-radius: 0;
  }

  .appearance-preview__window.inactive .title-bar {
    opacity: ${({ $classic }) => ($classic ? 1 : 0.72)};
  }

  .appearance-preview__window .title-bar-controls button,
  .appearance-preview__dialog .title-bar-controls button {
    min-width: 21px;
    width: 21px;
    padding: 0;
    flex-shrink: 0;
  }

  .appearance-preview__body {
    background: ${({ $palette }) => $palette.surface};
  }

  .appearance-preview__body--inactive {
    flex: 1;
    margin: 0 3px 3px;
  }

  .appearance-preview__body--active {
    flex: 1;
    padding: 0;
    overflow: hidden;
    margin: 0 3px 3px;
    background: #ffffff;
  }

  .appearance-preview__body--dialog {
    flex: 1;
    padding: 12px;
    margin: 0 3px 3px;
  }

  .appearance-preview__text {
    color: #000;
    margin-bottom: 6px;
  }

  .appearance-preview__scroll-body {
    height: 100%;
    padding: 4px 6px;
    overflow-y: scroll;
    scrollbar-gutter: stable;
    background: #ffffff;
    color: #000;
    line-height: 1.2;
  }

  .appearance-preview__scroll-spacer {
    height: 200px;
  }

  .appearance-preview__dialog-button {
    width: 76px;
    height: 26px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #111;
    border: 1px solid ${({ $classic, $palette }) => ($classic ? '#404040' : $palette.buttonBorder)};
    border-radius: ${({ $classic }) => ($classic ? '0' : '3px')};
    background: ${({ $classic, $palette }) => (
      $classic
        ? 'linear-gradient(180deg, #ffffff, #d4d0c8)'
        : `linear-gradient(180deg, ${$palette.buttonTop}, ${$palette.buttonBottom})`
    )};
    box-shadow: inset 1px 1px 0 rgba(255,255,255,0.7);
  }
`;

const AppearanceControlsRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 16px;
`;

const AppearanceSelects = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const AppearanceButtons = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
`;

const ControlLabel = styled.div`
  margin-top: 10px;
  margin-bottom: 4px;
  font-size: 12px;

  &:first-child {
    margin-top: 0;
  }
`;

const SettingsPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  overflow-y: auto;
`;

const SettingsMonitor = styled.div`
  position: relative;
  text-align: center;
  width: 177px;
  height: 159px;
  margin: 0 auto 10px auto;
  background: url(${withBaseUrl('/gui/display/reference/displaysettings.png')}) no-repeat center center;
  background-size: contain;
`;

const SettingsMonitorImg = styled.img`
  position: absolute;
  top: 15px;
  left: 11px;
  width: 152px;
  height: 112px;
`;

const SettingsDisplayInfo = styled.div`
  margin-bottom: 10px;
  font-size: 12px;
`;

const SettingsGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;

  ${Fieldset} {
    flex: 1;
  }
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  padding: 0 2px;
`;

const ZoomSlider = styled.input`
  width: 100%;
  padding: 4px 0;
  margin: 0;
`;

const ZoomLabel = styled.div`
  text-align: center;
  font-size: 12px;
`;

const ColorStrip = styled.div`
  height: 13px;
  margin-top: 5px;
  background: repeating-linear-gradient(
    90deg,
    #ff00bf 0px 1px, #ff0080 1px 3px, red 3px 5px, #ff6c00 5px 7px,
    #ffac00 7px 10px, #ffd200 10px 12px, #ff0 12px 14px, #d9ff00 14px 16px,
    #80ff00 16px 18px, #00ff00 18px 20px, #00ff80 20px 22px, #00ffd9 22px 24px,
    #00ffff 24px 26px, #00d9ff 26px 28px, #0080ff 28px 30px, #0000ff 30px 32px,
    #8000ff 32px 34px, #bf00ff 34px 36px, #ff00ff 36px 38px, #ff00bf 38px 51px
  );
  border: 1px solid;
  border-color: #808080 #fff #fff #808080;
`;

const SettingsButtonRow = styled.div`
  text-align: right;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
