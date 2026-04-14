import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

/**
 * Reads the `?app=<name>` query parameter on mount and launches the
 * matching app via the AppContext. Used to power PWA jump-list
 * shortcuts (defined in public/manifest.webmanifest), but also works
 * as a plain deep link in a regular browser tab.
 *
 * The parameter is stripped from the URL after launch so reloads or
 * share links don't keep re-opening the same window.
 */
export default function PwaLaunchHandler() {
  const { openApp } = useApp();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let appName = null;
    try {
      const params = new URLSearchParams(window.location.search);
      appName = params.get('app');
    } catch {
      return;
    }

    if (!appName) return;

    // Defer slightly so the shell has a chance to settle before we
    // drop a window on top of the desktop.
    const timer = setTimeout(() => {
      openApp(appName);

      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('app');
        window.history.replaceState({}, '', url.toString());
      } catch {
        // Ignore history failures.
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [openApp]);

  return null;
}
