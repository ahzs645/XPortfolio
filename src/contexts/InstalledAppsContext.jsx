import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as idb from 'idb-keyval';
import { v4 as uuidv4 } from 'uuid';
import { EXTERNAL_PROJECTS, DEFAULT_PROJECT_ICON } from '../WinXP/config/externalProjects';
import { APPLETS, getAppletUrl, DEFAULT_APPLET_ICON } from '../WinXP/config/applets';

// Store for installed apps
const INSTALLED_APPS_KEY = 'xportfolio-installed-apps';

// Helper to convert release date string to timestamp
const parseReleaseDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date.getTime();
};

// Convert external projects to built-in apps format
// Note: author is intentionally left as project.author (may be undefined)
// The UI will use getFullName() from ConfigContext for built-in apps without explicit author
const BUILT_IN_PROJECTS = EXTERNAL_PROJECTS.reduce((acc, project) => {
  acc[`builtin-${project.id}`] = {
    id: `builtin-${project.id}`,
    url: project.url,
    name: project.name,
    icon: project.icon || DEFAULT_PROJECT_ICON,
    description: project.description || '',
    author: project.author || '', // Empty string if not specified - UI will handle fallback
    version: project.version || '1.0.0',
    size: project.size || null,
    manifest: null,
    permissions: [],
    installedAt: parseReleaseDate(project.releaseDate), // Use release date as install date
    lastRun: null,
    isBuiltIn: true, // Flag to identify built-in projects
    category: project.category,
    windowSettings: {
      width: project.windowSettings?.width || 800,
      height: project.windowSettings?.height || 600,
      resizable: project.windowSettings?.resizable ?? true,
      minWidth: project.windowSettings?.minWidth || 400,
      minHeight: project.windowSettings?.minHeight || 300,
    },
  };
  return acc;
}, {});

// Convert applets to built-in apps format
// Note: author is intentionally left as applet.author (may be undefined)
// The UI will use getFullName() from ConfigContext for built-in apps without explicit author
const BUILT_IN_APPLETS = APPLETS.reduce((acc, applet) => {
  acc[`applet-${applet.id}`] = {
    id: `applet-${applet.id}`,
    url: getAppletUrl(applet),
    name: applet.name,
    icon: applet.icon || DEFAULT_APPLET_ICON,
    description: applet.description || '',
    author: applet.author || '', // Empty string if not specified - UI will handle fallback
    version: applet.version || '1.0.0',
    size: applet.size || null,
    manifest: null,
    permissions: [],
    installedAt: parseReleaseDate(applet.releaseDate), // Use release date as install date
    lastRun: null,
    isBuiltIn: true,
    isApplet: true, // Flag to identify applets
    windowSettings: {
      width: applet.windowSettings?.width || 500,
      height: applet.windowSettings?.height || 400,
      resizable: applet.windowSettings?.resizable ?? true,
      minWidth: applet.windowSettings?.minWidth || 300,
      minHeight: applet.windowSettings?.minHeight || 200,
    },
  };
  return acc;
}, {});

const InstalledAppsContext = createContext(null);

/**
 * Parse GitHub URL and return hosting URL options
 * Supports:
 * - github.com/user/repo -> GitHub Pages (user.github.io/repo)
 * - raw.githubusercontent.com/user/repo/branch/path
 * - GitHub repo folder paths
 */
function parseGitHubUrl(inputUrl) {
  try {
    const url = new URL(inputUrl);

    // GitHub repo URL: github.com/user/repo
    if (url.hostname === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 2) {
        const [user, repo] = parts;
        const cleanRepo = repo.replace(/\.git$/, '');

        // Get additional path if present (e.g., /tree/main/folder)
        let subPath = '';
        if (parts.length > 2) {
          // Skip 'tree' or 'blob' and branch name
          if (parts[2] === 'tree' || parts[2] === 'blob') {
            subPath = parts.slice(4).join('/');
          }
        }

        return {
          isGitHub: true,
          user,
          repo: cleanRepo,
          subPath,
          // GitHub Pages URL
          pagesUrl: subPath
            ? `https://${user}.github.io/${cleanRepo}/${subPath}/`
            : `https://${user}.github.io/${cleanRepo}/`,
          // Raw content URL for manifest
          rawUrl: `https://raw.githubusercontent.com/${user}/${cleanRepo}/main/${subPath}`,
          // Alternative: jsDelivr CDN
          jsDelivrUrl: `https://cdn.jsdelivr.net/gh/${user}/${cleanRepo}@main/${subPath}`,
        };
      }
    }

    // Raw GitHub content URL
    if (url.hostname === 'raw.githubusercontent.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length >= 3) {
        const [user, repo, branch, ...pathParts] = parts;
        const subPath = pathParts.join('/');

        return {
          isGitHub: true,
          user,
          repo,
          branch,
          subPath,
          pagesUrl: subPath
            ? `https://${user}.github.io/${repo}/${subPath}/`
            : `https://${user}.github.io/${repo}/`,
          rawUrl: inputUrl,
          jsDelivrUrl: `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${subPath}`,
        };
      }
    }

    // jsDelivr CDN URL
    if (url.hostname === 'cdn.jsdelivr.net') {
      const ghMatch = url.pathname.match(/\/gh\/([^/]+)\/([^@/]+)@([^/]+)\/?(.*)$/);
      if (ghMatch) {
        const [, user, repo, branch, subPath] = ghMatch;
        return {
          isGitHub: true,
          user,
          repo,
          branch,
          subPath,
          pagesUrl: subPath
            ? `https://${user}.github.io/${repo}/${subPath}/`
            : `https://${user}.github.io/${repo}/`,
          rawUrl: `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${subPath}`,
          jsDelivrUrl: inputUrl,
        };
      }
    }

    return { isGitHub: false };
  } catch {
    return { isGitHub: false };
  }
}

/**
 * InstalledAppsProvider - Manages installation, storage, and launching of web apps
 *
 * Installed app structure:
 * {
 *   id: string,           // Unique ID
 *   url: string,          // Base URL of the webapp
 *   name: string,         // Display name
 *   icon: string,         // Icon URL (can be data URI)
 *   description: string,  // App description
 *   author: string,       // App author
 *   version: string,      // App version
 *   manifest: object,     // Full manifest if available
 *   permissions: string[], // Requested permissions
 *   installedAt: number,  // Installation timestamp
 *   lastRun: number,      // Last run timestamp
 *   windowSettings: {     // Default window settings
 *     width: number,
 *     height: number,
 *     resizable: boolean,
 *   }
 * }
 */
export function InstalledAppsProvider({ children }) {
  const [installedApps, setInstalledApps] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const launchCallbackRef = useRef(null);

  // Load installed apps from IndexedDB on mount
  useEffect(() => {
    const loadInstalledApps = async () => {
      try {
        const apps = await idb.get(INSTALLED_APPS_KEY);
        if (apps) {
          setInstalledApps(apps);
        }
      } catch (error) {
        console.error('Failed to load installed apps:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadInstalledApps();
  }, []);

  // Save installed apps to IndexedDB whenever they change
  useEffect(() => {
    if (!isLoading) {
      idb.set(INSTALLED_APPS_KEY, installedApps).catch(console.error);
    }
  }, [installedApps, isLoading]);

  // Fetch app manifest from URL
  const fetchManifest = useCallback(async (inputUrl) => {
    // Parse GitHub URLs
    const githubInfo = parseGitHubUrl(inputUrl);

    // Determine the URL to use for fetching
    let url = inputUrl;
    let manifestBaseUrls = [];

    if (githubInfo.isGitHub) {
      // For GitHub repos, try multiple sources
      // Try jsdelivr first (has CORS headers), then raw GitHub, then Pages last
      manifestBaseUrls = [
        githubInfo.jsDelivrUrl,
        githubInfo.rawUrl,
        githubInfo.pagesUrl,
      ].filter(Boolean);
      url = githubInfo.pagesUrl; // Default to GitHub Pages for running the app
    } else {
      manifestBaseUrls = [inputUrl];
    }

    // Try to fetch manifest from each base URL
    for (const baseUrl of manifestBaseUrls) {
      try {
        // First, try to fetch xportfolio-manifest.json
        const manifestUrl = baseUrl.endsWith('/')
          ? `${baseUrl}xportfolio-manifest.json`
          : `${baseUrl}/xportfolio-manifest.json`;

        let response = await fetch(manifestUrl);
        if (response.ok) {
          const manifest = await response.json();
          return {
            success: true,
            manifest,
            type: 'xportfolio',
            url: githubInfo.isGitHub ? githubInfo.pagesUrl : inputUrl,
            githubInfo,
          };
        }

        // Try standard manifest.json
        const webManifestUrl = baseUrl.endsWith('/')
          ? `${baseUrl}manifest.json`
          : `${baseUrl}/manifest.json`;

        response = await fetch(webManifestUrl);
        if (response.ok) {
          const manifest = await response.json();
          return {
            success: true,
            manifest,
            type: 'webapp',
            url: githubInfo.isGitHub ? githubInfo.pagesUrl : inputUrl,
            githubInfo,
          };
        }
      } catch {
        // Continue to next URL
      }
    }

    // Try to fetch package.json for GitHub repos
    if (githubInfo.isGitHub) {
      try {
        const packageUrl = `${githubInfo.rawUrl}/package.json`.replace(/\/+/g, '/').replace(':/', '://');
        const response = await fetch(packageUrl);
        if (response.ok) {
          const pkg = await response.json();
          return {
            success: true,
            manifest: {
              name: pkg.name || githubInfo.repo,
              description: pkg.description || '',
              version: pkg.version || '1.0.0',
              author: typeof pkg.author === 'string' ? pkg.author : pkg.author?.name || '',
              icons: [],
            },
            type: 'package',
            url: githubInfo.pagesUrl,
            githubInfo,
          };
        }
      } catch {
        // Continue
      }
    }

    // Try to fetch HTML and extract metadata
    const finalUrl = githubInfo.isGitHub ? githubInfo.pagesUrl : inputUrl;
    try {
      const response = await fetch(finalUrl);
      if (response.ok) {
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const title = doc.querySelector('title')?.textContent || 'Untitled App';
        const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        let icon = doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
                   doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
                   '/icons/xp/Programs.png';

        if (icon && !icon.startsWith('http') && !icon.startsWith('data:')) {
          icon = new URL(icon, finalUrl).href;
        }

        return {
          success: true,
          manifest: {
            name: title,
            description,
            icons: [{ src: icon }],
          },
          type: 'html',
          url: finalUrl,
          githubInfo,
        };
      }
    } catch (error) {
      return { success: false, error: error.message, githubInfo };
    }

    return {
      success: false,
      error: 'Could not fetch app information',
      githubInfo,
    };
  }, []);

  // Install a new app
  const installApp = useCallback(async (appData) => {
    const id = uuidv4();
    const now = Date.now();

    const app = {
      id,
      url: appData.url,
      name: appData.name || 'Untitled App',
      icon: appData.icon || '/icons/xp/Programs.png',
      description: appData.description || '',
      author: appData.author || '',
      version: appData.version || '1.0.0',
      manifest: appData.manifest || null,
      permissions: appData.permissions || [],
      installedAt: now,
      lastRun: null,
      windowSettings: {
        width: appData.windowSettings?.width || 800,
        height: appData.windowSettings?.height || 600,
        resizable: appData.windowSettings?.resizable ?? true,
        minWidth: appData.windowSettings?.minWidth || 400,
        minHeight: appData.windowSettings?.minHeight || 300,
      },
    };

    setInstalledApps(prev => ({
      ...prev,
      [id]: app,
    }));

    return app;
  }, []);

  // Uninstall an app
  const uninstallApp = useCallback((appId) => {
    setInstalledApps(prev => {
      const next = { ...prev };
      delete next[appId];
      return next;
    });
  }, []);

  // Update app info
  const updateApp = useCallback((appId, updates) => {
    setInstalledApps(prev => {
      if (!prev[appId]) return prev;
      return {
        ...prev,
        [appId]: {
          ...prev[appId],
          ...updates,
        },
      };
    });
  }, []);

  // Mark app as recently run
  const markAppRun = useCallback((appId) => {
    updateApp(appId, { lastRun: Date.now() });
  }, [updateApp]);

  // Merge built-in projects, applets, and user-installed apps
  const allApps = useMemo(() => {
    return { ...BUILT_IN_PROJECTS, ...BUILT_IN_APPLETS, ...installedApps };
  }, [installedApps]);

  // Get all installed apps as array (includes built-in)
  const getInstalledAppsList = useCallback(() => {
    return Object.values(allApps).sort((a, b) => {
      // Built-in apps first, then by install date
      if (a.isBuiltIn && !b.isBuiltIn) return -1;
      if (!a.isBuiltIn && b.isBuiltIn) return 1;
      return b.installedAt - a.installedAt;
    });
  }, [allApps]);

  // Get only user-installed apps (not built-in)
  const getUserInstalledAppsList = useCallback(() => {
    return Object.values(installedApps).sort((a, b) => b.installedAt - a.installedAt);
  }, [installedApps]);

  // Get only built-in projects
  const getBuiltInProjectsList = useCallback(() => {
    return Object.values(BUILT_IN_PROJECTS);
  }, []);

  // Get built-in projects by category
  const getBuiltInProjectsByCategory = useCallback((category) => {
    return Object.values(BUILT_IN_PROJECTS).filter(app => app.category === category);
  }, []);

  // Get app by ID (checks both built-in and installed)
  const getApp = useCallback((appId) => {
    return allApps[appId] || null;
  }, [allApps]);

  // Check if URL is already installed (checks both built-in and installed)
  const isInstalled = useCallback((url) => {
    const normalizedUrl = url.replace(/\/$/, '');
    return Object.values(allApps).some(
      app => app.url.replace(/\/$/, '') === normalizedUrl
    );
  }, [allApps]);

  // Register a callback for launching apps (called by WinXP)
  // Uses a ref to avoid triggering re-renders and infinite loops
  const registerLaunchCallback = useCallback((callback) => {
    launchCallbackRef.current = callback;
  }, []);

  // Launch an installed app (works with both built-in and user-installed)
  const launchInstalledApp = useCallback((appId) => {
    const app = allApps[appId];
    if (!app) {
      console.error('App not found:', appId);
      return;
    }

    // Only track lastRun for user-installed apps
    if (!app.isBuiltIn) {
      markAppRun(appId);
    }

    if (launchCallbackRef.current) {
      launchCallbackRef.current(app);
    } else {
      console.error('No launch callback registered');
    }
  }, [allApps, markAppRun]);

  const value = {
    installedApps,
    allApps,
    isLoading,
    fetchManifest,
    installApp,
    uninstallApp,
    updateApp,
    markAppRun,
    getInstalledAppsList,
    getUserInstalledAppsList,
    getBuiltInProjectsList,
    getBuiltInProjectsByCategory,
    getApp,
    isInstalled,
    registerLaunchCallback,
    launchInstalledApp,
  };

  return (
    <InstalledAppsContext.Provider value={value}>
      {children}
    </InstalledAppsContext.Provider>
  );
}

export function useInstalledApps() {
  const context = useContext(InstalledAppsContext);
  if (!context) {
    throw new Error('useInstalledApps must be used within an InstalledAppsProvider');
  }
  return context;
}

export default InstalledAppsContext;
