import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useConfig } from './ConfigContext';

const UserAccountsContext = createContext(null);

// Session timeout in milliseconds (5 hours default - can be configured)
// Set to 0 to disable session caching
export const SESSION_TIMEOUT_HOURS = 5;
const SESSION_TIMEOUT_MS = SESSION_TIMEOUT_HOURS * 60 * 60 * 1000;

// localStorage keys for session
const SESSION_KEYS = {
  TIMESTAMP: 'sessionTimestamp',
  USER_ID: 'sessionUserId',
  LOGGED_IN: 'sessionLoggedIn',
};

// Default user pictures available in XP (matching OpenLair)
const DEFAULT_USER_PICTURES = [
  { id: 'airplane', name: 'Airplane', path: '/icons/users/airplane.png' },
  { id: 'astronaut', name: 'Astronaut', path: '/icons/users/astronaut.png' },
  { id: 'ball', name: 'Ball', path: '/icons/users/ball.png' },
  { id: 'beach', name: 'Beach', path: '/icons/users/beach.png' },
  { id: 'bike', name: 'Bike', path: '/icons/users/bike.png' },
  { id: 'butterfly', name: 'Butterfly', path: '/icons/users/butterfly.png' },
  { id: 'car', name: 'Car', path: '/icons/users/car.png' },
  { id: 'cat', name: 'Cat', path: '/icons/users/cat.png' },
  { id: 'chess', name: 'Chess', path: '/icons/users/chess.png' },
  { id: 'dog', name: 'Dog', path: '/icons/users/dog.png' },
  { id: 'drip', name: 'Drip', path: '/icons/users/drip.png' },
  { id: 'duck', name: 'Duck', path: '/icons/users/duck.png' },
  { id: 'fish', name: 'Fish', path: '/icons/users/fish.png' },
  { id: 'flower', name: 'Flower', path: '/icons/users/flower.png' },
  { id: 'frog', name: 'Frog', path: '/icons/users/frog.png' },
  { id: 'guitar', name: 'Guitar', path: '/icons/users/guitar.png' },
  { id: 'horses', name: 'Horses', path: '/icons/users/horses.png' },
  { id: 'kick', name: 'Kick', path: '/icons/users/kick.png' },
  { id: 'pink', name: 'Pink', path: '/icons/users/pink.png' },
  { id: 'rocket', name: 'Rocket', path: '/icons/users/rocket.png' },
  { id: 'skater', name: 'Skater', path: '/icons/users/skater.png' },
  { id: 'snowflake', name: 'Snowflake', path: '/icons/users/snowflake.png' },
  { id: 'trees', name: 'Trees', path: '/icons/users/trees.png' },
];

// Simple hash function using Web Crypto API
async function hashPassword(password) {
  if (!password) return null;
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Generate unique ID
function generateId() {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Default user based on config (will be set on first load)
function createDefaultUser(name = 'User', picture = '/icons/users/chess.png') {
  return {
    id: 'default-user',
    name,
    picture,
    accountType: 'admin',
    hasPassword: false,
    passwordHash: null,
    createdAt: Date.now(),
    settings: {
      wallpaper: null,
      screensaver: { name: 'windows', waitMinutes: 5, enabled: true },
      desktopIconPositions: {},
    },
  };
}

export function UserAccountsProvider({ children }) {
  const { getDisplayName, getUserLoginIcon, isLoading: configLoading } = useConfig();
  const [users, setUsers] = useState([]);
  const [activeUserId, setActiveUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Flag to indicate if we restored from a cached session (skip boot animation)
  const [sessionRestored, setSessionRestored] = useState(false);
  const sessionChecked = useRef(false);

  // Check if a session is valid (not expired)
  const isSessionValid = useCallback(() => {
    if (SESSION_TIMEOUT_MS === 0) return false; // Session caching disabled

    try {
      const timestamp = localStorage.getItem(SESSION_KEYS.TIMESTAMP);
      const wasLoggedIn = localStorage.getItem(SESSION_KEYS.LOGGED_IN) === 'true';
      const sessionUserId = localStorage.getItem(SESSION_KEYS.USER_ID);

      if (!timestamp || !wasLoggedIn || !sessionUserId) return false;

      const sessionTime = parseInt(timestamp, 10);
      const now = Date.now();
      const elapsed = now - sessionTime;

      // Session is valid if within timeout period
      return elapsed < SESSION_TIMEOUT_MS;
    } catch {
      return false;
    }
  }, []);

  // Save session to localStorage
  const saveSession = useCallback((userId) => {
    try {
      localStorage.setItem(SESSION_KEYS.TIMESTAMP, Date.now().toString());
      localStorage.setItem(SESSION_KEYS.USER_ID, userId);
      localStorage.setItem(SESSION_KEYS.LOGGED_IN, 'true');
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  }, []);

  // Clear session from localStorage
  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEYS.TIMESTAMP);
      localStorage.removeItem(SESSION_KEYS.USER_ID);
      localStorage.removeItem(SESSION_KEYS.LOGGED_IN);
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
  }, []);

  // Load users from localStorage once config is ready
  useEffect(() => {
    // Wait for config to load first
    if (configLoading) return;

    try {
      const savedUsers = localStorage.getItem('userAccounts');
      const savedActiveId = localStorage.getItem('activeUserId');
      let parsedUsers = [];

      if (savedUsers) {
        parsedUsers = JSON.parse(savedUsers);
        setUsers(parsedUsers);

        // Check if there's a valid active user
        if (savedActiveId && parsedUsers.find(u => u.id === savedActiveId)) {
          setActiveUserId(savedActiveId);
        }
      } else {
        // Create default user on first run using config values
        const defaultUser = createDefaultUser(
          getDisplayName(),
          getUserLoginIcon()
        );
        parsedUsers = [defaultUser];
        setUsers(parsedUsers);
        localStorage.setItem('userAccounts', JSON.stringify(parsedUsers));
      }

      // Check for valid session to restore (only once)
      if (!sessionChecked.current) {
        sessionChecked.current = true;

        if (isSessionValid()) {
          const sessionUserId = localStorage.getItem(SESSION_KEYS.USER_ID);
          const sessionUser = parsedUsers.find(u => u.id === sessionUserId);

          if (sessionUser) {
            console.log('[Session] Restoring session for user:', sessionUser.name);
            setActiveUserId(sessionUserId);
            setIsLoggedIn(true);
            setSessionRestored(true);
            // Update session timestamp to extend it
            saveSession(sessionUserId);
          } else {
            // User no longer exists, clear session
            clearSession();
          }
        }
      }
    } catch (err) {
      console.error('Failed to load user accounts:', err);
      const defaultUser = createDefaultUser(getDisplayName(), getUserLoginIcon());
      setUsers([defaultUser]);
    } finally {
      setIsLoading(false);
    }
  }, [configLoading, getDisplayName, getUserLoginIcon, isSessionValid, saveSession, clearSession]);

  // Persist users to localStorage
  useEffect(() => {
    if (!isLoading && users.length > 0) {
      localStorage.setItem('userAccounts', JSON.stringify(users));
    }
  }, [users, isLoading]);

  // Persist active user ID
  useEffect(() => {
    if (activeUserId) {
      localStorage.setItem('activeUserId', activeUserId);
    }
  }, [activeUserId]);

  // Get current active user
  const getCurrentUser = useCallback(() => {
    return users.find(u => u.id === activeUserId) || null;
  }, [users, activeUserId]);

  // Login user (verify password if needed)
  const loginUser = useCallback(async (userId, password = null) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.hasPassword && user.passwordHash) {
      if (!password) {
        return { success: false, error: 'Password required', requiresPassword: true };
      }
      const inputHash = await hashPassword(password);
      if (inputHash !== user.passwordHash) {
        return { success: false, error: 'Incorrect password' };
      }
    }

    setActiveUserId(userId);
    setIsLoggedIn(true);
    // Save session for quick restore on page refresh
    saveSession(userId);
    return { success: true };
  }, [users, saveSession]);

  // Logout current user
  const logoutUser = useCallback(() => {
    setIsLoggedIn(false);
    setSessionRestored(false);
    // Clear session so user must log in again next time
    clearSession();
    // Keep activeUserId for "switch user" functionality
  }, [clearSession]);

  // Switch user (log out and go to login screen)
  const switchUser = useCallback(() => {
    setIsLoggedIn(false);
    setSessionRestored(false);
    setActiveUserId(null);
    // Clear session when switching users
    clearSession();
  }, [clearSession]);

  // Create new user account
  const createUser = useCallback(async ({ name, picture, password = null, accountType = 'limited' }) => {
    const passwordHash = password ? await hashPassword(password) : null;

    const newUser = {
      id: generateId(),
      name,
      picture: picture || DEFAULT_USER_PICTURES[Math.floor(Math.random() * DEFAULT_USER_PICTURES.length)].path,
      accountType,
      hasPassword: !!password,
      passwordHash,
      createdAt: Date.now(),
      settings: {
        wallpaper: null,
        screensaver: { name: 'windows', waitMinutes: 5, enabled: true },
        desktopIconPositions: {},
      },
    };

    setUsers(prev => [...prev, newUser]);
    return newUser;
  }, []);

  // Update user account
  const updateUser = useCallback((userId, updates) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return { ...user, ...updates };
      }
      return user;
    }));
  }, []);

  // Change user name
  const changeUserName = useCallback((userId, newName) => {
    updateUser(userId, { name: newName });
  }, [updateUser]);

  // Change user picture
  const changeUserPicture = useCallback((userId, newPicture) => {
    updateUser(userId, { picture: newPicture });
  }, [updateUser]);

  // Change user password
  const changeUserPassword = useCallback(async (userId, currentPassword, newPassword) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify current password if user has one
    if (user.hasPassword && user.passwordHash) {
      const currentHash = await hashPassword(currentPassword);
      if (currentHash !== user.passwordHash) {
        return { success: false, error: 'Current password is incorrect' };
      }
    }

    const newHash = newPassword ? await hashPassword(newPassword) : null;
    updateUser(userId, {
      hasPassword: !!newPassword,
      passwordHash: newHash,
    });

    return { success: true };
  }, [users, updateUser]);

  // Create password for user without one
  const createUserPassword = useCallback(async (userId, newPassword) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.hasPassword) {
      return { success: false, error: 'User already has a password' };
    }

    const newHash = await hashPassword(newPassword);
    updateUser(userId, {
      hasPassword: true,
      passwordHash: newHash,
    });

    return { success: true };
  }, [users, updateUser]);

  // Remove password from user
  const removeUserPassword = useCallback(async (userId, currentPassword) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.hasPassword && user.passwordHash) {
      const currentHash = await hashPassword(currentPassword);
      if (currentHash !== user.passwordHash) {
        return { success: false, error: 'Current password is incorrect' };
      }
    }

    updateUser(userId, {
      hasPassword: false,
      passwordHash: null,
    });

    return { success: true };
  }, [users, updateUser]);

  // Delete user account
  const deleteUser = useCallback((userId) => {
    // Cannot delete the last admin
    const admins = users.filter(u => u.accountType === 'admin');
    const userToDelete = users.find(u => u.id === userId);

    if (userToDelete?.accountType === 'admin' && admins.length <= 1) {
      return { success: false, error: 'Cannot delete the only administrator account' };
    }

    // Cannot delete currently logged in user
    if (userId === activeUserId && isLoggedIn) {
      return { success: false, error: 'Cannot delete the currently logged in user' };
    }

    setUsers(prev => prev.filter(u => u.id !== userId));

    // If we deleted the active user (not logged in), clear it
    if (userId === activeUserId) {
      setActiveUserId(null);
    }

    return { success: true };
  }, [users, activeUserId, isLoggedIn]);

  // Update user settings
  const updateUserSettings = useCallback((userId, settingUpdates) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          settings: { ...user.settings, ...settingUpdates },
        };
      }
      return user;
    }));
  }, []);

  // Get current user's settings
  const getCurrentUserSettings = useCallback(() => {
    const user = getCurrentUser();
    return user?.settings || {
      wallpaper: null,
      screensaver: { name: 'windows', waitMinutes: 5, enabled: true },
      desktopIconPositions: {},
    };
  }, [getCurrentUser]);

  // Update current user's settings
  const updateCurrentUserSettings = useCallback((settingUpdates) => {
    if (activeUserId) {
      updateUserSettings(activeUserId, settingUpdates);
    }
  }, [activeUserId, updateUserSettings]);

  // Change account type
  const changeAccountType = useCallback((userId, newType) => {
    // Cannot remove the last admin
    if (newType !== 'admin') {
      const admins = users.filter(u => u.accountType === 'admin');
      const userToChange = users.find(u => u.id === userId);

      if (userToChange?.accountType === 'admin' && admins.length <= 1) {
        return { success: false, error: 'Cannot remove the only administrator' };
      }
    }

    updateUser(userId, { accountType: newType });
    return { success: true };
  }, [users, updateUser]);

  const value = {
    // State
    users,
    activeUserId,
    isLoading,
    isLoggedIn,
    sessionRestored, // True if session was restored from cache (skip boot/login)

    // User getters
    getCurrentUser,

    // Auth actions
    loginUser,
    logoutUser,
    switchUser,

    // Account management
    createUser,
    updateUser,
    deleteUser,
    changeUserName,
    changeUserPicture,
    changeUserPassword,
    createUserPassword,
    removeUserPassword,
    changeAccountType,

    // Settings
    getCurrentUserSettings,
    updateCurrentUserSettings,
    updateUserSettings,

    // Constants
    availablePictures: DEFAULT_USER_PICTURES,
  };

  return (
    <UserAccountsContext.Provider value={value}>
      {children}
    </UserAccountsContext.Provider>
  );
}

export function useUserAccounts() {
  const context = useContext(UserAccountsContext);
  if (!context) {
    throw new Error('useUserAccounts must be used within a UserAccountsProvider');
  }
  return context;
}

export default UserAccountsContext;
