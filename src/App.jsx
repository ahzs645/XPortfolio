import { useEffect } from 'react';
import WinXP from './WinXP';
import { createGlobalStyle } from 'styled-components';
import { ConfigProvider } from './contexts/ConfigContext';
import { FileSystemProvider } from './contexts/FileSystemContext';
import { InstalledAppsProvider } from './contexts/InstalledAppsContext';
import { ScreensaverProvider } from './contexts/ScreensaverContext';
import { UpdateToast } from './components/UpdateToast';
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
      <FileSystemProvider>
        <InstalledAppsProvider>
          <ScreensaverProvider>
            <GlobalStyle />
            <WinXP />
            <UpdateToast />
          </ScreensaverProvider>
        </InstalledAppsProvider>
      </FileSystemProvider>
    </ConfigProvider>
  );
}

export default App;
