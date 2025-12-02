import React from 'react';
import styled from 'styled-components';

function MediaPlayer({ onClose, isFocus }) {
  return (
    <Container>
      <PlayerFrame
        src="/apps/mediaPlayer/mediaPlayer.html"
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
