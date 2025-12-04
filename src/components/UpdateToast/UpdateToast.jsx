import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { initUpdateChecker } from '../../utils/updateChecker';

// For testing: window.triggerUpdate() or Ctrl+Shift+U
const DEV_MODE = import.meta.env.DEV;

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 50px;
  right: 16px;
  z-index: 10000;
  animation: ${props => props.$isClosing ? slideOut : slideIn} 0.3s ease-out forwards;
`;

const ToastWindow = styled.div`
  min-width: 280px;
  max-width: 320px;
  box-shadow:
    2px 2px 10px rgba(0, 0, 0, 0.3),
    inset 1px 1px 0 rgba(255, 255, 255, 0.8),
    inset -1px -1px 0 rgba(0, 0, 0, 0.2);
`;

const TitleBar = styled.div`
  background: linear-gradient(180deg, #0a246a 0%, #0a246a 3%, #0f3781 6%, #1457b1 10%, #1d6fd0 14%, #2488e4 20%, #2896ef 24%, #2ea0f7 34%, #32a7fb 45%, #33acfe 50%, #32a7fb 55%, #2f9efa 60%, #2895f2 66%, #238ae6 72%, #1d7ed5 78%, #1774c6 84%, #126bb8 90%, #0f64ac 96%, #0e60a5 100%);
  padding: 3px 5px 3px 3px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const TitleText = styled.span`
  color: white;
  font-weight: bold;
  font-size: 12px;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  gap: 4px;
`;

const UpdateIcon = styled.span`
  font-size: 14px;
`;

const CloseButton = styled.button`
  background: linear-gradient(180deg, #e47c7c 0%, #d65f5f 50%, #c94545 100%);
  border: 1px solid #8b0000;
  border-radius: 3px;
  width: 21px;
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 10px;
  font-weight: bold;

  &:hover {
    background: linear-gradient(180deg, #f08888 0%, #e06a6a 50%, #d55050 100%);
  }

  &:active {
    background: linear-gradient(180deg, #c94545 0%, #b53535 50%, #a02828 100%);
  }
`;

const Content = styled.div`
  background: #ece9d8;
  padding: 12px;
  border: 1px solid #919b9c;
  border-top: none;
`;

const Message = styled.div`
  font-size: 11px;
  color: #000;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const VersionInfo = styled.div`
  font-size: 10px;
  color: #666;
  margin-bottom: 10px;
  font-family: 'Lucida Console', Monaco, monospace;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const Button = styled.button`
  min-width: 75px;
  padding: 4px 12px;
  font-size: 11px;
  cursor: pointer;
`;

export default function UpdateToast() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // Mock update trigger for testing
  const triggerMockUpdate = useCallback(() => {
    setUpdateInfo({
      version: '1.1',
      buildNumber: 'test123',
      buildTime: new Date().toISOString(),
      onReload: () => {
        console.log('[Update] Mock reload triggered');
        window.location.reload();
      },
    });
    setIsClosing(false);
    console.log('[Update] Mock update notification triggered');
  }, []);

  useEffect(() => {
    initUpdateChecker((info) => {
      setUpdateInfo(info);
      setIsClosing(false);
    });

    // Expose global function for testing (works in both dev and prod)
    window.triggerUpdate = triggerMockUpdate;

    // Keyboard shortcut: Ctrl+Shift+U (or Cmd+Shift+U on Mac)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'U') {
        e.preventDefault();
        triggerMockUpdate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    if (DEV_MODE) {
      console.log('[Update] Testing shortcuts enabled:');
      console.log('  - Ctrl+Shift+U (or Cmd+Shift+U on Mac)');
      console.log('  - window.triggerUpdate()');
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      delete window.triggerUpdate;
    };
  }, [triggerMockUpdate]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setUpdateInfo(null);
    }, 300);
  };

  const handleReboot = () => {
    if (updateInfo?.onReload) {
      updateInfo.onReload();
    }
  };

  if (!updateInfo) {
    return null;
  }

  return (
    <ToastContainer $isClosing={isClosing}>
      <ToastWindow className="window">
        <TitleBar>
          <TitleText>
            <UpdateIcon>🔄</UpdateIcon>
            Update Available
          </TitleText>
          <CloseButton onClick={handleClose}>✕</CloseButton>
        </TitleBar>
        <Content>
          <Message>
            A new version of XPortfolio is available and ready to install.
          </Message>
          <VersionInfo>
            Version {updateInfo.version} ({updateInfo.buildNumber})
          </VersionInfo>
          <ButtonRow>
            <Button onClick={handleClose}>Later</Button>
            <Button onClick={handleReboot}>Reboot Now</Button>
          </ButtonRow>
        </Content>
      </ToastWindow>
    </ToastContainer>
  );
}
