import { XP_ICONS, SHORTCUT_SIZE } from './constants';

// Full catalog of available desktop shortcuts (program ID -> shortcut definition)
// These map to the appSettings keys in src/WinXP/apps/index.js
// Note: 'projects' removed - now using Projects briefcase folder instead
export const DESKTOP_SHORTCUT_CATALOG = {
  about: { id: 'shortcut-about', name: 'About Me.lnk', icon: '/icons/about.webp', target: 'About Me', size: SHORTCUT_SIZE },
  resume: { id: 'shortcut-resume', name: 'Resume.lnk', icon: '/icons/pdf/PDF.ico', target: 'Resume', size: SHORTCUT_SIZE },
  contact: { id: 'shortcut-contact', name: 'Contact.lnk', icon: '/icons/contact.webp', target: 'Contact', size: SHORTCUT_SIZE },
  calculator: { id: 'shortcut-calculator', name: 'Calculator.lnk', icon: XP_ICONS.calculator, target: 'Calculator', size: SHORTCUT_SIZE },
  minesweeper: { id: 'shortcut-minesweeper', name: 'Minesweeper.lnk', icon: XP_ICONS.minesweeper, target: 'Minesweeper', size: SHORTCUT_SIZE },
  notepad: { id: 'shortcut-notepad', name: 'Notepad.lnk', icon: XP_ICONS.notepad, target: 'Notepad', size: SHORTCUT_SIZE },
  paint: { id: 'shortcut-paint', name: 'Paint.lnk', icon: '/icons/xp/Paint.png', target: 'Paint', size: SHORTCUT_SIZE },
  cmd: { id: 'shortcut-cmd', name: 'Command Prompt.lnk', icon: '/icons/xp/CommandPrompt.png', target: 'Command Prompt', size: SHORTCUT_SIZE },
  mediaPlayer: { id: 'shortcut-media-player', name: 'Windows Media Player.lnk', icon: '/icons/xp/WindowsMediaPlayer9.png', target: 'Windows Media Player', size: SHORTCUT_SIZE },
  internetExplorer: { id: 'shortcut-ie', name: 'Internet Explorer.lnk', icon: '/icons/xp/InternetExplorer6.png', target: 'Internet Explorer', size: SHORTCUT_SIZE },
  solitaire: { id: 'shortcut-solitaire', name: 'Solitaire.lnk', icon: '/icons/solitaire-icon.png', target: 'Solitaire', size: SHORTCUT_SIZE },
  spiderSolitaire: { id: 'shortcut-spider-solitaire', name: 'Spider Solitaire.lnk', icon: '/icons/spider-solitaire-icon.webp', target: 'Spider Solitaire', size: SHORTCUT_SIZE },
  pinball: { id: 'shortcut-pinball', name: '3D Pinball.lnk', icon: '/icons/pinball-icon.png', target: 'Pinball', size: SHORTCUT_SIZE },
  soundRecorder: { id: 'shortcut-sound-recorder', name: 'Sound Recorder.lnk', icon: '/icons/xp/SoundRecorder.webp', target: 'Sound Recorder', size: SHORTCUT_SIZE },
  winamp: { id: 'shortcut-winamp', name: 'Winamp.lnk', icon: '/icons/winamp.png', target: 'Winamp', size: SHORTCUT_SIZE },
  displayProperties: { id: 'shortcut-display', name: 'Display Properties.lnk', icon: XP_ICONS.displayProperties, target: 'Display Properties', size: SHORTCUT_SIZE },
  adobeReader: { id: 'shortcut-adobe-reader', name: 'Adobe Reader.lnk', icon: '/icons/pdf/acroaum_grp107_lang1033.ico', target: 'Adobe Reader', size: SHORTCUT_SIZE },
  blueScreenOfDeath: { id: 'shortcut-bsod', name: 'Blue Screen of Death.lnk', icon: '/icons/luna/dialog_error.png', target: 'Blue Screen of Death', size: SHORTCUT_SIZE },
};

// Default desktop programs if not specified in config (excludes system icons like My Computer and Recycle Bin)
// Note: 'projects' removed - now using Projects briefcase folder instead
export const DEFAULT_DESKTOP_PROGRAMS = ['about', 'resume', 'contact', 'calculator', 'minesweeper', 'blueScreenOfDeath'];

// Build desktop shortcuts array from program IDs
export const buildDesktopShortcuts = (programIds) => {
  return programIds
    .map(id => DESKTOP_SHORTCUT_CATALOG[id])
    .filter(Boolean);
};
