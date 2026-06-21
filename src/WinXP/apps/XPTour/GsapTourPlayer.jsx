import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';
import { createTourPlayer } from '../../../lib/xptour-player/index.js';
import '../../../lib/xptour-player/index.css';

// The tour renders at the SWF's native 640x480; we scale that to fit a fullscreen
// overlay (letterboxed on black) that covers the whole interface — taskbar and
// all — like the real XP Tour, not a window.
const STAGE_W = 640;
const STAGE_H = 480;

function GsapTourPlayer({ scene = 'A-tour.swf', autoplay = true, onExit }) {
  const overlayRef = useRef(null);
  const stageRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [scale, setScale] = useState(1);

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
    <Overlay ref={overlayRef}>
      <Stage ref={stageRef} style={{ transform: `scale(${scale})` }} />
      <ExitButton type="button" onClick={onExit} aria-label="Exit tour" title="Exit tour (Esc)">
        ✕
      </ExitButton>
      {status === 'loading' && <Message>Loading the Windows XP Tour…</Message>}
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
  background: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Stage = styled.div`
  position: relative;
  width: ${STAGE_W}px;
  height: ${STAGE_H}px;
  flex-shrink: 0;
  transform-origin: center center;
`;

const ExitButton = styled.button`
  position: absolute;
  top: 14px;
  right: 18px;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  opacity: 0.55;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
    background: rgba(200, 30, 30, 0.85);
  }
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
