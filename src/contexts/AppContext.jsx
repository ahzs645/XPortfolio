import React, { createContext, useContext, useCallback } from 'react';
import { useFileSystem } from './FileSystemContext';
import { getDefaultProgramForFile } from '../WinXP/apps/Installer/components/SetProgramDefaults';
import { openFileWithApp, downloadFile } from '../utils/fileOpener';

const AppContext = createContext(null);

// Map user-friendly program names to appSettings keys
const PROGRAM_NAME_TO_APP_KEY = {
  'Internet Explorer': 'Internet Explorer',
  'Notepad': 'Notepad',
  'Windows Media Player': 'Media Player',
  'Winamp': 'Winamp',
  'Image Viewer': 'Image Viewer',
  'Paint': 'Paint',
  'WinRAR': 'WinRAR',
  'Font Viewer': 'Font Viewer',
  'Outlook Express': 'Outlook Express',
};

export function AppProvider({ children, appSettings, dispatch, addAppAction }) {
  const { fileSystem, getFileContent } = useFileSystem();

  // Helper to open a file with a specific program
  const openWithProgram = useCallback((programName, fileItem, fileData) => {
    const name = fileItem.name || '';
    const ext = name.substring(name.lastIndexOf('.')).toLowerCase();
    const appKey = PROGRAM_NAME_TO_APP_KEY[programName];

    if (!appKey || !appSettings[appKey]) {
      return false; // Program not available
    }

    // Handle each program type
    switch (programName) {
      case 'Notepad': {
        let textContent = '';
        if (fileData) {
          try {
            const base64Data = fileData.split(',')[1] || fileData;
            textContent = atob(base64Data);
          } catch (e) {
            textContent = fileData;
          }
        }
        dispatch({
          type: addAppAction,
          payload: {
            ...appSettings['Notepad'],
            header: {
              ...appSettings['Notepad'].header,
              title: `${name} - Notepad`,
            },
            injectProps: {
              initialContent: textContent,
              fileName: name,
              fileId: fileItem.id,
            },
          },
        });
        return true;
      }

      case 'Image Viewer':
      case 'Paint': {
        const viewerKey = programName === 'Paint' ? 'Paint' : 'Image Viewer';
        const injectProps = programName === 'Paint'
          ? {
              imagePath: fileData,
              fileName: name,
              fileId: fileItem.id,
            }
          : {
              initialImage: { src: fileData, title: name },
            };
        dispatch({
          type: addAppAction,
          payload: {
            ...appSettings[viewerKey],
            header: {
              ...appSettings[viewerKey].header,
              title: `${name} - ${programName === 'Paint' ? 'Paint' : 'Windows Picture and Fax Viewer'}`,
            },
            injectProps,
          },
        });
        return true;
      }

      case 'Internet Explorer': {
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
        dispatch({
          type: addAppAction,
          payload: {
            ...appSettings['Internet Explorer'],
            header: {
              ...appSettings['Internet Explorer'].header,
              title: `${name} - Internet Explorer`,
            },
            injectProps: {
              initialUrl: blobUrl,
              filePath: name,
            },
          },
        });
        return true;
      }

      case 'WinRAR': {
        dispatch({
          type: addAppAction,
          payload: {
            ...appSettings['WinRAR'],
            header: {
              ...appSettings['WinRAR'].header,
              title: `Extracting ${name}`,
            },
            injectProps: {
              fileData: fileData,
              fileName: name,
              parentFolderId: fileItem.parent,
            },
          },
        });
        return true;
      }

      case 'Windows Media Player':
      case 'Winamp': {
        const playerKey = programName === 'Winamp' ? 'Winamp' : 'Media Player';
        if (!appSettings[playerKey]) return false;
        dispatch({
          type: addAppAction,
          payload: {
            ...appSettings[playerKey],
            header: {
              ...appSettings[playerKey].header,
              title: `${name} - ${programName}`,
            },
            injectProps: {
              initialTrack: { src: fileData, title: name },
            },
          },
        });
        return true;
      }

      case 'Font Viewer': {
        dispatch({
          type: addAppAction,
          payload: {
            ...appSettings['Font Viewer'],
            header: {
              ...appSettings['Font Viewer'].header,
              title: name,
            },
            injectProps: {
              fontData: fileData,
              fontName: name,
            },
          },
        });
        return true;
      }

      case 'Outlook Express': {
        // Decode base64 data to text for EML files
        let emlContent = '';
        try {
          const base64Data = fileData.split(',')[1] || fileData;
          emlContent = atob(base64Data);
        } catch (e) {
          emlContent = fileData;
        }
        dispatch({
          type: addAppAction,
          payload: {
            ...appSettings['Outlook Express'],
            header: {
              ...appSettings['Outlook Express'].header,
              title: `${name} - Outlook Express`,
            },
            injectProps: {
              emlData: emlContent,
              emlFileName: name,
            },
          },
        });
        return true;
      }

      default:
        return false;
    }
  }, [appSettings, dispatch, addAppAction]);

  // Open a file with the appropriate application
  const openFile = useCallback(async (fileItem) => {
    if (!fileItem) return;

    // Load file data if not present (stored in IndexedDB)
    let fileData = fileItem.data;
    // Check for inline content (used by Projects folder text files)
    const inlineContent = fileItem.content;

    // Check for storageKey or storageType to load from IndexedDB
    if (!fileData && !inlineContent && (fileItem.storageKey || fileItem.storageType === 'local')) {
      const blob = await getFileContent(fileItem.id);
      if (blob) {
        // Convert blob to data URL
        fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
    }

    const name = fileItem.name || '';
    const ext = name.substring(name.lastIndexOf('.')).toLowerCase();
    const contentType = fileItem.contentType || '';

    // Check for user-configured default program (skip for inline content files)
    if (!inlineContent && !fileItem.url) {
      const defaultProgram = getDefaultProgramForFile(name);
      if (defaultProgram) {
        const opened = openWithProgram(defaultProgram, fileItem, fileData);
        if (opened) return;
        // If the default program couldn't open the file, fall through to default behavior
      }
    }

    // Use shared file opener utility
    const handled = openFileWithApp({
      fileName: name,
      fileData,
      fileId: fileItem.id,
      parentFolderId: fileItem.parent,
      contentType,
      inlineContent,
      url: fileItem.url,
      appSettings,
      dispatch,
      addAppAction,
    });

    if (!handled && fileData) {
      // Fall back to download for unhandled file types
      downloadFile(fileData, name);
    }
  }, [fileSystem, getFileContent, appSettings, dispatch, addAppAction, openWithProgram]);

  // Open an app by name
  const openApp = useCallback((appName, injectProps = {}) => {
    const appSetting = appSettings[appName];
    if (appSetting) {
      dispatch({
        type: addAppAction,
        payload: {
          ...appSetting,
          injectProps: { ...appSetting.injectProps, ...injectProps },
        },
      });
    }
  }, [appSettings, dispatch, addAppAction]);

  const value = {
    openFile,
    openApp,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
