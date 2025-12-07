/**
 * Shared file opening logic used by both desktop icons and My Computer
 * This eliminates duplicate file type handling code
 */

/**
 * Opens a file with the appropriate application
 * @param {Object} params - Parameters for opening the file
 * @param {string} params.fileName - Name of the file
 * @param {string} params.fileData - Base64 encoded file data
 * @param {string} params.fileId - ID of the file in the file system
 * @param {string} params.parentFolderId - Parent folder ID (for extraction)
 * @param {string} params.contentType - MIME type of the file
 * @param {string} params.inlineContent - Inline text content (for text files)
 * @param {string} params.url - URL for .url shortcut files
 * @param {Object} appSettings - App settings object
 * @param {Function} dispatch - Dispatch function for adding apps
 * @param {string} addAppAction - Action type for adding apps
 * @returns {boolean} - True if file was handled, false if should fall through to download
 */
export function openFileWithApp({
  fileName,
  fileData,
  fileId,
  parentFolderId,
  contentType,
  inlineContent,
  url,
  appSettings,
  dispatch,
  addAppAction,
}) {
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();

  // For text files with inline content (like Project Info.txt)
  const textExtensions = ['.txt', '.log', '.md', '.json', '.js', '.jsx', '.ts', '.tsx', '.css'];
  if (inlineContent && textExtensions.includes(ext)) {
    dispatch({
      type: addAppAction,
      payload: {
        ...appSettings['Notepad'],
        header: {
          ...appSettings['Notepad'].header,
          title: `${fileName} - Notepad`,
        },
        injectProps: {
          initialContent: inlineContent,
          fileName: fileName,
          fileId: fileId,
        },
      },
    });
    return true;
  }

  // For text files with no data (newly created empty files)
  if (!fileData && !inlineContent && textExtensions.includes(ext)) {
    dispatch({
      type: addAppAction,
      payload: {
        ...appSettings['Notepad'],
        header: {
          ...appSettings['Notepad'].header,
          title: `${fileName} - Notepad`,
        },
        injectProps: {
          initialContent: '',
          fileName: fileName,
          fileId: fileId,
        },
      },
    });
    return true;
  }

  // For URL/Internet shortcut files
  if (ext === '.url' && url) {
    // External URLs can't be loaded in iframes due to X-Frame-Options
    // Open them in a new browser tab instead
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }

  // If no file data at this point, can't proceed
  if (!fileData) {
    return false;
  }

  // For images
  const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  if (imageTypes.includes(contentType) || imageExts.includes(ext)) {
    dispatch({
      type: addAppAction,
      payload: {
        ...appSettings['Image Viewer'],
        header: {
          ...appSettings['Image Viewer'].header,
          title: `${fileName} - Windows Picture and Fax Viewer`,
        },
        injectProps: {
          initialImage: { src: fileData, title: fileName },
        },
      },
    });
    return true;
  }

  // For archive files
  const archiveExtensions = ['.zip', '.rar', '.7z', '.tar', '.gz'];
  if (archiveExtensions.includes(ext)) {
    dispatch({
      type: addAppAction,
      payload: {
        ...appSettings['WinRAR'],
        header: {
          ...appSettings['WinRAR'].header,
          title: `Extracting ${fileName}`,
        },
        injectProps: {
          fileData: fileData,
          fileName: fileName,
          parentFolderId: parentFolderId,
        },
      },
    });
    return true;
  }

  // For font files
  const fontExtensions = ['.ttf', '.otf', '.woff', '.woff2', '.fon'];
  if (fontExtensions.includes(ext)) {
    dispatch({
      type: addAppAction,
      payload: {
        ...appSettings['Font Viewer'],
        header: {
          ...appSettings['Font Viewer'].header,
          title: fileName,
        },
        injectProps: {
          fontData: fileData,
          fontName: fileName,
        },
      },
    });
    return true;
  }

  // For EML files
  if (ext === '.eml') {
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
          title: `${fileName} - Outlook Express`,
        },
        injectProps: {
          emlData: emlContent,
          emlFileName: fileName,
        },
      },
    });
    return true;
  }

  // For audio/video files
  const audioExts = ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'];
  const videoExts = ['.mp4', '.webm', '.mkv', '.avi', '.mov'];
  const mediaExts = [...audioExts, ...videoExts];
  const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/flac', 'audio/aac'];
  const videoTypes = ['video/mp4', 'video/webm', 'video/x-matroska', 'video/avi', 'video/quicktime'];
  const mediaTypes = [...audioTypes, ...videoTypes];

  if (mediaTypes.includes(contentType) || mediaExts.includes(ext)) {
    dispatch({
      type: addAppAction,
      payload: {
        ...appSettings['Windows Media Player'],
        header: {
          ...appSettings['Windows Media Player'].header,
          title: `${fileName} - Windows Media Player`,
        },
        injectProps: {
          fileData: fileData,
          fileName: fileName,
        },
      },
    });
    return true;
  }

  // For PDF files
  if (ext === '.pdf' || contentType === 'application/pdf') {
    if (appSettings['Adobe Reader']) {
      dispatch({
        type: addAppAction,
        payload: {
          ...appSettings['Adobe Reader'],
          header: {
            ...appSettings['Adobe Reader'].header,
            title: `Adobe Reader - [${fileName}]`,
          },
          injectProps: {
            pdfData: fileData,
            pdfName: fileName,
          },
        },
      });
      return true;
    }
  }

  // For HTML files
  const htmlExtensions = ['.html', '.htm'];
  if (htmlExtensions.includes(ext)) {
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
          title: `${fileName} - Internet Explorer`,
        },
        injectProps: {
          initialUrl: blobUrl,
          filePath: fileName,
        },
      },
    });
    return true;
  }

  // For text files
  const textTypes = ['text/plain'];
  if (textTypes.includes(contentType) || textExtensions.includes(ext)) {
    let textContent = '';
    try {
      const base64Data = fileData.split(',')[1] || fileData;
      textContent = atob(base64Data);
    } catch (e) {
      textContent = fileData;
    }

    dispatch({
      type: addAppAction,
      payload: {
        ...appSettings['Notepad'],
        header: {
          ...appSettings['Notepad'].header,
          title: `${fileName} - Notepad`,
        },
        injectProps: {
          initialContent: textContent,
          fileName: fileName,
          fileId: fileId,
        },
      },
    });
    return true;
  }

  // File type not handled - return false to indicate fallback to download
  return false;
}

/**
 * Downloads a file
 * @param {string} fileData - Base64 encoded file data
 * @param {string} fileName - Name of the file
 */
export function downloadFile(fileData, fileName) {
  const link = document.createElement('a');
  link.href = fileData;
  link.download = fileName;
  link.click();
}
