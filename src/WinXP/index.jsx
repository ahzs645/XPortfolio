import React, { useReducer, useRef, useCallback, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useMouse, useWindowSize } from '../hooks';
import useSystemSounds from '../hooks/useSystemSounds';
import { useConfig } from '../contexts/ConfigContext';
import { useFileSystem, SYSTEM_IDS, XP_ICONS } from '../contexts/FileSystemContext';
import { parseFileStructure } from '../utils/fileDropParser';
import FileUploadDialog from './FileUploadDialog';

// Convert file system items to desktop icon format
const convertToDesktopIcons = (items, appSettings, savedPositions = {}) => {
  const iconWidth = 80;
  const iconHeight = 90;
  const iconGapX = 10;
  const iconGapY = 10;
  const startX = 10;
  const startY = 10;
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

    return {
      id: item.id,
      programId: item.id,
      icon: item.icon || XP_ICONS.file,
      title: item.name,
      component: component,
      isFocus: false,
      x: validX,
      y: validY,
      // Extra info for file handling
      type: item.type,
      target: item.target,
      data: item.data,
      fileType: item.type === 'file' ? item.contentType : null,
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
      // Save to localStorage
      saveIconPositions(updatedIcons);
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
  const ref = useRef(null);
  const dragCounterRef = useRef(0);
  const mouse = useMouse(ref);
  const { width } = useWindowSize();
  const focusedAppId = getFocusedAppId();
  const { playLogoff, playBalloon } = useSystemSounds();
  const { getWallpaperPath, isLoading: configLoading } = useConfig();
  const { createFile, createItem, getFolderContents, getFileContent, fileSystem, isLoading: fsLoading } = useFileSystem();

  // Determine if mobile based on viewport width
  const isMobile = width < 768;
  const wallpaperPath = getWallpaperPath(isMobile);

  // Get saved icon positions from localStorage
  const getSavedPositions = useCallback(() => {
    try {
      const saved = localStorage.getItem('desktopIconPositions');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, []);

  // Update desktop icons from file system Desktop folder
  useEffect(() => {
    if (!fsLoading && fileSystem) {
      const desktopContents = getFolderContents(SYSTEM_IDS.DESKTOP);
      const savedPositions = getSavedPositions();
      const icons = convertToDesktopIcons(desktopContents, appSettings, savedPositions);
      dispatch({ type: SET_ICONS, payload: icons });
    }
  }, [fsLoading, fileSystem, getFolderContents, getSavedPositions]);

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

    // Handle shortcuts - launch the target app
    if (icon.type === 'shortcut' && icon.target) {
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

  function onMouseDownFooter() {
    dispatch({ type: FOCUS_DESKTOP });
  }

  function onClickMenuItem(appName) {
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
    if (e.target === e.currentTarget) {
      dispatch({
        type: START_SELECT,
        payload: { x: mouse.docX, y: mouse.docY },
      });
    }
  }

  function onMouseUpDesktop() {
    dispatch({ type: END_SELECT });
  }

  const onIconsSelected = useCallback((iconIds) => {
    dispatch({ type: SELECT_ICONS, payload: iconIds });
  }, []);

  const onUpdateIconPositions = useCallback((positions) => {
    dispatch({ type: UPDATE_ICON_POSITIONS, payload: positions });
  }, []);

  function onClickModalButton() {
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
    if (e.dataTransfer?.types?.includes('Files')) {
      setIsDraggingFiles(true);
    }
  }, []);

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
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFiles(false);
    dragCounterRef.current = 0;

    try {
      const { files, structure } = await parseFileStructure(e);
      if (files && files.length > 0) {
        setDroppedFiles({ files, structure });
      }
    } catch (error) {
      console.error('Error parsing dropped files:', error);
    }
  }, []);

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
    <Container
      ref={ref}
      onMouseUp={onMouseUpDesktop}
      onMouseDown={onMouseDownDesktop}
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
        displayFocus={state.focusing === FOCUSING.ICON}
        appSettings={appSettings}
        mouse={mouse}
        selecting={state.selecting}
        setSelectedIcons={onIconsSelected}
        onUpdatePositions={onUpdateIconPositions}
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
        focusedAppId={focusedAppId}
        onMouseDown={onMouseDownFooter}
        onClickMenuItem={onClickMenuItem}
        crtEnabled={crtEnabled}
        onToggleCRT={handleToggleCRT}
        playBalloonSound={playBalloon}
      />
      <CRTEffect enabled={crtEnabled} />
      {state.powerState !== POWER_STATE.START && (
        <Modal
          onClose={onModalClose}
          onClickButton={onClickModalButton}
          mode={state.powerState}
        />
      )}
    </Container>
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
