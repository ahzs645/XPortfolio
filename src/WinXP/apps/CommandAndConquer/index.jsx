import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';

function CommandAndConquer() {
  const [isLoading, setIsLoading] = useState(true);

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
      {isLoading && (
        <LoadingOverlay>
          <LoadingText>Loading Command & Conquer...</LoadingText>
        </LoadingOverlay>
      )}
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

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a0a00 0%, #3a1a0a 50%, #2a1a00 100%);
  z-index: 10;
`;

const LoadingText = styled.div`
  color: #ffd700;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  margin-bottom: 10px;
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
