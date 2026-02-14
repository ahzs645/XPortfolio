import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Balloon from '../Balloon';
import { initUpdateChecker } from '../../utils/updateChecker';
import useSystemSounds from '../../hooks/useSystemSounds';

// For testing: window.triggerUpdate() or Ctrl+Shift+U
const DEV_MODE = import.meta.env.DEV;

const UpdateBalloon = styled(Balloon)`
  position: fixed;
  bottom: 50px;
  right: 16px;
  z-index: 10000;
`;

export default function UpdateToast() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [anchor, setAnchor] = useState(null);
  const { playBalloon } = useSystemSounds();

  const computeAnchor = useCallback(() => {
    const el = document.querySelector('.tray-icon--update');
    if (!el) {
      setAnchor(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setAnchor({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
    });
  }, []);

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
    setIsVisible(true);
    computeAnchor();
    window.dispatchEvent(new CustomEvent('xp:update-available', { detail: { version: '1.1', buildNumber: 'test123' } }));
    console.log('[Update] Mock update notification triggered');
  }, [computeAnchor]);

  useEffect(() => {
    initUpdateChecker((info) => {
      setUpdateInfo(info);
      setIsVisible(true);
      computeAnchor();
      window.dispatchEvent(new CustomEvent('xp:update-available', { detail: info }));
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
  }, [triggerMockUpdate, computeAnchor]);

  // Ensure tray icon is present whenever we have update info
  /* eslint-disable react-hooks/set-state-in-effect -- show toast on update detection */
  useEffect(() => {
    if (!updateInfo) return;
    window.dispatchEvent(new CustomEvent('xp:update-available', { detail: updateInfo }));
    computeAnchor();
    setIsVisible(true);
  }, [updateInfo, computeAnchor]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Play balloon sound when showing
  useEffect(() => {
    if (isVisible && updateInfo) {
      playBalloon();
    }
  }, [isVisible, updateInfo, playBalloon]);

  const handleClose = () => {
    setTimeout(() => {
      setIsVisible(false);
    }, 200);
  };

  const handleReboot = (e) => {
    e.preventDefault();
    if (updateInfo?.onReload) {
      updateInfo.onReload();
    }
    window.dispatchEvent(new Event('xp:update-clear'));
    setUpdateInfo(null);
    setIsVisible(false);
  };

  useEffect(() => {
    if (!updateInfo) return;

    const onIconClick = () => {
      if (!updateInfo) return;
      setIsVisible((prev) => !prev);
      computeAnchor();
    };

    window.addEventListener('xp:update-icon-click', onIconClick);
    window.addEventListener('resize', computeAnchor);

    return () => {
      window.removeEventListener('xp:update-icon-click', onIconClick);
      window.removeEventListener('resize', computeAnchor);
    };
  }, [updateInfo, computeAnchor]);

  useEffect(() => {
    if (!updateInfo) return;
    const timeout = setTimeout(computeAnchor, 50);
    return () => clearTimeout(timeout);
  }, [updateInfo, isVisible, computeAnchor]);

  useEffect(() => {
    return () => {
      window.dispatchEvent(new Event('xp:update-clear'));
    };
  }, []);

  if (!updateInfo) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <UpdateBalloon
      className="update-balloon"
      icon="/gui/taskbar/windows-update.png"
      iconAlt="Windows Update"
      title="Update Available"
      width={280}
      arrowOffset={140}
      anchor={anchor}
      offset={{ y: 0 }}
      placement="top"
      onClose={handleClose}
      style={anchor ? { position: 'static' } : undefined}
    >
      <p className="balloon__text">
        A new version of XPortfolio is ready to install.
      </p>
      <p className="balloon__version">
        Version {updateInfo.version} ({updateInfo.buildNumber})
      </p>
      <div className="balloon__actions">
        <button className="balloon__btn" onClick={handleReboot}>Reboot Now</button>
        <button className="balloon__btn" onClick={(e) => { e.preventDefault(); handleClose(); }}>Later</button>
      </div>
    </UpdateBalloon>
  );
}
