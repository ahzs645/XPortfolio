import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
import './display-properties.css';

// Base wallpapers - the custom one will have its name derived from config
const BASE_WALLPAPERS = [
  { id: 'none', name: '(None)', path: null },
  { id: 'ascent', name: 'Ascent', path: '/wallpapers/Ascent.jpg' },
  { id: 'autumn', name: 'Autumn', path: '/wallpapers/Autumn.jpg' },
  { id: 'azul', name: 'Azul', path: '/wallpapers/Azul.jpg' },
  { id: 'bliss', name: 'Bliss', path: '/wallpapers/Bliss.jpg' },
  { id: 'crystal', name: 'Crystal', path: '/wallpapers/Crystal.jpg' },
  { id: 'follow', name: 'Follow', path: '/wallpapers/Follow.jpg' },
  { id: 'friend', name: 'Friend', path: '/wallpapers/Friend.jpg' },
  { id: 'home', name: 'Home', path: '/wallpapers/Home.jpg' },
  { id: 'moonflower', name: 'Moonflower', path: '/wallpapers/Moonflower.jpg' },
  { id: 'peace', name: 'Peace', path: '/wallpapers/Peace.jpg' },
  { id: 'power', name: 'Power', path: '/wallpapers/Power.jpg' },
  { id: 'purpleflower', name: 'Purple Flower', path: '/wallpapers/PurpleFlower.jpg' },
  { id: 'radiance', name: 'Radiance', path: '/wallpapers/Radiance.jpg' },
  { id: 'redmoon', name: 'Red Moon Desert', path: '/wallpapers/Redmoondesert.jpg' },
  { id: 'ripple', name: 'Ripple', path: '/wallpapers/Ripple.jpg' },
  { id: 'stonehenge', name: 'Stonehenge', path: '/wallpapers/Stonehenge.jpg' },
  { id: 'tulips', name: 'Tulips', path: '/wallpapers/Tulips.jpg' },
  { id: 'vortecspace', name: 'Vortec Space', path: '/wallpapers/VortecSpace.jpg' },
  { id: 'wind', name: 'Wind', path: '/wallpapers/Wind.jpg' },
  { id: 'xpprofessional', name: 'Windows XP Professional', path: '/wallpapers/WindowsXPProfessional.jpg' },
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
  const isClassic = windowStyle === 'classic' || colorScheme === 'classic';
  const fontScale = PREVIEW_FONT_SCALES[fontSize] || 1;
  const wallpaperUrl = wallpaperPath ? withBaseUrl(wallpaperPath) : null;

  return (
    <div
      className="display-properties__theme-preview-root"
      style={{
        '--display-preview-scale': fontScale,
        '--display-preview-root-bg': isClassic ? '#808080' : '#585768',
        '--display-preview-desktop-bg': isClassic ? '#3a6ea5' : '#004e98',
      }}
    >
      <div
        className="display-preview__desktop"
        style={{ backgroundImage: wallpaperUrl ? `url(${wallpaperUrl})` : 'none' }}
      >
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
    </div>
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
    <div
      className="display-properties__appearance-preview-root"
      style={{
        '--appearance-preview-scale': fontScale,
        '--appearance-preview-desktop-bg': isClassic ? '#d4d0c8' : '#004e98',
        '--appearance-preview-inactive-opacity': isClassic ? 1 : 0.72,
        '--appearance-preview-surface': palette.surface,
        '--appearance-preview-button-border': isClassic ? '#404040' : palette.buttonBorder,
        '--appearance-preview-button-radius': isClassic ? '0px' : '3px',
        '--appearance-preview-button-bg': isClassic
          ? 'linear-gradient(180deg, #ffffff, #d4d0c8)'
          : `linear-gradient(180deg, ${palette.buttonTop}, ${palette.buttonBottom})`,
      }}
    >
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
    </div>
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
  const { activeThemeId, installedThemes, setActiveTheme } = useTheme();
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
    return BASE_WALLPAPERS.map((wallpaper) => (
      wallpaper.id === 'custom' ? { ...wallpaper, name: osName } : wallpaper
    ));
  }, [getOSName]);
  const resolutionOptions = useMemo(() => getDisplayResolutionLabels(), []);
  const shellStyles = useMemo(() => ({
    '--display-monitor-url': `url(${withBaseUrl('/gui/display/monitor.png')})`,
    '--display-settings-monitor-url': `url(${withBaseUrl('/gui/display/reference/displaysettings.png')})`,
  }), []);
  const [selected, setSelected] = useState(currentDesktop);
  const [activeTab, setActiveTab] = useState('desktop');
  const applyToMobile = true;
  const [showBrowse, setShowBrowse] = useState(false);
  const [customWallpapers, setCustomWallpapers] = useState([]);
  // Map active shell theme back to the theme dropdown value
  const [theme, setTheme] = useState(() => {
    if (activeThemeId === 'luna') return 'xp';
    // Check if the active theme is an installed theme
    const installed = installedThemes.find((installedTheme) => installedTheme.id === activeThemeId);
    if (installed) return installed.id;
    return 'xp';
  });
  const [colorScheme, setColorScheme] = useState('blue');
  const [windowStyle, setWindowStyle] = useState('xp');
  const [fontSize, setFontSize] = useState('normal');
  const [resolutionIndex, setResolutionIndex] = useState(() => getResolutionIndexForZoom(savedDisplayZoom));
  const [colorQuality, setColorQuality] = useState(savedColorDepth);
  const activeScreensaver = SCREENSAVERS.find((item) => item.id === screensaverName);
  const ActiveScreensaverComponent = activeScreensaver?.component;
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

  const handleBrowseSelect = (file) => {
    if (file && file.data) {
      // Add to custom wallpapers list
      const newWallpaper = {
        id: `custom-${Date.now()}`,
        name: file.name,
        path: file.data,
      };
      setCustomWallpapers((previous) => [...previous, newWallpaper]);
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
      <div className="display-properties xp-shell-surface" style={shellStyles}>
        <section className="tabs">
          <menu role="tablist" aria-label="Display Properties">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id ? 'true' : 'false'}
                aria-controls={`tab-${tab.id}`}
                disabled={!tab.enabled}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => tab.enabled && setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </menu>

          <article
            role="tabpanel"
            id="tab-themes"
            hidden={activeTab !== 'themes'}
          >
            <div className="display-properties__panel-content">
              <p className="display-properties__description">
                A theme is a background plus a set of sounds, icons, and other elements to help you personalize your computer with one click.
              </p>

              <div className="display-properties__stack">
                <label className="display-properties__label" htmlFor="display-properties-theme">
                  Theme:
                </label>
                <div className="display-properties__theme-selector-row">
                  <select
                    id="display-properties-theme"
                    className="display-properties__select"
                    value={theme}
                    onChange={(event) => handleThemeChange(event.target.value)}
                  >
                    {THEMES.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                    <option value="more-online" disabled>More themes online...</option>
                    <option value="browse-theme" disabled>Browse...</option>
                  </select>
                  <button type="button" disabled>Save As...</button>
                  <button type="button" disabled>Delete...</button>
                </div>
              </div>

              <div className="display-properties__stack">
                <span className="display-properties__label">Sample:</span>
                <div className="display-properties__theme-preview-frame">
                  <NativePreviewScene
                    windowStyle={THEME_PRESETS[theme]?.windowStyle || 'xp'}
                    colorScheme={THEME_PRESETS[theme]?.colorScheme || 'blue'}
                    fontSize={fontSize}
                    wallpaperPath={selected}
                  />
                </div>
              </div>
            </div>
          </article>

          <article
            role="tabpanel"
            id="tab-desktop"
            hidden={activeTab !== 'desktop'}
          >
            <div className="display-properties__panel-content">
              <div className="display-properties__monitor">
                <div
                  className="display-properties__monitor-screen"
                  style={{
                    backgroundImage: selected ? `url(${withBaseUrl(selected)})` : 'none',
                    backgroundColor: selected ? 'transparent' : '#004e98',
                  }}
                />
              </div>

              <div className="display-properties__stack">
                <label className="display-properties__label" htmlFor="display-properties-wallpaper">
                  Background:
                </label>
                <div className="display-properties__desktop-controls">
                  <div className="display-properties__desktop-list">
                    <select
                      id="display-properties-wallpaper"
                      className="display-properties__wallpaper-select"
                      size={8}
                      value={selected || ''}
                      onChange={(event) => setSelected(event.target.value || null)}
                    >
                      <option value="">🚫 (None)</option>
                      {WALLPAPERS.filter((item) => item.path).map((item) => (
                        <option key={item.id} value={item.path}>🖼️ {item.name}</option>
                      ))}
                      {customWallpapers.map((item) => (
                        <option key={item.id} value={item.path}>🖼️ {item.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="display-properties__stack display-properties__desktop-sidebar">
                    <button type="button" onClick={() => setShowBrowse(true)}>
                      Browse...
                    </button>

                    <label className="display-properties__label" htmlFor="display-properties-position">
                      Position:
                    </label>
                    <select
                      id="display-properties-position"
                      className="display-properties__select"
                      defaultValue="stretch"
                    >
                      <option value="center">Center</option>
                      <option value="tile">Tile</option>
                      <option value="stretch">Stretch</option>
                    </select>

                    <label className="display-properties__label" htmlFor="display-properties-color">
                      Color:
                    </label>
                    <input
                      id="display-properties-color"
                      className="display-properties__color-input"
                      type="color"
                      defaultValue="#004e98"
                    />
                  </div>
                </div>
              </div>

              <section className="field-row display-properties__panel-action">
                <button type="button" disabled>Customize Desktop...</button>
              </section>
            </div>
          </article>

          <article
            role="tabpanel"
            id="tab-screensaver"
            hidden={activeTab !== 'screensaver'}
          >
            <div className="display-properties__panel-content">
              <div className="display-properties__monitor">
                {ActiveScreensaverComponent ? (
                  <div className="display-properties__screensaver-component">
                    <ActiveScreensaverComponent />
                  </div>
                ) : null}

                {activeScreensaver?.embed ? (
                  <iframe
                    className="display-properties__screensaver-frame"
                    src={withBaseUrl(activeScreensaver.embed)}
                    title="Screensaver preview"
                  />
                ) : null}

                {!ActiveScreensaverComponent && !activeScreensaver?.embed ? (
                  <div
                    className="display-properties__screensaver-image"
                    style={{
                      backgroundImage: `url(${withBaseUrl(activeScreensaver?.preview || '/gui/display/sample.png')})`,
                    }}
                  />
                ) : null}
              </div>

              <fieldset>
                <legend>Screen saver</legend>
                <div className="field-row display-properties__screensaver-picker">
                  <select
                    id="display-properties-screensaver"
                    className="display-properties__select"
                    value={screensaverName}
                    onChange={(event) => setScreensaverName(event.target.value)}
                  >
                    <option value="">(None)</option>
                    {SCREENSAVERS.map((item) => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  <button type="button" disabled>Settings</button>
                  <button type="button" onClick={previewScreensaver}>Preview</button>
                </div>

                <div className="field-row">
                  <span>Wait:</span>
                  <input
                    className="display-properties__wait-input"
                    type="number"
                    min="1"
                    max="60"
                    value={waitMinutes}
                    onChange={(event) => setWaitMinutes(Number(event.target.value) || 1)}
                  />
                  <span>minutes</span>
                </div>
              </fieldset>

              <fieldset>
                <legend>Monitor power</legend>
                <div className="display-properties__monitor-power">
                  <img
                    className="display-properties__monitor-power-logo"
                    src={withBaseUrl('/gui/display/energystar.png')}
                    alt="Energy Star"
                  />
                  <div className="display-properties__monitor-power-copy">
                    <p>To adjust monitor power settings and save energy, click Power.</p>
                    <button type="button" disabled>Power...</button>
                  </div>
                </div>
              </fieldset>
            </div>
          </article>

          <article
            role="tabpanel"
            id="tab-appearance"
            hidden={activeTab !== 'appearance'}
          >
            <div className="display-properties__panel-content display-properties__panel-content--appearance">
              <div className="display-properties__appearance-preview-frame">
                <AppearancePreviewScene
                  windowStyle={windowStyle}
                  colorScheme={colorScheme}
                  fontSize={fontSize}
                />
              </div>

              <div className="display-properties__appearance-controls">
                <div className="display-properties__appearance-selects">
                  <div className="display-properties__stack">
                    <label className="display-properties__label" htmlFor="display-properties-window-style">
                      Windows and buttons:
                    </label>
                    <select
                      id="display-properties-window-style"
                      className="display-properties__select"
                      value={windowStyle}
                      onChange={(event) => setWindowStyle(event.target.value)}
                    >
                      {WINDOW_STYLES.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="display-properties__stack">
                    <label className="display-properties__label" htmlFor="display-properties-color-scheme">
                      Color scheme:
                    </label>
                    <select
                      id="display-properties-color-scheme"
                      className="display-properties__select"
                      value={colorScheme}
                      onChange={(event) => setColorScheme(event.target.value)}
                    >
                      {COLOR_SCHEMES.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="display-properties__stack">
                    <label className="display-properties__label" htmlFor="display-properties-font-size">
                      Font size:
                    </label>
                    <select
                      id="display-properties-font-size"
                      className="display-properties__select"
                      value={fontSize}
                      onChange={(event) => setFontSize(event.target.value)}
                    >
                      {FONT_SIZES.map((option) => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="display-properties__appearance-buttons">
                  <button type="button" disabled>Effects...</button>
                  <button type="button" disabled>Advanced</button>
                </div>
              </div>
            </div>
          </article>

          <article
            role="tabpanel"
            id="tab-settings"
            hidden={activeTab !== 'settings'}
          >
            <div className="display-properties__panel-content">
              <div className="display-properties__settings-monitor">
                <img
                  className="display-properties__settings-monitor-image"
                  src={withBaseUrl('/gui/display/reference/resolutionsetting.png')}
                  alt="Resolution"
                />
              </div>

              <div className="display-properties__settings-info">
                Display:
                <br />
                Generic PnP Monitor on NVIDIA GeForce4 Ti 4600
              </div>

              <div className="display-properties__settings-groups">
                <fieldset>
                  <legend>Screen resolution</legend>
                  <div className="display-properties__slider-labels">
                    <span>Less</span>
                    <span>More</span>
                  </div>
                  <input
                    className="display-properties__zoom-slider"
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={resolutionIndex}
                    onChange={(event) => setResolutionIndex(Number(event.target.value))}
                  />
                  <div className="display-properties__zoom-label">
                    {resolutionOptions[resolutionIndex]}
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Color quality</legend>
                  <select
                    id="display-properties-color-quality"
                    className="display-properties__select"
                    value={colorQuality}
                    onChange={(event) => setColorQuality(event.target.value)}
                  >
                    <option value="2col">Monochrome</option>
                    <option value="8col">8 Colors</option>
                    <option value="8+col">8 Colors (Enhanced)</option>
                    <option value="16col">16 Colors</option>
                    <option value="16+col">16 Colors (Enhanced)</option>
                    <option value="256col">256 Colors</option>
                    <option value="256+col">256 Colors (Enhanced)</option>
                    <option value="16bit">Medium (16 bit)</option>
                    <option value="32">Highest (32 bit)</option>
                  </select>
                  <div className="display-properties__color-strip" />
                </fieldset>
              </div>

              <section className="field-row display-properties__settings-button-row">
                <button type="button" disabled>Troubleshoot...</button>
                <button type="button" disabled>Advanced</button>
              </section>
            </div>
          </article>
        </section>

        <section className="field-row display-properties__dialog-actions">
          <button type="button" onClick={() => applySelection()}>OK</button>
          <button type="button" onClick={onClose}>Cancel</button>
          <button
            type="button"
            onClick={() => applySelection({ shouldClose: false })}
            disabled={!hasPendingChanges}
          >
            Apply
          </button>
        </section>
      </div>

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

export default DisplayProperties;
