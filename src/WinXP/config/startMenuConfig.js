// Start Menu Configuration
// Maps menu items to app settings keys and defines menu structure

import { EXTERNAL_PROJECTS, DEFAULT_PROJECT_ICON } from './externalProjects';
import { APPLETS, DEFAULT_APPLET_ICON } from './applets';
import { startMenuEntries } from '../apps';

// Generate menu entries for external projects
const externalProjectEntries = EXTERNAL_PROJECTS.reduce((acc, project) => {
  acc[`project-${project.id}`] = {
    type: 'externalProject',
    projectId: `builtin-${project.id}`,
    icon: project.icon || DEFAULT_PROJECT_ICON,
    title: project.name,
    description: project.description,
  };
  return acc;
}, {});

// Generate menu entries for applets
const appletEntries = APPLETS.reduce((acc, applet) => {
  acc[`applet-${applet.id}`] = {
    type: 'externalProject', // Reuse same type - works the same way
    projectId: `applet-${applet.id}`,
    icon: applet.icon || DEFAULT_APPLET_ICON,
    title: applet.name,
    description: applet.description,
  };
  return acc;
}, {});

export const START_MENU_CATALOG = {
  ...externalProjectEntries,
  ...appletEntries,
  // Per-app program entries are co-located in each app's manifest.js and
  // assembled by the app registry.
  ...startMenuEntries,
  // Non-app entries stay curated here (folder shortcut + separators):
  "projects": {
    type: 'openFolder',
    folderId: 'projects-folder',
    appKey: 'My Computer', // Opens My Computer navigated to this folder
    icon: '/icons/xp/Briefcase.png',
    title: 'My Projects',
    description: 'View my work',
    emphasize: true,
  },
  "divider-main": {
    type: 'separator',
  },
  "divider-trailing": {
    type: 'separator',
  },
};

// Left column pinned items (white background)
export const PINNED_LEFT = [
  'projects',
  'contact',
  'divider-main',
  'about',
  'calculator',
  'notepad',
  'displayProperties',
  'paint',
];

// Right column pinned items (blue background)
export const PINNED_RIGHT = [
  'myComputer',
  'divider-main',
  'help',
  'run',
];

// Generate project folder items from external projects
const externalProjectMenuItems = EXTERNAL_PROJECTS.map(p => `project-${p.id}`);

// Generate applet menu items
const appletMenuItems = APPLETS.map(a => `applet-${a.id}`);

// Folder definitions for All Programs submenu
export const START_MENU_FOLDERS = {
  qqGames: {
    type: 'folder',
    title: 'QQ Games',
    icon: '/icons/folder-icon.png',
    items: ['qqPet13', 'qqArcade', 'qqPenguin'],
  },
  games: {
    type: 'folder',
    title: 'Games',
    icon: '/icons/folder-icon.png',
    items: ['steam', 'minesweeper', 'solitaire', 'spiderSolitaire', 'pinball', 'esheep', 'doom', 'quake', 'runescape', 'worldOfWarcraft', 'wizard101', 'legoIsland', 'diablo', 'starcraft', 'commandAndConquer', 'redAlert2', 'qqGames'],
  },
  systemTools: {
    type: 'folder',
    title: 'System Tools',
    icon: '/icons/folder-icon.png',
    items: ['aboutWindows', 'backupWizard', 'diskDefrag', 'systemInformation', 'transferWizard', 'systemRecovery'],
  },
  accessories: {
    type: 'folder',
    title: 'Accessories',
    icon: '/icons/folder-icon.png',
    items: ['calculator', 'characterMap', 'notepad', 'coder', 'wordpad', 'microsoftWord', 'microsoftExcel', 'displayProperties', 'themeSettings', 'speechProperties', 'systemProperties', 'userAccounts', 'paint', 'cmd', 'imageViewer', 'installer', 'registryEditor', 'blueScreenOfDeath', 'tour', 'systemTools'],
  },
  entertainment: {
    type: 'folder',
    title: 'Entertainment',
    icon: '/icons/folder-icon.png',
    items: ['mediaPlayer', 'mediaPlayerClassic', 'winamp', 'soundRecorder', 'volumeControl', 'soundsAndAudioDevices', 'flashPlayer'],
  },
  myProjects: {
    type: 'folder',
    title: 'My Projects',
    icon: '/icons/folder-icon.png',
    items: [...externalProjectMenuItems, ...appletMenuItems],
  },
};

// All Programs menu order
// Note: 'projects' removed - it's now a folder, not an app
// Note: QQ apps moved to Games > QQ Games subfolder
export const ALL_PROGRAMS_ORDER = [
  'internetExplorer',
  'outlookExpress',
  'adobeReader',
  // 'messenger', // disabled - kept in repo but hidden from OS
  'msnMessenger',
  'about',
  'resume',
  'contact',
  'divider-main',
  'myProjects', // folder with web projects and applets
  'accessories', // folder with Calculator, Notepad, Paint, CMD, Image Viewer
  'entertainment', // folder with Media Player
  'games', // folder with Minesweeper, Solitaire, Spider Solitaire, Pinball, QQ Games
  'divider-trailing',
  'help',
];

// Helper to get menu item by key
export function getMenuItem(key) {
  if (START_MENU_FOLDERS[key]) {
    return START_MENU_FOLDERS[key];
  }
  return START_MENU_CATALOG[key];
}

// Helper to build menu items from order array
export function buildMenuItems(orderArray) {
  return orderArray.map((key) => ({
    key,
    ...getMenuItem(key),
  })).filter(item => item.type);
}
