import React, { useEffect, useRef, useState } from 'react';
import { startWmpStandalone } from './wmp/startWmpStandalone';
import './wmp.css';

function WmpWrapper() {
  const desktopRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cleanup = null;
    let cancelled = false;

    (async () => {
      try {
        const nextCleanup = await startWmpStandalone({ desktopEl: desktopRef.current });
        if (cancelled) {
          if (typeof nextCleanup === 'function') nextCleanup();
          return;
        }
        cleanup = nextCleanup;
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      }
    })();

    return () => {
      cancelled = true;
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return (
    <div className="wmp-standalone-root" style={{ width: '100%', height: '100%' }}>
      {error ? <div className="wmp-standalone-error">{error}</div> : null}
      <div
        className="wmp-desktop"
        ref={desktopRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}

export default WmpWrapper;
