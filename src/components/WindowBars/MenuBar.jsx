import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

/**
 * MenuBar Component - Windows XP style menu bar
 *
 * @param {Object} props
 * @param {Array} props.menus - Array of menu configurations
 *   Each menu: { id: string, label: string, disabled?: boolean, items: MenuItemConfig[] }
 *   MenuItemConfig: { label: string, action?: string, disabled?: boolean, separator?: boolean }
 * @param {string} props.logo - Optional logo image path (displays on right side)
 * @param {Function} props.onAction - Callback when menu item is clicked: (action, menuId) => void
 * @param {Object} props.windowActions - Object with window control functions { onClose, onMinimize, onMaximize }
 *
 * @example
 * <MenuBar
 *   menus={[
 *     { id: 'file', label: 'File', items: [
 *       { label: 'Print', disabled: true },
 *       { separator: true },
 *       { label: 'Exit', action: 'exitProgram' }
 *     ]},
 *     { id: 'view', label: 'View', items: [
 *       { label: 'Maximize', action: 'maximizeWindow' },
 *       { label: 'Minimize', action: 'minimizeWindow' }
 *     ]}
 *   ]}
 *   logo="/gui/toolbar/barlogo.webp"
 *   onAction={(action) => console.log(action)}
 *   windowActions={{ onClose, onMinimize, onMaximize }}
 * />
 */
function MenuBar({ menus = [], logo, onAction, windowActions = {} }) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0, top: 0 });
  const [overflowMenuOpen, setOverflowMenuOpen] = useState(false);
  const [hiddenMenuIds, setHiddenMenuIds] = useState([]);
  const [overflowDropdownPos, setOverflowDropdownPos] = useState({ top: 0, left: 0 });
  const menuBarRef = useRef(null);
  const menuItemRefs = useRef({});
  const chevronRef = useRef(null);
  const itemWidthsRef = useRef({}); // Cache item widths to avoid flickering
  const lastWidthRef = useRef(0);
  const hiddenMenuIdsRef = useRef([]); // Track hidden items without causing re-renders

  // Calculate which menu items overflow - using ref to avoid re-render loops
  const calculateOverflow = useCallback(() => {
    if (!menuBarRef.current) return;

    const container = menuBarRef.current;
    const containerWidth = container.offsetWidth;
    const logoWidth = logo ? 40 : 0;
    const chevronWidth = 24; // Width of chevron button
    const padding = 8; // Right padding
    const availableWidth = containerWidth - logoWidth - padding;

    // Measure and cache item widths (only if not already cached or if visible)
    menus.forEach((menu) => {
      const menuEl = menuItemRefs.current[menu.id];
      if (menuEl) {
        const currentWidth = menuEl.offsetWidth;
        // Only update cache if item is visible (has width > 0)
        if (currentWidth > 0) {
          itemWidthsRef.current[menu.id] = currentWidth;
        }
      }
    });

    let totalWidth = 0;
    const hidden = [];

    // Calculate total width using cached widths
    menus.forEach((menu) => {
      totalWidth += itemWidthsRef.current[menu.id] || 0;
    });

    const needsChevron = totalWidth > availableWidth;
    const effectiveWidth = needsChevron ? availableWidth - chevronWidth : availableWidth;

    // Determine which items to hide using cached widths
    let usedWidth = 0;
    menus.forEach((menu) => {
      const itemWidth = itemWidthsRef.current[menu.id] || 0;
      if (usedWidth + itemWidth > effectiveWidth) {
        hidden.push(menu.id);
      } else {
        usedWidth += itemWidth;
      }
    });

    // Only update state if hidden items actually changed
    const prevHidden = hiddenMenuIdsRef.current;
    const hasChanged = prevHidden.length !== hidden.length || !prevHidden.every((id, i) => id === hidden[i]);

    if (hasChanged) {
      hiddenMenuIdsRef.current = hidden;
      setHiddenMenuIds(hidden);
    }
  }, [menus, logo]);

  // Recalculate on resize - only observe, don't depend on calculateOverflow
  useLayoutEffect(() => {
    let rafId = null;

    const doCalculate = () => {
      if (!menuBarRef.current) return;
      const currentWidth = menuBarRef.current.offsetWidth;
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
      if (menuBarRef.current) {
        lastWidthRef.current = menuBarRef.current.offsetWidth;
      }
      calculateOverflow();
    }, 0);

    const resizeObserver = new ResizeObserver(debouncedCalculate);

    if (menuBarRef.current) {
      resizeObserver.observe(menuBarRef.current);
    }

    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menus, logo]); // Only re-run when menus or logo change, not calculateOverflow

  // Handle clicking/touching outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setActiveMenu(null);
        setOverflowMenuOpen(false);
      }
    };

    if (activeMenu || overflowMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [activeMenu, overflowMenuOpen]);

  const handleMenuClick = useCallback((menuId, disabled) => {
    if (disabled) return;

    if (activeMenu === menuId) {
      setActiveMenu(null);
    } else {
      const menuElement = menuItemRefs.current[menuId];
      if (menuElement) {
        const rect = menuElement.getBoundingClientRect();
        const menuBarRect = menuBarRef.current.getBoundingClientRect();
        setDropdownPosition({
          left: rect.left - menuBarRect.left,
          top: rect.height + 1
        });
      }
      setActiveMenu(menuId);
    }
  }, [activeMenu]);

  const handleMenuHover = useCallback((menuId, disabled) => {
    if (activeMenu && !disabled) {
      const menuElement = menuItemRefs.current[menuId];
      if (menuElement) {
        const rect = menuElement.getBoundingClientRect();
        const menuBarRect = menuBarRef.current.getBoundingClientRect();
        setDropdownPosition({
          left: rect.left - menuBarRect.left,
          top: rect.height + 1
        });
      }
      setActiveMenu(menuId);
    }
  }, [activeMenu]);

  const handleItemClick = useCallback((action, disabled) => {
    if (disabled || !action) return;

    // Handle built-in window actions
    if (action === 'exitProgram' && windowActions.onClose) {
      windowActions.onClose();
    } else if (action === 'maximizeWindow' && windowActions.onMaximize) {
      windowActions.onMaximize();
    } else if (action === 'minimizeWindow' && windowActions.onMinimize) {
      windowActions.onMinimize();
    } else if (onAction) {
      onAction(action);
    }

    setActiveMenu(null);
  }, [onAction, windowActions]);

  // Touch handler for menu items (prevents double-firing on touch devices)
  const handleMenuTouchEnd = useCallback((e, menuId, disabled) => {
    e.preventDefault();
    handleMenuClick(menuId, disabled);
  }, [handleMenuClick]);

  // Touch handler for dropdown options
  const handleItemTouchEnd = useCallback((e, action, disabled) => {
    e.preventDefault();
    handleItemClick(action, disabled);
  }, [handleItemClick]);

  // Handle chevron click to show overflow menu
  const handleChevronClick = useCallback(() => {
    setActiveMenu(null);
    if (!overflowMenuOpen && chevronRef.current) {
      const rect = chevronRef.current.getBoundingClientRect();
      setOverflowDropdownPos({
        top: rect.bottom,
        left: rect.right - 120, // 120 is min-width of dropdown, align right edge
      });
    }
    setOverflowMenuOpen(!overflowMenuOpen);
  }, [overflowMenuOpen]);

  // Handle clicking a hidden menu item from overflow dropdown
  const handleOverflowMenuClick = useCallback((menuId, disabled) => {
    if (disabled) return;
    setOverflowMenuOpen(false);
    // Open the submenu for this item
    handleMenuClick(menuId, disabled);
  }, [handleMenuClick]);

  const activeMenuData = menus.find(m => m.id === activeMenu);
  const hiddenMenus = menus.filter(m => hiddenMenuIds.includes(m.id));
  const hasOverflow = hiddenMenuIds.length > 0;

  return (
    <MenuBarContainer ref={menuBarRef}>
      <MenuBarInner>
        {menus.map((menu) => (
          <MenuItem
            key={menu.id}
            ref={(el) => menuItemRefs.current[menu.id] = el}
            className={`${menu.disabled ? 'disabled' : ''} ${activeMenu === menu.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(menu.id, menu.disabled)}
            onMouseEnter={() => handleMenuHover(menu.id, menu.disabled)}
            onTouchEnd={(e) => handleMenuTouchEnd(e, menu.id, menu.disabled)}
            $hidden={hiddenMenuIds.includes(menu.id)}
          >
            {menu.label}
          </MenuItem>
        ))}
        {hasOverflow && (
          <ChevronButton
            ref={chevronRef}
            onClick={handleChevronClick}
            className={overflowMenuOpen ? 'active' : ''}
          >
            »
          </ChevronButton>
        )}
        {logo && <MenuBarLogo src={logo} alt="Logo" />}
      </MenuBarInner>

      {activeMenu && activeMenuData && (
        <DropdownMenu style={{ left: dropdownPosition.left, top: dropdownPosition.top }}>
          {activeMenuData.items.map((item, index) => (
            item.separator ? (
              <MenuSeparator key={`sep-${index}`} />
            ) : (
              <MenuOption
                key={item.label || index}
                className={item.disabled ? 'disabled' : ''}
                onClick={() => handleItemClick(item.action, item.disabled)}
                onTouchEnd={(e) => handleItemTouchEnd(e, item.action, item.disabled)}
              >
                {item.label}
              </MenuOption>
            )
          ))}
        </DropdownMenu>
      )}

      {overflowMenuOpen && hasOverflow && createPortal(
        <OverflowDropdown style={{ top: overflowDropdownPos.top, left: overflowDropdownPos.left }}>
          {hiddenMenus.map((menu) => (
            <MenuOption
              key={menu.id}
              className={menu.disabled ? 'disabled' : ''}
              onClick={() => handleOverflowMenuClick(menu.id, menu.disabled)}
            >
              {menu.label}
            </MenuOption>
          ))}
        </OverflowDropdown>,
        document.body
      )}
    </MenuBarContainer>
  );
}

const MenuBarContainer = styled.div`
  background: #e9e9e9;
  box-sizing: border-box;
  width: 100%;
  z-index: 30;
  position: relative;
`;

const MenuBarInner = styled.div`
  align-items: center;
  background: #e9e9e9;
  border-bottom: 2px solid #e0e0e0;
  box-sizing: border-box;
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  height: 22px;
  max-height: 22px;
  min-height: 22px;
  overflow: hidden;
  padding: 0 8px 0 0;
  position: relative;
  user-select: none;
`;

const MenuItem = styled.div`
  align-items: center;
  display: ${({ $hidden }) => $hidden ? 'none' : 'flex'};
  flex: 1 1 0;
  height: 100%;
  justify-content: center;
  max-width: fit-content;
  padding: 0 12px;
  text-align: center;
  cursor: default;
  touch-action: manipulation;

  &.active,
  &:not(.disabled):hover {
    background: #0a6fc2;
    color: #fff;
  }

  &.disabled {
    color: #bcbcbc;
    cursor: default;
  }

  &.disabled:hover {
    background: none;
    border: none;
    box-shadow: none;
    color: #bcbcbc;
    outline: none;
  }
`;

const ChevronButton = styled.div`
  align-items: flex-start;
  cursor: default;
  display: flex;
  font-weight: bold;
  height: 100%;
  justify-content: center;
  padding: 2px 6px 0;
  touch-action: manipulation;
  user-select: none;

  &:hover,
  &.active {
    background: #0a6fc2;
    color: #fff;
  }
`;

const OverflowDropdown = styled.div`
  background: #f2f2f2;
  border: 1px solid #d0d0d0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  min-width: 120px;
  padding: 2px 0;
  position: fixed;
  z-index: 99999;
`;

const MenuBarLogo = styled.img`
  background: none;
  border-radius: 0;
  display: block;
  height: 100%;
  margin-left: 0;
  object-fit: contain;
  position: absolute;
  right: 0;
  top: 0;
  width: 40px;
  z-index: 2;
`;

const DropdownMenu = styled.div`
  background: #f2f2f2;
  border: 1px solid #d0d0d0;
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  font-family: Tahoma, Arial, sans-serif;
  font-size: 11px;
  margin-top: 1px;
  padding: 2px 0;
  position: absolute;
  min-width: 160px;
  z-index: 99999;
`;

const MenuOption = styled.div`
  background: none;
  border: none;
  box-sizing: border-box;
  display: block;
  font-family: inherit;
  font-size: inherit;
  padding: 2px 10px 2px 24px;
  text-align: left;
  transition: background 0.13s;
  white-space: nowrap;
  width: 100%;
  cursor: default;
  touch-action: manipulation;

  &:hover:not(.disabled) {
    background: #0a6fc2;
    color: #fff;
  }

  &.disabled {
    color: #bcbcbc;
  }
`;

const MenuSeparator = styled.div`
  border-top: 1px solid #e0e0e0;
  height: 0;
  margin: 2px 0;
`;

export default MenuBar;
