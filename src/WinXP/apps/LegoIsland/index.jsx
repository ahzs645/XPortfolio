import React, { useState } from 'react';
import styled from 'styled-components';


function LegoIsland() {
  const [isLoading, setIsLoading] = useState(true);

  // Option 1: Use local files (after extracting from Docker container)
  // const gameSrc = withBaseUrl('/games/legoIsland/index.html');

  // Option 2: Use the hosted demo (simpler, but relies on external service)
  const gameSrc = 'https://isle.pizza';

  return (
    <Container>
      {isLoading && (
        <LoadingOverlay>
          <LoadingText>Loading LEGO Island...</LoadingText>
          <LoadingSubtext>This may take a moment</LoadingSubtext>
        </LoadingOverlay>
      )}
      <GameFrame
        src={gameSrc}
        title="LEGO Island"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; gamepad"
        credentialless="true"
        onLoad={() => setIsLoading(false)}
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
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  z-index: 10;
`;

const LoadingText = styled.div`
  color: #ffcc00;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 10px;
`;

const LoadingSubtext = styled.div`
  color: #aaa;
  font-size: 14px;
`;

const GameFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  touch-action: none;
`;

export default LegoIsland;
