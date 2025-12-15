import React, { useEffect, useRef, useState, useCallback } from 'react';
import { startWmpStandalone } from './wmp/startWmpStandalone';
import './wmp.css';

function WmpWrapper({ onUpdateHeader, dragRef }) {
  const desktopRef = useRef(null);
  const [error, setError] = useState(null);

  // Callback to toggle Windows XP frame visibility
  const handleFrameToggle = useCallback((isFrameHidden) => {
    if (onUpdateHeader) {
      onUpdateHeader({
        icon: '/icons/xp/WindowsMediaPlayer.png',
        title: 'Windows Media Player',
        buttons: ['minimize', 'maximize', 'close'],
        // When WMP's internal frame is hidden (compact mode), hide XP frame too
        // When WMP's internal frame is shown (full mode), show XP frame
        invisible: isFrameHidden,
      });
    }
  }, [onUpdateHeader]);

  useEffect(() => {
    let cleanup = null;
    let cancelled = false;

    (async () => {
      try {
        const nextCleanup = await startWmpStandalone({
          desktopEl: desktopRef.current,
          onFrameToggle: handleFrameToggle,
          dragRef: dragRef,
        });
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
  }, [handleFrameToggle]);

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
