// External Projects Configuration
// Add your GitHub Pages projects here - they will appear as installable apps

/**
 * External Project Entry Structure:
 * {
 *   id: string,           // Unique identifier (used internally)
 *   name: string,         // Display name
 *   url: string,          // Project URL (GitHub Pages, custom domain, etc.)
 *   icon: string,         // Icon path (place custom icons in /public/icons/projects/)
 *   description: string,  // Short description
 *   category: string,     // Category for organization: 'tool', 'visualization', 'game', 'utility', 'experiment'
 *   version: string,      // Version number (e.g., '1.0.0')
 *   author: string,       // Author name
 *   size: number,         // Estimated size in bytes (for display in Add/Remove Programs)
 *   releaseDate: string,  // ISO date string for when the project was released/installed
 *   windowSettings: {     // Optional window configuration
 *     width: number,
 *     height: number,
 *     resizable: boolean,
 *     mobileAvailable: boolean,   // Whether the app can run on mobile (default: true)
 *     mobileFullscreen: boolean,  // Whether to open fullscreen on mobile (default: true)
 *   }
 * }
 */

export const EXTERNAL_PROJECTS = [
  {
    id: 'webforms',
    name: 'Web Forms',
    url: 'https://projects.ahmadjalil.com/webforms/',
    icon: '/icons/projects/webforms.png',
    description: 'Dynamic web forms application for creating and managing online forms with validation',
    category: 'tool',
    version: '2.1.0',
    author: 'Ahmad Jalil',
    size: 856000, // ~856 KB
    releaseDate: '2024-03-15',
    windowSettings: { width: 900, height: 650, resizable: true },
  },
  {
    id: 'unbc-door',
    name: 'UNBC Door',
    url: 'https://projects.ahmadjalil.com/UNBCDoor/',
    icon: '/icons/projects/unbc-door.png',
    description: 'UNBC Door access monitoring and control system interface',
    category: 'tool',
    version: '1.2.0',
    author: 'Ahmad Jalil',
    size: 425000, // ~425 KB
    releaseDate: '2024-01-20',
    windowSettings: { width: 800, height: 600, resizable: true },
  },
  {
    id: 'proxmark3',
    name: 'Proxmark3 Web Client',
    url: 'https://projects.ahmadjalil.com/proxmark3-web-client/',
    icon: '/icons/projects/proxmark3.png',
    description: 'Web-based client for Proxmark3 RFID/NFC research tool with Serial API support',
    category: 'tool',
    version: '1.0.5',
    author: 'Ahmad Jalil',
    size: 1240000, // ~1.24 MB
    releaseDate: '2024-06-10',
    windowSettings: { width: 1000, height: 700, resizable: true, mobileAvailable: false },  // Requires Serial API
  },
  {
    id: 'air-quality',
    name: 'Air Quality Monitor',
    url: 'https://air.ahmadjalil.com/',
    icon: '/icons/projects/air.png',
    description: 'Real-time air quality monitoring and visualization dashboard with historical data',
    category: 'visualization',
    version: '1.5.0',
    author: 'Ahmad Jalil',
    size: 1560000, // ~1.56 MB
    releaseDate: '2024-04-22',
    windowSettings: { width: 1000, height: 700, resizable: true },
  },
  {
    id: 'water-viz',
    name: 'UNBC Water Viz',
    url: 'https://unbcwaterviz.ahmadjalil.com/',
    icon: '/icons/projects/water.png',
    description: 'Interactive visualization of UNBC water quality and flow data with charts and maps',
    category: 'visualization',
    version: '2.0.0',
    author: 'Ahmad Jalil',
    size: 2100000, // ~2.1 MB
    releaseDate: '2024-05-18',
    windowSettings: { width: 1100, height: 750, resizable: true },
  },
  {
    id: 'forest',
    name: 'Forest',
    url: 'https://projects.ahmadjalil.com/forest/',
    icon: '/icons/projects/forest.png',
    description: 'Interactive 3D forest ecosystem visualization and simulation',
    category: 'visualization',
    version: '1.1.0',
    author: 'Ahmad Jalil',
    size: 3200000, // ~3.2 MB
    releaseDate: '2024-02-28',
    windowSettings: { width: 1000, height: 700, resizable: true },
  },
  {
    id: '3d-portfolio',
    name: '3D Portfolio',
    url: 'https://3d.ahmadjalil.com/',
    icon: '/icons/projects/3d.png',
    description: 'Immersive 3D portfolio experience built with Three.js and WebGL',
    category: 'experiment',
    version: '1.3.0',
    author: 'Ahmad Jalil',
    size: 4500000, // ~4.5 MB
    releaseDate: '2024-07-05',
    windowSettings: { width: 1100, height: 750, resizable: true },
  },
  {
    id: 'iconex',
    name: 'Icon Extractor',
    url: 'https://projects.ahmadjalil.com/iconex/',
    icon: '/icons/projects/iconex.png',
    description: 'Extract and download icons from websites, favicons, and image files',
    category: 'utility',
    version: '1.0.2',
    author: 'Ahmad Jalil',
    size: 320000, // ~320 KB
    releaseDate: '2024-08-12',
    windowSettings: { width: 800, height: 600, resizable: true },
  },
];

// Category definitions for organization
export const PROJECT_CATEGORIES = {
  tool: { name: 'Tools', icon: '/icons/xp/Programs.png' },
  visualization: { name: 'Visualizations', icon: '/icons/xp/Chart.png' },
  game: { name: 'Games', icon: '/icons/xp/Games.png' },
  utility: { name: 'Utilities', icon: '/icons/xp/Utilities.png' },
  experiment: { name: 'Experiments', icon: '/icons/xp/Search.png' },
};

// Default icon for projects without custom icons
export const DEFAULT_PROJECT_ICON = '/icons/xp/Programs.png';

// Helper to get project by ID
export const getProjectById = (id) => {
  return EXTERNAL_PROJECTS.find(p => p.id === id);
};

// Helper to get projects by category
export const getProjectsByCategory = (category) => {
  return EXTERNAL_PROJECTS.filter(p => p.category === category);
};

// Get all project IDs
export const getAllProjectIds = () => {
  return EXTERNAL_PROJECTS.map(p => p.id);
};
