import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { initUpdateChecker } from '../../utils/updateChecker';

// For testing: window.triggerUpdate() or Ctrl+Shift+U
const DEV_MODE = import.meta.env.DEV;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(10px);
  }
`;

const UpdateBalloon = styled.div`
  position: fixed;
  bottom: 50px;
  right: 16px;
  width: 280px;
  background: #ffffcc;
  border: 1px solid #000;
  border-radius: 4px;
  padding: 10px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  z-index: 10000;
  font-size: 11px;
  animation: ${props => props.$isClosing ? fadeOut : fadeIn} 0.2s ease-out forwards;

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
      width: 32px;
      height: 32px;
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

  .balloon__version {
    margin: 0 0 10px 0;
    color: #666;
    font-family: 'Lucida Console', Monaco, monospace;
    font-size: 10px;
  }

  .balloon__links {
    margin: 0;
    color: #000;

    a {
      color: blue;
      text-decoration: underline;
      cursor: pointer;

      &:hover {
        color: red;
      }
    }
  }
`;

export default function UpdateToast() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Mock update trigger for testing
  const triggerMockUpdate = useCallback(() => {
    setUpdateInfo({
      version: '1.1',
      buildNumber: 'test123',
      buildTime: new Date().toISOString(),
      onReload: () => {
        console.log('[Update] Mock reload triggered');
        window.location.reload();
      },
    });
    setIsClosing(false);
    console.log('[Update] Mock update notification triggered');
  }, []);

  useEffect(() => {
    initUpdateChecker((info) => {
      setUpdateInfo(info);
      setIsClosing(false);
    });

    // Expose global function for testing (works in both dev and prod)
    window.triggerUpdate = triggerMockUpdate;

    // Keyboard shortcut: Ctrl+Shift+U (or Cmd+Shift+U on Mac)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        triggerMockUpdate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    if (DEV_MODE) {
      console.log('[Update] Testing shortcuts enabled:');
      console.log('  - Ctrl+Shift+U (or Cmd+Shift+U on Mac)');
      console.log('  - window.triggerUpdate()');
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      delete window.triggerUpdate;
    };
  }, [triggerMockUpdate]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setUpdateInfo(null);
    }, 200);
  };

  const handleReboot = (e) => {
    e.preventDefault();
    if (updateInfo?.onReload) {
      updateInfo.onReload();
    }
  };

  if (!updateInfo) {
    return null;
  }

  return (
    <UpdateBalloon $isClosing={isClosing} className="update-balloon">
      <button className="balloon__close" onClick={handleClose} />
      <div className="balloon__header">
        <img src="/gui/taskbar/welcome.webp" alt="update" />
        <span>Update Available</span>
      </div>
      <p className="balloon__text">
        A new version of XPortfolio is ready to install.
      </p>
      <p className="balloon__version">
        Version {updateInfo.version} ({updateInfo.buildNumber})
      </p>
      <p className="balloon__links">
        <a href="#" onClick={handleReboot}>Reboot Now</a>
        {' | '}
        <a href="#" onClick={(e) => { e.preventDefault(); handleClose(); }}>Later</a>
      </p>
    </UpdateBalloon>
  );
}
