import React from 'react';
import styled from 'styled-components';

function SpiderSolitaire({ onClose, isFocus }) {
  return (
    <Container>
      <iframe
        src="/games/spider-solitaire/index.html"
        title="Spider Solitaire"
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

export default SpiderSolitaire;
