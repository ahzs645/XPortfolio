import React, { useRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { MenuBar } from '../../../components';
import { withBaseUrl } from '../../../utils/baseUrl';

function RuneScape({ onClose, isFocus }) {
  const iframeRef = useRef(null);

  const menus = useMemo(() => [
    {
      id: 'game',
      label: 'Game',
      items: [
        { label: 'Restart', action: 'newGame' },
        { separator: true },
        { label: 'Exit', action: 'exitProgram' },
      ],
    },
    { id: 'help', label: 'Help', disabled: true },
  ], []);

  const handleMenuAction = useCallback((action) => {
    if (action === 'newGame') {
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
          src={withBaseUrl('/games/runescape/index.html')}
          title="RuneScape Classic"
          frameBorder="0"
          scrolling="no"
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
  background: #000;
`;

const IframeWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  touch-action: none;
  position: relative;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
    touch-action: none;
    overflow: hidden;
  }
`;

export default RuneScape;
