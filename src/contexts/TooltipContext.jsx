import { createContext, useContext, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

const TooltipContext = createContext(null);

const VIEWPORT_PADDING = 4;

const TooltipBox = styled.div`
  position: fixed;
  background: #ffffe1;
  border: 1px solid #000;
  padding: 2px 5px;
  font-family: Tahoma, 'Noto Sans', sans-serif;
  font-size: 11px;
  color: #000;
  z-index: 99999;
  pointer-events: none;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  max-width: 300px;
  white-space: ${({ $multiline }) => ($multiline ? 'normal' : 'nowrap')};
  visibility: ${({ $measured }) => ($measured ? 'visible' : 'hidden')};
`;

function TooltipRenderer() {
  const { tooltip } = useTooltip();
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [measured, setMeasured] = useState(false);

  useLayoutEffect(() => {
    if (!tooltip.visible || !tooltip.text || !tooltipRef.current) {
      setMeasured(false);
      return;
    }

    const rect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = tooltip.x;
    let y = tooltip.y;

    // Adjust horizontal position if tooltip goes off-screen
    if (x + rect.width > viewportWidth - VIEWPORT_PADDING) {
      x = viewportWidth - rect.width - VIEWPORT_PADDING;
    }
    if (x < VIEWPORT_PADDING) {
      x = VIEWPORT_PADDING;
    }

    // Adjust vertical position if tooltip goes off-screen
    if (y + rect.height > viewportHeight - VIEWPORT_PADDING) {
      // Show tooltip above the cursor instead
      y = tooltip.y - rect.height - 24;
    }
    if (y < VIEWPORT_PADDING) {
      y = VIEWPORT_PADDING;
    }

    setPosition({ x, y });
    setMeasured(true);
  }, [tooltip.visible, tooltip.text, tooltip.x, tooltip.y]);

  if (!tooltip.visible || !tooltip.text) {
    return null;
  }

  const style = {
    left: measured ? position.x : tooltip.x,
    top: measured ? position.y : tooltip.y,
  };

  return createPortal(
    <TooltipBox ref={tooltipRef} style={style} $multiline={tooltip.multiline} $measured={measured}>
      {tooltip.text}
    </TooltipBox>,
    document.body
  );
}

export function TooltipProvider({ children }) {
  const [tooltip, setTooltip] = useState({
    visible: false,
    text: '',
    x: 0,
    y: 0,
    multiline: false,
  });

  const hideTimeoutRef = useRef(null);
  const showTimeoutRef = useRef(null);

  const showTooltip = useCallback((text, x, y, options = {}) => {
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    // Clear any pending show timeout
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    const delay = options.delay ?? 400; // Default XP tooltip delay

    if (delay > 0) {
      showTimeoutRef.current = setTimeout(() => {
        setTooltip({
          visible: true,
          text,
          x,
          y,
          multiline: options.multiline || false,
        });
      }, delay);
    } else {
      setTooltip({
        visible: true,
        text,
        x,
        y,
        multiline: options.multiline || false,
      });
    }
  }, []);

  const hideTooltip = useCallback((immediate = false) => {
    // Clear any pending show timeout
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (immediate) {
      setTooltip((prev) => ({ ...prev, visible: false }));
    } else {
      hideTimeoutRef.current = setTimeout(() => {
        setTooltip((prev) => ({ ...prev, visible: false }));
      }, 100);
    }
  }, []);

  const updatePosition = useCallback((x, y) => {
    setTooltip((prev) => ({
      ...prev,
      x,
      y,
    }));
  }, []);

  return (
    <TooltipContext.Provider value={{ tooltip, showTooltip, hideTooltip, updatePosition }}>
      {children}
      <TooltipRenderer />
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
}

export default TooltipContext;
