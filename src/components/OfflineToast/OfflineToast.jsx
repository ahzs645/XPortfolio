import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import Balloon from '../Balloon';
import { useUserSettings } from '../../contexts/UserSettingsContext';
import {
  dismissInstallPrompt,
  enableOfflineMode,
  disableOfflineMode,
  getState,
  promptInstall,
  subscribe,
} from '../../utils/pwaManager';

const OfflineBalloon = styled(Balloon)`
  position: fixed;
  bottom: 50px;
  right: 16px;
  z-index: 10000;
`;

const SHOW_DELAY_MS = 3000;

export default function OfflineToast() {
  const { colorDepth } = useUserSettings();
  const [state, setState] = useState(() => getState());
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => subscribe(setState), []);

  // Decide whether to show the prompt after an initial delay so the toast
  // doesn't fight with the desktop boot animation.
  useEffect(() => {
    if (!state.supported) return undefined;
    if (state.enabled) return undefined;
    if (state.promptDismissed) return undefined;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state.supported, state.enabled, state.promptDismissed]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    dismissInstallPrompt();
  }, []);

  const handleEnable = useCallback(async () => {
    setBusy(true);
    setStatus(null);
    const result = await enableOfflineMode();
    setBusy(false);
    if (result.ok) {
      setStatus('enabled');
      if (state.canInstall) {
        await promptInstall();
      }
      setTimeout(() => setVisible(false), 1200);
    } else {
      setStatus('error');
    }
  }, [state.canInstall]);

  const handleDisable = useCallback(async () => {
    setBusy(true);
    await disableOfflineMode();
    setBusy(false);
    setStatus('disabled');
  }, []);

  // Expose a manual trigger so the user can re-open the prompt from the
  // DevTools console (handy for testing and for power users).
  useEffect(() => {
    window.xportfolioOffline = {
      show: () => setVisible(true),
      hide: () => setVisible(false),
      enable: enableOfflineMode,
      disable: disableOfflineMode,
      status: getState,
    };
    return () => {
      delete window.xportfolioOffline;
    };
  }, []);

  if (!state.supported) return null;
  if (!visible) return null;

  const alreadyEnabled = state.enabled;

  return (
    <OfflineBalloon
      className="offline-balloon"
      displayColorDepth={colorDepth}
      icon="/gui/taskbar/windows-update.png"
      iconAlt="Offline mode"
      title={alreadyEnabled ? 'Offline Mode On' : 'Work Offline?'}
      width={280}
      arrowOffset={140}
      onClose={handleDismiss}
    >
      {alreadyEnabled ? (
        <>
          <p className="balloon__text">
            XPortfolio is installed and available offline. You can turn this
            off at any time.
          </p>
          <div className="balloon__actions">
            <button
              className="balloon__btn"
              onClick={handleDisable}
              disabled={busy}
            >
              Turn Off
            </button>
            <button
              className="balloon__btn"
              onClick={handleDismiss}
              disabled={busy}
            >
              Close
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="balloon__text">
            Install XPortfolio as an app and keep it usable without an
            internet connection? This is optional — the site will keep
            working as a regular web page if you decline.
          </p>
          {status === 'error' && (
            <p className="balloon__version">
              Couldn&apos;t enable offline mode. Try reloading the page.
            </p>
          )}
          <div className="balloon__actions">
            <button
              className="balloon__btn"
              onClick={handleEnable}
              disabled={busy}
            >
              {busy ? 'Enabling…' : 'Enable Offline'}
            </button>
            <button
              className="balloon__btn"
              onClick={handleDismiss}
              disabled={busy}
            >
              No Thanks
            </button>
          </div>
        </>
      )}
    </OfflineBalloon>
  );
}
