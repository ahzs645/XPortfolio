import React, { useState, useEffect, useRef, useCallback } from 'react';
import './flash-player.css';

function FlashPlayer({
  onClose,
  onMinimize,
  onMaximize,
  isFocus,
  fileData,
  fileName,
  onUpdateHeader,
  isMaximized,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [swfUrl, setSwfUrl] = useState(null);
  const [isRuffleReady, setIsRuffleReady] = useState(false);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  // Update window header with file name
  useEffect(() => {
    if (onUpdateHeader && fileName) {
      onUpdateHeader({
        icon: '/icons/flash/flash_player.png',
        title: `Adobe Flash Player - ${fileName}`,
        buttons: ['minimize', 'maximize', 'close'],
      });
    }
  }, [fileName, onUpdateHeader]);

  // Load Ruffle script
  useEffect(() => {
    const loadRuffle = async () => {
      // Check if Ruffle is already loaded
      if (window.RufflePlayer) {
        setIsRuffleReady(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="ruffle"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => setIsRuffleReady(true));
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = '/ruffle/ruffle.js';
        script.async = true;
        script.onload = () => {
          setIsRuffleReady(true);
        };
        script.onerror = () => {
          setError('Failed to load Flash Player emulator. Please ensure Ruffle is installed.');
          setIsLoading(false);
        };
        document.head.appendChild(script);
      } catch (e) {
        setError('Failed to initialize Flash Player: ' + e.message);
        setIsLoading(false);
      }
    };

    loadRuffle();
  }, []);

  // Handle file data passed to component
  useEffect(() => {
    if (fileData && fileName) {
      const blob = new Blob([fileData], { type: 'application/x-shockwave-flash' });
      const url = URL.createObjectURL(blob);
      setSwfUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [fileData, fileName]);

  // Initialize Ruffle player when ready
  useEffect(() => {
    if (!isRuffleReady || !swfUrl || !containerRef.current) return;

    const initPlayer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get Ruffle instance
        const ruffle = window.RufflePlayer.newest();
        const player = ruffle.createPlayer();

        // Configure player
        player.style.width = '100%';
        player.style.height = '100%';

        // Clear container and add player
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(player);
        playerRef.current = player;

        // Load the SWF
        await player.load(swfUrl);

        setIsLoading(false);
      } catch (e) {
        console.error('Flash player error:', e);
        setError('Failed to load Flash content: ' + e.message);
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        playerRef.current = null;
      }
    };
  }, [isRuffleReady, swfUrl]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.toLowerCase().endsWith('.swf')) {
        const url = URL.createObjectURL(file);
        setSwfUrl(url);
        if (onUpdateHeader) {
          onUpdateHeader({
            icon: '/icons/flash/flash_player.png',
            title: `Adobe Flash Player - ${file.name}`,
            buttons: ['minimize', 'maximize', 'close'],
          });
        }
      } else {
        setError('Please drop a valid .swf file');
      }
    }
  }, [onUpdateHeader]);

  return (
    <div className="flash-player-app">
      {/* Menu bar */}
      <div className="flash-menu-bar">
        <div className="flash-menu-item">
          File
          <div className="flash-submenu">
            <div className="flash-submenu-item" onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.swf';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setSwfUrl(url);
                  if (onUpdateHeader) {
                    onUpdateHeader({
                      icon: '/icons/flash/flash_player.png',
                      title: `Adobe Flash Player - ${file.name}`,
                      buttons: ['minimize', 'maximize', 'close'],
                    });
                  }
                }
              };
              input.click();
            }}>Open...</div>
            <div className="flash-submenu-divider"></div>
            <div className="flash-submenu-item" onClick={onClose}>Exit</div>
          </div>
        </div>
        <div className="flash-menu-item">
          View
          <div className="flash-submenu">
            <div className="flash-submenu-item" onClick={() => {
              if (containerRef.current) {
                containerRef.current.requestFullscreen?.();
              }
            }}>Full Screen</div>
          </div>
        </div>
        <div className="flash-menu-item">
          Help
          <div className="flash-submenu">
            <div className="flash-submenu-item">About Adobe Flash Player</div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div
        className="flash-content"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isLoading && !error && (
          <div className="flash-loading">
            <div className="flash-loading-spinner"></div>
            <span>Loading Flash content...</span>
          </div>
        )}

        {error && (
          <div className="flash-error">
            <img src="/icons/flash/flash_player.png" alt="Flash" className="flash-error-icon" />
            <div className="flash-error-text">{error}</div>
          </div>
        )}

        {!swfUrl && !isLoading && !error && (
          <div className="flash-empty">
            <img src="/icons/flash/flash_player.png" alt="Flash" className="flash-empty-icon" />
            <div className="flash-empty-title">Adobe Flash Player</div>
            <div className="flash-empty-subtitle">Powered by Ruffle</div>
            <div className="flash-empty-instructions">
              Drop a .swf file here or use File → Open to load Flash content
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="flash-player-container"
          style={{ display: swfUrl && !isLoading && !error ? 'block' : 'none' }}
        ></div>
      </div>

      {/* Status bar */}
      <div className="flash-status-bar">
        <span>{swfUrl ? (isLoading ? 'Loading...' : 'Ready') : 'No file loaded'}</span>
        <span className="flash-powered-by">Powered by Ruffle</span>
      </div>
    </div>
  );
}

export default FlashPlayer;
