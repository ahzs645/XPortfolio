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
    NAME_DISPLAY_MODE: 'first',
    CUSTOM_NAME: 'User',
    OS_SUFFIX: 'XP',
    SHOW_PROFESSION: true,
    CUSTOM_PROFESSION: null,
    PROFILE_PHOTO: 'profile.jpg',
    USER_LOGIN_ICON: '/favicon.png',
    CV_YAML_PATH: 'public/CV.yaml',
    CV_PDF_PATH: 'public/CV.pdf',
    ABOUT_MD: 'content/about.md',
    SHOW_SOCIAL_IN_ABOUT: true,
    SHOW_SKILLS_IN_ABOUT: false,
    SHOW_SOFTWARE_IN_ABOUT: false,
    SOCIALS_EXCLUDE: '',
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
    getDisplayName,
    getOSName,
    getProfession,
    getUserLoginIcon,
    getProfilePhotoPath,
    getSocialLinks,
    getSkills,
    getSoftware,
    getAboutContent,
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
