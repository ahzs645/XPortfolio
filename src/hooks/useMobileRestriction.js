import { useState, useCallback, useEffect } from 'react';
import {
  isMobileDevice,
  initializeDeviceDetection,
  isAppMobileRestricted,
  getMobileRestrictionInfo,
} from '../utils/deviceDetection';

/**
 * Hook for managing mobile app restrictions
 * Returns utilities to check and show mobile restriction popups
 */
export function useMobileRestriction() {
  const [popupData, setPopupData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Initialize device detection on mount
  useEffect(() => {
    initializeDeviceDetection();
    setIsMobile(isMobileDevice());
  }, []);

  /**
   * Check if an app can be launched on mobile
   * If restricted, shows the popup and returns false
   * If allowed, returns true
   *
   * @param {string} appName - The name of the app
   * @param {Object} appSetting - Optional app setting object with mobileAvailable property
   * @returns {boolean} Whether the app can be launched
   */
  const checkMobileRestriction = useCallback((appName, appSetting = null) => {
    if (!isMobile) {
      return true; // Desktop can run all apps
    }

    if (isAppMobileRestricted(appName, appSetting)) {
      const info = getMobileRestrictionInfo(appName, appSetting);
      setPopupData({
        title: info?.title || appName,
        icon: info?.icon || null,
      });
      return false; // Blocked on mobile
    }

    return true; // Not restricted
  }, [isMobile]);

  /**
   * Close the mobile restriction popup
   */
  const closePopup = useCallback(() => {
    setPopupData(null);
  }, []);

  return {
    isMobile,
    isRestrictionPopupOpen: !!popupData,
    restrictionPopupData: popupData,
    checkMobileRestriction,
    closePopup,
  };
}

export default useMobileRestriction;
