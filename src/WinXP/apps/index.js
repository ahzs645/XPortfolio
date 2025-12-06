import About from './About';
import Resume from './Resume';
import Projects from './Projects';
import Contact from './Contact';
import Calculator from './Calculator';
import Notepad from './Notepad';
import DisplayProperties from './DisplayProperties';
import DateTimeProperties from './DateTimeProperties';
import Minesweeper from './Minesweeper';
import Solitaire from './Solitaire';
import SpiderSolitaire from './SpiderSolitaire';
import Pinball from './Pinball';
import CMD from './CMD';
import MediaPlayer from './MediaPlayer';
import ImageViewer from './ImageViewer';
import OpenLairViewer from './OpenLairViewer';
import Paint from './Paint';
import Winamp from './Winamp';
import MyComputer from './MyComputer';
import RecycleBin from './RecycleBin';
import WinRAR from './WinRAR';
import InternetExplorer from './InternetExplorer';
import Properties from './Properties';
import SoundRecorder from './SoundRecorder';
import QQPenguin from './QQPenguin';
import Installer from './Installer';
import IframeApp from './IframeApp';
import Messenger from './Messenger';
import SpeechProperties from './SpeechProperties';
import SystemProperties from './SystemProperties';
import SystemRecovery from './SystemRecovery';
import UserAccounts from './UserAccounts';
import Wordpad from './Wordpad';
import HelpAndSupport from './HelpAndSupport';
import FontViewer from './FontViewer';
import OutlookExpress from './OutlookExpress';

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
    icon: '/icons/contact.webp',
    title: 'Contact',
    component: Contact,
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
  classicViewer: {
    icon: '/apps/openlair-viewer/static/images/icon/viewer.png',
    title: 'Picture and Fax Viewer (Classic)',
    component: OpenLairViewer,
  },
  imageViewer: {
    icon: '/icons/image-viewer.png',
    title: 'Image Viewer',
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

// Generate desktop icon state from program list
export function generateIconState(programIds = ['about', 'resume', 'projects', 'contact']) {
  const savedPositions = loadIconPositions();
  const iconSize = 80; // Icon height including text
  const iconGap = 10;
  const startX = 10;
  const startY = 10;

  return programIds
    .map((id, index) => {
      const catalogEntry = desktopIconCatalog[id];
      if (!catalogEntry) return null;

      // Use saved position or calculate default grid position
      const savedPos = savedPositions[id];
      const defaultY = startY + index * (iconSize + iconGap);

      return {
        id: index,
        programId: id, // Keep track of program ID for saving positions
        icon: catalogEntry.icon,
        title: catalogEntry.title,
        component: catalogEntry.component,
        isFocus: false,
        x: savedPos?.x ?? startX,
        y: savedPos?.y ?? defaultY,
      };
    })
    .filter(Boolean);
}

// Default desktop icons (fallback)
export const defaultIconState = generateIconState(['myComputer', 'recycleBin', 'internetExplorer', 'about', 'resume', 'projects', 'contact', 'calculator', 'minesweeper']);

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
      icon: '/icons/resume.webp',
      title: 'Resume',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Resume,
    defaultSize: {
      width: 700,
      height: 550,
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
      icon: '/icons/contact.webp',
      title: 'Contact Me',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: Contact,
    defaultSize: {
      width: 600,
      height: 500,
    },
    defaultOffset: {
      x: 150,
      y: 40,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: false,
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
  },
  'Image Viewer': {
    header: {
      icon: '/icons/image-viewer.png',
      title: 'Windows Picture and Fax Viewer',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: ImageViewer,
    defaultSize: {
      width: 600,
      height: 450,
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
  'Classic Picture Viewer': {
    header: {
      icon: '/apps/openlair-viewer/static/images/icon/viewer.png',
      title: 'Windows Picture and Fax Viewer',
      buttons: ['minimize', 'maximize', 'close'],
    },
    component: OpenLairViewer,
    defaultSize: {
      width: 700,
      height: 540,
    },
    defaultOffset: {
      x: 170,
      y: 70,
    },
    resizable: true,
    minimized: false,
    maximized: false,
    multiInstance: true,
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
  Installer,
  IframeApp,
  Messenger,
  SpeechProperties,
  SystemProperties,
  UserAccounts,
  Wordpad,
  HelpAndSupport,
  FontViewer,
  OutlookExpress,
};
