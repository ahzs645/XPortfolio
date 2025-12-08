import { useCallback } from 'react';
import { ADD_APP } from '../constants/actions';
import { getDefaultProgramForFile } from '../apps/Installer/components/SetProgramDefaults';
import { openFileWithApp, downloadFile } from '../../utils/fileOpener';

/**
 * Hook for handling file/icon double-click operations
 */
export function useFileHandler({
  dispatch,
  appSettings,
  fileSystem,
  getFileContent,
  checkMobileRestriction,
}) {
  const onDoubleClickIcon = useCallback(async (icon) => {
    console.log('[DoubleClick]', icon.title, 'type:', icon.type, 'hasData:', !!icon.data);

    // Handle system icons (My Computer, Recycle Bin) - launch the target app
    if (icon.type === 'system' && icon.target) {
      if (!checkMobileRestriction(icon.target)) {
        return; // Blocked on mobile, popup will be shown
      }

      const appSetting = appSettings[icon.target];
      if (appSetting) {
        dispatch({ type: ADD_APP, payload: appSetting });
      }
      return;
    }

    // Handle shortcuts - launch the target app or open folder/file
    if (icon.type === 'shortcut' && icon.target) {
      if (!checkMobileRestriction(icon.target)) {
        return; // Blocked on mobile, popup will be shown
      }

      // First, check if the shortcut points to a folder (has fsId and targetType)
      const shortcutItem = fileSystem?.[icon.id];
      if (shortcutItem?.fsId && shortcutItem?.targetType === 'folder') {
        // Open folder in My Computer
        const myComputerSetting = {
          ...appSettings['My Computer'],
          injectProps: {
            initialPath: shortcutItem.fsId,
          },
        };
        dispatch({ type: ADD_APP, payload: myComputerSetting });
        return;
      }

      // Check if it's a file shortcut
      if (shortcutItem?.fsId && (shortcutItem?.targetType === 'file' || shortcutItem?.targetType === 'executable')) {
        // Get the target file and open it
        const targetFile = fileSystem?.[shortcutItem.fsId];
        if (targetFile) {
          // Recursively call with the target file as the icon
          await onDoubleClickIcon({
            ...targetFile,
            title: targetFile.name,
          });
        }
        return;
      }

      // Otherwise, try to launch as an app
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
      const fileItem = fileSystem?.[icon.id];

      // Check for inline content (used by Projects folder text files)
      let inlineContent = fileItem?.content;

      if (!fileData && !inlineContent) {
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
          const playerKey = defaultProgram === 'Winamp' ? 'Winamp' : 'Windows Media Player';
          if (appSettings[playerKey]) {
            dispatch({
              type: ADD_APP,
              payload: {
                ...appSettings[playerKey],
                header: { ...appSettings[playerKey].header, title: `${icon.title} - ${defaultProgram}` },
                injectProps: { fileData: fileData, fileName: icon.title },
              },
            });
            handled = true;
          }
        }

        if (handled) return;
      }

      // Use shared file opener utility
      const handled = openFileWithApp({
        fileName: icon.title,
        fileData,
        fileId: icon.id,
        parentFolderId: null, // Desktop files extract to desktop
        contentType: icon.fileType,
        inlineContent,
        url: fileItem?.url,
        appSettings,
        dispatch,
        addAppAction: ADD_APP,
      });

      if (!handled && fileData) {
        // Fall back to download for unhandled file types
        downloadFile(fileData, icon.title);
      }
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
  }, [dispatch, appSettings, fileSystem, getFileContent, checkMobileRestriction]);

  return {
    onDoubleClickIcon,
  };
}

export default useFileHandler;
