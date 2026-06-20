// App registry.
//
// Every app describes itself in a co-located `<Folder>/manifest.js`. This file
// globs those manifests and assembles the derived maps the shell consumes
// (appSettings, desktopIconCatalog, category map, icon state). Adding an app is
// just dropping in a folder with a manifest — no edits here.
//
// Manifest shape (see any apps/*/manifest.js):
//   export default {
//     apps:           { [appKey]: windowSettings },   // -> appSettings
//     icons:          { [catalogId]: iconEntry },      // -> desktopIconCatalog
//     catalogTargets: { [catalogId]: appKey },         // catalog id -> launch key
//     categories:     { [appKey]: category },          // -> appCategoryMap
//   }

const manifestModules = import.meta.glob('./*/manifest.js', { eager: true });

// App categories for organization
export const APP_CATEGORIES = {
  SYSTEM: 'system',         // Windows system apps (Control Panel, User Accounts, etc.)
  ACCESSORY: 'accessory',   // Windows accessories (Notepad, Calculator, Paint, etc.)
  GAME: 'game',             // Games (Minesweeper, Solitaire, Pinball, etc.)
  MEDIA: 'media',           // Media apps (Media Player, Winamp, Sound Recorder)
  INTERNET: 'internet',     // Internet apps (Internet Explorer, Outlook, Messenger)
  PORTFOLIO: 'portfolio',   // Portfolio apps (About Me, Resume, Contact, Projects)
  UTILITY: 'utility',       // Utilities and dialogs
};

// Catalog targets / categories that aren't owned by any single app folder
// (catalog ids with no desktop icon, or category names that don't match an
// appSettings key). Kept here so the assembled maps exactly match the legacy.
const EXTRA_CATALOG_TARGETS = {
  themeSettings: 'Theme Settings',
  esheep: 'eSheep',
  diskDefrag: 'Disk Defragmenter',
  characterMap: 'Character Map',
  aboutWindows: 'About Windows',
  volumeControl: 'Volume Control',
};
const EXTRA_CATEGORIES = {
  'Control Panel': APP_CATEGORIES.SYSTEM,
  'Date/Time Properties': APP_CATEGORIES.SYSTEM,
};

// Assemble the registry from every manifest.
export const appSettings = {};
export const desktopIconCatalog = {};
export const appCategoryMap = {};
// Per-app Start Menu entry definitions (icon/title/description). Placement
// (order, folder membership, pins) stays curated in config/startMenuConfig.js.
export const startMenuEntries = {};
const CATALOG_TO_APP_KEY = {};

for (const mod of Object.values(manifestModules)) {
  const manifest = mod.default;
  if (!manifest) continue;
  Object.assign(appSettings, manifest.apps);
  Object.assign(desktopIconCatalog, manifest.icons);
  Object.assign(CATALOG_TO_APP_KEY, manifest.catalogTargets);
  Object.assign(appCategoryMap, manifest.categories);
  Object.assign(startMenuEntries, manifest.startMenu);
}
Object.assign(CATALOG_TO_APP_KEY, EXTRA_CATALOG_TARGETS);
Object.assign(appCategoryMap, EXTRA_CATEGORIES);

// Helper to get app category
export const getAppCategory = (appName) => {
  return appCategoryMap[appName] || APP_CATEGORIES.UTILITY;
};

// Get all apps by category
export const getAppsByCategory = (category) => {
  return Object.entries(appCategoryMap)
    .filter(([, cat]) => cat === category)
    .map(([name]) => name);
};

// Default apps open on startup (empty for now - user opens via desktop icons)
export const defaultAppState = [];

// Load saved icon positions from localStorage
function loadIconPositions() {
  try {
    const saved = localStorage.getItem('desktopIconPositions');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Save icon positions to localStorage
export function saveIconPositions(icons) {
  const positions = {};
  icons.forEach((icon) => {
    if (icon.x !== undefined && icon.y !== undefined) {
      positions[icon.programId] = { x: icon.x, y: icon.y };
    }
  });
  localStorage.setItem('desktopIconPositions', JSON.stringify(positions));
}

// Generate desktop icon state from program list
export function generateIconState(programIds = ['about', 'resume', 'projects', 'contact']) {
  const savedPositions = loadIconPositions();
  const iconSize = 80; // Icon height including text
  const iconGap = 10;
  const startX = 10;
  const startY = 10;

  // System icons (My Computer, Recycle Bin) get type 'system', others get 'shortcut'
  const systemIconIds = ['myComputer', 'recycleBin'];

  return programIds
    .map((id, index) => {
      const catalogEntry = desktopIconCatalog[id];
      if (!catalogEntry) return null;

      // Use saved position or calculate default grid position
      const savedPos = savedPositions[id];
      const defaultY = startY + index * (iconSize + iconGap);
      const isSystem = systemIconIds.includes(id);

      return {
        id: index,
        programId: id, // Keep track of program ID for saving positions
        icon: catalogEntry.icon,
        title: catalogEntry.title,
        component: catalogEntry.component,
        isFocus: false,
        x: savedPos?.x ?? startX,
        y: savedPos?.y ?? defaultY,
        type: isSystem ? 'system' : 'shortcut',
        target: CATALOG_TO_APP_KEY[id] || catalogEntry.title,
      };
    })
    .filter(Boolean);
}

// Default desktop icons (fallback)
export const defaultIconState = generateIconState(['myComputer', 'recycleBin', 'internetExplorer', 'about', 'resume', 'projects', 'contact', 'calculator', 'minesweeper', 'blueScreenOfDeath']);
