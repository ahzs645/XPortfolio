import React, { useState, useCallback } from 'react';
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

  return (
    <ToolbarContainer>
      <ToolbarRow $bottomBorder={bottomBorder} $topBorder={topBorder} $isCompact={isCompact}>
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <VerticalLine key={`sep-${index}`} $isCompact={isCompact} />;
          }

          if (item.type === 'spacer') {
            return <Spacer key={`spacer-${index}`} $width={item.width} />;
          }

          if (item.type === 'select') {
            return (
              <ToolbarSelect
                key={item.id}
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
            );
          }

          if (item.type === 'color') {
            return (
              <ColorInput
                key={item.id}
                type="color"
                value={item.value}
                onChange={(e) => handleColorChange(item.id, e.target.value)}
                title={item.title}
                disabled={item.disabled}
              />
            );
          }

          // Default: button type
          const isPressed = pressedButton === item.id;
          const isDisabled = item.disabled;
          const isActive = item.active;

          return (
            <ToolbarButton
              key={item.id}
              className={`${isDisabled ? 'disabled' : ''} ${isPressed ? 'pressed' : ''} ${isActive ? 'active' : ''}`}
              onMouseDown={() => handleMouseDown(item.id, isDisabled)}
              onMouseUp={(e) => handleMouseUp(e, item.action, item.id, isDisabled)}
              onMouseLeave={handleMouseLeave}
              onTouchStart={(e) => handleTouchStart(e, item.id, isDisabled)}
              onTouchEnd={(e) => handleTouchEnd(e, item.action, item.id, isDisabled)}
              $isCompact={isCompact}
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
        })}
      </ToolbarRow>
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
  position: static;
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
  display: flex;
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
  height: ${props => props.$isCompact ? '18px' : '26px'};
  margin: 0 2px;
  width: 0;
`;

const Spacer = styled.div`
  width: ${props => props.$width ? `${props.$width}px` : '8px'};
  flex-shrink: 0;
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
