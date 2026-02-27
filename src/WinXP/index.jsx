import React, { useRef, useCallback, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useMouse, useWindowSize, useMobileRestriction } from '../hooks';
import useSystemSounds from '../hooks/useSystemSounds';
import { useConfig } from '../contexts/ConfigContext';
import { useUserSettings } from '../contexts/UserSettingsContext';
import MobileRestrictionPopup from '../components/MobileRestrictionPopup';
import { useFileSystem, SYSTEM_IDS } from '../contexts/FileSystemContext';
import { useInstalledApps } from '../contexts/InstalledAppsContext';
import { useStartMenu } from '../contexts/StartMenuContext';
import { useUserAccounts } from '../contexts/UserAccountsContext';
import { AppProvider } from '../contexts/AppContext';
import { RunningAppsProvider } from '../contexts/RunningAppsContext';
import { MessageBoxProvider } from '../contexts/MessageBoxContext';
import { ContextMenu } from './components/ContextMenu';
import FileUploadDialog from './FileUploadDialog';
import { useFileContextMenu, useBackgroundContextMenu } from './hooks/useFileContextMenu';

// Import extracted hooks
import { useDesktopReducer } from './hooks/useDesktopReducer';
import { useIconManager } from './hooks/useIconManager';
import { useFileHandler } from './hooks/useFileHandler';
import { useFileUpload } from './hooks/useFileUpload';
import { useContextMenuActions } from './hooks/useContextMenuActions';
import { useMobileAppLauncher } from './hooks/useMobileAppLauncher';

// Import components
import { DesktopDropOverlay } from './components/DesktopDropOverlay';

import {
  ADD_APP,
  FOCUS_APP,
  MINIMIZE_APP,
  DEL_APP,
  FOCUS_ICON,
  SELECT_ICONS,
  FOCUS_DESKTOP,
  START_SELECT,
  END_SELECT,
  POWER_OFF,
  CANCEL_POWER_OFF,
  SET_BOOT_STATE,
  CLOSE_ALL_APPS,
} from './constants/actions';
import { FOCUSING, POWER_STATE, BOOT_STATE } from './constants';
import { appSettings } from './apps';
import Modal from './Modal';
import Footer from './Footer';
import Windows from './Windows';
import Icons from './Icons';
import DashedBox from '../components/DashedBox';
import BootScreen from './BootScreen';
import Clippy from './Clippy';
import CRTEffect from './CRTEffect';

function WinXP() {
  const { state, dispatch, getFocusedAppId, getActiveAppIdForTaskbar } = useDesktopReducer();
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [showClippy, setShowClippy] = useState(true);
  const [clippyHiddenOnMobile, setClippyHiddenOnMobile] = useState(() => {
    try {
      const saved = localStorage.getItem('xp-clippy-hidden-mobile');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [hasPendingUpdates] = useState(true); // Set to true to show update dialog
  const ref = useRef(null);
  const mouse = useMouse(ref);
  const { width } = useWindowSize();
  const focusedAppId = getFocusedAppId();
  const { playLogoff, playBalloon, playMinimize, playRestore } = useSystemSounds();
  const { isFileDropUploadEnabled, isFileDropOverlayEnabled } = useConfig();
  const { getWallpaperPath, getDesktopIconPositions, setDesktopIconPositions, windowSoundsEnabled } = useUserSettings();
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
  const {
    getStartupItems,
    startupAppsRun,
    setStartupAppsRun,
    pinToStartMenu,
    unpinFromStartMenu,
    isAppPinnedToStartMenu,
    addToStartup,
    removeFromStartup,
    isInStartup,
  } = useStartMenu();
  const { activeUserId, sessionRestored, isLoading: userAccountsLoading, logoutUser } = useUserAccounts();

  // Track previous user ID to detect user changes
  const prevUserIdRef = useRef(activeUserId);

  // Close all apps when user changes (switching accounts)
  useEffect(() => {
    if (prevUserIdRef.current !== null && prevUserIdRef.current !== activeUserId) {
      dispatch({ type: CLOSE_ALL_APPS });
    }
    prevUserIdRef.current = activeUserId;
  }, [activeUserId, dispatch]);

  // Mobile restriction handling
  const {
    isRestrictionPopupOpen,
    restrictionPopupData,
    checkMobileRestriction,
    closePopup: closeMobileRestrictionPopup,
  } = useMobileRestriction();

  // Mobile app launcher for fullscreen settings
  const { applyMobileSettings, isMobile: isMobileDevice } = useMobileAppLauncher(dispatch);

  // Register callback to launch installed apps
  useEffect(() => {
    const handleLaunchApp = (app) => {
      // Check if app is available on mobile
      const mobileAvailable = app.windowSettings?.mobileAvailable ?? true;
      if (isMobileDevice && !mobileAvailable) {
        // Show mobile restriction popup
        checkMobileRestriction(app.name, { mobileAvailable: false, header: { title: app.name, icon: app.icon } });
        return;
      }

      // Determine if app should open fullscreen on mobile
      const mobileFullscreen = app.windowSettings?.mobileFullscreen ?? true;
      const shouldMaximize = isMobileDevice && mobileFullscreen;

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
        maximized: shouldMaximize,
        injectProps: {
          appId: app.id,
          url: app.url,
        },
      };
      dispatch({ type: ADD_APP, payload: iframeAppSetting });
    };

    registerLaunchCallback(handleLaunchApp);
  }, [registerLaunchCallback, dispatch, isMobileDevice, checkMobileRestriction]);

  // Determine if mobile based on viewport width
  const isMobile = width < 768;
  const wallpaperPath = getWallpaperPath(isMobile);

  // Icon manager hook
  const {
    alignToGridEnabled,
    autoArrangeEnabled,
    onUpdateIconPositions,
    onMoveToFolder,
    handleArrangeByName,
    handleArrangeBySize,
    handleArrangeByType,
    handleArrangeByModified,
    handleAutoArrange,
    handleAlignToGrid,
    refreshIcons,
  } = useIconManager({
    dispatch,
    icons: state.icons,
    fileSystem,
    fsLoading,
    getFolderContents,
    getDesktopIconPositions,
    setDesktopIconPositions,
    appSettings,
    moveItem,
  });

  // File handler hook
  const { onDoubleClickIcon } = useFileHandler({
    dispatch,
    appSettings,
    fileSystem,
    getFileContent,
    checkMobileRestriction,
  });

  // File upload hook
  const {
    isDraggingFiles,
    droppedFiles,
    uploadProgress,
    isUploading,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleUploadConfirm,
    handleUploadCancel,
  } = useFileUpload({
    createFile,
    createItem,
    moveItem,
    isFileDropUploadEnabled,
  });

  // Context menu actions hook
  const {
    desktopContextMenu,
    setDesktopContextMenu,
    iconContextMenu,
    renamingIconId,
    renameValue,
    setRenameValue,
    onDesktopContextMenu,
    onIconContextMenu,
    handleDesktopMenuAction,
    handleIconMenuAction,
    handleIconRenameSubmit,
    handleIconRenameCancel,
    closeIconContextMenu,
    iconContextMenuItem,
    selectedIconCount,
    isMyComputerIcon,
    isRecycleBinIcon,
    isIconPinnedToStartMenu,
    isIconInStartup,
    isShortcutIcon,
  } = useContextMenuActions({
    dispatch,
    icons: state.icons,
    appSettings,
    fileSystem,
    createItem,
    createFile,
    renameItem,
    moveToRecycleBin,
    copy,
    cut,
    paste,
    clipboard,
    clipboardOp,
    getFileContent,
    pinToStartMenu,
    unpinFromStartMenu,
    isAppPinnedToStartMenu,
    addToStartup,
    removeFromStartup,
    isInStartup,
    onDoubleClickIcon,
    refreshIcons,
  });

  // Skip boot sequence if session was restored from cache
  useEffect(() => {
    if (sessionRestored && !userAccountsLoading && state.bootState === BOOT_STATE.BOOTING) {
      console.log('[Session] Skipping boot - session restored, jumping to desktop');
      dispatch({ type: SET_BOOT_STATE, payload: BOOT_STATE.DESKTOP });
    }
  }, [sessionRestored, userAccountsLoading, state.bootState, dispatch]);

  // Run startup folder apps when desktop loads (once per session)
  useEffect(() => {
    if (state.bootState === BOOT_STATE.DESKTOP && !startupAppsRun && !fsLoading && fileSystem) {
      setStartupAppsRun(true);
      const startupItems = getStartupItems();
      if (startupItems && startupItems.length > 0) {
        console.log('[Startup] Running startup apps:', startupItems.map(i => i.name));
        setTimeout(() => {
          startupItems.forEach((item, index) => {
            setTimeout(() => {
              if (item.type === 'shortcut' && item.target) {
                const appSetting = appSettings[item.target];
                if (appSetting) {
                  dispatch({ type: ADD_APP, payload: applyMobileSettings(appSetting, item.target) });
                }
              }
            }, index * 500);
          });
        }, 1000);
      }
    }
  }, [state.bootState, startupAppsRun, fsLoading, fileSystem, getStartupItems, setStartupAppsRun, dispatch, applyMobileSettings]);

  const handleToggleCRT = useCallback(() => {
    setCrtEnabled((prev) => !prev);
  }, []);

  const onFocusApp = useCallback((id) => {
    dispatch({ type: FOCUS_APP, payload: id });
  }, [dispatch]);

  const onMaximizeWindow = useCallback(
    (id) => {
      if (focusedAppId === id) {
        if (windowSoundsEnabled) {
          playRestore();
        }
        dispatch({ type: 'TOGGLE_MAXIMIZE_APP', payload: id });
      }
    },
    [focusedAppId, dispatch, windowSoundsEnabled, playRestore]
  );

  const onMinimizeWindow = useCallback(
    (id) => {
      if (focusedAppId === id) {
        if (windowSoundsEnabled) {
          playMinimize();
        }
        dispatch({ type: MINIMIZE_APP, payload: id });
      }
    },
    [focusedAppId, dispatch, windowSoundsEnabled, playMinimize]
  );

  const onCloseApp = useCallback(
    (id) => {
      if (focusedAppId === id) {
        dispatch({ type: DEL_APP, payload: id });
      }
    },
    [focusedAppId, dispatch]
  );

  const onMinimizeAll = useCallback(() => {
    dispatch({ type: 'MINIMIZE_ALL_APPS' });
  }, [dispatch]);

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

  function onMouseDownFooter() {
    dispatch({ type: FOCUS_DESKTOP });
  }

  function onClickMenuItem(appName, injectProps = {}) {
    const appSetting = appSettings[appName];

    if (!checkMobileRestriction(appName, appSetting)) {
      return;
    }

    if (appSetting) {
      dispatch({
        type: ADD_APP,
        payload: applyMobileSettings({
          ...appSetting,
          injectProps: { ...appSetting.injectProps, ...injectProps },
        }, appName),
      });
    } else if (appName === 'Log Off') {
      playLogoff();
      dispatch({ type: POWER_OFF, payload: POWER_STATE.LOG_OFF });
    } else if (appName === 'Turn Off Computer') {
      dispatch({ type: POWER_OFF, payload: POWER_STATE.TURN_OFF });
    } else {
      console.warn(`App not found: ${appName}`);
    }
  }

  function onMouseDownDesktop(e) {
    if (e.target === e.currentTarget || e.target.closest('[data-desktop-area]')) {
      setDesktopContextMenu(null);
      dispatch({
        type: START_SELECT,
        payload: { x: e.pageX, y: e.pageY },
      });
    }
  }

  function onMouseUpDesktop() {
    dispatch({ type: END_SELECT });
  }

  const onIconsSelected = useCallback((iconIds) => {
    dispatch({ type: SELECT_ICONS, payload: iconIds });
  }, [dispatch]);

  // Use the shared hook for icon context menu
  const iconMenuItems = useFileContextMenu({
    selectedItem: iconContextMenuItem,
    isMultiSelect: selectedIconCount > 1,
    isMyComputer: isMyComputerIcon,
    isRecycleBin: isRecycleBinIcon,
    isShortcut: isShortcutIcon,
    isPinnedToStartMenu: isIconPinnedToStartMenu,
    isInStartup: isIconInStartup,
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
    onPinToStartMenu: () => handleIconMenuAction('pinToStartMenu'),
    onUnpinFromStartMenu: () => handleIconMenuAction('unpinFromStartMenu'),
    onAddToStartup: () => handleIconMenuAction('addToStartup'),
    onRemoveFromStartup: () => handleIconMenuAction('removeFromStartup'),
  });

  // Use the shared hook for desktop background context menu
  const desktopMenuItems = useBackgroundContextMenu({
    clipboard,
    onRefresh: () => handleDesktopMenuAction('refresh'),
    onPaste: () => handleDesktopMenuAction('paste'),
    onNewFolder: () => handleDesktopMenuAction('newFolder'),
    onNewBriefcase: () => handleDesktopMenuAction('newBriefcase'),
    onNewTextDoc: () => handleDesktopMenuAction('newTextDoc'),
    onNewShortcut: () => handleDesktopMenuAction('newShortcut'),
    onProperties: () => handleDesktopMenuAction('properties'),
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
    dispatch({ type: CANCEL_POWER_OFF });
    // Close all apps and go back to boot screen
    dispatch({ type: CLOSE_ALL_APPS });
    dispatch({ type: SET_BOOT_STATE, payload: BOOT_STATE.BOOTING });
  }

  function onModalLogOff() {
    playLogoff();
    dispatch({ type: CANCEL_POWER_OFF });
    logoutUser();
    dispatch({ type: SET_BOOT_STATE, payload: BOOT_STATE.LOGIN });
  }

  function onModalShutDown() {
    // Shut down with updates (if any)
    dispatch({ type: CANCEL_POWER_OFF });
    // In a real scenario, this would install updates first
  }

  function onModalShutDownWithoutUpdates() {
    // Shut down without installing updates
    dispatch({ type: CANCEL_POWER_OFF });
  }

  function onModalClose() {
    dispatch({ type: CANCEL_POWER_OFF });
  }

  function onBootComplete() {
    dispatch({ type: SET_BOOT_STATE, payload: BOOT_STATE.DESKTOP });
  }

  const handleEndTask = useCallback((id) => {
    dispatch({ type: DEL_APP, payload: id });
  }, [dispatch]);

  const handleSwitchToApp = useCallback((id) => {
    dispatch({ type: FOCUS_APP, payload: id });
  }, [dispatch]);

  const handleEndClippy = useCallback(() => {
    setShowClippy(false);
  }, []);

  const handleHideClippyMobile = useCallback(() => {
    setClippyHiddenOnMobile(true);
    try {
      localStorage.setItem('xp-clippy-hidden-mobile', 'true');
    } catch (e) {
      console.error('Failed to save Clippy mobile preference:', e);
    }
  }, []);

  const handleShowClippyMobile = useCallback(() => {
    setClippyHiddenOnMobile(false);
    try {
      localStorage.removeItem('xp-clippy-hidden-mobile');
    } catch (e) {
      console.error('Failed to clear Clippy mobile preference:', e);
    }
  }, []);

  // Show boot screen during boot sequence
  if (state.bootState !== BOOT_STATE.DESKTOP) {
    if (sessionRestored || userAccountsLoading) {
      return (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: wallpaperPath ? `url(${wallpaperPath}) center/cover no-repeat` : '#3a6ea5',
          zIndex: 99999,
        }} />
      );
    }
    return <BootScreen bootState={state.bootState} onComplete={onBootComplete} />;
  }

  return (
    <AppProvider appSettings={appSettings} dispatch={dispatch} addAppAction={ADD_APP}>
      <MessageBoxProvider dispatch={dispatch} appSettings={appSettings} addAppAction={ADD_APP}>
      <RunningAppsProvider apps={state.apps} onEndTask={handleEndTask} onSwitchTo={handleSwitchToApp} showClippy={showClippy} onEndClippy={handleEndClippy}>
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
        {isDraggingFiles && isFileDropOverlayEnabled() && <DesktopDropOverlay />}
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
        {showClippy && !(isMobile && clippyHiddenOnMobile) && (
          <Clippy isMobile={isMobile} onHideMobile={handleHideClippyMobile} />
        )}
        <Footer
          apps={state.apps}
          onMouseDownApp={onMouseDownFooterApp}
          focusedAppId={getActiveAppIdForTaskbar()}
          onMouseDown={onMouseDownFooter}
          onClickMenuItem={onClickMenuItem}
          onLaunchInstalledApp={launchInstalledApp}
          onMinimizeAll={onMinimizeAll}
          crtEnabled={crtEnabled}
          onToggleCRT={handleToggleCRT}
          playBalloonSound={playBalloon}
          clippyHiddenOnMobile={clippyHiddenOnMobile}
          isMobile={isMobile}
          onShowClippy={handleShowClippyMobile}
        />
        <CRTEffect enabled={crtEnabled} />
        {state.powerState !== POWER_STATE.START && (
          <Modal
            onClose={onModalClose}
            onRestart={onModalRestart}
            onLogOff={onModalLogOff}
            onShutDown={onModalShutDown}
            onShutDownWithoutUpdates={onModalShutDownWithoutUpdates}
            mode={state.powerState}
            hasUpdates={hasPendingUpdates}
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
      </RunningAppsProvider>
      </MessageBoxProvider>
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
  -webkit-touch-callout: none;
`;

export default WinXP;
