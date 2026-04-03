import { lazy } from 'react';

const About = lazy(() => import('./About'));
const Resume = lazy(() => import('./Resume'));
const Projects = lazy(() => import('./Projects'));
const Contact = lazy(() => import('./Contact'));

const Calculator = lazy(() => import('./Calculator'));
const Notepad = lazy(() => import('./Notepad'));
const DisplayProperties = lazy(() => import('./DisplayProperties'));
const DateTimeProperties = lazy(() => import('./DateTimeProperties'));
const Minesweeper = lazy(() => import('./Minesweeper'));
const Solitaire = lazy(() => import('./Solitaire'));
const SpiderSolitaire = lazy(() => import('./SpiderSolitaire'));
const Pinball = lazy(() => import('./Pinball'));
const CMD = lazy(() => import('./CMD'));
const MediaPlayer = lazy(() => import('./MediaPlayer'));
const ImageViewer = lazy(() => import('./ImageViewer'));
const Paint = lazy(() => import('./Paint'));
const Winamp = lazy(() => import('./Winamp'));

const MyComputer = lazy(() => import('./MyComputer'));
const RecycleBin = lazy(() => import('./RecycleBin'));
const WinRAR = lazy(() => import('./WinRAR'));
const InternetExplorer = lazy(() => import('./InternetExplorer'));
const Properties = lazy(() => import('./Properties'));
const SoundRecorder = lazy(() => import('./SoundRecorder'));

const QQPenguin = lazy(() => import('./QQPenguin'));
const QQPet13 = lazy(() => import('./QQPet13'));
const QQArcade = lazy(() => import('./QQArcade'));
const Installer = lazy(() => import('./Installer'));
const IframeApp = lazy(() => import('./IframeApp'));
const Messenger = lazy(() => import('./Messenger'));
const SpeechProperties = lazy(() => import('./SpeechProperties'));
const SystemProperties = lazy(() => import('./SystemProperties'));
const SystemRecovery = lazy(() => import('./SystemRecovery'));
const UserAccounts = lazy(() => import('./UserAccounts'));
const Wordpad = lazy(() => import('./Wordpad'));
const MicrosoftWord = lazy(() => import('./MicrosoftWord'));
const MicrosoftExcel = lazy(() => import('./MicrosoftExcel'));
const HelpAndSupport = lazy(() => import('./HelpAndSupport'));
const FontViewer = lazy(() => import('./FontViewer'));
const OutlookExpress = lazy(() => import('./OutlookExpress'));
const NewMessage = lazy(() => import('./NewMessage'));
const TaskbarProperties = lazy(() => import('./TaskbarProperties'));
const AdobeReader = lazy(() => import('./AdobeReader'));
const ShortcutWizard = lazy(() => import('./ShortcutWizard'));
const BrowseForFolder = lazy(() => import('./BrowseForFolder'));
const ErrorDialog = lazy(() => import('./ErrorDialog'));
const MessageBox = lazy(() => import('./MessageBox'));
const OpenWith = lazy(() => import('./OpenWith'));
const TaskManager = lazy(() => import('./TaskManager'));
const OpenFileDialog = lazy(() => import('./OpenFileDialog'));
const MediaPlayerClassic = lazy(() => import('./MediaPlayerClassic'));
const BackupWizard = lazy(() => import('./BackupWizard'));
const TransferWizard = lazy(() => import('./TransferWizard'));
const MSNMessenger = lazy(() => import('./MSNMessenger'));
const MSNMessengerConversation = lazy(() => import('./MSNMessenger/ConversationApp'));
const FlashPlayer = lazy(() => import('./FlashPlayer'));
const WorldOfWarcraft = lazy(() => import('./WorldOfWarcraft'));
const RuneScape = lazy(() => import('./RuneScape'));
const Wizard101 = lazy(() => import('./Wizard101'));
const Run = lazy(() => import('./Run'));
const LegoIsland = lazy(() => import('./LegoIsland'));
const Diablo = lazy(() => import('./Diablo'));
const StarCraft = lazy(() => import('./StarCraft'));
const BlueScreenOfDeath = lazy(() => import('./BlueScreenOfDeath'));
const CommandAndConquer = lazy(() => import('./CommandAndConquer'));
const ESheep = lazy(() => import('./ESheep'));
const RedAlert2 = lazy(() => import('./RedAlert2'));
const RegistryEditor = lazy(() => import('./RegistryEditor'));
const RegistryEditValueDialog = lazy(() => import('./RegistryEditor/EditValueDialog'));
const RegistryNewValueDialog = lazy(() => import('./RegistryEditor/NewValueDialog'));
const RegistryNewKeyDialog = lazy(() => import('./RegistryEditor/NewKeyDialog'));
const FolderOptions = lazy(() => import('./FolderOptions'));
const DiskDefrag = lazy(() => import('./DiskDefrag'));
const SystemInformation = lazy(() => import('./SystemInformation'));
const CharacterMap = lazy(() => import('./CharacterMap'));
// ControlPanel is now integrated into MyComputer as a navigable view

// XP Icons paths
const XP_ICONS = {
  myComputer: '/icons/xp/MyComputer.png',
  notepad: '/icons/xp/Notepad.png',
  displayProperties: '/icons/xp/DisplayProperties.png',
  calculator: '/icons/xp/Calculator.png',
  minesweeper: '/icons/xp/Minesweeper.png',
  paint: '/icons/xp/Paint.png',
  cmd: '/icons/xp/CommandPrompt.png',
  mediaPlayer: '/icons/xp/WindowsMediaPlayer9.png',
  recycleBinEmpty: '/icons/xp/RecycleBinempty.png',
  recycleBinFull: '/icons/xp/RecycleBinfull.png',
  internetExplorer: '/icons/xp/InternetExplorer6.png',
  soundRecorder: '/icons/xp/SoundRecorder.webp',
  speechProperties: '/icons/xp/speech.png',
  systemProperties: '/icons/xp/system.png',
  userAccounts: '/icons/xp/UserAccounts.png',
  wordpad: '/icons/xp/wordpad.png',
  helpAndSupport: '/icons/help.png',
  fontViewer: '/icons/xp/font.png',
  outlookExpress: '/icons/outlook/outlook.png',
  adobeReader: '/icons/pdf/acroaum_grp107_lang1033.ico',
  backupWizard: '/icons/xp/tray/backup.png',
  transferWizard: '/icons/xp/tray/migrate.png',
  flashPlayer: '/icons/flash/flash_player.png',
  worldOfWarcraft: '/icons/games/wow.webp',
  microsoftWord: '/icons/xp/MSWord.png',
  microsoftExcel: '/icons/xp/MSExcel.gif',
};

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

// Map app names to categories
export const appCategoryMap = {
  // Portfolio apps
  'About Me': APP_CATEGORIES.PORTFOLIO,
  'Resume': APP_CATEGORIES.PORTFOLIO,
  'Projects': APP_CATEGORIES.PORTFOLIO,
  'Contact': APP_CATEGORIES.PORTFOLIO,

  // Windows Accessories
  'Calculator': APP_CATEGORIES.ACCESSORY,
  'Notepad': APP_CATEGORIES.ACCESSORY,
  'Paint': APP_CATEGORIES.ACCESSORY,
  'WordPad': APP_CATEGORIES.ACCESSORY,
  'Microsoft Word': APP_CATEGORIES.ACCESSORY,
  'Microsoft Excel': APP_CATEGORIES.ACCESSORY,
  'Command Prompt': APP_CATEGORIES.ACCESSORY,

  // Games
  'Minesweeper': APP_CATEGORIES.GAME,
  'Solitaire': APP_CATEGORIES.GAME,
  'Spider Solitaire': APP_CATEGORIES.GAME,
  'Pinball': APP_CATEGORIES.GAME,
  'eSheep': APP_CATEGORIES.GAME,

  // Media
  'Windows Media Player': APP_CATEGORIES.MEDIA,
  'Windows Media Player Classic': APP_CATEGORIES.MEDIA,
  'Winamp': APP_CATEGORIES.MEDIA,
  'Sound Recorder': APP_CATEGORIES.MEDIA,
  'Image Viewer': APP_CATEGORIES.MEDIA,
  'Adobe Flash Player': APP_CATEGORIES.MEDIA,

  // Internet
  'Internet Explorer': APP_CATEGORIES.INTERNET,
  'Outlook Express': APP_CATEGORIES.INTERNET,
  'Windows Messenger': APP_CATEGORIES.INTERNET,
  'MSN Messenger': APP_CATEGORIES.INTERNET,

  // System apps
  'My Computer': APP_CATEGORIES.SYSTEM,
  'Recycle Bin': APP_CATEGORIES.SYSTEM,
  'Control Panel': APP_CATEGORIES.SYSTEM,
  'Display Properties': APP_CATEGORIES.SYSTEM,
  'Date/Time Properties': APP_CATEGORIES.SYSTEM,
  'System Properties': APP_CATEGORIES.SYSTEM,
  'Speech Properties': APP_CATEGORIES.SYSTEM,
  'Taskbar Properties': APP_CATEGORIES.SYSTEM,
  'Folder Options': APP_CATEGORIES.SYSTEM,
  'Disk Defragmenter': APP_CATEGORIES.SYSTEM,
  'Character Map': APP_CATEGORIES.ACCESSORY,
  'System Information': APP_CATEGORIES.SYSTEM,
  'Task Manager': APP_CATEGORIES.SYSTEM,
  'User Accounts': APP_CATEGORIES.SYSTEM,
  'Add or Remove Programs': APP_CATEGORIES.SYSTEM,
  'App Installer': APP_CATEGORIES.SYSTEM,
  'Help and Support': APP_CATEGORIES.SYSTEM,
  'System Recovery': APP_CATEGORIES.SYSTEM,
  'Backup Wizard': APP_CATEGORIES.SYSTEM,
  'Transfer Wizard': APP_CATEGORIES.SYSTEM,

  // Utilities
  'Properties': APP_CATEGORIES.UTILITY,
  'WinRAR': APP_CATEGORIES.UTILITY,
  'Font Viewer': APP_CATEGORIES.UTILITY,
  'Adobe Reader': APP_CATEGORIES.UTILITY,
  'Create Shortcut': APP_CATEGORIES.UTILITY,
  'Browse For Folder': APP_CATEGORIES.UTILITY,
  'Open With': APP_CATEGORIES.UTILITY,
  'Run': APP_CATEGORIES.UTILITY,
  'Blue Screen of Death': APP_CATEGORIES.GAME,
  'Registry Editor': APP_CATEGORIES.SYSTEM,

  // Fun/Extra
  'QQ Penguin': APP_CATEGORIES.GAME,
  'QQ Pet 13': APP_CATEGORIES.GAME,
  'QQ Arcade': APP_CATEGORIES.GAME,
  'World of Warcraft': APP_CATEGORIES.GAME,
  'RuneScape Classic': APP_CATEGORIES.GAME,
  'Wizard101': APP_CATEGORIES.GAME,
  'LEGO Island': APP_CATEGORIES.GAME,
  'Diablo': APP_CATEGORIES.GAME,
  'StarCraft': APP_CATEGORIES.GAME,
  'Command & Conquer': APP_CATEGORIES.GAME,
  'Red Alert 2': APP_CATEGORIES.GAME,
};

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

// Full catalog of all available desktop icons
export const desktopIconCatalog = {
  about: {
    icon: '/icons/about.webp',
    title: 'About Me',
    component: About,
  },
  resume: {
    icon: '/icons/resume.webp',
    title: 'Resume',
    component: Resume,
  },
  projects: {
    icon: '/icons/projects.webp',
    title: 'Projects',
    component: Projects,
  },
  contact: {
    icon: '/icons/outlook/write.png',
    title: 'Contact',
    component: NewMessage,
  },
  calculator: {
    icon: XP_ICONS.calculator,
    title: 'Calculator',
    component: Calculator,
  },
  notepad: {
    icon: XP_ICONS.notepad,
    title: 'Notepad',
    component: Notepad,
  },
  displayProperties: {
    icon: XP_ICONS.displayProperties,
    title: 'Display Properties',
    component: DisplayProperties,
  },
  minesweeper: {
    icon: XP_ICONS.minesweeper,
    title: 'Minesweeper',
    component: Minesweeper,
  },
  solitaire: {
    icon: '/icons/solitaire-icon.png',
    title: 'Solitaire',
    component: Solitaire,
  },
  spiderSolitaire: {
    icon: '/icons/spider-solitaire-icon.webp',
    title: 'Spider Solitaire',
    component: SpiderSolitaire,
  },
  pinball: {
    icon: '/icons/pinball-icon.png',
    title: '3D Pinball',
    component: Pinball,
  },
  cmd: {
    icon: XP_ICONS.cmd,
    title: 'Command Prompt',
    component: CMD,
  },
  mediaPlayer: {
    icon: XP_ICONS.mediaPlayer,
    title: 'Windows Media Player',
    component: MediaPlayer,
  },
  mediaPlayerClassic: {
    icon: XP_ICONS.mediaPlayer,
    title: 'Windows Media Player Classic',
    component: MediaPlayerClassic,
  },
  imageViewer: {
    icon: '/apps/openlair-viewer/static/images/icon/viewer.png',
    title: 'Windows Picture and Fax Viewer',
    component: ImageViewer,
  },
  paint: {
    icon: XP_ICONS.paint,
    title: 'Paint',
    component: Paint,
  },
  winamp: {
    icon: '/icons/winamp.png',
    title: 'Winamp',
    component: Winamp,
  },
  myComputer: {
    icon: '/icons/xp/MyComputer.png',
    title: 'My Computer',
    component: MyComputer,
  },
  recycleBin: {
    icon: XP_ICONS.recycleBinEmpty,
    title: 'Recycle Bin',
    component: RecycleBin,
  },
  internetExplorer: {
    icon: XP_ICONS.internetExplorer,
    title: 'Internet Explorer',
    component: InternetExplorer,
  },
  soundRecorder: {
    icon: XP_ICONS.soundRecorder,
    title: 'Sound Recorder',
    component: SoundRecorder,
  },
  qqPenguin: {
    icon: '/icons/qqpet.ico',
    title: 'QQ Pet',
    component: QQPenguin,
  },
  qqPet13: {
    icon: '/games/QQPet13/logo.png',
    title: 'QQ Pet 13',
    component: QQPet13,
  },
  qqArcade: {
    icon: '/games/QQArcade/icon.png',
    title: 'QQ Arcade',
    component: QQArcade,
  },
  installer: {
    icon: '/icons/xp/programs/add.png',
    title: 'Add or Remove Programs',
    component: Installer,
  },
  messenger: {
    icon: '/icons/xp/messenger.png',
    title: 'Windows Messenger',
    component: Messenger,
  },
  msnMessenger: {
    icon: '/icons/xp/messenger.png',
    title: 'MSN Messenger',
    component: MSNMessenger,
  },
  speechProperties: {
    icon: XP_ICONS.speechProperties,
    title: 'Speech Properties',
    component: SpeechProperties,
  },
  systemProperties: {
    icon: XP_ICONS.systemProperties,
    title: 'System Properties',
    component: SystemProperties,
  },
  userAccounts: {
    icon: XP_ICONS.userAccounts,
    title: 'User Accounts',
    component: UserAccounts,
  },
  wordpad: {
    icon: XP_ICONS.wordpad,
    title: 'WordPad',
    component: Wordpad,
  },
  helpAndSupport: {
    icon: XP_ICONS.helpAndSupport,
    title: 'Help and Support',
    component: HelpAndSupport,
  },
  outlookExpress: {
    icon: XP_ICONS.outlookExpress,
    title: 'Outlook Express',
    component: OutlookExpress,
  },
  adobeReader: {
    icon: XP_ICONS.adobeReader,
    title: 'Adobe Reader',
    component: AdobeReader,
  },
  taskManager: {
    icon: '/icons/xp/taskmgr.png',
    title: 'Task Manager',
    component: TaskManager,
  },
  backupWizard: {
    icon: XP_ICONS.backupWizard,
    title: 'Backup Wizard',
    component: BackupWizard,
  },
  transferWizard: {
    icon: XP_ICONS.transferWizard,
    title: 'Transfer Wizard',
    component: TransferWizard,
  },
  flashPlayer: {
    icon: XP_ICONS.flashPlayer,
    title: 'Adobe Flash Player',
    component: FlashPlayer,
  },
  worldOfWarcraft: {
    icon: XP_ICONS.worldOfWarcraft,
    title: 'World of Warcraft',
    component: WorldOfWarcraft,
  },
  runescape: {
    icon: '/icons/runescape-icon.png',
    title: 'RuneScape Classic',
    component: RuneScape,
  },
  wizard101: {
    icon: '/apps/wizard101/images/icon.ico',
    title: 'Wizard101',
    component: Wizard101,
  },
  legoIsland: {
    icon: '/icons/games/lego-island.webp',
    title: 'LEGO Island',
    component: LegoIsland,
  },
  diablo: {
    icon: '/icons/games/diablo.png',
    title: 'Diablo',
    component: Diablo,
  },
  starcraft: {
    icon: '/icons/games/starcraft.png',
    title: 'StarCraft',
    component: StarCraft,
  },
  commandAndConquer: {
    icon: '/icons/games/command-and-conquer.ico',
    title: 'Command & Conquer',
    component: CommandAndConquer,
  },
  redAlert2: {
    icon: '/icons/games/red-alert2.png',
    title: 'C&C: Red Alert 2',
    component: RedAlert2,
  },
  blueScreenOfDeath: {
    icon: '/icons/luna/dialog_error.png',
    title: 'Blue Screen of Death',
    component: BlueScreenOfDeath,
  },
  registryEditor: {
    icon: '/icons/luna/regedit.ico',
    title: 'Registry Editor',
    component: RegistryEditor,
  },
  systemInformation: {
    icon: '/icons/xp/system.png',
    title: 'System Information',
    component: SystemInformation,
  },
};

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

// Map catalog IDs to appSettings keys for target
const CATALOG_TO_APP_KEY = {
  about: 'About Me',
  resume: 'Resume',
  projects: 'Projects',
  contact: 'Contact',
  calculator: 'Calculator',
  notepad: 'Notepad',
  displayProperties: 'Display Properties',
  minesweeper: 'Minesweeper',
  solitaire: 'Solitaire',
  spiderSolitaire: 'Spider Solitaire',
  pinball: 'Pinball',
  cmd: 'Command Prompt',
  mediaPlayer: 'Windows Media Player',
  mediaPlayerClassic: 'Windows Media Player Classic',
  imageViewer: 'Image Viewer',
  paint: 'Paint',
  winamp: 'Winamp',
  myComputer: 'My Computer',
  recycleBin: 'Recycle Bin',
  internetExplorer: 'Internet Explorer',
  soundRecorder: 'Sound Recorder',
  qqPenguin: 'QQ Penguin',
  qqPet13: 'QQ Pet 13',
  qqArcade: 'QQ Arcade',
  installer: 'App Installer',
  messenger: 'Windows Messenger',
  msnMessenger: 'MSN Messenger',
  speechProperties: 'Speech Properties',
  systemProperties: 'System Properties',
  userAccounts: 'User Accounts',
  wordpad: 'WordPad',
  helpAndSupport: 'Help and Support',
  outlookExpress: 'Outlook Express',
  adobeReader: 'Adobe Reader',
  taskManager: 'Task Manager',
  backupWizard: 'Backup Wizard',
  transferWizard: 'Transfer Wizard',
  flashPlayer: 'Adobe Flash Player',
  worldOfWarcraft: 'World of Warcraft',
  runescape: 'RuneScape Classic',
  wizard101: 'Wizard101',
  legoIsland: 'LEGO Island',
  diablo: 'Diablo',
  starcraft: 'StarCraft',
  commandAndConquer: 'Command & Conquer',
  redAlert2: 'Red Alert 2',
  blueScreenOfDeath: 'Blue Screen of Death',
  esheep: 'eSheep',
  registryEditor: 'Registry Editor',
  diskDefrag: 'Disk Defragmenter',
  characterMap: 'Character Map',
  systemInformation: 'System Information',
};

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

// App settings for launching from menu and icons
export const appSettings = {
  'About Me': {
    header: {
      icon: '/icons/about.webp',
      title: 'About Me',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: About,
    defaultSize: {
      width: 776,
      height: 556,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Resume: {
    header: {
      icon: '/icons/pdf/acroaum_grp107_lang1033.ico',
      title: 'Adobe Reader - [CV.pdf]',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: AdobeReader,
    injectProps: {
      pdfPath: '/CV.pdf',
      pdfName: 'CV.pdf',
    },
    defaultSize: {
      width: 800,
      height: 600,
    },
    defaultOffset: {
      x: 120,
      y: 30,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Projects: {
    header: {
      icon: '/icons/projects.webp',
      title: 'My Projects',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Projects,
    defaultSize: {
      width: 750,
      height: 500,
    },
    defaultOffset: {
      x: 80,
      y: 60,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Contact: {
    header: {
      icon: '/icons/outlook/write.png',
      title: 'New Message',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: NewMessage,
    defaultSize: {
      width: 640,
      height: 480,
    },
    defaultOffset: {
      x: 150,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  Calculator: {
    header: {
      icon: XP_ICONS.calculator,
      title: 'Calculator',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Calculator,
    defaultSize: {
      width: 250,
      height: 310,
    },
    minSize: {
      width: 250,
      height: 310,
    },
    defaultOffset: {
      x: 200,
      y: 100,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  Notepad: {
    header: {
      icon: XP_ICONS.notepad,
      title: 'Untitled - Notepad',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Notepad,
    defaultSize: {
      width: 500,
      height: 400,
    },
    defaultOffset: {
      x: 180,
      y: 80,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Display Properties': {
    header: {
      icon: XP_ICONS.displayProperties,
      title: 'Display Properties',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: DisplayProperties,
    defaultSize: {
      width: 500,
      height: 640,
    },
    defaultOffset: {
      x: 200,
      y: 100,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Date and Time Properties': {
    header: {
      icon: '/icons/xp/DateTime.png',
      title: 'Date and Time Properties',
      buttons: ['close'],
    },
    component: DateTimeProperties,
    defaultSize: {
      width: 400,
      height: 380,
    },
    defaultOffset: {
      x: 200,
      y: 100,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Folder Options': {
    header: {
      icon: '/icons/xp/FolderClosed.png',
      title: 'Folder Options',
      buttons: ['close'],
    },
    component: FolderOptions,
    defaultSize: {
      width: 380,
      height: 443,
    },
    defaultOffset: {
      x: 250,
      y: 120,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Disk Defragmenter': {
    header: {
      icon: '/icons/xp/DiskDefrag.png',
      title: 'Disk Defragmenter',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: DiskDefrag,
    defaultSize: {
      width: 640,
      height: 480,
    },
    defaultOffset: {
      x: 150,
      y: 80,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'System Information': {
    header: {
      icon: '/icons/xp/system.png',
      title: 'System Information',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: SystemInformation,
    defaultSize: {
      width: 660,
      height: 480,
    },
    defaultOffset: {
      x: 130,
      y: 60,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Character Map': {
    header: {
      icon: '/icons/xp/font.png',
      title: 'Character Map',
      buttons: ['minimize', 'close'],
    },
    component: CharacterMap,
    defaultSize: {
      width: 450,
      height: 470,
    },
    minSize: {
      width: 370,
      height: 350,
    },
    defaultOffset: {
      x: 180,
      y: 90,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Minesweeper: {
    header: {
      icon: XP_ICONS.minesweeper,
      title: 'Minesweeper',
      buttons: ['minimize', 'close'],
    },
    component: Minesweeper,
    defaultSize: {
      width: 162,
      height: 0,
    },
    defaultOffset: {
      x: 150,
      y: 100,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  Paint: {
    header: {
      icon: XP_ICONS.paint,
      title: 'Paint',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Paint,
    defaultSize: {
      width: 800,
      height: 600,
    },
    defaultOffset: {
      x: 50,
      y: 30,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
    mobileAvailable: false,  // Paint requires mouse precision
  },
  Solitaire: {
    header: {
      icon: '/icons/solitaire-icon.png',
      title: 'Solitaire',
      buttons: ['minimize', 'close'],
    },
    component: Solitaire,
    defaultSize: {
      width: 680,
      height: 490,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Spider Solitaire': {
    header: {
      icon: '/icons/spider-solitaire-icon.webp',
      title: 'Spider Solitaire',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: SpiderSolitaire,
    defaultSize: {
      width: 800,
      height: 600,
    },
    defaultOffset: {
      x: 80,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Pinball: {
    header: {
      icon: '/icons/pinball-icon.png',
      title: '3D Pinball for Windows - Space Cadet',
      buttons: ['minimize', 'close'],
    },
    component: Pinball,
    defaultSize: {
      width: 610,
      height: 475,
    },
    defaultOffset: {
      x: 120,
      y: 60,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
    mobileAvailable: false,  // Pinball requires keyboard controls
  },
  CMD: {
    header: {
      icon: XP_ICONS.cmd,
      title: 'Command Prompt',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: CMD,
    defaultSize: {
      width: 680,
      height: 400,
    },
    defaultOffset: {
      x: 100,
      y: 80,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Command Prompt': {
    header: {
      icon: XP_ICONS.cmd,
      title: 'Command Prompt',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: CMD,
    defaultSize: {
      width: 680,
      height: 400,
    },
    defaultOffset: {
      x: 100,
      y: 80,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Media Player': {
    header: {
      icon: XP_ICONS.mediaPlayer,
      title: 'Windows Media Player',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: MediaPlayer,
    defaultSize: {
      width: 640,
      height: 480,
    },
    defaultOffset: {
      x: 80,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
    mobileAvailable: false,  // Media Player has complex UI not suited for mobile
  },
  'Windows Media Player': {
    header: {
      icon: XP_ICONS.mediaPlayer,
      title: 'Windows Media Player',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: MediaPlayer,
    defaultSize: {
      width: 640,
      height: 480,
    },
    defaultOffset: {
      x: 80,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
    mobileAvailable: false,  // Media Player has complex UI not suited for mobile
  },
  'Windows Media Player Classic': {
    header: {
      icon: XP_ICONS.mediaPlayer,
      title: 'Windows Media Player',
      buttons: ['minimize', 'maximize', 'close'],
      invisible: true,
    },
    component: MediaPlayerClassic,
    defaultSize: {
      width: 640,
      height: 533,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Image Viewer': {
    header: {
      icon: '/apps/openlair-viewer/static/images/icon/viewer.png',
      title: 'Windows Picture and Fax Viewer',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: ImageViewer,
    defaultSize: {
      width: 700,
      height: 540,
    },
    defaultOffset: {
      x: 120,
      y: 70,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'My Computer': {
    header: {
      icon: '/icons/xp/MyComputer.png',
      title: 'My Computer',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: MyComputer,
    defaultSize: {
      width: 660,
      height: 500,
    },
    defaultOffset: {
      x: 140,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Help and Support': {
    header: {
      icon: XP_ICONS.helpAndSupport,
      title: 'Help and Support Center',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: HelpAndSupport,
    defaultSize: {
      width: 808,
      height: 584,
    },
    defaultOffset: {
      x: 80,
      y: 80,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Recycle Bin': {
    header: {
      icon: XP_ICONS.recycleBinEmpty,
      title: 'Recycle Bin',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: RecycleBin,
    defaultSize: {
      width: 660,
      height: 500,
    },
    defaultOffset: {
      x: 140,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  Winamp: {
    header: {
      icon: '/icons/winamp.png',
      title: 'Winamp',
      invisible: true,
    },
    component: Winamp,
    defaultSize: {
      width: 0,
      height: 0,
    },
    defaultOffset: {
      x: 0,
      y: 0,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  WinRAR: {
    header: {
      icon: '/icons/xp/RAR.png',
      title: 'WinRAR',
      buttons: ['close'],
    },
    component: WinRAR,
    defaultSize: {
      width: 280,
      height: 180,
    },
    defaultOffset: {
      x: 200,
      y: 150,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Internet Explorer': {
    header: {
      icon: XP_ICONS.internetExplorer,
      title: 'Internet Explorer',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: InternetExplorer,
    defaultSize: {
      width: 900,
      height: 600,
    },
    defaultOffset: {
      x: 80,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  Properties: {
    header: {
      icon: '/icons/xp/DisplayProperties.png',
      title: 'Properties',
      buttons: ['close'],
    },
    component: Properties,
    defaultSize: {
      width: 350,
      height: 460,
    },
    defaultOffset: {
      x: 200,
      y: 100,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Sound Recorder': {
    header: {
      icon: XP_ICONS.soundRecorder,
      title: 'Sound - Sound Recorder',
      buttons: ['minimize', 'close'],
    },
    component: SoundRecorder,
    defaultSize: {
      width: 280,
      height: 180,
    },
    defaultOffset: {
      x: 200,
      y: 150,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'QQ Penguin': {
    header: {
      icon: '/icons/qqpet.ico',
      title: 'QQ Pet',
      invisible: true,
    },
    component: QQPenguin,
    defaultSize: {
      width: 0,
      height: 0,
    },
    defaultOffset: {
      x: 0,
      y: 0,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'QQ Pet 13': {
    header: {
      icon: '/games/QQPet13/logo.png',
      title: 'QQ Pet 13',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: QQPet13,
    defaultSize: {
      width: 890,
      height: 530,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'QQ Arcade': {
    header: {
      icon: '/games/QQArcade/icon.png',
      title: 'QQ Arcade',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: QQArcade,
    defaultSize: {
      width: 900,
      height: 650,
    },
    defaultOffset: {
      x: 80,
      y: 30,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Add or Remove Programs': {
    header: {
      icon: '/icons/xp/programs/add.png',
      title: 'Add or Remove Programs',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Installer,
    defaultSize: {
      width: 620,
      height: 520,
    },
    defaultOffset: {
      x: 80,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  // Alias for backwards compatibility
  'App Installer': {
    header: {
      icon: '/icons/xp/programs/add.png',
      title: 'Add or Remove Programs',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Installer,
    defaultSize: {
      width: 620,
      height: 520,
    },
    defaultOffset: {
      x: 80,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Installed App': {
    header: {
      icon: '/icons/xp/Programs.png',
      title: 'Web App',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: IframeApp,
    defaultSize: {
      width: 800,
      height: 600,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Windows Messenger': {
    header: {
      icon: '/icons/xp/messenger.png',
      title: 'Windows Messenger',
      buttons: ['minimize', 'close'],
    },
    component: Messenger,
    defaultSize: {
      width: 218,
      height: 434,
    },
    defaultOffset: {
      x: 110,
      y: 110,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'MSN Messenger': {
    header: {
      icon: '/icons/xp/messenger.png',
      title: 'MSN Messenger',
      buttons: ['minimize', 'maximize', 'close'],
      invisible: true,
    },
    component: MSNMessenger,
    defaultSize: {
      width: 280,
      height: 540,
    },
    minSize: {
      width: 280,
      height: 540,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'MSN Messenger Conversation': {
    header: {
      icon: '/icons/xp/messenger.png',
      title: 'MSN Messenger Conversation',
      buttons: ['minimize', 'maximize', 'close'],
      invisible: true,
    },
    component: MSNMessengerConversation,
    defaultSize: {
      width: 560,
      height: 540,
    },
    minSize: {
      width: 560,
      height: 540,
    },
    defaultOffset: {
      x: 140,
      y: 80,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Speech Properties': {
    header: {
      icon: XP_ICONS.speechProperties,
      title: 'Speech Properties',
      buttons: ['close'],
    },
    component: SpeechProperties,
    defaultSize: {
      width: 408,
      height: 540,
    },
    defaultOffset: {
      x: 200,
      y: 100,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'System Properties': {
    header: {
      icon: XP_ICONS.systemProperties,
      title: 'System Properties',
      buttons: ['close'],
    },
    component: SystemProperties,
    defaultSize: {
      width: 408,
      height: 435,
    },
    defaultOffset: {
      x: 200,
      y: 100,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'System Recovery': {
    header: {
      icon: '/icons/xp/Recovery.png',
      title: 'System Recovery',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: SystemRecovery,
    defaultSize: {
      width: 508,
      height: 334,
    },
    defaultOffset: {
      x: 140,
      y: 140,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'User Accounts': {
    header: {
      icon: XP_ICONS.userAccounts,
      title: 'User Accounts',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: UserAccounts,
    defaultSize: {
      width: 708,
      height: 534,
    },
    defaultOffset: {
      x: 80,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  WordPad: {
    header: {
      icon: XP_ICONS.wordpad,
      title: 'Document - WordPad',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Wordpad,
    defaultSize: {
      width: 608,
      height: 534,
    },
    defaultOffset: {
      x: 120,
      y: 60,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Microsoft Word': {
    header: {
      icon: XP_ICONS.microsoftWord,
      title: 'Microsoft Word',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: MicrosoftWord,
    defaultSize: {
      width: 900,
      height: 700,
    },
    minSize: {
      width: 500,
      height: 400,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Microsoft Excel': {
    header: {
      icon: XP_ICONS.microsoftExcel,
      title: 'Microsoft Excel',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: MicrosoftExcel,
    defaultSize: {
      width: 1000,
      height: 700,
    },
    minSize: {
      width: 600,
      height: 400,
    },
    defaultOffset: {
      x: 80,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Font Viewer': {
    header: {
      icon: XP_ICONS.fontViewer,
      title: 'Font Preview',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: FontViewer,
    defaultSize: {
      width: 708,
      height: 534,
    },
    defaultOffset: {
      x: 50,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Outlook Express': {
    header: {
      icon: XP_ICONS.outlookExpress,
      title: 'Outlook Express',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: OutlookExpress,
    defaultSize: {
      width: 708,
      height: 534,
    },
    defaultOffset: {
      x: 140,
      y: 140,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'New Message': {
    header: {
      icon: '/icons/outlook/write.png',
      title: 'New Message',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: NewMessage,
    defaultSize: {
      width: 640,
      height: 480,
    },
    defaultOffset: {
      x: 180,
      y: 80,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Taskbar Properties': {
    header: {
      icon: '/icons/xp/DisplayProperties.png',
      title: 'Taskbar and Start Menu Properties',
      buttons: ['close'],
    },
    component: TaskbarProperties,
    defaultSize: {
      width: 408,
      height: 480,
    },
    defaultOffset: {
      x: 200,
      y: 100,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Adobe Reader': {
    header: {
      icon: XP_ICONS.adobeReader,
      title: 'Adobe Reader',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: AdobeReader,
    defaultSize: {
      width: 900,
      height: 650,
    },
    defaultOffset: {
      x: 60,
      y: 30,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Create Shortcut': {
    header: {
      icon: '/icons/xp/Shortcutoverlay.png',
      title: 'Create Shortcut',
      buttons: ['close'],
    },
    component: ShortcutWizard,
    defaultSize: {
      width: 500,
      height: 380,
    },
    defaultOffset: {
      x: 200,
      y: 100,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Browse For Folder': {
    header: {
      icon: '/icons/xp/Folder.png',
      title: 'Browse For Folder',
      buttons: ['help', 'close'],
    },
    component: BrowseForFolder,
    defaultSize: {
      width: 320,
      height: 400,
    },
    defaultOffset: {
      x: 250,
      y: 120,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Error Dialog': {
    header: {
      icon: '/icons/xp/Error.png',
      title: 'Error',
      buttons: ['close'],
    },
    component: ErrorDialog,
    defaultSize: {
      width: 420,
      height: 'auto',
    },
    defaultOffset: {
      x: 300,
      y: 200,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Message Box': {
    header: {
      icon: '/icons/xp/Critical.png',
      title: 'Windows',
      buttons: ['close'],
    },
    component: MessageBox,
    defaultSize: {
      width: 420,
      height: 'auto',
    },
    defaultOffset: {
      x: 300,
      y: 200,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Open With': {
    header: {
      icon: '/icons/xp/Default.png',
      title: 'Open With',
      buttons: ['close'],
    },
    component: OpenWith,
    defaultSize: {
      width: 420,
      height: 'auto',
    },
    defaultOffset: {
      x: 250,
      y: 150,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Open File': {
    header: {
      icon: '/icons/xp/FolderOpened.png',
      title: 'Open',
      buttons: ['close'],
    },
    component: OpenFileDialog,
    defaultSize: {
      width: 500,
      height: 400,
    },
    defaultOffset: {
      x: 200,
      y: 100,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Task Manager': {
    header: {
      icon: '/icons/xp/taskmgr.png',
      title: 'Windows Task Manager',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: TaskManager,
    defaultSize: {
      width: 400,
      height: 450,
    },
    defaultOffset: {
      x: 200,
      y: 100,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Backup Wizard': {
    header: {
      icon: XP_ICONS.backupWizard,
      title: 'Backup or Restore Wizard',
      buttons: ['help', 'minimize', 'maximize', 'close'],
    },
    component: BackupWizard,
    defaultSize: {
      width: 500,
      height: 390,
    },
    defaultOffset: {
      x: 100,
      y: 100,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Transfer Wizard': {
    header: {
      icon: XP_ICONS.transferWizard,
      title: 'Files and Settings Transfer Wizard',
      buttons: ['help', 'minimize', 'maximize', 'close'],
    },
    component: TransferWizard,
    defaultSize: {
      width: 500,
      height: 390,
    },
    defaultOffset: {
      x: 120,
      y: 120,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Adobe Flash Player': {
    header: {
      icon: XP_ICONS.flashPlayer,
      title: 'Adobe Flash Player',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: FlashPlayer,
    defaultSize: {
      width: 800,
      height: 600,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'World of Warcraft': {
    header: {
      icon: XP_ICONS.worldOfWarcraft,
      title: 'World of Warcraft',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: WorldOfWarcraft,
    defaultSize: {
      width: 900,
      height: 650,
    },
    defaultOffset: {
      x: 80,
      y: 30,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'RuneScape Classic': {
    header: {
      icon: '/icons/runescape-icon.png',
      title: 'RuneScape Classic - Offline',
      buttons: ['minimize', 'close'],
    },
    component: RuneScape,
    defaultSize: {
      width: 532,
      height: 394,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Wizard101': {
    header: {
      icon: '/apps/wizard101/images/icon.ico',
      title: 'Wizard101',
      buttons: ['close'],
      invisible: true,
    },
    component: Wizard101,
    defaultSize: {
      width: 810,
      height: 620,
    },
    defaultOffset: {
      x: 80,
      y: 30,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'LEGO Island': {
    header: {
      icon: '/icons/games/lego-island.webp',
      title: 'LEGO Island',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: LegoIsland,
    defaultSize: {
      width: 800,
      height: 600,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Diablo': {
    header: {
      icon: '/icons/games/diablo.png',
      title: 'Diablo',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Diablo,
    defaultSize: {
      width: 800,
      height: 600,
    },
    defaultOffset: {
      x: 120,
      y: 60,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'StarCraft': {
    header: {
      icon: '/icons/games/starcraft.png',
      title: 'StarCraft',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: StarCraft,
    defaultSize: {
      width: 800,
      height: 600,
    },
    defaultOffset: {
      x: 140,
      y: 70,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Command & Conquer': {
    header: {
      icon: '/icons/games/command-and-conquer.ico',
      title: 'Command & Conquer',
      buttons: ['minimize', 'close'],
    },
    component: CommandAndConquer,
    defaultSize: {
      width: 646,
      height: 566,
    },
    defaultOffset: {
      x: 100,
      y: 20,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Red Alert 2': {
    header: {
      icon: '/icons/games/red-alert2.png',
      title: 'Command & Conquer: Red Alert 2',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: RedAlert2,
    defaultSize: {
      width: 900,
      height: 550,
    },
    defaultOffset: {
      x: 80,
      y: 20,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Registry Editor': {
    header: {
      icon: '/icons/luna/regedit.ico',
      title: 'Registry Editor',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: RegistryEditor,
    defaultSize: {
      width: 750,
      height: 500,
    },
    defaultOffset: {
      x: 100,
      y: 50,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'Registry Editor - Edit Value': {
    header: {
      icon: '/icons/luna/regedit.ico',
      title: 'Edit String',
      buttons: ['close'],
    },
    component: RegistryEditValueDialog,
    defaultSize: {
      width: 380,
      height: 220,
    },
    defaultOffset: {
      x: 250,
      y: 180,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Registry Editor - New Value': {
    header: {
      icon: '/icons/luna/regedit.ico',
      title: 'New Value',
      buttons: ['close'],
    },
    component: RegistryNewValueDialog,
    defaultSize: {
      width: 380,
      height: 220,
    },
    defaultOffset: {
      x: 270,
      y: 200,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Registry Editor - New Key': {
    header: {
      icon: '/icons/luna/regedit.ico',
      title: 'New Key',
      buttons: ['close'],
    },
    component: RegistryNewKeyDialog,
    defaultSize: {
      width: 380,
      height: 170,
    },
    defaultOffset: {
      x: 270,
      y: 200,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Blue Screen of Death': {
    header: {
      icon: '/icons/luna/dialog_error.png',
      title: 'Blue Screen of Death',
      invisible: true,
      noFooterWindow: true,
    },
    component: BlueScreenOfDeath,
    defaultSize: {
      width: 0,
      height: 0,
    },
    defaultOffset: {
      x: 0,
      y: 0,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  'eSheep': {
    header: {
      icon: '/icons/esheep.png',
      title: 'eSheep',
      invisible: true,
      noFooterWindow: true,
    },
    component: ESheep,
    defaultSize: {
      width: 0,
      height: 0,
    },
    defaultOffset: {
      x: 0,
      y: 0,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: true,
  },
  'Run': {
    header: {
      icon: '/icons/luna/run.png',
      title: 'Run',
      buttons: ['close'],
    },
    component: Run,
    defaultSize: {
      width: 400,
      height: 'auto',
    },
    defaultOffset: {
      x: 200,
      y: 200,
    },
    resizable: false,
    minimized: false,
    maximized: false,
    multiInstance: false,
  },
  // Control Panel is now integrated into MyComputer as a navigable view
  // Access via My Computer sidebar > Control Panel
};

export {
  About,
  Resume,
  Projects,
  Contact,
  Calculator,
  Notepad,
  DateTimeProperties,
  Minesweeper,
  Solitaire,
  SpiderSolitaire,
  Pinball,
  CMD,
  MediaPlayer,
  ImageViewer,
  Paint,
  Winamp,
  MyComputer,
  RecycleBin,
  WinRAR,
  InternetExplorer,
  Properties,
  SoundRecorder,
  QQPenguin,
  QQPet13,
  QQArcade,
  Installer,
  IframeApp,
  Messenger,
  MSNMessenger,
  MSNMessengerConversation,
  SpeechProperties,
  SystemProperties,
  UserAccounts,
  Wordpad,
  HelpAndSupport,
  FontViewer,
  OutlookExpress,
  NewMessage,
  TaskbarProperties,
  AdobeReader,
  ShortcutWizard,
  BrowseForFolder,
  MessageBox,
  OpenWith,
  TaskManager,
  OpenFileDialog,
  BackupWizard,
  TransferWizard,
  FlashPlayer,
  WorldOfWarcraft,
  RuneScape,
  Wizard101,
  Run,
  FolderOptions,
};
