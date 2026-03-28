import { useState, useCallback } from 'react';
import styled from 'styled-components';

function RedAlert2() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <Container>
      {isLoading && (
        <LoadingOverlay>
          <LoadingText>Loading Command & Conquer: Red Alert 2...</LoadingText>
          <LoadingSub>HTML5 Port by Võ Thành Đạt</LoadingSub>
        </LoadingOverlay>
      )}
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
  background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a2a 100%);
  z-index: 10;
`;

const LoadingText = styled.div`
  color: #ff3333;
  font-size: 22px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 50, 50, 0.5);
  margin-bottom: 6px;
`;

const LoadingSub = styled.div`
  color: #888;
  font-size: 12px;
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
