import { XP_ICONS, SYSTEM_IDS, SHORTCUT_SIZE, fileIcons } from './constants';
import {
  basenameVirtualPath,
  dirnameVirtualPath,
  joinVirtualPath,
  normalizeVirtualPath,
} from './virtualFileSystem';

const DEFAULT_FOLDER_ICON = XP_ICONS.folder;
const DEFAULT_FILE_ICON = XP_ICONS.file;
const DEFAULT_EXECUTABLE_ICON = XP_ICONS.fileExecutable || '/icons/luna/file_generic_executable.png';
const DEFAULT_SHORTCUT_ICON = XP_ICONS.shortcut || fileIcons['.lnk'] || DEFAULT_FILE_ICON;
const DEFAULT_MP3_ICON = fileIcons['.mp3'] || '/icons/media-player.png';
const DEFAULT_IMAGE_ICON = fileIcons['.jpg'] || '/icons/image-viewer.png';
const DEFAULT_URL_ICON = fileIcons['.url'] || '/icons/xp/InternetExplorer6.png';
const DEFAULT_TEXT_ICON = fileIcons['.txt'] || XP_ICONS.notepad;
const DEFAULT_INI_ICON = fileIcons['.ini'] || XP_ICONS.notepad;

const DRIVE_LETTER_BY_SYSTEM_ID = {
  [SYSTEM_IDS.C_DRIVE]: 'C',
  [SYSTEM_IDS.D_DRIVE]: 'D',
  [SYSTEM_IDS.E_DRIVE]: 'E',
};

const REFERENCE_FOLDER_SPECS = [
  { path: 'C:/Documents and Settings/Default User', metadata: { hidden: true } },
  { path: 'C:/Documents and Settings/Default User/Desktop', icon: XP_ICONS.desktop },
  { path: 'C:/Documents and Settings/Default User/My Documents', icon: XP_ICONS.myDocuments },
  { path: 'C:/Documents and Settings/Default User/My Documents/My Music', icon: XP_ICONS.myMusic },
  { path: 'C:/Documents and Settings/Default User/My Documents/My Pictures', icon: XP_ICONS.myPictures },
  { path: 'C:/Documents and Settings/Default User/My Documents/My Videos', icon: XP_ICONS.folderVideos || XP_ICONS.folder },
  { path: 'C:/Documents and Settings/All Users/Desktop', icon: XP_ICONS.desktop },
  { path: 'C:/Documents and Settings/All Users/Favorites' },
  { path: 'C:/Documents and Settings/All Users/Shared Music', icon: XP_ICONS.folderMusic || XP_ICONS.folder },
  { path: 'C:/Documents and Settings/All Users/Shared Music/Sample Music' },
  { path: 'C:/Documents and Settings/All Users/Shared Pictures', icon: XP_ICONS.folderPictures || XP_ICONS.folder },
  { path: 'C:/Documents and Settings/All Users/Shared Pictures/Sample Pictures' },
  { path: 'C:/Documents and Settings/All Users/Shared Video', icon: XP_ICONS.folderVideos || XP_ICONS.folder },
  { path: 'C:/Documents and Settings/All Users/Start Menu', icon: XP_ICONS.startMenu || XP_ICONS.folder },
  { path: 'C:/Documents and Settings/All Users/Start Menu/Programs', icon: XP_ICONS.programs || XP_ICONS.folder },
  { path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories', icon: XP_ICONS.programs || XP_ICONS.folder },
  { path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/Entertainment', icon: XP_ICONS.programs || XP_ICONS.folder },
  { path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/System Tools', icon: XP_ICONS.programs || XP_ICONS.folder },
  { path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Games', icon: XP_ICONS.programs || XP_ICONS.folder },
  { path: 'C:/Program Files/Common Files' },
  { path: 'C:/Program Files/Internet Explorer/en-US' },
  { path: 'C:/Program Files/Movie Maker' },
  { path: 'C:/Program Files/Outlook Express' },
  { path: 'C:/Program Files/Windows Media Player/en-US' },
  { path: 'C:/Program Files/Windows Media Player/Media Renderer' },
  { path: 'C:/Program Files/Windows Media Player/Network Sharing' },
  { path: 'C:/Program Files/Windows Media Player/Skins' },
  { path: 'C:/Program Files/Windows Media Player/Visualizations' },
  { path: 'C:/Program Files/Windows NT' },
  { path: 'C:/WINDOWS/Help/Tours' },
  { path: 'C:/WINDOWS/Help/Tours/mmTour' },
  { path: 'C:/WINDOWS/LastGood' },
  { path: 'C:/WINDOWS/LastGood/INF' },
  { path: 'C:/WINDOWS/LastGood/system32' },
  { path: 'C:/WINDOWS/LastGood/system32/DRIVERS' },
  { path: 'C:/WINDOWS/pchealth/helpctr' },
  { path: 'C:/WINDOWS/pchealth/UploadLB' },
  { path: 'C:/WINDOWS/pchealth/UploadLB/Binaries' },
  { path: 'C:/WINDOWS/pchealth/UploadLB/Config' },
  { path: 'C:/WINDOWS/pss' },
  { path: 'C:/WINDOWS/Resources/Themes' },
  { path: 'C:/WINDOWS/Resources/Themes/Luna' },
  { path: 'C:/WINDOWS/Resources/Themes/Royale' },
  { path: 'C:/WINDOWS/Resources/Themes/Zune' },
  { path: 'C:/WINDOWS/Resources/Themes/Classic' },
  { path: 'C:/WINDOWS/security/Database' },
  { path: 'C:/WINDOWS/security/logs' },
  { path: 'C:/WINDOWS/security/templates' },
  { path: 'C:/WINDOWS/SoftwareDistribution/DataStore' },
  { path: 'C:/WINDOWS/SoftwareDistribution/DataStore/Logs' },
  { path: 'C:/WINDOWS/SoftwareDistribution/Download' },
  { path: 'C:/WINDOWS/SoftwareDistribution/EventCache' },
  { path: 'C:/WINDOWS/SoftwareDistribution/SelfUpdate' },
  { path: 'C:/WINDOWS/system' },
  { path: 'C:/WINDOWS/system32/Com' },
  { path: 'C:/WINDOWS/system32/Setup' },
  { path: 'C:/WINDOWS/system32/oobe/images' },
  { path: 'C:/WINDOWS/Web/Wallpaper', icon: XP_ICONS.folderPictures || XP_ICONS.folder },
  { path: 'C:/WINDOWS/WinSxS' },
];

const REFERENCE_FILE_SPECS = [
  {
    path: 'C:/BOOT.INI',
    icon: DEFAULT_INI_ICON,
    contentType: 'text/plain',
    content: ['[boot loader]', 'timeout=4', '/fastdetect'].join('\n'),
  },
  {
    path: 'C:/Documents and Settings/All Users/Shared Music/Sample Music/David Byrne - Like Humans Do.mp3',
    icon: DEFAULT_MP3_ICON,
    url: '/content/sample-music/David Byrne - Like Humans Do.mp3',
    size: 3709306,
  },
  {
    path: 'C:/Documents and Settings/All Users/Shared Music/Sample Music/New Stories - Highway Blues.mp3',
    icon: DEFAULT_MP3_ICON,
    url: '/content/sample-music/New Stories - Highway Blues.mp3',
    size: 1696965,
  },
  {
    path: "C:/Documents and Settings/All Users/Shared Music/Sample Music/Beethoven's Symphony No. 9 (Scherzo).mp3",
    icon: DEFAULT_MP3_ICON,
    url: '/content/sample-music/Beethovens Symphony No. 9 (Scherzo).mp3',
    size: 1318855,
  },
  {
    path: 'C:/Documents and Settings/All Users/Shared Pictures/Sample Pictures/Blue Hills.jpg',
    icon: DEFAULT_IMAGE_ICON,
    url: '/wallpapers/Bliss.jpg',
    size: 256000,
  },
  {
    path: 'C:/Documents and Settings/All Users/Shared Pictures/Sample Pictures/Sunset.jpg',
    icon: DEFAULT_IMAGE_ICON,
    url: '/wallpapers/Autumn.jpg',
    size: 256000,
  },
  {
    path: 'C:/Documents and Settings/All Users/Shared Pictures/Sample Pictures/Water Lilies.jpg',
    icon: DEFAULT_IMAGE_ICON,
    url: '/wallpapers/Tulips.jpg',
    size: 256000,
  },
  {
    path: 'C:/Documents and Settings/All Users/Shared Pictures/Sample Pictures/Winter.jpg',
    icon: DEFAULT_IMAGE_ICON,
    url: '/wallpapers/Radiance.jpg',
    size: 256000,
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Windows Catalog.url',
    icon: DEFAULT_URL_ICON,
    url: 'https://www.catalog.update.microsoft.com/',
    size: 256,
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Windows Update.url',
    icon: DEFAULT_URL_ICON,
    url: 'https://windowsupdate.microsoft.com/',
    size: 256,
  },
  {
    path: 'C:/WINDOWS/control.ini',
    icon: DEFAULT_INI_ICON,
    contentType: 'text/plain',
    content: '[drivers]\nwave=mmdrv.dll\n',
  },
  {
    path: 'C:/WINDOWS/system.ini',
    icon: DEFAULT_INI_ICON,
    contentType: 'text/plain',
    content: '[boot]\nshell=Explorer.exe\n',
  },
  {
    path: 'C:/WINDOWS/win.ini',
    icon: DEFAULT_INI_ICON,
    contentType: 'text/plain',
    content: '[windows]\nload=\nrun=\n',
  },
  {
    path: 'C:/WINDOWS/Resources/Themes/Luna.theme',
    icon: DEFAULT_TEXT_ICON,
    contentType: 'text/plain',
    content: '[Theme]\nDisplayName=Luna\n',
  },
  {
    path: 'C:/WINDOWS/Resources/Themes/Royale.theme',
    icon: DEFAULT_TEXT_ICON,
    contentType: 'text/plain',
    content: '[Theme]\nDisplayName=Royale\n',
  },
  {
    path: 'C:/WINDOWS/Resources/Themes/Zune.theme',
    icon: DEFAULT_TEXT_ICON,
    contentType: 'text/plain',
    content: '[Theme]\nDisplayName=Zune\n',
  },
  {
    path: 'C:/WINDOWS/Resources/Themes/Windows Classic.theme',
    icon: DEFAULT_TEXT_ICON,
    contentType: 'text/plain',
    content: '[Theme]\nDisplayName=Windows Classic\n',
  },
  {
    path: 'C:/WINDOWS/SoftwareDistribution/ReportingEvents.log',
    icon: DEFAULT_TEXT_ICON,
    contentType: 'text/plain',
    content: 'Windows Update service initialized.\n',
  },
  { path: 'C:/WINDOWS/Web/Wallpaper/Ascent.jpg', icon: DEFAULT_IMAGE_ICON, url: '/wallpapers/Ascent.jpg', size: 512000 },
  { path: 'C:/WINDOWS/Web/Wallpaper/Autumn.jpg', icon: DEFAULT_IMAGE_ICON, url: '/wallpapers/Autumn.jpg', size: 512000 },
  { path: 'C:/WINDOWS/Web/Wallpaper/Azul.jpg', icon: DEFAULT_IMAGE_ICON, url: '/wallpapers/Azul.jpg', size: 512000 },
  { path: 'C:/WINDOWS/Web/Wallpaper/Bliss.jpg', icon: DEFAULT_IMAGE_ICON, url: '/wallpapers/Bliss.jpg', size: 512000 },
  { path: 'C:/WINDOWS/Web/Wallpaper/Follow.jpg', icon: DEFAULT_IMAGE_ICON, url: '/wallpapers/Follow.jpg', size: 512000 },
  { path: 'C:/WINDOWS/Web/Wallpaper/Friend.jpg', icon: DEFAULT_IMAGE_ICON, url: '/wallpapers/Friend.jpg', size: 512000 },
  { path: 'C:/WINDOWS/Web/Wallpaper/Radiance.jpg', icon: DEFAULT_IMAGE_ICON, url: '/wallpapers/Radiance.jpg', size: 512000 },
  { path: 'C:/WINDOWS/Web/Wallpaper/Tulips.jpg', icon: DEFAULT_IMAGE_ICON, url: '/wallpapers/Tulips.jpg', size: 512000 },
  { path: 'C:/WINDOWS/Web/Wallpaper/Wind.jpg', icon: DEFAULT_IMAGE_ICON, url: '/wallpapers/Wind.jpg', size: 512000 },
];

const REFERENCE_EXECUTABLE_SPECS = [
  { path: 'C:/Program Files/Internet Explorer/iediagcmd.exe' },
  { path: 'C:/Program Files/Internet Explorer/iexplore.exe', target: 'Internet Explorer', icon: '/icons/xp/InternetExplorer6.png' },
  { path: 'C:/Program Files/Internet Explorer/ielowutil.exe' },
  { path: 'C:/Program Files/Outlook Express/msimn.exe', target: 'Outlook Express', icon: '/icons/outlook/outlook.png' },
  { path: 'C:/Program Files/Windows Media Player/setup_wm.exe' },
  { path: 'C:/Program Files/Windows Media Player/wmplayer.exe', target: 'Windows Media Player', icon: '/icons/xp/WindowsMediaPlayer9.png' },
  { path: 'C:/Program Files/Windows Media Player/migrate.exe' },
  { path: 'C:/Program Files/Windows Media Player/mplayer2.exe', target: 'Windows Media Player Classic', icon: '/icons/xp/WindowsMediaPlayer9.png' },
  { path: 'C:/WINDOWS/explorer.exe', target: 'My Computer', icon: '/icons/xp/MyComputer.png' },
  { path: 'C:/WINDOWS/NOTEPAD.exe', target: 'Notepad', icon: '/icons/xp/Notepad.png' },
  { path: 'C:/WINDOWS/regedit.exe', target: 'Registry Editor', icon: '/icons/regedit/root.png' },
  { path: 'C:/WINDOWS/TASKMAN.EXE', target: 'Task Manager', icon: '/icons/xp/taskmgr.png' },
  { path: 'C:/WINDOWS/winhlp32.exe', target: 'Help and Support', icon: '/icons/help.png' },
  { path: 'C:/WINDOWS/winver.exe', target: 'System Information', icon: '/icons/xp/system.png' },
  { path: 'C:/WINDOWS/system32/calc.exe', target: 'Calculator', icon: '/icons/xp/Calculator.png' },
  { path: 'C:/WINDOWS/system32/cmd.exe', target: 'Command Prompt', icon: '/icons/xp/CommandPrompt.png' },
  { path: 'C:/WINDOWS/system32/migwiz.exe', target: 'Transfer Wizard', icon: '/ui/migwiz.png' },
  { path: 'C:/WINDOWS/system32/mplayer2.exe', target: 'Windows Media Player Classic', icon: '/icons/xp/WindowsMediaPlayer9.png' },
  { path: 'C:/WINDOWS/system32/mspaint.exe', target: 'Paint', icon: '/icons/xp/Paint.png' },
  { path: 'C:/WINDOWS/system32/notepad.exe', target: 'Notepad', icon: '/icons/xp/Notepad.png' },
  { path: 'C:/WINDOWS/system32/regedt32.exe', target: 'Registry Editor', icon: '/icons/regedit/root.png' },
  { path: 'C:/WINDOWS/system32/sndrec32.exe', target: 'Sound Recorder', icon: '/icons/xp/SoundRecorder.webp' },
  { path: 'C:/WINDOWS/system32/sndvol32.exe', target: 'Volume Control', icon: '/icons/luna/volume_on.png' },
  { path: 'C:/WINDOWS/system32/sol.exe', target: 'Solitaire', icon: '/icons/solitaire-icon.png' },
  { path: 'C:/WINDOWS/system32/spider.exe', target: 'Spider Solitaire', icon: '/icons/spider-solitaire-icon.webp' },
  { path: 'C:/WINDOWS/system32/taskmgr.exe', target: 'Task Manager', icon: '/icons/xp/taskmgr.png' },
  { path: 'C:/WINDOWS/system32/winhlp32.exe', target: 'Help and Support', icon: '/icons/help.png' },
  { path: 'C:/WINDOWS/system32/winmine.exe', target: 'Minesweeper', icon: '/icons/xp/Minesweeper.png' },
  { path: 'C:/WINDOWS/system32/winver.exe', target: 'System Information', icon: '/icons/xp/system.png' },
  { path: 'C:/WINDOWS/system32/write.exe', target: 'WordPad', icon: '/icons/xp/wordpad.png' },
];

const REFERENCE_SHORTCUT_SPECS = [
  {
    path: 'C:/Documents and Settings/Default User/Desktop/My Documents.lnk',
    icon: XP_ICONS.myDocuments,
    fsTargetPath: 'C:/Documents and Settings/Default User/My Documents',
    targetType: 'folder',
  },
  {
    path: 'C:/Documents and Settings/Default User/Desktop/Internet Explorer.lnk',
    icon: '/icons/xp/InternetExplorer6.png',
    target: 'Internet Explorer',
  },
  {
    path: 'C:/Documents and Settings/Default User/Desktop/Windows Media Player.lnk',
    icon: '/icons/xp/WindowsMediaPlayer9.png',
    target: 'Windows Media Player',
  },
  {
    path: 'C:/Documents and Settings/Default User/Desktop/App Market.lnk',
    icon: '/icons/xp/AddorRemovePrograms.png',
    target: 'App Installer',
  },
  {
    path: 'C:/Documents and Settings/Default User/My Documents/My Music/Sample Music.lnk',
    icon: XP_ICONS.folder,
    fsTargetPath: 'C:/Documents and Settings/All Users/Shared Music/Sample Music',
    targetType: 'folder',
  },
  {
    path: 'C:/Documents and Settings/Default User/My Documents/My Music/Shared Music.lnk',
    icon: XP_ICONS.folderMusic || XP_ICONS.folder,
    fsTargetPath: 'C:/Documents and Settings/All Users/Shared Music',
    targetType: 'folder',
  },
  {
    path: 'C:/Documents and Settings/Default User/My Documents/My Pictures/Sample Pictures.lnk',
    icon: XP_ICONS.folder,
    fsTargetPath: 'C:/Documents and Settings/All Users/Shared Pictures/Sample Pictures',
    targetType: 'folder',
  },
  {
    path: 'C:/Documents and Settings/Default User/My Documents/My Pictures/Shared Pictures.lnk',
    icon: XP_ICONS.folderPictures || XP_ICONS.folder,
    fsTargetPath: 'C:/Documents and Settings/All Users/Shared Pictures',
    targetType: 'folder',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Set Program Access and Defaults.lnk',
    icon: '/icons/xp/AddorRemovePrograms.png',
    target: 'App Installer',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/Entertainment/Sound Recorder.lnk',
    icon: '/icons/xp/SoundRecorder.webp',
    target: 'Sound Recorder',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/Entertainment/Volume Control.lnk',
    icon: '/icons/luna/volume_on.png',
    target: 'Volume Control',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/Entertainment/Windows Media Player.lnk',
    icon: '/icons/xp/WindowsMediaPlayer9.png',
    target: 'Windows Media Player',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/System Tools/Backup.lnk',
    icon: '/ui/ntbackup.png',
    target: 'Backup Wizard',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/System Tools/Files and Settings Transfer Wizard.lnk',
    icon: '/ui/migwiz.png',
    target: 'Transfer Wizard',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/System Tools/Scheduled Tasks.lnk',
    icon: XP_ICONS.folder,
    fsTargetPath: 'C:/WINDOWS/Tasks',
    targetType: 'folder',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/System Tools/System Information.lnk',
    icon: '/icons/xp/system.png',
    target: 'System Information',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/Calculator.lnk',
    icon: '/icons/xp/Calculator.png',
    target: 'Calculator',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/Command Prompt.lnk',
    icon: '/icons/xp/CommandPrompt.png',
    target: 'Command Prompt',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/Notepad.lnk',
    icon: '/icons/xp/Notepad.png',
    target: 'Notepad',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/Paint.lnk',
    icon: '/icons/xp/Paint.png',
    target: 'Paint',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/Windows Explorer.lnk',
    icon: '/icons/luna/computer_explorer.png',
    target: 'My Computer',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Accessories/Wordpad.lnk',
    icon: '/icons/xp/wordpad.png',
    target: 'WordPad',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Games/Minesweeper.lnk',
    icon: '/icons/xp/Minesweeper.png',
    target: 'Minesweeper',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Games/Pinball.lnk',
    icon: '/icons/pinball-icon.png',
    target: 'Pinball',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Games/Solitaire.lnk',
    icon: '/icons/solitaire-icon.png',
    target: 'Solitaire',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Games/Spider Solitaire.lnk',
    icon: '/icons/spider-solitaire-icon.webp',
    target: 'Spider Solitaire',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Internet Explorer.lnk',
    icon: '/icons/xp/InternetExplorer6.png',
    target: 'Internet Explorer',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Outlook Express.lnk',
    icon: '/icons/outlook/outlook.png',
    target: 'Outlook Express',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Windows Media Player.lnk',
    icon: '/icons/xp/WindowsMediaPlayer9.png',
    target: 'Windows Media Player',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/Windows Messenger.lnk',
    icon: '/icons/xp/messenger.png',
    target: 'Windows Messenger',
  },
  {
    path: 'C:/Documents and Settings/All Users/Start Menu/Programs/App Installer.lnk',
    icon: '/icons/xp/AddorRemovePrograms.png',
    target: 'App Installer',
  },
];

const REFERENCE_FOLDER_SPEC_MAP = new Map(
  REFERENCE_FOLDER_SPECS.map((spec) => [normalizeVirtualPath(spec.path), spec])
);

function getDriveLetter(item) {
  const explicit = DRIVE_LETTER_BY_SYSTEM_ID[item?.id];
  if (explicit) {
    return explicit;
  }

  const name = item?.name || '';
  const match = name.match(/\(([A-Za-z]):\)/) || name.match(/^([A-Za-z]):/);
  return match ? match[1].toUpperCase() : null;
}

function getFileExtension(name) {
  const dotIndex = name.lastIndexOf('.');
  return dotIndex > 0 ? name.slice(dotIndex) : '';
}

function makeSeedId(path) {
  return `seed:${normalizeVirtualPath(path)}`;
}

function buildPathIndex(fileSystem) {
  const pathIndex = new Map();

  const visit = (id, currentPath) => {
    const item = fileSystem?.[id];
    if (!item) {
      return;
    }

    const normalizedPath = normalizeVirtualPath(currentPath);
    pathIndex.set(normalizedPath, id);

    (item.children || []).forEach((childId) => {
      const child = fileSystem[childId];
      if (!child?.name) {
        return;
      }
      visit(childId, joinVirtualPath(normalizedPath, child.name));
    });
  };

  Object.values(fileSystem || {})
    .filter((item) => item?.type === 'drive' && !item.parent)
    .forEach((drive) => {
      const driveLetter = getDriveLetter(drive);
      if (!driveLetter) {
        return;
      }
      visit(drive.id, `${driveLetter}:/`);
    });

  return pathIndex;
}

function ensureChild(fs, parentId, childId) {
  if (!parentId || !fs[parentId]) {
    return false;
  }

  const currentChildren = fs[parentId].children || [];
  if (currentChildren.includes(childId)) {
    return false;
  }

  fs[parentId] = {
    ...fs[parentId],
    children: [...currentChildren, childId],
  };
  return true;
}

function mergeMetadata(existingMetadata, nextMetadata) {
  if (!nextMetadata) {
    return existingMetadata;
  }

  return {
    ...(existingMetadata || {}),
    ...nextMetadata,
  };
}

function ensureFolder(fs, pathIndex, path, now) {
  const normalizedPath = normalizeVirtualPath(path);
  const existingId = pathIndex.get(normalizedPath);
  const folderSpec = REFERENCE_FOLDER_SPEC_MAP.get(normalizedPath);

  if (existingId && fs[existingId]) {
    const existingItem = fs[existingId];
    const nextIcon = folderSpec?.icon || existingItem.icon || DEFAULT_FOLDER_ICON;
    const nextMetadata = mergeMetadata(existingItem.metadata, folderSpec?.metadata);

    fs[existingId] = {
      ...existingItem,
      type: 'folder',
      icon: nextIcon,
      metadata: nextMetadata,
      children: existingItem.children || [],
    };
    return existingId;
  }

  const parentPath = dirnameVirtualPath(normalizedPath);
  const parentId = parentPath ? ensureFolder(fs, pathIndex, parentPath, now) : null;
  const id = makeSeedId(normalizedPath);
  const name = basenameVirtualPath(normalizedPath);

  fs[id] = {
    id,
    type: 'folder',
    name,
    icon: folderSpec?.icon || DEFAULT_FOLDER_ICON,
    parent: parentId,
    children: [],
    metadata: folderSpec?.metadata,
    dateCreated: now,
    dateModified: now,
  };

  if (ensureChild(fs, parentId, id)) {
    fs[parentId].dateModified = now;
  }

  pathIndex.set(normalizedPath, id);
  return id;
}

function upsertLeaf(fs, pathIndex, entry, now) {
  const normalizedPath = normalizeVirtualPath(entry.path);
  const parentPath = dirnameVirtualPath(normalizedPath);
  const parentId = ensureFolder(fs, pathIndex, parentPath, now);
  const existingId = pathIndex.get(normalizedPath);
  const name = basenameVirtualPath(normalizedPath);
  const ext = entry.ext || getFileExtension(name);
  const basename = ext ? name.slice(0, -ext.length) : name;
  const defaultSize = entry.type === 'shortcut' ? SHORTCUT_SIZE : entry.type === 'executable' ? 1024 * 1024 : 0;
  const nextId = existingId || makeSeedId(normalizedPath);
  const nextMetadata = mergeMetadata(fs[nextId]?.metadata, entry.metadata);

  const nextItem = {
    ...(fs[nextId] || {}),
    id: nextId,
    type: entry.type,
    name,
    basename,
    ext,
    icon: entry.icon || fs[nextId]?.icon || (entry.type === 'shortcut'
      ? DEFAULT_SHORTCUT_ICON
      : entry.type === 'executable'
      ? DEFAULT_EXECUTABLE_ICON
      : DEFAULT_FILE_ICON),
    parent: parentId,
    size: entry.size ?? fs[nextId]?.size ?? defaultSize,
    metadata: nextMetadata,
    dateCreated: fs[nextId]?.dateCreated || now,
    dateModified: now,
  };

  if (entry.content !== undefined && nextItem.content === undefined) {
    nextItem.content = entry.content;
  }
  if (entry.contentType && !nextItem.contentType) {
    nextItem.contentType = entry.contentType;
  }
  if (entry.url && !nextItem.url) {
    nextItem.url = entry.url;
  }
  if (entry.target && !nextItem.target) {
    nextItem.target = entry.target;
  }
  if (entry.fsTargetPath) {
    const targetId = pathIndex.get(normalizeVirtualPath(entry.fsTargetPath));
    if (targetId) {
      nextItem.fsId = targetId;
      nextItem.targetType = entry.targetType || fs[targetId]?.type || nextItem.targetType;
    }
  }

  fs[nextId] = nextItem;

  if (ensureChild(fs, parentId, nextId)) {
    fs[parentId].dateModified = now;
  }

  pathIndex.set(normalizedPath, nextId);
}

export function applyReferenceCDriveSeed(fs, { now = Date.now() } = {}) {
  if (!fs?.[SYSTEM_IDS.C_DRIVE]) {
    return false;
  }

  const pathIndex = buildPathIndex(fs);
  const folderEntries = [...REFERENCE_FOLDER_SPECS].sort(
    (a, b) => normalizeVirtualPath(a.path).split('/').length - normalizeVirtualPath(b.path).split('/').length
  );

  folderEntries.forEach((folderSpec) => {
    ensureFolder(fs, pathIndex, folderSpec.path, now);
  });

  REFERENCE_FILE_SPECS.forEach((fileSpec) => {
    upsertLeaf(fs, pathIndex, { ...fileSpec, type: 'file' }, now);
  });

  REFERENCE_EXECUTABLE_SPECS.forEach((exeSpec) => {
    upsertLeaf(fs, pathIndex, { ...exeSpec, type: 'executable' }, now);
  });

  REFERENCE_SHORTCUT_SPECS.forEach((shortcutSpec) => {
    upsertLeaf(fs, pathIndex, { ...shortcutSpec, type: 'shortcut' }, now);
  });

  return true;
}
