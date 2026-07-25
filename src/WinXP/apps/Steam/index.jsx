import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useApp } from '../../../contexts/AppContext';
import { withBaseUrl } from '../../../utils/baseUrl';
import useLoadingCursor from '../../hooks/useLoadingCursor';

const GAME_APP_KEYS = {
  tf2: 'Team Fortress 2',
  hl2: 'Half-Life 2',
};

function Steam({
  dragRef,
  onMinimize,
  onMaximize,
  onClose,
  onResize,
  isMaximized,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const appFrameRef = useRef(null);
  const containerRef = useRef(null);
  const frameCleanupRef = useRef(() => {});
  const { openApp } = useApp();
  useLoadingCursor(isLoading);

  const handleResizeStart = useCallback((event) => {
    if (!containerRef.current || !onResize || isMaximized) return;

    event.preventDefault();
    event.stopPropagation();
    const { width, height } = containerRef.current.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    let nextFrame = null;
    if (appFrameRef.current) appFrameRef.current.style.pointerEvents = 'none';

    const applyResize = (moveEvent) => {
      const nextWidth = Math.max(640, width + moveEvent.clientX - startX);
      const nextHeight = Math.max(480, height + moveEvent.clientY - startY);
      if (nextFrame) cancelAnimationFrame(nextFrame);
      nextFrame = requestAnimationFrame(() => onResize(nextWidth, nextHeight));
    };

    const stopResize = () => {
      if (nextFrame) cancelAnimationFrame(nextFrame);
      if (appFrameRef.current) appFrameRef.current.style.pointerEvents = '';
      window.removeEventListener('mousemove', applyResize);
      window.removeEventListener('mouseup', stopResize);
    };

    window.addEventListener('mousemove', applyResize);
    window.addEventListener('mouseup', stopResize);
  }, [isMaximized, onResize]);

  const connectWindowChrome = useCallback((frame) => {
    frameCleanupRef.current();

    const frameDocument = frame.contentDocument;
    if (!frameDocument) return;

    const cleanups = [];
    const bind = (element, eventName, listener, options) => {
      if (!element) return;
      element.addEventListener(eventName, listener, options);
      cleanups.push(() => element.removeEventListener(eventName, listener, options));
    };

    bind(frameDocument.querySelector('#minimize'), 'click', onMinimize);
    bind(frameDocument.querySelector('#maximize'), 'click', onMaximize);
    bind(frameDocument.querySelector('#exit'), 'click', onClose);
    frameCleanupRef.current = () => cleanups.forEach((cleanup) => cleanup());
  }, [onClose, onMaximize, onMinimize]);

  const syncMaximizeControl = useCallback(() => {
    const maximizeControl = appFrameRef.current?.contentDocument?.querySelector('#maximize');
    if (!maximizeControl) return;
    maximizeControl.classList.toggle('is-restore', isMaximized);
    maximizeControl.setAttribute('aria-label', isMaximized ? 'Restore Steam' : 'Maximize Steam');
    maximizeControl.setAttribute('title', isMaximized ? 'Restore' : 'Maximize');
  }, [isMaximized]);

  const handleFrameLoad = useCallback((event) => {
    setIsLoading(false);
    connectWindowChrome(event.currentTarget);
    syncMaximizeControl();
  }, [connectWindowChrome, syncMaximizeControl]);

  useEffect(() => {
    syncMaximizeControl();
  }, [syncMaximizeControl]);

  useEffect(() => {
    const handleSteamMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'xportfolio:steam-launch') return;

      const frameWindow = appFrameRef.current?.contentWindow;
      let isSteamSource = event.source === frameWindow;
      try {
        isSteamSource ||= event.source?.parent === frameWindow;
      } catch {
        isSteamSource = false;
      }
      if (!isSteamSource) return;

      const appKey = GAME_APP_KEYS[event.data.gameId];
      if (appKey) openApp(appKey);
    };

    window.addEventListener('message', handleSteamMessage);
    return () => window.removeEventListener('message', handleSteamMessage);
  }, [openApp]);

  useEffect(() => () => frameCleanupRef.current(), []);

  return (
    <Container ref={containerRef}>
      <AppFrame
        ref={appFrameRef}
        src={withBaseUrl('/apps/steam/index.html')}
        title="Steam - Source Library"
        onLoad={handleFrameLoad}
      />
      <DragRegion ref={dragRef} aria-hidden="true" />
      <ResizeRegion
        aria-label="Resize Steam window"
        onMouseDown={handleResizeStart}
      />
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #171d25;
`;

const AppFrame = styled.iframe`
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #171d25;
`;

const DragRegion = styled.div`
  position: absolute;
  z-index: 2;
  top: 0;
  right: 116px;
  left: 225px;
  height: 27px;
  cursor: default;
  touch-action: none;
`;

const ResizeRegion = styled.div`
  position: absolute;
  z-index: 3;
  right: 0;
  bottom: 0;
  width: 22px;
  height: 22px;
  cursor: se-resize;
  touch-action: none;
`;

export default Steam;
