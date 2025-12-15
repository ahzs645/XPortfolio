import { createContext, useContext, useState } from 'react';

const LauncherContext = createContext();

// Available modes:
// - 'default': Current login/progress bar mode
// - 'patchClient': Live mode showing Ravenwood News (archived patchClient)
// - 'offline': Fallback mode showing offline content

// Get initial mode from URL params or default to 'default'
function getInitialMode() {
  const validModes = ['default', 'patchClient', 'offline'];

  // Check URL parameters first
  const urlParams = new URLSearchParams(window.location.search);
  const urlMode = urlParams.get('mode');
  if (urlMode && validModes.includes(urlMode)) {
    return urlMode;
  }

  // Check for global config (can be set by parent window/iframe)
  if (window.WIZARD101_DEFAULT_MODE && validModes.includes(window.WIZARD101_DEFAULT_MODE)) {
    return window.WIZARD101_DEFAULT_MODE;
  }

  return 'default';
}

export function LauncherProvider({ children, defaultMode }) {
  const [mode, setMode] = useState(() => {
    // If defaultMode prop is provided, use it
    if (defaultMode && ['default', 'patchClient', 'offline'].includes(defaultMode)) {
      return defaultMode;
    }
    return getInitialMode();
  });

  const value = {
    mode,
    setMode,
    isDefaultMode: mode === 'default',
    isPatchClientMode: mode === 'patchClient',
    isOfflineMode: mode === 'offline',
  };

  return (
    <LauncherContext.Provider value={value}>
      {children}
    </LauncherContext.Provider>
  );
}

export function useLauncherMode() {
  const context = useContext(LauncherContext);
  if (!context) {
    throw new Error('useLauncherMode must be used within a LauncherProvider');
  }
  return context;
}
