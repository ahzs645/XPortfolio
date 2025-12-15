import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { startWmpStandalone } from './wmp/startWmpStandalone';
import { useFileSystem, SYSTEM_IDS } from '../../../contexts/FileSystemContext';
import './wmp.css';

function WmpWrapper({ onUpdateHeader, dragRef, onMinimize, onMaximize, onClose }) {
  const { fileSystem, getFolderContents } = useFileSystem();
  const desktopRef = useRef(null);
  const [error, setError] = useState(null);

  // Get music files from My Music folder dynamically
  const myMusicPlaylist = useMemo(() => {
    if (!fileSystem || !getFolderContents) return null;

    const myMusicFolder = fileSystem[SYSTEM_IDS.MY_MUSIC];
    if (!myMusicFolder) return null;

    const contents = getFolderContents(SYSTEM_IDS.MY_MUSIC);
    // Filter for audio files only
    const audioFiles = contents.filter(item => {
      if (item.type !== 'file') return false;
      const ext = (item.ext || '').toLowerCase();
      return ['.mp3', '.wav', '.wma', '.ogg', '.m4a', '.flac', '.aac'].includes(ext);
    });

    if (audioFiles.length === 0) return null;

    return {
      name: "My Music",
      songDisplayNames: audioFiles.map(f => f.basename || f.name.replace(/\.[^/.]+$/, '')),
      songVFSPaths: audioFiles.map(f => f.url || `/content/sample-music/${f.name}`),
    };
  }, [fileSystem, getFolderContents]);

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
          // Pass XPortfolio window callbacks for frameless mode
          onXPMinimize: onMinimize,
          onXPMaximize: onMaximize,
          onXPClose: onClose,
          // Pass My Music folder contents for default playlist
          myMusicPlaylist: myMusicPlaylist,
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
  }, [handleFrameToggle, dragRef, myMusicPlaylist, onMinimize, onMaximize, onClose]);

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
