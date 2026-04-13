import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import Balloon from '../../components/Balloon';
import FooterMenu from './FooterMenu';
import QuickLaunch from './QuickLaunch';
import { ContextMenu } from '../components/ContextMenu';
import { isMobileDevice } from '../../utils/deviceDetection';
import { withBaseUrl } from '../../utils/baseUrl';
import useSystemSounds from '../../hooks/useSystemSounds';
import { useShellSettings } from '../../contexts/ShellSettingsContext';
import { useUserSettings } from '../../contexts/UserSettingsContext';
import { getColorDepthFilter } from '../../utils/colorDepthEffects';
import { getDisplayViewport, toDisplayLayerRect } from '../../utils/displayCoordinates';
import { getXpPortalRoot } from '../../utils/portalRoot';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Process a CSS background value that may contain url() paths needing base URL prefix.
 * Leaves gradients and other CSS values unchanged.
 */
function resolveThemeBg(value) {
  if (!value) return value;
  // If it contains a url() with a relative path, prefix it
  return value.replace(/url\(([^)]+)\)/g, (match, path) => {
    const trimmed = path.replace(/['"]/g, '');
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return `url(${withBaseUrl(trimmed)})`;
    }
    return match;
  });
}

const MAX_VISIBLE_TASKBAR_WINDOWS = 2;

const getTime = () => {
  const date = new Date();
  let hour = date.getHours();
  let hourPostFix = 'AM';
  let min = date.getMinutes();
  if (hour >= 12) {
    hour -= 12;
    hourPostFix = 'PM';
  }
  if (hour === 0) {
    hour = 12;
  }
  if (min < 10) {
    min = '0' + min;
  }
  return `${hour}:${min} ${hourPostFix}`;
};

function Footer({
  onMouseDownApp,
  apps,
  focusedAppId,
  onMouseDown,
  onClickMenuItem,
  onLaunchInstalledApp,
  onMinimizeAll,
  crtEnabled,
  onToggleCRT,
  playBalloonSound,
  clippyHiddenOnMobile,
  isMobile,
  onShowClippy,
}) {
  const { playStart } = useSystemSounds();
  const { windowSoundsEnabled, colorDepth } = useUserSettings();
  const { taskbar, audio, setTaskbarSettings, setAudioSettings } = useShellSettings();
  const { activeTheme, setActiveTheme } = useTheme();
  const [time, setTime] = useState(getTime);
  const [menuOn, setMenuOn] = useState(false);
  const [showWelcomeBalloon, setShowWelcomeBalloon] = useState(false);
  const [themeBalloon, setThemeBalloon] = useState(null); // { themeId, themeName }
  const [welcomeAnchor, setWelcomeAnchor] = useState(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [updateTooltip, setUpdateTooltip] = useState('Updates available');
  const [startContextMenu, setStartContextMenu] = useState(null);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [showWindowOverflow, setShowWindowOverflow] = useState(false);
  const [windowOverflowPosition, setWindowOverflowPosition] = useState(null);
  const [trayExpanded, setTrayExpanded] = useState(false);
  const menuRef = useRef(null);
  const startButtonRef = useRef(null);
  const welcomeIconRef = useRef(null);
  const updateIconRef = useRef(null);
  const balloonTimeoutRef = useRef(null);
  const volumeIconRef = useRef(null);
  const volumePopupRef = useRef(null);
  const windowOverflowRef = useRef(null);
  const windowOverflowButtonRef = useRef(null);

  const taskbarApps = useMemo(
    () => apps.filter((app) => !app.header.noFooterWindow),
    [apps]
  );
  const visibleTaskbarApps = taskbarApps.slice(0, MAX_VISIBLE_TASKBAR_WINDOWS);
  const overflowTaskbarApps = taskbarApps.slice(MAX_VISIBLE_TASKBAR_WINDOWS);
  const hasWindowOverflow = overflowTaskbarApps.length > 0;
  const hasFocusedOverflowWindow = overflowTaskbarApps.some((app) => app.id === focusedAppId);
  const isWindowOverflowOpen = showWindowOverflow && hasWindowOverflow;

  const handleVolumeClick = useCallback(() => {
    setShowVolumePopup(prev => !prev);
  }, []);

  const handleVolumeDoubleClick = useCallback(() => {
    setShowVolumePopup(false);
    onClickMenuItem('Volume Control');
  }, [onClickMenuItem]);

  const updateWindowOverflowPosition = useCallback(() => {
    const button = windowOverflowButtonRef.current;
    if (!button) {
      setWindowOverflowPosition(null);
      return;
    }

    const rect = toDisplayLayerRect(button.getBoundingClientRect());
    const viewport = getDisplayViewport();
    setWindowOverflowPosition({
      left: rect.right,
      bottom: viewport.height - rect.top + 2,
    });
  }, []);

  const handleWindowOverflowToggle = useCallback((e) => {
    e.stopPropagation();
    setShowWindowOverflow((prev) => {
      if (!prev) {
        updateWindowOverflowPosition();
      }
      return !prev;
    });
  }, [updateWindowOverflowPosition]);

  const handleVolumeChange = useCallback((e) => {
    setAudioSettings({ volume: parseInt(e.target.value, 10) });
  }, [setAudioSettings]);

  const handleTrayToggle = useCallback(() => {
    setTrayExpanded((prev) => {
      const next = !prev;
      if (!next) {
        setShowVolumePopup(false);
        setShowWelcomeBalloon(false);
      }
      return next;
    });
  }, []);

  const handleMuteToggle = useCallback(() => {
    setAudioSettings({ muted: !audio.muted });
  }, [audio.muted, setAudioSettings]);

  const computeWelcomeAnchor = useCallback(() => {
    const el = welcomeIconRef.current;
    if (!el) {
      setWelcomeAnchor(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setWelcomeAnchor({
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  function toggleMenu(e) {
    e.stopPropagation();
    setShowWindowOverflow(false);
    setMenuOn((on) => {
      // Play start sound when opening menu (not closing)
      if (!on && windowSoundsEnabled) {
        playStart();
      }
      return !on;
    });
  }

  function _onMouseDown(e) {
    if (e.target.closest('.footer__window') || e.target.closest('.footer__window-overflow')) return;
    onMouseDown();
  }

  function _onClickMenuItem(name, injectProps = {}) {
    if (name) {
      onClickMenuItem(name, injectProps);
    }
    setMenuOn(false);
  }

  const handleWelcomeClick = useCallback(() => {
    // Compute anchor first before showing
    computeWelcomeAnchor();

    setShowWelcomeBalloon((prev) => {
      // Play balloon sound when showing (not hiding)
      if (!prev && playBalloonSound) {
        playBalloonSound();
      }
      return !prev;
    });

    // Auto-hide after 10 seconds
    if (balloonTimeoutRef.current) {
      clearTimeout(balloonTimeoutRef.current);
    }
    balloonTimeoutRef.current = setTimeout(() => {
      setShowWelcomeBalloon(false);
    }, 10000);
  }, [playBalloonSound, computeWelcomeAnchor]);

  const handleFullscreenClick = useCallback(() => {
    setShowWelcomeBalloon(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const handleBalloonLinkClick = useCallback((appName) => {
    setShowWelcomeBalloon(false);
    onClickMenuItem(appName);
  }, [onClickMenuItem]);

  const handleStartContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOn(false);
    setStartContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleStartContextMenuAction = useCallback((action) => {
    setStartContextMenu(null);
    if (action === 'properties') {
      onClickMenuItem('Taskbar Properties');
    }
  }, [onClickMenuItem]);

  const taskbarContextMenuItems = [
    {
      label: 'Toolbars',
      submenu: [
        {
          label: 'Links',
          checked: false,
          disabled: true,
          onClick: () => {},
        },
        {
          label: 'Language bar',
          checked: false,
          disabled: true,
          onClick: () => {},
        },
        {
          label: 'Desktop',
          checked: false,
          disabled: true,
          onClick: () => {},
        },
        {
          label: 'Quick Launch',
          checked: taskbar.showQuickLaunch,
          onClick: () => setTaskbarSettings({ showQuickLaunch: !taskbar.showQuickLaunch }),
        },
        { type: 'divider' },
        {
          label: 'New Toolbar...',
          disabled: true,
          onClick: () => {},
        },
      ],
    },
    { type: 'divider' },
    {
      label: 'Cascade Windows',
      disabled: true,
      onClick: () => {},
    },
    {
      label: 'Tile Windows Horizontally',
      disabled: true,
      onClick: () => {},
    },
    {
      label: 'Tile Windows Vertically',
      disabled: true,
      onClick: () => {},
    },
    {
      label: 'Show the Desktop',
      onClick: () => onMinimizeAll?.(),
    },
    { type: 'divider' },
    {
      label: 'Task Manager',
      onClick: () => {
        setStartContextMenu(null);
        onClickMenuItem('Task Manager');
      },
    },
    { type: 'divider' },
    {
      label: 'Lock the Taskbar',
      checked: true,
      disabled: true,
      onClick: () => {},
    },
    {
      label: 'Properties',
      onClick: () => handleStartContextMenuAction('properties'),
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const newTime = getTime();
      newTime !== time && setTime(newTime);
    }, 1000);
    return () => clearInterval(timer);
  }, [time]);

  useEffect(() => {
    if (!menuOn) return;

    function handleClickOutside(e) {
      const menuEl = menuRef.current;
      const startBtnEl = startButtonRef.current;

      // Don't close if clicking inside menu or on start button
      if (menuEl && menuEl.contains(e.target)) return;
      if (startBtnEl && startBtnEl.contains(e.target)) return;

      setMenuOn(false);
    }

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [menuOn]);

  // Close balloon when clicking outside
  useEffect(() => {
    if (!showWelcomeBalloon) return;

    function handleClickOutside(e) {
      const welcomeEl = welcomeIconRef.current;
      if (welcomeEl && welcomeEl.contains(e.target)) return;
      if (e.target.closest('.welcome-balloon')) return;
      setShowWelcomeBalloon(false);
    }

    // Small delay to prevent the current click from triggering close
    const timeoutId = setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWelcomeBalloon]);

  // Close volume popup when clicking outside
  useEffect(() => {
    if (!showVolumePopup) return;

    function handleClickOutside(e) {
      const volumeEl = volumeIconRef.current;
      const popupEl = volumePopupRef.current;
      if (volumeEl && volumeEl.contains(e.target)) return;
      if (popupEl && popupEl.contains(e.target)) return;
      setShowVolumePopup(false);
    }

    const timeoutId = setTimeout(() => {
      window.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVolumePopup]);

  useEffect(() => {
    if (!isWindowOverflowOpen) return;

    const handleClickOutside = (e) => {
      const buttonEl = windowOverflowButtonRef.current;
      const menuEl = windowOverflowRef.current;
      if (buttonEl && buttonEl.contains(e.target)) return;
      if (menuEl && menuEl.contains(e.target)) return;
      setShowWindowOverflow(false);
    };

    const handleViewportChange = () => updateWindowOverflowPosition();

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isWindowOverflowOpen, updateWindowOverflowPosition]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (balloonTimeoutRef.current) {
        clearTimeout(balloonTimeoutRef.current);
      }
    };
  }, []);

  // Listen for update availability to show tray icon
  useEffect(() => {
    const handleAvailable = (e) => {
      const detail = e?.detail;
      setHasUpdate(true);
      if (detail?.version) {
        setUpdateTooltip(`Update ${detail.version} available`);
      } else {
        setUpdateTooltip('Updates available');
      }
    };

    const handleClear = () => {
      setHasUpdate(false);
    };

    window.addEventListener('xp:update-available', handleAvailable);
    window.addEventListener('xp:update-clear', handleClear);

    return () => {
      window.removeEventListener('xp:update-available', handleAvailable);
      window.removeEventListener('xp:update-clear', handleClear);
    };
  }, []);

  // Listen for theme installation events to show balloon notification
  useEffect(() => {
    const handleThemeInstalled = (e) => {
      const { theme } = e.detail || {};
      if (theme) {
        setThemeBalloon({ themeId: theme.id, themeName: theme.name });
        // Play balloon sound if available
        playBalloonSound?.();
      }
    };

    window.addEventListener('xp:theme-installed', handleThemeInstalled);
    return () => window.removeEventListener('xp:theme-installed', handleThemeInstalled);
  }, [playBalloonSound]);

  const handleThemeBalloonApply = useCallback(() => {
    if (themeBalloon?.themeId) {
      setActiveTheme(themeBalloon.themeId);
    }
    setThemeBalloon(null);
  }, [themeBalloon, setActiveTheme]);

  const handleTaskbarContextMenu = useCallback((e) => {
    // Only show context menu if clicking on the taskbar background, not on buttons
    if (
      e.target.closest('.footer__window')
      || e.target.closest('.footer__window-overflow')
      || e.target.closest('.footer__time')
      || e.target.closest('img')
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setMenuOn(false);
    setStartContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const trayIcons = [
    {
      key: 'welcome',
      element: (
        <TrayIcon
          ref={welcomeIconRef}
          src={withBaseUrl('/gui/taskbar/welcome.webp')}
          alt="Welcome"
          title="Welcome"
          onClick={handleWelcomeClick}
        />
      ),
    },
    ...(isMobile && clippyHiddenOnMobile
      ? [{
        key: 'clippy',
        element: (
          <TrayIcon
            src={withBaseUrl('/icons/about.webp')}
            alt="Clippy"
            title="Show Clippy"
            onClick={onShowClippy}
          />
        ),
      }]
      : []),
    ...(hasUpdate
      ? [{
        key: 'update',
        element: (
          <TrayIcon
            ref={updateIconRef}
            className="tray-icon--update"
            src={withBaseUrl('/gui/taskbar/windows-update.png')}
            alt="Windows Update"
            title={updateTooltip}
            onClick={() => window.dispatchEvent(new Event('xp:update-icon-click'))}
          />
        ),
      }]
      : []),
    {
      key: 'crt',
      element: (
        <TrayIcon
          src={withBaseUrl(crtEnabled ? '/gui/taskbar/crt.webp' : '/gui/taskbar/crt-off.webp')}
          alt="CRT Effects"
          title={crtEnabled ? 'CRT Effects: ON' : 'CRT Effects: OFF'}
          onClick={onToggleCRT}
        />
      ),
    },
    ...(!isMobile
      ? [{
        key: 'fullscreen',
        element: (
          <TrayIcon
            src={withBaseUrl('/gui/taskbar/fullscreen.webp')}
            alt="Fullscreen"
            title="Toggle Fullscreen"
            onClick={handleFullscreenClick}
          />
        ),
      }]
      : []),
    {
      key: 'volume',
      element: (
        <TrayIcon
          ref={volumeIconRef}
          src={withBaseUrl('/gui/taskbar/speaker.png')}
          alt="Volume"
          title={audio.muted ? 'Volume: Muted' : `Volume: ${audio.volume}%`}
          onClick={handleVolumeClick}
          onDoubleClick={handleVolumeDoubleClick}
        />
      ),
    },
  ];
  const trayExpandedWidth = useMemo(
    () => `calc(77px + ${trayIcons.length * 22}px)`,
    [trayIcons.length]
  );

  return (
    <Container
      className="desktop xp-taskbar-shell"
      data-start-menu-open={menuOn ? 'true' : 'false'}
      $theme={activeTheme}
    >
      <div ref={menuRef} className="footer__start__menu">
        {menuOn && <FooterMenu onClick={_onClickMenuItem} onLaunchInstalledApp={onLaunchInstalledApp} />}
      </div>

      <div className="taskbar" onMouseDown={_onMouseDown} onContextMenu={handleTaskbarContextMenu}>
        {activeTheme.startButton?.type === 'sprite' ? (
          <SpriteStartButton
            ref={startButtonRef}
            role="button"
            tabIndex={0}
            aria-label="Start"
            onMouseDown={toggleMenu}
            onContextMenu={handleStartContextMenu}
            $active={menuOn}
            $sprite={activeTheme.startButton}
          />
        ) : (
          <DefaultStartButton
            ref={startButtonRef}
            active={menuOn}
            onMouseDown={toggleMenu}
            onContextMenu={handleStartContextMenu}
          />
        )}

        <div className="footer__quick-launch">
          <QuickLaunch
            enabled={taskbar.showQuickLaunch && !isMobile && !isMobileDevice()}
            onClickMenuItem={_onClickMenuItem}
            onMinimizeAll={onMinimizeAll}
          />
        </div>

        <div className="running-applications">
          {visibleTaskbarApps.map((app) => (
            <FooterWindow
              key={app.id}
              id={app.id}
              icon={app.header.icon}
              title={app.header.title}
              onMouseDown={onMouseDownApp}
              isFocus={focusedAppId === app.id}
            />
          ))}
          {hasWindowOverflow && (
            <WindowOverflowAnchor ref={windowOverflowButtonRef}>
              <WindowOverflowButton
                type="button"
                className={`app-button footer__window-overflow ${hasFocusedOverflowWindow ? 'active focus' : 'cover'}`}
                onClick={handleWindowOverflowToggle}
                title={`${overflowTaskbarApps.length} more open window${overflowTaskbarApps.length === 1 ? '' : 's'}`}
                $theme={activeTheme}
              >
                <span aria-hidden="true">▲</span>
              </WindowOverflowButton>
              {isWindowOverflowOpen && windowOverflowPosition && createPortal(
                <WindowOverflowMenu
                  ref={windowOverflowRef}
                  $colorDepth={colorDepth}
                  style={{
                    left: windowOverflowPosition.left,
                    bottom: windowOverflowPosition.bottom,
                  }}
                >
                  {overflowTaskbarApps.map((app) => (
                    <WindowOverflowItem
                      key={app.id}
                      type="button"
                      className={focusedAppId === app.id ? 'focus' : ''}
                      onClick={() => {
                        onMouseDownApp(app.id);
                        setShowWindowOverflow(false);
                      }}
                    >
                      <img className="footer__icon" src={app.header.icon} alt={app.header.title} />
                      <span>{app.header.title}</span>
                    </WindowOverflowItem>
                  ))}
                </WindowOverflowMenu>,
                getXpPortalRoot()
              )}
            </WindowOverflowAnchor>
          )}
        </div>

        <div
          className={`notification-tray ${trayExpanded ? 'is-expanded' : ''}`}
          data-expanded={trayExpanded ? 'true' : 'false'}
          style={{ '--xp-tray-expanded-width': trayExpandedWidth }}
        >
          <div className="external" />
          <div className="internal">
            {trayIcons.map(({ key, element }) => (
              <div
                key={key}
                className="icon-container"
                aria-hidden={!trayExpanded}
              >
                {element}
              </div>
            ))}
            {taskbar.showClock && (
              <div
                className="clock footer__time"
                onClick={() => onClickMenuItem('Date and Time Properties')}
                title="Click to change date and time settings"
              >
                {time}
              </div>
            )}
          </div>
          <label aria-label="notif-expand">
            <input
              type="checkbox"
              checked={trayExpanded}
              onChange={handleTrayToggle}
            />
          </label>
        </div>
      </div>

      {showVolumePopup && createPortal(
        <VolumePopup ref={volumePopupRef} $colorDepth={colorDepth}>
          <div className="volume-label">Volume</div>
          <div className="field-row">
            <div className="is-vertical">
              <input
                id="volume-slider"
                className={`has-box-indicator ${audio.muted ? 'disabled' : ''}`}
                type="range"
                min="0"
                max="100"
                value={audio.volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
          <div className="field-row mute-row">
            <input
              type="checkbox"
              id="volume-mute"
              checked={audio.muted}
              onChange={handleMuteToggle}
            />
            <label htmlFor="volume-mute">Mute</label>
          </div>
        </VolumePopup>,
        getXpPortalRoot()
      )}

      {startContextMenu && (
        <ContextMenu
          position={startContextMenu}
          items={taskbarContextMenuItems}
          onClose={() => setStartContextMenu(null)}
          overlayType="fixed"
          zIndex={10000}
        />
      )}

      {showWelcomeBalloon && createPortal(
        <WelcomeBalloon
          className="xp-balloon welcome-balloon"
          displayColorDepth={colorDepth}
          title="Welcome to XPortfolio"
          icon="/gui/taskbar/welcome.webp"
          iconAlt="welcome"
          width={260}
          anchor={welcomeAnchor}
          offset={{ y: 0 }}
          placement="top"
          onClose={() => setShowWelcomeBalloon(false)}
          style={welcomeAnchor ? { position: 'static', bottom: 'auto', right: 'auto' } : undefined}
        >
          <p className="balloon__text">
            A faithful XP-inspired interface, custom-built to showcase my work and attention to detail.
          </p>
          <p className="balloon__links">
            Get Started:{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); handleBalloonLinkClick('About Me'); }}>
              About Me
            </a>{' '}
            |{' '}
            <a href="#" onClick={(e) => { e.preventDefault(); handleBalloonLinkClick('Projects'); }}>
              My Projects
            </a>
          </p>
        </WelcomeBalloon>,
        getXpPortalRoot()
      )}

      {themeBalloon && createPortal(
        <ThemeBalloon
          className="xp-balloon theme-balloon"
          displayColorDepth={colorDepth}
          title="A new skin has been installed."
          icon="/gui/taskbar/welcome.webp"
          iconAlt="WindowBlinds"
          width={300}
          animate
          onClose={() => setThemeBalloon(null)}
        >
          <p className="balloon__text">
            A skin called &apos;{themeBalloon.themeName}&apos; has been installed.
          </p>
          <p className="balloon__text">
            Click this tooltip to apply the skin, or you can apply this from the appearance tab in display properties.
          </p>
          <div className="balloon__actions">
            <button className="balloon__btn" onClick={handleThemeBalloonApply}>
              Apply Now
            </button>
            <button className="balloon__btn" onClick={() => setThemeBalloon(null)}>
              Dismiss
            </button>
          </div>
        </ThemeBalloon>,
        getXpPortalRoot()
      )}
    </Container>
  );
}

const DefaultStartButton = React.forwardRef(function DefaultStartButton(
  { active, onMouseDown, onContextMenu },
  ref
) {
  return (
    <DefaultStartButtonShell
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label="Start"
      className={`start-button start-button--image ${active ? 'active' : ''}`}
      data-state={active ? 'active' : 'default'}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
    >
      <label>
        <input type="checkbox" name="start-menu-demo" aria-label="Toggle Start menu" checked={active} readOnly />
        <img className="start-button-image" src={withBaseUrl('/start-button.webp')} width="94" height="30" alt="Start" />
      </label>
    </DefaultStartButtonShell>
  );
});

function FooterWindow({ id, icon, title, onMouseDown, isFocus }) {
  function _onMouseDown() {
    onMouseDown(id);
  }
  return (
    <div
      onMouseDown={_onMouseDown}
      className={`app-button footer__window ${isFocus ? 'active focus' : 'cover'}`}
    >
      <img className="footer__icon" src={icon} alt={title} />
      <div className="footer__text">{title}</div>
    </div>
  );
}

const DefaultStartButtonShell = styled.div`
  flex: 0 0 auto;
`;

const SpriteStartButton = styled.div`
  height: ${({ $sprite }) => $sprite.stateHeight || 30}px;
  width: ${({ $sprite }) => $sprite.stateWidth || 75}px;
  cursor: pointer;
  margin-right: 10px;
  flex-shrink: 0;
  background-image: url(${({ $sprite }) => withBaseUrl($sprite.spriteSheet)});
  background-repeat: no-repeat;
  background-size: auto 100%;
  background-position: 0 0;

  &:hover {
    background-position: -${({ $sprite }) => $sprite.stateWidth || 75}px 0;
  }

  &:active {
    background-position: -${({ $sprite }) => ($sprite.stateWidth || 75) * 2}px 0;
  }

  ${({ $active, $sprite }) => $active ? `
    background-position: -${($sprite.stateWidth || 75) * 2}px 0;
  ` : ''}
`;

const TrayIcon = styled.img`
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin: 0 1px;
  opacity: 0.9;
  transition: opacity 140ms ease, filter 140ms ease;

  &:hover {
    opacity: 1;
    filter: brightness(1.2);
  }

  &:active {
    filter: brightness(0.9);
  }

  /* Larger touch targets on mobile */
  .mobile-device & {
    width: 20px;
    height: 20px;
    margin: 0 2px;
    padding: 2px;
  }
`;

const WelcomeBalloon = styled(Balloon)`
  position: fixed;
  bottom: 50px;
  right: 16px;
  z-index: 9999;
`;

const ThemeBalloon = styled(Balloon)`
  position: fixed;
  bottom: 50px;
  right: 16px;
  z-index: 9999;
`;

const VolumePopup = styled.div.attrs({
  className: 'window xp-volume-popup xp-shell-surface',
})`
  position: fixed;
  bottom: 34px;
  right: 80px;
  z-index: 10001;
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Tahoma', sans-serif;
  font-size: 11px;
  filter: ${({ $colorDepth }) => getColorDepthFilter($colorDepth) || 'none'};

  .volume-label {
    color: #000;
    margin-bottom: 4px;
  }

  .field-row {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .is-vertical {
    height: 90px !important;
    width: 30px !important;
    transform: none !important;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;

    input[type="range"] {
      width: 80px !important;
      margin: 0 !important;
      transform: rotate(270deg) !important;
      transform-origin: center center !important;
    }
  }

  .mute-row {
    margin-top: 8px;
  }

  .disabled {
    opacity: 0.5;
  }
`;

const WindowOverflowAnchor = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
`;

const WindowOverflowButton = styled.button`
  width: 30px;
  min-width: 30px;
  color: ${({ $theme }) => $theme?.taskButton?.textColor || '#fff'};
  border-radius: 2px;
  margin-top: 2px;
  margin-left: 3px;
  padding: 0;
  height: 22px;
  font-size: 10px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: none;

  &.cover {
    background: ${({ $theme }) => resolveThemeBg($theme?.taskButton?.cover?.background)};
    box-shadow: ${({ $theme }) => $theme?.taskButton?.cover?.boxShadow};
  }

  &.cover:hover {
    background: ${({ $theme }) => resolveThemeBg($theme?.taskButton?.coverHover?.background)};
  }

  &.focus {
    background: ${({ $theme }) => resolveThemeBg($theme?.taskButton?.focus?.background)};
    box-shadow: ${({ $theme }) => $theme?.taskButton?.focus?.boxShadow};
  }

  &.focus:hover {
    background: ${({ $theme }) => resolveThemeBg($theme?.taskButton?.focusHover?.background)};
  }

  &:active {
    background: ${({ $theme }) => resolveThemeBg($theme?.taskButton?.focusActive?.background) || '#0c358a'};
  }
`;

const WindowOverflowMenu = styled.div`
  position: fixed;
  z-index: 10002;
  display: flex;
  flex-direction: column;
  min-width: 190px;
  max-width: 260px;
  padding: 2px;
  background: var(--xp-menu-bg, #ece9d8);
  border: 1px solid #0a246a;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.45);
  transform: translateX(-100%);
  filter: ${({ $colorDepth }) => getColorDepthFilter($colorDepth) || 'none'};
`;

const WindowOverflowItem = styled.button`
  height: 26px;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 0 8px;
  border: none;
  background: transparent;
  color: var(--xp-menu-text, #000);
  font-size: 11px;
  text-align: left;
  cursor: pointer;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  img {
    flex-shrink: 0;
  }

  &:hover,
  &.focus {
    background: var(--xp-highlight, #316ac5);
    color: var(--xp-highlight-text, #fff);
  }
`;

const Container = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 9998;
  overflow: visible;

  .footer__start__menu {
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 1000;
  }

  .taskbar {
    background: ${({ $theme }) => resolveThemeBg($theme.taskbar.background)};
    ${({ $theme }) => $theme.taskbar.backgroundRepeat ? `background-repeat: ${$theme.taskbar.backgroundRepeat};` : ''}
    ${({ $theme }) => $theme.taskbar.backgroundSize ? `background-size: ${$theme.taskbar.backgroundSize};` : ''}
  }

  .footer__quick-launch {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    min-width: 0;
  }

  .running-applications {
    min-width: 0;
    padding-right: 6px;
  }

  .notification-tray {
    background: ${({ $theme }) => resolveThemeBg($theme.tray.background)};
    ${({ $theme }) => $theme.tray.backgroundSize ? `background-size: ${$theme.tray.backgroundSize};` : ''}
    ${({ $theme }) => $theme.tray.backgroundRepeat ? `background-repeat: ${$theme.tray.backgroundRepeat};` : ''}
  }

  .notification-tray .external {
    background: ${({ $theme }) => resolveThemeBg($theme.taskbar.background)};
    ${({ $theme }) => $theme.taskbar.backgroundRepeat ? `background-repeat: ${$theme.taskbar.backgroundRepeat};` : ''}
    ${({ $theme }) => $theme.taskbar.backgroundSize ? `background-size: ${$theme.taskbar.backgroundSize};` : ''}
  }

  .notification-tray .internal {
    display: flex;
    align-items: center;
    border-left: ${({ $theme }) => $theme.tray.borderLeft || 'none'};
    box-shadow: ${({ $theme }) => $theme.tray.boxShadow || 'none'};
    padding: ${({ $theme }) => $theme.tray.padding || '0 10px'};
    gap: 4px;
    overflow: hidden;
  }

  .notification-tray [aria-label='notif-expand'] input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .notification-tray .icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    width: 18px;
    overflow: hidden;
    opacity: 1;
    transition: opacity 140ms ease;
  }

  .notification-tray[data-expanded='false'] .icon-container {
    opacity: 0;
    pointer-events: none;
  }

  .footer__window {
    flex: 0 1 150px;
    min-width: 110px;
    max-width: 150px;
    color: ${({ $theme }) => $theme.taskButton.textColor || '#fff'};
    border-radius: 2px;
    margin-top: 2px;
    margin-left: 3px;
    padding: 0 8px;
    height: 22px;
    font-size: 11px;
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .footer__icon {
    height: 15px;
    width: 15px;
  }

  .footer__text {
    position: absolute;
    left: 27px;
    right: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Inactive/unfocused window - raised button appearance */
  .footer__window.cover {
    background: ${({ $theme }) => resolveThemeBg($theme.taskButton.cover.background)};
    box-shadow: ${({ $theme }) => $theme.taskButton.cover.boxShadow};
    border-color: transparent;
  }

  .footer__window.cover:before {
    ${({ $theme }) => $theme.taskButton.showTopHighlight === false ? 'display: none;' : `
    display: block;
    content: '';
    position: absolute;
    left: 2px;
    top: 2px;
    right: 2px;
    height: 1px;
    background: linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
    `}
  }

  .footer__window.cover:hover {
    background: ${({ $theme }) => resolveThemeBg($theme.taskButton.coverHover.background)};
  }

  .footer__window.cover:hover:active {
    background: ${({ $theme }) => resolveThemeBg($theme.taskButton.coverActive?.background || $theme.taskButton.coverHover.background)};
    ${({ $theme }) => $theme.taskButton.coverActive?.boxShadow ? `box-shadow: ${$theme.taskButton.coverActive.boxShadow};` : ''}
  }

  /* Active/focused window - pressed/sunken appearance */
  .footer__window.focus {
    background: ${({ $theme }) => resolveThemeBg($theme.taskButton.focus.background)};
    box-shadow: ${({ $theme }) => $theme.taskButton.focus.boxShadow};
    ${({ $theme }) => $theme.taskButton.focusTextColor ? `color: ${$theme.taskButton.focusTextColor};` : ''}
    border-color: transparent;
  }

  .footer__window.focus:before {
    display: none;
  }

  .footer__window.focus:hover {
    background: ${({ $theme }) => resolveThemeBg($theme.taskButton.focusHover.background)};
  }

  .footer__window.focus:hover:active {
    background: ${({ $theme }) => resolveThemeBg($theme.taskButton.focusActive?.background || $theme.taskButton.focusHover.background)};
  }

  .footer__time {
    margin: 0;
    color: ${({ $theme }) => $theme.tray.textColor || '#fff'};
    font-size: 11px;
    font-weight: lighter;
    text-shadow: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .notification-tray .icon-container,
    ${TrayIcon} {
      transition: none;
    }
  }
`;

export default Footer;
