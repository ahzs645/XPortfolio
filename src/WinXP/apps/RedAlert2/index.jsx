import { useState, useCallback } from 'react';
import styled from 'styled-components';
import useLoadingCursor from '../../hooks/useLoadingCursor';

function RedAlert2() {
  const [isLoading, setIsLoading] = useState(true);
  useLoadingCursor(isLoading);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <Container>
      <GameFrame
        src="https://ra2html5.surge.sh/"
        title="Command & Conquer: Red Alert 2"
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
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
  touch-action: none;
  display: block;
`;

export default RedAlert2;
