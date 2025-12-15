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

    /* Reset button styles - remove XP.css overrides but keep our custom styles */
    button {
      box-sizing: border-box;
      min-width: 0;
      min-height: 0;
    }

    /* Reset input styles - remove XP.css overrides but keep our custom styles */
    input[type="text"],
    input[type="password"] {
      box-sizing: border-box;
      min-width: 0;
      min-height: 0;
    }

    /* Ensure our Wizard101 specific styles take precedence */
    .wiz101-login-btn {
      height: 28px !important;
      padding: 0 16px !important;
      background-size: 100% 100% !important;
      border: none !important;
      cursor: pointer !important;
      color: #e8d8b8 !important;
      font-family: Tahoma, Arial, sans-serif !important;
      font-size: 11px !important;
      font-weight: bold !important;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.7) !important;
      background-color: transparent !important;
    }

    .wiz101-input-field {
      width: 150px !important;
      height: 26px !important;
      background-size: 100% 100% !important;
      border: none !important;
      padding: 0 8px !important;
      font-family: Tahoma, Arial, sans-serif !important;
      font-size: 12px !important;
      color: #2a1a0a !important;
      outline: none !important;
      background-color: transparent !important;
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
function Wizard101({ onClose, onMinimize, dragRef, defaultMode = 'patchClient' }) {
  return (
    <LauncherProvider defaultMode={defaultMode}>
      <Container className="wiz101-app">
        <LauncherWrapper>
          <Window
            title="Wizard101"
            onClose={onClose}
            onMinimize={onMinimize}
            dragRef={dragRef}
          >
            <Launcher />
          </Window>
        </LauncherWrapper>
      </Container>
    </LauncherProvider>
  );
}

export default Wizard101;
