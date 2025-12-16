import React from 'react';
import styled from 'styled-components';

// variant: 'desktop' (gray dotted, no fill) or 'explorer' (blue dashed, blue fill)
function DashedBox({ startPos, mouse, variant = 'desktop' }) {
  if (!startPos) return null;

  const { x: startX, y: startY } = startPos;
  const { docX: endX, docY: endY } = mouse;

  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  return (
    <Box
      $variant={variant}
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
  border: ${({ $variant }) =>
    $variant === 'explorer' ? '1px dashed #0b61ff' : '1px dotted gray'};
  background: ${({ $variant }) =>
    $variant === 'explorer' ? 'rgba(11, 97, 255, 0.1)' : 'transparent'};
  pointer-events: none;
  z-index: 9999;
`;

export default DashedBox;
