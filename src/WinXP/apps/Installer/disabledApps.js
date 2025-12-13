export const DISABLED_APPS_KEY = 'xportfolio-disabled-apps';

export const getDisabledApps = () => {
  try {
    const saved = localStorage.getItem(DISABLED_APPS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const isAppDisabled = (appKey) => {
  const disabled = getDisabledApps();
  return disabled.includes(appKey);
};

