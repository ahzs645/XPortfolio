/**
 * File Drop Parser Utility
 * Handles drag-and-drop file uploads, including recursive folder parsing
 */

// Traverse a directory entry recursively
const traverseDirectory = (entry) => {
  const reader = entry.createReader();
  return new Promise((resolve) => {
    const iterationAttempts = [];

    function readEntries() {
      reader.readEntries((batchEntries) => {
        if (!batchEntries.length) {
          resolve(Promise.all(iterationAttempts));
        } else {
          iterationAttempts.push(
            Promise.all(
              batchEntries.map((batchEntry) => {
                if (batchEntry.isDirectory) {
                  return traverseDirectory(batchEntry);
                }
                return Promise.resolve(batchEntry);
              })
            )
          );
          readEntries();
        }
      }, () => {}); // Error handler
    }

    readEntries();
  });
};

// Package a file with metadata
const packageFile = (file, entry) => ({
  fileObject: file,
  fullPath: entry ? entry.fullPath : `/${file.name}`,
  lastModified: file.lastModified,
  name: file.name,
  size: file.size,
  type: file.type,
});

// Get file from entry
const getFile = (entry) => {
  return new Promise((resolve) => {
    entry.file((file) => {
      resolve(packageFile(file, entry));
    });
  });
};

// Handle file promises
const handleFilePromises = (promises, fileList) => {
  return Promise.all(promises).then((files) => {
    files.forEach((file) => {
      fileList.push(file);
    });
    return fileList;
  });
};

// Flatten nested arrays
const flatten = (array) =>
  array.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);

// Get files from DataTransfer
const getDataTransferFiles = (dataTransfer) => {
  const dataTransferFiles = [];
  const folderPromises = [];
  const filePromises = [];

  const items = Array.from(dataTransfer.items || []);

  items.forEach((item) => {
    // Try different methods for getting file entry
    const getEntry = item.webkitGetAsEntry || item.getAsEntry;
    const entry = getEntry ? getEntry.call(item) : null;

    if (entry) {
      if (entry.isDirectory) {
        folderPromises.push(traverseDirectory(entry));
      } else {
        filePromises.push(getFile(entry));
      }
    } else if (item.kind === 'file') {
      const file = item.getAsFile();
      if (file) {
        dataTransferFiles.push(packageFile(file, null));
      }
    }
  });

  if (folderPromises.length) {
    return Promise.all(folderPromises).then((fileEntries) => {
      const flattenedEntries = flatten(fileEntries);
      flattenedEntries.forEach((fileEntry) => {
        filePromises.push(getFile(fileEntry));
      });
      return handleFilePromises(filePromises, dataTransferFiles);
    });
  } else if (filePromises.length) {
    return handleFilePromises(filePromises, dataTransferFiles);
  }

  return Promise.resolve(dataTransferFiles);
};

/**
 * Parse dropped or selected files
 * @param {DragEvent|Event} event - The drop or input change event
 * @returns {Promise<Array>} Array of file objects with metadata
 */
export const parseDroppedFiles = (event) => {
  const dataTransfer = event.dataTransfer;

  if (dataTransfer && dataTransfer.items) {
    return getDataTransferFiles(dataTransfer);
  }

  // Handle regular file input
  const files = [];
  const fileList = (dataTransfer && dataTransfer.files) ||
                   (event.target && event.target.files) ||
                   [];

  for (let i = 0; i < fileList.length; i++) {
    files.push(packageFile(fileList[i], null));
  }

  return Promise.resolve(files);
};

/**
 * Parse files into a hierarchical structure
 * @param {DragEvent} event - The drop event
 * @returns {Promise<Object>} Object with folder structure and files
 */
export const parseFileStructure = async (event) => {
  const files = await parseDroppedFiles(event);
  const result = {
    files: [],
    folders: {},
  };

  for (const file of files) {
    const pathParts = file.fullPath.split('/').filter(Boolean);

    if (pathParts.length === 1) {
      // File in root (no folder)
      result.files.push(file);
    } else {
      // File is inside folder(s)
      // pathParts = ['folderName', 'subFolder', 'file.txt']
      const folderPath = pathParts.slice(0, -1); // All parts except the filename

      // Navigate/create folder structure
      let currentLevel = result.folders;
      for (let i = 0; i < folderPath.length; i++) {
        const folderName = folderPath[i];

        if (!currentLevel[folderName]) {
          currentLevel[folderName] = { files: [], folders: {} };
        }

        // If this is the last folder in the path, add the file here
        if (i === folderPath.length - 1) {
          currentLevel[folderName].files.push(file);
        } else {
          // Otherwise, go deeper
          currentLevel = currentLevel[folderName].folders;
        }
      }
    }
  }

  return { files, structure: result };
};

export default parseDroppedFiles;
