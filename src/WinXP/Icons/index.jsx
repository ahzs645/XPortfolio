import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';

function Icons({
  icons,
  onMouseDown,
  onDoubleClick,
  displayFocus,
  mouse,
  selecting,
  setSelectedIcons,
}) {
  const [iconsRect, setIconsRect] = useState([]);
  const iconRefs = useRef([]);

  // Update icon rectangles for selection detection
  useEffect(() => {
    const rects = iconRefs.current.map((ref, i) => {
      if (!ref) return null;
      const rect = ref.getBoundingClientRect();
      return {
        id: icons[i].id,
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
      };
    }).filter(Boolean);
    setIconsRect(rects);
  }, [icons]);

  // Handle bounding box selection
  useEffect(() => {
    if (!selecting) return;
    const { x: sx, y: sy } = selecting;
    const { docX: x, docY: y } = mouse;
    const sw = Math.abs(x - sx);
    const sh = Math.abs(y - sy);
    const left = Math.min(x, sx);
    const top = Math.min(y, sy);

    const selectedIds = iconsRect.filter((rect) => {
      if (!rect) return false;
      // Check if icon intersects with selection box
      return !(
        rect.x + rect.w < left ||
        rect.x > left + sw ||
        rect.y + rect.h < top ||
        rect.y > top + sh
      );
    }).map((rect) => rect.id);

    setSelectedIcons(selectedIds);
  }, [selecting, mouse.docX, mouse.docY, iconsRect, setSelectedIcons]);

  const handleMouseDown = useCallback((e, id) => {
    e.stopPropagation();
    onMouseDown(id);
  }, [onMouseDown]);

  const handleDoubleClick = useCallback((component) => {
    onDoubleClick(component);
  }, [onDoubleClick]);

  return (
    <Container>
      {icons.map((icon, index) => (
        <Icon
          key={icon.id}
          ref={(el) => (iconRefs.current[index] = el)}
          onMouseDown={(e) => handleMouseDown(e, icon.id)}
          onDoubleClick={() => handleDoubleClick(icon.component)}
          $isFocus={icon.isFocus && displayFocus}
        >
          <IconImage src={icon.icon} alt={icon.title} draggable={false} />
          <IconText $isFocus={icon.isFocus && displayFocus}>
            {icon.title}
          </IconText>
        </Icon>
      ))}
    </Container>
  );
}

const Container = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 0;
`;

const Icon = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  padding: 5px;
  cursor: pointer;
  border: ${({ $isFocus }) => ($isFocus ? '1px dotted #aaa' : '1px solid transparent')};
  background: ${({ $isFocus }) => ($isFocus ? 'rgba(11, 97, 255, 0.3)' : 'transparent')};

  &:hover {
    background: rgba(11, 97, 255, 0.15);
  }
`;

const IconImage = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 5px;
  image-rendering: pixelated;
`;

const IconText = styled.span`
  font-size: 11px;
  color: white;
  text-align: center;
  word-break: break-word;
  text-shadow: 1px 1px 1px #000, -1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000;
  background: ${({ $isFocus }) => ($isFocus ? '#0b61ff' : 'transparent')};
  padding: 1px 2px;
  line-height: 1.2;
`;

export default Icons;
