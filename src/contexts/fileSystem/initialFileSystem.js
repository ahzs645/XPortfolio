import { XP_ICONS, SYSTEM_IDS, fileIcons, SHORTCUT_SIZE } from './constants';
import { createProjectFolderItems } from './projectHelpers';

// Program definitions for Program Files folder
// Each program has a folder containing an executable that launches the app
export const PROGRAM_FILES_PROGRAMS = [
  { id: 'pf-adobe-reader', name: 'Adobe Reader', icon: '/icons/pdf/acroaum_grp107_lang1033.ico', exe: 'AcroRd32.exe', target: 'Adobe Reader' },
  { id: 'pf-internet-explorer', name: 'Internet Explorer', icon: '/icons/xp/InternetExplorer6.png', exe: 'iexplore.exe', target: 'Internet Explorer' },
  { id: 'pf-windows-media-player', name: 'Windows Media Player', icon: '/icons/xp/WindowsMediaPlayer9.png', exe: 'wmplayer.exe', target: 'Windows Media Player' },
  { id: 'pf-winamp', name: 'Winamp', icon: '/icons/winamp.png', exe: 'winamp.exe', target: 'Winamp' },
  { id: 'pf-messenger', name: 'Windows Messenger', icon: '/icons/xp/messenger.png', exe: 'msmsgs.exe', target: 'Windows Messenger' },
];

// Sample Music files for My Music folder
export const SAMPLE_MUSIC_FILES = [
  { id: 'sample-music-1', name: 'Beethoven\'s Symphony No. 9 (Scherzo).mp3', path: '/content/sample-music/Beethovens Symphony No. 9 (Scherzo).mp3', size: 1318855 },
  { id: 'sample-music-2', name: 'David Byrne - Like Humans Do.mp3', path: '/content/sample-music/David Byrne - Like Humans Do.mp3', size: 3709306 },
  { id: 'sample-music-3', name: 'New Stories - Highway Blues.mp3', path: '/content/sample-music/New Stories - Highway Blues.mp3', size: 1696965 },
];

// Initial file system structure
export const createInitialFileSystem = (desktopShortcuts, projects = [], userName = 'User') => {
  const now = Date.now();

  // Create shortcut entries from provided list
  const shortcuts = {};
  const shortcutIds = [];
  desktopShortcuts.forEach(shortcut => {
    shortcuts[shortcut.id] = {
      id: shortcut.id,
      type: 'shortcut',
      name: shortcut.name,
      ext: '.lnk',
      icon: shortcut.icon,
      target: shortcut.target,
      parent: SYSTEM_IDS.DESKTOP,
      size: shortcut.size || SHORTCUT_SIZE,
      dateCreated: now,
      dateModified: now,
    };
    shortcutIds.push(shortcut.id);
  });

  // Create Projects folder and subfolders from CV data
  const { projectItems, projectsFolderId } = createProjectFolderItems(projects, now);

  // Add Projects folder to desktop children if it exists
  if (projectsFolderId) {
    shortcutIds.push(projectsFolderId);
  }

  // Create Program Files folder structure with executable files
  const programFilesItems = {};
  const programFilesFolderIds = PROGRAM_FILES_PROGRAMS.map(prog => prog.id);

  PROGRAM_FILES_PROGRAMS.forEach(prog => {
    const exeId = `${prog.id}-exe`;

    // Create executable file inside the program folder
    programFilesItems[exeId] = {
      id: exeId,
      type: 'executable',
      name: prog.exe,
      icon: prog.icon,
      parent: prog.id,
      target: prog.target,
      size: 1024 * 1024, // 1MB placeholder size
      dateCreated: now,
      dateModified: now,
    };

    // Create program folder containing the executable
    programFilesItems[prog.id] = {
      id: prog.id,
      type: 'folder',
      name: prog.name,
      icon: XP_ICONS.folder, // Use folder icon for the folder itself
      parent: SYSTEM_IDS.PROGRAM_FILES,
      children: [exeId],
      dateCreated: now,
      dateModified: now,
    };
  });

  // Create Sample Music file entries for My Music folder
  const sampleMusicItems = {};
  const sampleMusicIds = SAMPLE_MUSIC_FILES.map(music => music.id);

  SAMPLE_MUSIC_FILES.forEach(music => {
    const basename = music.name.replace(/\.[^/.]+$/, '');
    const ext = music.name.match(/\.[^/.]+$/)?.[0] || '';
    sampleMusicItems[music.id] = {
      id: music.id,
      type: 'file',
      name: music.name,
      basename,
      ext,
      icon: fileIcons['.mp3'] || '/icons/media-player.png',
      parent: SYSTEM_IDS.MY_MUSIC,
      size: music.size,
      url: music.path, // URL to the actual file
      dateCreated: now,
      dateModified: now,
    };
  });

  return {
    // C: Drive - root of file system
    [SYSTEM_IDS.C_DRIVE]: {
      id: SYSTEM_IDS.C_DRIVE,
      type: 'drive',
      name: 'Local Disk (C:)',
      icon: XP_ICONS.localDisk,
      parent: null,
      children: [SYSTEM_IDS.DOCUMENTS_AND_SETTINGS, SYSTEM_IDS.PROGRAM_FILES],
      dateCreated: now,
      dateModified: now,
    },

    // Documents and Settings folder
    [SYSTEM_IDS.DOCUMENTS_AND_SETTINGS]: {
      id: SYSTEM_IDS.DOCUMENTS_AND_SETTINGS,
      type: 'folder',
      name: 'Documents and Settings',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.C_DRIVE,
      children: [SYSTEM_IDS.USER_PROFILE, SYSTEM_IDS.ALL_USERS],
      dateCreated: now,
      dateModified: now,
    },

    // Current user profile folder
    [SYSTEM_IDS.USER_PROFILE]: {
      id: SYSTEM_IDS.USER_PROFILE,
      type: 'folder',
      name: userName,
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.DOCUMENTS_AND_SETTINGS,
      children: [SYSTEM_IDS.DESKTOP, SYSTEM_IDS.FAVORITES, SYSTEM_IDS.MY_DOCUMENTS, SYSTEM_IDS.START_MENU],
      dateCreated: now,
      dateModified: now,
    },

    // All Users folder
    [SYSTEM_IDS.ALL_USERS]: {
      id: SYSTEM_IDS.ALL_USERS,
      type: 'folder',
      name: 'All Users',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.DOCUMENTS_AND_SETTINGS,
      children: [],
      dateCreated: now,
      dateModified: now,
    },

    // Desktop folder (under user profile)
    [SYSTEM_IDS.DESKTOP]: {
      id: SYSTEM_IDS.DESKTOP,
      type: 'folder',
      name: 'Desktop',
      icon: XP_ICONS.desktop,
      parent: SYSTEM_IDS.USER_PROFILE,
      children: shortcutIds,
      dateCreated: now,
      dateModified: now,
    },

    // Favorites folder
    [SYSTEM_IDS.FAVORITES]: {
      id: SYSTEM_IDS.FAVORITES,
      type: 'folder',
      name: 'Favorites',
      icon: XP_ICONS.folder, // Uses folder icon as Favorites icon not available
      parent: SYSTEM_IDS.USER_PROFILE,
      children: [],
      dateCreated: now,
      dateModified: now,
    },

    // My Documents folder (under user profile)
    [SYSTEM_IDS.MY_DOCUMENTS]: {
      id: SYSTEM_IDS.MY_DOCUMENTS,
      type: 'folder',
      name: 'My Documents',
      icon: XP_ICONS.myDocuments,
      parent: SYSTEM_IDS.USER_PROFILE,
      children: [SYSTEM_IDS.MY_PICTURES, SYSTEM_IDS.MY_MUSIC],
      dateCreated: now,
      dateModified: now,
    },

    // Start Menu folder
    [SYSTEM_IDS.START_MENU]: {
      id: SYSTEM_IDS.START_MENU,
      type: 'folder',
      name: 'Start Menu',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.USER_PROFILE,
      children: [SYSTEM_IDS.START_MENU_PROGRAMS],
      dateCreated: now,
      dateModified: now,
    },

    // Start Menu Programs folder
    [SYSTEM_IDS.START_MENU_PROGRAMS]: {
      id: SYSTEM_IDS.START_MENU_PROGRAMS,
      type: 'folder',
      name: 'Programs',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.START_MENU,
      children: [
        SYSTEM_IDS.START_MENU_STARTUP,
        SYSTEM_IDS.START_MENU_ACCESSORIES,
        SYSTEM_IDS.START_MENU_GAMES,
        SYSTEM_IDS.START_MENU_ENTERTAINMENT,
      ],
      dateCreated: now,
      dateModified: now,
    },

    // Startup folder (apps here run on login)
    [SYSTEM_IDS.START_MENU_STARTUP]: {
      id: SYSTEM_IDS.START_MENU_STARTUP,
      type: 'folder',
      name: 'Startup',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.START_MENU_PROGRAMS,
      children: [],
      dateCreated: now,
      dateModified: now,
    },

    // Accessories folder
    [SYSTEM_IDS.START_MENU_ACCESSORIES]: {
      id: SYSTEM_IDS.START_MENU_ACCESSORIES,
      type: 'folder',
      name: 'Accessories',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.START_MENU_PROGRAMS,
      children: [],
      dateCreated: now,
      dateModified: now,
    },

    // Games folder
    [SYSTEM_IDS.START_MENU_GAMES]: {
      id: SYSTEM_IDS.START_MENU_GAMES,
      type: 'folder',
      name: 'Games',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.START_MENU_PROGRAMS,
      children: [],
      dateCreated: now,
      dateModified: now,
    },

    // Entertainment folder
    [SYSTEM_IDS.START_MENU_ENTERTAINMENT]: {
      id: SYSTEM_IDS.START_MENU_ENTERTAINMENT,
      type: 'folder',
      name: 'Entertainment',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.START_MENU_PROGRAMS,
      children: [],
      dateCreated: now,
      dateModified: now,
    },

    // My Pictures (under My Documents)
    [SYSTEM_IDS.MY_PICTURES]: {
      id: SYSTEM_IDS.MY_PICTURES,
      type: 'folder',
      name: 'My Pictures',
      icon: XP_ICONS.myPictures,
      parent: SYSTEM_IDS.MY_DOCUMENTS,
      children: [],
      dateCreated: now,
      dateModified: now,
    },

    // My Music (under My Documents)
    [SYSTEM_IDS.MY_MUSIC]: {
      id: SYSTEM_IDS.MY_MUSIC,
      type: 'folder',
      name: 'My Music',
      icon: XP_ICONS.myMusic,
      parent: SYSTEM_IDS.MY_DOCUMENTS,
      children: sampleMusicIds,
      dateCreated: now,
      dateModified: now,
    },

    // Program Files folder
    [SYSTEM_IDS.PROGRAM_FILES]: {
      id: SYSTEM_IDS.PROGRAM_FILES,
      type: 'folder',
      name: 'Program Files',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.C_DRIVE,
      children: programFilesFolderIds,
      dateCreated: now,
      dateModified: now,
    },

    // Recycle Bin (special system folder, not in C: drive hierarchy)
    [SYSTEM_IDS.RECYCLE_BIN]: {
      id: SYSTEM_IDS.RECYCLE_BIN,
      type: 'folder',
      name: 'Recycle Bin',
      icon: XP_ICONS.recycleBinEmpty,
      parent: null,
      children: [],
      dateCreated: now,
      dateModified: now,
    },

    ...shortcuts,
    ...projectItems,
    ...programFilesItems,
    ...sampleMusicItems,
  };
};
