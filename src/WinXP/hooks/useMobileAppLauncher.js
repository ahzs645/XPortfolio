import { useCallback, useMemo } from 'react';
import { ADD_APP } from '../constants/actions';
import { isMobileDevice } from '../../utils/deviceDetection';
import { getMobileConfig } from '../config/mobileConfig';

/**
 * Hook that provides a mobile-aware app launcher.
 * Wraps dispatch to automatically apply mobile fullscreen settings.
 *
 * @param {Function} dispatch - The dispatch function from useDesktopReducer
 * @returns {Object} Object containing launchApp function
 */
export function useMobileAppLauncher(dispatch) {
  const isMobile = useMemo(() => isMobileDevice(), []);

  /**
   * Launch an app with mobile-aware settings.
   * Automatically sets maximized: true for apps that should open fullscreen on mobile.
   *
   * @param {Object} appSetting - The app setting from appSettings
   * @param {string} appName - Optional name of the app (for mobile config lookup)
   */
  const launchApp = useCallback((appSetting, appName = null) => {
    if (!appSetting) return;

    let payload = appSetting;

    // Apply mobile fullscreen if on mobile device
    if (isMobile) {
      // Try to determine app name from header title if not provided
      const name = appName || appSetting.header?.title || '';
      const mobileConfig = getMobileConfig(name);

      if (mobileConfig.fullscreen && !appSetting.maximized) {
        payload = {
          ...appSetting,
          maximized: true,
        };
      }
    }

    dispatch({ type: ADD_APP, payload });
  }, [dispatch, isMobile]);

  /**
   * Create a modified app setting with mobile fullscreen applied.
   * Useful when you need to customize the payload before dispatching.
   *
   * @param {Object} appSetting - The app setting from appSettings
   * @param {string} appName - Optional name of the app (for mobile config lookup)
   * @returns {Object} Modified app setting with mobile settings applied
   */
  const applyMobileSettings = useCallback((appSetting, appName = null) => {
    if (!appSetting || !isMobile) return appSetting;

    const name = appName || appSetting.header?.title || '';
    const mobileConfig = getMobileConfig(name);

    if (mobileConfig.fullscreen && !appSetting.maximized) {
      return {
        ...appSetting,
        maximized: true,
      };
    }

    return appSetting;
  }, [isMobile]);

  return {
    launchApp,
    applyMobileSettings,
    isMobile,
  };
}

export default useMobileAppLauncher;
