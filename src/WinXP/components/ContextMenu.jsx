import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { useUserSettings } from '../../contexts/UserSettingsContext';
import { getColorDepthFilter } from '../../utils/colorDepthEffects';
import { getDisplayViewport, toDisplayLayerPoint, toDisplayLayerRect } from '../../utils/displayCoordinates';
import { getXpPortalRoot } from '../../utils/portalRoot';

/**
 * Generic XP-style context menu with optional submenus and icons.
 * Items structure:
 * { label, onClick, disabled, bold, icon (string | ReactNode), submenu: [] }
 * Divider: { type: 'divider' }
 */
export function ContextMenu({
  position,
  items,
  onClose,
  overlayType = 'absolute',
  zIndex = 1000,
}) {
  const { colorDepth } = useUserSettings();
  const menuRef = useRef(null);
  const [adjustedPosition, setAdjustedPosition] = useState(() => toDisplayLayerPoint(position));

  // Adjust position to keep menu within viewport
  /* eslint-disable react-hooks/set-state-in-effect -- DOM measurement after render */
  useEffect(() => {
    if (!menuRef.current || !position) return;

    const menu = menuRef.current;
    const rect = toDisplayLayerRect(menu.getBoundingClientRect());
    const viewport = getDisplayViewport();
    const normalizedPosition = toDisplayLayerPoint(position);

    let newX = normalizedPosition.x;
    let newY = normalizedPosition.y;

    // Adjust if menu goes off right edge
    if (normalizedPosition.x + rect.width > viewport.width) {
      newX = Math.max(0, viewport.width - rect.width - 5);
    }

    // Adjust if menu goes off bottom edge
    if (normalizedPosition.y + rect.height > viewport.height) {
      newY = Math.max(0, viewport.height - rect.height - 5);
    }

    if (newX !== normalizedPosition.x || newY !== normalizedPosition.y) {
      setAdjustedPosition({ x: newX, y: newY });
    } else {
      setAdjustedPosition(normalizedPosition);
    }
  }, [position]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!position || !items?.length) return null;

  const menuContent = (
    <Overlay $type={overlayType} $zIndex={zIndex} onClick={onClose}>
      <MenuBox
        ref={menuRef}
        $colorDepth={colorDepth}
        style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
        onClick={(e) => e.stopPropagation()}
      >
        {renderItems(items)}
      </MenuBox>
    </Overlay>
  );

  // Use portal for fixed positioning to escape any CSS transforms
  if (overlayType === 'fixed') {
    return createPortal(menuContent, getXpPortalRoot());
  }

  return menuContent;
}

function renderItems(items) {
  return items.map((item, idx) => {
    if (item?.type === 'divider') {
      return <MenuDivider key={`divider-${idx}`} />;
    }

    if (!item) return null;

    const key = item.key || `${item.label || 'item'}-${idx}`;
    const handleClick = () => {
      if (item.disabled) return;
      item.onClick?.();
    };

    const hasSubmenu = Array.isArray(item.submenu) && item.submenu.length > 0;
    const hasCheckmark = item.checked !== undefined;

    return (
      <MenuItem
        key={key}
        onClick={handleClick}
        $disabled={item.disabled}
        $bold={item.bold}
        title={item.title}
      >
        <MenuIcon $hasCheckmark={hasCheckmark}>
          {hasCheckmark ? (
            item.checked ? <Checkmark>✓</Checkmark> : null
          ) : (
            typeof item.icon === 'string' ? (
              item.iconAsOverlay ? (
                <IconWrapper>
                  <IconAsOverlay src={item.icon} alt="" />
                </IconWrapper>
              ) : (
                <IconWrapper>
                  <img src={item.icon} alt="" />
                  {item.iconOverlay && <IconOverlay src={item.iconOverlay} alt="" />}
                </IconWrapper>
              )
            ) : item.icon || null
          )}
        </MenuIcon>
        <MenuLabel>{item.label}</MenuLabel>
        <MenuRightSlot>{hasSubmenu ? '>' : ''}</MenuRightSlot>
        {hasSubmenu ? (
          <SubMenu data-submenu>
            {renderItems(item.submenu)}
          </SubMenu>
        ) : null}
      </MenuItem>
    );
  });
}

const Overlay = styled.div`
  position: ${({ $type }) => ($type === 'fixed' ? 'fixed' : 'absolute')};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${({ $zIndex }) => $zIndex || 1000};
`;

const MenuBox = styled.div`
  position: absolute;
  background: #f5f5f5;
  border: 2px solid #c0c0c0;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 180px;
  padding: 2px 0;
  color: #000;
  filter: ${({ $colorDepth }) => getColorDepthFilter($colorDepth) || 'none'};
`;

const MenuItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  font-size: 11px;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  font-weight: ${({ $bold }) => ($bold ? 'bold' : 'normal')};
  color: ${({ $disabled }) => ($disabled ? '#808080' : '#000')};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};

  &:hover {
    background: ${({ $disabled }) => ($disabled ? 'transparent' : '#0b61ff')};
    color: ${({ $disabled }) => ($disabled ? '#808080' : 'white')};
  }

  &:hover > [data-submenu] {
    display: ${({ $disabled }) => ($disabled ? 'none' : 'flex')};
  }
`;

const MenuIcon = styled.div`
  width: 20px;
  margin-left: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 16px;
    height: 16px;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  width: 16px;
  height: 16px;
`;

const IconOverlay = styled.img`
  position: absolute;
  bottom: -2px;
  left: -2px;
  width: 10px !important;
  height: 10px !important;
`;

const IconAsOverlay = styled.img`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 10px !important;
  height: 10px !important;
`;

const MenuLabel = styled.div`
  flex: 1;
  color: inherit;
`;

const MenuRightSlot = styled.div`
  width: 10px;
  text-align: right;
`;

const SubMenu = styled.div`
  display: none;
  position: absolute;
  top: 0;
  left: 100%;
  background: #f5f5f5;
  border: 1px solid #c0c0c0;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  min-width: 180px;
  padding: 2px 0;
  flex-direction: column;
  z-index: 1;
`;

const MenuDivider = styled.div`
  height: 1px;
  background: #c0c0c0;
  margin: 2px 0;
`;

const Checkmark = styled.span`
  font-size: 12px;
  font-weight: bold;
  color: inherit;
`;

export default ContextMenu;
