import React, { useState } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';
import useLoadingCursor from '../../hooks/useLoadingCursor';

function LegoIsland() {
  const [isLoading, setIsLoading] = useState(true);
  useLoadingCursor(isLoading);

  const gameSrc = withBaseUrl('/games/legoIsland/index.html');

  return (
    <Container>
      <GameFrame
        src={gameSrc}
        title="LEGO Island"
        style={{ border: 'none' }}
        allowFullScreen
        allow="autoplay; gamepad"
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

export default LegoIsland;
