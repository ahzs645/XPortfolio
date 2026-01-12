// Start Menu Configuration
// Maps menu items to app settings keys and defines menu structure

import { EXTERNAL_PROJECTS, DEFAULT_PROJECT_ICON } from './externalProjects';
import { APPLETS, DEFAULT_APPLET_ICON } from './applets';

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
  about: {
    type: 'program',
    appKey: 'About Me',
    icon: '/icons/about.webp',
    title: 'About Me',
    description: null,
  },
  projects: {
    type: 'openFolder',
    folderId: 'projects-folder',
    appKey: 'My Computer', // Opens My Computer navigated to this folder
    icon: '/icons/xp/Briefcase.png',
    title: 'My Projects',
    description: 'View my work',
    emphasize: true,
  },
  resume: {
    type: 'program',
    appKey: 'Resume',
    icon: '/icons/pdf/PDF.ico',
    title: 'My Resume',
    description: 'View my CV',
  },
  contact: {
    type: 'program',
    appKey: 'Contact',
    icon: '/icons/outlook/write.png',
    title: 'Contact Me',
    description: 'Send me a message',
  },
  calculator: {
    type: 'program',
    appKey: 'Calculator',
    icon: '/icons/xp/Calculator.png',
    title: 'Calculator',
    description: null,
  },
  notepad: {
    type: 'program',
    appKey: 'Notepad',
    icon: '/icons/xp/Notepad.png',
    title: 'Notepad',
    description: null,
  },
  displayProperties: {
    type: 'program',
    appKey: 'Display Properties',
    icon: '/icons/xp/DisplayProperties.png',
    title: 'Display Properties',
    description: 'Change desktop background',
  },
  minesweeper: {
    type: 'program',
    appKey: 'Minesweeper',
    icon: '/icons/xp/Minesweeper.png',
    title: 'Minesweeper',
    description: null,
  },
  solitaire: {
    type: 'program',
    appKey: 'Solitaire',
    icon: '/icons/solitaire-icon.png',
    title: 'Solitaire',
    description: null,
  },
  spiderSolitaire: {
    type: 'program',
    appKey: 'Spider Solitaire',
    icon: '/icons/spider-solitaire-icon.webp',
    title: 'Spider Solitaire',
    description: null,
  },
  pinball: {
    type: 'program',
    appKey: 'Pinball',
    icon: '/icons/pinball-icon.png',
    title: '3D Pinball',
    description: null,
  },
  paint: {
    type: 'program',
    appKey: 'Paint',
    icon: '/icons/paint.webp',
    title: 'Paint',
    description: null,
  },
  cmd: {
    type: 'program',
    appKey: 'Command Prompt',
    icon: '/icons/cmd.png',
    title: 'Command Prompt',
    description: null,
  },
  mediaPlayer: {
    type: 'program',
    appKey: 'Windows Media Player',
    icon: '/icons/media-player.png',
    title: 'Windows Media Player',
    description: null,
  },
  mediaPlayerClassic: {
    type: 'program',
    appKey: 'Windows Media Player Classic',
    icon: '/icons/xp/WindowsMediaPlayer9.png',
    title: 'Windows Media Player Classic',
    description: 'Classic XP-style media player',
  },
  imageViewer: {
    type: 'program',
    appKey: 'Image Viewer',
    icon: '/apps/openlair-viewer/static/images/icon/viewer.png',
    title: 'Windows Picture and Fax Viewer',
    description: 'View images and photos',
  },
  winamp: {
    type: 'program',
    appKey: 'Winamp',
    icon: '/icons/winamp.png',
    title: 'Winamp',
    description: null,
  },
  myComputer: {
    type: 'program',
    appKey: 'My Computer',
    icon: '/icons/xp/MyComputer.png',
    title: 'My Computer',
    description: null,
  },
  internetExplorer: {
    type: 'program',
    appKey: 'Internet Explorer',
    icon: '/icons/xp/InternetExplorer6.png',
    title: 'Internet Explorer',
    description: 'Browse the web',
  },
  help: {
    type: 'program',
    appKey: 'Help and Support',
    icon: '/icons/help.png',
    title: 'Help and Support',
    description: null,
  },
  soundRecorder: {
    type: 'program',
    appKey: 'Sound Recorder',
    icon: '/icons/xp/SoundRecorder.webp',
    title: 'Sound Recorder',
    description: null,
  },
  qqPenguin: {
    type: 'program',
    appKey: 'QQ Penguin',
    icon: '/icons/qqpet.ico',
    title: 'QQ Pet',
    description: 'Virtual pet app',
  },
  qqPet13: {
    type: 'program',
    appKey: 'QQ Pet 13',
    icon: '/games/QQPet13/logo.png',
    title: 'QQ Pet 13',
    description: 'HTML5 virtual pet',
  },
  qqArcade: {
    type: 'program',
    appKey: 'QQ Arcade',
    icon: '/games/QQArcade/icon.png',
    title: 'QQ Arcade',
    description: '29 classic mini-games',
  },
  installer: {
    type: 'program',
    appKey: 'App Installer',
    icon: '/icons/xp/Programs.png',
    title: 'App Installer',
    description: 'Install web apps',
  },
  messenger: {
    type: 'program',
    appKey: 'Windows Messenger',
    icon: '/icons/xp/messenger.png',
    title: 'Windows Messenger',
    description: 'Instant messaging',
  },
  msnMessenger: {
    type: 'program',
    appKey: 'MSN Messenger',
    icon: '/icons/xp/messenger.png',
    title: 'MSN Messenger',
    description: 'Chat with Chatango',
  },
  speechProperties: {
    type: 'program',
    appKey: 'Speech Properties',
    icon: '/icons/xp/speech.png',
    title: 'Speech Properties',
    description: 'Text-to-speech settings',
  },
  systemProperties: {
    type: 'program',
    appKey: 'System Properties',
    icon: '/icons/xp/system.png',
    title: 'System Properties',
    description: 'View system information',
  },
  systemRecovery: {
    type: 'program',
    appKey: 'System Recovery',
    icon: '/icons/xp/Recovery.png',
    title: 'System Recovery',
    description: 'Reset all settings',
  },
  wordpad: {
    type: 'program',
    appKey: 'WordPad',
    icon: '/icons/xp/wordpad.png',
    title: 'WordPad',
    description: 'Rich text editor',
  },
  microsoftWord: {
    type: 'program',
    appKey: 'Microsoft Word',
    icon: '/icons/xp/MSWord.png',
    title: 'Microsoft Word',
    description: 'Word processor',
  },
  microsoftExcel: {
    type: 'program',
    appKey: 'Microsoft Excel',
    icon: '/icons/xp/MSExcel.gif',
    title: 'Microsoft Excel',
    description: 'Spreadsheet editor',
  },
  userAccounts: {
    type: 'program',
    appKey: 'User Accounts',
    icon: '/icons/xp/UserAccounts.png',
    title: 'User Accounts',
    description: 'Manage user accounts',
  },
  outlookExpress: {
    type: 'program',
    appKey: 'Outlook Express',
    icon: '/icons/outlook/outlook.png',
    title: 'Outlook Express',
    description: 'Read email messages',
  },
  adobeReader: {
    type: 'program',
    appKey: 'Adobe Reader',
    icon: '/icons/pdf/acroaum_grp107_lang1033.ico',
    title: 'Adobe Reader',
    description: 'View PDF files',
  },
  backupWizard: {
    type: 'program',
    appKey: 'Backup Wizard',
    icon: '/icons/xp/tray/backup.png',
    title: 'Backup',
    description: 'Backup or restore files',
  },
  transferWizard: {
    type: 'program',
    appKey: 'Transfer Wizard',
    icon: '/icons/xp/tray/migrate.png',
    title: 'Files and Settings Transfer Wizard',
    description: 'Transfer your environment',
  },
  flashPlayer: {
    type: 'program',
    appKey: 'Adobe Flash Player',
    icon: '/icons/flash/flash_player.png',
    title: 'Adobe Flash Player',
    description: 'Play Flash content with Ruffle',
  },
  worldOfWarcraft: {
    type: 'program',
    appKey: 'World of Warcraft',
    icon: '/icons/games/wow.webp',
    title: 'World of Warcraft',
    description: 'Classic WoW login screen',
  },
  runescape: {
    type: 'program',
    appKey: 'RuneScape Classic',
    icon: '/icons/runescape-icon.png',
    title: 'RuneScape Classic',
    description: 'Offline singleplayer RSC',
  },
  wizard101: {
    type: 'program',
    appKey: 'Wizard101',
    icon: '/apps/wizard101/images/icon.ico',
    title: 'Wizard101',
    description: 'Wizard101 Game Launcher',
  },
  legoIsland: {
    type: 'program',
    appKey: 'LEGO Island',
    icon: '/icons/games/lego-island.webp',
    title: 'LEGO Island',
    description: 'Classic LEGO adventure game',
  },
  diablo: {
    type: 'program',
    appKey: 'Diablo',
    icon: '/icons/games/diablo.png',
    title: 'Diablo',
    description: 'Blizzard action RPG',
  },
  starcraft: {
    type: 'program',
    appKey: 'StarCraft',
    icon: '/icons/games/starcraft.png',
    title: 'StarCraft',
    description: 'Blizzard real-time strategy',
  },
  run: {
    type: 'program',
    appKey: 'Run',
    icon: '/icons/luna/run.png',
    title: 'Run...',
    description: 'Open a program or file',
  },
  'divider-main': {
    type: 'separator',
  },
  'divider-trailing': {
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
    items: ['minesweeper', 'solitaire', 'spiderSolitaire', 'pinball', 'runescape', 'worldOfWarcraft', 'wizard101', 'legoIsland', 'diablo', 'starcraft', 'qqGames'],
  },
  systemTools: {
    type: 'folder',
    title: 'System Tools',
    icon: '/icons/folder-icon.png',
    items: ['backupWizard', 'transferWizard', 'systemRecovery'],
  },
  accessories: {
    type: 'folder',
    title: 'Accessories',
    icon: '/icons/folder-icon.png',
    items: ['calculator', 'notepad', 'wordpad', 'microsoftWord', 'microsoftExcel', 'displayProperties', 'speechProperties', 'systemProperties', 'userAccounts', 'paint', 'cmd', 'imageViewer', 'installer', 'systemTools'],
  },
  entertainment: {
    type: 'folder',
    title: 'Entertainment',
    icon: '/icons/folder-icon.png',
    items: ['mediaPlayer', 'mediaPlayerClassic', 'winamp', 'soundRecorder', 'flashPlayer'],
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
  'messenger',
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
