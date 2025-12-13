import React, { useRef, useEffect, useCallback, useState } from 'react';
import styled from 'styled-components';
import { useInstalledApps } from '../../../contexts/InstalledAppsContext';
import { useFileSystem } from '../../../contexts/FileSystemContext';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: #fff;
  overflow: hidden;
`;

const AppFrame = styled.iframe`
  flex: 1;
  width: 100%;
  border: none;
  background: #fff;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #fff 0%, #ece9d8 100%);
  font-family: 'Trebuchet MS', Tahoma, sans-serif;
  font-size: 11px;
  color: #333;
  gap: 12px;

  .loading-icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .loading-text {
    color: #333;
  }

  .loading-url {
    color: #666;
    font-size: 10px;
    max-width: 80%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  progress {
    width: 200px;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(0.95); }
  }
`;

const ErrorOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ece9d8;
  font-family: 'Trebuchet MS', Tahoma, sans-serif;
  font-size: 12px;
  color: #333;
  padding: 20px;
  text-align: center;

  h3 {
    color: #c00;
    margin-bottom: 8px;
  }

  p {
    margin: 4px 0;
    color: #666;
  }
`;

/**
 * IframeApp - Wrapper component for running installed web apps in an iframe
 *
 * Provides a postMessage API for the webapp to:
 * - Access XPortfolio file system
 * - Use window controls (close, minimize, maximize)
 * - Update window title and icon
 * - Request permissions
 *
 * Message Protocol:
 * {
 *   type: 'xportfolio',
 *   action: string,
 *   data: any,
 *   requestId: string
 * }
 */
function IframeApp({
  appId,
  url,
  onClose,
  onMinimize,
  onMaximize,
  updateHeader,
}) {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const { markAppRun, getApp } = useInstalledApps();
  const {
    createFile,
    getFileContent,
    getFolderContents,
    SYSTEM_IDS,
  } = useFileSystem();

  const app = appId ? getApp(appId) : null;
  const appUrl = url || app?.url;

  // Mark app as run
  useEffect(() => {
    if (appId) {
      markAppRun(appId);
    }
  }, [appId, markAppRun]);

  // Animate progress bar while loading
  useEffect(() => {
    if (!isLoading) {
      setLoadProgress(100);
      return;
    }

    setLoadProgress(0);
    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        // Slow down as we approach 90% (never reach 100 until actually loaded)
        if (prev >= 90) return prev;
        const increment = Math.max(1, Math.floor((90 - prev) / 10));
        return Math.min(90, prev + increment);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle messages from the iframe
  const handleMessage = useCallback((event) => {
    // Verify origin if we have an app URL
    if (appUrl) {
      const appOrigin = new URL(appUrl).origin;
      if (event.origin !== appOrigin) return;
    }

    const { type, action, data, requestId } = event.data || {};
    if (type !== 'xportfolio') return;

    const respond = (response) => {
      iframeRef.current?.contentWindow?.postMessage({
        type: 'xportfolio-response',
        requestId,
        ...response,
      }, '*');
    };

    switch (action) {
      // Window actions
      case 'close':
        onClose?.();
        break;

      case 'minimize':
        onMinimize?.();
        break;

      case 'maximize':
        onMaximize?.();
        break;

      case 'updateTitle':
        if (data?.title && updateHeader) {
          updateHeader({ title: data.title });
        }
        respond({ success: true });
        break;

      case 'updateIcon':
        if (data?.icon && updateHeader) {
          updateHeader({ icon: data.icon });
        }
        respond({ success: true });
        break;

      // File system actions
      case 'listFiles':
        try {
          const folderId = data?.folderId || SYSTEM_IDS.MY_DOCUMENTS;
          const contents = getFolderContents(folderId);
          respond({
            success: true,
            data: contents.map(item => ({
              id: item.id,
              name: item.name,
              type: item.type,
              icon: item.icon,
              size: item.size,
              dateModified: item.dateModified,
            })),
          });
        } catch (err) {
          respond({ success: false, error: err.message });
        }
        break;

      case 'readFile':
        (async () => {
          try {
            if (!data?.fileId) {
              respond({ success: false, error: 'No file ID provided' });
              return;
            }
            const content = await getFileContent(data.fileId);
            if (content) {
              // Convert Blob to base64 for transfer
              const reader = new FileReader();
              reader.onload = () => {
                respond({
                  success: true,
                  data: {
                    content: reader.result,
                    type: content.type,
                  },
                });
              };
              reader.onerror = () => {
                respond({ success: false, error: 'Failed to read file' });
              };
              reader.readAsDataURL(content);
            } else {
              respond({ success: false, error: 'File not found' });
            }
          } catch (err) {
            respond({ success: false, error: err.message });
          }
        })();
        break;

      case 'writeFile':
        (async () => {
          try {
            const { folderId, name, content, type } = data || {};
            if (!name || !content) {
              respond({ success: false, error: 'Missing name or content' });
              return;
            }

            // Convert base64 to Blob if needed
            let fileData = content;
            if (typeof content === 'string' && content.startsWith('data:')) {
              const [header, base64] = content.split(',');
              const mimeMatch = header.match(/data:(.*?);/);
              const mime = mimeMatch ? mimeMatch[1] : type || 'application/octet-stream';
              const binary = atob(base64);
              const array = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                array[i] = binary.charCodeAt(i);
              }
              fileData = new Blob([array], { type: mime });
            }

            const targetFolder = folderId || SYSTEM_IDS.MY_DOCUMENTS;
            const fileId = await createFile(targetFolder, name, {
              data: fileData,
              type: fileData.type || type,
              size: fileData.size,
            });

            respond({ success: true, data: { fileId } });
          } catch (err) {
            respond({ success: false, error: err.message });
          }
        })();
        break;

      case 'getSystemFolders':
        respond({
          success: true,
          data: {
            myDocuments: SYSTEM_IDS.MY_DOCUMENTS,
            myPictures: SYSTEM_IDS.MY_PICTURES,
            myMusic: SYSTEM_IDS.MY_MUSIC,
            desktop: SYSTEM_IDS.DESKTOP,
          },
        });
        break;

      // App info
      case 'getAppInfo':
        respond({
          success: true,
          data: {
            id: appId,
            name: app?.name,
            version: app?.version,
            permissions: app?.permissions || [],
          },
        });
        break;

      // Handshake
      case 'init':
        respond({
          success: true,
          data: {
            version: '1.0.0',
            capabilities: [
              'window',
              'fileSystem',
              'components',
            ],
          },
        });
        break;

      default:
        respond({ success: false, error: `Unknown action: ${action}` });
    }
  }, [appUrl, appId, app, onClose, onMinimize, onMaximize, updateHeader, SYSTEM_IDS, getFolderContents, getFileContent, createFile]);

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Handle iframe load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);

    // Send init message to iframe
    iframeRef.current?.contentWindow?.postMessage({
      type: 'xportfolio-init',
      data: {
        appId,
        version: '1.0.0',
        capabilities: ['window', 'fileSystem', 'components'],
      },
    }, '*');
  }, [appId]);

  // Handle iframe error
  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load the application');
  }, []);

  if (!appUrl) {
    return (
      <Container>
        <ErrorOverlay>
          <h3>Error</h3>
          <p>No application URL specified</p>
        </ErrorOverlay>
      </Container>
    );
  }

  return (
    <Container>
      {isLoading && (
        <LoadingOverlay>
          <img
            className="loading-icon"
            src={app?.icon || '/icons/xp/Programs.png'}
            alt=""
            onError={(e) => { e.target.src = '/icons/xp/Programs.png'; }}
          />
          <span className="loading-text">Loading {app?.name || 'application'}...</span>
          <progress max="100" value={loadProgress} />
          <span className="loading-url">{appUrl}</span>
        </LoadingOverlay>
      )}

      {error && (
        <ErrorOverlay>
          <h3>Error</h3>
          <p>{error}</p>
          <p style={{ marginTop: '12px' }}>URL: {appUrl}</p>
        </ErrorOverlay>
      )}

      <AppFrame
        ref={iframeRef}
        src={appUrl}
        onLoad={handleLoad}
        onError={handleError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
        allow="clipboard-read; clipboard-write"
        title={app?.name || 'Web App'}
      />
    </Container>
  );
}

export default IframeApp;
