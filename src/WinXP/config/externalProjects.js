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
 *   windowSettings: {     // Optional window configuration
 *     width: number,
 *     height: number,
 *     resizable: boolean,
 *   }
 * }
 */

export const EXTERNAL_PROJECTS = [
  {
    id: 'webforms',
    name: 'Web Forms',
    url: 'https://projects.ahmadjalil.com/webforms/',
    icon: '/icons/projects/webforms.png',
    description: 'Web forms application',
    category: 'tool',
    windowSettings: { width: 900, height: 650, resizable: true },
  },
  {
    id: 'unbc-door',
    name: 'UNBC Door',
    url: 'https://projects.ahmadjalil.com/UNBCDoor/',
    icon: '/icons/projects/unbc-door.png',
    description: 'UNBC Door access system',
    category: 'tool',
    windowSettings: { width: 800, height: 600, resizable: true },
  },
  {
    id: 'proxmark3',
    name: 'Proxmark3 Web Client',
    url: 'https://projects.ahmadjalil.com/proxmark3-web-client/',
    icon: '/icons/projects/proxmark3.png',
    description: 'Web client for Proxmark3 RFID tool',
    category: 'tool',
    windowSettings: { width: 1000, height: 700, resizable: true },
  },
  {
    id: 'air-quality',
    name: 'Air Quality Monitor',
    url: 'https://air.ahmadjalil.com/',
    icon: '/icons/projects/air.png',
    description: 'Air quality monitoring visualization',
    category: 'visualization',
    windowSettings: { width: 1000, height: 700, resizable: true },
  },
  {
    id: 'water-viz',
    name: 'UNBC Water Viz',
    url: 'https://unbcwaterviz.ahmadjalil.com/',
    icon: '/icons/projects/water.png',
    description: 'UNBC water data visualization',
    category: 'visualization',
    windowSettings: { width: 1100, height: 750, resizable: true },
  },
  {
    id: 'forest',
    name: 'Forest',
    url: 'https://projects.ahmadjalil.com/forest/',
    icon: '/icons/projects/forest.png',
    description: 'Forest visualization project',
    category: 'visualization',
    windowSettings: { width: 1000, height: 700, resizable: true },
  },
  {
    id: '3d-portfolio',
    name: '3D Portfolio',
    url: 'https://3d.ahmadjalil.com/',
    icon: '/icons/projects/3d.png',
    description: '3D portfolio experience',
    category: 'experiment',
    windowSettings: { width: 1100, height: 750, resizable: true },
  },
  {
    id: 'iconex',
    name: 'Icon Extractor',
    url: 'https://projects.ahmadjalil.com/iconex/',
    icon: '/icons/projects/iconex.png',
    description: 'Icon extractor utility',
    category: 'utility',
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
