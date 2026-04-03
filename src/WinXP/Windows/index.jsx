import React, { useRef, memo, useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import { useElementResize, useWindowSize } from '../../hooks';
import ErrorBoundary from '../../components/ErrorBoundary';
import cursorManager from '../../utils/cursorManager';
import { useTheme } from '../../contexts/ThemeContext';
import { withBaseUrl } from '../../utils/baseUrl';

// Component that changes cursor to wait state while loading
function LoadingFallback() {
  useEffect(() => {
    const modeToken = cursorManager.pushMode('progress');

    return () => {
      modeToken.release();
    };
  }, []);

  // Return null - no visible loading UI
  return null;
}

// Wrapper that signals when the app component has loaded
function LoadedWrapper({ children, onLoaded }) {
  useEffect(() => {
    onLoaded();
  }, [onLoaded]);

  return children;
}

function Windows({
  apps,
  onMouseDown,
  onClose,
  onMinimize,
  onMaximize,
  focusedAppId,
}) {
  const { activeTheme } = useTheme();
  return (
    <div style={{ position: 'relative', zIndex: 0 }}>
      {apps.map((app) => (
        <Window
          show={!app.minimized}
          key={app.id}
          id={app.id}
          onMouseDown={onMouseDown}
          onMouseUpClose={onClose}
          onMouseUpMinimize={onMinimize}
          onMouseUpMaximize={onMaximize}
          isFocus={focusedAppId === app.id}
          shellTheme={activeTheme}
          {...app}
        />
      ))}
    </div>
  );
}

const Window = memo(function ({
  injectProps,
  id,
  onMouseDown,
  onMouseUpClose,
  onMouseUpMinimize,
  onMouseUpMaximize,
  header,
  defaultSize,
  minSize,
  defaultOffset,
  resizable,
  maximized,
  component,
  zIndex,
  isFocus,
  show,
  shellTheme,
}) {
  // State for dynamic header updates from child components
  const [dynamicHeader, setDynamicHeader] = React.useState(null);
  // Track if the lazy component has finished loading
  const [isLoading, setIsLoading] = useState(true);
  const handleLoaded = useCallback(() => setIsLoading(false), []);
  const currentHeader = dynamicHeader || header;
  const AppComponent = component;
  function _onMouseDown(e) {
    // Stop propagation to prevent desktop from receiving the event
    // This ensures clicking anywhere in the window (not just the title bar) activates it
    e.stopPropagation();
    onMouseDown(id);
  }

  function _onFocusCapture() {
    // Capture focus events from descendants (including iframes)
    // This ensures clicking inside an iframe also activates the window
    onMouseDown(id);
  }

  function _onMouseUpClose() {
    onMouseUpClose(id);
  }

  function _onMouseUpMinimize() {
    onMouseUpMinimize(id);
  }

  function _onMouseUpMaximize() {
    if (resizable) onMouseUpMaximize(id);
  }

  function onDoubleClickHeader(e) {
    if (e.target !== dragRef.current) return;
    _onMouseUpMaximize();
  }

  const dragRef = useRef(null);
  const ref = useRef(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const { offset, size, setSize } = useElementResize(ref, {
    dragRef,
    defaultOffset,
    defaultSize,
    minSize,
    boundary: {
      top: 1,
      right: windowWidth - 1,
      bottom: windowHeight - 31,
      left: 1,
    },
    resizable,
    resizeThreshold: 10,
  });

  const onResize = useCallback((newWidth, newHeight) => {
    setSize({ width: newWidth, height: newHeight || 0 });
  }, [setSize]);

  let width, height, x, y;
  if (maximized) {
    width = windowWidth + 6;
    height = windowHeight - 24;
    x = -3;
    y = -3;
  } else {
    width = size.width;
    height = size.height;
    x = offset.x;
    y = offset.y;
  }

  if (!show) return null;

  return (
    <WindowContainer
      ref={ref}
      className={currentHeader.invisible ? 'frameless' : `window ${isFocus ? '' : 'inactive'}`}
      data-theme-type={shellTheme?.titleBar?.type !== 'css' ? 'image' : undefined}
      $shellTheme={shellTheme}
      onMouseDown={_onMouseDown}
      onTouchStart={_onMouseDown}
      onFocusCapture={_onFocusCapture}
      style={{
        transform: `translate(${x}px,${y}px)`,
        ...(width && { width: `${width}px` }),
        ...(height && { height: `${height}px` }),
        zIndex,
        // Hide window while loading - only show wait cursor
        ...(isLoading && {
          visibility: 'hidden',
          pointerEvents: 'none',
        }),
        ...(currentHeader.invisible && {
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
          borderRadius: 0,
          padding: 0,
        }),
      }}
    >
      {!currentHeader.invisible && (
        <div className="title-bar" ref={dragRef} onDoubleClick={onDoubleClickHeader}>
          <div className="window-inactive-mask" />
          <div className="title-bar-text">
            {currentHeader.icon && (
              <img
                src={currentHeader.icon}
                alt=""
                onDoubleClick={_onMouseUpClose}
                draggable={false}
                style={{ width: 16, height: 16, marginRight: 4, marginLeft: 2 }}
              />
            )}
            {currentHeader.title}
          </div>
          <div className="title-bar-controls">
            {shellTheme?.windowControls?.type === 'sprite' ? (
              <>
                {(!currentHeader.buttons || currentHeader.buttons.includes('minimize')) && (
                  <SpriteButton
                    aria-label="Minimize"
                    onClick={_onMouseUpMinimize}
                    onTouchEnd={(e) => { e.stopPropagation(); _onMouseUpMinimize(); }}
                    $sprite={shellTheme.windowControls.minimize}
                  />
                )}
                {(!currentHeader.buttons || currentHeader.buttons.includes('maximize')) && (
                  <SpriteButton
                    aria-label={maximized ? 'Restore' : 'Maximize'}
                    onClick={_onMouseUpMaximize}
                    onTouchEnd={(e) => { e.stopPropagation(); if (resizable) _onMouseUpMaximize(); }}
                    disabled={!resizable}
                    $sprite={maximized ? shellTheme.windowControls.restore : shellTheme.windowControls.maximize}
                  />
                )}
                {(!currentHeader.buttons || currentHeader.buttons.includes('close')) && (
                  <SpriteButton
                    aria-label="Close"
                    onClick={_onMouseUpClose}
                    onTouchEnd={(e) => { e.stopPropagation(); _onMouseUpClose(); }}
                    $sprite={shellTheme.windowControls.close}
                  />
                )}
              </>
            ) : (
              <>
                {(!currentHeader.buttons || currentHeader.buttons.includes('minimize')) && (
                  <button
                    aria-label="Minimize"
                    onClick={_onMouseUpMinimize}
                    onTouchEnd={(e) => { e.stopPropagation(); _onMouseUpMinimize(); }}
                  />
                )}
                {(!currentHeader.buttons || currentHeader.buttons.includes('maximize')) && (
                  <button
                    aria-label={maximized ? 'Restore' : 'Maximize'}
                    onClick={_onMouseUpMaximize}
                    onTouchEnd={(e) => { e.stopPropagation(); if (resizable) _onMouseUpMaximize(); }}
                    disabled={!resizable}
                  />
                )}
                {(!currentHeader.buttons || currentHeader.buttons.includes('close')) && (
                  <button
                    aria-label="Close"
                    onClick={_onMouseUpClose}
                    onTouchEnd={(e) => { e.stopPropagation(); _onMouseUpClose(); }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
      {!isFocus && (
        <div
          className="window-focus-overlay"
          onMouseDown={_onMouseDown}
          onTouchStart={_onMouseDown}
          style={currentHeader.invisible ? { top: 0 } : undefined}
        />
      )}
      <div className="window-body" style={currentHeader.invisible ? { margin: 0 } : undefined}>
        <ErrorBoundary name={currentHeader.title}>
          <React.Suspense fallback={<LoadingFallback />}>
            <LoadedWrapper onLoaded={handleLoaded}>
              <AppComponent
                onClose={_onMouseUpClose}
                onMinimize={_onMouseUpMinimize}
                onMaximize={_onMouseUpMaximize}
                onResize={onResize}
                isFocus={isFocus}
                isMaximized={maximized}
                onUpdateHeader={setDynamicHeader}
                dragRef={currentHeader.invisible ? dragRef : undefined}
                windowPosition={{ x: offset.x, y: offset.y }}
                {...injectProps}
              />
            </LoadedWrapper>
          </React.Suspense>
        </ErrorBoundary>
      </div>
    </WindowContainer>
  );
});

const SpriteButton = styled.button`
  all: unset;
  width: ${({ $sprite }) => $sprite?.stateWidth || 19}px;
  height: ${({ $sprite }) => $sprite?.stateHeight || 17}px;
  background-image: url(${({ $sprite }) => withBaseUrl($sprite?.spriteSheet)});
  background-repeat: no-repeat;
  background-size: auto 100%;
  background-position: 0 0;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 2px;

  &:hover {
    background-position: -${({ $sprite }) => $sprite?.stateWidth || 19}px 0;
  }

  &:active {
    background-position: -${({ $sprite }) => ($sprite?.stateWidth || 19) * 2}px 0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

const WindowContainer = styled.div`
  position: absolute;
  display: inline-flex;
  flex-direction: column;
  overflow: hidden;

  &.frameless {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
  }

  .title-bar {
    height: 28px;
    min-height: 28px;
    padding: 0 3px;
    min-width: 0;
    position: relative;
  }

  .title-bar-text {
    display: flex;
    align-items: center;
    pointer-events: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
  }

  .window-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: 0 3px 0 3px;
    padding: 0;
    min-height: 0;
    position: relative;
  }

  .window-focus-overlay {
    position: absolute;
    top: 28px; /* Below the title bar */
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    cursor: default;
  }

  /* Image-based theme overrides for window chrome */
  &[data-theme-type="image"] {
    ${({ $shellTheme }) => {
      const tb = $shellTheme?.titleBar;
      const wf = $shellTheme?.windowFrame;
      if (!tb || tb.type === 'css') return '';

      const frameImg = tb.frameImage ? withBaseUrl(tb.frameImage) : '';
      const sideImg = wf?.sideImage ? withBaseUrl(wf.sideImage) : '';
      const frameW = tb.frameWidth || 180;

      return `
        border-color: ${wf?.borderColor || '#646464'} !important;
        background-color: ${wf?.bodyBackground || '#b4b4b4'} !important;

        .title-bar {
          background: url(${frameImg}) 0 0 / ${frameW}px auto no-repeat !important;
          background-size: cover !important;
          height: ${tb.height || 28}px !important;
          min-height: ${tb.height || 28}px !important;
        }

        &.inactive .title-bar {
          background-position: -${frameW}px 0 !important;
          background-size: cover !important;
        }

        .title-bar-text {
          color: ${tb.textColor || '#dcdcdc'} !important;
          text-shadow: ${tb.textShadow || 'none'} !important;
          font-family: ${tb.fontFamily || 'Tahoma, sans-serif'} !important;
          font-size: ${tb.fontSize || '13px'} !important;
          font-weight: ${tb.fontWeight || 'normal'} !important;
        }

        &.inactive .title-bar-text {
          color: ${tb.inactiveTextColor || '#b4b4b4'} !important;
        }

        .title-bar-controls {
          display: flex;
          align-items: center;
          gap: 0;
        }

        .title-bar-controls button:not([class]) {
          /* Hide default xp.css button styling for image themes */
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          min-width: 0 !important;
          min-height: 0 !important;
          width: auto !important;
          height: auto !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        ${sideImg ? `
          border-left: ${wf.sideWidth || 4}px solid transparent;
          border-right: ${wf.sideWidth || 4}px solid transparent;
          border-image-source: url(${sideImg});
          border-image-slice: 0 ${wf.sideWidth || 4} fill;
        ` : ''}
      `;
    }}
  }
`;

export default Windows;
