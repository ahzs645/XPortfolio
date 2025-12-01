import React from 'react';
import styled from 'styled-components';

function Solitaire({ onClose, isFocus }) {
  return (
    <Container>
      <iframe
        src="/games/solitaire/index.html"
        title="Solitaire"
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
  background: #008000;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export default Solitaire;
