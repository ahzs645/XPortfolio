import { useEffect } from 'react';
import { ADD_APP } from '../constants/actions';
import { BOOT_STATE } from '../constants';

/**
 * Global keyboard shortcuts for the WinXP desktop.
 * Win+R → Run, Win+E → Explorer, Win+D → Show Desktop,
 * CrashOnCtrlScroll → BSOD (when registry value is set).
 */
export function useKeyboardShortcuts({ bootState, dispatch, applyMobileSettings, appSettings, getValue }) {
  // Global keyboard shortcuts (Win+R for Run, Win+E for Explorer, Win+D for Show Desktop)
  useEffect(() => {
    if (bootState !== BOOT_STATE.DESKTOP) return;

    function handleKeyDown(e) {
      // Don't intercept if user is typing in an input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

      // Win+R → Run Dialog
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        const runSetting = appSettings['Run'];
        if (runSetting) {
          dispatch({ type: ADD_APP, payload: applyMobileSettings(runSetting, 'Run') });
        }
      }
      // Win+E → My Computer (Explorer)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        const explorerSetting = appSettings['My Computer'];
        if (explorerSetting) {
          dispatch({ type: ADD_APP, payload: applyMobileSettings(explorerSetting, 'My Computer') });
        }
      }
      // Win+D → Show Desktop (minimize all)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        dispatch({ type: 'MINIMIZE_ALL_APPS' });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bootState, dispatch, applyMobileSettings, appSettings]);

  // CrashOnCtrlScroll: Ctrl + ScrollLock + ScrollLock triggers BSOD
  // Mimics real Windows XP behavior when CrashOnCtrlScroll registry value is set to 1
  useEffect(() => {
    if (bootState !== BOOT_STATE.DESKTOP) return;

    let scrollLockCount = 0;
    let scrollLockTimer = null;

    function handleKeyDown(e) {
      // Check if CrashOnCtrlScroll is enabled in the registry
      const crashValue = getValue(
        'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\i8042prt\\Parameters',
        'CrashOnCtrlScroll'
      );
      if (!crashValue || crashValue.data !== 1) return;

      // ScrollLock key while Ctrl is held
      if (e.key === 'ScrollLock' && e.ctrlKey) {
        scrollLockCount++;

        if (scrollLockTimer) clearTimeout(scrollLockTimer);
        // Reset count if second press doesn't come within 2 seconds
        scrollLockTimer = setTimeout(() => { scrollLockCount = 0; }, 2000);

        if (scrollLockCount >= 2) {
          scrollLockCount = 0;
          if (scrollLockTimer) clearTimeout(scrollLockTimer);
          // Trigger BSOD
          const bsodSetting = appSettings['Blue Screen of Death'];
          if (bsodSetting) {
            dispatch({ type: ADD_APP, payload: bsodSetting });
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (scrollLockTimer) clearTimeout(scrollLockTimer);
    };
  }, [bootState, dispatch, getValue, appSettings]);
}
