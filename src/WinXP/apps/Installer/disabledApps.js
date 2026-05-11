import { appDataClient } from '../../../storage';

export const DISABLED_APPS_KEY = 'xportfolio-disabled-apps';

export const getDisabledApps = () => {
  try {
    const saved = localStorage.getItem(DISABLED_APPS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const loadDisabledApps = async () => {
  try {
    const saved = await appDataClient.localSettings.get(DISABLED_APPS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const saveDisabledApps = async (apps) => {
  await appDataClient.localSettings.set(DISABLED_APPS_KEY, JSON.stringify(apps));
};

export const isAppDisabled = (appKey) => {
  const disabled = getDisabledApps();
  return disabled.includes(appKey);
};
