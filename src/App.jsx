import { useEffect } from 'react';
import WinXP from './WinXP';
import { ConfigProvider } from './contexts/ConfigContext';
import { UserAccountsProvider } from './contexts/UserAccountsContext';
import { UserSettingsProvider } from './contexts/UserSettingsContext';
import { ShellSettingsProvider } from './contexts/ShellSettingsContext';
import { FileSystemProvider } from './contexts/FileSystemContext';
import { InstalledAppsProvider } from './contexts/InstalledAppsContext';
import { StartMenuProvider } from './contexts/StartMenuContext';
import { ScreensaverProvider } from './contexts/ScreensaverContext';
import { TooltipProvider } from './contexts/TooltipContext';
import { RegistryProvider } from './contexts/RegistryContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UpdateToast } from './components/UpdateToast';
import { OfflineToast } from './components/OfflineToast';
import ErrorBoundary from './components/ErrorBoundary';
import { initializeDeviceDetection } from './utils/deviceDetection';
import { initPwaManager } from './utils/pwaManager';

function App() {
  // Initialize device detection early to add mobile-device class
  useEffect(() => {
    initializeDeviceDetection();
    initPwaManager();
  }, []);

  return (
    <ConfigProvider>
      <UserAccountsProvider>
        <UserSettingsProvider>
          <ShellSettingsProvider>
            <FileSystemProvider>
              <InstalledAppsProvider>
                <StartMenuProvider>
                  <ScreensaverProvider>
                    <TooltipProvider>
                      <RegistryProvider>
                        <ThemeProvider>
                          <ErrorBoundary name="Desktop">
                            <WinXP />
                          </ErrorBoundary>
                          <UpdateToast />
                          <OfflineToast />
                        </ThemeProvider>
                      </RegistryProvider>
                    </TooltipProvider>
                  </ScreensaverProvider>
                </StartMenuProvider>
              </InstalledAppsProvider>
            </FileSystemProvider>
          </ShellSettingsProvider>
        </UserSettingsProvider>
      </UserAccountsProvider>
    </ConfigProvider>
  );
}

export default App;
