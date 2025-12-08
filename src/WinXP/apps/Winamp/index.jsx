import React, { useEffect, useRef } from 'react';
import Webamp from 'webamp';
import { initialTracks } from './config';

// Helper to convert base64 file data to blob URL
function base64ToBlobUrl(base64Data, mimeType = 'audio/mpeg') {
  try {
    // Extract base64 part if it's a data URL
    const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Failed to convert base64 to blob URL:', e);
    return null;
  }
}

// Get MIME type from file extension
function getMimeType(fileName) {
  const ext = fileName.toLowerCase().split('.').pop();
  const mimeTypes = {
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/mp4',
    flac: 'audio/flac',
    aac: 'audio/aac',
    webm: 'audio/webm',
  };
  return mimeTypes[ext] || 'audio/mpeg';
}

function Winamp({ onClose, onMinimize, fileData, fileName }) {
  const ref = useRef(null);
  const webampRef = useRef(null);
  const blobUrlRef = useRef(null);
  const initializingRef = useRef(false); // Guard against double initialization
  const onCloseRef = useRef(onClose);
  const onMinimizeRef = useRef(onMinimize);

  // Keep refs updated
  onCloseRef.current = onClose;
  onMinimizeRef.current = onMinimize;

  useEffect(() => {
    const target = ref.current;

    // Guard against double initialization (React StrictMode)
    if (!target || webampRef.current || initializingRef.current) {
      return;
    }

    // Mark as initializing immediately (synchronously)
    initializingRef.current = true;

    // Prepare tracks - either from file data or default tracks
    let tracksToPlay = initialTracks;

    if (fileData && fileName) {
      const mimeType = getMimeType(fileName);
      const blobUrl = base64ToBlobUrl(fileData, mimeType);
      if (blobUrl) {
        blobUrlRef.current = blobUrl;
        // Create a track from the file
        tracksToPlay = [{
          url: blobUrl,
          metaData: {
            title: fileName.replace(/\.[^/.]+$/, ''), // Remove extension for title
            artist: 'Unknown Artist',
          },
        }];
      }
    }

    // Track if component is still mounted
    let isMounted = true;

    // Dynamically import Butterchurn for visualizations
    const initWebamp = async () => {
      let butterchurn = null;
      let butterchurnPresets = null;

      try {
        // Try to load Butterchurn for Milkdrop visualizations
        const [butterchurnModule, presetsModule] = await Promise.all([
          import('butterchurn'),
          import('butterchurn-presets'),
        ]);
        butterchurn = butterchurnModule.default;
        butterchurnPresets = presetsModule.default;
      } catch (e) {
        console.warn('Butterchurn not available, visualizations disabled:', e);
      }

      // Check if component unmounted during async load
      if (!isMounted) {
        initializingRef.current = false;
        return;
      }

      const webampConfig = {
        initialTracks: tracksToPlay,
      };

      // Add Butterchurn if available
      if (butterchurn && butterchurnPresets) {
        webampConfig.__butterchurnOptions = {
          importButterchurn: () => Promise.resolve(butterchurn),
          getPresets: () => {
            // butterchurn-presets exports a plain object of presets
            return Object.keys(butterchurnPresets).map((name) => ({
              name,
              butterchurnPresetObject: butterchurnPresets[name],
            }));
          },
          butterchurnOpen: true,
        };
      }

      const webamp = new Webamp(webampConfig);

      webamp.onClose(() => {
        onCloseRef.current?.();
      });

      webamp.onMinimize(() => {
        onMinimizeRef.current?.();
      });

      webamp.renderWhenReady(target);
      webampRef.current = webamp;
    };

    initWebamp();

    return () => {
      isMounted = false;
      if (webampRef.current) {
        webampRef.current.dispose();
        webampRef.current = null;
      }
      // Cleanup blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      // Reset initializing flag on cleanup
      initializingRef.current = false;
    };
  }, [fileData, fileName]);

  return (
    <div
      style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, zIndex: 1 }}
      ref={ref}
    />
  );
}

export default Winamp;
