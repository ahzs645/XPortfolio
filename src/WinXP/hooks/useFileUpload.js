import { useState, useCallback, useRef } from 'react';
import { SYSTEM_IDS } from '../../contexts/FileSystemContext';
import { parseFileStructure } from '../../utils/fileDropParser';

/**
 * Hook for handling drag-and-drop file uploads to the desktop
 */
export function useFileUpload({
  createFile,
  createItem,
  moveItem,
  isFileDropUploadEnabled,
}) {
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const dragCounterRef = useRef(0);

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

  return {
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
  };
}

export default useFileUpload;
