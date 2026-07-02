import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';
import useLoadingCursor from '../../hooks/useLoadingCursor';
import { createTourPlayer } from '../../../lib/xptour-player/index.js';
import '../../../lib/xptour-player/index.css';

// The tour renders at the SWF's native 640x480; we scale that to fit a fullscreen
// overlay (letterboxed on black) that covers the whole interface — taskbar and
// all — like the real XP Tour, not a window.
const STAGE_W = 640;
const STAGE_H = 480;

function GsapTourPlayer({ scene = 'A-tour.swf', autoplay = true, onExit, onButton, onNavigate, onFsCommand }) {
  const overlayRef = useRef(null);
  const stageRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [scale, setScale] = useState(1);

  useLoadingCursor(status === 'loading');

  // Keep the latest callbacks in refs so the boot effect (which re-creates the player)
  // doesn't depend on them — the host can change its response logic without a reboot.
  const onButtonRef = useRef(onButton);
  const onNavigateRef = useRef(onNavigate);
  const onFsCommandRef = useRef(onFsCommand);
  onButtonRef.current = onButton;
  onNavigateRef.current = onNavigate;
  onFsCommandRef.current = onFsCommand;

  // Boot the player into the stage; tear it down on unmount.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    let player = null;
    let cancelled = false;
    // Defer init one macrotask: React StrictMode mounts, immediately unmounts, then
    // remounts in dev. Deferring lets the throwaway first mount's cleanup cancel
    // before we create a duplicate player on the same node (which would overlap).
    const timer = setTimeout(() => {
      createTourPlayer(el, {
        assetsBaseUrl: withBaseUrl('/apps/xp-tour/gsap'),
        // The whole tour is one file; scenes are read on demand via HTTP Range.
        assetSource: 'archive',
        archiveUrl: withBaseUrl('/apps/xp-tour/gsap/xp-tour.pack'),
        scene,
        autoplay,
        // Surface tour interactions so the host decides the response. onButton fires for
        // every button (including ones the conversion left unbound); return true to take
        // it over. onNavigate reports scene/level changes as the tour progresses.
        onButton: (e) => onButtonRef.current?.(e),
        onNavigate: (n) => onNavigateRef.current?.(n),
        // The player surfaces AVM1 fscommand(...) here — the tour's quit button is
        // fscommand("quit"), recovered faithfully in the package (no per-button wiring).
        onFsCommand: (cmd, args) => onFsCommandRef.current?.(cmd, args),
      })
        .then((p) => {
          if (cancelled) {
            p.destroy();
            return;
          }
          player = p;
          setStatus('ready');
        })
        .catch((e) => {
          if (!cancelled) {
            setErrorMsg(String((e && e.message) || e));
            setStatus('error');
          }
        });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (player) player.destroy();
      el.replaceChildren();
    };
  }, [scene, autoplay]);

  // Esc exits the fullscreen tour (it runs as its own app, so it owns this key).
  useEffect(() => {
    if (!onExit) return undefined;
    const onKeyDown = (e) => { if (e.key === 'Escape') onExit(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);

  // Scale the 640x480 stage to fit the fullscreen overlay, preserving aspect ratio.
  useEffect(() => {
    const root = overlayRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => {
      const { width, height } = root.getBoundingClientRect();
      if (width && height) setScale(Math.min(width / STAGE_W, height / STAGE_H));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Render over the entire interface (above the desktop, windows, and taskbar).
  return createPortal(
    <Overlay ref={overlayRef} $isActive={status !== 'loading'}>
      <Stage ref={stageRef} $isVisible={status === 'ready'} style={{ transform: `scale(${scale})` }} />
      {status === 'error' && (
        <Message>
          Couldn’t load the tour.
          <Detail>{errorMsg}</Detail>
        </Message>
      )}
    </Overlay>,
    document.body,
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 2147483600;
  background: ${({ $isActive }) => ($isActive ? '#000' : 'transparent')};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: ${({ $isActive }) => ($isActive ? 'auto' : 'none')};
`;

const Stage = styled.div`
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex-shrink: 0;
  transform-origin: center center;
  visibility: ${({ $isVisible }) => ($isVisible ? 'visible' : 'hidden')};
  /* The SWF stage clips to 640x480; the player draws art that extends past those
     bounds (background fills, perspective lines), so clip it here like Flash does —
     otherwise the overflow is visible in the letterbox once scaled up. */
  overflow: hidden;
`;

const Message = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #f1f6ff;
  font: 14px Tahoma, sans-serif;
  text-align: center;
  pointer-events: none;
  background: linear-gradient(135deg, rgba(8, 36, 99, 0.85), rgba(0, 11, 45, 0.85));
`;

const Detail = styled.div`
  font-size: 11px;
  opacity: 0.8;
  max-width: 80%;
`;

export default GsapTourPlayer;
