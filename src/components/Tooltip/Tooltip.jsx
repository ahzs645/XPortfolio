import { useCallback, useRef, cloneElement, isValidElement, Children } from 'react';
import { useTooltip } from '../../contexts/TooltipContext';

const CURSOR_OFFSET_X = 12;
const CURSOR_OFFSET_Y = 20;

export default function Tooltip({ children, text, delay = 400, multiline = false, disabled = false }) {
  const { showTooltip, hideTooltip } = useTooltip();
  const elementRef = useRef(null);

  const handleMouseEnter = useCallback(
    (e) => {
      if (disabled || !text) return;
      const x = e.clientX + CURSOR_OFFSET_X;
      const y = e.clientY + CURSOR_OFFSET_Y;
      showTooltip(text, x, y, { delay, multiline });
    },
    [text, delay, multiline, disabled, showTooltip]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (disabled || !text) return;
      const x = e.clientX + CURSOR_OFFSET_X;
      const y = e.clientY + CURSOR_OFFSET_Y;
      showTooltip(text, x, y, { delay: 0, multiline });
    },
    [text, multiline, disabled, showTooltip]
  );

  const handleMouseLeave = useCallback(() => {
    hideTooltip(true);
  }, [hideTooltip]);

  // If children is a single valid React element, clone it with our handlers
  const child = Children.only(children);

  if (!isValidElement(child)) {
    return children;
  }

  return cloneElement(child, {
    ref: elementRef,
    onMouseEnter: (e) => {
      handleMouseEnter(e);
      child.props.onMouseEnter?.(e);
    },
    onMouseMove: (e) => {
      handleMouseMove(e);
      child.props.onMouseMove?.(e);
    },
    onMouseLeave: (e) => {
      handleMouseLeave();
      child.props.onMouseLeave?.(e);
    },
  });
}
