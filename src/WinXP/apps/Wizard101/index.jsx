import { useState } from 'react';
import styled from 'styled-components';
import { LauncherProvider } from './context/LauncherContext';
import Window from './Window';
import Launcher from './Launcher';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;

  /* Reset XP.css overrides for Wizard101 */
  &.wiz101-app {
    /* Override any XP.css .window styles */
    .wiz101-window {
      position: relative !important;
      left: auto !important;
      top: auto !important;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
      margin: 0 !important;
    }

    /* Reset button styles */
    button {
      all: unset;
      cursor: pointer;
    }

    /* Reset input styles */
    input[type="text"],
    input[type="password"] {
      all: unset;
      display: block;
      width: 100%;
      box-sizing: border-box;
    }
  }
`;

const LauncherWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

/**
 * Wizard101 Launcher App
 *
 * @param {Object} props
 * @param {Function} props.onClose - Called when the app should close
 * @param {string} props.defaultMode - Initial mode: 'default', 'patchClient', or 'offline'
 */
function Wizard101({ onClose, defaultMode = 'default' }) {
  const [isMinimized, setIsMinimized] = useState(false);

  const handleMinimize = () => {
    setIsMinimized(true);
    setTimeout(() => setIsMinimized(false), 500);
  };

  return (
    <LauncherProvider defaultMode={defaultMode}>
      <Container className="wiz101-app">
        <LauncherWrapper className={isMinimized ? 'minimized' : ''}>
          <Window
            title="Wizard101"
            onClose={onClose}
            onMinimize={handleMinimize}
          >
            <Launcher />
          </Window>
        </LauncherWrapper>
      </Container>
    </LauncherProvider>
  );
}

export default Wizard101;
