import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { useUserSettings } from './UserSettingsContext';

const ScreensaverContext = createContext(null);

export function useScreensaver() {
  const context = useContext(ScreensaverContext);
  if (!context) {
    throw new Error('useScreensaver must be used within a ScreensaverProvider');
  }
  return context;
}

const SCREENSAVER_EMBEDS = {
  pipes: '/screensavers/pipes/index.html',
  flowerbox: '/screensavers/flowerbox/index.html',
  windows: '/screensavers/canvas/windows.html',
  starfield: '/screensavers/canvas/starfield.html',
  mystify: '/screensavers/canvas/mystify.html',
  ribbons: '/screensavers/canvas/ribbons.html',
  balls: '/screensavers/canvas/balls.html',
  matrix: '/screensavers/canvas/matrix.html',
  rain: '/screensavers/canvas/rain.html',
  blank: '/screensavers/canvas/blank.html',
};

export function ScreensaverProvider({ children }) {
  // Use per-user settings from UserSettingsContext
  const { getScreensaverSettings, setScreensaverSettings } = useUserSettings();
  const settings = getScreensaverSettings();
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef(null);

  // Derived values from settings
  const screensaverName = settings.name;
  const waitMinutes = settings.waitMinutes;
  const enabled = settings.enabled;

  // Setters that update config
  const setScreensaverName = useCallback((name) => {
    setScreensaverSettings({ name });
  }, [setScreensaverSettings]);

  const setWaitMinutes = useCallback((minutes) => {
    setScreensaverSettings({ waitMinutes: minutes });
  }, [setScreensaverSettings]);

  const setEnabled = useCallback((value) => {
    setScreensaverSettings({ enabled: value });
  }, [setScreensaverSettings]);

  const clearScreensaver = useCallback(() => {
    setIsActive(false);
  }, []);

  const showScreensaver = useCallback(() => {
    if (!screensaverName || screensaverName === 'none' || !enabled) return;
    setIsActive(true);
  }, [screensaverName, enabled]);

  const resetCountdown = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (enabled && screensaverName && screensaverName !== 'none') {
      timeoutRef.current = setTimeout(showScreensaver, waitMinutes * 60 * 1000);
    }
  }, [waitMinutes, showScreensaver, enabled, screensaverName]);

  const handleUserActivity = useCallback(() => {
    if (isActive) {
      clearScreensaver();
    }
    resetCountdown();
  }, [isActive, clearScreensaver, resetCountdown]);

  // Set up activity listeners
  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Start initial countdown
    resetCountdown();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, handleUserActivity, resetCountdown]);

  // Reset countdown when settings change
  useEffect(() => {
    resetCountdown();
  }, [screensaverName, waitMinutes, resetCountdown]);

  const previewScreensaver = useCallback(() => {
    if (!screensaverName || screensaverName === 'none') return;
    setIsActive(true);
  }, [screensaverName]);

  const value = {
    screensaverName,
    setScreensaverName,
    waitMinutes,
    setWaitMinutes,
    isActive,
    enabled,
    setEnabled,
    previewScreensaver,
    clearScreensaver,
    getEmbedUrl: (name) => SCREENSAVER_EMBEDS[name] || null,
  };

  return (
    <ScreensaverContext.Provider value={value}>
      {children}
      {isActive && screensaverName && screensaverName !== 'none' && createPortal(
        <ScreensaverOverlay
          onClick={clearScreensaver}
          onKeyDown={clearScreensaver}
          tabIndex={-1}
        >
          {SCREENSAVER_EMBEDS[screensaverName] ? (
            <ScreensaverFrame
              src={SCREENSAVER_EMBEDS[screensaverName]}
              title={`${screensaverName} screensaver`}
            />
          ) : (
            <BlackScreen />
          )}
        </ScreensaverOverlay>,
        document.body
      )}
    </ScreensaverContext.Provider>
  );
}

const ScreensaverOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #000;
  cursor: none;
  outline: none;
`;

const ScreensaverFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  pointer-events: none;
`;

const BlackScreen = styled.div`
  width: 100%;
  height: 100%;
  background: #000;
`;

export default ScreensaverContext;
