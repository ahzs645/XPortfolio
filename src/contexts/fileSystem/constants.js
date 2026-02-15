// Sort options
export const SortOptions = Object.freeze({
  NONE: 0,
  NAME: 1,
  SIZE: 2,
  DATE_CREATED: 3,
  DATE_MODIFIED: 4,
});

export const SortOrders = Object.freeze({
  ASCENDING: 0,
  DESCENDING: 1,
});

// File type icons mapping
export const fileIcons = {
  '.txt': '/icons/xp/Notepad.png',
  '.mp3': '/icons/media-player.png',
  '.mp4': '/icons/media-player.png',
  '.jpg': '/icons/image-viewer.png',
  '.jpeg': '/icons/image-viewer.png',
  '.png': '/icons/image-viewer.png',
  '.gif': '/icons/image-viewer.png',
  '.bmp': '/icons/paint.webp',
  '.pdf': '/icons/pdf/PDF.ico',
  '.docx': '/icons/xp/MSWord.gif',
  '.doc': '/icons/xp/MSWord.gif',
  '.xlsx': '/icons/xp/MSExcel-file.gif',
  '.xls': '/icons/xp/MSExcel-file.gif',
  '.html': '/icons/xp/InternetExplorer6.png',
  '.htm': '/icons/xp/InternetExplorer6.png',
  '.url': '/icons/xp/InternetExplorer6.png',
  '.lnk': '/icons/xp/Shortcutoverlay.png',
  '.ttf': '/icons/xp/font.png',
  '.otf': '/icons/xp/font.png',
  '.woff': '/icons/xp/font.png',
  '.woff2': '/icons/xp/font.png',
  '.fon': '/icons/xp/font.png',
  '.eml': '/icons/xp/Email.png',
};

// XP-style icons
export const XP_ICONS = {
  myComputer: '/icons/xp/MyComputer.png',
  folder: '/icons/xp/FolderClosed.png',
  folderOpen: '/icons/xp/FolderOpened.png',
  localDisk: '/icons/xp/LocalDisk.png',
  myDocuments: '/icons/xp/MyDocuments.png',
  myMusic: '/icons/xp/MyMusic.png',
  myPictures: '/icons/xp/MyPictures.png',
  desktop: '/icons/xp/Desktop.png',
  recycleBinEmpty: '/icons/xp/RecycleBinempty.png',
  recycleBinFull: '/icons/xp/RecycleBinfull.png',
  calculator: '/icons/xp/Calculator.png',
  minesweeper: '/icons/xp/Minesweeper.png',
  notepad: '/icons/xp/Notepad.png',
  displayProperties: '/icons/xp/DisplayProperties.png',
  file: '/icons/xp/JPG.png',
  rar: '/icons/xp/RAR.png',
  zipFolder: '/icons/xp/Zipfolder.png',
  email: '/icons/xp/Email.png',
  floppy: '/icons/xp/FloppyDisk.png',
  briefcase: '/icons/xp/Briefcase.png',
  bitmap: '/icons/xp/Bitmap.png',
  textDoc: '/icons/xp/GenericTextDocument.png',
  wav: '/icons/xp/WMV.png',
  shortcut: '/icons/xp/Shortcutoverlay.png',
  default: '/icons/xp/Default.png',
  controlPanel: '/icons/xp/ControlPanel.png',
  search: '/icons/xp/Search.png',
  help: '/icons/xp/HelpandSupport.png',
  programs: '/icons/xp/Programs.png',
  run: '/icons/xp/Run.png',
  startMenu: '/icons/xp/StartMenu.png',
  // Luna icons - Dialog
  dialogError: '/icons/luna/dialog_error.png',
  dialogWarning: '/icons/luna/dialog_warning.png',
  dialogInfo: '/icons/luna/dialog_info.png',
  // Luna icons - File types
  fileDoc: '/icons/luna/file_doc.png',
  fileXls: '/icons/luna/file_xls.png',
  filePpt: '/icons/luna/file_ppt.png',
  fileHtml: '/icons/luna/file_html.png',
  fileTxt: '/icons/luna/file_txt.png',
  fileJpg: '/icons/luna/file_jpg.png',
  fileBmp: '/icons/luna/file_bmp.png',
  fileIso: '/icons/luna/file_iso.png',
  fileCab: '/icons/luna/file_cab.png',
  fileGeneric: '/icons/luna/file_generic.png',
  fileExecutable: '/icons/luna/file_generic_executable.png',
  fileMedia: '/icons/luna/file_generic_media.png',
  fileFont: '/icons/luna/file_generic_font.png',
  // Luna icons - Special folders
  folderMusic: '/icons/luna/folder_music.png',
  folderPictures: '/icons/luna/folder_pictures.png',
  folderVideos: '/icons/luna/folder_videos.png',
  folderFonts: '/icons/luna/folder_fonts.png',
  folderCompressed: '/icons/luna/folder_compressed.png',
  folderNetwork: '/icons/luna/folder_network.png',
  folderShared: '/icons/luna/folder_shared.png',
  // Luna icons - Drives
  driveOptical: '/icons/luna/drive_optical.png',
  driveExternal: '/icons/luna/drive_external.png',
  driveFloppy: '/icons/luna/drive_floppy.png',
  // Luna icons - Network
  netConnections: '/icons/luna/net_connections.png',
  netInternet: '/icons/luna/net_internet.png',
  netLan: '/icons/luna/net_lan.png',
  netPlaces: '/icons/luna/net_places.png',
  // Luna icons - Devices
  printer: '/icons/luna/printer.png',
  scanner: '/icons/luna/scanner.png',
  camera: '/icons/luna/camera.png',
  camcorder: '/icons/luna/camcorder.png',
  gamepad: '/icons/luna/gamepad.png',
  // Luna icons - System
  volumeOn: '/icons/luna/volume_on.png',
  volumeOff: '/icons/luna/volume_off.png',
  lock: '/icons/luna/lock.png',
  shutdown: '/icons/luna/shutdown.png',
  logoff: '/icons/luna/logoff.png',
  accessibility: '/icons/luna/accessibility.png',
  recentDocs: '/icons/luna/recent_docs.png',
  personal: '/icons/luna/personal.png',
  people: '/icons/luna/people.png',
};

// Special folder IDs
export const SYSTEM_IDS = {
  C_DRIVE: 'c-drive',
  DOCUMENTS_AND_SETTINGS: 'documents-and-settings',
  USER_PROFILE: 'user-profile',
  ALL_USERS: 'all-users',
  PROGRAM_FILES: 'program-files',
  FAVORITES: 'favorites',
  START_MENU: 'start-menu',
  START_MENU_PROGRAMS: 'start-menu-programs',
  START_MENU_STARTUP: 'start-menu-startup',
  START_MENU_ACCESSORIES: 'start-menu-accessories',
  START_MENU_GAMES: 'start-menu-games',
  START_MENU_ENTERTAINMENT: 'start-menu-entertainment',
  MY_DOCUMENTS: 'my-documents',
  MY_PICTURES: 'my-pictures',
  MY_MUSIC: 'my-music',
  DESKTOP: 'desktop-folder',
  RECYCLE_BIN: 'recycle-bin',
  CONTROL_PANEL: 'control-panel', // Virtual location, not in file system
};

// Protected items that cannot be deleted
export const PROTECTED_ITEMS = [
  SYSTEM_IDS.C_DRIVE,
  SYSTEM_IDS.DOCUMENTS_AND_SETTINGS,
  SYSTEM_IDS.USER_PROFILE,
  SYSTEM_IDS.ALL_USERS,
  SYSTEM_IDS.PROGRAM_FILES,
  SYSTEM_IDS.FAVORITES,
  SYSTEM_IDS.START_MENU,
  SYSTEM_IDS.START_MENU_PROGRAMS,
  SYSTEM_IDS.START_MENU_STARTUP,
  SYSTEM_IDS.START_MENU_ACCESSORIES,
  SYSTEM_IDS.START_MENU_GAMES,
  SYSTEM_IDS.START_MENU_ENTERTAINMENT,
  SYSTEM_IDS.MY_DOCUMENTS,
  SYSTEM_IDS.MY_PICTURES,
  SYSTEM_IDS.MY_MUSIC,
  SYSTEM_IDS.DESKTOP,
  SYSTEM_IDS.RECYCLE_BIN,
];

// Shortcut file size in bytes (Windows .lnk files are typically small)
export const SHORTCUT_SIZE = 90; // 90 bytes like in reference

// Special system icons (not shortcuts, don't appear in Desktop folder)
export const SYSTEM_DESKTOP_ICONS = {
  myComputer: { id: 'system-my-computer', name: 'My Computer', icon: XP_ICONS.myComputer, target: 'My Computer', type: 'system' },
  recycleBin: { id: 'system-recycle-bin', name: 'Recycle Bin', icon: XP_ICONS.recycleBinEmpty, target: 'Recycle Bin', type: 'system' },
};
