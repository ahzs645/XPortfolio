import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { startWmpStandalone } from './wmp/startWmpStandalone';
import { useFileSystem, SYSTEM_IDS } from '../../../contexts/FileSystemContext';
import { MenuBar } from '../../../components';
import './wmp.css';

function WmpWrapper({ onUpdateHeader, dragRef, onMinimize, onMaximize, onClose }) {
  const { fileSystem, getFolderContents } = useFileSystem();
  const desktopRef = useRef(null);
  const [error, setError] = useState(null);
  const [isFrameHidden, setIsFrameHidden] = useState(false);

  // Menu configuration matching the original WMP menu
  const wmpMenus = useMemo(() => [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'Open Media File(s)...', action: 'openMediaFiles' },
        { separator: true },
        { label: 'Clear Current Playlist', action: 'clearPlaylist' },
        { separator: true },
        { label: 'Exit', action: 'exit' }
      ]
    },
    {
      id: 'skin',
      label: 'Skin',
      items: [
        { label: 'Change WMP Appearance', action: 'changeSkin' }
      ]
    },
    { id: 'play', label: 'Play', disabled: true },
    { id: 'tools', label: 'Tools', disabled: true },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'About Windows Media Player', action: 'showHelp' }
      ]
    }
  ], []);

  // Handle menu actions by triggering the registered WMP handlers
  const handleMenuAction = useCallback((action) => {
    console.log('WMP MenuBar action:', action);
    console.log('window.wm exists:', !!window.wm);
    console.log('triggerMenuAction exists:', window.wm && typeof window.wm.triggerMenuAction === 'function');
    if (window.wm && typeof window.wm.triggerMenuAction === 'function') {
      const result = window.wm.triggerMenuAction(action);
      console.log('triggerMenuAction result:', result);
    } else {
      console.warn('Cannot trigger menu action - window.wm or triggerMenuAction not available');
    }
  }, []);

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
  const handleFrameToggle = useCallback((frameHidden) => {
    setIsFrameHidden(frameHidden);
    if (onUpdateHeader) {
      onUpdateHeader({
        icon: '/icons/xp/WindowsMediaPlayer.png',
        title: 'Windows Media Player',
        buttons: ['minimize', 'maximize', 'close'],
        // When WMP's internal frame is hidden (compact mode), hide XP frame too
        // When WMP's internal frame is shown (full mode), show XP frame
        invisible: frameHidden,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleFrameToggle]);

  return (
    <div className="wmp-standalone-root" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {error ? <div className="wmp-standalone-error">{error}</div> : null}
      {!isFrameHidden && (
        <div className="wmp-react-menubar">
          <MenuBar
            menus={wmpMenus}
            onAction={handleMenuAction}
            windowActions={{ onClose, onMinimize, onMaximize }}
          />
        </div>
      )}
      <div
        className="wmp-desktop"
        ref={desktopRef}
        data-frame-hidden={isFrameHidden ? 'true' : 'false'}
        style={{
          width: '100%',
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}

export default WmpWrapper;
