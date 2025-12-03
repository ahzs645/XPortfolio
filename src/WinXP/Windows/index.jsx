import React, { useRef, memo, useCallback } from 'react';
import styled from 'styled-components';

import { useElementResize, useWindowSize } from '../../hooks';

function Windows({
  apps,
  onMouseDown,
  onClose,
  onMinimize,
  onMaximize,
  focusedAppId,
}) {
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
  component: Component,
  zIndex,
  isFocus,
  show,
}) {
  function _onMouseDown() {
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
      className={`window ${isFocus ? '' : 'inactive'}`}
      onMouseDown={_onMouseDown}
      style={{
        transform: `translate(${x}px,${y}px)`,
        ...(width && { width: `${width}px` }),
        ...(height && { height: `${height}px` }),
        zIndex,
      }}
    >
      {!header.invisible && (
        <div className="title-bar" ref={dragRef} onDoubleClick={onDoubleClickHeader}>
          <div className="title-bar-text">
            {header.icon && (
              <img
                src={header.icon}
                alt=""
                onDoubleClick={_onMouseUpClose}
                draggable={false}
                style={{ width: 16, height: 16, marginRight: 4, marginLeft: 2 }}
              />
            )}
            {header.title}
          </div>
          <div className="title-bar-controls">
            {(!header.buttons || header.buttons.includes('minimize')) && (
              <button aria-label="Minimize" onMouseUp={_onMouseUpMinimize} />
            )}
            {(!header.buttons || header.buttons.includes('maximize')) && (
              <button
                aria-label={maximized ? 'Restore' : 'Maximize'}
                onMouseUp={_onMouseUpMaximize}
                disabled={!resizable}
              />
            )}
            {(!header.buttons || header.buttons.includes('close')) && (
              <button aria-label="Close" onMouseUp={_onMouseUpClose} />
            )}
          </div>
        </div>
      )}
      <div className="window-body">
        <Component
          onClose={_onMouseUpClose}
          onMinimize={_onMouseUpMinimize}
          onResize={onResize}
          isFocus={isFocus}
          {...injectProps}
        />
      </div>
    </WindowContainer>
  );
});

const WindowContainer = styled.div`
  position: absolute;
  display: inline-flex;
  flex-direction: column;
  overflow: hidden;

  .title-bar {
    height: 28px;
    min-height: 28px;
    padding: 0 3px;
    min-width: 0;
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
  }
`;

export default Windows;
