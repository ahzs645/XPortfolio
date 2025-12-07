import React, { useState, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';

/**
 * Toolbar Component - Windows XP style toolbar with buttons
 *
 * @param {Object} props
 * @param {Array} props.items - Array of toolbar items (buttons, separators, selects, color pickers)
 *   Button: { type: 'button', id: string, icon: string, label?: string, disabled?: boolean, active?: boolean, action: string }
 *   Separator: { type: 'separator' }
 *   Spacer: { type: 'spacer', width?: number }
 *   Select: { type: 'select', id: string, value: string, options: Array<{value, label}>, width?: number }
 *   Color: { type: 'color', id: string, value: string, title?: string }
 * @param {Function} props.onAction - Callback when button is clicked: (action, event) => void
 * @param {Function} props.onChange - Callback when select/color changes: (id, value) => void
 * @param {boolean} props.bottomBorder - Whether to show bottom border (default: true)
 * @param {boolean} props.topBorder - Whether to show top border (default: false)
 * @param {string} props.variant - 'default' | 'compact' - Toolbar size variant (default: 'default')
 *
 * @example
 * // Standard explorer-style toolbar
 * <Toolbar
 *   items={[
 *     { type: 'button', id: 'prev', icon: '/gui/toolbar/back.webp', label: 'Previous', disabled: true, action: 'nav:prev' },
 *     { type: 'button', id: 'next', icon: '/gui/toolbar/forward.webp', label: 'Next', disabled: true, action: 'nav:next' },
 *     { type: 'separator' },
 *     { type: 'button', id: 'projects', icon: '/icons/projects.webp', label: 'My Projects', action: 'openProjects' },
 *   ]}
 *   onAction={(action, e) => handleAction(action, e)}
 * />
 *
 * @example
 * // Compact WordPad-style toolbar with selects and color picker
 * <Toolbar
 *   variant="compact"
 *   items={[
 *     { type: 'select', id: 'font', value: 'Arial', options: [{value: 'Arial', label: 'Arial'}], width: 120 },
 *     { type: 'select', id: 'size', value: '12', options: [{value: '12', label: '12'}], width: 50 },
 *     { type: 'button', id: 'bold', icon: '/icons/bold.png', active: isBold, action: 'format:bold' },
 *     { type: 'color', id: 'textColor', value: '#000000' },
 *   ]}
 *   onAction={(action, e) => handleAction(action, e)}
 *   onChange={(id, value) => handleChange(id, value)}
 * />
 */
function Toolbar({ items = [], onAction, onChange, bottomBorder = true, topBorder = false, variant = 'default' }) {
  const isCompact = variant === 'compact';
  const [pressedButton, setPressedButton] = useState(null);
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [hiddenStartIndex, setHiddenStartIndex] = useState(-1); // Index from which items are hidden
  const [overflowDropdownPos, setOverflowDropdownPos] = useState({ top: 0, left: 0 });
  const toolbarRef = useRef(null);
  const itemRefs = useRef({});
  const chevronRef = useRef(null);
  const itemWidthsRef = useRef({}); // Cache item widths to avoid flickering
  const lastWidthRef = useRef(0);
  const hiddenStartIndexRef = useRef(-1); // Track cutoff without causing re-renders

  // Calculate which items overflow
  const calculateOverflow = useCallback(() => {
    if (!toolbarRef.current) return;

    const container = toolbarRef.current;
    const containerWidth = container.offsetWidth;
    const padding = 16; // Left + right padding
    const chevronWidth = 28; // Width of chevron button
    const availableWidth = containerWidth - padding;

    // Measure and cache item widths (only if not already cached or if visible)
    items.forEach((item, index) => {
      const itemEl = itemRefs.current[index];
      if (itemEl) {
        const currentWidth = itemEl.offsetWidth;
        // Only update cache if item is visible (has width > 0)
        if (currentWidth > 0) {
          itemWidthsRef.current[index] = currentWidth;
        }
      }
    });

    // Calculate total width using cached widths
    let totalWidth = 0;
    items.forEach((item, index) => {
      totalWidth += itemWidthsRef.current[index] || 0;
    });

    const needsChevron = totalWidth > availableWidth;
    const effectiveWidth = needsChevron ? availableWidth - chevronWidth : availableWidth;

    // Determine cutoff point using cached widths
    let usedWidth = 0;
    let cutoffIndex = -1;

    for (let i = 0; i < items.length; i++) {
      const itemWidth = itemWidthsRef.current[i] || 0;
      if (usedWidth + itemWidth > effectiveWidth) {
        cutoffIndex = i;
        break;
      }
      usedWidth += itemWidth;
    }

    // Only update state if cutoff actually changed
    if (hiddenStartIndexRef.current !== cutoffIndex) {
      hiddenStartIndexRef.current = cutoffIndex;
      setHiddenStartIndex(cutoffIndex);
    }
  }, [items]);

  // Recalculate on resize - only observe, don't depend on calculateOverflow
  useLayoutEffect(() => {
    let rafId = null;

    const doCalculate = () => {
      if (!toolbarRef.current) return;
      const currentWidth = toolbarRef.current.offsetWidth;
      // Only recalculate if width actually changed
      if (currentWidth !== lastWidthRef.current) {
        lastWidthRef.current = currentWidth;
        calculateOverflow();
      }
    };

    const debouncedCalculate = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(doCalculate);
    };

    // Initial calculation after mount
    const timer = setTimeout(() => {
      if (toolbarRef.current) {
        lastWidthRef.current = toolbarRef.current.offsetWidth;
      }
      calculateOverflow();
    }, 0);

    const resizeObserver = new ResizeObserver(debouncedCalculate);

    if (toolbarRef.current) {
      resizeObserver.observe(toolbarRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]); // Only re-run when items change, not calculateOverflow

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setOverflowMenuOpen(false);
      }
    };

    if (overflowMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [overflowMenuOpen]);

  // Handle chevron click
  const handleChevronClick = useCallback(() => {
    if (!overflowMenuOpen && chevronRef.current) {
      const rect = chevronRef.current.getBoundingClientRect();
      setOverflowDropdownPos({
        top: rect.bottom,
        left: rect.right - 160, // 160 is min-width of dropdown, align right edge
      });
    }
    setOverflowMenuOpen(!overflowMenuOpen);
  }, [overflowMenuOpen]);

  const handleMouseDown = useCallback((id, disabled) => {
    if (!disabled) {
      setPressedButton(id);
    }
  }, []);

  const handleMouseUp = useCallback((e, action, id, disabled) => {
    setPressedButton(null);
    if (!disabled && onAction) {
      onAction(action, e);
    }
  }, [onAction]);

  const handleMouseLeave = useCallback(() => {
    setPressedButton(null);
  }, []);

  // Touch handlers for mobile support
  const handleTouchStart = useCallback((e, id, disabled) => {
    if (!disabled) {
      setPressedButton(id);
    }
  }, []);

  const handleTouchEnd = useCallback((e, action, id, disabled) => {
    e.preventDefault(); // Prevent mouse event from also firing
    setPressedButton(null);
    if (!disabled && onAction) {
      onAction(action, e);
    }
  }, [onAction]);

  const handleSelectChange = useCallback((id, value) => {
    if (onChange) {
      onChange(id, value);
    }
  }, [onChange]);

  const handleColorChange = useCallback((id, value) => {
    if (onChange) {
      onChange(id, value);
    }
  }, [onChange]);

  const iconSize = isCompact ? 16 : 25;
  const hasOverflow = hiddenStartIndex >= 0;
  const hiddenItems = hasOverflow ? items.slice(hiddenStartIndex).filter(item => item.type !== 'separator' && item.type !== 'spacer') : [];

  const renderItem = (item, index, isInOverflow = false) => {
    const isHidden = !isInOverflow && hiddenStartIndex >= 0 && index >= hiddenStartIndex;

    if (item.type === 'separator') {
      return (
        <VerticalLine
          key={`sep-${index}`}
          ref={(el) => { itemRefs.current[index] = el; }}
          $isCompact={isCompact}
          $hidden={isHidden}
        />
      );
    }

    if (item.type === 'spacer') {
      return (
        <Spacer
          key={`spacer-${index}`}
          ref={(el) => { itemRefs.current[index] = el; }}
          $width={item.width}
          $hidden={isHidden}
        />
      );
    }

    if (item.type === 'select') {
      return (
        <SelectWrapper
          key={item.id}
          ref={(el) => { itemRefs.current[index] = el; }}
          $hidden={isHidden}
        >
          <ToolbarSelect
            value={item.value}
            onChange={(e) => handleSelectChange(item.id, e.target.value)}
            title={item.title}
            $width={item.width}
            disabled={item.disabled}
          >
            {item.options.map((opt) => (
              <option key={opt.value} value={opt.value} style={opt.style}>
                {opt.label}
              </option>
            ))}
          </ToolbarSelect>
        </SelectWrapper>
      );
    }

    if (item.type === 'color') {
      return (
        <ColorWrapper
          key={item.id}
          ref={(el) => { itemRefs.current[index] = el; }}
          $hidden={isHidden}
        >
          <ColorInput
            type="color"
            value={item.value}
            onChange={(e) => handleColorChange(item.id, e.target.value)}
            title={item.title}
            disabled={item.disabled}
          />
        </ColorWrapper>
      );
    }

    // Default: button type
    const isPressed = pressedButton === item.id;
    const isDisabled = item.disabled;
    const isActive = item.active;

    if (isInOverflow) {
      // Render as dropdown menu item
      return (
        <OverflowMenuItem
          key={item.id}
          className={isDisabled ? 'disabled' : ''}
          onClick={(e) => {
            if (!isDisabled && onAction) {
              onAction(item.action, e);
              setOverflowMenuOpen(false);
            }
          }}
        >
          <img
            src={item.icon}
            alt={item.label || item.id}
            width={16}
            height={16}
            draggable={false}
          />
          <span>{item.label || item.id}</span>
        </OverflowMenuItem>
      );
    }

    return (
      <ToolbarButton
        key={item.id}
        ref={(el) => { itemRefs.current[index] = el; }}
        className={`${isDisabled ? 'disabled' : ''} ${isPressed ? 'pressed' : ''} ${isActive ? 'active' : ''}`}
        onMouseDown={() => handleMouseDown(item.id, isDisabled)}
        onMouseUp={(e) => handleMouseUp(e, item.action, item.id, isDisabled)}
        onMouseLeave={handleMouseLeave}
        onTouchStart={(e) => handleTouchStart(e, item.id, isDisabled)}
        onTouchEnd={(e) => handleTouchEnd(e, item.action, item.id, isDisabled)}
        $isCompact={isCompact}
        $hidden={isHidden}
      >
        <img
          src={item.icon}
          alt={item.label || item.id}
          width={iconSize}
          height={iconSize}
          draggable={false}
        />
        {item.label && <span>{item.label}</span>}
      </ToolbarButton>
    );
  };

  return (
    <ToolbarContainer ref={toolbarRef}>
      <ToolbarRow $bottomBorder={bottomBorder} $topBorder={topBorder} $isCompact={isCompact}>
        {items.map((item, index) => renderItem(item, index))}
        {hasOverflow && (
          <ChevronButton
            ref={chevronRef}
            onClick={handleChevronClick}
            className={overflowMenuOpen ? 'active' : ''}
            $isCompact={isCompact}
          >
            »
          </ChevronButton>
        )}
      </ToolbarRow>
      {overflowMenuOpen && hasOverflow && createPortal(
        <OverflowDropdown $isCompact={isCompact} style={{ top: overflowDropdownPos.top, left: overflowDropdownPos.left }}>
          {hiddenItems.map((item, index) => renderItem(item, hiddenStartIndex + index, true))}
        </OverflowDropdown>,
        document.body
      )}
    </ToolbarContainer>
  );
}

const ToolbarContainer = styled.div`
  all: initial;
  background: none;
  border: none;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  position: relative;
  width: 100%;
  z-index: auto;
  font-family: Tahoma, Arial, sans-serif;
`;

const ToolbarRow = styled.div`
  all: unset;
  align-items: center;
  background: ${props => props.$isCompact ? '#ecead5' : '#e9e9e9'};
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-grow: 0;
  flex-shrink: 0;
  gap: ${props => props.$isCompact ? '4px' : '0'};
  height: ${props => props.$isCompact ? '28px' : '48px'};
  max-height: ${props => props.$isCompact ? '28px' : '48px'};
  min-height: ${props => props.$isCompact ? '28px' : '48px'};
  overflow: hidden;
  padding: ${props => props.$isCompact ? '2px 4px' : '0 8px 0 4px'};
  position: static;
  user-select: none;
  width: 100%;
  z-index: 20;

  ${props => props.$bottomBorder && css`
    border-bottom: ${props.$isCompact ? '1px solid #b1aea0' : '2px solid #e0e0e0'};
  `}

  ${props => props.$topBorder && css`
    border-top: 2px solid #d7d4ca;
  `}

  img, span {
    margin: 0;
    padding: 0;
    user-select: none;
  }
`;

const ToolbarButton = styled.div`
  align-items: center;
  border: ${props => props.$isCompact ? '1px' : '1.5px'} solid transparent;
  border-radius: ${props => props.$isCompact ? '3px' : '5px'};
  box-shadow: none;
  color: #222;
  display: ${props => props.$hidden ? 'none' : 'flex'};
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  justify-content: center;
  margin: 0;
  padding: ${props => props.$isCompact ? '3px 4px' : '6px 8px'};
  transition: box-shadow 0.13s, border 0.13s, background 0.13s;
  user-select: none;
  cursor: default;
  min-width: ${props => props.$isCompact ? '24px' : 'auto'};
  min-height: ${props => props.$isCompact ? '22px' : 'auto'};
  touch-action: manipulation;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.disabled:active,
  &.disabled:hover {
    background: none;
    border-color: transparent;
    box-shadow: none;
  }

  &.pressed {
    background: #dadada;
    border: ${props => props.$isCompact ? '1px' : '1.5px'} solid #7a7a7a;
    box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.35), inset -1px -1px 1px hsla(0, 0%, 100%, 0.6);
  }

  &.active {
    background: rgba(255, 255, 255, 1);
    border: ${props => props.$isCompact ? '1px' : '1.5px'} solid #839fb4;
  }

  @media (hover: hover) {
    &:not(.disabled):not(.active):hover:not(.pressed) {
      background: ${props => props.$isCompact ? 'rgba(255,255,255,0.5)' : '#e7e7e7'};
      border: ${props => props.$isCompact ? '1px' : '1.5px'} solid ${props => props.$isCompact ? '#d7d4cb' : '#b0b0b0'};
      box-shadow: ${props => props.$isCompact ? 'inset 0 0 3px rgba(0,0,0,0.5)' : '0 1px 1px rgba(0, 0, 0, 0.1)'};
    }
  }

  & > img + span {
    margin-left: 5px;
  }

  & > img:only-child {
    margin-right: 0;
  }

  img {
    width: ${props => props.$isCompact ? '16px' : '25px'};
    height: ${props => props.$isCompact ? '16px' : '25px'};
    object-fit: contain;
  }
`;

const VerticalLine = styled.div`
  background: none;
  border-left: 1px solid #d7d4ca;
  display: ${props => props.$hidden ? 'none' : 'block'};
  height: ${props => props.$isCompact ? '18px' : '26px'};
  margin: 0 2px;
  width: 0;
`;

const Spacer = styled.div`
  display: ${props => props.$hidden ? 'none' : 'block'};
  width: ${props => props.$width ? `${props.$width}px` : '8px'};
  flex-shrink: 0;
`;

const SelectWrapper = styled.div`
  display: ${props => props.$hidden ? 'none' : 'flex'};
  align-items: center;
`;

const ColorWrapper = styled.div`
  display: ${props => props.$hidden ? 'none' : 'flex'};
  align-items: center;
`;

const ChevronButton = styled.div`
  align-items: flex-start;
  cursor: default;
  display: flex;
  font-weight: bold;
  height: 100%;
  justify-content: center;
  padding: 4px 6px 0;
  touch-action: manipulation;
  user-select: none;
  margin-left: auto;

  &:hover,
  &.active {
    background: #0a6fc2;
    color: #fff;
  }
`;

const OverflowDropdown = styled.div`
  background: #f2f2f2;
  border: 1px solid #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  min-width: 160px;
  padding: 4px 0;
  position: fixed;
  z-index: 99999;
`;

const OverflowMenuItem = styled.div`
  align-items: center;
  cursor: default;
  display: flex;
  gap: 8px;
  padding: 4px 12px;
  white-space: nowrap;

  &:hover:not(.disabled) {
    background: #0a6fc2;
    color: #fff;
  }

  &.disabled {
    color: #bcbcbc;
  }

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }
`;

const ToolbarSelect = styled.select`
  /* Let XP.css handle the styling - just set size constraints */
  min-width: ${props => props.$width ? `${props.$width}px` : '80px'};
  height: 21px;
  font-size: 11px;
`;

const ColorInput = styled.input`
  width: 24px;
  height: 22px;
  padding: 0;
  border: 1px solid #919b9c;
  cursor: pointer;
  background: #fff;

  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }

  &::-webkit-color-swatch {
    border: none;
    border-radius: 0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

export default Toolbar;
