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
    type: 'program',
    appKey: 'Projects',
    icon: '/icons/projects.webp',
    title: 'My Projects',
    description: 'View my work',
    emphasize: true,
  },
  resume: {
    type: 'program',
    appKey: 'Resume',
    icon: '/icons/resume.webp',
    title: 'My Resume',
    description: null,
  },
  contact: {
    type: 'program',
    appKey: 'Contact',
    icon: '/icons/contact.webp',
    title: 'Contact Me',
    description: 'Send me a message',
  },
  calculator: {
    type: 'program',
    appKey: 'Calculator',
    icon: '/icons/calculator.png',
    title: 'Calculator',
    description: null,
  },
  notepad: {
    type: 'program',
    appKey: 'Notepad',
    icon: '/icons/notepad.png',
    title: 'Notepad',
    description: null,
  },
  minesweeper: {
    type: 'program',
    appKey: 'Minesweeper',
    icon: '/icons/minesweeper.png',
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
    icon: '/icons/my-computer.png',
    title: 'My Computer',
    description: null,
  },
  help: {
    type: 'program',
    appKey: 'Help and Support',
    icon: '/icons/help.png',
    title: 'Help and Support',
    description: null,
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
    icon: '/icons/folder-icon.png',
    items: ['minesweeper', 'solitaire', 'spiderSolitaire', 'pinball'],
  },
  accessories: {
    type: 'folder',
    title: 'Accessories',
    icon: '/icons/folder-icon.png',
    items: ['calculator', 'notepad', 'paint', 'cmd', 'imageViewer'],
  },
  entertainment: {
    type: 'folder',
    title: 'Entertainment',
    icon: '/icons/folder-icon.png',
    items: ['mediaPlayer', 'winamp'],
  },
};

// All Programs menu order
export const ALL_PROGRAMS_ORDER = [
  'about',
  'projects',
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
