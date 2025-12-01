import React from 'react';
import styled from 'styled-components';

function Pinball({ onClose, isFocus }) {
  return (
    <Container>
      <iframe
        src="/games/pinball/pinball.html"
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

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export default Pinball;
