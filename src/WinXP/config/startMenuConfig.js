// Start Menu Configuration
// Maps menu items to app settings keys and defines menu structure

export const START_MENU_CATALOG = {
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
  imageViewer: {
    type: 'program',
    appKey: 'Image Viewer',
    icon: '/icons/image-viewer.png',
    title: 'Picture and Fax Viewer',
    description: null,
  },
  classicViewer: {
    type: 'program',
    appKey: 'Classic Picture Viewer',
    icon: '/apps/openlair-viewer/static/images/icon/viewer.png',
    title: 'Picture and Fax Viewer (Classic)',
    description: 'Static OpenLair port',
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
];

// Folder definitions for All Programs submenu
export const START_MENU_FOLDERS = {
  games: {
    type: 'folder',
    title: 'Games',
    icon: '/icons/xp/FolderClosed.png',
    items: ['minesweeper', 'solitaire', 'spiderSolitaire', 'pinball'],
  },
  accessories: {
    type: 'folder',
    title: 'Accessories',
    icon: '/icons/xp/FolderClosed.png',
    items: ['calculator', 'notepad', 'wordpad', 'displayProperties', 'speechProperties', 'systemProperties', 'systemRecovery', 'userAccounts', 'paint', 'cmd', 'imageViewer', 'classicViewer', 'installer'],
  },
  entertainment: {
    type: 'folder',
    title: 'Entertainment',
    icon: '/icons/xp/FolderClosed.png',
    items: ['mediaPlayer', 'winamp', 'soundRecorder'],
  },
};

// All Programs menu order
// Note: 'projects' removed - it's now a folder, not an app
export const ALL_PROGRAMS_ORDER = [
  'internetExplorer',
  'outlookExpress',
  'adobeReader',
  'messenger',
  'qqPenguin',
  'about',
  'resume',
  'contact',
  'divider-main',
  'accessories', // folder with Calculator, Notepad, Paint, CMD, Image Viewer
  'entertainment', // folder with Media Player
  'games', // folder with Minesweeper, Solitaire, Spider Solitaire, Pinball
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
