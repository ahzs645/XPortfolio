import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';

function XPTour() {
  const [mode, setMode] = useState('flash');
  const [isLoaded, setIsLoaded] = useState(false);
  const frameSrc = useMemo(() => (
    mode === 'flash'
      ? withBaseUrl('/apps/xp-tour/index.html')
      : withBaseUrl('/apps/xp-tour/html-tour/default.htm')
  ), [mode]);

  return (
    <Container>
      <Toolbar>
        <ModeButton
          type="button"
          $active={mode === 'flash'}
          onClick={() => {
            setIsLoaded(false);
            setMode('flash');
          }}
        >
          Flash Tour
        </ModeButton>
        <ModeButton
          type="button"
          $active={mode === 'html'}
          onClick={() => {
            setIsLoaded(false);
            setMode('html');
          }}
        >
          HTML Tour
        </ModeButton>
      </Toolbar>
      {!isLoaded && (
        <Overlay>
          <Loading>Loading Windows XP Tour…</Loading>
          <Subtext>
            {mode === 'flash'
              ? 'If the Flash tour does not appear, refresh or allow autoplay for audio.'
              : 'The HTML tour is a static walkthrough imported from the legacy snapshot.'}
          </Subtext>
        </Overlay>
      )}
      <Frame
        src={frameSrc}
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
`;

const Toolbar = styled.div`
  display: flex;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(180deg, rgba(8, 36, 99, 0.9), rgba(2, 18, 56, 0.92));
  z-index: 2;
`;

const ModeButton = styled.button`
  min-width: 92px;
  padding: 4px 10px;
  border: 1px solid ${({ $active }) => ($active ? '#ffd34a' : '#7fa7ef')};
  border-radius: 3px;
  background: ${({ $active }) => ($active
    ? 'linear-gradient(180deg, #fff7c2, #ffdd6f)'
    : 'linear-gradient(180deg, #f5fbff, #d7e9ff)')};
  color: #001137;
  cursor: pointer;
  font: 600 11px Tahoma, sans-serif;
`;

const Frame = styled.iframe`
  width: 100%;
  flex: 1;
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
