import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const menuBarRef = useRef(null);
  const menuItemRefs = useRef({});

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenu]);

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

  const activeMenuData = menus.find(m => m.id === activeMenu);

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
          >
            {menu.label}
          </MenuItem>
        ))}
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
              >
                {item.label}
              </MenuOption>
            )
          ))}
        </DropdownMenu>
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
  display: flex;
  flex: 1 1 0;
  height: 100%;
  justify-content: center;
  max-width: fit-content;
  padding: 0 12px;
  text-align: center;
  cursor: default;

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
