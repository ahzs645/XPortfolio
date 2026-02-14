import React, { useState, useEffect, useRef, useCallback } from 'react';
import './flash-player.css';
import { withBaseUrl } from '../../../utils/baseUrl';

function FlashPlayer({
  fileData,
  fileName,
  onUpdateHeader,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [swfUrl, setSwfUrl] = useState(null);
  const [swfName, setSwfName] = useState(null);
  const [isRuffleReady, setIsRuffleReady] = useState(false);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  // Update window header with file name
  useEffect(() => {
    if (onUpdateHeader) {
      onUpdateHeader({
        icon: withBaseUrl('/icons/flash/flash_player.png'),
        title: swfName ? `Adobe Flash Player - ${swfName}` : 'Adobe Flash Player',
        buttons: ['minimize', 'maximize', 'close'],
      });
    }
  }, [swfName, onUpdateHeader]);

  // Load Ruffle script
  useEffect(() => {
    const loadRuffle = async () => {
      if (window.RufflePlayer) {
        setIsRuffleReady(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="ruffle"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => setIsRuffleReady(true));
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = withBaseUrl('/ruffle/ruffle.js');
        script.async = true;
        script.onload = () => {
          setIsRuffleReady(true);
        };
        script.onerror = () => {
          setError('Failed to load Flash Player emulator.');
        };
        document.head.appendChild(script);
      } catch (e) {
        setError('Failed to initialize Flash Player: ' + e.message);
      }
    };

    loadRuffle();
  }, []);

  // Handle file data passed to component
  /* eslint-disable react-hooks/set-state-in-effect -- blob URL creation from prop data */
  useEffect(() => {
    if (fileData && fileName) {
      const blob = new Blob([fileData], { type: 'application/x-shockwave-flash' });
      const url = URL.createObjectURL(blob);
      setSwfUrl(url);
      setSwfName(fileName);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [fileData, fileName]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Initialize Ruffle player when ready
  useEffect(() => {
    if (!isRuffleReady || !swfUrl || !containerRef.current) return;

    const initPlayer = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const ruffle = window.RufflePlayer.newest();
        const player = ruffle.createPlayer();

        player.style.width = '100%';
        player.style.height = '100%';

        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(player);
        playerRef.current = player;

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
        } catch {
          // Ignore cleanup errors
        }
        playerRef.current = null;
      }
    };
  }, [isRuffleReady, swfUrl]);

  // Open file dialog
  const handleOpenFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.swf';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setSwfUrl(url);
        setSwfName(file.name);
      }
    };
    input.click();
  }, []);

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
        setSwfName(file.name);
      } else {
        setError('Please drop a valid .swf file');
      }
    }
  }, []);

  const showPrompt = !swfUrl && !isLoading;

  return (
    <div
      className="flash-player-app"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Ruffle container - hidden until SWF loaded */}
      <div
        ref={containerRef}
        className="flash-ruffle-container"
        style={{ display: swfUrl && !isLoading ? 'block' : 'none' }}
      />

      {/* Open prompt - shown when no file loaded */}
      {showPrompt && (
        <div className="flash-open-prompt">
          <img
            src={withBaseUrl('/icons/flash/flash_player.png')}
            alt="Flash Player"
            className="flash-prompt-icon"
          />
          {error ? (
            <div className="flash-error-message">{error}</div>
          ) : (
            <button className="flash-open-btn" onClick={handleOpenFile}>
              Open SWF File...
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flash-open-prompt">
          <img
            src={withBaseUrl('/icons/flash/flash_player.png')}
            alt="Flash Player"
            className="flash-prompt-icon"
          />
          <div className="flash-loading-text">Loading...</div>
        </div>
      )}

      {/* Footer disclaimer */}
      <div className="flash-player-footer">
        Adobe® and Flash® Player are trademarks of Adobe Inc.<br />
        This site is not affiliated with or approved by Adobe.<br />
        For entertainment and educational purposes only. Powered by Ruffle.
      </div>
    </div>
  );
}

export default FlashPlayer;
