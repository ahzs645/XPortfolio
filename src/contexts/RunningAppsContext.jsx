import React, { createContext, useContext, useMemo } from 'react';

const RunningAppsContext = createContext(null);

export function RunningAppsProvider({ children, apps, onEndTask, onSwitchTo }) {
  const value = useMemo(() => ({
    apps,
    onEndTask,
    onSwitchTo,
  }), [apps, onEndTask, onSwitchTo]);

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
