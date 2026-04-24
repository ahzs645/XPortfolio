import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getDisplayViewport, toDisplayLayerPoint, toDisplayLayerRect } from '../../utils/displayCoordinates';
import { getXpPortalRoot } from '../../utils/portalRoot';

const MENU_WIDTH = 200;

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
  const menuId = useId();
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
    <div style={getOverlayStyle(overlayType, zIndex)} onClick={onClose}>
      <div
        className="menu"
        ref={menuRef}
        style={{
          position: 'absolute',
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          width: MENU_WIDTH,
          fontFamily: 'Arial',
          fontSize: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ul role="menu">
          {renderItems(items, menuId)}
        </ul>
      </div>
    </div>
  );

  // Use portal for fixed positioning to escape any CSS transforms
  if (overlayType === 'fixed') {
    return createPortal(menuContent, getXpPortalRoot());
  }

  return menuContent;
}

function renderItems(items, menuId, path = '') {
  return getRenderableItems(items).map(({ item, hasDivider }, idx) => {
    const itemPath = path ? `${path}-${idx}` : `${idx}`;
    const key = item.key || `${item.label || 'item'}-${itemPath}`;
    const handleClick = () => {
      if (item.disabled) return;
      item.onClick?.();
    };

    const handleKeyDown = (event) => {
      if (item.disabled) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        item.onClick?.();
      }
    };

    const hasSubmenu = !item.disabled && Array.isArray(item.submenu) && item.submenu.length > 0;
    const hasCheckmark = item.checked !== undefined;
    const className = [
      item.bold ? 'bold' : '',
      hasDivider && !hasSubmenu ? 'has-divider' : '',
      item.className || '',
    ].filter(Boolean).join(' ') || undefined;

    return (
      <li
        key={key}
        role="menuitem"
        tabIndex={item.disabled ? -1 : 0}
        className={className}
        aria-disabled={item.disabled ? 'true' : undefined}
        aria-haspopup={hasSubmenu ? 'true' : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        title={item.title}
      >
        {hasCheckmark ? renderCheckItem(item, `${menuId}-check-${itemPath}`) : renderIcon(item)}
        {!hasCheckmark && item.label}
        {item.shortcut ? <span>{item.shortcut}</span> : null}
        {hasSubmenu ? (
          <ul role="menu" style={{ width: MENU_WIDTH }}>
            {renderItems(item.submenu, menuId, itemPath)}
          </ul>
        ) : null}
      </li>
    );
  });
}

function getRenderableItems(items = []) {
  const renderableItems = [];

  for (const item of items) {
    if (!item) continue;

    if (item.type === 'divider') {
      if (renderableItems.length > 0) {
        renderableItems[renderableItems.length - 1].hasDivider = true;
      }
      continue;
    }

    renderableItems.push({ item, hasDivider: false });
  }

  return renderableItems;
}

function renderCheckItem(item, id) {
  return (
    <>
      <input
        id={id}
        type="checkbox"
        checked={Boolean(item.checked)}
        disabled={Boolean(item.disabled)}
        readOnly
        tabIndex={-1}
      />
      <label htmlFor={id} onClick={(event) => event.preventDefault()}>
        {item.label}
      </label>
    </>
  );
}

function renderIcon(item) {
  if (typeof item.icon === 'string') {
    return <img src={item.icon} alt="" width="12" height="12" />;
  }

  if (item.icon) {
    return <i aria-hidden="true">{item.icon}</i>;
  }

  return null;
}

function getOverlayStyle(overlayType, zIndex) {
  return {
    position: overlayType === 'fixed' ? 'fixed' : 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: zIndex || 1000,
    pointerEvents: 'auto',
  };
}

export default ContextMenu;
