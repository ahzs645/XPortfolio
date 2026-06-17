import React, { useState } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';
import useLoadingCursor from '../../hooks/useLoadingCursor';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  overflow: hidden;
`;

const AppFrame = styled.iframe`
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
`;

function QQArcade() {
  const [isLoading, setIsLoading] = useState(true);
  useLoadingCursor(isLoading);

  return (
    <Container>
      <AppFrame
        src={withBaseUrl('/games/QQArcade/index.html')}
        onLoad={() => setIsLoading(false)}
        title="QQ Games Arcade"
        allow="autoplay"
      />
    </Container>
  );
}

export default QQArcade;
