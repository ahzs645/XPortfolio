import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import FooterMenu from './FooterMenu';

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
  crtEnabled,
  onToggleCRT,
  playBalloonSound,
}) {
  const [time, setTime] = useState(getTime);
  const [menuOn, setMenuOn] = useState(false);
  const [showWelcomeBalloon, setShowWelcomeBalloon] = useState(false);
  const menuRef = useRef(null);
  const startButtonRef = useRef(null);
  const welcomeIconRef = useRef(null);
  const balloonTimeoutRef = useRef(null);

  function toggleMenu(e) {
    e.stopPropagation();
    setMenuOn((on) => !on);
  }

  function _onMouseDown(e) {
    if (e.target.closest('.footer__window')) return;
    onMouseDown();
  }

  function _onClickMenuItem(name) {
    onClickMenuItem(name);
    setMenuOn(false);
  }

  const handleWelcomeClick = useCallback(() => {
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
  }, [playBalloonSound]);

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

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [showWelcomeBalloon]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (balloonTimeoutRef.current) {
        clearTimeout(balloonTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Container onMouseDown={_onMouseDown}>
      <div className="footer__items left">
        <div ref={menuRef} className="footer__start__menu">
          {menuOn && <FooterMenu onClick={_onClickMenuItem} onLaunchInstalledApp={onLaunchInstalledApp} />}
        </div>
        <StartButton
          ref={startButtonRef}
          src="/start-button.webp"
          alt="start"
          onMouseDown={toggleMenu}
          $active={menuOn}
          draggable={false}
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
        {showWelcomeBalloon && (
          <WelcomeBalloon className="welcome-balloon">
            <button
              className="balloon__close"
              onClick={() => setShowWelcomeBalloon(false)}
            />
            <div className="balloon__header">
              <img src="/gui/taskbar/welcome.webp" alt="welcome" />
              <span>Welcome to XPortfolio</span>
            </div>
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
          </WelcomeBalloon>
        )}
        <TrayIcon
          ref={welcomeIconRef}
          src="/gui/taskbar/welcome.webp"
          alt="Welcome"
          title="Welcome"
          onClick={handleWelcomeClick}
        />
        <TrayIcon
          src={crtEnabled ? '/gui/taskbar/crt.webp' : '/gui/taskbar/crt-off.webp'}
          alt="CRT Effects"
          title={crtEnabled ? 'CRT Effects: ON' : 'CRT Effects: OFF'}
          onClick={onToggleCRT}
        />
        <TrayIcon
          src="/gui/taskbar/fullscreen.webp"
          alt="Fullscreen"
          title="Toggle Fullscreen"
          onClick={handleFullscreenClick}
        />
        <div className="footer__time">{time}</div>
      </div>
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
`;

const WelcomeBalloon = styled.div`
  position: absolute;
  bottom: 40px;
  right: 10px;
  width: 260px;
  background: #ffffcc;
  border: 1px solid #000;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  font-size: 11px;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    right: 40px;
    border-width: 10px 10px 0 10px;
    border-style: solid;
    border-color: #ffffcc transparent transparent transparent;
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -12px;
    right: 39px;
    border-width: 11px 11px 0 11px;
    border-style: solid;
    border-color: #000 transparent transparent transparent;
  }

  .balloon__close {
    all: unset;
    position: absolute;
    top: 4px;
    right: 4px;
    width: 14px;
    height: 14px;
    background-color: transparent;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    box-sizing: border-box;
    display: block;
    cursor: pointer;

    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 5px;
      top: 2px;
      width: 2px;
      height: 8px;
      background-color: #aaa;
    }

    &::before {
      transform: rotate(45deg);
    }

    &::after {
      transform: rotate(-45deg);
    }

    &:hover {
      background-color: #dd0f0f;
      border-color: #fff;
      box-shadow: 1px 1px rgba(0, 0, 0, 0.1);

      &::before,
      &::after {
        background-color: #fff;
      }
    }

    &:active {
      background-color: #a00a0a;
    }
  }

  .balloon__header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    padding-right: 16px;

    img {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }

    span {
      font-weight: bold;
      color: #000;
    }
  }

  .balloon__text {
    margin: 0 0 8px 0;
    color: #000;
    line-height: 1.4;
  }

  .balloon__links {
    margin: 0;
    color: #000;

    a {
      color: blue;
      text-decoration: underline;
      cursor: pointer;

      &:hover {
        color: darkblue;
      }
    }
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
