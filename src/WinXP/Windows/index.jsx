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

  // Decorative extra skin buttons position on the caption art like the main
  // controls: frame-pixel coordinates scaled to the rendered caption height.
  const controlScale = shellTheme?.titleBar?.frameHeight
    ? (shellTheme.titleBar.height || 28) / shellTheme.titleBar.frameHeight
    : 1;
  const controlSlotMode = shellTheme?.windowControls?.type === 'sprite'
    && [
      shellTheme.windowControls.minimize,
      shellTheme.windowControls.maximize,
      shellTheme.windowControls.restore,
      shellTheme.windowControls.close,
    ].some((s) => s?.x != null);

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
                {controlSlotMode && shellTheme.windowControls.extras?.map((extra, i) => {
                  const inset = shellTheme.titleBar?.slotInset;
                  const barHeight = shellTheme.titleBar?.height || 28;
                  const top = inset != null
                    ? Math.max(0, Math.round(barHeight - Math.max(1, inset - 2) - extra.stateHeight))
                    : Math.round((extra.y ?? 0) * controlScale);
                  return (
                    <SpriteButton
                      key={`extra-${i}`}
                      as="span"
                      aria-hidden="true"
                      $sprite={extra}
                      style={{
                        position: 'absolute',
                        right: Math.max(0, Math.round((extra.x - extra.stateWidth - (inset || 0)) * controlScale)),
                        top,
                        margin: 0,
                        pointerEvents: 'none',
                      }}
                    />
                  );
                })}
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

/*
 * Skin control buttons are raster frames cropped from the skin's state strip.
 * XP.css targets .title-bar-controls button[aria-label=...] with its own
 * vector art at higher specificity, so every visual property that must come
 * from the skin needs !important. Legacy themes (spriteSheet only) keep the
 * old background-position slicing.
 */
const spriteStateCss = (image) => (image ? `background-image: url("${image}") !important;` : '');

const SpriteButton = styled.button`
  all: unset;
  width: ${({ $sprite }) => $sprite?.stateWidth || 19}px !important;
  height: ${({ $sprite }) => $sprite?.stateHeight || 17}px !important;
  min-width: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  background-color: transparent !important;
  ${({ $sprite }) => spriteStateCss($sprite?.normal || withBaseUrl($sprite?.spriteSheet))}
  background-repeat: no-repeat !important;
  background-size: ${({ $sprite }) => ($sprite?.normal ? '100% 100%' : 'auto 100%')} !important;
  background-position: 0 0 !important;
  cursor: pointer;
  flex-shrink: 0;
  margin-left: 2px;

  /* XP.css draws its glyphs via :after overlays — remove them entirely. */
  &:before,
  &:after {
    content: none !important;
    background: none !important;
    box-shadow: none !important;
  }

  &:hover {
    ${({ $sprite }) => ($sprite?.normal
      ? spriteStateCss($sprite.hover)
      : `background-position: -${$sprite?.stateWidth || 19}px 0 !important;`)}
  }

  &:active {
    ${({ $sprite }) => ($sprite?.normal
      ? spriteStateCss($sprite.pressed)
      : `background-position: -${($sprite?.stateWidth || 19) * 2}px 0 !important;`)}
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

      // Raster caption art. Skins mark fixed end caps (logo / button decor)
      // with TopTopHeight/TopBotHeight; only the middle between them repeats
      // (or stretches). The art lives on an absolutely-positioned ::before so
      // the cap-sized borders never push the caption's content around.
      // Older persisted themes only carry the 2-cell strip and keep
      // stretching it.
      const capL = tb.capLeft || 0;
      const capR = tb.capRight || 0;
      const capScale = tb.frameHeight ? (tb.height || 28) / tb.frameHeight : 1;
      let titleBg;
      let titleBgInactive;
      if (tb.activeImage && (capL || capR)) {
        const bwL = Math.round(capL * capScale);
        const bwR = Math.round(capR * capScale);
        titleBg = `
          background: none !important;
          position: relative;
          &::before {
            content: '' !important;
            position: absolute;
            inset: 0;
            z-index: 0;
            pointer-events: none;
            background: none;
            border-style: solid;
            border-color: transparent;
            border-width: 0 ${bwR}px 0 ${bwL}px;
            border-image: url("${tb.activeImage}") 0 ${capR} 0 ${capL} fill / 0 ${bwR}px 0 ${bwL}px ${tb.stretch ? 'stretch' : 'repeat'} stretch;
          }
          & > * {
            position: relative;
            z-index: 1;
          }
        `;
        titleBgInactive = `
          &::before {
            border-image-source: url("${tb.inactiveImage || tb.activeImage}");
          }
        `;
      } else if (tb.activeImage) {
        titleBg = tb.stretch ? `
          background-image: url("${tb.activeImage}") !important;
          background-repeat: no-repeat !important;
          background-size: 100% 100% !important;
        ` : `
          background-image: url("${tb.activeImage}") !important;
          background-repeat: repeat-x !important;
          background-size: auto 100% !important;
        `;
        titleBgInactive = `background-image: url("${tb.inactiveImage || tb.activeImage}") !important;`;
      } else {
        titleBg = `
          background-image: url(${frameImg}) !important;
          background-position: left top !important;
          background-repeat: no-repeat !important;
          background-size: 200% 100% !important;
        `;
        titleBgInactive = 'background-position: right top !important;';
      }

      // Caption text placement from the skin (alignment + pixel shifts).
      // TextShift marks where the icon+title block starts, measured from the
      // window edge in frame pixels (scaled with the caption). The vertical
      // shift is applied from the centered position and kept inside the bar.
      const shiftX = Math.max(0, Math.round((tb.textShiftX || 0) * capScale));
      const textAlignCss = tb.textAlign === 'center'
        ? 'justify-content: center;'
        : tb.textAlign === 'right'
          ? `justify-content: flex-end; padding-right: ${shiftX}px;`
          : `padding-left: ${shiftX}px;`;
      const capHeight = tb.height || 28;
      const fontPx = parseInt(tb.fontSize, 10) || 13;
      const centerMax = Math.max(0, Math.floor((capHeight - fontPx) / 2) - 1);
      let shiftY = tb.textShiftY || 0;
      if (shiftY > centerMax) {
        // Shifts too large to be centre-relative are measured from the
        // caption top (SantaXP puts its title 40px down, in the red band).
        shiftY = Math.min(shiftY, capHeight - fontPx - 1) - Math.floor((capHeight - fontPx) / 2);
      } else if (shiftY < -centerMax) {
        // Text can't rise above the bar; keep it centred (xbox says -10).
        shiftY = 0;
      }

      return `
        border-color: ${wf?.borderColor || '#646464'} !important;
        background-color: ${wf?.bodyBackground || '#b4b4b4'} !important;
        /* XP.css paints Luna's blue frame with inset box-shadows and rounded
           top corners; skin art supplies its own edges. */
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.35) !important;
        border-radius: 0 !important;

        .title-bar {
          ${titleBg}
          height: ${tb.height || 28}px !important;
          min-height: ${tb.height || 28}px !important;
        }

        &.inactive .title-bar {
          ${titleBgInactive}
        }

        .title-bar-text {
          color: ${tb.textColor || '#dcdcdc'} !important;
          text-shadow: ${tb.textShadow || 'none'} !important;
          font-family: ${tb.fontFamily || 'Tahoma, sans-serif'} !important;
          font-size: ${tb.fontSize || '13px'} !important;
          font-weight: ${tb.fontWeight || 'normal'} !important;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
          ${textAlignCss}
          ${shiftY ? `position: relative; top: ${shiftY}px;` : ''}
        }

        &.inactive .title-bar-text {
          color: ${tb.inactiveTextColor || '#b4b4b4'} !important;
        }

        .title-bar-controls {
          display: flex;
          align-items: center;
          gap: 0;
        }

        ${(() => {
          // Skins bake button slots into the caption art and give each
          // button an XCoord (from the window's right edge to the button's
          // left edge) and YCoord. Overlay the controls on the full bar so
          // sprites land exactly on their slots.
          const wc = $shellTheme?.windowControls;
          if (wc?.type !== 'sprite') return '';
          const anyCoords = [wc.minimize, wc.maximize, wc.restore, wc.close]
            .some((s) => s?.x != null);
          if (!anyCoords) return '';
          const inset = tb.slotInset || 0;
          // Borders-path frames (slotInset present) bottom-anchor their
          // slots to the frame art; classic Personality skins use YCoord
          // from the caption top (verified against the raster slots).
          const topFor = (s) => (tb.slotInset != null
            ? Math.max(0, Math.round((tb.height || 28) - Math.max(1, inset - 2) - (s.stateHeight || 17)))
            : Math.round((s.y ?? 0) * capScale));
          const posFor = (s) => (s?.x != null ? `
            position: absolute;
            right: ${Math.max(0, Math.round((s.x - (s.stateWidth || 0) - inset) * capScale))}px;
            top: ${topFor(s)}px;
            margin: 0 !important;
            pointer-events: auto;
          ` : 'pointer-events: auto;');
          return `
          .title-bar {
            position: relative;
          }
          .title-bar-controls {
            position: absolute !important;
            inset: 0 !important;
            z-index: 1;
            pointer-events: none;
          }
          .title-bar-controls button[aria-label="Minimize"] { ${posFor(wc.minimize)} }
          .title-bar-controls button[aria-label="Maximize"] { ${posFor(wc.maximize)} }
          .title-bar-controls button[aria-label="Restore"] { ${posFor(wc.restore)} }
          .title-bar-controls button[aria-label="Close"] { ${posFor(wc.close)} }
          `;
        })()}

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
          border-image-source: url("${sideImg}");
          border-image-slice: 0 ${wf.sideWidth || 4} fill;
        ` : ''}
        ${wf?.sideImageInactive ? `
          &.inactive {
            border-image-source: url("${wf.sideImageInactive}");
          }
        ` : ''}
      `;
    }}
  }
`;

export default Windows;
