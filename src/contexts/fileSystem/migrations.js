import { XP_ICONS, SYSTEM_IDS, fileIcons, SHORTCUT_SIZE } from './constants';
import { createProjectFolderItems } from './projectHelpers';
import {
  PROGRAM_FILES_PROGRAMS,
  SAMPLE_MUSIC_FILES,
  SHELL_ARTIFACT_IDS,
  DESKTOP_INI_CONTENT,
  WINDOWS_MEDIA_FILES,
} from './initialFileSystem';

// IDs of old shortcuts that should be removed (now system icons or replaced with folders)
export const OLD_SHORTCUT_IDS = ['shortcut-my-computer', 'shortcut-recycle-bin', 'shortcut-projects'];

// Ensure Projects folder structure exists and is up-to-date
export const ensureProjectsFolder = (fs, projects) => {
  const now = Date.now();
  const projectsFolderId = 'projects-folder';

  if (!projects || projects.length === 0) {
    return false;
  }

  // Check if Projects folder exists
  const existingProjectsFolder = fs[projectsFolderId];

  if (existingProjectsFolder) {
    // Delete old project files and folders (they may have different IDs)
    const oldChildren = [...(existingProjectsFolder.children || [])];
    for (const childId of oldChildren) {
      const child = fs[childId];
      if (child && child.type === 'folder') {
        // Delete files inside project folder
        for (const fileId of (child.children || [])) {
          delete fs[fileId];
        }
      }
      delete fs[childId];
    }
    // Delete the Projects folder itself
    delete fs[projectsFolderId];

    // Remove from desktop children
    if (fs[SYSTEM_IDS.DESKTOP]) {
      fs[SYSTEM_IDS.DESKTOP].children = fs[SYSTEM_IDS.DESKTOP].children.filter(
        id => id !== projectsFolderId
      );
    }
  }

  // Create fresh Projects folder with current CV data
  const { projectItems } = createProjectFolderItems(projects, now);
  Object.assign(fs, projectItems);

  // Add Projects folder to desktop children
  if (fs[SYSTEM_IDS.DESKTOP] && !fs[SYSTEM_IDS.DESKTOP].children.includes(projectsFolderId)) {
    fs[SYSTEM_IDS.DESKTOP].children.push(projectsFolderId);
  }

  return true;
};

// Ensure Program Files folders contain executables
export const ensureProgramFilesExecutables = (fs) => {
  const now = Date.now();
  let modified = false;

  // Ensure Program Files folder exists
  if (!fs[SYSTEM_IDS.PROGRAM_FILES]) {
    return modified;
  }

  PROGRAM_FILES_PROGRAMS.forEach(prog => {
    const exeId = `${prog.id}-exe`;

    // Create program folder if it doesn't exist
    if (!fs[prog.id]) {
      fs[prog.id] = {
        id: prog.id,
        type: 'folder',
        name: prog.name,
        icon: XP_ICONS.folder,
        parent: SYSTEM_IDS.PROGRAM_FILES,
        children: [],
        dateCreated: now,
        dateModified: now,
      };

      // Add to Program Files children
      if (!fs[SYSTEM_IDS.PROGRAM_FILES].children.includes(prog.id)) {
        fs[SYSTEM_IDS.PROGRAM_FILES].children.push(prog.id);
      }
      modified = true;
    } else {
      // Fix existing folders that might have wrong icon (app icon instead of folder icon)
      if (fs[prog.id].icon !== XP_ICONS.folder) {
        fs[prog.id].icon = XP_ICONS.folder;
        modified = true;
      }
    }

    // Create executable if it doesn't exist
    if (!fs[exeId]) {
      fs[exeId] = {
        id: exeId,
        type: 'executable',
        name: prog.exe,
        icon: prog.icon,
        parent: prog.id,
        target: prog.target,
        size: 1024 * 1024,
        dateCreated: now,
        dateModified: now,
      };

      // Add to program folder children
      if (fs[prog.id] && !fs[prog.id].children.includes(exeId)) {
        fs[prog.id].children.push(exeId);
      }
      modified = true;
    }
  });

  return modified;
};

export const ensureMetadataIcons = (fs) => {
  if (!fs) return false;

  let modified = false;

  Object.keys(fs).forEach((id) => {
    if (id.startsWith('_')) return;

    const item = fs[id];
    if (!item || typeof item !== 'object') return;
    if (!item.icon || item.metadata?.icon) return;

    fs[id] = {
      ...item,
      metadata: {
        ...(item.metadata || {}),
        icon: item.icon,
      },
    };
    modified = true;
  });

  return modified;
};

export const ensureShellArtifacts = (fs) => {
  if (!fs) return false;

  const now = Date.now();
  let modified = false;

  const ensureChild = (parentId, childId) => {
    if (!fs[parentId]) return;
    if (!fs[parentId].children?.includes(childId)) {
      fs[parentId].children = [...(fs[parentId].children || []), childId];
      modified = true;
    }
  };

  if (!fs[SHELL_ARTIFACT_IDS.DESKTOP_INI]) {
    fs[SHELL_ARTIFACT_IDS.DESKTOP_INI] = {
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
    };
    modified = true;
  } else {
    const item = fs[SHELL_ARTIFACT_IDS.DESKTOP_INI];
    const nextMetadata = {
      ...(item.metadata || {}),
      hidden: true,
      system: true,
      icon: item.metadata?.icon || item.icon || fileIcons['.ini'] || XP_ICONS.notepad,
    };
    if (
      item.parent !== SYSTEM_IDS.DESKTOP ||
      item.content !== DESKTOP_INI_CONTENT ||
      item.contentType !== 'text/plain' ||
      item.ext !== '.ini' ||
      JSON.stringify(item.metadata || {}) !== JSON.stringify(nextMetadata)
    ) {
      fs[SHELL_ARTIFACT_IDS.DESKTOP_INI] = {
        ...item,
        parent: SYSTEM_IDS.DESKTOP,
        content: DESKTOP_INI_CONTENT,
        contentType: 'text/plain',
        ext: '.ini',
        metadata: nextMetadata,
      };
      modified = true;
    }
  }
  ensureChild(SYSTEM_IDS.DESKTOP, SHELL_ARTIFACT_IDS.DESKTOP_INI);

  if (!fs[SHELL_ARTIFACT_IDS.SYSTEM_VOLUME_INFORMATION]) {
    fs[SHELL_ARTIFACT_IDS.SYSTEM_VOLUME_INFORMATION] = {
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
    };
    modified = true;
  } else {
    const item = fs[SHELL_ARTIFACT_IDS.SYSTEM_VOLUME_INFORMATION];
    const nextMetadata = {
      ...(item.metadata || {}),
      hidden: true,
      system: true,
      icon: item.metadata?.icon || item.icon || XP_ICONS.folder,
    };
    if (
      item.parent !== SYSTEM_IDS.C_DRIVE ||
      item.type !== 'folder' ||
      item.name !== 'System Volume Information' ||
      JSON.stringify(item.metadata || {}) !== JSON.stringify(nextMetadata)
    ) {
      fs[SHELL_ARTIFACT_IDS.SYSTEM_VOLUME_INFORMATION] = {
        ...item,
        type: 'folder',
        name: 'System Volume Information',
        parent: SYSTEM_IDS.C_DRIVE,
        children: item.children || [],
        metadata: nextMetadata,
      };
      modified = true;
    }
  }
  ensureChild(SYSTEM_IDS.C_DRIVE, SHELL_ARTIFACT_IDS.SYSTEM_VOLUME_INFORMATION);

  return modified;
};

// Migrate old file system structure to new XP-style structure
export const migrateToNewStructure = (fs, userName) => {
  const now = Date.now();
  let modified = false;

  // Check if new structure exists (Documents and Settings folder)
  if (!fs[SYSTEM_IDS.DOCUMENTS_AND_SETTINGS]) {
    fs[SYSTEM_IDS.DOCUMENTS_AND_SETTINGS] = {
      id: SYSTEM_IDS.DOCUMENTS_AND_SETTINGS,
      type: 'folder',
      name: 'Documents and Settings',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.C_DRIVE,
      children: [SYSTEM_IDS.USER_PROFILE, SYSTEM_IDS.ALL_USERS],
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  }

  // Create User Profile folder
  if (!fs[SYSTEM_IDS.USER_PROFILE]) {
    fs[SYSTEM_IDS.USER_PROFILE] = {
      id: SYSTEM_IDS.USER_PROFILE,
      type: 'folder',
      name: userName || 'User',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.DOCUMENTS_AND_SETTINGS,
      children: [SYSTEM_IDS.DESKTOP, SYSTEM_IDS.FAVORITES, SYSTEM_IDS.MY_DOCUMENTS, SYSTEM_IDS.START_MENU],
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  }

  // Create All Users folder
  if (!fs[SYSTEM_IDS.ALL_USERS]) {
    fs[SYSTEM_IDS.ALL_USERS] = {
      id: SYSTEM_IDS.ALL_USERS,
      type: 'folder',
      name: 'All Users',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.DOCUMENTS_AND_SETTINGS,
      children: [],
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  }

  // Create Program Files folder
  if (!fs[SYSTEM_IDS.PROGRAM_FILES]) {
    fs[SYSTEM_IDS.PROGRAM_FILES] = {
      id: SYSTEM_IDS.PROGRAM_FILES,
      type: 'folder',
      name: 'Program Files',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.C_DRIVE,
      children: [],
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  }

  // Create Favorites folder
  if (!fs[SYSTEM_IDS.FAVORITES]) {
    fs[SYSTEM_IDS.FAVORITES] = {
      id: SYSTEM_IDS.FAVORITES,
      type: 'folder',
      name: 'Favorites',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.USER_PROFILE,
      children: [],
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  }

  // Create Start Menu folder
  if (!fs[SYSTEM_IDS.START_MENU]) {
    fs[SYSTEM_IDS.START_MENU] = {
      id: SYSTEM_IDS.START_MENU,
      type: 'folder',
      name: 'Start Menu',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.USER_PROFILE,
      children: [SYSTEM_IDS.START_MENU_PROGRAMS],
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  }

  // Ensure Start Menu has Programs folder as child
  if (fs[SYSTEM_IDS.START_MENU] && !fs[SYSTEM_IDS.START_MENU].children?.includes(SYSTEM_IDS.START_MENU_PROGRAMS)) {
    fs[SYSTEM_IDS.START_MENU].children = [SYSTEM_IDS.START_MENU_PROGRAMS];
    modified = true;
  }

  // Create Start Menu Programs folder
  if (!fs[SYSTEM_IDS.START_MENU_PROGRAMS]) {
    fs[SYSTEM_IDS.START_MENU_PROGRAMS] = {
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
    };
    modified = true;
  }

  // Create Startup folder
  if (!fs[SYSTEM_IDS.START_MENU_STARTUP]) {
    fs[SYSTEM_IDS.START_MENU_STARTUP] = {
      id: SYSTEM_IDS.START_MENU_STARTUP,
      type: 'folder',
      name: 'Startup',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.START_MENU_PROGRAMS,
      children: [],
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  }

  // Create Accessories folder
  if (!fs[SYSTEM_IDS.START_MENU_ACCESSORIES]) {
    fs[SYSTEM_IDS.START_MENU_ACCESSORIES] = {
      id: SYSTEM_IDS.START_MENU_ACCESSORIES,
      type: 'folder',
      name: 'Accessories',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.START_MENU_PROGRAMS,
      children: [],
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  }

  // Create Games folder
  if (!fs[SYSTEM_IDS.START_MENU_GAMES]) {
    fs[SYSTEM_IDS.START_MENU_GAMES] = {
      id: SYSTEM_IDS.START_MENU_GAMES,
      type: 'folder',
      name: 'Games',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.START_MENU_PROGRAMS,
      children: [],
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  }

  // Create Entertainment folder
  if (!fs[SYSTEM_IDS.START_MENU_ENTERTAINMENT]) {
    fs[SYSTEM_IDS.START_MENU_ENTERTAINMENT] = {
      id: SYSTEM_IDS.START_MENU_ENTERTAINMENT,
      type: 'folder',
      name: 'Entertainment',
      icon: XP_ICONS.folder,
      parent: SYSTEM_IDS.START_MENU_PROGRAMS,
      children: [],
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  }

  // Ensure Programs folder has all subfolders as children
  if (fs[SYSTEM_IDS.START_MENU_PROGRAMS]) {
    const requiredChildren = [
      SYSTEM_IDS.START_MENU_STARTUP,
      SYSTEM_IDS.START_MENU_ACCESSORIES,
      SYSTEM_IDS.START_MENU_GAMES,
      SYSTEM_IDS.START_MENU_ENTERTAINMENT,
    ];
    const currentChildren = fs[SYSTEM_IDS.START_MENU_PROGRAMS].children || [];
    const missingChildren = requiredChildren.filter(c => !currentChildren.includes(c));
    if (missingChildren.length > 0) {
      fs[SYSTEM_IDS.START_MENU_PROGRAMS].children = [...currentChildren, ...missingChildren];
      modified = true;
    }
  }

  // Update C: drive children to new structure
  if (fs[SYSTEM_IDS.C_DRIVE]) {
    const cDriveChildren = fs[SYSTEM_IDS.C_DRIVE].children || [];
    const newChildren = [SYSTEM_IDS.DOCUMENTS_AND_SETTINGS, SYSTEM_IDS.PROGRAM_FILES];

    // Check if C: drive has old structure (Desktop/My Documents at root)
    const hasOldStructure = cDriveChildren.includes(SYSTEM_IDS.DESKTOP) ||
                           cDriveChildren.includes(SYSTEM_IDS.MY_DOCUMENTS);

    if (hasOldStructure) {
      fs[SYSTEM_IDS.C_DRIVE].children = newChildren;
      modified = true;
    } else if (!cDriveChildren.includes(SYSTEM_IDS.DOCUMENTS_AND_SETTINGS)) {
      fs[SYSTEM_IDS.C_DRIVE].children = newChildren;
      modified = true;
    }
  }

  // Update Desktop parent to USER_PROFILE
  if (fs[SYSTEM_IDS.DESKTOP] && fs[SYSTEM_IDS.DESKTOP].parent !== SYSTEM_IDS.USER_PROFILE) {
    fs[SYSTEM_IDS.DESKTOP].parent = SYSTEM_IDS.USER_PROFILE;
    modified = true;
  }

  // Update My Documents parent to USER_PROFILE and ensure it has children
  if (fs[SYSTEM_IDS.MY_DOCUMENTS]) {
    if (fs[SYSTEM_IDS.MY_DOCUMENTS].parent !== SYSTEM_IDS.USER_PROFILE) {
      fs[SYSTEM_IDS.MY_DOCUMENTS].parent = SYSTEM_IDS.USER_PROFILE;
      modified = true;
    }
    // Ensure My Pictures and My Music are children of My Documents
    const myDocsChildren = fs[SYSTEM_IDS.MY_DOCUMENTS].children || [];
    if (!myDocsChildren.includes(SYSTEM_IDS.MY_PICTURES)) {
      fs[SYSTEM_IDS.MY_DOCUMENTS].children = [...myDocsChildren, SYSTEM_IDS.MY_PICTURES, SYSTEM_IDS.MY_MUSIC].filter((v, i, a) => a.indexOf(v) === i);
      modified = true;
    }
  }

  // Update My Pictures parent to MY_DOCUMENTS
  if (fs[SYSTEM_IDS.MY_PICTURES] && fs[SYSTEM_IDS.MY_PICTURES].parent !== SYSTEM_IDS.MY_DOCUMENTS) {
    fs[SYSTEM_IDS.MY_PICTURES].parent = SYSTEM_IDS.MY_DOCUMENTS;
    modified = true;
  }

  // Update My Music parent to MY_DOCUMENTS
  if (fs[SYSTEM_IDS.MY_MUSIC] && fs[SYSTEM_IDS.MY_MUSIC].parent !== SYSTEM_IDS.MY_DOCUMENTS) {
    fs[SYSTEM_IDS.MY_MUSIC].parent = SYSTEM_IDS.MY_DOCUMENTS;
    modified = true;
  }

  // Ensure sample music files exist in My Music folder
  if (fs[SYSTEM_IDS.MY_MUSIC]) {
    const myMusicChildren = fs[SYSTEM_IDS.MY_MUSIC].children || [];

    SAMPLE_MUSIC_FILES.forEach(music => {
      if (!fs[music.id]) {
        const basename = music.name.replace(/\.[^/.]+$/, '');
        const ext = music.name.match(/\.[^/.]+$/)?.[0] || '';
        fs[music.id] = {
          id: music.id,
          type: 'file',
          name: music.name,
          basename,
          ext,
          icon: fileIcons['.mp3'] || '/icons/media-player.png',
          parent: SYSTEM_IDS.MY_MUSIC,
          size: music.size,
          url: music.path,
          dateCreated: now,
          dateModified: now,
        };
        modified = true;
      }
      if (!myMusicChildren.includes(music.id)) {
        myMusicChildren.push(music.id);
        modified = true;
      }
    });

    if (modified) {
      fs[SYSTEM_IDS.MY_MUSIC].children = myMusicChildren;
    }
  }

  return modified;
};

// Ensure desktop shortcuts exist in file system
export const ensureDesktopShortcuts = (fs, desktopShortcuts) => {
  const now = Date.now();
  let modified = false;

  // Remove old My Computer and Recycle Bin shortcuts (now system icons)
  for (const oldId of OLD_SHORTCUT_IDS) {
    if (fs[oldId]) {
      delete fs[oldId];
      modified = true;
    }
    // Also remove from desktop children if present
    if (fs[SYSTEM_IDS.DESKTOP]?.children?.includes(oldId)) {
      fs[SYSTEM_IDS.DESKTOP].children = fs[SYSTEM_IDS.DESKTOP].children.filter(id => id !== oldId);
      modified = true;
    }
  }

  // Ensure Desktop folder exists
  if (!fs[SYSTEM_IDS.DESKTOP]) {
    fs[SYSTEM_IDS.DESKTOP] = {
      id: SYSTEM_IDS.DESKTOP,
      type: 'folder',
      name: 'Desktop',
      icon: XP_ICONS.desktop,
      parent: SYSTEM_IDS.USER_PROFILE,
      children: [],
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  }

  // Ensure each shortcut exists
  desktopShortcuts.forEach(shortcut => {
    if (!fs[shortcut.id]) {
      fs[shortcut.id] = {
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
      modified = true;
    } else {
      // Migrate existing items to be proper shortcuts
      const item = fs[shortcut.id];
      // Force type to 'shortcut' if missing, undefined, or incorrect
      if (!item.type || item.type !== 'shortcut') {
        fs[shortcut.id] = { ...fs[shortcut.id], type: 'shortcut' };
        modified = true;
      }
      if (!item.ext) {
        fs[shortcut.id].ext = '.lnk';
        modified = true;
      }
      if (!item.size) {
        fs[shortcut.id].size = shortcut.size || SHORTCUT_SIZE;
        modified = true;
      }
      // Update name to include .lnk if not present
      if (!item.name.endsWith('.lnk')) {
        fs[shortcut.id].name = item.name + '.lnk';
        modified = true;
      }
      // Always update icon from catalog (allows icon updates to propagate)
      if (item.icon !== shortcut.icon) {
        fs[shortcut.id].icon = shortcut.icon;
        modified = true;
      }
      // Ensure target is set
      if (!item.target) {
        fs[shortcut.id].target = shortcut.target;
        modified = true;
      }
    }

    // Ensure shortcut is in desktop's children
    if (!fs[SYSTEM_IDS.DESKTOP].children.includes(shortcut.id)) {
      fs[SYSTEM_IDS.DESKTOP].children.push(shortcut.id);
      modified = true;
    }
  });

  return modified;
};

// Force update all shortcuts to have correct type and icon from catalog
export const migrateShortcuts = (fs, desktopShortcuts) => {
  if (!fs) return fs;
  let modified = false;

  desktopShortcuts.forEach(shortcut => {
    if (fs[shortcut.id]) {
      const item = fs[shortcut.id];
      // Force update type, icon, and target from catalog
      if (item.type !== 'shortcut' || item.icon !== shortcut.icon || item.target !== shortcut.target) {
        fs[shortcut.id] = {
          ...item,
          type: 'shortcut',
          icon: shortcut.icon,
          target: shortcut.target,
        };
        modified = true;
      }
    }
  });

  return modified ? fs : fs;
};

// Migrate old file sizes from KB to bytes
export const migrateFileSizes = (fs) => {
  if (!fs || fs._sizesMigrated) return fs;

  const migrated = { ...fs, _sizesMigrated: true };
  for (const id of Object.keys(migrated)) {
    if (id.startsWith('_')) continue; // Skip metadata keys
    const item = migrated[id];
    if (item && item.type === 'file' && typeof item.size === 'number' && item.size > 0) {
      // If size is small (likely stored in KB), convert to bytes
      // Heuristic: if size < 10000, it was probably stored in KB
      if (item.size < 10000) {
        migrated[id] = { ...item, size: item.size * 1024 };
      }
    }
  }
  return migrated;
};

// Ensure D: and E: drives exist
export const ensureAdditionalDrives = (fs) => {
  if (!fs) return false;
  const now = Date.now();
  let modified = false;

  if (!fs[SYSTEM_IDS.D_DRIVE]) {
    fs[SYSTEM_IDS.D_DRIVE] = {
      id: SYSTEM_IDS.D_DRIVE,
      type: 'drive',
      name: 'Local Disk (D:)',
      icon: XP_ICONS.localDisk,
      parent: null,
      children: [],
      metadata: { driveType: 'local' },
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  } else if (!fs[SYSTEM_IDS.D_DRIVE].metadata?.driveType) {
    fs[SYSTEM_IDS.D_DRIVE].metadata = { ...fs[SYSTEM_IDS.D_DRIVE].metadata, driveType: 'local' };
    modified = true;
  }

  if (!fs[SYSTEM_IDS.E_DRIVE]) {
    fs[SYSTEM_IDS.E_DRIVE] = {
      id: SYSTEM_IDS.E_DRIVE,
      type: 'drive',
      name: 'CD Drive (E:)',
      icon: XP_ICONS.driveOptical,
      parent: null,
      children: [],
      metadata: { driveType: 'optical' },
      dateCreated: now,
      dateModified: now,
    };
    modified = true;
  } else if (!fs[SYSTEM_IDS.E_DRIVE].metadata?.driveType) {
    fs[SYSTEM_IDS.E_DRIVE].metadata = { ...fs[SYSTEM_IDS.E_DRIVE].metadata, driveType: 'optical' };
    modified = true;
  }

  // Ensure C: drive has driveType metadata
  if (fs[SYSTEM_IDS.C_DRIVE] && !fs[SYSTEM_IDS.C_DRIVE].metadata?.driveType) {
    fs[SYSTEM_IDS.C_DRIVE].metadata = { ...fs[SYSTEM_IDS.C_DRIVE].metadata, driveType: 'local' };
    modified = true;
  }

  return modified;
};

// Ensure WINDOWS folder hierarchy exists on C: drive
export const ensureWindowsFolder = (fs) => {
  if (!fs) return false;
  const now = Date.now();
  let modified = false;

  const ensureChild = (parentId, childId) => {
    if (!fs[parentId]) return;
    if (!fs[parentId].children?.includes(childId)) {
      fs[parentId].children = [...(fs[parentId].children || []), childId];
      modified = true;
    }
  };

  // WINDOWS root folder
  if (!fs[SYSTEM_IDS.WINDOWS]) {
    const windowsChildIds = [
      SYSTEM_IDS.WINDOWS_SYSTEM32,
      SYSTEM_IDS.WINDOWS_FONTS,
      SYSTEM_IDS.WINDOWS_MEDIA,
      SYSTEM_IDS.WINDOWS_HELP,
      SYSTEM_IDS.WINDOWS_CURSORS,
      SYSTEM_IDS.WINDOWS_INF,
      SYSTEM_IDS.WINDOWS_TEMP,
      SYSTEM_IDS.WINDOWS_PREFETCH,
      'windows-addins', 'windows-apppatch', 'windows-config',
      'windows-connection-wizard', 'windows-debug',
      'windows-downloaded-program-files', 'windows-driver-cache',
      'windows-ehome', 'windows-ime', 'windows-java',
      'windows-msagent', 'windows-msapps', 'windows-mui',
      'windows-offline-web-pages', 'windows-pchealth', 'windows-peernet',
      'windows-provisioning', 'windows-registration', 'windows-repair',
      'windows-resources', 'windows-security', 'windows-servicepacks',
      'windows-softwaredistr', 'windows-srchasst', 'windows-tasks',
      'windows-twain32', 'windows-web',
    ];

    fs[SYSTEM_IDS.WINDOWS] = {
      id: SYSTEM_IDS.WINDOWS, type: 'folder', name: 'WINDOWS',
      icon: XP_ICONS.folder, parent: SYSTEM_IDS.C_DRIVE,
      children: windowsChildIds, metadata: { system: true },
      dateCreated: now, dateModified: now,
    };
    modified = true;
  }
  ensureChild(SYSTEM_IDS.C_DRIVE, SYSTEM_IDS.WINDOWS);

  // system32
  if (!fs[SYSTEM_IDS.WINDOWS_SYSTEM32]) {
    fs[SYSTEM_IDS.WINDOWS_SYSTEM32] = {
      id: SYSTEM_IDS.WINDOWS_SYSTEM32, type: 'folder', name: 'system32',
      icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
      children: ['windows-system32-config', 'windows-system32-drivers', 'windows-system32-wbem', 'windows-system32-dllcache', 'windows-system32-spool', 'windows-system32-oobe', 'windows-system32-restore', 'windows-system32-ras'],
      metadata: { system: true }, dateCreated: now, dateModified: now,
    };
    modified = true;
  }
  ensureChild(SYSTEM_IDS.WINDOWS, SYSTEM_IDS.WINDOWS_SYSTEM32);

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
    if (!fs[sub.id]) {
      fs[sub.id] = {
        id: sub.id, type: 'folder', name: sub.name,
        icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS_SYSTEM32,
        children: [],
        metadata: sub.hidden ? { hidden: true, system: true } : { system: true },
        dateCreated: now, dateModified: now,
      };
      modified = true;
    }
  });

  // Fonts
  if (!fs[SYSTEM_IDS.WINDOWS_FONTS]) {
    fs[SYSTEM_IDS.WINDOWS_FONTS] = {
      id: SYSTEM_IDS.WINDOWS_FONTS, type: 'folder', name: 'Fonts',
      icon: XP_ICONS.folderFonts || XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
      children: [], dateCreated: now, dateModified: now,
    };
    modified = true;
  }
  ensureChild(SYSTEM_IDS.WINDOWS, SYSTEM_IDS.WINDOWS_FONTS);

  // Media folder with sound files
  const mediaFileIds = WINDOWS_MEDIA_FILES.map(f => f.id);
  if (!fs[SYSTEM_IDS.WINDOWS_MEDIA]) {
    fs[SYSTEM_IDS.WINDOWS_MEDIA] = {
      id: SYSTEM_IDS.WINDOWS_MEDIA, type: 'folder', name: 'Media',
      icon: XP_ICONS.folderMusic || XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
      children: mediaFileIds, dateCreated: now, dateModified: now,
    };
    modified = true;
  }
  ensureChild(SYSTEM_IDS.WINDOWS, SYSTEM_IDS.WINDOWS_MEDIA);

  // Ensure media sound files exist
  WINDOWS_MEDIA_FILES.forEach(sound => {
    if (!fs[sound.id]) {
      fs[sound.id] = {
        id: sound.id, type: 'file', name: sound.name,
        basename: sound.name.replace(/\.[^/.]+$/, ''), ext: '.wav',
        icon: XP_ICONS.wav, parent: SYSTEM_IDS.WINDOWS_MEDIA,
        size: sound.size, url: sound.path,
        dateCreated: now, dateModified: now,
      };
      modified = true;
    }
    if (fs[SYSTEM_IDS.WINDOWS_MEDIA] && !fs[SYSTEM_IDS.WINDOWS_MEDIA].children?.includes(sound.id)) {
      fs[SYSTEM_IDS.WINDOWS_MEDIA].children = [...(fs[SYSTEM_IDS.WINDOWS_MEDIA].children || []), sound.id];
      modified = true;
    }
  });

  // Remaining simple subfolders
  const simpleFolders = [
    { id: SYSTEM_IDS.WINDOWS_HELP, name: 'Help' },
    { id: SYSTEM_IDS.WINDOWS_CURSORS, name: 'Cursors' },
    { id: SYSTEM_IDS.WINDOWS_INF, name: 'inf', hidden: true },
    { id: SYSTEM_IDS.WINDOWS_TEMP, name: 'Temp' },
    { id: SYSTEM_IDS.WINDOWS_PREFETCH, name: 'Prefetch', hidden: true },
  ];
  simpleFolders.forEach(sub => {
    if (!fs[sub.id]) {
      fs[sub.id] = {
        id: sub.id, type: 'folder', name: sub.name,
        icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
        children: [],
        metadata: sub.hidden ? { hidden: true, system: true } : undefined,
        dateCreated: now, dateModified: now,
      };
      modified = true;
    }
    ensureChild(SYSTEM_IDS.WINDOWS, sub.id);
  });

  // Additional WINDOWS subfolders (id must match initialFileSystem.js)
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
  additionalFolders.forEach(({ id, name }) => {
    if (!fs[id]) {
      fs[id] = {
        id, type: 'folder', name,
        icon: XP_ICONS.folder, parent: SYSTEM_IDS.WINDOWS,
        children: [], dateCreated: now, dateModified: now,
      };
      modified = true;
    }
    ensureChild(SYSTEM_IDS.WINDOWS, id);
  });

  return modified;
};
