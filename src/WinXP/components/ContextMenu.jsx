import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
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

const MENU_WIDTH = 200;
const MENU_ITEM_HEIGHT = 24;
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
  const itemRefs = useRef(new Map());
  const closeTimerRef = useRef(null);
  const openTimerRef = useRef(null);
  const mouseTrailRef = useRef([]);
  const [adjustedPosition, setAdjustedPosition] = useState(() => toDisplayLayerPoint(position));
  const [activePath, setActivePath] = useState([]);
  // [0] highlights the first item on open; null === mouse took over (only :hover highlights).
  const [keyboardPath, setKeyboardPath] = useState([0]);
  const renderableItems = useMemo(() => getRenderableItems(items), [items]);

  const registerItemRef = useCallback((key, node) => {
    if (node) itemRefs.current.set(key, node);
    else itemRefs.current.delete(key);
  }, []);

  // When the menu opens at a new location, reset navigation state so the first item
  // is highlighted (like the real XP menu). Keyed on coordinates rather than the
  // `position` object identity, which is recreated on every parent render. This is the
  // recommended "adjust state during render" pattern (avoids an extra effect pass).
  const positionKey = position ? `${position.x},${position.y}` : '';
  const prevPositionKeyRef = useRef(positionKey);
  if (prevPositionKeyRef.current !== positionKey) {
    prevPositionKeyRef.current = positionKey;
    setKeyboardPath([0]);
    setActivePath([]);
  }

  // Drive the XPandeder :focus/:focus-within highlight to match keyboard navigation.
  useEffect(() => {
    if (keyboardPath === null) return;
    const node = itemRefs.current.get(keyboardPath.join('-'));
    node?.focus({ preventScroll: true });
  }, [keyboardPath]);

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

  // Mouse takes over: relinquish keyboard focus so only the hovered item highlights.
  const handlePointerEnterMenu = useCallback(() => {
    setKeyboardPath((prev) => {
      if (prev === null) return prev;
      menuRef.current?.focus({ preventScroll: true });
      return null;
    });
  }, []);

  if (!position || !items?.length) return null;

  const updateActivePath = (path, hasItemSubmenu, event) => {
    clearTimeout(closeTimerRef.current);
    clearTimeout(openTimerRef.current);

    if (hasItemSubmenu) {
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

    if (event.key === 'Escape') {
      event.preventDefault();
      onClose?.();
      return;
    }

    const navKeys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Enter', ' '];
    if (!navKeys.includes(event.key)) return;

    const justActivated = keyboardPath === null;
    const basePath = keyboardPath ?? activePath ?? [];
    const context = getKeyboardContext(renderableItems, basePath, activePath);
    if (!context.items.length) return;

    // First navigation keypress just highlights the first/last enabled item.
    if (justActivated && event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowUp' ? -1 : 1;
      const startIndex = direction === 1
        ? getNextEnabledIndex(context.items, -1, 1)
        : getNextEnabledIndex(context.items, 0, -1);
      setActivePath(context.parentPath);
      setKeyboardPath([...context.parentPath, startIndex]);
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const nextIndex = getNextEnabledIndex(context.items, context.index, direction);
      setActivePath(context.parentPath);
      setKeyboardPath([...context.parentPath, nextIndex]);
      return;
    }

    const current = context.items[context.index]?.item;
    if (!current) return;

    if (event.key === 'ArrowRight' && hasSubmenu(current)) {
      event.preventDefault();
      const nextIndex = getNextEnabledIndex(getRenderableItems(current.submenu), -1, 1);
      const parentPath = [...context.parentPath, context.index];
      setActivePath(parentPath);
      setKeyboardPath([...parentPath, nextIndex]);
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
        const parentPath = [...context.parentPath, context.index];
        setActivePath(parentPath);
        setKeyboardPath([...parentPath, nextIndex]);
      } else {
        handleSelect(current);
      }
    }
  };

  const menuContent = (
    <Overlay style={getOverlayStyle(overlayType, zIndex)} onMouseDown={onClose}>
      <MenuRoot
        ref={menuRef}
        style={{ left: adjustedPosition.x, top: adjustedPosition.y }}
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
          registerItemRef={registerItemRef}
          onHover={updateActivePath}
          onPointerEnter={handlePointerEnterMenu}
          onSelect={handleSelect}
        />
      </MenuRoot>
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
  registerItemRef,
  onHover,
  onPointerEnter,
  onSelect,
  style,
}) {
  return (
    <ul role="menu" style={{ width: MENU_WIDTH, ...style }}>
      {items.map(({ item, hasDivider }, idx) => {
        const itemPath = [...path, idx];
        const itemPathKey = itemPath.join('-');
        const submenu = getRenderableItems(item.submenu);
        const itemHasSubmenu = !item.disabled && submenu.length > 0;
        const isActive = pathStartsWith(activePath, itemPath);
        const isCheckable = item.checked !== undefined;
        const key = item.key || `${item.label || 'item'}-${itemPathKey}`;
        const className = [item.bold && 'bold', hasDivider && 'has-divider']
          .filter(Boolean)
          .join(' ');
        const checkId = `${menuId}-check-${itemPathKey}`;

        return (
          <li
            key={key}
            role="menuitem"
            className={className || undefined}
            tabIndex={item.disabled ? undefined : 0}
            aria-disabled={item.disabled ? 'true' : undefined}
            aria-haspopup={itemHasSubmenu ? 'true' : undefined}
            ref={(node) => registerItemRef(itemPathKey, node)}
            onMouseEnter={(event) => {
              onPointerEnter();
              onHover(itemPath, itemHasSubmenu, event);
            }}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(item);
            }}
            title={item.title}
          >
            {isCheckable ? (
              <>
                <input
                  id={checkId}
                  type="checkbox"
                  checked={Boolean(item.checked)}
                  disabled={Boolean(item.disabled)}
                  readOnly
                  tabIndex={-1}
                />
                <label htmlFor={checkId}>{item.label}</label>
              </>
            ) : (
              <>
                {typeof item.icon === 'string' ? (
                  <img src={item.icon} alt="" width="16" height="16" />
                ) : null}
                {item.label}
              </>
            )}
            {item.shortcut ? <span>{item.shortcut}</span> : null}
            {itemHasSubmenu && isActive ? (
              <MenuLevel
                items={submenu}
                menuId={menuId}
                path={itemPath}
                rootPosition={rootPosition}
                activePath={activePath}
                registerItemRef={registerItemRef}
                onHover={onHover}
                onPointerEnter={onPointerEnter}
                onSelect={onSelect}
                style={getSubmenuStyle(itemPath, rootPosition, submenu.length)}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
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

function getSubmenuStyle(path, rootPosition, itemCount) {
  const viewport = getDisplayViewport();
  const depth = path.length;
  const estimatedHeight = Math.max(1, itemCount) * MENU_ITEM_HEIGHT + 8;
  const absoluteTop = rootPosition.y + path.reduce((sum, index) => sum + index * MENU_ITEM_HEIGHT, 0);
  const right = rootPosition.x + MENU_WIDTH * depth + MENU_WIDTH;
  const openLeft = right > viewport.width - 6;
  const overflowBottom = Math.max(0, absoluteTop + estimatedHeight - viewport.height + 6);

  return {
    display: 'block',
    position: 'absolute',
    left: openLeft ? -MENU_WIDTH + 6 : 'calc(100% - 3px)',
    top: -overflowBottom,
    transform: 'none',
    width: MENU_WIDTH,
    maxHeight: Math.min(estimatedHeight, viewport.height - 12),
    overflowY: estimatedHeight > viewport.height - 12 ? 'auto' : 'visible',
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

function pathStartsWith(path = [], prefix = []) {
  return prefix.length > 0 && prefix.every((value, index) => path[index] === value);
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

const MenuRoot = styled.div`
  position: absolute;
  outline: none;
  font-family: Arial, "MS Sans Serif", sans-serif;
  font-size: 12px;
  color: #222;
`;

export default ContextMenu;
