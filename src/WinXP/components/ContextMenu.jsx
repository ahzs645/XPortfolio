import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { getDisplayViewport, toDisplayLayerPoint, toDisplayLayerRect } from '../../utils/displayCoordinates';
import { getXpPortalRoot } from '../../utils/portalRoot';
import { preloadImages } from '../../utils/imagePreloader';

function collectContextMenuIcons(items = [], icons = []) {
  items.forEach((item) => {
    if (!item || item.type === 'divider') return;
    if (typeof item.icon === 'string') icons.push(item.icon);
    if (Array.isArray(item.submenu)) collectContextMenuIcons(item.submenu, icons);
  });
  return icons;
}

const MENU_WIDTH = 210;
const MENU_ITEM_HEIGHT = 22;
const SUBMENU_OPEN_DELAY = 120;
const SUBMENU_CLOSE_DELAY = 260;

export function ContextMenu({
  position,
  items,
  onClose,
  overlayType = 'absolute',
  zIndex = 1000,
}) {
  const menuId = useId();
  const menuRef = useRef(null);
  const closeTimerRef = useRef(null);
  const openTimerRef = useRef(null);
  const mouseTrailRef = useRef([]);
  const [adjustedPosition, setAdjustedPosition] = useState(() => toDisplayLayerPoint(position));
  const [activePath, setActivePath] = useState([]);
  const [keyboardPath, setKeyboardPath] = useState([0]);
  const renderableItems = useMemo(() => getRenderableItems(items), [items]);

  useEffect(() => {
    menuRef.current?.focus();
  }, [position]);

  useEffect(() => {
    preloadImages(collectContextMenuIcons(items));
  }, [items]);

  useEffect(() => {
    if (!menuRef.current || !position) return;

    const frameId = requestAnimationFrame(() => {
      const rect = toDisplayLayerRect(menuRef.current.getBoundingClientRect());
      const viewport = getDisplayViewport();
      const normalizedPosition = toDisplayLayerPoint(position);
      setAdjustedPosition(clampMenuPosition(normalizedPosition, rect, viewport));
    });

    return () => cancelAnimationFrame(frameId);
  }, [position, renderableItems]);

  useEffect(() => {
    const handleMouseMove = (event) => {
      mouseTrailRef.current = [
        ...mouseTrailRef.current.slice(-3),
        { x: event.clientX, y: event.clientY, time: Date.now() },
      ];
    };

    document.addEventListener('mousemove', handleMouseMove, true);
    return () => document.removeEventListener('mousemove', handleMouseMove, true);
  }, []);

  useEffect(() => () => {
    clearTimeout(closeTimerRef.current);
    clearTimeout(openTimerRef.current);
  }, []);

  if (!position || !items?.length) return null;

  const updateActivePath = (path, hasSubmenu, event) => {
    clearTimeout(closeTimerRef.current);
    clearTimeout(openTimerRef.current);

    if (hasSubmenu) {
      const delay = isPointerMovingTowardSubmenu(mouseTrailRef.current, event) ? 0 : SUBMENU_OPEN_DELAY;
      openTimerRef.current = setTimeout(() => setActivePath(path), delay);
      return;
    }

    if (activePath.length > path.length) {
      closeTimerRef.current = setTimeout(() => setActivePath(path.slice(0, -1)), SUBMENU_CLOSE_DELAY);
    } else {
      setActivePath(path.slice(0, -1));
    }
  };

  const handleSelect = (item) => {
    if (item.disabled || hasSubmenu(item)) return;
    item.onClick?.();
    onClose?.();
  };

  const handleKeyDown = (event) => {
    if (!renderableItems.length) return;
    const context = getKeyboardContext(renderableItems, keyboardPath, activePath);
    if (!context.items.length) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      onClose?.();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = getNextEnabledIndex(context.items, context.index, direction);
      const nextPath = [...context.parentPath, nextIndex];
      setKeyboardPath(nextPath);
      setActivePath(context.parentPath);
      return;
    }

    const current = context.items[context.index]?.item;
    if (!current) return;

    if (event.key === 'ArrowRight' && hasSubmenu(current)) {
      event.preventDefault();
      const nextIndex = getNextEnabledIndex(getRenderableItems(current.submenu), -1, 1);
      const nextPath = [...context.parentPath, context.index, nextIndex];
      setActivePath([...context.parentPath, context.index]);
      setKeyboardPath(nextPath);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (context.parentPath.length > 0) {
        const parentPath = context.parentPath.slice(0, -1);
        setActivePath(parentPath);
        setKeyboardPath(context.parentPath);
      }
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (hasSubmenu(current)) {
        const nextIndex = getNextEnabledIndex(getRenderableItems(current.submenu), -1, 1);
        const nextPath = [...context.parentPath, context.index, nextIndex];
        setActivePath([...context.parentPath, context.index]);
        setKeyboardPath(nextPath);
      } else {
        handleSelect(current);
      }
    }
  };

  const menuContent = (
    <Overlay style={getOverlayStyle(overlayType, zIndex)} onMouseDown={onClose}>
      <MenuPanel
        ref={menuRef}
        style={{ left: adjustedPosition.x, top: adjustedPosition.y, width: MENU_WIDTH }}
        onMouseDown={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <MenuLevel
          items={renderableItems}
          menuId={menuId}
          path={[]}
          rootPosition={adjustedPosition}
          activePath={activePath}
          keyboardPath={keyboardPath}
          onHover={updateActivePath}
          onSelect={handleSelect}
        />
      </MenuPanel>
    </Overlay>
  );

  if (overlayType === 'fixed') {
    return createPortal(menuContent, getXpPortalRoot());
  }

  return menuContent;
}

function MenuLevel({
  items,
  menuId,
  path,
  rootPosition,
  activePath,
  keyboardPath,
  onHover,
  onSelect,
}) {
  return (
    <MenuList role="menu">
      {items.map(({ item, hasDivider }, idx) => {
        const itemPath = [...path, idx];
        const itemPathKey = itemPath.join('-');
        const submenu = getRenderableItems(item.submenu);
        const itemHasSubmenu = !item.disabled && submenu.length > 0;
        const isActive = pathStartsWith(activePath, itemPath);
        const isKeyboardActive = pathsEqual(keyboardPath, itemPath);
        const key = item.key || `${item.label || 'item'}-${itemPathKey}`;

        return (
          <MenuItem
            key={key}
            role="menuitem"
            $disabled={item.disabled}
            $bold={item.bold}
            $divider={hasDivider}
            $active={isActive || isKeyboardActive}
            aria-disabled={item.disabled ? 'true' : undefined}
            aria-haspopup={itemHasSubmenu ? 'true' : undefined}
            onMouseEnter={(event) => onHover(itemPath, itemHasSubmenu, event)}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(item);
            }}
            title={item.title}
          >
            <MenuItemContents>
              <IconSlot>
                {item.checked !== undefined
                  ? renderCheckItem(item, `${menuId}-check-${itemPathKey}`)
                  : renderIcon(item)}
              </IconSlot>
              <LabelText>{item.label}</LabelText>
              {item.shortcut ? <ShortcutText>{item.shortcut}</ShortcutText> : null}
              {itemHasSubmenu ? <SubmenuArrow aria-hidden="true">▶</SubmenuArrow> : null}
            </MenuItemContents>
            {itemHasSubmenu && isActive ? (
              <SubmenuPanel style={getSubmenuStyle(itemPath, rootPosition, items.length, submenu.length)}>
                <MenuLevel
                  items={submenu}
                  menuId={menuId}
                  path={itemPath}
                  rootPosition={rootPosition}
                  activePath={activePath}
                  keyboardPath={keyboardPath}
                  onHover={onHover}
                  onSelect={onSelect}
                />
              </SubmenuPanel>
            ) : null}
          </MenuItem>
        );
      })}
    </MenuList>
  );
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

function hasSubmenu(item) {
  return !item?.disabled && getRenderableItems(item?.submenu).length > 0;
}

function getKeyboardContext(rootItems, keyboardPath, activePath) {
  let items = rootItems;
  let parentPath = [];
  const targetPath = keyboardPath.length ? keyboardPath : activePath;

  for (let i = 0; i < targetPath.length - 1; i += 1) {
    const index = targetPath[i];
    const next = getRenderableItems(items[index]?.item?.submenu);
    if (!next.length) break;
    items = next;
    parentPath = targetPath.slice(0, i + 1);
  }

  const index = Math.max(0, Math.min(targetPath[targetPath.length - 1] ?? 0, items.length - 1));
  return { items, parentPath, index };
}

function getNextEnabledIndex(items, currentIndex, direction) {
  if (!items.length) return 0;
  for (let offset = 1; offset <= items.length; offset += 1) {
    const index = (currentIndex + offset * direction + items.length) % items.length;
    if (!items[index]?.item?.disabled) return index;
  }
  return Math.max(0, currentIndex);
}

function getSubmenuStyle(path, rootPosition, siblingCount, itemCount) {
  const viewport = getDisplayViewport();
  const depth = path.length;
  const estimatedHeight = Math.max(1, itemCount) * MENU_ITEM_HEIGHT + 8;
  const absoluteTop = rootPosition.y + path.reduce((sum, index) => sum + index * MENU_ITEM_HEIGHT, 0);
  const right = rootPosition.x + MENU_WIDTH * depth + MENU_WIDTH;
  const openLeft = right > viewport.width - 6;
  const left = openLeft ? -MENU_WIDTH + 3 : MENU_WIDTH - 3;
  const overflowBottom = Math.max(0, absoluteTop + estimatedHeight - viewport.height + 6);
  const top = -overflowBottom;

  return {
    left,
    top,
    width: MENU_WIDTH,
    maxHeight: Math.min(estimatedHeight, viewport.height - 12),
    '--sibling-count': siblingCount,
  };
}

function clampMenuPosition(position, rect, viewport) {
  return {
    x: position.x + rect.width > viewport.width
      ? Math.max(0, viewport.width - rect.width - 5)
      : position.x,
    y: position.y + rect.height > viewport.height
      ? Math.max(0, viewport.height - rect.height - 5)
      : position.y,
  };
}

function isPointerMovingTowardSubmenu(points, event) {
  if (!event || points.length < 2) return false;
  const previous = points[0];
  const latest = points[points.length - 1];
  const dx = latest.x - previous.x;
  const dy = Math.abs(latest.y - previous.y);
  return dx > 4 && dy < 42;
}

function pathsEqual(a = [], b = []) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function pathStartsWith(path = [], prefix = []) {
  return prefix.length > 0 && prefix.every((value, index) => path[index] === value);
}

function renderCheckItem(item, id) {
  return (
    <input
      id={id}
      type="checkbox"
      checked={Boolean(item.checked)}
      disabled={Boolean(item.disabled)}
      readOnly
      tabIndex={-1}
    />
  );
}

function renderIcon(item) {
  if (typeof item.icon === 'string') {
    return <img src={item.icon} alt="" width="16" height="16" />;
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

const Overlay = styled.div``;

const MenuPanel = styled.div`
  position: absolute;
  color: var(--xp-menu-text, #000);
  font-family: "Tahoma", "MS Sans Serif", Arial, sans-serif;
  font-size: 11px;
  outline: none;
`;

const MenuList = styled.ul`
  position: relative;
  min-width: ${MENU_WIDTH}px;
  margin: 0;
  padding: 2px;
  list-style: none;
  background: var(--xp-menu-bg, #fff);
  border: 1px solid #7f9db9;
  box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.35);
`;

const MenuItem = styled.li`
  position: relative;
  min-height: ${MENU_ITEM_HEIGHT}px;
  color: ${({ $disabled }) => ($disabled ? '#808080' : 'inherit')};
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  font-weight: ${({ $bold }) => ($bold ? 'bold' : 'normal')};
  border-bottom: ${({ $divider }) => ($divider ? '1px solid #d4d0c8' : '0')};
  padding-bottom: ${({ $divider }) => ($divider ? '2px' : '0')};
  margin-bottom: ${({ $divider }) => ($divider ? '2px' : '0')};

  ${({ $active, $disabled }) => $active && !$disabled ? `
    background: #316ac5;
    color: #fff;
  ` : ''}
`;

const MenuItemContents = styled.div`
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto 12px;
  align-items: center;
  min-height: ${MENU_ITEM_HEIGHT}px;
  padding: 0 5px 0 2px;
`;

const IconSlot = styled.span`
  width: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  input {
    width: 13px;
    height: 13px;
    margin: 0;
  }
`;

const LabelText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ShortcutText = styled.span`
  margin-left: 18px;
  white-space: nowrap;
`;

const SubmenuArrow = styled.span`
  text-align: right;
  font-size: 9px;
`;

const SubmenuPanel = styled.div`
  position: absolute;
  z-index: 1;
  overflow: visible;
`;

export default ContextMenu;
