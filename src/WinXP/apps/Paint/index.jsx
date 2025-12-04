import React from 'react';
import styled from 'styled-components';

function Paint({ onClose, isFocus }) {
  return (
    <Container>
      <PaintFrame
        src="/apps/jspaint/index.html"
        title="Paint"
        allow="clipboard-read; clipboard-write"
      />
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #c0c0c0;
  overflow: hidden;
`;

const PaintFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

export default Paint;
