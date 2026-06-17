import React, { useState } from 'react';
import styled from 'styled-components';
import useLoadingCursor from '../../hooks/useLoadingCursor';

function Diablo() {
  const [isLoading, setIsLoading] = useState(true);
  useLoadingCursor(isLoading);

  // Uses the hosted demo (includes shareware spawn.mpq)
  const gameSrc = 'https://d07riv.github.io/diabloweb/';

  return (
    <Container>
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

const GameFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  touch-action: none;
`;

export default Diablo;
