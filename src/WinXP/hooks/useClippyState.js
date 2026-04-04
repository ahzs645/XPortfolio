import { useState, useCallback } from 'react';

/**
 * Manages Clippy assistant visibility state, including mobile-specific hiding.
 */
export function useClippyState() {
  const [showClippy, setShowClippy] = useState(true);
  const [clippyHiddenOnMobile, setClippyHiddenOnMobile] = useState(() => {
    try {
      const saved = localStorage.getItem('xp-clippy-hidden-mobile');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const handleEndClippy = useCallback(() => {
    setShowClippy(false);
  }, []);

  const handleHideClippyMobile = useCallback(() => {
    setClippyHiddenOnMobile(true);
    try {
      localStorage.setItem('xp-clippy-hidden-mobile', 'true');
    } catch (e) {
      console.error('Failed to save Clippy mobile preference:', e);
    }
  }, []);

  const handleShowClippyMobile = useCallback(() => {
    setClippyHiddenOnMobile(false);
    try {
      localStorage.removeItem('xp-clippy-hidden-mobile');
    } catch (e) {
      console.error('Failed to clear Clippy mobile preference:', e);
    }
  }, []);

  return {
    showClippy,
    clippyHiddenOnMobile,
    handleEndClippy,
    handleHideClippyMobile,
    handleShowClippyMobile,
  };
}
