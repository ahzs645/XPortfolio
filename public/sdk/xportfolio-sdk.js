/**
 * XPortfolio Web App SDK v1.0.0
 *
 * This SDK allows web applications to integrate with XPortfolio's
 * Windows XP environment. Include this script in your webapp to:
 *
 * - Access the file system (read/write files)
 * - Control the window (close, minimize, maximize)
 * - Update window title and icon
 * - Use XPortfolio UI components
 *
 * Usage:
 * <script src="https://your-xportfolio-site.com/sdk/xportfolio-sdk.js"></script>
 * <script>
 *   XPortfolio.init().then(() => {
 *     console.log('Connected to XPortfolio!');
 *   });
 * </script>
 *
 * Or as ES module:
 * import XPortfolio from 'https://your-xportfolio-site.com/sdk/xportfolio-sdk.mjs';
 */

(function(global) {
  'use strict';

  const VERSION = '1.0.0';
  let requestId = 0;
  const pendingRequests = new Map();
  let isInitialized = false;
  let capabilities = [];

  /**
   * Generate unique request ID
   */
  function generateRequestId() {
    return `req_${++requestId}_${Date.now()}`;
  }

  /**
   * Send message to XPortfolio host
   */
  function sendMessage(action, data = {}) {
    return new Promise((resolve, reject) => {
      if (!isInXPortfolio()) {
        reject(new Error('Not running inside XPortfolio'));
        return;
      }

      const id = generateRequestId();
      const timeoutId = setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }, 30000);

      pendingRequests.set(id, { resolve, reject, timeoutId });

      window.parent.postMessage({
        type: 'xportfolio',
        action,
        data,
        requestId: id,
      }, '*');
    });
  }

  /**
   * Handle response from XPortfolio host
   */
  function handleResponse(event) {
    const { type, requestId: id, success, data, error } = event.data || {};

    if (type !== 'xportfolio-response') return;

    const pending = pendingRequests.get(id);
    if (!pending) return;

    clearTimeout(pending.timeoutId);
    pendingRequests.delete(id);

    if (success) {
      pending.resolve(data);
    } else {
      pending.reject(new Error(error || 'Unknown error'));
    }
  }

  /**
   * Handle init message from XPortfolio host
   */
  function handleInit(event) {
    const { type, data } = event.data || {};

    if (type !== 'xportfolio-init') return;

    isInitialized = true;
    capabilities = data?.capabilities || [];

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('xportfolio-ready', {
      detail: data,
    }));
  }

  /**
   * Check if running inside XPortfolio iframe
   */
  function isInXPortfolio() {
    return window !== window.parent;
  }

  // Set up message listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('message', handleResponse);
    window.addEventListener('message', handleInit);
  }

  /**
   * XPortfolio API
   */
  const XPortfolio = {
    VERSION,

    /**
     * Check if running inside XPortfolio
     */
    isInXPortfolio,

    /**
     * Initialize the SDK and establish connection with XPortfolio
     * @returns {Promise<object>} Host information
     */
    async init() {
      if (!isInXPortfolio()) {
        return Promise.reject(new Error('Not running inside XPortfolio'));
      }

      const result = await sendMessage('init');
      isInitialized = true;
      capabilities = result?.capabilities || [];
      return result;
    },

    /**
     * Check if SDK is initialized
     */
    isInitialized() {
      return isInitialized;
    },

    /**
     * Get available capabilities
     */
    getCapabilities() {
      return [...capabilities];
    },

    /**
     * Get app info
     */
    async getAppInfo() {
      return sendMessage('getAppInfo');
    },

    // ==================
    // Window API
    // ==================
    window: {
      /**
       * Close the window
       */
      close() {
        return sendMessage('close');
      },

      /**
       * Minimize the window
       */
      minimize() {
        return sendMessage('minimize');
      },

      /**
       * Maximize the window
       */
      maximize() {
        return sendMessage('maximize');
      },

      /**
       * Update window title
       * @param {string} title - New window title
       */
      setTitle(title) {
        return sendMessage('updateTitle', { title });
      },

      /**
       * Update window icon
       * @param {string} icon - Icon URL or data URI
       */
      setIcon(icon) {
        return sendMessage('updateIcon', { icon });
      },
    },

    // ==================
    // File System API
    // ==================
    fs: {
      /**
       * Get system folder IDs
       * @returns {Promise<object>} Folder IDs
       */
      async getSystemFolders() {
        return sendMessage('getSystemFolders');
      },

      /**
       * List files in a folder
       * @param {string} [folderId] - Folder ID (defaults to My Documents)
       * @returns {Promise<Array>} Array of file/folder objects
       */
      async listFiles(folderId) {
        return sendMessage('listFiles', { folderId });
      },

      /**
       * Read file content
       * @param {string} fileId - File ID to read
       * @returns {Promise<object>} File content and type
       */
      async readFile(fileId) {
        return sendMessage('readFile', { fileId });
      },

      /**
       * Write/create a file
       * @param {string} name - File name
       * @param {string|Blob} content - File content (base64 data URI or Blob)
       * @param {object} [options] - Options
       * @param {string} [options.folderId] - Target folder ID (defaults to My Documents)
       * @param {string} [options.type] - MIME type
       * @returns {Promise<object>} Created file info
       */
      async writeFile(name, content, options = {}) {
        let data = content;

        // Convert Blob to base64 data URI
        if (content instanceof Blob) {
          data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(content);
          });
        }

        return sendMessage('writeFile', {
          name,
          content: data,
          folderId: options.folderId,
          type: options.type,
        });
      },

      /**
       * Show file open dialog (placeholder - to be implemented)
       */
      async openDialog() {
        // TODO: Implement file picker dialog
        throw new Error('Not yet implemented');
      },

      /**
       * Show file save dialog (placeholder - to be implemented)
       */
      async saveDialog() {
        // TODO: Implement save dialog
        throw new Error('Not yet implemented');
      },
    },

    // ==================
    // Events
    // ==================
    events: {
      /**
       * Listen for XPortfolio ready event
       * @param {function} callback - Callback function
       */
      onReady(callback) {
        if (isInitialized) {
          callback({ capabilities });
        }
        window.addEventListener('xportfolio-ready', (e) => callback(e.detail));
      },
    },
  };

  // Export for different module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = XPortfolio;
  } else if (typeof define === 'function' && define.amd) {
    define(function() { return XPortfolio; });
  } else {
    global.XPortfolio = XPortfolio;
  }

})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
