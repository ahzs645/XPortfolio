import React, { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';
import { useInstalledApps } from '../../contexts/InstalledAppsContext';
import { useUserAccounts } from '../../contexts/UserAccountsContext';
import { useStartMenu } from '../../contexts/StartMenuContext';
import { isAppDisabled } from '../apps/Installer/disabledApps';
import { withBaseUrl } from '../../utils/baseUrl';
import {
  START_MENU_CATALOG,
  PINNED_LEFT,
  PINNED_RIGHT,
  START_MENU_FOLDERS,
  ALL_PROGRAMS_ORDER,
  getMenuItem,
} from '../config/startMenuConfig';

function getMenuItemOrFolder(key) {
  if (START_MENU_FOLDERS[key]) {
    return { ...START_MENU_FOLDERS[key], key };
  }
  if (START_MENU_CATALOG[key]) {
    return { ...START_MENU_CATALOG[key], key };
  }
  return null;
}

const RECENTLY_USED_ITEMS = [
  { key: 'photoshop', title: 'Adobe Photoshop', icon: '/icons/vanity/photoshop.webp', disabled: true },
  { key: 'premiere', title: 'Adobe Premiere Pro', icon: '/icons/vanity/premiere.webp', disabled: true },
  { key: 'aftereffects', title: 'Adobe After Effects', icon: '/icons/vanity/after-effects.webp', disabled: true },
  { key: 'illustrator', title: 'Adobe Illustrator', icon: '/icons/vanity/illustrator.webp', disabled: true },
  { key: 'figma', title: 'Figma', icon: '/icons/vanity/figma.webp', disabled: true },
  { key: 'vscode', title: 'VS Code', icon: '/icons/vanity/vscode.webp', disabled: true },
  { key: 'blender', title: 'Blender', icon: '/icons/vanity/blender.webp', disabled: true },
  { key: 'davinci', title: 'DaVinci Resolve', icon: '/icons/vanity/davinci.webp', disabled: true },
  { key: 'obs', title: 'OBS Studio', icon: '/icons/vanity/obs.webp', disabled: true },
  { key: 'copilot', title: 'GitHub Copilot', icon: '/icons/vanity/copilot.webp', disabled: true },
];

function FooterMenu({ className, onClick, onLaunchInstalledApp }) {
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [showRecentlyUsed, setShowRecentlyUsed] = useState(false);
  const [showInstalledApps, setShowInstalledApps] = useState(false);
  const { getUsername, getStartMenuIcon } = useConfig();
  const { getInstalledAppsList } = useInstalledApps();
  const { getCurrentUser, isLoggedIn } = useUserAccounts();
  const { menuItems: dynamicMenuItems } = useStartMenu();

  const installedApps = getInstalledAppsList();
  const currentUser = getCurrentUser();
  const userPicture = isLoggedIn && currentUser?.picture ? currentUser.picture : getStartMenuIcon();
  const userName = isLoggedIn && currentUser?.name ? currentUser.name : getUsername();

  function handleItemClick(item) {
    if (item.type === 'folder') {
      setActiveFolder(activeFolder === item.key ? null : item.key);
      return;
    }
    if (item.type === 'openFolder' && item.appKey && item.folderId) {
      onClick(item.appKey, { initialPath: item.folderId });
      return;
    }
    if (item.type === 'externalProject' && item.projectId) {
      onLaunchInstalledApp?.(item.projectId);
      onClick(null);
      return;
    }
    if (item.type === 'program' && item.appKey) {
      onClick(item.appKey);
    }
  }

  function handleAllProgramsHover(isHovering) {
    setShowAllPrograms(isHovering);
    if (!isHovering) {
      setActiveFolder(null);
    }
  }

  const isItemEnabled = (item) => {
    if (item.type === 'separator') return true;
    if (item.type === 'folder') return true;
    if (item.type === 'openFolder') return true;
    if (item.type === 'externalProject') return true;
    if (item.type === 'program' && item.appKey) {
      return !isAppDisabled(item.appKey);
    }
    return true;
  };

  const leftItems = (dynamicMenuItems?.leftItems || PINNED_LEFT.map((key) => ({
    key,
    ...getMenuItem(key),
  }))).filter((item) => item.type && isItemEnabled(item));

  const rightItems = (dynamicMenuItems?.rightItems || PINNED_RIGHT.map((key) => ({
    key,
    ...getMenuItem(key),
  }))).filter((item) => item.type && isItemEnabled(item));

  const allProgramsItems = (dynamicMenuItems?.allProgramsItems || ALL_PROGRAMS_ORDER.map((key) => ({
    key,
    ...getMenuItem(key),
  }))).filter((item) => item.type && isItemEnabled(item));

  const rootClassName = className ? `${className} start-menu xp-start-menu` : 'start-menu xp-start-menu';

  return (
    <div className={rootClassName}>
      <header className="start-menu-header">
        <img className="start-menu-user-avatar" src={userPicture} alt="avatar" />
        <span>{userName}</span>
      </header>

      <section className="start-menu-body">
        <hr className="start-menu-orange-hr" />

        <div className="start-menu-left">
          <div className="start-menu-items">
            {leftItems.map((item, index) =>
              item.type === 'separator' ? (
                <div key={`sep-left-${index}`} className="start-menu-separator" />
              ) : (
                <MenuItem
                  key={item.key}
                  item={item}
                  onClick={() => handleItemClick(item)}
                  emphasize={item.emphasize}
                />
              )
            )}
          </div>

          <div
            className={`start-menu-all-programs ${showAllPrograms ? 'is-open' : ''}`}
            onMouseEnter={() => handleAllProgramsHover(true)}
            onMouseLeave={() => handleAllProgramsHover(false)}
          >
            <div
              className={`start-menu-all-programs-button ${showAllPrograms ? 'active' : ''}`}
              tabIndex={0}
              aria-haspopup="true"
              aria-label="All Programs"
            >
              <span>All Programs</span>
              <div className="start-menu-all-programs-arrow" />
            </div>
            {showAllPrograms && (
              <AllProgramsMenu
                items={allProgramsItems}
                activeFolder={activeFolder}
                onItemClick={handleItemClick}
                onFolderHover={(folder) => setActiveFolder(folder?.key || null)}
              />
            )}
          </div>
        </div>

        <div className="start-menu-right">
          {rightItems.map((item, index) =>
            item.type === 'separator' ? (
              <div key={`sep-right-${index}`} className="start-menu-separator" />
            ) : (
              <MenuItem
                key={item.key}
                item={item}
                onClick={() => handleItemClick(item)}
                emphasize={item.emphasize}
                withArrow={Boolean(item.withArrow)}
              />
            )
          )}

          <div className="start-menu-separator" />

          {installedApps.length > 0 && (
            <div
              className={`start-menu-item with-arrow ${showInstalledApps ? 'active' : ''}`}
              onMouseEnter={() => setShowInstalledApps(true)}
              onMouseLeave={() => setShowInstalledApps(false)}
            >
              <img className="start-menu-item-img" src={withBaseUrl('/icons/xp/Programs.png')} alt="Installed Apps" />
              <div className="start-menu-item-texts">
                <div className="start-menu-item-text">Installed Apps</div>
              </div>
              <span className="start-menu-item-arrow" aria-hidden="true" />
              {showInstalledApps && (
                <InstalledAppsMenu
                  apps={installedApps}
                  onAppClick={(app) => {
                    onLaunchInstalledApp?.(app.id);
                    onClick(null);
                  }}
                />
              )}
            </div>
          )}

          <div
            className={`start-menu-item with-arrow ${showRecentlyUsed ? 'active' : ''}`}
            onMouseEnter={() => setShowRecentlyUsed(true)}
            onMouseLeave={() => setShowRecentlyUsed(false)}
          >
            <img className="start-menu-item-img" src={withBaseUrl('/icons/recently-used.webp')} alt="Recently Used" />
            <div className="start-menu-item-texts">
              <div className="start-menu-item-text">Recently Used</div>
            </div>
            <span className="start-menu-item-arrow" aria-hidden="true" />
            {showRecentlyUsed && <RecentlyUsedMenu items={RECENTLY_USED_ITEMS} />}
          </div>
        </div>
      </section>

      <div className="start-menu-footer">
        <div className="turn-off-dialog start-menu-turn-off-dialog" aria-label="Power actions">
          <button className="turn-off-dialog-item" type="button" onClick={() => onClick('Log Off')}>
            <div className="turn-off-dialog-icon logoff">
              <span className="xp-icon xp-icon-logoff" />
            </div>
            <span>Log Off</span>
          </button>
          <button className="turn-off-dialog-item" type="button" onClick={() => onClick('Turn Off Computer')}>
            <div className="turn-off-dialog-icon power">
              <span className="xp-icon xp-icon-power" />
            </div>
            <span>Turn Off</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ item, onClick, emphasize = false, withArrow = false }) {
  return (
    <div
      className={`start-menu-item ${emphasize ? 'emphasize' : ''} ${withArrow ? 'with-arrow' : ''}`}
      onClick={onClick}
    >
      <img className="start-menu-item-img" src={withBaseUrl(item.icon)} alt={item.title} />
      <div className="start-menu-item-texts">
        <div className="start-menu-item-text">{item.title}</div>
        {item.description && (
          <div className="start-menu-item-description">{item.description}</div>
        )}
      </div>
      {withArrow && <span className="start-menu-item-arrow" aria-hidden="true" />}
    </div>
  );
}

function AllProgramsMenu({ items, activeFolder, onItemClick, onFolderHover }) {
  return (
    <div className="start-menu-submenu all-programs-menu">
      <div className="start-menu-submenu-sidebar" />
      <div className="start-menu-submenu-items" role="menu" aria-label="All Programs">
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <div key={`sep-all-${index}`} className="start-menu-submenu-separator" />;
          }

          if (item.type === 'folder') {
            const folderItems = item.items
              .map((itemKey) => getMenuItemOrFolder(itemKey))
              .filter((subItem) => {
                if (!subItem) return false;
                if (subItem.type === 'program' && subItem.appKey) {
                  return !isAppDisabled(subItem.appKey);
                }
                return true;
              });

            if (folderItems.length === 0) return null;

            return (
              <FolderMenuItem
                key={item.key}
                folder={item}
                isOpen={activeFolder === item.key}
                folderItems={folderItems}
                onHover={() => onFolderHover(item)}
                onLeave={() => onFolderHover(null)}
                onItemClick={onItemClick}
              />
            );
          }

          return (
            <div
              key={item.key}
              className="start-menu-submenu-item"
              role="menuitem"
              tabIndex={0}
              onClick={() => onItemClick(item)}
            >
              <img src={withBaseUrl(item.icon)} alt="" />
              <span>{item.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FolderMenuItem({ folder, isOpen, folderItems, onHover, onLeave, onItemClick }) {
  const itemRef = useRef(null);
  const submenuRef = useRef(null);
  const [submenuOffset, setSubmenuOffset] = useState(0);
  const [activeSubfolder, setActiveSubfolder] = useState(null);

  /* eslint-disable react-hooks/set-state-in-effect -- reset on close + DOM measurement */
  useLayoutEffect(() => {
    if (!isOpen) {
      setSubmenuOffset(0);
      setActiveSubfolder(null);
      return;
    }

    const repositionSubmenu = () => {
      if (!submenuRef.current || !itemRef.current) return;

      const submenuRect = submenuRef.current.getBoundingClientRect();
      const itemRect = itemRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const padding = 8;

      let desiredTop = itemRect.top;

      if (desiredTop + submenuRect.height + padding > viewportHeight) {
        desiredTop = viewportHeight - submenuRect.height - padding;
      }

      if (desiredTop < padding) {
        desiredTop = padding;
      }

      setSubmenuOffset(desiredTop - itemRect.top);
    };

    repositionSubmenu();
    window.addEventListener('resize', repositionSubmenu);

    return () => {
      window.removeEventListener('resize', repositionSubmenu);
    };
  }, [isOpen, folderItems.length]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div
      className={`start-menu-submenu-item start-menu-submenu-item--folder ${isOpen ? 'is-open' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      ref={itemRef}
      role="menuitem"
      tabIndex={0}
    >
      <img src={withBaseUrl(folder.icon)} alt="" />
      <span>{folder.title}</span>
      <span className="start-menu-submenu-item-arrow" aria-hidden="true" />
      {isOpen && (
        <div
          className="start-menu-submenu folder-submenu"
          onMouseEnter={onHover}
          ref={submenuRef}
          style={{ transform: `translateY(${submenuOffset}px)` }}
        >
          <div className="start-menu-submenu-items" role="menu" aria-label={folder.title}>
            {folderItems.map((item) => {
              if (item.type === 'separator') {
                return <div key={`${folder.key}-${item.type}-${item.title || 'separator'}`} className="start-menu-submenu-separator" />;
              }

              if (item.type === 'folder') {
                const nestedItems = item.items
                  .map((itemKey) => getMenuItemOrFolder(itemKey))
                  .filter((subItem) => {
                    if (!subItem) return false;
                    if (subItem.type === 'program' && subItem.appKey) {
                      return !isAppDisabled(subItem.appKey);
                    }
                    return true;
                  });

                if (nestedItems.length === 0) return null;

                return (
                  <NestedFolderItem
                    key={item.key}
                    folder={item}
                    isOpen={activeSubfolder === item.key}
                    folderItems={nestedItems}
                    onHover={() => setActiveSubfolder(item.key)}
                    onLeave={() => setActiveSubfolder(null)}
                    onItemClick={onItemClick}
                  />
                );
              }

              return (
                <div
                  key={item.key}
                  className="start-menu-submenu-item"
                  role="menuitem"
                  tabIndex={0}
                  onClick={() => onItemClick(item)}
                >
                  <img src={withBaseUrl(item.icon)} alt="" />
                  <span>{item.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function NestedFolderItem({ folder, isOpen, folderItems, onHover, onLeave, onItemClick }) {
  const itemRef = useRef(null);
  const submenuRef = useRef(null);
  const [submenuOffset, setSubmenuOffset] = useState(0);

  /* eslint-disable react-hooks/set-state-in-effect -- reset on close + DOM measurement */
  useLayoutEffect(() => {
    if (!isOpen) {
      setSubmenuOffset(0);
      return;
    }

    const repositionSubmenu = () => {
      if (!submenuRef.current || !itemRef.current) return;

      const submenuRect = submenuRef.current.getBoundingClientRect();
      const itemRect = itemRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const padding = 8;

      let desiredTop = itemRect.top;

      if (desiredTop + submenuRect.height + padding > viewportHeight) {
        desiredTop = viewportHeight - submenuRect.height - padding;
      }

      if (desiredTop < padding) {
        desiredTop = padding;
      }

      setSubmenuOffset(desiredTop - itemRect.top);
    };

    repositionSubmenu();
    window.addEventListener('resize', repositionSubmenu);

    return () => {
      window.removeEventListener('resize', repositionSubmenu);
    };
  }, [isOpen, folderItems.length]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div
      className={`start-menu-submenu-item nested-folder ${isOpen ? 'is-open' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      ref={itemRef}
      role="menuitem"
      tabIndex={0}
    >
      <img src={withBaseUrl(folder.icon)} alt="" />
      <span>{folder.title}</span>
      <span className="start-menu-submenu-item-arrow" aria-hidden="true" />
      {isOpen && (
        <div
          className="start-menu-submenu nested-submenu"
          onMouseEnter={onHover}
          ref={submenuRef}
          style={{ transform: `translateY(${submenuOffset}px)` }}
        >
          <div className="start-menu-submenu-items" role="menu" aria-label={folder.title}>
            {folderItems.map((item) => (
              <div
                key={item.key}
                className="start-menu-submenu-item"
                role="menuitem"
                tabIndex={0}
                onClick={() => onItemClick(item)}
              >
                <img src={withBaseUrl(item.icon)} alt="" />
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecentlyUsedMenu({ items }) {
  return (
    <div className="start-menu-submenu recently-used-menu">
      <div className="start-menu-submenu-sidebar" />
      <div className="start-menu-submenu-items" role="menu" aria-label="Recently Used">
        {items.map((item) => (
          <div
            key={item.key}
            className={`start-menu-submenu-item ${item.disabled ? 'disabled' : ''}`}
            role="menuitem"
            tabIndex={item.disabled ? -1 : 0}
          >
            <img src={withBaseUrl(item.icon)} alt="" />
            <span>{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InstalledAppsMenu({ apps, onAppClick }) {
  return (
    <div className="start-menu-submenu installed-apps-menu">
      <div className="start-menu-submenu-sidebar" />
      <div className="start-menu-submenu-items" role="menu" aria-label="Installed Apps">
        {apps.map((app) => (
          <div
            key={app.id}
            className="start-menu-submenu-item"
            role="menuitem"
            tabIndex={0}
            onClick={() => onAppClick(app)}
          >
            <img
              src={withBaseUrl(app.icon || '/icons/xp/Programs.png')}
              alt=""
              onError={(e) => { e.target.src = withBaseUrl('/icons/xp/Programs.png'); }}
            />
            <span>{app.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default styled(FooterMenu)`
  .start-menu-user-avatar {
    object-fit: cover;
    background: transparent;
  }

  .start-menu-right > .start-menu-item {
    min-height: 30px;
  }

  .start-menu-all-programs-button.active,
  .start-menu-item.active {
    background-color: #316ac5;
    color: #fff;
  }

  .start-menu-item.active .start-menu-item-text,
  .start-menu-item.active .start-menu-item-description {
    color: #fff;
  }

  .all-programs-menu,
  .recently-used-menu,
  .installed-apps-menu,
  .folder-submenu,
  .nested-submenu {
    display: block;
    overflow: visible;
  }

  .all-programs-menu {
    bottom: 0;
    top: auto;
  }

  .recently-used-menu,
  .installed-apps-menu,
  .folder-submenu,
  .nested-submenu {
    top: 0;
  }

  .start-menu-submenu-items {
    display: flex;
    flex-direction: column;
  }

  .start-menu-submenu-item.disabled {
    color: #7d7d7d;
    pointer-events: none;
  }

  .start-menu-submenu-item--folder,
  .nested-folder {
    padding-right: 22px;
  }

  .start-menu-submenu-item--folder > .start-menu-submenu,
  .nested-folder > .start-menu-submenu {
    left: 100%;
    top: 0;
  }

  .start-menu-submenu-item--folder:hover > .start-menu-submenu,
  .start-menu-submenu-item--folder.is-open > .start-menu-submenu,
  .nested-folder:hover > .start-menu-submenu,
  .nested-folder.is-open > .start-menu-submenu {
    display: block;
  }

  .start-menu-turn-off-dialog .turn-off-dialog-item {
    background: transparent;
    border: none;
  }
`;
