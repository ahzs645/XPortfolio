import React, { useState } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';
import useLoadingCursor from '../../hooks/useLoadingCursor';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #87CEEB 0%, #E0F7FA 100%);
  overflow: hidden;
`;

const AppFrame = styled.iframe`
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
`;

function QQPet13() {
  const [isLoading, setIsLoading] = useState(true);
  useLoadingCursor(isLoading);

  return (
    <Container>
      <AppFrame
        src={withBaseUrl('/games/QQPet13/index.html')}
        onLoad={() => setIsLoading(false)}
        title="QQ Pet 13"
        allow="autoplay"
      />
    </Container>
  );
}

export default QQPet13;
