import React, { useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { MenuBar } from '../../../components';

function SpiderSolitaire({ onClose, isFocus }) {
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
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
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
          src="/games/spider-solitaire/index.html"
          title="Spider Solitaire"
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

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }
`;

export default SpiderSolitaire;
