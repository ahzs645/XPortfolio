import React, { useState } from 'react';
import styled from 'styled-components';

function Diablo() {
  const [isLoading, setIsLoading] = useState(true);

  // Uses the hosted demo (includes shareware spawn.mpq)
  const gameSrc = 'https://d07riv.github.io/diabloweb/';

  return (
    <Container>
      {isLoading && (
        <LoadingOverlay>
          <LoadingText>Loading Diablo...</LoadingText>
          <LoadingSubtext>Shareware Version</LoadingSubtext>
        </LoadingOverlay>
      )}
      <GameFrame
        src={gameSrc}
        title="Diablo"
        frameBorder="0"
        allowFullScreen
        allow="autoplay"
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
  background: linear-gradient(135deg, #1a0a0a 0%, #2d1010 50%, #3d1515 100%);
  z-index: 10;
`;

const LoadingText = styled.div`
  color: #c41e3a;
  font-size: 28px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  font-family: 'Times New Roman', serif;
  margin-bottom: 10px;
`;

const LoadingSubtext = styled.div`
  color: #888;
  font-size: 14px;
`;

const GameFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  touch-action: none;
`;

export default Diablo;
