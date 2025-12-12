import React, { useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { MenuBar } from '../../../components';
import { withBaseUrl } from '../../../utils/baseUrl';

function Solitaire({ onClose, isFocus }) {
  const iframeRef = useRef(null);

  const menus = useMemo(() => [
    {
      id: 'game',
      label: 'Game',
      items: [
        { label: 'New Game', action: 'newGame' },
        { separator: true },
        { label: 'Exit', action: 'exitProgram' },
      ],
    },
    { id: 'help', label: 'Help', disabled: true },
  ], []);

  const handleMenuAction = useCallback((action) => {
    if (action === 'newGame') {
      // Reload the iframe to start a new game
      const iframe = iframeRef.current;
      if (iframe) {
        const currentSrc = iframe.src;
        iframe.src = currentSrc;
      }
    }
  }, []);

  return (
    <Container>
      <MenuBar
        menus={menus}
        onAction={handleMenuAction}
        windowActions={{ onClose }}
      />
      <IframeWrapper>
        <iframe
          ref={iframeRef}
          src={withBaseUrl('/games/solitaire/index.html')}
          title="Solitaire"
          frameBorder="0"
          allowFullScreen
        />
      </IframeWrapper>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #008000;
`;

const IframeWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  /* Allow touch events to pass through to iframe for mobile drag support */
  touch-action: none;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
    /* Ensure iframe can handle its own touch events */
    touch-action: none;
  }
`;

export default Solitaire;
