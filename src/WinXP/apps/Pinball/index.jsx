import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';

function Pinball() {
  const iframeRef = useRef(null);
  const [isLaunching, setIsLaunching] = useState(true);
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return undefined;

    let minimumSplashTimer;
    const fallbackTimer = window.setTimeout(() => {
      setIsLaunching(false);
    }, 7000);

    const finishLaunch = () => {
      minimumSplashTimer = window.setTimeout(() => {
        setIsLaunching(false);
      }, 700);
    };

    iframe.addEventListener('game-loaded', finishLaunch);
    iframe.addEventListener('game-load-failed', finishLaunch);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(minimumSplashTimer);
      iframe.removeEventListener('game-loaded', finishLaunch);
      iframe.removeEventListener('game-load-failed', finishLaunch);
    };
  }, []);

  return (
    <Container>
      {isLaunching &&
        createPortal(
          <LaunchSplash $frameLoaded={isFrameLoaded} aria-hidden="true">
            <SplashImage src={withBaseUrl('/games/pinball/pinball-splash.png')} alt="" draggable="false" />
          </LaunchSplash>,
          document.body
        )}
      <GameFrame
        ref={iframeRef}
        src={withBaseUrl('/games/pinball/pinball.html')}
        title="3D Pinball for Windows - Space Cadet"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; fullscreen"
        $visible={!isLaunching}
        onLoad={() => setIsFrameLoaded(true)}
      />
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #000;
  position: relative;
  /* Allow touch events to pass through to iframe for mobile support */
  touch-action: none;
`;

const LaunchSplash = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  opacity: ${({ $frameLoaded }) => ($frameLoaded ? 0.96 : 1)};
  transition: opacity 180ms ease;
  cursor: wait;
`;

const SplashImage = styled.img`
  width: min(82vw, 960px);
  height: auto;
  max-height: 82vh;
  object-fit: contain;
  image-rendering: auto;
  user-select: none;
`;

const GameFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 160ms ease;
  /* Ensure iframe can handle its own touch events */
  touch-action: none;
`;

export default Pinball;
