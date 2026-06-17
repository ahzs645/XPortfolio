import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';
import useLoadingCursor from '../../hooks/useLoadingCursor';

function CommandAndConquer() {
  const [isLoading, setIsLoading] = useState(true);
  useLoadingCursor(isLoading);

  const handleLoad = useCallback((e) => {
    setIsLoading(false);
    // Lower the game volume — defaults are max (1.0)
    try {
      const win = e.target.contentWindow;
      if (win && win.sounds) {
        win.sounds.setMusicVoume(0.3);
        win.sounds.setAudioVoume(0.3);
      }
    } catch {
      // cross-origin or not ready yet — ignore
    }
  }, []);

  return (
    <Container>
      <GameFrame
        src={withBaseUrl('/games/command-and-conquer/index.html')}
        title="Command & Conquer"
        allowFullScreen
        allow="autoplay"
        onLoad={handleLoad}
      />
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
  position: relative;
  touch-action: none;
`;

const GameFrame = styled.iframe`
  width: 640px;
  height: 535px;
  border: none;
  overflow: hidden;
  touch-action: none;
  display: block;
`;

export default CommandAndConquer;
