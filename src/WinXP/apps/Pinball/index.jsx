import React from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';

function Pinball() {
  return (
    <Container>
      <iframe
        src={withBaseUrl('/games/pinball/pinball.html')}
        title="3D Pinball for Windows - Space Cadet"
        frameBorder="0"
        allowFullScreen
      />
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
  /* Allow touch events to pass through to iframe for mobile support */
  touch-action: none;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
    /* Ensure iframe can handle its own touch events */
    touch-action: none;
  }
`;

export default Pinball;
