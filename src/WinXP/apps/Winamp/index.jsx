import React, { useEffect, useRef, useCallback } from 'react';
import Webamp from 'webamp';
import { initialTracks } from './config';

function Winamp({ onClose, onMinimize }) {
  const ref = useRef(null);
  const webampRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const onMinimizeRef = useRef(onMinimize);

  // Keep refs updated
  onCloseRef.current = onClose;
  onMinimizeRef.current = onMinimize;

  useEffect(() => {
    const target = ref.current;
    if (!target || webampRef.current) {
      return;
    }

    const webamp = new Webamp({
      initialTracks,
    });

    webamp.onClose(() => {
      onCloseRef.current?.();
    });

    webamp.onMinimize(() => {
      onMinimizeRef.current?.();
    });

    webamp.renderWhenReady(target);
    webampRef.current = webamp;

    return () => {
      if (webampRef.current) {
        webampRef.current.dispose();
        webampRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 1 }}
      ref={ref}
    />
  );
}

export default Winamp;
