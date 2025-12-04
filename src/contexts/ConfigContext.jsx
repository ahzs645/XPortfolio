import React, { createContext, useContext, useState, useEffect } from 'react';
import yaml from 'js-yaml';
import { marked } from 'marked';

const ConfigContext = createContext(null);

// Parse env file content
function parseEnv(envText) {
  const config = {};
  const lines = envText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();

    if (value.toLowerCase() === 'true') {
      config[key] = true;
    } else if (value.toLowerCase() === 'false') {
      config[key] = false;
    } else if (value === '') {
      config[key] = null;
    } else {
      config[key] = value;
    }
  }

  return config;
}

// Get default config values
function getDefaultConfig() {
  return {
    // Identity
    NAME_DISPLAY_MODE: 'first',
    CUSTOM_NAME: 'User',
    OS_SUFFIX: 'XP',

    // Login screen
    SHOW_PROFESSION: true,
    CUSTOM_PROFESSION: null,

    // Content paths
    PROFILE_PHOTO: 'profile.jpg',
    CV_YAML_PATH: 'public/CV.yaml',
    CV_PDF_PATH: 'public/CV.pdf',
    ABOUT_MD: 'content/about.md',

    // User interface assets
    USER_LOGIN_ICON: '/favicon.png',
    USER_START_MENU_ICON: '/favicon.png',
    LOADING_IMAGE_PATH: '/xp.svg',
    WALLPAPER_DESKTOP_PATH: '/bliss.jpg',
    WALLPAPER_MOBILE_PATH: '/bliss.jpg',

    // Desktop icons
    DESKTOP_PROGRAMS: 'about,resume,projects,contact',

    // Feature toggles
    SHOW_SOCIAL_IN_START_MENU: true,
    SHOW_SOCIAL_IN_ABOUT: true,
    SHOW_SKILLS_IN_ABOUT: false,
    SHOW_SOFTWARE_IN_ABOUT: false,
    SOCIALS_EXCLUDE: '',
    ENABLE_PROJECT_MARKDOWN: true,
    SHOW_PROJECTS_WITHOUT_MARKDOWN: true,

    // Content directories
    CONTENT_DIR: 'content',
    PROJECTS_DIR: 'content/projects',

    // Terminal customization
    TERMINAL_WELCOME_CUSTOM: false,
    TERMINAL_WELCOME_MESSAGE: '',

    // Resume/PDF viewer
    PDF_DISPLAY_MODE: 'embed',
    USE_PDF_JS: true,

    // Media player
    MEDIA_PLAYER_PRIMARY_PLAYLIST: 'PLWoiCrWR5QfNd1s2WwJwjqBfWewzIszLb',
    MEDIA_PLAYER_ALT_PLAYLIST: 'PLgwcgfCVaMC1z5AqphnubDfIu_pp0Ok9O',

    // File system
    ENABLE_FILE_DROP_UPLOAD: true,
  };
}

// Get default CV data
function getDefaultCVData() {
  return {
    cv: {
      name: 'User',
      sections: {
        experience: [],
      },
    },
  };
}

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wallpaperOverrides, setWallpaperOverrides] = useState(() => {
    const defaults = { desktop: null, mobile: null };
    if (typeof window === 'undefined') return defaults;
    try {
      const saved = window.localStorage.getItem('wallpaperOverrides');
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch (err) {
      console.warn('Failed to read wallpaper overrides', err);
      return defaults;
    }
  });

  useEffect(() => {
    async function loadConfig() {
      try {
        // Load config.env
        const configResponse = await fetch('/config.env');
        let envConfig = getDefaultConfig();

        if (configResponse.ok) {
          const configText = await configResponse.text();
          envConfig = { ...envConfig, ...parseEnv(configText) };
        }

        // Load CV.yaml
        const cvPath = envConfig.CV_YAML_PATH || 'public/CV.yaml';
        const cvResponse = await fetch(`/${cvPath}`);
        let cvContent = getDefaultCVData();

        if (cvResponse.ok) {
          const cvText = await cvResponse.text();
          cvContent = yaml.load(cvText);
        }

        setConfig(envConfig);
        setCvData(cvContent);
      } catch (err) {
        console.error('Failed to load configuration:', err);
        setError(err);
        setConfig(getDefaultConfig());
        setCvData(getDefaultCVData());
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, []);

  // Persist wallpaper overrides
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('wallpaperOverrides', JSON.stringify(wallpaperOverrides));
      }
    } catch (err) {
      console.warn('Failed to persist wallpaper overrides', err);
    }
  }, [wallpaperOverrides]);

  // Get display name based on configuration
  const getDisplayName = () => {
    if (!config || !cvData?.cv?.name) {
      return config?.CUSTOM_NAME || 'User';
    }

    const fullName = cvData.cv.name;
    const nameParts = fullName.split(' ');

    switch (config.NAME_DISPLAY_MODE) {
      case 'first':
        return nameParts[0] || 'User';
      case 'last':
        return nameParts[nameParts.length - 1] || 'User';
      case 'full':
        return fullName;
      case 'custom':
        return config.CUSTOM_NAME || 'User';
      default:
        return nameParts[0] || 'User';
    }
  };

  // Get OS name (display name + suffix)
  const getOSName = () => {
    return `${getDisplayName()} ${config?.OS_SUFFIX || 'XP'}`;
  };

  // Get profession for display
  const getProfession = () => {
    if (!config?.SHOW_PROFESSION) return null;

    if (config.CUSTOM_PROFESSION) {
      return config.CUSTOM_PROFESSION;
    }

    // Try to extract profession from CV data
    const experience = cvData?.cv?.sections?.experience;
    if (experience && experience.length > 0) {
      const currentJob = experience.find(
        (exp) => exp.end_date === 'present' || exp.end_date === 'Present'
      ) || experience[0];

      if (currentJob) {
        if (currentJob.positions && currentJob.positions.length > 0) {
          return currentJob.positions[0].title;
        }
        return currentJob.position;
      }
    }

    return 'Professional';
  };

  // Get user login icon path
  const getUserLoginIcon = () => {
    if (config?.USER_LOGIN_ICON) {
      // Handle relative paths
      let iconPath = config.USER_LOGIN_ICON;
      if (iconPath.startsWith('./')) {
        iconPath = iconPath.substring(1);
      }
      return iconPath;
    }
    return '/favicon.png';
  };

  // Get profile photo path
  const getProfilePhotoPath = () => {
    return `/${config?.PROFILE_PHOTO || 'profile.jpg'}`;
  };

  // Get CV PDF URL
  const getCVPDFUrl = () => {
    let pdfPath = config?.CV_PDF_PATH || 'public/CV.pdf';
    // Remove 'public/' prefix if present since it's served from root
    if (pdfPath.startsWith('public/')) {
      pdfPath = pdfPath.substring(7);
    }
    return `/${pdfPath}`;
  };

  // Get full name from CV
  const getFullName = () => {
    return cvData?.cv?.name || config?.CUSTOM_NAME || 'User';
  };

  // Get social links from CV data
  const getSocialLinks = () => {
    const socials = cvData?.cv?.social || [];
    const rawExcludes = (config?.SOCIALS_EXCLUDE || '').trim();
    const excludeSet = new Set(
      rawExcludes
        ? rawExcludes.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        : []
    );

    return socials
      .filter(social => !excludeSet.has(social.network.toLowerCase()))
      .map(social => ({
        network: social.network,
        username: social.username,
        url: social.url,
      }));
  };

  // Get skills from CV data
  const getSkills = () => {
    // Try to get from sections.skills first
    if (cvData?.cv?.sections?.skills) {
      return cvData.cv.sections.skills;
    }
    // Fall back to certifications_skills
    const certSkills = cvData?.cv?.sections?.certifications_skills || [];
    const skillsEntry = certSkills.find(item => item.label === 'Skills');
    if (skillsEntry?.details) {
      return skillsEntry.details.split(';').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  // Get software from CV data
  const getSoftware = () => {
    return cvData?.cv?.sections?.software || [];
  };

  // Check if feature is enabled
  const isFeatureEnabled = (feature) => {
    return config?.[feature] === true;
  };

  // Get start menu user icon path
  const getStartMenuIcon = () => {
    if (config?.USER_START_MENU_ICON) {
      let iconPath = config.USER_START_MENU_ICON;
      if (iconPath.startsWith('./')) {
        iconPath = iconPath.substring(1);
      }
      return iconPath;
    }
    return '/favicon.png';
  };

  // Get loading/boot image path
  const getLoadingImagePath = () => {
    if (config?.LOADING_IMAGE_PATH) {
      let imgPath = config.LOADING_IMAGE_PATH;
      if (imgPath.startsWith('./')) {
        imgPath = imgPath.substring(1);
      }
      return imgPath;
    }
    return '/xp.svg';
  };

  // Get wallpaper path (desktop or mobile)
  const getWallpaperPath = (isMobile = false) => {
    const override = isMobile ? wallpaperOverrides.mobile : wallpaperOverrides.desktop;
    if (override) return override;

    const key = isMobile ? 'WALLPAPER_MOBILE_PATH' : 'WALLPAPER_DESKTOP_PATH';
    if (config?.[key]) {
      let wallpaperPath = config[key];
      if (wallpaperPath.startsWith('./')) {
        wallpaperPath = wallpaperPath.substring(1);
      }
      return wallpaperPath;
    }
    return '/bliss.jpg';
  };

  const setWallpaperPath = (path, options = {}) => {
    const target = options.isMobile ? 'mobile' : 'desktop';
    setWallpaperOverrides((prev) => ({ ...prev, [target]: path || null }));
  };

  // Get desktop programs list
  const getDesktopPrograms = () => {
    const programs = config?.DESKTOP_PROGRAMS || 'about,resume,projects,contact';
    return programs.split(',').map(p => p.trim()).filter(Boolean);
  };

  // Get terminal welcome message
  const getTerminalWelcome = () => {
    if (config?.TERMINAL_WELCOME_CUSTOM && config?.TERMINAL_WELCOME_MESSAGE) {
      return config.TERMINAL_WELCOME_MESSAGE;
    }
    return null; // Use default
  };

  // Get PDF display mode
  const getPDFDisplayMode = () => {
    return config?.PDF_DISPLAY_MODE || 'embed';
  };

  // Check if PDF.js should be used
  const shouldUsePDFJS = () => {
    return config?.USE_PDF_JS !== false;
  };

  // Get media player playlists
  const getMediaPlayerPlaylists = () => {
    return {
      primary: config?.MEDIA_PLAYER_PRIMARY_PLAYLIST || 'PLWoiCrWR5QfNd1s2WwJwjqBfWewzIszLb',
      alt: config?.MEDIA_PLAYER_ALT_PLAYLIST || 'PLgwcgfCVaMC1z5AqphnubDfIu_pp0Ok9O',
    };
  };

  // Get projects directory
  const getProjectsDir = () => {
    return config?.PROJECTS_DIR || 'content/projects';
  };

  // Check if project markdown is enabled
  const isProjectMarkdownEnabled = () => {
    return config?.ENABLE_PROJECT_MARKDOWN !== false;
  };

  // Check if projects without markdown should be shown
  const shouldShowProjectsWithoutMarkdown = () => {
    return config?.SHOW_PROJECTS_WITHOUT_MARKDOWN !== false;
  };

  // Check if file drop upload is enabled
  const isFileDropUploadEnabled = () => {
    return config?.ENABLE_FILE_DROP_UPLOAD !== false;
  };

  // Get about content (load from markdown)
  const [aboutContent, setAboutContent] = useState(null);

  useEffect(() => {
    if (!config) return;

    async function loadAboutContent() {
      try {
        const aboutPath = config.ABOUT_MD || 'content/about.md';
        const response = await fetch(`/${aboutPath}`);
        if (response.ok) {
          const markdown = await response.text();
          const html = marked(markdown);
          setAboutContent({ markdown, html });
        }
      } catch (err) {
        console.error('Failed to load about content:', err);
      }
    }

    loadAboutContent();
  }, [config]);

  // Get about content
  const getAboutContent = () => {
    if (aboutContent) return aboutContent;

    // Fallback content
    const name = cvData?.cv?.name || 'User';
    const profession = getProfession();
    const location = cvData?.cv?.location || '';

    return {
      markdown: `Hi! I'm ${name}, a ${profession} based in ${location}.`,
      html: `<p>Hi! I'm ${name}, a ${profession} based in ${location}.</p>`,
    };
  };

  const value = {
    config,
    cvData,
    isLoading,
    error,
    // Identity
    getDisplayName,
    getOSName,
    getFullName,
    getProfession,
    // User interface assets
    getUserLoginIcon,
    getStartMenuIcon,
    getProfilePhotoPath,
    getLoadingImagePath,
    getWallpaperPath,
    setWallpaperPath,
    // Content
    getCVPDFUrl,
    getSocialLinks,
    getSkills,
    getSoftware,
    getAboutContent,
    // Desktop
    getDesktopPrograms,
    // Terminal
    getTerminalWelcome,
    // PDF/Resume
    getPDFDisplayMode,
    shouldUsePDFJS,
    // Media player
    getMediaPlayerPlaylists,
    // Projects
    getProjectsDir,
    isProjectMarkdownEnabled,
    shouldShowProjectsWithoutMarkdown,
    // File system
    isFileDropUploadEnabled,
    // Feature checks
    isFeatureEnabled,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

export default ConfigContext;
