import JSZip from 'jszip';

/**
 * Create a zip archive from files/folders
 * @param {Object} fileSystem - The file system object
 * @param {string[]} itemIds - Array of item IDs to archive
 * @param {Function} getFileContent - Function to get file content from storage
 * @returns {Promise<{blob: Blob, filename: string}>} - The zip blob and suggested filename
 */
export async function createArchive(fileSystem, itemIds, getFileContent) {
  const zip = new JSZip();

  // Helper to add item to zip recursively
  const addItemToZip = async (itemId, parentPath = '') => {
    const item = fileSystem[itemId];
    if (!item) return;

    const itemPath = parentPath ? `${parentPath}/${item.name}` : item.name;

    if (item.type === 'folder') {
      // Create folder in zip
      const folder = zip.folder(itemPath);

      // Add children recursively
      if (item.children) {
        for (const childId of item.children) {
          await addItemToZip(childId, itemPath);
        }
      }
    } else if (item.type === 'file') {
      // Get file content and add to zip
      const content = await getFileContent(itemId);
      if (content) {
        zip.file(itemPath, content);
      }
    }
  };

  // Add all selected items
  for (const itemId of itemIds) {
    await addItemToZip(itemId);
  }

  // Generate the zip file
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // Generate filename based on selection
  let filename;
  if (itemIds.length === 1) {
    const item = fileSystem[itemIds[0]];
    const baseName = item?.name?.replace(/\.[^.]+$/, '') || 'archive';
    filename = `${baseName}.zip`;
  } else {
    filename = 'Archive.zip';
  }

  return { blob, filename };
}

/**
 * Extract a zip archive to a folder
 * @param {Blob|ArrayBuffer|string} zipData - The zip file data (blob, arraybuffer, or base64)
 * @param {Object} fileSystem - The file system object
 * @param {string} targetFolderId - The folder to extract to
 * @param {Function} createItem - Function to create items in file system
 * @param {Function} createFile - Function to create files with content
 * @returns {Promise<string[]>} - Array of created item IDs
 */
export async function extractArchive(zipData, fileSystem, targetFolderId, createItem, createFile) {
  const zip = new JSZip();

  // Load the zip file
  let loadData = zipData;

  // If it's a base64 data URL, extract just the base64 part
  if (typeof zipData === 'string' && zipData.startsWith('data:')) {
    const base64Data = zipData.split(',')[1];
    loadData = base64Data;
  }

  await zip.loadAsync(loadData, { base64: typeof loadData === 'string' });

  const createdIds = [];
  const folderMap = {}; // Map path -> folderId

  // Sort files so folders come before their contents
  const files = Object.keys(zip.files).sort();

  for (const relativePath of files) {
    const zipEntry = zip.files[relativePath];

    // Skip empty paths
    if (!relativePath || relativePath === '/') continue;

    // Remove trailing slash for folders
    const cleanPath = relativePath.replace(/\/$/, '');
    const pathParts = cleanPath.split('/');
    const name = pathParts[pathParts.length - 1];

    // Skip if no name
    if (!name) continue;

    // Determine parent folder
    let parentId = targetFolderId;
    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).join('/');
      if (folderMap[parentPath]) {
        parentId = folderMap[parentPath];
      }
    }

    if (zipEntry.dir) {
      // Create folder
      const folderId = await createItem(parentId, name, 'folder');
      if (folderId) {
        folderMap[cleanPath] = folderId;
        createdIds.push(folderId);
      }
    } else {
      // Extract file content
      const content = await zipEntry.async('blob');

      // Determine content type from extension
      const ext = name.toLowerCase().split('.').pop();
      const mimeTypes = {
        txt: 'text/plain',
        html: 'text/html',
        htm: 'text/html',
        css: 'text/css',
        js: 'application/javascript',
        json: 'application/json',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        pdf: 'application/pdf',
        mp3: 'audio/mpeg',
        mp4: 'video/mp4',
        zip: 'application/zip',
        rar: 'application/x-rar-compressed',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      // Convert blob to data URL for storage
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(content);
      });

      // Create file
      const fileId = await createFile(parentId, name, {
        data: dataUrl,
        size: content.size,
        type: contentType,
      });
      if (fileId) {
        createdIds.push(fileId);
      }
    }
  }

  return createdIds;
}

/**
 * Check if a file is an archive
 * @param {string} filename - The filename to check
 * @returns {boolean}
 */
export function isArchiveFile(filename) {
  if (!filename) return false;
  const ext = filename.toLowerCase().split('.').pop();
  return ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext);
}
