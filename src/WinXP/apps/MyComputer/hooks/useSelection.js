import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook for managing item selection and drag-to-select functionality
 */
export function useSelection({ contents, contentRef, itemRefs }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selecting, setSelecting] = useState(null); // { startX, startY } for drag selection
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); // Current mouse position during selection
  const justFinishedSelectingRef = useRef(false); // Prevent click from clearing selection after drag

  const handleItemClick = useCallback((e, item) => {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) {
      setSelectedItems(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else {
      setSelectedItems([item.id]);
    }
  }, []);

  const handleContainerClick = useCallback(() => {
    // Don't clear selection if we just finished a drag selection
    if (justFinishedSelectingRef.current) {
      justFinishedSelectingRef.current = false;
      return;
    }
    setSelectedItems([]);
  }, []);

  // Drag selection handlers
  const handleContentMouseDown = useCallback((e) => {
    // Only start selection if clicking on the content background (not on items)
    if (e.target !== e.currentTarget) return;
    // Don't start selection on right-click
    if (e.button !== 0) return;

    const contentRect = contentRef.current?.getBoundingClientRect();
    if (!contentRect) return;

    const startX = e.clientX - contentRect.left + (contentRef.current?.scrollLeft || 0);
    const startY = e.clientY - contentRect.top + (contentRef.current?.scrollTop || 0);

    setSelecting({ startX, startY });
    setMousePos({ x: startX, y: startY });
    setSelectedItems([]);
  }, [contentRef]);

  // Handle mouse move and mouse up for selection
  useEffect(() => {
    if (!selecting) return;

    const handleMouseMove = (e) => {
      const contentRect = contentRef.current?.getBoundingClientRect();
      if (!contentRect) return;

      const x = e.clientX - contentRect.left + (contentRef.current?.scrollLeft || 0);
      const y = e.clientY - contentRect.top + (contentRef.current?.scrollTop || 0);
      setMousePos({ x, y });

      // Calculate selection rectangle
      const left = Math.min(selecting.startX, x);
      const top = Math.min(selecting.startY, y);
      const width = Math.abs(x - selecting.startX);
      const height = Math.abs(y - selecting.startY);

      // Check which items intersect with the selection rectangle
      const selectedIds = [];
      for (const item of contents) {
        const itemEl = itemRefs.current[item.id];
        if (!itemEl) continue;

        const itemRect = itemEl.getBoundingClientRect();
        const cRect = contentRef.current?.getBoundingClientRect();
        if (!cRect) continue;

        // Get item position relative to content (accounting for scroll)
        const itemLeft = itemRect.left - cRect.left + (contentRef.current?.scrollLeft || 0);
        const itemTop = itemRect.top - cRect.top + (contentRef.current?.scrollTop || 0);
        const itemRight = itemLeft + itemRect.width;
        const itemBottom = itemTop + itemRect.height;

        // Check intersection
        const intersects = !(
          itemRight < left ||
          itemLeft > left + width ||
          itemBottom < top ||
          itemTop > top + height
        );

        if (intersects) {
          selectedIds.push(item.id);
        }
      }

      setSelectedItems(selectedIds);
    };

    const handleMouseUp = () => {
      // Mark that we just finished selecting to prevent click from clearing selection
      justFinishedSelectingRef.current = true;
      setSelecting(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selecting, contents, contentRef, itemRefs]);

  // Calculate selection box dimensions
  const selectionBox = selecting ? {
    left: Math.min(selecting.startX, mousePos.x),
    top: Math.min(selecting.startY, mousePos.y),
    width: Math.abs(mousePos.x - selecting.startX),
    height: Math.abs(mousePos.y - selecting.startY),
  } : null;

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(contents.map(item => item.id));
  }, [contents]);

  return {
    selectedItems,
    setSelectedItems,
    selectionBox,
    handleItemClick,
    handleContainerClick,
    handleContentMouseDown,
    clearSelection,
    selectAll,
  };
}
