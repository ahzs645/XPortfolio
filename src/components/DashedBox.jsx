import React from 'react';
import styled from 'styled-components';

function DashedBox({ startPos, mouse }) {
  if (!startPos) return null;

  const { x: startX, y: startY } = startPos;
  const { docX: endX, docY: endY } = mouse;

  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  return (
    <Box
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
}

const Box = styled.div`
  position: absolute;
  border: 1px dashed #0b61ff;
  background: rgba(11, 97, 255, 0.1);
  pointer-events: none;
  z-index: 9999;
`;

export default DashedBox;
