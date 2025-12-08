import React, { useState } from 'react';
import styled from 'styled-components';

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

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  gap: 16px;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255,255,255,0.2);
    border-top-color: #00d4ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    font-size: 18px;
    font-weight: bold;
    background: linear-gradient(90deg, #00d4ff, #7b2cbf);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

function QQArcade({ onClose, onMinimize }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Container>
      {isLoading && (
        <LoadingOverlay>
          <div className="spinner" />
          <span className="loading-text">QQ Games Arcade</span>
        </LoadingOverlay>
      )}
      <AppFrame
        src="/games/QQArcade/index.html"
        onLoad={() => setIsLoading(false)}
        title="QQ Games Arcade"
        allow="autoplay"
      />
    </Container>
  );
}

export default QQArcade;
