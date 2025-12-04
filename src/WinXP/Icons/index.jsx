import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';

function Icons({
  icons,
  onMouseDown,
  onDoubleClick,
  onContextMenu,
  displayFocus,
  mouse,
  selecting,
  setSelectedIcons,
  onUpdatePositions,
  renamingIconId,
  renameValue,
  onRenameChange,
  onRenameSubmit,
  onRenameCancel,
  clipboardOp,
  clipboard,
}) {
  const renameInputRef = useRef(null);
  const [iconsRect, setIconsRect] = useState([]);
  const [dragging, setDragging] = useState(null); // { id, startX, startY, iconStartX, iconStartY }
  const [dragPositions, setDragPositions] = useState({}); // Temporary positions during drag
  const iconRefs = useRef([]);
  const containerRef = useRef(null);

  // Update icon rectangles for selection detection
  useEffect(() => {
    const rects = icons.map((icon, i) => {
      const ref = iconRefs.current[i];
      if (!ref) return null;
      const rect = ref.getBoundingClientRect();
      return {
        id: icon.id,
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
      };
    });
    setIconsRect(rects.filter(Boolean));
  }, [icons, dragPositions]);

  // Focus rename input when it appears
  useEffect(() => {
    if (renamingIconId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingIconId]);

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
      return !(
        rect.x + rect.w < left ||
        rect.x > left + sw ||
        rect.y + rect.h < top ||
        rect.y > top + sh
      );
    }).map((rect) => rect.id);

    setSelectedIcons(selectedIds);
  }, [selecting, mouse.docX, mouse.docY, iconsRect, setSelectedIcons]);

  // Handle dragging
  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - dragging.startX;
      const deltaY = e.clientY - dragging.startY;

      // Get all selected icons or just the dragged one
      const selectedIcons = icons.filter((icon) => icon.isFocus);
      const iconsToMove = selectedIcons.length > 0 ? selectedIcons : [icons.find((i) => i.id === dragging.id)];

      const newPositions = {};
      iconsToMove.forEach((icon) => {
        if (!icon) return;
        const startPos = dragging.iconStartPositions[icon.id] || { x: icon.x, y: icon.y };
        newPositions[icon.id] = {
          x: Math.max(0, startPos.x + deltaX),
          y: Math.max(0, startPos.y + deltaY),
        };
      });

      setDragPositions(newPositions);
    };

    const handleMouseUp = () => {
      // Commit the drag positions
      if (Object.keys(dragPositions).length > 0) {
        onUpdatePositions(dragPositions);
      }
      setDragging(null);
      setDragPositions({});
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragPositions, icons, onUpdatePositions]);

  const handleMouseDown = useCallback((e, icon) => {
    e.stopPropagation();
    onMouseDown(icon.id);

    // Start drag
    const selectedIcons = icons.filter((i) => i.isFocus);
    const iconsToMove = selectedIcons.length > 0 && selectedIcons.some((i) => i.id === icon.id)
      ? selectedIcons
      : [icon];

    const iconStartPositions = {};
    iconsToMove.forEach((i) => {
      iconStartPositions[i.id] = { x: i.x, y: i.y };
    });

    setDragging({
      id: icon.id,
      startX: e.clientX,
      startY: e.clientY,
      iconStartPositions,
    });
  }, [icons, onMouseDown]);

  const handleDoubleClick = useCallback((icon) => {
    onDoubleClick(icon);
  }, [onDoubleClick]);

  const handleContextMenu = useCallback((e, icon) => {
    e.preventDefault();
    e.stopPropagation();
    // Select the icon if not already selected
    if (!icon.isFocus) {
      onMouseDown(icon.id);
    }
    if (onContextMenu) {
      onContextMenu(e, icon);
    }
  }, [onContextMenu, onMouseDown]);

  // Get position for an icon (use drag position if dragging, otherwise use icon position)
  const getIconPosition = (icon) => {
    if (dragPositions[icon.id]) {
      return dragPositions[icon.id];
    }
    return { x: icon.x, y: icon.y };
  };

  // Check if an icon is in the cut clipboard
  const isCutIcon = (iconId) => clipboardOp === 'cut' && clipboard?.includes(iconId);

  return (
    <Container ref={containerRef}>
      {icons.map((icon, index) => {
        const pos = getIconPosition(icon);
        const isRenaming = renamingIconId === icon.id;
        const isCut = isCutIcon(icon.id);

        return (
          <Icon
            key={icon.id}
            ref={(el) => (iconRefs.current[index] = el)}
            onMouseDown={(e) => !isRenaming && handleMouseDown(e, icon)}
            onDoubleClick={() => !isRenaming && handleDoubleClick(icon)}
            onContextMenu={(e) => handleContextMenu(e, icon)}
            $isFocus={icon.isFocus && displayFocus}
            $isDragging={dragging && (dragging.id === icon.id || (icon.isFocus && dragging.iconStartPositions[icon.id]))}
            $isCut={isCut}
            style={{
              left: pos.x,
              top: pos.y,
            }}
          >
            <IconImage src={icon.icon} alt={icon.title} draggable={false} $isCut={isCut} />
            {isRenaming ? (
              <RenameForm onSubmit={onRenameSubmit}>
                <RenameInput
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => onRenameChange(e.target.value)}
                  onBlur={onRenameSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      onRenameCancel();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                />
              </RenameForm>
            ) : (
              <IconText $isFocus={icon.isFocus && displayFocus}>
                {icon.title}
              </IconText>
            )}
          </Icon>
        );
      })}
    </Container>
  );
}

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
`;

const Icon = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 70px;
  padding: 5px;
  cursor: pointer;
  pointer-events: auto;
  border: ${({ $isFocus }) => ($isFocus ? '1px dotted #aaa' : '1px solid transparent')};
  background: ${({ $isFocus }) => ($isFocus ? 'rgba(11, 97, 255, 0.3)' : 'transparent')};
  opacity: ${({ $isDragging, $isCut }) => ($isDragging ? 0.8 : $isCut ? 0.5 : 1)};
  z-index: ${({ $isDragging }) => ($isDragging ? 10 : 1)};

  &:hover {
    background: rgba(11, 97, 255, 0.15);
  }
`;

const IconImage = styled.img`
  width: 32px;
  height: 32px;
  margin-bottom: 5px;
  image-rendering: pixelated;
  opacity: ${({ $isCut }) => ($isCut ? 0.5 : 1)};
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

const RenameForm = styled.form`
  width: 100%;
`;

const RenameInput = styled.input`
  width: 100%;
  font-size: 11px;
  text-align: center;
  border: 1px solid #000;
  padding: 1px 2px;
  background: white;
  outline: none;

  &:focus {
    border-color: #0b61ff;
  }
`;

export default Icons;
