import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { isMobileDevice } from '../../utils/deviceDetection';

// Different drag thresholds for desktop vs mobile
const DRAG_THRESHOLD_DESKTOP = 4;
const DRAG_THRESHOLD_MOBILE = 10;
const DOUBLE_TAP_DELAY = 400; // ms for double-tap detection on touch

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
  onMoveToFolder,
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
  const [dropTargetId, setDropTargetId] = useState(null); // Folder being hovered during drag
  const [touchState, setTouchState] = useState(null); // { id, startX, startY, startTime }
  const [hasDragStarted, setHasDragStarted] = useState(false); // Track if drag has exceeded threshold
  const lastTapRef = useRef(null); // For double-tap detection
  const iconRefs = useRef([]);
  const containerRef = useRef(null);
  const isMobile = isMobileDevice();
  const dragThreshold = isMobile ? DRAG_THRESHOLD_MOBILE : DRAG_THRESHOLD_DESKTOP;

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
      const draggedIds = iconsToMove.map(i => i?.id).filter(Boolean);

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

      // Check if hovering over a folder (for drop target)
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      let foundTarget = null;

      for (const rect of iconsRect) {
        if (!rect) continue;
        // Skip if this icon is being dragged
        if (draggedIds.includes(rect.id)) continue;

        // Check if mouse is over this icon
        if (
          mouseX >= rect.x &&
          mouseX <= rect.x + rect.w &&
          mouseY >= rect.y &&
          mouseY <= rect.y + rect.h
        ) {
          // Check if it's a folder
          const icon = icons.find(i => i.id === rect.id);
          if (icon && icon.type === 'folder') {
            foundTarget = rect.id;
            break;
          }
        }
      }
      setDropTargetId(foundTarget);
    };

    const handleMouseUp = () => {
      // Check if we're dropping on a folder
      if (dropTargetId && onMoveToFolder) {
        const selectedIcons = icons.filter((icon) => icon.isFocus);
        const iconsToMove = selectedIcons.length > 0 ? selectedIcons : [icons.find((i) => i.id === dragging.id)];
        const idsToMove = iconsToMove.map(i => i?.id).filter(Boolean);

        // Move files to the folder
        onMoveToFolder(idsToMove, dropTargetId);
      } else {
        // Commit the drag positions (normal reposition)
        if (Object.keys(dragPositions).length > 0) {
          onUpdatePositions(dragPositions);
        }
      }

      setDragging(null);
      setDragPositions({});
      setDropTargetId(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragPositions, icons, iconsRect, onUpdatePositions, onMoveToFolder, dropTargetId]);

  const handleMouseDown = useCallback((e, icon) => {
    e.stopPropagation();

    // Check if this icon is already part of a multi-selection
    const selectedIcons = icons.filter((i) => i.isFocus);
    const isPartOfSelection = selectedIcons.some((i) => i.id === icon.id);

    // Only change selection if clicking on a non-selected icon
    if (!isPartOfSelection) {
      onMouseDown(icon.id);
    }

    // Start drag - use selected icons if clicking on one of them, otherwise just this icon
    const iconsToMove = isPartOfSelection && selectedIcons.length > 0
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
    // On mobile, double-click is handled by touch events to avoid duplicate firing
    if (isMobile) return;
    onDoubleClick(icon);
  }, [onDoubleClick, isMobile]);

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

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e, icon) => {
    if (e.touches.length !== 1) return; // Only handle single touch

    const touch = e.touches[0];
    const now = Date.now();

    // Check for double-tap
    if (lastTapRef.current &&
        lastTapRef.current.id === icon.id &&
        now - lastTapRef.current.time < DOUBLE_TAP_DELAY) {
      // Double-tap detected - prevent default to stop synthetic click
      e.preventDefault();
      e.stopPropagation();
      lastTapRef.current = null;
      // Use setTimeout to avoid firing during the same event cycle
      setTimeout(() => onDoubleClick(icon), 0);
      return;
    }

    // Record this tap for potential double-tap
    lastTapRef.current = { id: icon.id, time: now };

    // Select the icon
    const selectedIcons = icons.filter((i) => i.isFocus);
    const isPartOfSelection = selectedIcons.some((i) => i.id === icon.id);
    if (!isPartOfSelection) {
      onMouseDown(icon.id);
    }

    // Start tracking touch for potential drag
    setTouchState({
      id: icon.id,
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: now,
    });
    setHasDragStarted(false);
  }, [icons, onMouseDown, onDoubleClick]);

  const handleTouchMove = useCallback((e, icon) => {
    if (!touchState || touchState.id !== icon.id) return;
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchState.startX;
    const deltaY = touch.clientY - touchState.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check if drag threshold exceeded
    if (!hasDragStarted && distance > dragThreshold) {
      setHasDragStarted(true);
      // Clear the double-tap timer since we're dragging
      lastTapRef.current = null;

      // Start the actual drag
      const selectedIcons = icons.filter((i) => i.isFocus);
      const isPartOfSelection = selectedIcons.some((i) => i.id === icon.id);
      const iconsToMove = isPartOfSelection && selectedIcons.length > 0
        ? selectedIcons
        : [icon];

      const iconStartPositions = {};
      iconsToMove.forEach((i) => {
        iconStartPositions[i.id] = { x: i.x, y: i.y };
      });

      setDragging({
        id: icon.id,
        startX: touchState.startX,
        startY: touchState.startY,
        iconStartPositions,
      });
    }

    // If dragging, update positions
    if (hasDragStarted || distance > dragThreshold) {
      e.preventDefault(); // Prevent scrolling while dragging

      const selectedIcons = icons.filter((i) => i.isFocus);
      const iconsToMove = selectedIcons.length > 0 ? selectedIcons : [icons.find((i) => i.id === icon.id)];
      const draggedIds = iconsToMove.map(i => i?.id).filter(Boolean);

      const newPositions = {};
      iconsToMove.forEach((i) => {
        if (!i) return;
        const startPos = dragging?.iconStartPositions?.[i.id] || { x: i.x, y: i.y };
        newPositions[i.id] = {
          x: Math.max(0, startPos.x + deltaX),
          y: Math.max(0, startPos.y + deltaY),
        };
      });

      setDragPositions(newPositions);

      // Check for drop target
      let foundTarget = null;
      for (const rect of iconsRect) {
        if (!rect || draggedIds.includes(rect.id)) continue;
        if (
          touch.clientX >= rect.x &&
          touch.clientX <= rect.x + rect.w &&
          touch.clientY >= rect.y &&
          touch.clientY <= rect.y + rect.h
        ) {
          const targetIcon = icons.find(i => i.id === rect.id);
          if (targetIcon && targetIcon.type === 'folder') {
            foundTarget = rect.id;
            break;
          }
        }
      }
      setDropTargetId(foundTarget);
    }
  }, [touchState, hasDragStarted, dragThreshold, icons, dragging, iconsRect]);

  const handleTouchEnd = useCallback((e, icon) => {
    if (!touchState || touchState.id !== icon.id) return;

    // If we were dragging, finalize the drag
    if (hasDragStarted) {
      if (dropTargetId && onMoveToFolder) {
        const selectedIcons = icons.filter((i) => i.isFocus);
        const iconsToMove = selectedIcons.length > 0 ? selectedIcons : [icons.find((i) => i.id === icon.id)];
        const idsToMove = iconsToMove.map(i => i?.id).filter(Boolean);
        onMoveToFolder(idsToMove, dropTargetId);
      } else if (Object.keys(dragPositions).length > 0) {
        onUpdatePositions(dragPositions);
      }
    }

    // Clean up
    setTouchState(null);
    setHasDragStarted(false);
    setDragging(null);
    setDragPositions({});
    setDropTargetId(null);
  }, [touchState, hasDragStarted, dropTargetId, onMoveToFolder, icons, dragPositions, onUpdatePositions]);

  // Get position for an icon (use drag position if dragging, otherwise use icon position)
  const getIconPosition = (icon) => {
    if (dragPositions[icon.id]) {
      return dragPositions[icon.id];
    }
    return { x: icon.x, y: icon.y };
  };

  // Handle HTML5 drag start for cross-window support
  const handleDragStart = useCallback((e, icon) => {
    // Get all selected icons or just this one
    const selectedIcons = icons.filter((i) => i.isFocus);
    const itemsToDrag = selectedIcons.some(i => i.id === icon.id) && selectedIcons.length > 0
      ? selectedIcons.map(i => i.id)
      : [icon.id];

    // Set data for cross-window drops
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-xportfolio-items', JSON.stringify(itemsToDrag));
  }, [icons]);

  // Check if an icon is in the cut clipboard
  const isCutIcon = (iconId) => clipboardOp === 'cut' && clipboard?.includes(iconId);

  return (
    <Container ref={containerRef}>
      {icons.map((icon, index) => {
        const pos = getIconPosition(icon);
        const isRenaming = renamingIconId === icon.id;
        const isCut = isCutIcon(icon.id);
        const isDropTarget = dropTargetId === icon.id;

        return (
          <Icon
            key={icon.id}
            ref={(el) => (iconRefs.current[index] = el)}
            draggable={!isRenaming && !isMobile}
            onDragStart={(e) => handleDragStart(e, icon)}
            onMouseDown={(e) => !isRenaming && handleMouseDown(e, icon)}
            onDoubleClick={() => !isRenaming && handleDoubleClick(icon)}
            onContextMenu={(e) => handleContextMenu(e, icon)}
            onTouchStart={(e) => !isRenaming && handleTouchStart(e, icon)}
            onTouchMove={(e) => !isRenaming && handleTouchMove(e, icon)}
            onTouchEnd={(e) => !isRenaming && handleTouchEnd(e, icon)}
            onTouchCancel={(e) => handleTouchEnd(e, icon)}
            $isFocus={icon.isFocus && displayFocus}
            $isDragging={dragging && (dragging.id === icon.id || (icon.isFocus && dragging.iconStartPositions[icon.id]))}
            $isCut={isCut}
            $isDropTarget={isDropTarget}
            style={{
              left: pos.x,
              top: pos.y,
            }}
          >
            <IconImageWrapper>
              <IconImage src={icon.icon} alt={icon.title} draggable={false} $isCut={isCut} />
              {icon.type === 'shortcut' && (
                <ShortcutOverlay src="/icons/xp/Shortcutoverlay.png" alt="" draggable={false} />
              )}
            </IconImageWrapper>
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
  border: ${({ $isFocus, $isDropTarget }) =>
    $isDropTarget
      ? '2px solid #0b61ff'
      : $isFocus
      ? '1px dotted #aaa'
      : '1px solid transparent'};
  background: ${({ $isFocus, $isDropTarget }) =>
    $isDropTarget
      ? 'rgba(11, 97, 255, 0.4)'
      : $isFocus
      ? 'rgba(11, 97, 255, 0.3)'
      : 'transparent'};
  opacity: ${({ $isDragging, $isCut }) => ($isDragging ? 0.8 : $isCut ? 0.5 : 1)};
  z-index: ${({ $isDragging }) => ($isDragging ? 10 : 1)};
  border-radius: ${({ $isDropTarget }) => ($isDropTarget ? '4px' : '0')};
  transition: ${({ $isDropTarget }) => ($isDropTarget ? 'background 0.15s, border 0.15s' : 'none')};

  &:hover {
    background: rgba(11, 97, 255, 0.15);
  }
`;

const IconImageWrapper = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  margin-bottom: 5px;
`;

const IconImage = styled.img`
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
  opacity: ${({ $isCut }) => ($isCut ? 0.5 : 1)};
`;

const ShortcutOverlay = styled.img`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 11px;
  height: 11px;
  pointer-events: none;
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
