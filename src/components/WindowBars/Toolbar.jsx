import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

/**
 * Toolbar Component - Windows XP style toolbar with buttons
 *
 * @param {Object} props
 * @param {Array} props.items - Array of toolbar items (buttons, separators)
 *   Button: { type: 'button', id: string, icon: string, label?: string, disabled?: boolean, action: string }
 *   Separator: { type: 'separator' }
 * @param {Function} props.onAction - Callback when button is clicked: (action, event) => void
 * @param {boolean} props.bottomBorder - Whether to show bottom border (default: true)
 * @param {boolean} props.topBorder - Whether to show top border (default: false)
 *
 * @example
 * <Toolbar
 *   items={[
 *     { type: 'button', id: 'prev', icon: '/gui/toolbar/back.webp', label: 'Previous', disabled: true, action: 'nav:prev' },
 *     { type: 'button', id: 'next', icon: '/gui/toolbar/forward.webp', label: 'Next', disabled: true, action: 'nav:next' },
 *     { type: 'separator' },
 *     { type: 'button', id: 'projects', icon: '/icons/projects.webp', label: 'My Projects', action: 'openProjects' },
 *     { type: 'button', id: 'resume', icon: '/icons/resume.svg', label: 'My Resume', action: 'openResume' },
 *   ]}
 *   onAction={(action, e) => handleAction(action, e)}
 * />
 */
function Toolbar({ items = [], onAction, bottomBorder = true, topBorder = false }) {
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

  return (
    <ToolbarContainer>
      <ToolbarRow $bottomBorder={bottomBorder} $topBorder={topBorder}>
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <VerticalLine key={`sep-${index}`} />;
          }

          const isPressed = pressedButton === item.id;
          const isDisabled = item.disabled;

          return (
            <ToolbarButton
              key={item.id}
              className={`${isDisabled ? 'disabled' : ''} ${isPressed ? 'pressed' : ''}`}
              onMouseDown={() => handleMouseDown(item.id, isDisabled)}
              onMouseUp={(e) => handleMouseUp(e, item.action, item.id, isDisabled)}
              onMouseLeave={handleMouseLeave}
            >
              <img
                src={item.icon}
                alt={item.label || item.id}
                width={25}
                height={25}
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
  background: #e9e9e9;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-grow: 0;
  flex-shrink: 0;
  height: 48px;
  max-height: 48px;
  min-height: 48px;
  overflow: hidden;
  padding: 0 8px 0 4px;
  position: static;
  user-select: none;
  width: 100%;
  z-index: 20;

  ${props => props.$bottomBorder && `
    border-bottom: 2px solid #e0e0e0;
  `}

  ${props => props.$topBorder && `
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
  border: 1.5px solid transparent;
  border-radius: 5px;
  box-shadow: none;
  color: #222;
  display: flex;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  justify-content: center;
  margin: 0;
  padding: 6px 8px;
  transition: box-shadow 0.13s, border 0.13s, background 0.13s;
  user-select: none;
  cursor: default;

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
    border: 1.5px solid #7a7a7a;
    box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.35), inset -1px -1px 1px hsla(0, 0%, 100%, 0.6);
  }

  @media (hover: hover) {
    &:not(.disabled):hover:not(.pressed) {
      background: #e7e7e7;
      border: 1.5px solid #b0b0b0;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    }
  }

  & > img + span {
    margin-left: 5px;
  }

  & > img:only-child {
    margin-right: 0;
  }
`;

const VerticalLine = styled.div`
  background: none;
  border-left: 1px solid #d7d4ca;
  height: 26px;
  margin: 0 2px;
  width: 0;
`;

export default Toolbar;
