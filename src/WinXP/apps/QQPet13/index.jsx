import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
`;

const AppFrame = styled.iframe`
  flex: 1;
  width: 100%;
  border: none;
  background: #000;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Microsoft YaHei', 'Trebuchet MS', sans-serif;
  color: white;
  gap: 16px;

  .loading-icon {
    width: 64px;
    height: 64px;
    animation: bounce 1s ease-in-out infinite;
  }

  .loading-text {
    font-size: 16px;
    font-weight: bold;
  }

  .loading-subtitle {
    font-size: 12px;
    opacity: 0.8;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

function QQPet13({ onClose, onMinimize }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Container>
      {isLoading && (
        <LoadingOverlay>
          <img
            className="loading-icon"
            src="/games/QQPet13/logo.png"
            alt="QQ Pet"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className="loading-text">QQ宠物 - 相伴十三载</span>
          <span className="loading-subtitle">Loading...</span>
        </LoadingOverlay>
      )}
      <AppFrame
        src="/games/QQPet13/index.html"
        onLoad={() => setIsLoading(false)}
        title="QQ Pet 13"
        allow="autoplay"
      />
    </Container>
  );
}

export default QQPet13;
