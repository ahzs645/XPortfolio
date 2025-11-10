import html from './html.js';
import DesktopIcon from './components/DesktopIcon.js';
import WindowManager from './components/WindowManager.js';
import Taskbar from './components/Taskbar.js';
import StartMenu from './components/StartMenu.js';
import { APPS, getAppById } from './data/apps.js';

const { useMemo, useRef, useState } = window.React;

const DEFAULT_WALLPAPER = './assets/gui/bgs/blissorg.jpeg';

function buildAppLookup(apps) {
  return apps.reduce((acc, app) => {
    acc[app.id] = app;
    return acc;
  }, {});
}

export default function App() {
  const config = window.__APP_CONFIG || {};
  const appsById = useMemo(() => buildAppLookup(APPS), []);
  const desktopAppIds = useMemo(() => {
    if (Array.isArray(config.desktopPrograms) && config.desktopPrograms.length > 0) {
      return config.desktopPrograms.filter(id => appsById[id]);
    }
    return APPS.map(app => app.id);
  }, [config.desktopPrograms, appsById]);

  const zIndexRef = useRef(1);
  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  const wallpaper = config.wallpaper || DEFAULT_WALLPAPER;

  const allocateZIndex = () => {
    zIndexRef.current += 1;
    return zIndexRef.current;
  };

  const openApp = appId => {
    setStartMenuOpen(false);
    setOpenWindows(prev => {
      const existing = prev.find(win => win.id === appId);
      if (existing) {
        const nextZ = allocateZIndex();
        return prev.map(win =>
          win.id === appId
            ? { ...win, minimized: false, zIndex: nextZ }
            : win
        );
      }

      const app = getAppById(appId);
      if (!app) return prev;
      const nextZ = allocateZIndex();
      const offset = prev.length * 24;
      const defaultPosition = {
        x: 160 + offset,
        y: 140 + offset
      };

      return [
        ...prev,
        {
          id: appId,
          title: app.title,
          minimized: false,
          zIndex: nextZ,
          position: defaultPosition,
          size: app.initialSize
        }
      ];
    });
    setActiveWindowId(appId);
  };

  const closeApp = appId => {
    setOpenWindows(prev => prev.filter(win => win.id !== appId));
    setActiveWindowId(prev => (prev === appId ? null : prev));
  };

  const focusApp = appId => {
    setOpenWindows(prev => {
      const exists = prev.some(win => win.id === appId);
      if (!exists) return prev;
      const nextZ = allocateZIndex();
      return prev.map(win =>
        win.id === appId
          ? { ...win, minimized: false, zIndex: nextZ }
          : win
      );
    });
    setActiveWindowId(appId);
  };

  const minimizeApp = appId => {
    setOpenWindows(prev =>
      prev.map(win =>
        win.id === appId
          ? { ...win, minimized: true }
          : win
      )
    );
    setActiveWindowId(prev => (prev === appId ? null : prev));
  };

  const updatePosition = (appId, position) => {
    setOpenWindows(prev =>
      prev.map(win =>
        win.id === appId
          ? { ...win, position }
          : win
      )
    );
  };

  const toggleStartMenu = () => {
    setStartMenuOpen(prev => !prev);
  };

  const desktopApps = desktopAppIds.map(id => appsById[id]).filter(Boolean);

  return html`
    <div
      class="xp-desktop"
      style=${{ backgroundImage: `url(${wallpaper})` }}
      onPointerDown=${() => setStartMenuOpen(false)}
    >
      <div class="desktop-icons" aria-label="Desktop icons">
        ${desktopApps.map(
          app => html`<${DesktopIcon}
            key=${app.id}
            icon=${app.icon}
            title=${app.title}
            description=${app.description}
            onOpen=${() => openApp(app.id)}
          />`
        )}
      </div>

      <${WindowManager}
        config=${config}
        windows=${openWindows}
        activeWindowId=${activeWindowId}
        appsById=${appsById}
        onClose=${closeApp}
        onFocus=${focusApp}
        onMinimize=${minimizeApp}
        onMove=${updatePosition}
      />

      <${Taskbar}
        config=${config}
        windows=${openWindows}
        activeWindowId=${activeWindowId}
        onSelect=${appId => {
          const target = openWindows.find(win => win.id === appId);
          if (target && target.minimized) {
            focusApp(appId);
          } else if (activeWindowId === appId) {
            minimizeApp(appId);
          } else {
            focusApp(appId);
          }
        }}
        onToggleStart=${toggleStartMenu}
        isStartOpen=${startMenuOpen}
      />

      ${startMenuOpen &&
      html`<${StartMenu}
        config=${config}
        apps=${desktopApps}
        onClose=${() => setStartMenuOpen(false)}
        onOpenApp=${openApp}
      />`}
    </div>
  `;
}
