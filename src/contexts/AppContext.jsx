import React, { createContext, useContext, useCallback } from 'react';
import { useFileSystem } from './FileSystemContext';

const AppContext = createContext(null);

export function AppProvider({ children, appSettings, dispatch, addAppAction }) {
  const { fileSystem, getFileContent } = useFileSystem();

  // Open a file with the appropriate application
  const openFile = useCallback(async (fileItem) => {
    if (!fileItem) return;

    // Load file data if not present (stored in IndexedDB)
    let fileData = fileItem.data;
    if (!fileData && fileItem.storageKey) {
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

    if (!fileData) {
      console.log('[openFile] No file data available');
      return;
    }

    const name = fileItem.name || '';
    const ext = name.substring(name.lastIndexOf('.')).toLowerCase();
    const contentType = fileItem.contentType || '';

    // For images, open with Image Viewer
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    if (imageTypes.includes(contentType) || imageExts.includes(ext)) {
      const imageViewerSetting = {
        ...appSettings['Image Viewer'],
        header: {
          ...appSettings['Image Viewer'].header,
          title: `${name} - Windows Picture and Fax Viewer`,
        },
        injectProps: {
          initialImage: { src: fileData, title: name },
        },
      };
      dispatch({ type: addAppAction, payload: imageViewerSetting });
      return;
    }

    // For archive files, open with WinRAR
    const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz'];
    if (archiveExtensions.includes(ext)) {
      const winrarSetting = {
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
      };
      dispatch({ type: addAppAction, payload: winrarSetting });
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

      const ieSetting = {
        ...appSettings['Internet Explorer'],
        header: {
          ...appSettings['Internet Explorer'].header,
          title: `${name} - Internet Explorer`,
        },
        injectProps: {
          initialUrl: blobUrl,
          filePath: name,
        },
      };
      dispatch({ type: addAppAction, payload: ieSetting });
      return;
    }

    // For text files, open with Notepad
    const textTypes = ['text/plain'];
    const textExtensions = ['.txt', '.log', '.md', '.json', '.js', '.jsx', '.ts', '.tsx', '.css'];
    if (textTypes.includes(contentType) || textExtensions.includes(ext)) {
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
          title: `${name} - Notepad`,
        },
        injectProps: {
          initialContent: textContent,
          fileName: name,
        },
      };
      dispatch({ type: addAppAction, payload: notepadSetting });
      return;
    }

    // For PDF files, try to open/download
    if (ext === '.pdf' || contentType === 'application/pdf') {
      const link = document.createElement('a');
      link.href = fileData;
      link.download = name;
      link.click();
      return;
    }

    // For other files, try to open/download
    const link = document.createElement('a');
    link.href = fileData;
    link.download = name;
    link.click();
  }, [fileSystem, getFileContent, appSettings, dispatch, addAppAction]);

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
