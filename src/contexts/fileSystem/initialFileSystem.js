import { XP_ICONS, SYSTEM_IDS, fileIcons, SHORTCUT_SIZE } from './constants';
import { createProjectFolderItems } from './projectHelpers';
import { applyReferenceCDriveSeed } from './referenceSeed';

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

export const SHELL_ARTIFACT_IDS = {
  DESKTOP_INI: 'desktop-ini-file',
  SYSTEM_VOLUME_INFORMATION: 'system-volume-information-folder',
};

export const DESKTOP_INI_CONTENT = [
  '[.ShellClassInfo]',
  'LocalizedResourceName=@%SystemRoot%\\\\system32\\\\shell32.dll,-21787',
].join('\n');

// Windows XP system sound files (mapped to existing public/sounds/ assets)
export const WINDOWS_MEDIA_FILES = [
  { id: 'media-alert', name: 'alert.wav', path: '/sounds/alert.wav', size: 89084 },
  { id: 'media-balloon', name: 'Windows XP Balloon.wav', path: '/sounds/balloon.wav', size: 34236 },
  { id: 'media-battcritical', name: 'Windows XP Battery Critical.wav', path: '/sounds/battcritical.wav', size: 56366 },
  { id: 'media-chimes', name: 'chimes.wav', path: '/sounds/chimes.wav', size: 274292 },
  { id: 'media-chord', name: 'chord.wav', path: '/sounds/chord.wav', size: 198292 },
  { id: 'media-critical-stop', name: 'Windows XP Critical Stop.wav', path: '/sounds/error.wav', size: 73764 },
  { id: 'media-ding', name: 'Windows XP Ding.wav', path: '/sounds/ding.wav', size: 6076 },
  { id: 'media-error', name: 'Windows XP Error.wav', path: '/sounds/error.wav', size: 41124 },
  { id: 'media-exclamation', name: 'Windows XP Exclamation.wav', path: '/sounds/exclamation.wav', size: 84492 },
  { id: 'media-hdw-fail', name: 'Windows XP Hardware Fail.wav', path: '/sounds/hdw_fail.wav', size: 57702 },
  { id: 'media-hdw-insert', name: 'Windows XP Hardware Insert.wav', path: '/sounds/hdw_insert.wav', size: 119468 },
  { id: 'media-hdw-remove', name: 'Windows XP Hardware Remove.wav', path: '/sounds/hdw_remove.wav', size: 63774 },
  { id: 'media-logoff', name: 'Windows XP Logoff Sound.wav', path: '/sounds/logoff.wav', size: 146916 },
  { id: 'media-logon', name: 'Windows XP Logon Sound.wav', path: '/sounds/logon.wav', size: 391340 },
  { id: 'media-lowbatt', name: 'lowbatt.wav', path: '/sounds/lowbatt.wav', size: 174824 },
  { id: 'media-minimize', name: 'Windows XP Menu Command.wav', path: '/sounds/minimize.wav', size: 12204 },
  { id: 'media-notify', name: 'Windows XP Notify.wav', path: '/sounds/notify.wav', size: 24564 },
  { id: 'media-recycle', name: 'Windows XP Recycle.wav', path: '/sounds/recycle.wav', size: 52380 },
  { id: 'media-restore', name: 'Windows XP Restore.wav', path: '/sounds/restore.wav', size: 12204 },
  { id: 'media-shutdown', name: 'Windows XP Shutdown.wav', path: '/sounds/shutdown.wav', size: 146916 },
  { id: 'media-start', name: 'Windows XP Start.wav', path: '/sounds/start.wav', size: 84492 },
  { id: 'media-startup', name: 'Windows XP Startup.wav', path: '/sounds/startup.wav', size: 424644 },
  { id: 'media-tada', name: 'tada.wav', path: '/sounds/tada.wav', size: 234188 },
  { id: 'media-xpding', name: 'xpding.wav', path: '/sounds/xpding.wav', size: 7934 },
];

// Build the C:\WINDOWS folder hierarchy
const createWindowsFolderItems = (now) => {
  const items = {};

  // Media sound file entries
  const mediaFileIds = WINDOWS_MEDIA_FILES.map(f => f.id);
  WINDOWS_MEDIA_FILES.forEach(sound => {
    items[sound.id] = {
      id: sound.id,
      type: 'file',
      name: sound.name,
      basename: sound.name.replace(/\.[^/.]+$/, ''),
      ext: '.wav',
      icon: XP_ICONS.wav,
      parent: SYSTEM_IDS.WINDOWS_MEDIA,
      size: sound.size,
      url: sound.path,
      dateCreated: now,
      dateModified: now,
    };
  });

  // WINDOWS root folder
  items[SYSTEM_IDS.WINDOWS] = {
    id: SYSTEM_IDS.WINDOWS,
    type: 'folder',
    name: 'WINDOWS',
    icon: XP_ICONS.folder,
    parent: SYSTEM_IDS.C_DRIVE,
    children: [
      SYSTEM_IDS.WINDOWS_SYSTEM32,
      SYSTEM_IDS.WINDOWS_FONTS,
      SYSTEM_IDS.WINDOWS_MEDIA,
      SYSTEM_IDS.WINDOWS_HELP,
      SYSTEM_IDS.WINDOWS_CURSORS,
      SYSTEM_IDS.WINDOWS_INF,
      SYSTEM_IDS.WINDOWS_TEMP,
      SYSTEM_IDS.WINDOWS_PREFETCH,
      'windows-addins',
      'windows-apppatch',
      'windows-config',
      'windows-connection-wizard',
      'windows-debug',
      'windows-downloaded-program-files',
      'windows-driver-cache',
      'windows-ehome',
      'windows-ime',
      'windows-java',
      'windows-msagent',
      'windows-msapps',
      'windows-mui',
      'windows-offline-web-pages',
      'windows-pchealth',
      'windows-peernet',
      'windows-provisioning',
      'windows-registration',
      'windows-repair',
      'windows-resources',
      'windows-security',
      'windows-servicepacks',
      'windows-softwaredistr',
      'windows-srchasst',
      'windows-tasks',
      'windows-twain32',
      'windows-web',
    ],
    metadata: { system: true },
    dateCreated: now,
    dateModified: now,
  };

  // Primary subfolders with children
  items[SYSTEM_IDS.WINDOWS_SYSTEM32] = {
    id: SYSTEM_IDS.WINDOWS_SYSTEM32, type: 'folder', name: 'system32',
    icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
    children: ['windows-system32-config', 'windows-system32-drivers', 'windows-system32-wbem', 'windows-system32-dllcache', 'windows-system32-spool', 'windows-system32-oobe', 'windows-system32-restore', 'windows-system32-ras'],
    metadata: { system: true }, dateCreated: now, dateModified: now,
  };
  items[SYSTEM_IDS.WINDOWS_FONTS] = {
    id: SYSTEM_IDS.WINDOWS_FONTS, type: 'folder', name: 'Fonts',
    icon: XP_ICONS.folderFonts || XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
    children: [], dateCreated: now, dateModified: now,
  };
  items[SYSTEM_IDS.WINDOWS_MEDIA] = {
    id: SYSTEM_IDS.WINDOWS_MEDIA, type: 'folder', name: 'Media',
    icon: XP_ICONS.folderMusic || XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
    children: mediaFileIds, dateCreated: now, dateModified: now,
  };
  items[SYSTEM_IDS.WINDOWS_HELP] = {
    id: SYSTEM_IDS.WINDOWS_HELP, type: 'folder', name: 'Help',
    icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
    children: [], dateCreated: now, dateModified: now,
  };
  items[SYSTEM_IDS.WINDOWS_CURSORS] = {
    id: SYSTEM_IDS.WINDOWS_CURSORS, type: 'folder', name: 'Cursors',
    icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
    children: [], dateCreated: now, dateModified: now,
  };
  items[SYSTEM_IDS.WINDOWS_INF] = {
    id: SYSTEM_IDS.WINDOWS_INF, type: 'folder', name: 'inf',
    icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
    children: [], metadata: { hidden: true, system: true }, dateCreated: now, dateModified: now,
  };
  items[SYSTEM_IDS.WINDOWS_TEMP] = {
    id: SYSTEM_IDS.WINDOWS_TEMP, type: 'folder', name: 'Temp',
    icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
    children: [], dateCreated: now, dateModified: now,
  };
  items[SYSTEM_IDS.WINDOWS_PREFETCH] = {
    id: SYSTEM_IDS.WINDOWS_PREFETCH, type: 'folder', name: 'Prefetch',
    icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
    children: [], metadata: { hidden: true, system: true }, dateCreated: now, dateModified: now,
  };

  // system32 subfolders
  const sys32Subs = [
    { id: 'windows-system32-config', name: 'config' },
    { id: 'windows-system32-drivers', name: 'drivers' },
    { id: 'windows-system32-wbem', name: 'wbem' },
    { id: 'windows-system32-dllcache', name: 'dllcache', hidden: true },
    { id: 'windows-system32-spool', name: 'spool' },
    { id: 'windows-system32-oobe', name: 'oobe' },
    { id: 'windows-system32-restore', name: 'Restore' },
    { id: 'windows-system32-ras', name: 'ras' },
  ];
  sys32Subs.forEach(sub => {
    items[sub.id] = {
      id: sub.id, type: 'folder', name: sub.name,
      icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS_SYSTEM32,
      children: [],
      metadata: sub.hidden ? { hidden: true, system: true } : { system: true },
      dateCreated: now, dateModified: now,
    };
  });

  // Additional WINDOWS subfolders (empty placeholder directories)
  const additionalFolders = [
    { id: 'windows-addins', name: 'addins' },
    { id: 'windows-apppatch', name: 'AppPatch' },
    { id: 'windows-config', name: 'Config' },
    { id: 'windows-connection-wizard', name: 'Connection Wizard' },
    { id: 'windows-debug', name: 'Debug' },
    { id: 'windows-downloaded-program-files', name: 'Downloaded Program Files' },
    { id: 'windows-driver-cache', name: 'Driver Cache' },
    { id: 'windows-ehome', name: 'ehome' },
    { id: 'windows-ime', name: 'ime' },
    { id: 'windows-java', name: 'Java' },
    { id: 'windows-msagent', name: 'msagent' },
    { id: 'windows-msapps', name: 'msapps' },
    { id: 'windows-mui', name: 'mui' },
    { id: 'windows-offline-web-pages', name: 'Offline Web Pages' },
    { id: 'windows-pchealth', name: 'pchealth' },
    { id: 'windows-peernet', name: 'PeerNet' },
    { id: 'windows-provisioning', name: 'Provisioning' },
    { id: 'windows-registration', name: 'Registration' },
    { id: 'windows-repair', name: 'repair' },
    { id: 'windows-resources', name: 'Resources' },
    { id: 'windows-security', name: 'security' },
    { id: 'windows-servicepacks', name: 'ServicePackFiles' },
    { id: 'windows-softwaredistr', name: 'SoftwareDistribution' },
    { id: 'windows-srchasst', name: 'srchasst' },
    { id: 'windows-tasks', name: 'Tasks' },
    { id: 'windows-twain32', name: 'twain_32' },
    { id: 'windows-web', name: 'Web' },
  ];
  additionalFolders.forEach(sub => {
    items[sub.id] = {
      id: sub.id, type: 'folder', name: sub.name,
      icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
      children: [], dateCreated: now, dateModified: now,
    };
  });

  return items;
};

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

  const shellArtifacts = {
    [SHELL_ARTIFACT_IDS.DESKTOP_INI]: {
      id: SHELL_ARTIFACT_IDS.DESKTOP_INI,
      type: 'file',
      name: 'desktop.ini',
      basename: 'desktop',
      ext: '.ini',
      icon: fileIcons['.ini'] || XP_ICONS.notepad,
      parent: SYSTEM_IDS.DESKTOP,
      size: DESKTOP_INI_CONTENT.length,
      contentType: 'text/plain',
      content: DESKTOP_INI_CONTENT,
      metadata: {
        hidden: true,
        system: true,
        icon: fileIcons['.ini'] || XP_ICONS.notepad,
      },
      dateCreated: now,
      dateModified: now,
    },
    [SHELL_ARTIFACT_IDS.SYSTEM_VOLUME_INFORMATION]: {
      id: SHELL_ARTIFACT_IDS.SYSTEM_VOLUME_INFORMATION,
      type: 'folder',
      name: 'System Volume Information',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.C_DRIVE,
      children: [],
      metadata: {
        hidden: true,
        system: true,
        icon: XP_ICONS.folder,
      },
      dateCreated: now,
      dateModified: now,
    },
  };

  // WINDOWS folder hierarchy
  const windowsItems = createWindowsFolderItems(now);

  const initialFileSystem = {
    // C: Drive - root of file system
    [SYSTEM_IDS.C_DRIVE]: {
      id: SYSTEM_IDS.C_DRIVE,
      type: 'drive',
      name: 'Local Disk (C:)',
      icon: XP_ICONS.localDisk,
      parent: null,
      children: [
        SYSTEM_IDS.DOCUMENTS_AND_SETTINGS,
        SYSTEM_IDS.PROGRAM_FILES,
        SYSTEM_IDS.WINDOWS,
        SHELL_ARTIFACT_IDS.SYSTEM_VOLUME_INFORMATION,
      ],
      metadata: { driveType: 'local' },
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
      children: [...shortcutIds, SHELL_ARTIFACT_IDS.DESKTOP_INI],
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

    // D: Drive - secondary local disk
    [SYSTEM_IDS.D_DRIVE]: {
      id: SYSTEM_IDS.D_DRIVE,
      type: 'drive',
      name: 'Local Disk (D:)',
      icon: XP_ICONS.localDisk,
      parent: null,
      children: [],
      metadata: { driveType: 'local' },
      dateCreated: now,
      dateModified: now,
    },

    // E: Drive - CD/DVD drive
    [SYSTEM_IDS.E_DRIVE]: {
      id: SYSTEM_IDS.E_DRIVE,
      type: 'drive',
      name: 'CD Drive (E:)',
      icon: XP_ICONS.driveOptical,
      parent: null,
      children: [],
      metadata: { driveType: 'optical' },
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
    ...shellArtifacts,
    ...windowsItems,
  };

  applyReferenceCDriveSeed(initialFileSystem, { now });

  return initialFileSystem;
};
