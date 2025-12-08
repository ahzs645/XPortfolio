// Applets Configuration
// Add your applets here - they all share the base URL with different hash routes

const APPLETS_BASE_URL = 'https://projects.ahmadjalil.com/applets/';

/**
 * Applet Entry Structure:
 * {
 *   id: string,        // Unique identifier
 *   name: string,      // Display name
 *   route: string,     // Hash route (e.g., '#/raincheck')
 *   icon: string,      // SVG as data URI or path to icon file
 *   description: string,
 *   version: string,   // Version number (e.g., '1.0.0')
 *   author: string,    // Author name
 *   size: number,      // Estimated size in bytes
 *   releaseDate: string, // ISO date string for when the applet was released
 *   windowSettings: { width, height, resizable }
 * }
 */

// SVG icons as data URIs - add your applet icons here
const APPLET_ICONS = {
  raincheck: `data:image/svg+xml,${encodeURIComponent(`<svg viewBox="0 0 24 24" fill="none" stroke="#4a90d9" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v2m3-3v3m3-2v2"/></svg>`)}`,
  // Add more icons here as you create applets:
  // myapplet: `data:image/svg+xml,${encodeURIComponent(`<svg>...</svg>`)}`,
};

// Default icon for applets without a custom icon
const DEFAULT_APPLET_ICON = `data:image/svg+xml,${encodeURIComponent(`<svg viewBox="0 0 24 24" fill="none" stroke="#4a90d9" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6M12 9v6"/></svg>`)}`;

export const APPLETS = [
  {
    id: 'raincheck',
    name: 'Rain Check Generator',
    route: '#/raincheck',
    icon: APPLET_ICONS.raincheck,
    description: 'Generate and print rain check vouchers for customers',
    version: '1.0.0',
    author: 'Ahmad Jalil',
    size: 125000, // ~125 KB
    releaseDate: '2024-09-01',
    windowSettings: { width: 500, height: 600, resizable: true },
  },
  // Add more applets here:
  // {
  //   id: 'myapplet',
  //   name: 'My Applet',
  //   route: '#/myapplet',
  //   icon: APPLET_ICONS.myapplet || DEFAULT_APPLET_ICON,
  //   description: 'Description here',
  //   version: '1.0.0',
  //   author: 'Ahmad Jalil',
  //   size: 100000,
  //   releaseDate: '2024-01-01',
  //   windowSettings: { width: 500, height: 400, resizable: true },
  // },
];

// Helper to get full URL for an applet
export const getAppletUrl = (applet) => `${APPLETS_BASE_URL}${applet.route}`;

// Helper to get applet by ID
export const getAppletById = (id) => APPLETS.find(a => a.id === id);

// Export base URL and default icon for use elsewhere
export { APPLETS_BASE_URL, DEFAULT_APPLET_ICON, APPLET_ICONS };
