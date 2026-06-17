import { useEffect } from 'react';
import cursorManager from '../../utils/cursorManager';

/**
 * Shows the wait/progress cursor while something is loading instead of a
 * visible loading screen. When `isLoading` flips to false the cursor is
 * restored, revealing the app underneath.
 *
 * @param {boolean} isLoading - Whether the app/content is still loading.
 */
export default function useLoadingCursor(isLoading) {
  useEffect(() => {
    if (!isLoading) return undefined;

    const modeToken = cursorManager.pushMode('progress');
    return () => modeToken.release();
  }, [isLoading]);
}
