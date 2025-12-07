import { useState, useCallback, useMemo, useEffect } from 'react';
import { useInstalledApps } from '../../../contexts/InstalledAppsContext';
import { useApp } from '../../../contexts/AppContext';
import {
  Sidebar,
  VIEWS,
  ChangeRemovePrograms,
  AddNewProgram,
  SetProgramDefaults,
  Container,
  Header,
  HeaderIcon,
  HeaderText,
  MainContent,
  Footer,
  CloseButton,
} from './components';

const DISABLED_APPS_KEY = 'xportfolio-disabled-apps';

// Built-in programs that ship with XPortfolio
const BUILTIN_PROGRAMS = [
  {
    id: 'builtin-notepad',
    appKey: 'Notepad',
    name: 'Notepad',
    icon: '/icons/xp/Notepad.png',
    description: 'A simple text editor for creating and editing text files.',
    version: '5.1',
    author: 'Microsoft Corporation',
    category: 'Accessories',
    isBuiltIn: true,
    size: 66560,
  },
  {
    id: 'builtin-paint',
    appKey: 'Paint',
    name: 'Paint',
    icon: '/icons/xp/Paint.png',
    description: 'Create and edit pictures and drawings.',
    version: '5.1',
    author: 'Microsoft Corporation',
    category: 'Accessories',
    isBuiltIn: true,
    size: 344064,
  },
  {
    id: 'builtin-calculator',
    appKey: 'Calculator',
    name: 'Calculator',
    icon: '/icons/xp/Calculator.png',
    description: 'Performs basic arithmetic and scientific calculations.',
    version: '5.1',
    author: 'Microsoft Corporation',
    category: 'Accessories',
    isBuiltIn: true,
    size: 114688,
  },
  {
    id: 'builtin-minesweeper',
    appKey: 'Minesweeper',
    name: 'Minesweeper',
    icon: '/icons/xp/Minesweeper.png',
    description: 'Classic puzzle game. Find all the mines without detonating any.',
    version: '5.1',
    author: 'Microsoft Corporation',
    category: 'Games',
    isBuiltIn: true,
    size: 122880,
  },
  {
    id: 'builtin-solitaire',
    appKey: 'Solitaire',
    name: 'Solitaire',
    icon: '/icons/solitaire-icon.png',
    description: 'Classic card game. Build four suit stacks from Ace to King.',
    version: '5.1',
    author: 'Microsoft Corporation',
    category: 'Games',
    isBuiltIn: true,
    size: 57344,
  },
  {
    id: 'builtin-spider-solitaire',
    appKey: 'Spider Solitaire',
    name: 'Spider Solitaire',
    icon: '/icons/spider-solitaire-icon.webp',
    description: 'Arrange cards in descending order from King to Ace.',
    version: '5.1',
    author: 'Microsoft Corporation',
    category: 'Games',
    isBuiltIn: true,
    size: 180224,
  },
  {
    id: 'builtin-pinball',
    appKey: 'Pinball',
    name: '3D Pinball - Space Cadet',
    icon: '/icons/pinball-icon.png',
    description: '3D Pinball for Windows featuring Space Cadet table.',
    version: '5.1',
    author: 'Microsoft Corporation',
    category: 'Games',
    isBuiltIn: true,
    size: 1835008,
  },
  {
    id: 'builtin-ie',
    appKey: 'Internet Explorer',
    name: 'Internet Explorer',
    icon: '/icons/xp/InternetExplorer6.png',
    description: 'Browse the World Wide Web.',
    version: '6.0',
    author: 'Microsoft Corporation',
    category: 'Internet',
    isBuiltIn: true,
    size: 1048576,
  },
  {
    id: 'builtin-mediaplayer',
    appKey: 'Windows Media Player',
    name: 'Windows Media Player',
    icon: '/icons/xp/WindowsMediaPlayer9.png',
    description: 'Play audio and video files.',
    version: '9.0',
    author: 'Microsoft Corporation',
    category: 'Multimedia',
    isBuiltIn: true,
    size: 10485760,
  },
  {
    id: 'builtin-winamp',
    appKey: 'Winamp',
    name: 'Winamp',
    icon: '/icons/winamp.png',
    description: 'It really whips the llama\'s ass! Popular media player.',
    version: '5.666',
    author: 'Nullsoft',
    category: 'Multimedia',
    isBuiltIn: true,
    size: 5242880,
  },
  {
    id: 'builtin-cmd',
    appKey: 'Command Prompt',
    name: 'Command Prompt',
    icon: '/icons/xp/CommandPrompt.png',
    description: 'Run command-line utilities and batch files.',
    version: '5.1',
    author: 'Microsoft Corporation',
    category: 'Accessories',
    isBuiltIn: true,
    size: 237568,
  },
  {
    id: 'builtin-winrar',
    appKey: 'WinRAR',
    name: 'WinRAR',
    icon: '/icons/xp/RAR.png',
    description: 'Archive manager for ZIP and RAR files.',
    version: '5.0',
    author: 'RARLAB',
    category: 'Utilities',
    isBuiltIn: true,
    size: 2097152,
  },
  {
    id: 'builtin-soundrecorder',
    appKey: 'Sound Recorder',
    name: 'Sound Recorder',
    icon: '/icons/xp/SoundRecorder.webp',
    description: 'Record audio from microphone.',
    version: '5.1',
    author: 'Microsoft Corporation',
    category: 'Accessories',
    isBuiltIn: true,
    size: 73728,
  },
  {
    id: 'builtin-adobereader',
    appKey: 'Adobe Reader',
    name: 'Adobe Reader',
    icon: '/icons/pdf/acroaum_grp107_lang1033.ico',
    description: 'View and print PDF documents.',
    version: '7.0',
    author: 'Adobe Systems',
    category: 'Utilities',
    isBuiltIn: true,
    size: 15728640,
  },
];

// Helper to get disabled apps from localStorage
export const getDisabledApps = () => {
  try {
    const saved = localStorage.getItem(DISABLED_APPS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Helper to check if an app is disabled
export const isAppDisabled = (appKey) => {
  const disabled = getDisabledApps();
  return disabled.includes(appKey);
};

// Export built-in programs list for use elsewhere
export { BUILTIN_PROGRAMS };

function Installer({ onClose }) {
  const {
    fetchManifest,
    installApp,
    uninstallApp,
    getInstalledAppsList,
    isInstalled,
    launchInstalledApp,
  } = useInstalledApps();

  const { openApp } = useApp();

  const [activeView, setActiveView] = useState(VIEWS.CHANGE_REMOVE);
  const [disabledApps, setDisabledApps] = useState([]);
  const installedApps = getInstalledAppsList();

  // Load disabled apps from localStorage
  useEffect(() => {
    setDisabledApps(getDisabledApps());
  }, []);

  // Save disabled apps to localStorage
  const saveDisabledApps = useCallback((apps) => {
    try {
      localStorage.setItem(DISABLED_APPS_KEY, JSON.stringify(apps));
    } catch (e) {
      console.error('Failed to save disabled apps:', e);
    }
  }, []);

  // Toggle app enabled/disabled state
  const handleToggleApp = useCallback((appKey) => {
    setDisabledApps(prev => {
      const newDisabled = prev.includes(appKey)
        ? prev.filter(k => k !== appKey)
        : [...prev, appKey];
      saveDisabledApps(newDisabled);
      return newDisabled;
    });
  }, [saveDisabledApps]);

  // Combine built-in and installed apps
  const allPrograms = useMemo(() => {
    const builtInWithStatus = BUILTIN_PROGRAMS.map(app => ({
      ...app,
      isDisabled: disabledApps.includes(app.appKey),
    }));
    const userApps = installedApps.map(app => ({
      ...app,
      isBuiltIn: false,
      isDisabled: false,
    }));
    return [...builtInWithStatus, ...userApps];
  }, [installedApps, disabledApps]);

  const handleRun = useCallback((appId, appKey) => {
    // For built-in apps, use openApp with the appKey
    if (appKey) {
      openApp(appKey);
      onClose?.();
    } else {
      // For installed web apps, use launchInstalledApp
      launchInstalledApp(appId);
      onClose?.();
    }
  }, [openApp, launchInstalledApp, onClose]);

  const handleInstallSuccess = useCallback(() => {
    // Switch to Change/Remove view after 1.5s to show the new app
    setTimeout(() => setActiveView(VIEWS.CHANGE_REMOVE), 1500);
  }, []);

  return (
    <Container>
      <Header>
        <HeaderIcon src="/icons/xp/programs/add.png" alt="" />
        <HeaderText>Add or Remove Programs</HeaderText>
      </Header>

      <MainContent>
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          installedCount={allPrograms.length}
        />

        {activeView === VIEWS.CHANGE_REMOVE && (
          <ChangeRemovePrograms
            apps={allPrograms}
            onRun={handleRun}
            onUninstall={uninstallApp}
            onToggleApp={handleToggleApp}
          />
        )}

        {activeView === VIEWS.ADD_NEW && (
          <AddNewProgram
            fetchManifest={fetchManifest}
            installApp={installApp}
            isInstalled={isInstalled}
            onSuccess={handleInstallSuccess}
          />
        )}

        {activeView === VIEWS.SET_DEFAULTS && (
          <SetProgramDefaults
            installedApps={installedApps}
          />
        )}
      </MainContent>

      <Footer>
        <CloseButton onClick={onClose}>Close</CloseButton>
      </Footer>
    </Container>
  );
}

export default Installer;
