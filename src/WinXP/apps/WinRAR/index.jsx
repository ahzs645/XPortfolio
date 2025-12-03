import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import Archive from '../../../lib/libarchive/Archive';
import { useFileSystem, SYSTEM_IDS } from '../../../contexts/FileSystemContext';

function WinRAR({ onClose, fileData, fileName, parentFolderId }) {
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState(null);
  const [encrypted, setEncrypted] = useState(false);
  const [password, setPassword] = useState('');
  const [progress, setProgress] = useState('');
  const archiveRef = useRef(null);
  const cancelledRef = useRef(false);
  const initRef = useRef(false);
  const { createFile, createItem } = useFileSystem();

  // Convert base64 data URL to File object
  const dataUrlToFile = (dataUrl, filename) => {
    try {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (err) {
      console.error('Error converting data URL to file:', err);
      throw new Error('Invalid file data');
    }
  };

  // Save extracted files to the file system
  const saveToFileSystem = async (obj, parentId, key) => {
    if (cancelledRef.current) return;

    console.log('[WinRAR] saveToFileSystem:', { key, parentId, isFile: obj instanceof File, obj });

    if (obj instanceof File) {
      console.log('[WinRAR] Saving file:', obj.name, 'size:', obj.size);
      setProgress(`Saving ${obj.name}...`);
      // Read file as base64
      const reader = new FileReader();
      const data = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(obj);
      });

      console.log('[WinRAR] File data length:', data?.length);
      const fileId = await createFile(parentId, obj.name, {
        data: data,
        size: obj.size,
        type: obj.type,
        lastModified: obj.lastModified || Date.now(),
      });
      console.log('[WinRAR] Created file with ID:', fileId);
    } else if (typeof obj === 'object' && obj !== null) {
      // It's a folder
      console.log('[WinRAR] Creating folder:', key);
      setProgress(`Creating folder ${key}...`);
      const folderId = await createItem(parentId, key, 'folder');
      console.log('[WinRAR] Created folder with ID:', folderId);
      for (const k of Object.keys(obj)) {
        await saveToFileSystem(obj[k], folderId, k);
      }
    }
  };

  // Extract the archive
  const doExtract = async (file, pwd = null) => {
    // Reset cancelled flag at start of extraction
    cancelledRef.current = false;

    try {
      setStatus('extracting');
      setProgress('Opening archive...');

      // Initialize Archive
      Archive.init({ workerUrl: '/js/libarchive/worker-bundle.js' });

      const archive = await Archive.open(file);
      archiveRef.current = archive;

      if (pwd) {
        setProgress('Setting password...');
        await archive.usePassword(pwd);
      }

      setProgress('Extracting files...');
      const extractedFiles = await archive.extractFiles((entry) => {
        console.log('[WinRAR] Extracting entry:', entry.path);
        setProgress(`Extracting: ${entry.path}`);
      });

      console.log('[WinRAR] Extracted files:', extractedFiles);
      console.log('[WinRAR] Keys:', Object.keys(extractedFiles));

      // Determine target folder (same folder as the archive, or Desktop)
      const targetFolder = parentFolderId || SYSTEM_IDS.DESKTOP;
      console.log('[WinRAR] Target folder:', targetFolder);

      // Save each extracted item
      const keys = Object.keys(extractedFiles);
      console.log('[WinRAR] Saving', keys.length, 'items, cancelled:', cancelledRef.current);

      for (let i = 0; i < keys.length; i++) {
        console.log('[WinRAR] Loop iteration', i, 'cancelled:', cancelledRef.current);
        if (cancelledRef.current) {
          console.log('[WinRAR] Breaking due to cancelled');
          break;
        }
        const key = keys[i];
        console.log('[WinRAR] Saving item:', key, extractedFiles[key]);
        setProgress(`Saving ${i + 1}/${keys.length}: ${key}`);
        await saveToFileSystem(extractedFiles[key], targetFolder, key);
      }

      console.log('[WinRAR] Extraction complete, closing');
      onClose();
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err.message || String(err) || 'Failed to extract archive');
      setStatus('error');
    }
  };

  // Check for encryption and start extraction
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      if (!fileData || !fileName) {
        setError('No file provided');
        setStatus('error');
        return;
      }

      try {
        setProgress('Reading archive...');
        const file = dataUrlToFile(fileData, fileName);

        // Initialize Archive
        Archive.init({ workerUrl: '/js/libarchive/worker-bundle.js' });

        setProgress('Checking encryption...');
        const archive = await Archive.open(file);
        const isEncrypted = await archive.hasEncryptedData();
        archive.terminate();

        if (isEncrypted) {
          setEncrypted(true);
          setStatus('password');
        } else {
          await doExtract(file);
        }
      } catch (err) {
        console.error('Archive open error:', err);
        setError(err.message || String(err) || 'Failed to open archive');
        setStatus('error');
      }
    };

    init();

    return () => {
      cancelledRef.current = true;
      if (archiveRef.current) {
        archiveRef.current.terminate();
      }
    };
  }, []);

  const handleDecrypt = async () => {
    setEncrypted(false);
    const file = dataUrlToFile(fileData, fileName);
    await doExtract(file, password);
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    if (archiveRef.current) {
      archiveRef.current.terminate();
    }
    onClose();
  };

  return (
    <Container>
      {(status === 'initializing' || status === 'extracting') && !encrypted && (
        <>
          <StatusText>Extracting {fileName}...</StatusText>
          <ProgressText>{progress}</ProgressText>
          <ProgressContainer>
            <progress />
          </ProgressContainer>
          <ButtonRow>
            <CancelButton onClick={handleCancel}>Cancel</CancelButton>
          </ButtonRow>
        </>
      )}

      {(encrypted || status === 'password') && (
        <>
          <StatusText>Enter password:</StatusText>
          <PasswordInput
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDecrypt()}
            autoFocus
          />
          <ButtonRow>
            <ActionButton onClick={handleDecrypt}>OK</ActionButton>
            <CancelButton onClick={handleCancel}>Cancel</CancelButton>
          </ButtonRow>
        </>
      )}

      {status === 'error' && (
        <>
          <ErrorRow>
            <ErrorIcon src="/icons/xp/Critical.png" alt="" />
            <ErrorTitle>Error</ErrorTitle>
          </ErrorRow>
          <ErrorText>{error}</ErrorText>
          <ButtonRow>
            <ActionButton onClick={handleCancel}>OK</ActionButton>
          </ButtonRow>
        </>
      )}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px;
  height: 100%;
  background: #ece9d8;
`;

const StatusText = styled.p`
  font-size: 13px;
  margin: 8px 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProgressText = styled.p`
  font-size: 11px;
  margin: 0 0 8px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProgressContainer = styled.div`
  margin: 8px 0;

  progress {
    width: 100%;
    height: 16px;
  }
`;

const PasswordInput = styled.input`
  border: 1px solid #7f9db9;
  padding: 4px;
  font-size: 11px;
  margin: 8px 0;
  outline: none;

  &:focus {
    border-color: #0054e3;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
`;

const ActionButton = styled.button`
  min-width: 75px;
  padding: 4px 16px;
  font-size: 11px;
  background: linear-gradient(180deg, #fff 0%, #f5f4f0 50%, #e8e6df 100%);
  border: 1px solid #003c74;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background: linear-gradient(180deg, #fff 0%, #f9f8f5 50%, #eceae3 100%);
  }

  &:active {
    background: linear-gradient(180deg, #e8e6df 0%, #f0efe8 50%, #f5f4f0 100%);
  }
`;

const CancelButton = styled(ActionButton)``;

const ErrorRow = styled.div`
  display: flex;
  align-items: center;
  margin: 8px 0;
`;

const ErrorIcon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 8px;
`;

const ErrorTitle = styled.span`
  font-weight: bold;
  font-size: 13px;
`;

const ErrorText = styled.p`
  font-size: 13px;
  margin: 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

export default WinRAR;
