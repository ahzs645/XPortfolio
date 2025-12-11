import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import Balloon from '../../components/Balloon';
import FooterMenu from './FooterMenu';
import QuickLaunch from './QuickLaunch';
import { ContextMenu } from '../components/ContextMenu';
import { isMobileDevice } from '../../utils/deviceDetection';

const QUICK_LAUNCH_ENABLED_KEY = 'xp-quick-launch-enabled';
const VOLUME_KEY = 'xp-volume';
const MUTED_KEY = 'xp-muted';

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
  const [time, setTime] = useState(getTime);
  const [menuOn, setMenuOn] = useState(false);
  const [showWelcomeBalloon, setShowWelcomeBalloon] = useState(false);
  const [welcomeAnchor, setWelcomeAnchor] = useState(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [updateTooltip, setUpdateTooltip] = useState('Updates available');
  const [startContextMenu, setStartContextMenu] = useState(null);
  const [quickLaunchEnabled, setQuickLaunchEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(QUICK_LAUNCH_ENABLED_KEY);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [volume, setVolume] = useState(() => {
    try {
      const saved = localStorage.getItem(VOLUME_KEY);
      return saved !== null ? parseInt(saved, 10) : 50;
    } catch {
      return 50;
    }
  });
  const [muted, setMuted] = useState(() => {
    try {
      const saved = localStorage.getItem(MUTED_KEY);
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  const menuRef = useRef(null);
  const startButtonRef = useRef(null);
  const welcomeIconRef = useRef(null);
  const updateIconRef = useRef(null);
  const balloonTimeoutRef = useRef(null);
  const volumeIconRef = useRef(null);
  const volumePopupRef = useRef(null);

  // Persist Quick Launch enabled state
  useEffect(() => {
    try {
      localStorage.setItem(QUICK_LAUNCH_ENABLED_KEY, JSON.stringify(quickLaunchEnabled));
    } catch (e) {
      console.error('Failed to save Quick Launch state:', e);
    }
  }, [quickLaunchEnabled]);

  // Persist volume settings
  useEffect(() => {
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch (e) {
      console.error('Failed to save volume:', e);
    }
  }, [volume]);

  useEffect(() => {
    try {
      localStorage.setItem(MUTED_KEY, JSON.stringify(muted));
    } catch (e) {
      console.error('Failed to save muted state:', e);
    }
  }, [muted]);

  // Dispatch volume change event for other components to listen
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('xp:volume-change', {
      detail: { volume: muted ? 0 : volume, muted }
    }));
  }, [volume, muted]);

  const handleVolumeClick = useCallback(() => {
    setShowVolumePopup(prev => !prev);
  }, []);

  const handleVolumeChange = useCallback((e) => {
    setVolume(parseInt(e.target.value, 10));
  }, []);

  const handleMuteToggle = useCallback(() => {
    setMuted(prev => !prev);
  }, []);

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
    setMenuOn((on) => !on);
  }

  function _onMouseDown(e) {
    if (e.target.closest('.footer__window')) return;
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
          checked: quickLaunchEnabled,
          onClick: () => setQuickLaunchEnabled(prev => !prev),
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

  const handleTaskbarContextMenu = useCallback((e) => {
    // Only show context menu if clicking on the taskbar background, not on buttons
    if (e.target.closest('.footer__window') || e.target.closest('.footer__time') || e.target.closest('img')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setMenuOn(false);
    setStartContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  return (
    <Container onMouseDown={_onMouseDown} onContextMenu={handleTaskbarContextMenu}>
      <div className="footer__items left">
        <div ref={menuRef} className="footer__start__menu">
          {menuOn && <FooterMenu onClick={_onClickMenuItem} onLaunchInstalledApp={onLaunchInstalledApp} />}
        </div>
        <StartButton
          ref={startButtonRef}
          src="/start-button.webp"
          alt="start"
          onMouseDown={toggleMenu}
          onContextMenu={handleStartContextMenu}
          $active={menuOn}
          draggable={false}
        />
        <QuickLaunch
          enabled={quickLaunchEnabled && !isMobileDevice()}
          onClickMenuItem={_onClickMenuItem}
          onMinimizeAll={onMinimizeAll}
        />
        {[...apps].map(
          (app) =>
            !app.header.noFooterWindow && (
              <FooterWindow
                key={app.id}
                id={app.id}
                icon={app.header.icon}
                title={app.header.title}
                onMouseDown={onMouseDownApp}
                isFocus={focusedAppId === app.id}
              />
            )
        )}
      </div>

      <div className="footer__items right">
        <TrayIcon
          ref={welcomeIconRef}
          src="/gui/taskbar/welcome.webp"
          alt="Welcome"
          title="Welcome"
          onClick={handleWelcomeClick}
        />
        {isMobile && clippyHiddenOnMobile && (
          <TrayIcon
            src="/icons/about.webp"
            alt="Clippy"
            title="Show Clippy"
            onClick={onShowClippy}
          />
        )}
        {hasUpdate && (
          <TrayIcon
            ref={updateIconRef}
            className="tray-icon--update"
            src="/gui/taskbar/windows-update.png"
            alt="Windows Update"
            title={updateTooltip}
            onClick={() => window.dispatchEvent(new Event('xp:update-icon-click'))}
          />
        )}
        <TrayIcon
          src={crtEnabled ? '/gui/taskbar/crt.webp' : '/gui/taskbar/crt-off.webp'}
          alt="CRT Effects"
          title={crtEnabled ? 'CRT Effects: ON' : 'CRT Effects: OFF'}
          onClick={onToggleCRT}
        />
        {!isMobile && (
          <TrayIcon
            src="/gui/taskbar/fullscreen.webp"
            alt="Fullscreen"
            title="Toggle Fullscreen"
            onClick={handleFullscreenClick}
          />
        )}
        <TrayIcon
          ref={volumeIconRef}
          src="/gui/taskbar/speaker.png"
          alt="Volume"
          title={muted ? 'Volume: Muted' : `Volume: ${volume}%`}
          onClick={handleVolumeClick}
        />
        <div
          className="footer__time"
          onClick={() => onClickMenuItem('Date and Time Properties')}
          title="Click to change date and time settings"
        >
          {time}
        </div>
      </div>

      {showVolumePopup && createPortal(
        <VolumePopup ref={volumePopupRef}>
          <div className="volume-label">Volume</div>
          <div className="field-row">
            <div className="is-vertical">
              <input
                id="volume-slider"
                className={`has-box-indicator ${muted ? 'disabled' : ''}`}
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
          <div className="field-row mute-row">
            <input
              type="checkbox"
              id="volume-mute"
              checked={muted}
              onChange={handleMuteToggle}
            />
            <label htmlFor="volume-mute">Mute</label>
          </div>
        </VolumePopup>,
        document.body
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
          className="welcome-balloon"
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
        document.body
      )}
    </Container>
  );
}

function FooterWindow({ id, icon, title, onMouseDown, isFocus }) {
  function _onMouseDown() {
    onMouseDown(id);
  }
  return (
    <div
      onMouseDown={_onMouseDown}
      className={`footer__window ${isFocus ? 'focus' : 'cover'}`}
    >
      <img className="footer__icon" src={icon} alt={title} />
      <div className="footer__text">{title}</div>
    </div>
  );
}

const StartButton = styled.img`
  height: 30px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    filter: brightness(1.05);
  }

  &:active {
    filter: brightness(0.85);
  }
`;

const TrayIcon = styled.img`
  width: 16px;
  height: 16px;
  cursor: pointer;
  margin: 0 3px;
  opacity: 0.9;

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
    margin: 0 6px;
    padding: 2px;
  }
`;

const WelcomeBalloon = styled(Balloon)`
  position: fixed;
  bottom: 50px;
  right: 16px;
  z-index: 9999;
`;

const VolumePopup = styled.div`
  position: fixed;
  bottom: 34px;
  right: 80px;
  z-index: 10001;
  background: #ece9d8;
  border: 1px solid #888;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Tahoma', sans-serif;
  font-size: 11px;

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

const Container = styled.footer`
  height: 30px;
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
    #2258d5 23%,
    #2157d6 38%,
    #245ddb 54%,
    #2562df 86%,
    #245fdc 89%,
    #2158d4 92%,
    #1d4ec0 95%,
    #1941a5 98%
  );
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  z-index: 9998;

  .footer__items.left {
    height: 100%;
    flex: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .footer__items.right {
    background-color: #0b77e9;
    flex-shrink: 0;
    background: linear-gradient(
      to bottom,
      #0c59b9 1%,
      #139ee9 6%,
      #18b5f2 10%,
      #139beb 14%,
      #1290e8 19%,
      #0d8dea 63%,
      #0d9ff1 81%,
      #0f9eed 88%,
      #119be9 91%,
      #1392e2 94%,
      #137ed7 97%,
      #095bc9 100%
    );
    border-left: 1px solid #1042af;
    box-shadow: inset 1px 0 1px #18bbff;
    padding: 0 10px;
    margin-left: 10px;
    display: flex;
    align-items: center;
  }

  .footer__start__menu {
    position: absolute;
    left: 0;
    box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.5);
    bottom: 100%;
  }

  .footer__window {
    flex: 1;
    max-width: 150px;
    color: #fff;
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
    background: linear-gradient(
      to bottom,
      #4e9ef8 0%,
      #4295f3 5%,
      #3d8fee 10%,
      #3888e8 20%,
      #3482e3 40%,
      #3180e1 60%,
      #2e7dde 80%,
      #2a79da 100%
    );
    box-shadow:
      inset 1px 1px 1px rgba(255, 255, 255, 0.4),
      inset -1px -1px 1px rgba(0, 0, 0, 0.2);
  }

  .footer__window.cover:before {
    display: block;
    content: '';
    position: absolute;
    left: 2px;
    top: 2px;
    right: 2px;
    height: 1px;
    background: linear-gradient(to right, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
  }

  .footer__window.cover:hover {
    background: linear-gradient(
      to bottom,
      #5ca8ff 0%,
      #53a1fa 10%,
      #4a9af5 30%,
      #4293f0 60%,
      #3c8dec 100%
    );
  }

  .footer__window.cover:hover:active {
    background: #1e52b7;
    box-shadow: inset 0 0 2px 1px rgba(0, 0, 0, 0.4),
      inset 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  /* Active/focused window - pressed/sunken appearance */
  .footer__window.focus {
    background: linear-gradient(
      to bottom,
      #1a4aad 0%,
      #1847a8 5%,
      #1644a3 15%,
      #14419e 30%,
      #123e99 50%,
      #103b94 70%,
      #0e388f 85%,
      #0c358a 100%
    );
    box-shadow:
      inset 1px 1px 2px rgba(0, 0, 0, 0.5),
      inset -1px -1px 1px rgba(255, 255, 255, 0.1);
  }

  .footer__window.focus:before {
    display: none;
  }

  .footer__window.focus:hover {
    background: linear-gradient(
      to bottom,
      #1f4fb2 0%,
      #1c4cad 15%,
      #1948a7 40%,
      #1644a1 70%,
      #14419c 100%
    );
  }

  .footer__window.focus:hover:active {
    background: #0c358a;
  }

  .footer__time {
    margin: 0 5px;
    color: #fff;
    font-size: 11px;
    font-weight: lighter;
    text-shadow: none;
  }
`;

export default Footer;
