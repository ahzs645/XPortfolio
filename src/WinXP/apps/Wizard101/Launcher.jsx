import { useState } from 'react';
import { useLauncherMode } from './context/LauncherContext';
import ContentArea from './ContentArea';
import PatchClientContent from './PatchClientContent';
import LoginForm from './LoginForm';
import { withBaseUrl } from '../../../utils/baseUrl';
import './Launcher.css';

const ASSET_BASE = '/apps/wizard101/images';

function Launcher() {
  const { mode } = useLauncherMode();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUsername, setRememberUsername] = useState(false);

  // Launcher states: 'login' -> 'loading' -> 'ready'
  const [launcherState, setLauncherState] = useState('login');
  const [fileProgress, setFileProgress] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [status, setStatus] = useState('Enter your login credentials');

  const handleLogin = () => {
    if (username && password) {
      setStatus('Logging in...');

      // Step 1: Logging in
      setTimeout(() => {
        setLauncherState('loading');
        setStatus('Connecting to Patch Server...');
        setFileProgress(0);
        setTotalProgress(0);

        // Step 2: Connecting to patch server
        setTimeout(() => {
          setStatus('Scanning :');

          // Step 3: Scanning files
          let scanProgress = 0;
          const scanInterval = setInterval(() => {
            scanProgress += Math.random() * 20;
            if (scanProgress >= 100) {
              scanProgress = 100;
              clearInterval(scanInterval);
              setFileProgress(100);
              setTotalProgress(25);

              // Step 4: Patching/Downloading
              startPatching();
            } else {
              setFileProgress(Math.floor(scanProgress));
              setTotalProgress(Math.floor(scanProgress * 0.25));
            }
          }, 200);
        }, 800);
      }, 1000);
    }
  };

  const startPatching = () => {
    setStatus('Patching :');
    setFileProgress(0);

    let currentFile = 0;
    const totalFiles = 5; // Simulate downloading 5 files

    const downloadNextFile = () => {
      if (currentFile >= totalFiles) {
        // All files downloaded
        setFileProgress(100);
        setTotalProgress(100);
        setStatus('Download Complete!');
        setLauncherState('ready');
        return;
      }

      currentFile++;
      setFileProgress(0);

      // Simulate file download progress
      let fileDownloadProgress = 0;
      const fileInterval = setInterval(() => {
        fileDownloadProgress += Math.random() * 25;
        if (fileDownloadProgress >= 100) {
          fileDownloadProgress = 100;
          clearInterval(fileInterval);
          setFileProgress(100);

          // Update total progress based on files completed
          const baseProgress = 25; // From scanning
          const downloadProgress = 75 * (currentFile / totalFiles);
          setTotalProgress(Math.floor(baseProgress + downloadProgress));

          // Small delay before next file
          setTimeout(downloadNextFile, 200);
        } else {
          setFileProgress(Math.floor(fileDownloadProgress));
        }
      }, 150);
    };

    downloadNextFile();
  };

  const handlePlay = () => {
    if (launcherState !== 'ready') {
      return;
    }
    setStatus('Launching Wizard101...');
    setTimeout(() => {
      setStatus('Game Started!');
    }, 2000);
  };

  const handleSettings = () => {
    setStatus('Opening Settings...');
    setTimeout(() => {
      if (launcherState === 'ready') {
        setStatus('Download Complete!');
      } else if (launcherState === 'login') {
        setStatus('Enter your login credentials');
      }
    }, 1000);
  };

  const isLoggedIn = launcherState !== 'login';
  const isReady = launcherState === 'ready';
  const isPatching = launcherState === 'loading';

  // Render content based on mode
  const renderContent = () => {
    switch (mode) {
      case 'patchClient':
        return <PatchClientContent />;
      case 'offline':
        return (
          <div className="wiz101-offline-content">
            <img
              src={withBaseUrl(`${ASSET_BASE}/patchClientNew.gif`)}
              alt="Offline Mode"
              className="wiz101-offline-image"
            />
          </div>
        );
      default:
        return <ContentArea />;
    }
  };

  return (
    <div className="wiz101-launcher-content">
      {/* Background layers - different for patchClient mode */}
      {mode === 'patchClient' ? (
        <img
          src={withBaseUrl(`${ASSET_BASE}/patchClient/background.jpg`)}
          alt=""
          className="wiz101-launcher-bg wiz101-patch-client-bg"
        />
      ) : (
        <>
          <img
            src={withBaseUrl(`${ASSET_BASE}/skin/035_MainBackground.png`)}
            alt=""
            className="wiz101-launcher-bg"
          />
          <img
            src={withBaseUrl(`${ASSET_BASE}/skin/000_ListBackground.png`)}
            alt=""
            className="wiz101-launcher-frame"
          />
        </>
      )}
      {/* Login background - behind login form for all views */}
      <img
        src={withBaseUrl(`${ASSET_BASE}/skin/Login.png`)}
        alt=""
        className="wiz101-launcher-login-bg"
      />

      {/* Logo in the header area (only for default/offline mode) */}
      {mode !== 'patchClient' && (
        <img
          src={withBaseUrl(`${ASSET_BASE}/logo.png`)}
          alt="Wizard101"
          className="wiz101-launcher-logo"
        />
      )}

      {/* Main content area */}
      {renderContent()}

      {/* Bottom section: Login Form or Progress + Buttons */}
      <div className="wiz101-launcher-bottom">
        <LoginForm
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          rememberUsername={rememberUsername}
          setRememberUsername={setRememberUsername}
          onLogin={handleLogin}
          onPlay={handlePlay}
          onSettings={handleSettings}
          isLoggedIn={isLoggedIn}
          isReady={isReady}
          isPatching={isPatching}
          fileProgress={fileProgress}
          totalProgress={totalProgress}
          status={status}
        />
      </div>
    </div>
  );
}

export default Launcher;
