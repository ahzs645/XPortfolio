import React, { createContext, useContext, useMemo } from 'react';

const RunningAppsContext = createContext(null);

export function RunningAppsProvider({ children, apps, onEndTask, onSwitchTo, showClippy, onEndClippy }) {
  const value = useMemo(() => ({
    apps,
    onEndTask,
    onSwitchTo,
    showClippy,
    onEndClippy,
  }), [apps, onEndTask, onSwitchTo, showClippy, onEndClippy]);

  return (
    <RunningAppsContext.Provider value={value}>
      {children}
    </RunningAppsContext.Provider>
  );
}

export function useRunningApps() {
  const context = useContext(RunningAppsContext);
  if (!context) {
    throw new Error('useRunningApps must be used within a RunningAppsProvider');
  }
  return context;
}

export default RunningAppsContext;
