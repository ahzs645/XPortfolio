import React, { useState } from 'react';
import styled from 'styled-components';

function XPTour() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Container>
      {!isLoaded && (
        <Overlay>
          <Loading>Loading Windows XP Tour…</Loading>
          <Subtext>If the tour does not appear, refresh or allow autoplay for audio.</Subtext>
        </Overlay>
      )}
      <Frame
        src="/apps/xp-tour/index.html"
        title="Tour Windows XP"
        allow="autoplay"
        onLoad={() => setIsLoaded(true)}
      />
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #012b63;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
`;

const Frame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 16px;
  color: #f1f6ff;
  background: linear-gradient(135deg, rgba(8, 36, 99, 0.9), rgba(0, 11, 45, 0.9));
  z-index: 1;
`;

const Loading = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 6px;
`;

const Subtext = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

export default XPTour;
