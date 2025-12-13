import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
  position: relative;
`;

const IframeContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const AppFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
`;

const IframeOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${props => props.$visible ? 'block' : 'none'};
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  font-family: 'Trebuchet MS', Tahoma, sans-serif;
  color: #ffd700;
  gap: 16px;
  z-index: 10;

  .loading-icon {
    width: 80px;
    height: 80px;
    animation: pulse 1.5s ease-in-out infinite;
    filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
  }

  .loading-text {
    font-size: 20px;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }

  .loading-subtitle {
    font-size: 12px;
    color: #87CEEB;
    opacity: 0.9;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }
`;

function WorldOfWarcraft({ onClose, isFocus }) {
  const [isLoading, setIsLoading] = useState(true);

  // Listen for close message from iframe
  const handleMessage = useCallback((event) => {
    if (event.data) {
      // Handle close window request from quit button
      if (event.data.type === 'close-window' || event.data.action === 'closeWindow') {
        onClose?.();
      }
    }
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return (
    <Container>
      {isLoading && (
        <LoadingOverlay>
          <img
            className="loading-icon"
            src={withBaseUrl('/icons/games/wow.webp')}
            alt="World of Warcraft"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="loading-text">World of Warcraft</span>
          <span className="loading-subtitle">Loading Azeroth...</span>
        </LoadingOverlay>
      )}
      <IframeContainer>
        <AppFrame
          src={withBaseUrl('/apps/wow/wow.html')}
          onLoad={() => setIsLoading(false)}
          title="World of Warcraft"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-modals allow-downloads"
          allow="autoplay"
        />
        <IframeOverlay $visible={!isFocus} />
      </IframeContainer>
    </Container>
  );
}

export default WorldOfWarcraft;
