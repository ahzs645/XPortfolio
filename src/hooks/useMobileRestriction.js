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
   */
  const checkMobileRestriction = useCallback((appName) => {
    if (!isMobile) {
      return true; // Desktop can run all apps
    }

    if (isAppMobileRestricted(appName)) {
      const info = getMobileRestrictionInfo(appName);
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
