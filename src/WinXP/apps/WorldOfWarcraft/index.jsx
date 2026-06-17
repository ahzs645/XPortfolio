import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';
import useLoadingCursor from '../../hooks/useLoadingCursor';

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

function WorldOfWarcraft({ onClose, isFocus }) {
  const [isLoading, setIsLoading] = useState(true);
  useLoadingCursor(isLoading);

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
