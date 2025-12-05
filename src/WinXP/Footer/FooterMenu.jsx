import React, { useState } from 'react';
import styled from 'styled-components';
import { useConfig } from '../../contexts/ConfigContext';
import { useInstalledApps } from '../../contexts/InstalledAppsContext';
import { isAppDisabled } from '../apps/Installer';
import {
  START_MENU_CATALOG,
  PINNED_LEFT,
  PINNED_RIGHT,
  START_MENU_FOLDERS,
  ALL_PROGRAMS_ORDER,
  getMenuItem,
} from '../config/startMenuConfig';

// Vanity "Recently Used" items - disabled software icons for visual effect
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
  const { getDisplayName, getStartMenuIcon } = useConfig();
  const { getInstalledAppsList } = useInstalledApps();

  const installedApps = getInstalledAppsList();

  function handleItemClick(item) {
    if (item.type === 'folder') {
      setActiveFolder(activeFolder === item.key ? null : item.key);
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

  // Helper to check if an item should be shown (not disabled)
  const isItemEnabled = (item) => {
    if (item.type === 'separator') return true;
    if (item.type === 'folder') return true; // Folders are always shown
    if (item.type === 'program' && item.appKey) {
      return !isAppDisabled(item.appKey);
    }
    return true;
  };

  // Build left column items (filter out disabled apps)
  const leftItems = PINNED_LEFT.map((key) => ({
    key,
    ...getMenuItem(key),
  })).filter((item) => item.type && isItemEnabled(item));

  // Build right column items (filter out disabled apps)
  const rightItems = PINNED_RIGHT.map((key) => ({
    key,
    ...getMenuItem(key),
  })).filter((item) => item.type && isItemEnabled(item));

  // Build all programs items (filter out disabled apps)
  const allProgramsItems = ALL_PROGRAMS_ORDER.map((key) => ({
    key,
    ...getMenuItem(key),
  })).filter((item) => item.type && isItemEnabled(item));

  return (
    <div className={className}>
      <header>
        <img className="header__img" src={getStartMenuIcon()} alt="avatar" />
        <span className="header__text">{getDisplayName()}</span>
      </header>
      <section className="menu">
        <hr className="orange-hr" />
        <div className="menu__left">
          <div className="menu__items">
            {leftItems.map((item, index) =>
              item.type === 'separator' ? (
                <div key={`sep-left-${index}`} className="menu__separator" />
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
            className="all-programs-container"
            onMouseEnter={() => handleAllProgramsHover(true)}
            onMouseLeave={() => handleAllProgramsHover(false)}
          >
            <div className={`all-programs-button ${showAllPrograms ? 'active' : ''}`}>
              <span>All Programs</span>
              <img src="/icons/arrow.webp" alt="" />
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
        <div className="menu__right">
          {rightItems.map((item, index) =>
            item.type === 'separator' ? (
              <div key={`sep-right-${index}`} className="menu__separator" />
            ) : (
              <MenuItem
                key={item.key}
                item={item}
                onClick={() => handleItemClick(item)}
              />
            )
          )}
          <div className="menu__separator" />
          {installedApps.length > 0 && (
            <div
              className="installed-apps-container"
              onMouseEnter={() => setShowInstalledApps(true)}
              onMouseLeave={() => setShowInstalledApps(false)}
            >
              <div className={`menu__item menu__item--with-arrow ${showInstalledApps ? 'active' : ''}`}>
                <img className="menu__item__img" src="/icons/xp/Programs.png" alt="Installed Apps" />
                <div className="menu__item__texts">
                  <div className="menu__item__text">Installed Apps</div>
                </div>
                <span className="menu__item__arrow">►</span>
              </div>
              {showInstalledApps && (
                <InstalledAppsMenu
                  apps={installedApps}
                  onAppClick={(app) => {
                    if (onLaunchInstalledApp) {
                      onLaunchInstalledApp(app.id);
                    }
                  }}
                />
              )}
            </div>
          )}
          <div
            className="recently-used-container"
            onMouseEnter={() => setShowRecentlyUsed(true)}
            onMouseLeave={() => setShowRecentlyUsed(false)}
          >
            <div className={`menu__item menu__item--with-arrow ${showRecentlyUsed ? 'active' : ''}`}>
              <img className="menu__item__img" src="/icons/recently-used.webp" alt="Recently Used" />
              <div className="menu__item__texts">
                <div className="menu__item__text">Recently Used</div>
              </div>
              <span className="menu__item__arrow">►</span>
            </div>
            {showRecentlyUsed && (
              <RecentlyUsedMenu items={RECENTLY_USED_ITEMS} />
            )}
          </div>
        </div>
      </section>
      <footer>
        <div className="footer-buttons">
          <div className="footer-button" onClick={() => onClick('Log Off')}>
            <img src="/icons/logoff.webp" alt="Log Off" />
            <span>Log Off</span>
          </div>
          <div className="footer-button" onClick={() => onClick('Turn Off Computer')}>
            <img src="/icons/shutdown.webp" alt="Turn Off" />
            <span>Turn Off</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MenuItem({ item, onClick, emphasize = false }) {
  return (
    <div
      className={`menu__item ${emphasize ? 'menu__item--emphasize' : ''}`}
      onClick={onClick}
    >
      <img className="menu__item__img" src={item.icon} alt={item.title} />
      <div className="menu__item__texts">
        <div className="menu__item__text">{item.title}</div>
        {item.description && (
          <div className="menu__item__description">{item.description}</div>
        )}
      </div>
    </div>
  );
}

function AllProgramsMenu({ items, activeFolder, onItemClick, onFolderHover }) {
  return (
    <div className="all-programs-menu">
      <div className="all-programs-sidebar" />
      <ul className="all-programs-items">
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <li key={`sep-all-${index}`} className="all-programs-separator" />;
          }
          if (item.type === 'folder') {
            // Filter out disabled apps from folder items
            const folderItems = item.items
              .map((itemKey) => ({
                key: itemKey,
                ...START_MENU_CATALOG[itemKey],
              }))
              .filter((subItem) => {
                if (subItem.type === 'program' && subItem.appKey) {
                  return !isAppDisabled(subItem.appKey);
                }
                return true;
              });

            // Don't show empty folders
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
            <li
              key={item.key}
              className="all-programs-item"
              onClick={() => onItemClick(item)}
            >
              <img src={item.icon} alt="" />
              <span>{item.title}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FolderMenuItem({ folder, isOpen, folderItems, onHover, onLeave, onItemClick }) {
  return (
    <li
      className={`all-programs-item folder ${isOpen ? 'active' : ''}`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <img src={folder.icon} alt="" />
      <span>{folder.title}</span>
      {isOpen && (
        <div
          className="folder-submenu"
          onMouseEnter={onHover}
        >
          {folderItems.map((item) => (
            <div
              key={item.key}
              className="folder-submenu-item"
              onClick={() => onItemClick(item)}
            >
              <img src={item.icon} alt="" />
              <span>{item.title}</span>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

function RecentlyUsedMenu({ items }) {
  return (
    <div className="recently-used-menu">
      <div className="recently-used-sidebar" />
      <ul className="recently-used-items">
        {items.map((item) => (
          <li
            key={item.key}
            className={`recently-used-item ${item.disabled ? 'disabled' : ''}`}
          >
            <img src={item.icon} alt="" />
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InstalledAppsMenu({ apps, onAppClick }) {
  return (
    <div className="installed-apps-menu">
      <div className="installed-apps-sidebar" />
      <ul className="installed-apps-items">
        {apps.map((app) => (
          <li
            key={app.id}
            className="installed-apps-item"
            onClick={() => onAppClick(app)}
          >
            <img src={app.icon || '/icons/xp/Programs.png'} alt="" onError={(e) => { e.target.src = '/icons/xp/Programs.png'; }} />
            <span>{app.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default styled(FooterMenu)`
  font-size: 11px;
  line-height: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #4282d6;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  width: 335px;

  header {
    position: relative;
    align-self: flex-start;
    display: flex;
    align-items: center;
    color: #fff;
    height: 54px;
    padding: 6px 5px 5px;
    width: 100%;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    background: linear-gradient(
      to bottom,
      #1868ce 0%,
      #0e60cb 12%,
      #0e60cb 20%,
      #1164cf 32%,
      #1667cf 33%,
      #1b6cd3 47%,
      #1e70d9 54%,
      #2476dc 60%,
      #297ae0 65%,
      #3482e3 77%,
      #3786e5 79%,
      #428ee9 90%,
      #4791eb 100%
    );
    overflow: hidden;
  }

  header:before {
    content: '';
    display: block;
    position: absolute;
    top: 1px;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(
      to right,
      transparent 0,
      rgb(255, 255, 255, 0.3) 1%,
      rgb(255, 255, 255, 0.5) 2%,
      rgb(255, 255, 255, 0.5) 95%,
      rgb(255, 255, 255, 0.3) 98%,
      rgb(255, 255, 255, 0.2) 99%,
      transparent 100%
    );
    box-shadow: inset 0 -1px 1px #0e60cb;
  }

  .header__img {
    width: 40px;
    height: 40px;
    margin: 0 8px;
    border-radius: 3px;
    border: 2px solid hsla(0, 0%, 100%, 0.7);
    box-shadow: 0 0 0 1px rgba(0, 95, 184, 0.6), inset 0 0 2px 1px hsla(0, 0%, 100%, 0.35);
  }

  .header__text {
    font-size: 14px;
    font-weight: 700;
    text-shadow: 1px 1px rgba(0, 0, 0, 0.7);
  }

  /* Footer */
  footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    color: #fff;
    height: 36px;
    width: 100%;
    position: relative;
    background: #0f61cb;
    border-top: 1px solid rgba(0, 0, 0, 0.3);
    box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.2);
  }

  footer:before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      #428ee9 0%,
      #3786e5 10%,
      #3482e3 21%,
      #297ae0 35%,
      #2476dc 40%,
      #1e70d9 46%,
      #1b6cd3 53%,
      #1667cf 67%,
      #1164cf 68%,
      #0e60cb 80%,
      #0e60cb 88%,
      #1868ce 100%
    );
    z-index: 0;
  }

  .footer-buttons {
    display: flex;
    align-items: center;
    height: 100%;
    padding-right: 4px;
    position: relative;
    z-index: 1;
  }

  .footer-button {
    display: inline-flex;
    align-items: center;
    color: #fff;
    font-size: 11px;
    cursor: pointer;
    padding: 0;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);
  }

  .footer-button img {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    transition: filter 0.1s ease;
  }

  .footer-button span {
    padding: 0 6px;
  }

  .footer-button:hover img {
    filter: brightness(1.3);
  }

  /* Menu */
  .menu {
    display: flex;
    width: 100%;
    position: relative;
    border-top: 1px solid #385de7;
    box-shadow: 0 1px #385de7;
  }

  .orange-hr {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    display: block;
    height: 2px;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0) 0%,
      #da884a 50%,
      rgba(0, 0, 0, 0) 100%
    );
    border: 0;
  }

  .menu__right {
    background-color: #d2e5fa;
    border-left: 1px solid #a6bbd6;
    padding: 0 0 5px;
    flex: 0 0 48%;
    color: #00136b;
  }

  .menu__left {
    background-color: #fff;
    flex: 0 0 52%;
    display: flex;
    flex-direction: column;
  }

  .menu__items {
    padding: 0;
    flex: 1;
  }

  .menu__separator {
    height: 7.5px;
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.1) 50%,
      rgba(0, 0, 0, 0) 100%
    );
    border-top: 3px solid transparent;
    border-bottom: 3px solid transparent;
    background-clip: content-box;
  }

  .menu__right .menu__separator {
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0) 0%,
      #87b3e2b5 50%,
      rgba(0, 0, 0, 0) 100%
    );
    background-clip: content-box;
  }

  .menu__item {
    padding: 4px 8px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .menu__left .menu__item {
    flex: 1;
  }

  .menu__left .menu__item:first-child {
    padding-top: 10px;
  }

  .menu__right .menu__item {
    height: 35px;
    max-height: 35px;
    min-height: 35px;
    padding: 8px 7.5px 8px 9px;
  }

  .menu__item:hover {
    color: white;
    background-color: #2f71cd;
  }

  .menu__item--emphasize .menu__item__text {
    font-weight: 700;
  }

  .menu__item__texts {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .menu__item__text {
    font-size: 12px;
    font-weight: 400;
    letter-spacing: normal;
  }

  .menu__item__description {
    font-size: 9.5px;
    color: #777;
    line-height: 1.2;
    margin-top: 1px;
  }

  .menu__item:hover .menu__item__description {
    color: #fff;
    text-shadow: 0 0 1px rgba(0, 0, 0, 0.3);
  }

  .menu__right .menu__item__img {
    height: 25px;
    width: 25px;
    margin-left: 1px;
    margin-right: 7px;
  }

  .menu__right .menu__item__text {
    font-size: 11.5px;
  }

  .menu__left .menu__item__img {
    height: 30px;
    width: 30px;
    margin-right: 7px;
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
  }

  /* All Programs Container & Button */
  .all-programs-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    position: relative;
    margin-top: 4px;
  }

  .all-programs-container::before {
    content: '';
    display: block;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0) 0%,
      rgb(210, 210, 210) 50%,
      rgba(0, 0, 0, 0) 100%
    );
  }

  .all-programs-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
  }

  .all-programs-button span {
    margin-right: 6px;
    line-height: 18px;
  }

  .all-programs-button img {
    width: 14px;
    height: 14px;
  }

  .all-programs-button:hover,
  .all-programs-button.active {
    background-color: #2f71cd;
    color: #fff;
  }

  /* All Programs Flyout Menu */
  .all-programs-menu {
    position: absolute;
    left: 100%;
    bottom: 0;
    background: #f2f2f2;
    border: 1px solid #d0d0d0;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.15);
    min-width: 180px;
    z-index: 10;
  }

  .all-programs-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #1c57ad 0%, #2a70ce 50%, #5b9fe2 100%);
    z-index: 1;
  }

  .all-programs-items {
    list-style: none;
    margin: 0;
    padding: 4px 0;
  }

  .all-programs-item {
    display: flex;
    align-items: center;
    padding: 4px 20px 4px 30px;
    cursor: pointer;
    color: #000;
    position: relative;
    white-space: nowrap;
    font-size: 11px;
  }

  .all-programs-item.folder {
    padding-right: 25px;
  }

  .all-programs-item > img:first-child {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
  }

  .all-programs-item .folder-arrow {
    display: none;
  }

  .all-programs-item.folder::after {
    content: '';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 5px solid #000;
  }

  .all-programs-item.folder:hover::after {
    border-left-color: #fff;
  }

  .all-programs-item span {
    z-index: 2;
  }

  .all-programs-item:hover {
    background-color: #2f71cd;
    color: #fff;
  }

  .all-programs-separator {
    height: 1px;
    background-color: #e0e0e0;
    margin: 2px 0;
    list-style: none;
  }

  /* Folder submenu */
  .folder-submenu {
    position: absolute;
    left: 100%;
    top: 0;
    background: #f2f2f2;
    border: 1px solid #d0d0d0;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.15);
    min-width: 150px;
    z-index: 11;
    padding: 4px 0;
  }

  /* Mobile: position submenu from right edge of screen */
  .mobile-device & .folder-submenu {
    position: fixed;
    left: auto;
    right: 10px;
    top: auto;
    bottom: 40px;
    min-width: 180px;
    max-height: calc(100vh - 80px);
    overflow-y: auto;
    z-index: 20;
  }

  .folder-submenu-item {
    display: flex;
    align-items: center;
    padding: 4px 8px 4px 30px;
    cursor: pointer;
    color: #000;
    position: relative;
    white-space: nowrap;
    font-size: 11px;
  }

  .folder-submenu-item:hover {
    background-color: #2f71cd;
    color: #fff;
  }

  .folder-submenu-item img {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
  }

  /* Recently Used Container */
  .recently-used-container {
    position: relative;
  }

  .menu__item--with-arrow {
    position: relative;
    padding-right: 20px;
  }

  .menu__item__arrow {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%) scaleX(0.6);
    font-size: 10px;
    color: inherit;
  }

  .menu__item--with-arrow.active {
    background-color: #2f71cd;
    color: #fff;
  }

  /* Recently Used Flyout Menu */
  .recently-used-menu {
    position: absolute;
    left: 100%;
    bottom: 0;
    background: #f2f2f2;
    border: 1px solid #d0d0d0;
    box-shadow: 2px -2px 5px rgba(0, 0, 0, 0.15);
    min-width: 180px;
    z-index: 10;
  }

  .recently-used-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #1c57ad 0%, #2a70ce 50%, #5b9fe2 100%);
    z-index: 1;
  }

  .recently-used-items {
    list-style: none;
    margin: 0;
    padding: 4px 0;
  }

  .recently-used-item {
    display: flex;
    align-items: center;
    padding: 4px 20px 4px 30px;
    cursor: default;
    color: #000;
    position: relative;
    white-space: nowrap;
    font-size: 11px;
  }

  .recently-used-item.disabled {
    color: #888;
    cursor: not-allowed;
  }

  .recently-used-item.disabled img {
    opacity: 0.5;
  }

  .recently-used-item > img:first-child {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
  }

  .recently-used-item:not(.disabled):hover {
    background-color: #2f71cd;
    color: #fff;
  }

  /* Installed Apps Container */
  .installed-apps-container {
    position: relative;
  }

  /* Installed Apps Flyout Menu */
  .installed-apps-menu {
    position: absolute;
    left: 100%;
    bottom: 0;
    background: #f2f2f2;
    border: 1px solid #d0d0d0;
    box-shadow: 2px -2px 5px rgba(0, 0, 0, 0.15);
    min-width: 180px;
    max-width: 280px;
    z-index: 10;
  }

  .installed-apps-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #1c57ad 0%, #2a70ce 50%, #5b9fe2 100%);
    z-index: 1;
  }

  .installed-apps-items {
    list-style: none;
    margin: 0;
    padding: 4px 0;
  }

  .installed-apps-item {
    display: flex;
    align-items: center;
    padding: 4px 20px 4px 30px;
    cursor: pointer;
    color: #000;
    position: relative;
    white-space: nowrap;
    font-size: 11px;
  }

  .installed-apps-item > img:first-child {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    object-fit: contain;
  }

  .installed-apps-item:hover {
    background-color: #2f71cd;
    color: #fff;
  }

  .installed-apps-item span {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
`;
