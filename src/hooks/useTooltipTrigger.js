import { useCallback } from 'react';
import { useTooltip } from '../contexts/TooltipContext';

const CURSOR_OFFSET_X = 12;
const CURSOR_OFFSET_Y = 20;

/**
 * Hook to add tooltip functionality to any element
 *
 * @param {string} text - The tooltip text to display
 * @param {Object} options - Configuration options
 * @param {number} options.delay - Delay before showing tooltip (default: 400ms)
 * @param {boolean} options.multiline - Whether tooltip text should wrap (default: false)
 * @param {boolean} options.disabled - Whether tooltip is disabled (default: false)
 * @returns {Object} Event handlers to spread onto an element
 *
 * @example
 * const tooltipProps = useTooltipTrigger('Hello World');
 * return <div {...tooltipProps}>Hover me</div>;
 */
export default function useTooltipTrigger(text, options = {}) {
  const { delay = 1000, multiline = false, disabled = false } = options;
  const { showTooltip, hideTooltip } = useTooltip();

  const onMouseEnter = useCallback(
    (e) => {
      if (disabled || !text) return;
      const x = e.clientX + CURSOR_OFFSET_X;
      const y = e.clientY + CURSOR_OFFSET_Y;
      showTooltip(text, x, y, { delay, multiline });
    },
    [text, delay, multiline, disabled, showTooltip]
  );

  const onMouseMove = useCallback(
    (e) => {
      if (disabled || !text) return;
      const x = e.clientX + CURSOR_OFFSET_X;
      const y = e.clientY + CURSOR_OFFSET_Y;
      // Don't re-trigger delay on mouse move, just update position
      showTooltip(text, x, y, { delay: 0, multiline });
    },
    [text, multiline, disabled, showTooltip]
  );

  const onMouseLeave = useCallback(() => {
    hideTooltip(true);
  }, [hideTooltip]);

  return {
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  };
}
