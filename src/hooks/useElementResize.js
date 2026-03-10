import { useEffect, useState } from 'react';
import { isMobileDevice } from '../utils/deviceDetection';

// Throttle function to limit how often a callback fires during drag/resize
function throttle(fn, ms) {
  let lastTime = 0;
  let rafId = null;
  function throttled(...args) {
    const now = performance.now();
    if (now - lastTime >= ms) {
      lastTime = now;
      fn(...args);
    } else if (!rafId) {
      rafId = requestAnimationFrame(() => {
        rafId = null;
        lastTime = performance.now();
        fn(...args);
      });
    }
  }
  throttled.cancel = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  return throttled;
}

// Disable pointer events on all iframes during drag/resize to prevent them from capturing mouse events
function disableIframePointerEvents() {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    iframe.dataset.prevPointerEvents = iframe.style.pointerEvents;
    iframe.style.pointerEvents = 'none';
  });
}

function restoreIframePointerEvents() {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    iframe.style.pointerEvents = iframe.dataset.prevPointerEvents || '';
    delete iframe.dataset.prevPointerEvents;
  });
}

// Calculate mobile-friendly initial position and size
function getMobileConstrainedValues(defaultOffset, defaultSize) {
  if (!isMobileDevice()) {
    return { offset: defaultOffset, size: defaultSize };
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const taskbarHeight = 30;
  const padding = 5;

  // Constrain size to fit screen
  const maxWidth = screenWidth - padding * 2;
  const maxHeight = screenHeight - taskbarHeight - padding * 2;

  const width = Math.min(defaultSize.width, maxWidth);
  const height = Math.min(defaultSize.height, maxHeight);

  // Center the window or constrain position
  const x = Math.max(padding, Math.min(defaultOffset.x, screenWidth - width - padding));
  const y = Math.max(padding, Math.min(defaultOffset.y, screenHeight - height - taskbarHeight - padding));

  return {
    offset: { x, y },
    size: { width, height },
  };
}

function useElementResize(ref, options) {
  const {
    defaultOffset,
    defaultSize,
    minSize,
    boundary,
    resizable = true,
    resizeThreshold = 10,
    constraintSize = 200,
  } = options;
  const minWidth = minSize?.width || constraintSize;
  const minHeight = minSize?.height || constraintSize;

  // Get mobile-constrained initial values
  const initialValues = getMobileConstrainedValues(defaultOffset, defaultSize);
  const [offset, setOffset] = useState(initialValues.offset);
  const [size, setSize] = useState(initialValues.size);
  const cursorPos = useCursor(ref, resizeThreshold, resizable);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    // Read dragRef.current dynamically so it works with async-loaded components
    const getDragTarget = () => options.dragRef && options.dragRef.current;
    const cover = document.createElement('div');
    cover.style.position = 'fixed';
    cover.style.top = 0;
    cover.style.left = 0;
    cover.style.right = 0;
    cover.style.bottom = 0;
    const previousOffset = { ...offset };
    const previousSize = { ...size };
    let _boundary;
    let originMouseX;
    let originMouseY;
    let shouldCover = false;

    // Throttled move handlers (50ms cap to reduce excessive repaints)
    const THROTTLE_MS = 50;
    const throttledHandlers = [];

    function _onDragging(e) {
      if (shouldCover && !document.body.contains(cover)) {
        document.body.appendChild(cover);
      }
      const { pageX, pageY } = getComputedPagePosition(e, _boundary);
      const x = pageX - originMouseX + previousOffset.x;
      const y = pageY - originMouseY + previousOffset.y;
      setOffset({ x, y });
    }
    const onDragging = throttle(_onDragging, THROTTLE_MS);
    throttledHandlers.push(onDragging);

    function onDragEnd(e) {
      onDragging.cancel();
      cover.remove();
      shouldCover = false;
      restoreIframePointerEvents();
      const { pageX, pageY } = getComputedPagePosition(e, _boundary);
      previousOffset.x += pageX - originMouseX;
      previousOffset.y += pageY - originMouseY;
      window.removeEventListener('mousemove', onDragging);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragging);
      window.removeEventListener('touchend', onDragEnd);
      window.removeEventListener('touchcancel', onDragEnd);
    }

    function onDragStart() {
      disableIframePointerEvents();
      window.addEventListener('mousemove', onDragging);
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchmove', onDragging, { passive: false });
      window.addEventListener('touchend', onDragEnd);
      window.addEventListener('touchcancel', onDragEnd);
    }

    function _onDraggingTop(e) {
      const { pageY } = getComputedPagePosition(e, _boundary);
      const { x } = previousOffset;
      const y = pageY - originMouseY + previousOffset.y;
      setOffset({ x, y });
    }
    const onDraggingTop = throttle(_onDraggingTop, THROTTLE_MS);
    throttledHandlers.push(onDraggingTop);

    function onDragEndTop(e) {
      onDraggingTop.cancel();
      restoreIframePointerEvents();
      const { pageY } = getComputedPagePosition(e, _boundary);
      previousOffset.y += pageY - originMouseY;
      window.removeEventListener('mousemove', onDraggingTop);
      window.removeEventListener('mouseup', onDragEndTop);
      window.removeEventListener('touchmove', onDraggingTop);
      window.removeEventListener('touchend', onDragEndTop);
      window.removeEventListener('touchcancel', onDragEndTop);
    }

    function onDragStartTop() {
      disableIframePointerEvents();
      window.addEventListener('mousemove', onDraggingTop);
      window.addEventListener('mouseup', onDragEndTop);
      window.addEventListener('touchmove', onDraggingTop, { passive: false });
      window.addEventListener('touchend', onDragEndTop);
      window.addEventListener('touchcancel', onDragEndTop);
    }

    function _onDraggingLeft(e) {
      const { pageX } = getComputedPagePosition(e, _boundary);
      const x = pageX - originMouseX + previousOffset.x;
      const { y } = previousOffset;
      setOffset({ x, y });
    }
    const onDraggingLeft = throttle(_onDraggingLeft, THROTTLE_MS);
    throttledHandlers.push(onDraggingLeft);

    function onDragEndLeft(e) {
      onDraggingLeft.cancel();
      restoreIframePointerEvents();
      const { pageX } = getComputedPagePosition(e, _boundary);
      previousOffset.x += pageX - originMouseX;
      window.removeEventListener('mousemove', onDraggingLeft);
      window.removeEventListener('mouseup', onDragEndLeft);
      window.removeEventListener('touchmove', onDraggingLeft);
      window.removeEventListener('touchend', onDragEndLeft);
      window.removeEventListener('touchcancel', onDragEndLeft);
    }

    function onDragStartLeft() {
      disableIframePointerEvents();
      window.addEventListener('mousemove', onDraggingLeft);
      window.addEventListener('mouseup', onDragEndLeft);
      window.addEventListener('touchmove', onDraggingLeft, { passive: false });
      window.addEventListener('touchend', onDragEndLeft);
      window.addEventListener('touchcancel', onDragEndLeft);
    }

    function _onResizingRight(e) {
      const { pageX } = getComputedPagePosition(e, _boundary);
      const width = pageX - originMouseX + previousSize.width;
      const { height } = previousSize;
      setSize({ width, height });
    }
    const onResizingRight = throttle(_onResizingRight, THROTTLE_MS);
    throttledHandlers.push(onResizingRight);

    function onResizeEndRight(e) {
      onResizingRight.cancel();
      restoreIframePointerEvents();
      const { pageX } = getComputedPagePosition(e, _boundary);
      previousSize.width += pageX - originMouseX;
      window.removeEventListener('mousemove', onResizingRight);
      window.removeEventListener('mouseup', onResizeEndRight);
      window.removeEventListener('touchmove', onResizingRight);
      window.removeEventListener('touchend', onResizeEndRight);
      window.removeEventListener('touchcancel', onResizeEndRight);
    }

    function onResizeStartRight() {
      disableIframePointerEvents();
      window.addEventListener('mousemove', onResizingRight);
      window.addEventListener('mouseup', onResizeEndRight);
      window.addEventListener('touchmove', onResizingRight, { passive: false });
      window.addEventListener('touchend', onResizeEndRight);
      window.addEventListener('touchcancel', onResizeEndRight);
    }

    function _onResizingBottom(e) {
      const { pageY } = getComputedPagePosition(e, _boundary);
      const { width } = previousSize;
      const height = pageY - originMouseY + previousSize.height;
      setSize({ width, height });
    }
    const onResizingBottom = throttle(_onResizingBottom, THROTTLE_MS);
    throttledHandlers.push(onResizingBottom);

    function onResizeEndBottom(e) {
      onResizingBottom.cancel();
      restoreIframePointerEvents();
      const { pageY } = getComputedPagePosition(e, _boundary);
      previousSize.height += pageY - originMouseY;
      window.removeEventListener('mousemove', onResizingBottom);
      window.removeEventListener('mouseup', onResizeEndBottom);
      window.removeEventListener('touchmove', onResizingBottom);
      window.removeEventListener('touchend', onResizeEndBottom);
      window.removeEventListener('touchcancel', onResizeEndBottom);
    }

    function onResizeStartBottom() {
      disableIframePointerEvents();
      window.addEventListener('mousemove', onResizingBottom);
      window.addEventListener('mouseup', onResizeEndBottom);
      window.addEventListener('touchmove', onResizingBottom, { passive: false });
      window.addEventListener('touchend', onResizeEndBottom);
      window.addEventListener('touchcancel', onResizeEndBottom);
    }

    function _onResizingLeft(e) {
      const { pageX } = getComputedPagePosition(e, _boundary);
      const width = -pageX + originMouseX + previousSize.width;
      const { height } = previousSize;
      setSize({ width, height });
    }
    const onResizingLeft = throttle(_onResizingLeft, THROTTLE_MS);
    throttledHandlers.push(onResizingLeft);

    function onResizeEndLeft(e) {
      onResizingLeft.cancel();
      restoreIframePointerEvents();
      const { pageX } = getComputedPagePosition(e, _boundary);
      previousSize.width += -pageX + originMouseX;
      window.removeEventListener('mousemove', onResizingLeft);
      window.removeEventListener('mouseup', onResizeEndLeft);
      window.removeEventListener('touchmove', onResizingLeft);
      window.removeEventListener('touchend', onResizeEndLeft);
      window.removeEventListener('touchcancel', onResizeEndLeft);
    }

    function onResizeStartLeft() {
      disableIframePointerEvents();
      window.addEventListener('mousemove', onResizingLeft);
      window.addEventListener('mouseup', onResizeEndLeft);
      window.addEventListener('touchmove', onResizingLeft, { passive: false });
      window.addEventListener('touchend', onResizeEndLeft);
      window.addEventListener('touchcancel', onResizeEndLeft);
    }

    function _onResizingTop(e) {
      const { pageY } = getComputedPagePosition(e, _boundary);
      const height = -pageY + originMouseY + previousSize.height;
      const { width } = previousSize;
      setSize({ width, height });
    }
    const onResizingTop = throttle(_onResizingTop, THROTTLE_MS);
    throttledHandlers.push(onResizingTop);

    function onResizeEndTop(e) {
      onResizingTop.cancel();
      restoreIframePointerEvents();
      const { pageY } = getComputedPagePosition(e, _boundary);
      previousSize.height += -pageY + originMouseY;
      window.removeEventListener('mousemove', onResizingTop);
      window.removeEventListener('mouseup', onResizeEndTop);
      window.removeEventListener('touchmove', onResizingTop);
      window.removeEventListener('touchend', onResizeEndTop);
      window.removeEventListener('touchcancel', onResizeEndTop);
    }

    function onResizeStartTop() {
      disableIframePointerEvents();
      window.addEventListener('mousemove', onResizingTop);
      window.addEventListener('mouseup', onResizeEndTop);
      window.addEventListener('touchmove', onResizingTop, { passive: false });
      window.addEventListener('touchend', onResizeEndTop);
      window.addEventListener('touchcancel', onResizeEndTop);
    }

    function _onResizingTopLeft(e) {
      const { pageX, pageY } = getComputedPagePosition(e, _boundary);
      const width = -pageX + originMouseX + previousSize.width;
      const height = -pageY + originMouseY + previousSize.height;
      setSize({ width, height });
    }
    const onResizingTopLeft = throttle(_onResizingTopLeft, THROTTLE_MS);
    throttledHandlers.push(onResizingTopLeft);

    function onResizeEndTopLeft(e) {
      onResizingTopLeft.cancel();
      restoreIframePointerEvents();
      const { pageX, pageY } = getComputedPagePosition(e, _boundary);
      previousSize.width += -pageX + originMouseX;
      previousSize.height += -pageY + originMouseY;
      window.removeEventListener('mousemove', onResizingTopLeft);
      window.removeEventListener('mouseup', onResizeEndTopLeft);
      window.removeEventListener('touchmove', onResizingTopLeft);
      window.removeEventListener('touchend', onResizeEndTopLeft);
      window.removeEventListener('touchcancel', onResizeEndTopLeft);
    }

    function onResizeStartTopLeft() {
      disableIframePointerEvents();
      window.addEventListener('mousemove', onResizingTopLeft);
      window.addEventListener('mouseup', onResizeEndTopLeft);
      window.addEventListener('touchmove', onResizingTopLeft, { passive: false });
      window.addEventListener('touchend', onResizeEndTopLeft);
      window.addEventListener('touchcancel', onResizeEndTopLeft);
    }

    function _onResizingTopRight(e) {
      const { pageX, pageY } = getComputedPagePosition(e, _boundary);
      const width = pageX - originMouseX + previousSize.width;
      const height = -pageY + originMouseY + previousSize.height;
      setSize({ width, height });
    }
    const onResizingTopRight = throttle(_onResizingTopRight, THROTTLE_MS);
    throttledHandlers.push(onResizingTopRight);

    function onResizeEndTopRight(e) {
      onResizingTopRight.cancel();
      restoreIframePointerEvents();
      const { pageX, pageY } = getComputedPagePosition(e, _boundary);
      previousSize.width += pageX - originMouseX;
      previousSize.height += -pageY + originMouseY;
      window.removeEventListener('mousemove', onResizingTopRight);
      window.removeEventListener('mouseup', onResizeEndTopRight);
      window.removeEventListener('touchmove', onResizingTopRight);
      window.removeEventListener('touchend', onResizeEndTopRight);
      window.removeEventListener('touchcancel', onResizeEndTopRight);
    }

    function onResizeStartTopRight() {
      disableIframePointerEvents();
      window.addEventListener('mousemove', onResizingTopRight);
      window.addEventListener('mouseup', onResizeEndTopRight);
      window.addEventListener('touchmove', onResizingTopRight, { passive: false });
      window.addEventListener('touchend', onResizeEndTopRight);
      window.addEventListener('touchcancel', onResizeEndTopRight);
    }

    function _onResizingBottomLeft(e) {
      const { pageX, pageY } = getComputedPagePosition(e, _boundary);
      const width = -pageX + originMouseX + previousSize.width;
      const height = pageY - originMouseY + previousSize.height;
      setSize({ width, height });
    }
    const onResizingBottomLeft = throttle(_onResizingBottomLeft, THROTTLE_MS);
    throttledHandlers.push(onResizingBottomLeft);

    function onResizeEndBottomLeft(e) {
      onResizingBottomLeft.cancel();
      restoreIframePointerEvents();
      const { pageX, pageY } = getComputedPagePosition(e, _boundary);
      previousSize.width += -pageX + originMouseX;
      previousSize.height += pageY - originMouseY;
      window.removeEventListener('mousemove', onResizingBottomLeft);
      window.removeEventListener('mouseup', onResizeEndBottomLeft);
      window.removeEventListener('touchmove', onResizingBottomLeft);
      window.removeEventListener('touchend', onResizeEndBottomLeft);
      window.removeEventListener('touchcancel', onResizeEndBottomLeft);
    }

    function onResizeStartBottomLeft() {
      disableIframePointerEvents();
      window.addEventListener('mousemove', onResizingBottomLeft);
      window.addEventListener('mouseup', onResizeEndBottomLeft);
      window.addEventListener('touchmove', onResizingBottomLeft, { passive: false });
      window.addEventListener('touchend', onResizeEndBottomLeft);
      window.addEventListener('touchcancel', onResizeEndBottomLeft);
    }

    function _onResizingBottomRight(e) {
      const { pageX, pageY } = getComputedPagePosition(e, _boundary);
      const width = pageX - originMouseX + previousSize.width;
      const height = pageY - originMouseY + previousSize.height;
      setSize({ width, height });
    }
    const onResizingBottomRight = throttle(_onResizingBottomRight, THROTTLE_MS);
    throttledHandlers.push(onResizingBottomRight);

    function onResizeEndBottomRight(e) {
      onResizingBottomRight.cancel();
      restoreIframePointerEvents();
      const { pageX, pageY } = getComputedPagePosition(e, _boundary);
      previousSize.width += pageX - originMouseX;
      previousSize.height += pageY - originMouseY;
      window.removeEventListener('mousemove', onResizingBottomRight);
      window.removeEventListener('mouseup', onResizeEndBottomRight);
      window.removeEventListener('touchmove', onResizingBottomRight);
      window.removeEventListener('touchend', onResizeEndBottomRight);
      window.removeEventListener('touchcancel', onResizeEndBottomRight);
    }

    function onResizeStartBottomRight() {
      disableIframePointerEvents();
      window.addEventListener('mousemove', onResizingBottomRight);
      window.addEventListener('mouseup', onResizeEndBottomRight);
      window.addEventListener('touchmove', onResizingBottomRight, { passive: false });
      window.addEventListener('touchend', onResizeEndBottomRight);
      window.addEventListener('touchcancel', onResizeEndBottomRight);
    }

    function onMouseDown(e) {
      const { pageX, pageY } = getComputedPagePosition(e, null);
      originMouseX = pageX;
      originMouseY = pageY;
      _boundary = { ...boundary };
      const dragTarget = getDragTarget();
      if (dragTarget && (e.target === dragTarget || dragTarget.contains(e.target))) {
        // Don't start dragging if clicking on title bar controls (min/max/close buttons)
        if (e.target.closest('.title-bar-controls')) {
          return;
        }
        shouldCover = true;
        return onDragStart(e);
      }
      if (e.target !== target || !resizable) return;
      switch (cursorPos) {
        case 'topLeft':
          _boundary.right = originMouseX + previousSize.width - minWidth;
          _boundary.bottom = originMouseY + previousSize.height - minHeight;
          onResizeStartTopLeft(e);
          onDragStart(e);
          break;
        case 'left':
          _boundary.right = originMouseX + previousSize.width - minWidth;
          onResizeStartLeft(e);
          onDragStartLeft(e);
          break;
        case 'bottomLeft':
          _boundary.right = originMouseX + previousSize.width - minWidth;
          _boundary.top = originMouseY - previousSize.height + minHeight;
          onResizeStartBottomLeft(e);
          onDragStartLeft(e);
          break;
        case 'top':
          _boundary.bottom = originMouseY + previousSize.height - minHeight;
          onResizeStartTop(e);
          onDragStartTop(e);
          break;
        case 'topRight':
          _boundary.bottom = originMouseY + previousSize.height - minHeight;
          _boundary.left = originMouseX - previousSize.width + minWidth;
          onDragStartTop(e);
          onResizeStartTopRight(e);
          break;
        case 'right':
          _boundary.left = originMouseX - previousSize.width + minWidth;
          onResizeStartRight(e);
          break;
        case 'bottomRight':
          _boundary.top = originMouseY - previousSize.height + minHeight;
          _boundary.left = originMouseX - previousSize.width + minWidth;
          onResizeStartBottomRight(e);
          break;
        case 'bottom':
          _boundary.top = originMouseY - previousSize.height + minHeight;
          onResizeStartBottom(e);
          break;
        default:
      }
    }

    function onTouchStart(e) {
      if (e.touches.length !== 1) return;

      // Check if this touch should be handled for drag/resize
      // Only prevent default if we're actually going to handle it
      const touchTarget = e.target;
      const dragTarget = getDragTarget();
      const isDragTarget = dragTarget && (touchTarget === dragTarget || dragTarget.contains(touchTarget));
      const isResizeTarget = touchTarget === target && resizable && cursorPos;

      // Don't interfere with touches on interactive elements inside the window
      if (!isDragTarget && !isResizeTarget) return;

      // Don't prevent default on title bar controls
      if (touchTarget.closest('.title-bar-controls')) return;

      e.preventDefault(); // Prevent scrolling while dragging
      onMouseDown(e);
    }

    target.addEventListener('mousedown', onMouseDown);
    target.addEventListener('touchstart', onTouchStart, { passive: false });
    return () => {
      // Cancel any pending throttled updates
      throttledHandlers.forEach(h => h.cancel());
      restoreIframePointerEvents();
      target.removeEventListener('mousedown', onMouseDown);
      target.removeEventListener('touchstart', onTouchStart);
      // Mouse events
      window.removeEventListener('mousemove', onDraggingLeft);
      window.removeEventListener('mousemove', onDraggingTop);
      window.removeEventListener('mousemove', onDragging);
      window.removeEventListener('mouseup', onDragEndTop);
      window.removeEventListener('mouseup', onDragEndLeft);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('mousemove', onResizingTop);
      window.removeEventListener('mousemove', onResizingRight);
      window.removeEventListener('mousemove', onResizingBottom);
      window.removeEventListener('mousemove', onResizingLeft);
      window.removeEventListener('mousemove', onResizingBottomLeft);
      window.removeEventListener('mousemove', onResizingTopLeft);
      window.removeEventListener('mousemove', onResizingTopRight);
      window.removeEventListener('mousemove', onResizingBottomRight);
      window.removeEventListener('mouseup', onResizeEndTop);
      window.removeEventListener('mouseup', onResizeEndRight);
      window.removeEventListener('mouseup', onResizeEndBottom);
      window.removeEventListener('mouseup', onResizeEndLeft);
      window.removeEventListener('mouseup', onResizeEndBottomLeft);
      window.removeEventListener('mouseup', onResizeEndTopLeft);
      window.removeEventListener('mouseup', onResizeEndTopRight);
      window.removeEventListener('mouseup', onResizeEndBottomRight);
      // Touch events
      window.removeEventListener('touchmove', onDraggingLeft);
      window.removeEventListener('touchmove', onDraggingTop);
      window.removeEventListener('touchmove', onDragging);
      window.removeEventListener('touchend', onDragEndTop);
      window.removeEventListener('touchend', onDragEndLeft);
      window.removeEventListener('touchend', onDragEnd);
      window.removeEventListener('touchcancel', onDragEndTop);
      window.removeEventListener('touchcancel', onDragEndLeft);
      window.removeEventListener('touchcancel', onDragEnd);
      window.removeEventListener('touchmove', onResizingTop);
      window.removeEventListener('touchmove', onResizingRight);
      window.removeEventListener('touchmove', onResizingBottom);
      window.removeEventListener('touchmove', onResizingLeft);
      window.removeEventListener('touchmove', onResizingBottomLeft);
      window.removeEventListener('touchmove', onResizingTopLeft);
      window.removeEventListener('touchmove', onResizingTopRight);
      window.removeEventListener('touchmove', onResizingBottomRight);
      window.removeEventListener('touchend', onResizeEndTop);
      window.removeEventListener('touchend', onResizeEndRight);
      window.removeEventListener('touchend', onResizeEndBottom);
      window.removeEventListener('touchend', onResizeEndLeft);
      window.removeEventListener('touchend', onResizeEndBottomLeft);
      window.removeEventListener('touchend', onResizeEndTopLeft);
      window.removeEventListener('touchend', onResizeEndTopRight);
      window.removeEventListener('touchend', onResizeEndBottomRight);
      window.removeEventListener('touchcancel', onResizeEndTop);
      window.removeEventListener('touchcancel', onResizeEndRight);
      window.removeEventListener('touchcancel', onResizeEndBottom);
      window.removeEventListener('touchcancel', onResizeEndLeft);
      window.removeEventListener('touchcancel', onResizeEndBottomLeft);
      window.removeEventListener('touchcancel', onResizeEndTopLeft);
      window.removeEventListener('touchcancel', onResizeEndTopRight);
      window.removeEventListener('touchcancel', onResizeEndBottomRight);
      cover.remove();
    };
    // eslint-disable-next-line
  }, [boundary.top, boundary.right, boundary.bottom, boundary.left, cursorPos]);

  return { offset, size, setSize };
}

function useCursor(ref, threshold, resizable) {
  const [position, setPosition] = useState('');

  useEffect(() => {
    const target = ref.current;
    if (!target || !resizable) return;
    const cover = document.createElement('div');
    cover.style.position = 'fixed';
    cover.style.top = 0;
    cover.style.left = 0;
    cover.style.right = 0;
    cover.style.bottom = 0;
    let lock = false;

    function _setPosition(p) {
      setPosition(p);
      target.style.cursor = getCursorStyle(p);
      cover.style.cursor = getCursorStyle(p);
    }

    function onMouseDown(e) {
      if (e.target !== target) return;
      onHover(e);
      lock = true;
      document.body.appendChild(cover);
      window.addEventListener('mouseup', onMouseUp);
    }

    function onMouseUp() {
      lock = false;
      cover.remove();
      window.removeEventListener('mouseup', onMouseUp);
    }

    function onHoverEnd() {
      if (lock) return;
      _setPosition('');
    }

    function onHover(e) {
      if (lock) return;
      if (e.target !== target) return _setPosition('');
      const { offsetX, offsetY } = e;
      const { width, height } = target.getBoundingClientRect();
      if (offsetX < threshold) {
        if (offsetY < threshold) {
          _setPosition('topLeft');
        } else if (height - offsetY < threshold) {
          _setPosition('bottomLeft');
        } else {
          _setPosition('left');
        }
      } else if (offsetY < threshold) {
        if (width - offsetX < threshold) {
          _setPosition('topRight');
        } else {
          _setPosition('top');
        }
      } else if (width - offsetX < threshold) {
        if (height - offsetY < threshold) _setPosition('bottomRight');
        else _setPosition('right');
      } else if (height - offsetY < threshold) {
        _setPosition('bottom');
      } else {
        _setPosition('');
      }
    }

    target.addEventListener('mouseleave', onHoverEnd);
    target.addEventListener('mousemove', onHover);
    target.addEventListener('mousedown', onMouseDown);
    return () => {
      cover.remove();
      target.removeEventListener('mouseleave', onHoverEnd);
      target.removeEventListener('mousemove', onHover);
      target.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line
  }, []);

  return position;
}

function getComputedPagePosition(e, boundary) {
  // Handle both mouse and touch events
  let pageX, pageY;
  if (e.touches && e.touches.length > 0) {
    pageX = e.touches[0].pageX;
    pageY = e.touches[0].pageY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    pageX = e.changedTouches[0].pageX;
    pageY = e.changedTouches[0].pageY;
  } else {
    pageX = e.pageX;
    pageY = e.pageY;
  }

  if (!boundary) return { pageX, pageY };
  const { top, right, bottom, left } = boundary;
  if (pageX <= left) pageX = left;
  else if (pageX >= right) pageX = right;
  if (pageY <= top) pageY = top;
  else if (pageY >= bottom) pageY = bottom;
  return { pageX, pageY };
}

function getCursorStyle(pos) {
  switch (pos) {
    case 'top':
      return 'n-resize';
    case 'topRight':
      return 'ne-resize';
    case 'right':
      return 'e-resize';
    case 'bottomRight':
      return 'se-resize';
    case 'bottom':
      return 's-resize';
    case 'bottomLeft':
      return 'sw-resize';
    case 'left':
      return 'w-resize';
    case 'topLeft':
      return 'nw-resize';
    default:
      return 'auto';
  }
}

export default useElementResize;
