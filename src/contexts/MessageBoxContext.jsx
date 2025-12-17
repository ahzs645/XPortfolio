import React, { createContext, useContext, useCallback, useRef } from 'react';

const MessageBoxContext = createContext(null);

// Counter for unique message box IDs
let messageBoxIdCounter = 0;

/**
 * MessageBoxProvider - Provides message box functionality to child components
 *
 * Must be used within a context that has dispatch and appSettings available
 */
export function MessageBoxProvider({ children, dispatch, appSettings, addAppAction }) {
  // Store pending promises by message box ID
  const pendingPromises = useRef({});

  // Track the last dialog position for sequential dialogs (using ref to persist across renders)
  const lastDialogState = useRef({
    position: null,
    timestamp: 0,
  });

  /**
   * Show a confirmation dialog and return a promise
   * @param {Object} options
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Dialog message
   * @param {string} options.icon - Icon type: 'warning', 'error', 'info', 'question'
   * @param {string} options.iconSrc - Custom icon source path (overrides icon type)
   * @param {Array} options.buttons - Button configurations [{label, value, primary}]
   * @param {Object} options.position - Optional {x, y} position override
   * @returns {Promise} Resolves with the button value that was clicked
   */
  const showMessageBox = useCallback(({
    title = 'Windows',
    message = '',
    icon = 'warning',
    iconSrc = null,
    buttons = [{ label: 'OK', value: 'ok', primary: true }],
    position = null,
  }) => {
    return new Promise((resolve) => {
      const messageBoxId = `msgbox-${++messageBoxIdCounter}`;
      pendingPromises.current[messageBoxId] = resolve;

      const messageBoxSetting = appSettings['Message Box'];
      if (!messageBoxSetting) {
        console.error('Message Box app not found in appSettings');
        resolve('cancel');
        return;
      }

      // Calculate centered position based on screen size
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const dialogWidth = messageBoxSetting.defaultSize?.width || 420;
      const dialogHeight = 180; // Approximate height for message boxes

      const centeredPosition = {
        x: Math.max(50, Math.floor((screenWidth - dialogWidth) / 2)),
        y: Math.max(50, Math.floor((screenHeight - dialogHeight) / 2) - 50), // Slightly above center
      };

      // Use provided position, or last position if recent (within 2 seconds), or centered
      const now = Date.now();
      const { position: lastPosition, timestamp: lastTimestamp } = lastDialogState.current;
      const useLastPosition = !position && lastPosition && (now - lastTimestamp < 2000);
      const dialogPosition = position || (useLastPosition ? lastPosition : centeredPosition);

      // Update the last position and timestamp
      lastDialogState.current = {
        position: dialogPosition,
        timestamp: now,
      };

      dispatch({
        type: addAppAction,
        payload: {
          ...messageBoxSetting,
          defaultOffset: dialogPosition,
          header: {
            ...messageBoxSetting.header,
            title,
          },
          injectProps: {
            title,
            message,
            icon,
            iconSrc,
            buttons,
            onResult: (value, finalPosition) => {
              // Update position and timestamp when dialog closes
              // This allows subsequent dialogs to appear where the user left this one
              if (finalPosition) {
                lastDialogState.current.position = finalPosition;
              }
              lastDialogState.current.timestamp = Date.now();

              const resolver = pendingPromises.current[messageBoxId];
              if (resolver) {
                resolver(value);
                delete pendingPromises.current[messageBoxId];
              }
            },
          },
        },
      });
    });
  }, [dispatch, appSettings, addAppAction]);

  /**
   * Show a Yes/No confirmation dialog
   * @param {string} message - The message to display
   * @param {string} title - Dialog title (default: 'Confirm')
   * @returns {Promise<boolean>} Resolves with true if Yes, false otherwise
   */
  const confirm = useCallback(async (message, title = 'Confirm') => {
    const result = await showMessageBox({
      title,
      message,
      icon: 'question',
      buttons: [
        { label: 'Yes', value: 'yes', primary: true },
        { label: 'No', value: 'no' },
      ],
    });
    return result === 'yes';
  }, [showMessageBox]);

  /**
   * Show an alert dialog
   * @param {string} message - The message to display
   * @param {string} title - Dialog title (default: 'Alert')
   * @param {string} icon - Icon type (default: 'warning')
   * @returns {Promise} Resolves when OK is clicked
   */
  const alert = useCallback(async (message, title = 'Alert', icon = 'warning') => {
    return showMessageBox({
      title,
      message,
      icon,
      buttons: [{ label: 'OK', value: 'ok', primary: true }],
    });
  }, [showMessageBox]);

  const value = {
    showMessageBox,
    confirm,
    alert,
  };

  return (
    <MessageBoxContext.Provider value={value}>
      {children}
    </MessageBoxContext.Provider>
  );
}

/**
 * Hook to use message box functionality
 * @returns {{showMessageBox: Function, confirm: Function, alert: Function}}
 */
export function useMessageBox() {
  const context = useContext(MessageBoxContext);
  if (!context) {
    throw new Error('useMessageBox must be used within a MessageBoxProvider');
  }
  return context;
}

export default MessageBoxContext;
