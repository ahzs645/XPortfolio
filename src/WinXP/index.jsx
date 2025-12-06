import React, { useReducer, useRef, useCallback, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useMouse, useWindowSize, useMobileRestriction } from '../hooks';
import useSystemSounds from '../hooks/useSystemSounds';
import { useConfig } from '../contexts/ConfigContext';
import { useUserSettings } from '../contexts/UserSettingsContext';
import MobileRestrictionPopup from '../components/MobileRestrictionPopup';
import { useFileSystem, SYSTEM_IDS, XP_ICONS, SYSTEM_DESKTOP_ICONS } from '../contexts/FileSystemContext';
import { useInstalledApps } from '../contexts/InstalledAppsContext';
import { AppProvider } from '../contexts/AppContext';
import { ContextMenu } from './components/ContextMenu';
import { parseFileStructure } from '../utils/fileDropParser';
import FileUploadDialog from './FileUploadDialog';
import { useFileContextMenu, useBackgroundContextMenu } from './hooks/useFileContextMenu';
import { createArchive, extractArchive, isArchiveFile } from '../utils/archiveUtils';
import { getDefaultProgramForFile } from './apps/Installer/components/SetProgramDefaults';

// Icon grid layout constants (used for arranging icons)
const ICON_GRID = {
  iconWidth: 80,
  iconHeight: 90,
  iconGapX: 10,
  iconGapY: 10,
  startX: 10,
  startY: 10,
};

// Convert file system items to desktop icon format
const convertToDesktopIcons = (items, appSettings, savedPositions = {}) => {
  const { iconWidth, iconHeight, iconGapX, iconGapY, startX, startY } = ICON_GRID;
  // Calculate max icons per column based on viewport (leave room for taskbar)
  const maxHeight = window.innerHeight - 60; // 60px for taskbar
  const iconsPerColumn = Math.floor((maxHeight - startY) / (iconHeight + iconGapY));

  return items.map((item, index) => {
    const savedPos = savedPositions[item.id];
    // Calculate column and row for grid layout
    const column = Math.floor(index / iconsPerColumn);
    const row = index % iconsPerColumn;
    const defaultX = startX + column * (iconWidth + iconGapX);
    const defaultY = startY + row * (iconHeight + iconGapY);

    // Ensure positions are valid numbers
    const validX = (savedPos?.x !== undefined && !isNaN(savedPos.x)) ? savedPos.x : defaultX;
    const validY = (savedPos?.y !== undefined && !isNaN(savedPos.y)) ? savedPos.y : defaultY;

    // For shortcuts, find the matching app component
    let component = null;
    if (item.type === 'shortcut' && item.target) {
      const appSetting = appSettings[item.target];
      if (appSetting) {
        component = appSetting.component;
      }
    }

    // For shortcuts, strip the .lnk extension from display title
    let displayTitle = item.name;
    if (item.type === 'shortcut' && item.name.endsWith('.lnk')) {
      displayTitle = item.name.slice(0, -4);
    }

    return {
      id: item.id,
      programId: item.id,
      icon: item.icon || XP_ICONS.file,
      title: displayTitle,
      fullName: item.name, // Keep the full name with .lnk for properties
      component: component,
      isFocus: false,
      x: validX,
      y: validY,
      // Extra info for file handling
      type: item.type,
      target: item.target,
      data: item.data,
      fileType: item.type === 'file' ? item.contentType : null,
      size: item.size,
      dateCreated: item.dateCreated,
      dateModified: item.dateModified,
    };
  });
};

import {
  ADD_APP,
  DEL_APP,
  FOCUS_APP,
  MINIMIZE_APP,
  TOGGLE_MAXIMIZE_APP,
  FOCUS_ICON,
  SELECT_ICONS,
  SET_ICONS,
  FOCUS_DESKTOP,
  START_SELECT,
  END_SELECT,
  POWER_OFF,
  CANCEL_POWER_OFF,
  SET_BOOT_STATE,
  UPDATE_ICON_POSITIONS,
} from './constants/actions';
import { FOCUSING, POWER_STATE, BOOT_STATE } from './constants';
import { defaultIconState, defaultAppState, appSettings, generateIconState, saveIconPositions } from './apps';
import Modal from './Modal';
import Footer from './Footer';
import Windows from './Windows';
import Icons from './Icons';
import DashedBox from '../components/DashedBox';
import BootScreen from './BootScreen';
import Clippy from './Clippy';
import CRTEffect from './CRTEffect';

const initState = {
  apps: [],
  nextAppID: 0,
  nextZIndex: 0,
  focusing: FOCUSING.DESKTOP,
  icons: defaultIconState,
  selecting: false,
  powerState: POWER_STATE.START,
  bootState: BOOT_STATE.BOOTING,
};

const reducer = (state, action = { type: '' }) => {
  switch (action.type) {
    case ADD_APP: {
      const app = state.apps.find(
        (_app) => _app.component === action.payload.component
      );
      if (action.payload.multiInstance || !app) {
        return {
          ...state,
          apps: [
            ...state.apps,
            {
              ...action.payload,
              id: state.nextAppID,
              zIndex: state.nextZIndex,
            },
          ],
          nextAppID: state.nextAppID + 1,
          nextZIndex: state.nextZIndex + 1,
          focusing: FOCUSING.WINDOW,
        };
      }
      const apps = state.apps.map((app) =>
        app.component === action.payload.component
          ? { ...app, zIndex: state.nextZIndex, minimized: false }
          : app
      );
      return {
        ...state,
        apps,
        nextZIndex: state.nextZIndex + 1,
        focusing: FOCUSING.WINDOW,
      };
    }
    case DEL_APP:
      if (state.focusing !== FOCUSING.WINDOW) return state;
      return {
        ...state,
        apps: state.apps.filter((app) => app.id !== action.payload),
        focusing:
          state.apps.length > 1
            ? FOCUSING.WINDOW
            : state.icons.find((icon) => icon.isFocus)
            ? FOCUSING.ICON
            : FOCUSING.DESKTOP,
      };
    case FOCUS_APP: {
      const apps = state.apps.map((app) =>
        app.id === action.payload
          ? { ...app, zIndex: state.nextZIndex, minimized: false }
          : app
      );
      return {
        ...state,
        apps,
        nextZIndex: state.nextZIndex + 1,
        focusing: FOCUSING.WINDOW,
      };
    }
    case MINIMIZE_APP: {
      if (state.focusing !== FOCUSING.WINDOW) return state;
      const apps = state.apps.map((app) =>
        app.id === action.payload ? { ...app, minimized: true } : app
      );
      return {
        ...state,
        apps,
        focusing: FOCUSING.WINDOW,
      };
    }
    case TOGGLE_MAXIMIZE_APP: {
      if (state.focusing !== FOCUSING.WINDOW) return state;
      const apps = state.apps.map((app) =>
        app.id === action.payload ? { ...app, maximized: !app.maximized } : app
      );
      return {
        ...state,
        apps,
        focusing: FOCUSING.WINDOW,
      };
    }
    case FOCUS_ICON: {
      const icons = state.icons.map((icon) => ({
        ...icon,
        isFocus: icon.id === action.payload,
      }));
      return {
        ...state,
        focusing: FOCUSING.ICON,
        icons,
      };
    }
    case SELECT_ICONS: {
      const icons = state.icons.map((icon) => ({
        ...icon,
        isFocus: action.payload.includes(icon.id),
      }));
      return {
        ...state,
        icons,
        focusing: FOCUSING.ICON,
      };
    }
    case FOCUS_DESKTOP:
      return {
        ...state,
        focusing: FOCUSING.DESKTOP,
        icons: state.icons.map((icon) => ({
          ...icon,
          isFocus: false,
        })),
      };
    case START_SELECT:
      return {
        ...state,
        focusing: FOCUSING.DESKTOP,
        icons: state.icons.map((icon) => ({
          ...icon,
          isFocus: false,
        })),
        selecting: action.payload,
      };
    case END_SELECT:
      return {
        ...state,
        selecting: null,
      };
    case POWER_OFF:
      return {
        ...state,
        powerState: action.payload,
      };
    case CANCEL_POWER_OFF:
      return {
        ...state,
        powerState: POWER_STATE.START,
      };
    case SET_BOOT_STATE:
      return {
        ...state,
        bootState: action.payload,
      };
    case SET_ICONS:
      return {
        ...state,
        icons: action.payload,
      };
    case UPDATE_ICON_POSITIONS: {
      const updatedIcons = state.icons.map((icon) => {
        const newPos = action.payload[icon.id];
        if (newPos) {
          return { ...icon, x: newPos.x, y: newPos.y };
        }
        return icon;
      });
      // Note: Icon positions are saved via useEffect in WinXP component
      // using per-user settings from UserSettingsContext
      return {
        ...state,
        icons: updatedIcons,
      };
    }
    default:
      return state;
  }
};

function WinXP() {
  const [state, dispatch] = useReducer(reducer, initState);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [desktopContextMenu, setDesktopContextMenu] = useState(null);
  const [iconContextMenu, setIconContextMenu] = useState(null); // { x, y, icon }
  const [renamingIconId, setRenamingIconId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [alignToGridEnabled, setAlignToGridEnabled] = useState(true);
  const [autoArrangeEnabled, setAutoArrangeEnabled] = useState(false);
  const ref = useRef(null);
  const dragCounterRef = useRef(0);
  const mouse = useMouse(ref);
  const { width } = useWindowSize();
  const focusedAppId = getFocusedAppId();
  const { playLogoff, playBalloon } = useSystemSounds();
  const { isLoading: configLoading, isFileDropUploadEnabled } = useConfig();
  // Use per-user settings for wallpaper and icon positions
  const { getWallpaperPath, getDesktopIconPositions, setDesktopIconPositions } = useUserSettings();
  const {
    createFile,
    createItem,
    getFolderContents,
    getFileContent,
    fileSystem,
    isLoading: fsLoading,
    moveToRecycleBin,
    renameItem,
    copy,
    cut,
    paste,
    clipboard,
    clipboardOp,
    moveItem,
  } = useFileSystem();

  const { registerLaunchCallback, launchInstalledApp } = useInstalledApps();

  // Mobile restriction handling
  const {
    isRestrictionPopupOpen,
    restrictionPopupData,
    checkMobileRestriction,
    closePopup: closeMobileRestrictionPopup,
  } = useMobileRestriction();

  // Register callback to launch installed apps
  useEffect(() => {
    const handleLaunchApp = (app) => {
      // Launch the IframeApp with the installed app's settings
      const iframeAppSetting = {
        ...appSettings['Installed App'],
        header: {
          ...appSettings['Installed App'].header,
          icon: app.icon || '/icons/xp/Programs.png',
          title: app.name,
        },
        defaultSize: {
          width: app.windowSettings?.width || 800,
          height: app.windowSettings?.height || 600,
        },
        minSize: {
          width: app.windowSettings?.minWidth || 400,
          height: app.windowSettings?.minHeight || 300,
        },
        resizable: app.windowSettings?.resizable ?? true,
        injectProps: {
          appId: app.id,
          url: app.url,
        },
      };
      dispatch({ type: ADD_APP, payload: iframeAppSetting });
    };

    registerLaunchCallback(handleLaunchApp);
  }, [registerLaunchCallback]);

  // Determine if mobile based on viewport width
  const isMobile = width < 768;
  const wallpaperPath = getWallpaperPath(isMobile);

  // Update desktop icons from file system Desktop folder + system icons
  // Uses per-user icon positions from UserSettingsContext
  useEffect(() => {
    if (!fsLoading && fileSystem) {
      const desktopContents = getFolderContents(SYSTEM_IDS.DESKTOP);
      const savedPositions = getDesktopIconPositions();

      // Convert file system items to icons
      const fileIcons = convertToDesktopIcons(desktopContents, appSettings, savedPositions);

      // Add system icons (My Computer, Recycle Bin) - these are not in the file system
      const systemIcons = Object.values(SYSTEM_DESKTOP_ICONS).map((sysIcon, index) => {
        const savedPos = savedPositions[sysIcon.id];
        // System icons go at the top of the desktop
        const defaultX = 10;
        const defaultY = 10 + index * 90;

        return {
          id: sysIcon.id,
          programId: sysIcon.id,
          icon: sysIcon.icon,
          title: sysIcon.name,
          fullName: sysIcon.name,
          component: appSettings[sysIcon.target]?.component,
          isFocus: false,
          x: savedPos?.x ?? defaultX,
          y: savedPos?.y ?? defaultY,
          type: 'system', // Special type - no shortcut overlay
          target: sysIcon.target,
        };
      });

      // Combine: system icons first, then file icons (offset their positions)
      const allIcons = [...systemIcons, ...fileIcons.map((icon, idx) => ({
        ...icon,
        // If no saved position, offset below system icons
        x: savedPositions[icon.id]?.x ?? icon.x,
        y: savedPositions[icon.id]?.y ?? (icon.y + systemIcons.length * 90),
      }))];

      dispatch({ type: SET_ICONS, payload: allIcons });
    }
  }, [fsLoading, fileSystem, getFolderContents, getDesktopIconPositions]);

  // Save icon positions when they change (per-user)
  const iconPositionsRef = useRef({});
  useEffect(() => {
    // Build positions map from current icons
    const positions = {};
    state.icons.forEach((icon) => {
      if (icon.x !== undefined && icon.y !== undefined) {
        positions[icon.id] = { x: icon.x, y: icon.y };
      }
    });

    // Only save if positions actually changed
    const positionsStr = JSON.stringify(positions);
    if (positionsStr !== JSON.stringify(iconPositionsRef.current) && Object.keys(positions).length > 0) {
      iconPositionsRef.current = positions;
      setDesktopIconPositions(positions);
    }
  }, [state.icons, setDesktopIconPositions]);

  const handleToggleCRT = useCallback(() => {
    setCrtEnabled((prev) => !prev);
  }, []);

  const onFocusApp = useCallback((id) => {
    dispatch({ type: FOCUS_APP, payload: id });
  }, []);

  const onMaximizeWindow = useCallback(
    (id) => {
      if (focusedAppId === id) {
        dispatch({ type: TOGGLE_MAXIMIZE_APP, payload: id });
      }
    },
    [focusedAppId]
  );

  const onMinimizeWindow = useCallback(
    (id) => {
      if (focusedAppId === id) {
        dispatch({ type: MINIMIZE_APP, payload: id });
      }
    },
    [focusedAppId]
  );

  const onCloseApp = useCallback(
    (id) => {
      if (focusedAppId === id) {
        dispatch({ type: DEL_APP, payload: id });
      }
    },
    [focusedAppId]
  );

  function onMouseDownFooterApp(id) {
    if (focusedAppId === id) {
      dispatch({ type: MINIMIZE_APP, payload: id });
    } else {
      dispatch({ type: FOCUS_APP, payload: id });
    }
  }

  function onMouseDownIcon(id) {
    dispatch({ type: FOCUS_ICON, payload: id });
  }

  async function onDoubleClickIcon(icon) {
    console.log('[DoubleClick]', icon.title, 'type:', icon.type, 'hasData:', !!icon.data);

    // Handle system icons (My Computer, Recycle Bin) - launch the target app
    if (icon.type === 'system' && icon.target) {
      // Check for mobile restrictions before launching
      if (!checkMobileRestriction(icon.target)) {
        return; // Blocked on mobile, popup will be shown
      }

      const appSetting = appSettings[icon.target];
      if (appSetting) {
        dispatch({ type: ADD_APP, payload: appSetting });
      }
      return;
    }

    // Handle shortcuts - launch the target app
    if (icon.type === 'shortcut' && icon.target) {
      // Check for mobile restrictions before launching
      if (!checkMobileRestriction(icon.target)) {
        return; // Blocked on mobile, popup will be shown
      }

      const appSetting = appSettings[icon.target];
      if (appSetting) {
        dispatch({ type: ADD_APP, payload: appSetting });
      }
      return;
    }

    // Handle folders - open in My Computer
    if (icon.type === 'folder') {
      const myComputerSetting = {
        ...appSettings['My Computer'],
        injectProps: {
          initialPath: icon.id,
        },
      };
      dispatch({ type: ADD_APP, payload: myComputerSetting });
      return;
    }

    // Handle files - open with appropriate viewer
    if (icon.type === 'file') {
      // Load file data if not present (stored in IndexedDB)
      let fileData = icon.data;
      if (!fileData) {
        const fileItem = fileSystem?.[icon.id];
        if (fileItem?.storageKey) {
          const blob = await getFileContent(icon.id);
          if (blob) {
            // Convert blob to data URL
            fileData = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          }
        }
      }

      // Get file extension for handling empty files
      const fileExt = icon.title.substring(icon.title.lastIndexOf('.')).toLowerCase();

      // Check for user-configured default program
      const defaultProgram = getDefaultProgramForFile(icon.title);
      if (defaultProgram && fileData) {
        let handled = false;

        if (defaultProgram === 'Notepad') {
          let textContent = '';
          try {
            const base64Data = fileData.split(',')[1] || fileData;
            textContent = atob(base64Data);
          } catch (e) {
            textContent = fileData;
          }
          dispatch({
            type: ADD_APP,
            payload: {
              ...appSettings['Notepad'],
              header: { ...appSettings['Notepad'].header, title: `${icon.title} - Notepad` },
              injectProps: { initialContent: textContent, fileName: icon.title, fileId: icon.id },
            },
          });
          handled = true;
        } else if (defaultProgram === 'Image Viewer' || defaultProgram === 'Paint') {
          const viewerKey = defaultProgram === 'Paint' ? 'Paint' : 'Image Viewer';
          if (appSettings[viewerKey]) {
            dispatch({
              type: ADD_APP,
              payload: {
                ...appSettings[viewerKey],
                header: { ...appSettings[viewerKey].header, title: `${icon.title} - ${defaultProgram === 'Paint' ? 'Paint' : 'Windows Picture and Fax Viewer'}` },
                injectProps: { initialImage: { src: fileData, title: icon.title } },
              },
            });
            handled = true;
          }
        } else if (defaultProgram === 'Internet Explorer') {
          let blobUrl = fileData;
          try {
            const base64Data = fileData.split(',')[1] || fileData;
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'text/html' });
            blobUrl = URL.createObjectURL(blob);
          } catch (e) {
            console.error('Failed to create blob URL:', e);
          }
          dispatch({
            type: ADD_APP,
            payload: {
              ...appSettings['Internet Explorer'],
              header: { ...appSettings['Internet Explorer'].header, title: `${icon.title} - Internet Explorer` },
              injectProps: { initialUrl: blobUrl, filePath: `C:\\Desktop\\${icon.title}` },
            },
          });
          handled = true;
        } else if (defaultProgram === 'WinRAR') {
          dispatch({
            type: ADD_APP,
            payload: {
              ...appSettings['WinRAR'],
              header: { ...appSettings['WinRAR'].header, title: `Extracting ${icon.title}` },
              injectProps: { fileData: fileData, fileName: icon.title, parentFolderId: null },
            },
          });
          handled = true;
        } else if (defaultProgram === 'Windows Media Player' || defaultProgram === 'Winamp') {
          const playerKey = defaultProgram === 'Winamp' ? 'Winamp' : 'Media Player';
          if (appSettings[playerKey]) {
            dispatch({
              type: ADD_APP,
              payload: {
                ...appSettings[playerKey],
                header: { ...appSettings[playerKey].header, title: `${icon.title} - ${defaultProgram}` },
                injectProps: { initialTrack: { src: fileData, title: icon.title } },
              },
            });
            handled = true;
          }
        }

        if (handled) return;
      }

      // For text files with no data (newly created empty files), open with empty content
      const emptyTextExtensions = ['.txt', '.log', '.md', '.json', '.js', '.jsx', '.ts', '.tsx', '.css'];
      if (!fileData && emptyTextExtensions.includes(fileExt)) {
        const notepadSetting = {
          ...appSettings['Notepad'],
          header: {
            ...appSettings['Notepad'].header,
            title: `${icon.title} - Notepad`,
          },
          injectProps: {
            initialContent: '',
            fileName: icon.title,
            fileId: icon.id,
          },
        };
        dispatch({ type: ADD_APP, payload: notepadSetting });
        return;
      }

      if (!fileData) {
        console.log('[DoubleClick] No file data available');
        return;
      }

      // For images, open with Image Viewer
      const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
      if (imageTypes.includes(icon.fileType)) {
        const imageViewerSetting = {
          ...appSettings['Image Viewer'],
          header: {
            ...appSettings['Image Viewer'].header,
            title: `${icon.title} - Windows Picture and Fax Viewer`,
          },
          injectProps: {
            initialImage: { src: fileData, title: icon.title },
          },
        };
        dispatch({ type: ADD_APP, payload: imageViewerSetting });
        return;
      }

      // For archive files, open with WinRAR
      const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz'];
      const ext = icon.title.substring(icon.title.lastIndexOf('.')).toLowerCase();
      if (archiveExtensions.includes(ext)) {
        const winrarSetting = {
          ...appSettings['WinRAR'],
          header: {
            ...appSettings['WinRAR'].header,
            title: `Extracting ${icon.title}`,
          },
          injectProps: {
            fileData: fileData,
            fileName: icon.title,
            parentFolderId: null, // Extract to Desktop
          },
        };
        dispatch({ type: ADD_APP, payload: winrarSetting });
        return;
      }

      // For font files, open with Font Viewer
      const fontExtensions = ['.ttf', '.otf', '.woff', '.woff2', '.fon'];
      if (fontExtensions.includes(ext)) {
        const fontViewerSetting = {
          ...appSettings['Font Viewer'],
          header: {
            ...appSettings['Font Viewer'].header,
            title: icon.title,
          },
          injectProps: {
            fontData: fileData,
            fontName: icon.title,
          },
        };
        dispatch({ type: ADD_APP, payload: fontViewerSetting });
        return;
      }

      // For HTML files, open with Internet Explorer
      const htmlExtensions = ['.html', '.htm'];
      if (htmlExtensions.includes(ext)) {
        // Convert base64 data URL to blob URL for iframe display
        let blobUrl = fileData;
        try {
          const base64Data = fileData.split(',')[1] || fileData;
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'text/html' });
          blobUrl = URL.createObjectURL(blob);
        } catch (e) {
          console.error('Failed to create blob URL for HTML file:', e);
        }

        // Build file path for display
        const filePath = `C:\\Desktop\\${icon.title}`;

        const ieSetting = {
          ...appSettings['Internet Explorer'],
          header: {
            ...appSettings['Internet Explorer'].header,
            title: `${icon.title} - Internet Explorer`,
          },
          injectProps: {
            initialUrl: blobUrl,
            filePath: filePath,
          },
        };
        dispatch({ type: ADD_APP, payload: ieSetting });
        return;
      }

      // For text files, open with Notepad
      const textTypes = ['text/plain'];
      const textExtensions = ['.txt', '.log', '.md', '.json', '.js', '.jsx', '.ts', '.tsx', '.css'];
      if (textTypes.includes(icon.fileType) || textExtensions.includes(ext)) {
        // Decode base64 data to text
        let textContent = '';
        try {
          const base64Data = fileData.split(',')[1] || fileData;
          textContent = atob(base64Data);
        } catch (e) {
          textContent = fileData;
        }

        const notepadSetting = {
          ...appSettings['Notepad'],
          header: {
            ...appSettings['Notepad'].header,
            title: `${icon.title} - Notepad`,
          },
          injectProps: {
            initialContent: textContent,
            fileName: icon.title,
          },
        };
        dispatch({ type: ADD_APP, payload: notepadSetting });
        return;
      }

      // For other files, try to open/download
      const link = document.createElement('a');
      link.href = fileData;
      link.download = icon.title;
      link.click();
      return;
    }

    // Fallback: if it has a component, launch it
    if (icon.component) {
      const appSetting = Object.values(appSettings).find(
        (setting) => setting.component === icon.component
      );
      if (appSetting) {
        dispatch({ type: ADD_APP, payload: appSetting });
      }
    }
  }

  function getFocusedAppId() {
    if (state.focusing !== FOCUSING.WINDOW) return -1;
    const focusedApp = [...state.apps]
      .sort((a, b) => b.zIndex - a.zIndex)
      .find((app) => !app.minimized);
    return focusedApp ? focusedApp.id : -1;
  }

  // Get the "active" window for taskbar display (topmost non-minimized window)
  // This differs from focusedAppId because it stays active even when desktop is focused
  function getActiveAppIdForTaskbar() {
    const activeApp = [...state.apps]
      .sort((a, b) => b.zIndex - a.zIndex)
      .find((app) => !app.minimized);
    return activeApp ? activeApp.id : -1;
  }

  function onMouseDownFooter() {
    dispatch({ type: FOCUS_DESKTOP });
  }

  function onClickMenuItem(appName) {
    // Check for mobile restrictions before launching
    if (!checkMobileRestriction(appName)) {
      return; // Blocked on mobile, popup will be shown
    }

    const appSetting = appSettings[appName];
    if (appSetting) {
      dispatch({ type: ADD_APP, payload: appSetting });
    } else if (appName === 'Log Off') {
      playLogoff();
      dispatch({ type: POWER_OFF, payload: POWER_STATE.LOG_OFF });
    } else if (appName === 'Turn Off Computer') {
      dispatch({ type: POWER_OFF, payload: POWER_STATE.TURN_OFF });
    } else {
      // App not found - could show error dialog
      console.warn(`App not found: ${appName}`);
    }
  }

  function onMouseDownDesktop(e) {
    // Only start selection when clicking on the desktop background directly
    // or on elements that don't handle their own clicks (pointer-events: none passes through)
    if (e.target === e.currentTarget || e.target.closest('[data-desktop-area]')) {
      setDesktopContextMenu(null);
      setIconContextMenu(null);
      // Use event coordinates directly instead of mouse hook (which only updates on move)
      dispatch({
        type: START_SELECT,
        payload: { x: e.pageX, y: e.pageY },
      });
    }
  }

  function onMouseUpDesktop() {
    dispatch({ type: END_SELECT });
  }

  const onDesktopContextMenu = useCallback((e) => {
    // Only show context menu when right-clicking on the desktop background
    if (e.target === e.currentTarget || e.target.closest('[data-desktop-area]')) {
      e.preventDefault();
      setIconContextMenu(null); // Close icon menu if open
      setDesktopContextMenu({
        x: e.clientX,
        y: e.clientY,
      });
    }
  }, []);

  const handleDesktopMenuAction = useCallback(async (action) => {
    setDesktopContextMenu(null);
    switch (action) {
      case 'newFolder': {
        const id = await createItem(SYSTEM_IDS.DESKTOP, 'New Folder', 'folder');
        if (id) {
          // Start renaming the new folder
          setTimeout(() => {
            setRenamingIconId(id);
            setRenameValue('New Folder');
          }, 100);
        }
        break;
      }
      case 'newTextDoc': {
        const id = await createItem(SYSTEM_IDS.DESKTOP, 'New Text Document.txt', 'file');
        if (id) {
          setTimeout(() => {
            setRenamingIconId(id);
            setRenameValue('New Text Document.txt');
          }, 100);
        }
        break;
      }
      case 'paste':
        await paste(SYSTEM_IDS.DESKTOP);
        break;
      case 'refresh': {
        // Trigger a re-render by updating icons
        const desktopContents = getFolderContents(SYSTEM_IDS.DESKTOP);
        const savedPositions = getDesktopIconPositions();
        const fileIcons = convertToDesktopIcons(desktopContents, appSettings, savedPositions);

        // Add system icons
        const systemIcons = Object.values(SYSTEM_DESKTOP_ICONS).map((sysIcon, index) => {
          const savedPos = savedPositions[sysIcon.id];
          return {
            id: sysIcon.id,
            programId: sysIcon.id,
            icon: sysIcon.icon,
            title: sysIcon.name,
            fullName: sysIcon.name,
            component: appSettings[sysIcon.target]?.component,
            isFocus: false,
            x: savedPos?.x ?? 10,
            y: savedPos?.y ?? (10 + index * 90),
            type: 'system',
            target: sysIcon.target,
          };
        });

        const allIcons = [...systemIcons, ...fileIcons.map((icon) => ({
          ...icon,
          x: savedPositions[icon.id]?.x ?? icon.x,
          y: savedPositions[icon.id]?.y ?? (icon.y + systemIcons.length * 90),
        }))];

        dispatch({ type: SET_ICONS, payload: allIcons });
        break;
      }
      case 'properties':
        // Open Display Properties dialog
        dispatch({ type: ADD_APP, payload: appSettings['Display Properties'] });
        break;
      default:
        console.log('Desktop action:', action);
    }
  }, [createItem, getFolderContents, getDesktopIconPositions, paste]);

  // Close desktop context menu when clicking elsewhere
  useEffect(() => {
    if (desktopContextMenu) {
      const handleClick = () => setDesktopContextMenu(null);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [desktopContextMenu]);

  // Icon context menu handler
  const onIconContextMenu = useCallback((e, icon) => {
    e.preventDefault();
    setDesktopContextMenu(null); // Close desktop menu if open
    setIconContextMenu({
      x: e.clientX,
      y: e.clientY,
      icon,
    });
  }, []);

  const handleIconMenuAction = useCallback(async (action) => {
    const icon = iconContextMenu?.icon;
    setIconContextMenu(null);
    if (!icon) return;

    // Get all selected icons or just the right-clicked one
    const selectedIconIds = state.icons.filter(i => i.isFocus).map(i => i.id);
    const targetIds = selectedIconIds.length > 0 ? selectedIconIds : [icon.id];

    switch (action) {
      case 'open':
        onDoubleClickIcon(icon);
        break;
      case 'explore':
        // For folders, open in My Computer
        if (icon.type === 'folder') {
          const myComputerSetting = {
            ...appSettings['My Computer'],
            injectProps: {
              initialPath: icon.id,
            },
          };
          dispatch({ type: ADD_APP, payload: myComputerSetting });
        } else {
          onDoubleClickIcon(icon);
        }
        break;
      case 'cut':
        cut(targetIds);
        break;
      case 'copy':
        copy(targetIds);
        break;
      case 'delete':
        // Move to recycle bin
        for (const id of targetIds) {
          moveToRecycleBin(id);
        }
        break;
      case 'rename':
        // Start inline rename
        const item = fileSystem?.[icon.id];
        if (item) {
          setRenamingIconId(icon.id);
          setRenameValue(item.name);
        }
        break;
      case 'addToArchive': {
        // Create a zip archive from selected items
        try {
          const { blob, filename } = await createArchive(fileSystem, targetIds, getFileContent);
          // Convert blob to data URL and save as file
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          await createFile(SYSTEM_IDS.DESKTOP, filename, {
            data: dataUrl,
            size: blob.size,
            type: 'application/zip',
          });
        } catch (error) {
          console.error('Failed to create archive:', error);
        }
        break;
      }
      case 'extractHere': {
        // Extract archive to desktop
        try {
          const fileItem = fileSystem?.[icon.id];
          if (fileItem) {
            const content = await getFileContent(icon.id);
            if (content) {
              // Get parent folder (Desktop for desktop icons)
              const parentFolder = fileItem.parent || SYSTEM_IDS.DESKTOP;
              await extractArchive(content, fileSystem, parentFolder, createItem, createFile);
            }
          }
        } catch (error) {
          console.error('Failed to extract archive:', error);
        }
        break;
      }
      case 'properties': {
        // Check if this is My Computer - if so, open System Properties
        if (icon.target === 'My Computer' || icon.title === 'My Computer') {
          dispatch({ type: ADD_APP, payload: appSettings['System Properties'] });
        } else {
          // Use full name with .lnk for properties display
          const propName = icon.fullName || icon.title;
          // Open Properties dialog for the icon
          const propertiesSetting = {
            ...appSettings['Properties'],
            header: {
              ...appSettings['Properties'].header,
              title: `${propName} Properties`,
            },
            injectProps: {
              itemId: icon.id,
              itemData: {
                id: icon.id,
                name: propName,
                type: icon.type || 'shortcut',
                icon: icon.icon,
                target: icon.target,
                size: icon.size || 90, // Default shortcut size
                dateCreated: icon.dateCreated || Date.now(),
                dateModified: icon.dateModified || Date.now(),
              },
            },
          };
          dispatch({ type: ADD_APP, payload: propertiesSetting });
        }
        break;
      }
      default:
        console.log('Icon action:', action);
    }
  }, [iconContextMenu, state.icons, fileSystem, copy, cut, moveToRecycleBin, getFileContent, createFile, createItem]);

  const closeIconContextMenu = useCallback(() => setIconContextMenu(null), []);

  // Handle rename submission for desktop icons
  const handleIconRenameSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    if (renamingIconId && renameValue.trim()) {
      renameItem(renamingIconId, renameValue.trim());
    }
    setRenamingIconId(null);
    setRenameValue('');
  }, [renamingIconId, renameValue, renameItem]);

  const handleIconRenameCancel = useCallback(() => {
    setRenamingIconId(null);
    setRenameValue('');
  }, []);

  // Get the selected item for context menu
  const iconContextMenuItem = React.useMemo(() => {
    if (!iconContextMenu?.icon) return null;
    const icon = iconContextMenu.icon;
    return {
      id: icon.id,
      name: icon.title,
      type: icon.type, // 'system', 'shortcut', 'folder', 'file'
      icon: icon.icon,
      target: icon.target,
    };
  }, [iconContextMenu?.icon]);

  const selectedIconCount = state.icons.filter(i => i.isFocus).length;

  // Check if the selected icon is My Computer or Recycle Bin (system icons)
  const isSystemIcon = iconContextMenuItem?.type === 'system';
  const isMyComputerIcon = iconContextMenuItem?.target === 'My Computer' || iconContextMenuItem?.name === 'My Computer';
  const isRecycleBinIcon = iconContextMenuItem?.target === 'Recycle Bin' || iconContextMenuItem?.name === 'Recycle Bin';

  // Use the shared hook for icon context menu
  const iconMenuItems = useFileContextMenu({
    selectedItem: iconContextMenuItem,
    isMultiSelect: selectedIconCount > 1,
    isMyComputer: isMyComputerIcon,
    isRecycleBin: isRecycleBinIcon,
    clipboard,
    clipboardOp,
    onOpen: () => handleIconMenuAction('open'),
    onExplore: () => handleIconMenuAction('explore'),
    onCut: () => handleIconMenuAction('cut'),
    onCopy: () => handleIconMenuAction('copy'),
    onDelete: () => handleIconMenuAction('delete'),
    onRename: () => handleIconMenuAction('rename'),
    onProperties: () => handleIconMenuAction('properties'),
    onAddToArchive: () => handleIconMenuAction('addToArchive'),
    onExtractHere: () => handleIconMenuAction('extractHere'),
  });

  // Close icon context menu when clicking elsewhere
  useEffect(() => {
    if (iconContextMenu) {
      const handleClick = () => setIconContextMenu(null);
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [iconContextMenu]);

  const onIconsSelected = useCallback((iconIds) => {
    dispatch({ type: SELECT_ICONS, payload: iconIds });
  }, []);

  // Snap a single position to the grid
  const snapToGrid = useCallback((x, y) => {
    const { iconWidth, iconHeight, iconGapX, iconGapY, startX, startY } = ICON_GRID;
    const cellWidth = iconWidth + iconGapX;
    const cellHeight = iconHeight + iconGapY;

    const snappedX = Math.max(startX, Math.round((x - startX) / cellWidth) * cellWidth + startX);
    const snappedY = Math.max(startY, Math.round((y - startY) / cellHeight) * cellHeight + startY);

    return { x: snappedX, y: snappedY };
  }, []);

  const onUpdateIconPositions = useCallback((positions) => {
    // If align to grid is enabled, snap all positions to the grid
    if (alignToGridEnabled) {
      const snappedPositions = {};
      Object.entries(positions).forEach(([id, pos]) => {
        const snapped = snapToGrid(pos.x, pos.y);
        snappedPositions[id] = snapped;
      });
      dispatch({ type: UPDATE_ICON_POSITIONS, payload: snappedPositions });
    } else {
      dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
    }
  }, [alignToGridEnabled, snapToGrid]);

  // Handle moving icons to a folder via drag-and-drop
  const onMoveToFolder = useCallback((iconIds, targetFolderId) => {
    if (!moveItem) return;
    // Move each icon to the target folder
    for (const id of iconIds) {
      const success = moveItem(id, targetFolderId);
      if (success) {
        console.log(`Moved ${id} to folder ${targetFolderId}`);
      }
    }
  }, [moveItem]);

  // Helper to calculate new grid positions for icons
  const calculateGridPositions = useCallback((iconsList) => {
    const { iconWidth, iconHeight, iconGapX, iconGapY, startX, startY } = ICON_GRID;
    const maxHeight = window.innerHeight - 60; // Leave room for taskbar
    const iconsPerColumn = Math.floor((maxHeight - startY) / (iconHeight + iconGapY));

    const positions = {};
    iconsList.forEach((icon, index) => {
      const column = Math.floor(index / iconsPerColumn);
      const row = index % iconsPerColumn;
      positions[icon.id] = {
        x: startX + column * (iconWidth + iconGapX),
        y: startY + row * (iconHeight + iconGapY),
      };
    });
    return positions;
  }, []);

  // Arrange icons by name
  const handleArrangeByName = useCallback(() => {
    setDesktopContextMenu(null);
    const sortedIcons = [...state.icons].sort((a, b) => {
      // System icons first (My Computer, Recycle Bin)
      if (a.type === 'system' && b.type !== 'system') return -1;
      if (a.type !== 'system' && b.type === 'system') return 1;
      // Then alphabetically by title
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    });
    const positions = calculateGridPositions(sortedIcons);
    dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
  }, [state.icons, calculateGridPositions]);

  // Arrange icons by size
  const handleArrangeBySize = useCallback(() => {
    setDesktopContextMenu(null);
    const sortedIcons = [...state.icons].sort((a, b) => {
      // System icons first
      if (a.type === 'system' && b.type !== 'system') return -1;
      if (a.type !== 'system' && b.type === 'system') return 1;
      // Folders before files
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      // Then by size (larger first)
      return (b.size || 0) - (a.size || 0);
    });
    const positions = calculateGridPositions(sortedIcons);
    dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
  }, [state.icons, calculateGridPositions]);

  // Arrange icons by type
  const handleArrangeByType = useCallback(() => {
    setDesktopContextMenu(null);
    const getTypeOrder = (icon) => {
      if (icon.type === 'system') return 0;
      if (icon.type === 'folder') return 1;
      if (icon.type === 'shortcut') return 2;
      // For files, group by extension
      const ext = icon.title?.split('.').pop()?.toLowerCase() || '';
      return ext;
    };
    const sortedIcons = [...state.icons].sort((a, b) => {
      const typeA = getTypeOrder(a);
      const typeB = getTypeOrder(b);
      if (typeA < typeB) return -1;
      if (typeA > typeB) return 1;
      // Same type, sort by name
      return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    });
    const positions = calculateGridPositions(sortedIcons);
    dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
  }, [state.icons, calculateGridPositions]);

  // Arrange icons by modified date
  const handleArrangeByModified = useCallback(() => {
    setDesktopContextMenu(null);
    const sortedIcons = [...state.icons].sort((a, b) => {
      // System icons first
      if (a.type === 'system' && b.type !== 'system') return -1;
      if (a.type !== 'system' && b.type === 'system') return 1;
      // Then by modified date (newest first)
      return (b.dateModified || 0) - (a.dateModified || 0);
    });
    const positions = calculateGridPositions(sortedIcons);
    dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
  }, [state.icons, calculateGridPositions]);

  // Toggle auto arrange
  const handleAutoArrange = useCallback(() => {
    setDesktopContextMenu(null);
    const newAutoArrange = !autoArrangeEnabled;
    setAutoArrangeEnabled(newAutoArrange);

    // If enabling auto arrange, arrange icons now
    if (newAutoArrange) {
      const sortedIcons = [...state.icons].sort((a, b) => {
        if (a.type === 'system' && b.type !== 'system') return -1;
        if (a.type !== 'system' && b.type === 'system') return 1;
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      });
      const positions = calculateGridPositions(sortedIcons);
      dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
    }
  }, [autoArrangeEnabled, state.icons, calculateGridPositions]);

  // Toggle align to grid (and snap all icons if enabling)
  const handleAlignToGrid = useCallback(() => {
    setDesktopContextMenu(null);
    const newAlignToGrid = !alignToGridEnabled;
    setAlignToGridEnabled(newAlignToGrid);

    // If enabling align to grid, snap all icons now
    if (newAlignToGrid) {
      const positions = {};
      state.icons.forEach((icon) => {
        const snapped = snapToGrid(icon.x, icon.y);
        positions[icon.id] = snapped;
      });
      dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
    }
  }, [alignToGridEnabled, state.icons, snapToGrid]);

  // Use the shared hook for desktop background context menu
  const desktopMenuItems = useBackgroundContextMenu({
    clipboard,
    onRefresh: () => handleDesktopMenuAction('refresh'),
    onPaste: () => handleDesktopMenuAction('paste'),
    onNewFolder: () => handleDesktopMenuAction('newFolder'),
    onNewTextDoc: () => handleDesktopMenuAction('newTextDoc'),
    onProperties: () => handleDesktopMenuAction('properties'),
    // Arrange icons handlers
    onArrangeByName: handleArrangeByName,
    onArrangeBySize: handleArrangeBySize,
    onArrangeByType: handleArrangeByType,
    onArrangeByModified: handleArrangeByModified,
    onAutoArrange: handleAutoArrange,
    onAlignToGrid: handleAlignToGrid,
    autoArrangeEnabled,
    alignToGridEnabled,
  });

  function onModalRestart() {
    // Restart: reload the page to show the boot sequence again
    dispatch({ type: CANCEL_POWER_OFF });
    window.location.reload();
  }

  function onModalLogOff() {
    // Log off: play sound and go back to login screen
    playLogoff();
    dispatch({ type: CANCEL_POWER_OFF });
    // Reset boot state to show login screen directly (skip boot animation)
    dispatch({ type: SET_BOOT_STATE, payload: BOOT_STATE.LOGIN });
  }

  function onModalShutDown() {
    // Shut down is disabled in the UI, but handle it just in case
    dispatch({ type: CANCEL_POWER_OFF });
  }

  function onModalClose() {
    dispatch({ type: CANCEL_POWER_OFF });
  }

  function onBootComplete() {
    dispatch({ type: SET_BOOT_STATE, payload: BOOT_STATE.DESKTOP });
  }

  // Drag and drop file handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;

    // Allow cross-window file system item drops without showing overlay
    if (e.dataTransfer?.types?.includes('application/x-xportfolio-items')) {
      return;
    }

    if (!isFileDropUploadEnabled()) return;
    if (e.dataTransfer?.types?.includes('Files')) {
      setIsDraggingFiles(true);
    }
  }, [isFileDropUploadEnabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDraggingFiles(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Allow cross-window drops
    if (e.dataTransfer?.types?.includes('application/x-xportfolio-items')) {
      e.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFiles(false);
    dragCounterRef.current = 0;

    // Check for cross-window file system item drops (from file explorer)
    const xportfolioData = e.dataTransfer.getData('application/x-xportfolio-items');
    if (xportfolioData && moveItem) {
      try {
        const itemIds = JSON.parse(xportfolioData);
        for (const itemId of itemIds) {
          // Move items to desktop folder
          moveItem(itemId, SYSTEM_IDS.DESKTOP);
        }
      } catch (error) {
        console.error('Error moving items to desktop:', error);
      }
      return;
    }

    if (!isFileDropUploadEnabled()) return;

    try {
      const { files, structure } = await parseFileStructure(e);
      if (files && files.length > 0) {
        setDroppedFiles({ files, structure });
      }
    } catch (error) {
      console.error('Error parsing dropped files:', error);
    }
  }, [isFileDropUploadEnabled, moveItem]);

  const handleUploadConfirm = useCallback(async () => {
    if (!droppedFiles) return;

    const { files, structure } = droppedFiles;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length });

    // Initial delay to show animation
    await new Promise(resolve => setTimeout(resolve, 500));

    // Helper to upload a single file
    const uploadFile = async (file, parentId) => {
      const reader = new FileReader();
      const fileData = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file.fileObject);
      });

      await createFile(parentId, file.name, {
        data: fileData,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      });
    };

    // Helper to upload folder structure recursively
    const uploadFolderStructure = async (folders, parentId) => {
      for (const [folderName, folderContent] of Object.entries(folders)) {
        // Create the folder
        const folderId = await createItem(parentId, folderName, 'folder');

        // Upload files in this folder
        for (const file of folderContent.files || []) {
          await uploadFile(file, folderId);
        }

        // Recursively upload subfolders
        if (folderContent.folders && Object.keys(folderContent.folders).length > 0) {
          await uploadFolderStructure(folderContent.folders, folderId);
        }
      }
    };

    try {
      let uploadedCount = 0;

      // Upload root-level files
      for (const file of structure.files || []) {
        setUploadProgress({ current: uploadedCount, total: files.length });
        await new Promise(resolve => setTimeout(resolve, 200));
        await uploadFile(file, SYSTEM_IDS.DESKTOP);
        uploadedCount++;
        setUploadProgress({ current: uploadedCount, total: files.length });
      }

      // Upload folder structure
      if (structure.folders && Object.keys(structure.folders).length > 0) {
        await uploadFolderStructure(structure.folders, SYSTEM_IDS.DESKTOP);
      }

      // Final delay to show completion
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      setDroppedFiles(null);
      setUploadProgress(null);
    }
  }, [droppedFiles, createFile, createItem]);

  const handleUploadCancel = useCallback(() => {
    if (!isUploading) {
      setDroppedFiles(null);
      setUploadProgress(null);
    }
  }, [isUploading]);

  // Show boot screen during boot sequence
  if (state.bootState !== BOOT_STATE.DESKTOP) {
    return <BootScreen bootState={state.bootState} onComplete={onBootComplete} />;
  }

  return (
    <AppProvider appSettings={appSettings} dispatch={dispatch} addAppAction={ADD_APP}>
    <Container
      ref={ref}
      onMouseUp={onMouseUpDesktop}
      onMouseDown={onMouseDownDesktop}
      onContextMenu={onDesktopContextMenu}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      $powerState={state.powerState}
      $crtEnabled={crtEnabled}
      $wallpaper={wallpaperPath}
    >
      {isDraggingFiles && (
        <DropOverlay>
          <DropMessage>
            <DropIcon src="/icons/xp/FolderOpened.png" alt="" />
            <span>Drop files here to upload to My Documents</span>
          </DropMessage>
        </DropOverlay>
      )}
      {droppedFiles && (
        <FileUploadDialog
          files={droppedFiles}
          onConfirm={handleUploadConfirm}
          onCancel={handleUploadCancel}
          uploading={isUploading}
          progress={uploadProgress}
        />
      )}
      <Icons
        icons={state.icons}
        onMouseDown={onMouseDownIcon}
        onDoubleClick={onDoubleClickIcon}
        onContextMenu={onIconContextMenu}
        displayFocus={state.focusing === FOCUSING.ICON}
        appSettings={appSettings}
        mouse={mouse}
        selecting={state.selecting}
        setSelectedIcons={onIconsSelected}
        onUpdatePositions={onUpdateIconPositions}
        onMoveToFolder={onMoveToFolder}
        renamingIconId={renamingIconId}
        renameValue={renameValue}
        onRenameChange={setRenameValue}
        onRenameSubmit={handleIconRenameSubmit}
        onRenameCancel={handleIconRenameCancel}
        clipboardOp={clipboardOp}
        clipboard={clipboard}
      />
      <DashedBox startPos={state.selecting} mouse={mouse} />
      <Windows
        apps={state.apps}
        onMouseDown={onFocusApp}
        onClose={onCloseApp}
        onMinimize={onMinimizeWindow}
        onMaximize={onMaximizeWindow}
        focusedAppId={focusedAppId}
      />
      <Clippy />
      <Footer
        apps={state.apps}
        onMouseDownApp={onMouseDownFooterApp}
        focusedAppId={getActiveAppIdForTaskbar()}
        onMouseDown={onMouseDownFooter}
        onClickMenuItem={onClickMenuItem}
        onLaunchInstalledApp={launchInstalledApp}
        crtEnabled={crtEnabled}
        onToggleCRT={handleToggleCRT}
        playBalloonSound={playBalloon}
      />
      <CRTEffect enabled={crtEnabled} />
      {state.powerState !== POWER_STATE.START && (
        <Modal
          onClose={onModalClose}
          onRestart={onModalRestart}
          onLogOff={onModalLogOff}
          onShutDown={onModalShutDown}
          mode={state.powerState}
        />
      )}
      {iconContextMenu && (
        <ContextMenu
          overlayType="fixed"
          zIndex={10000}
          position={{ x: iconContextMenu.x, y: iconContextMenu.y }}
          items={iconMenuItems}
          onClose={closeIconContextMenu}
        />
      )}
      {desktopContextMenu && (
        <ContextMenu
          overlayType="fixed"
          zIndex={10000}
          position={{ x: desktopContextMenu.x, y: desktopContextMenu.y }}
          items={desktopMenuItems}
          onClose={() => setDesktopContextMenu(null)}
        />
      )}
      <MobileRestrictionPopup
        isOpen={isRestrictionPopupOpen}
        title={restrictionPopupData?.title}
        icon={restrictionPopupData?.icon}
        onClose={closeMobileRestrictionPopup}
      />
    </Container>
    </AppProvider>
  );
}

const powerOffAnimation = keyframes`
  0% {
    filter: brightness(1) grayscale(0);
  }
  30% {
    filter: brightness(1) grayscale(0);
  }
  100% {
    filter: brightness(0.6) grayscale(1);
  }
`;

const animation = {
  [POWER_STATE.START]: 'none',
  [POWER_STATE.TURN_OFF]: powerOffAnimation,
  [POWER_STATE.LOG_OFF]: powerOffAnimation,
};

const Container = styled.div`
  font-family: Tahoma, 'Noto Sans', sans-serif;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: url('${({ $wallpaper }) => $wallpaper || '/bliss.jpg'}') no-repeat center center fixed;
  background-size: cover;
  animation: ${({ $powerState }) => animation[$powerState]} 5s forwards;
  filter: ${({ $crtEnabled }) =>
    $crtEnabled
      ? 'brightness(1.06) contrast(1.08) saturate(1.12)'
      : 'brightness(1.01) contrast(1.015) saturate(1.02)'};
  transition: filter 0.3s ease;

  *:not(input):not(textarea) {
    user-select: none;
  }
`;

const DropOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 84, 227, 0.3);
  border: 3px dashed #0054e3;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const DropMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 48px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #0054e3;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

  span {
    font-size: 16px;
    font-weight: 600;
    color: #0054e3;
  }
`;

const DropIcon = styled.img`
  width: 64px;
  height: 64px;
`;

export default WinXP;
