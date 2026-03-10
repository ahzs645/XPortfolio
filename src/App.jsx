import { useEffect } from 'react';
import WinXP from './WinXP';
import { createGlobalStyle } from 'styled-components';
import { ConfigProvider } from './contexts/ConfigContext';
import { UserAccountsProvider } from './contexts/UserAccountsContext';
import { UserSettingsProvider } from './contexts/UserSettingsContext';
import { FileSystemProvider } from './contexts/FileSystemContext';
import { InstalledAppsProvider } from './contexts/InstalledAppsContext';
import { StartMenuProvider } from './contexts/StartMenuContext';
import { ScreensaverProvider } from './contexts/ScreensaverContext';
import { TooltipProvider } from './contexts/TooltipContext';
import { RegistryProvider } from './contexts/RegistryContext';
import { UpdateToast } from './components/UpdateToast';
import ErrorBoundary from './components/ErrorBoundary';
import { initializeDeviceDetection } from './utils/deviceDetection';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  body {
    font-family: Tahoma, 'Noto Sans', sans-serif;
    font-size: 11px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Reset XP.css .window styles for Webamp */
  #webamp .window {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
  }
`;

function App() {
  // Initialize device detection early to add mobile-device class
  useEffect(() => {
    initializeDeviceDetection();
  }, []);

  return (
    <ConfigProvider>
      <UserAccountsProvider>
        <UserSettingsProvider>
          <FileSystemProvider>
            <InstalledAppsProvider>
              <StartMenuProvider>
                <ScreensaverProvider>
                  <TooltipProvider>
                    <RegistryProvider>
                      <GlobalStyle />
                      <ErrorBoundary name="Desktop">
                        <WinXP />
                      </ErrorBoundary>
                      <UpdateToast />
                    </RegistryProvider>
                  </TooltipProvider>
                </ScreensaverProvider>
              </StartMenuProvider>
            </InstalledAppsProvider>
          </FileSystemProvider>
        </UserSettingsProvider>
      </UserAccountsProvider>
    </ConfigProvider>
  );
}

export default App;
