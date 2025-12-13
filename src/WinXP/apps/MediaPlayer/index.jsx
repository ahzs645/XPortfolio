import React, { useMemo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { withBaseUrl } from '../../../utils/baseUrl';

function MediaPlayer({ fileData, fileName }) {
  const blobUrlRef = useRef(null);

  // Convert base64 fileData to blob URL
  const playerUrl = useMemo(() => {
    const baseUrl = withBaseUrl('/apps/mediaPlayer/mediaPlayer.html');

    if (fileData) {
      try {
        // Extract base64 data and mime type
        const matches = fileData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: mimeType });
          blobUrlRef.current = URL.createObjectURL(blob);
          return `${baseUrl}?media=${encodeURIComponent(blobUrlRef.current)}&name=${encodeURIComponent(fileName || 'Media')}`;
        }
      } catch (e) {
        console.error('Failed to create blob URL:', e);
      }
    }
    return baseUrl;
  }, [fileData, fileName]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  return (
    <Container>
      <PlayerFrame
        src={playerUrl}
        title="Windows Media Player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
  overflow: hidden;
`;

const PlayerFrame = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
`;

export default MediaPlayer;
