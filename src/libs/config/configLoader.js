export class ConfigLoader {
    constructor() {
        this.config = null;
        this.cvData = null;
        this.isLoaded = false;
    }

    async load() {
        try {
            // Load environment config
            const configResponse = await fetch('/config.env');
            const configText = await configResponse.text();
            this.config = this.parseEnv(configText);

            // Load CV data using shared parser
            const { CVDataLoader } = await import('../data/cvParser.js');
            const cvLoader = new CVDataLoader();
            this.cvData = await cvLoader.loadFromURL(`/${this.config.CV_YAML_PATH || 'public/CV.yaml'}`);

            this.isLoaded = true;
            return { config: this.config, cvData: this.cvData };
        } catch (error) {
            console.error('Failed to load configuration:', error);
            this.config = this.getDefaultConfig();
            const { CVParser } = await import('../data/cvParser.js');
            const parser = new CVParser();
            this.cvData = parser.getDefaultCVData();
            this.isLoaded = true;
            return { config: this.config, cvData: this.cvData };
        }
    }

    parseEnv(envText) {
        const config = {};
        const lines = envText.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').trim();
            
            // Convert string booleans to actual booleans
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

    getDefaultConfig() {
        return {
            NAME_DISPLAY_MODE: 'first',
            CUSTOM_NAME: 'User',
            OS_SUFFIX: 'XP',
            SHOW_PROFESSION: true,
            CUSTOM_PROFESSION: null,
            PROFILE_PHOTO: 'profile.jpg',
            CV_YAML_PATH: 'public/CV.yaml',
            CV_PDF_PATH: 'public/CV.pdf',
            SHOW_SOCIAL_IN_START_MENU: true,
            SHOW_SOCIAL_IN_ABOUT: true,
            ENABLE_PROJECT_MARKDOWN: true,
            SHOW_PROJECTS_WITHOUT_MARKDOWN: true,
            CONTENT_DIR: 'content',
            PROJECTS_DIR: 'content/projects',
            ABOUT_MD: 'content/about.md',
            TERMINAL_WELCOME_CUSTOM: false,
            TERMINAL_WELCOME_MESSAGE: null,
            PDF_DISPLAY_MODE: 'embed',
            USE_PDF_JS: true
        };
    }


    // Get display name based on configuration
    getDisplayName() {
        if (!this.cvData?.cv?.name) return this.config.CUSTOM_NAME || 'User';
        
        const fullName = this.cvData.cv.name;
        const nameParts = fullName.split(' ');
        
        switch (this.config.NAME_DISPLAY_MODE) {
            case 'first':
                return nameParts[0] || 'User';
            case 'last':
                return nameParts[nameParts.length - 1] || 'User';
            case 'full':
                return fullName;
            case 'custom':
                return this.config.CUSTOM_NAME || 'User';
            default:
                return nameParts[0] || 'User';
        }
    }

    // Get OS name (display name + suffix)
    getOSName() {
        return `${this.getDisplayName()} ${this.config.OS_SUFFIX}`;
    }

    // Get profession for display
    getProfession() {
        if (!this.config.SHOW_PROFESSION) return null;
        
        if (this.config.CUSTOM_PROFESSION) {
            return this.config.CUSTOM_PROFESSION;
        }
        
        // Try to extract profession from CV data
        // This could be from a specific field or inferred from current position
        const experience = this.cvData?.cv?.sections?.experience;
        if (experience && experience.length > 0) {
            const currentJob = experience.find(exp => 
                exp.end_date === 'present' || exp.end_date === 'Present'
            ) || experience[0];
            
            if (currentJob) {
                if (currentJob.positions && currentJob.positions.length > 0) {
                    return currentJob.positions[0].title;
                }
                return currentJob.position;
            }
        }
        
        return 'Professional';
    }

    // Get filtered social media links
    getSocialLinks() {
        const socials = this.cvData?.cv?.social || [];
        return socials.filter(social => social.network && social.url);
    }

    // Get profile photo path
    getProfilePhotoPath() {
        return `/${this.config.PROFILE_PHOTO}`;
    }

    // Get CV PDF path
    getCVPDFPath() {
        return `/${this.config.CV_PDF_PATH}`;
    }

    // Get about content path
    getAboutMarkdownPath() {
        return `/${this.config.ABOUT_MD}`;
    }

    // Get projects directory path
    getProjectsDirectoryPath() {
        return `/${this.config.PROJECTS_DIR}`;
    }

    // Check if a feature is enabled
    isFeatureEnabled(feature) {
        return this.config[feature] === true;
    }

    // Get configuration value
    getConfigValue(key, defaultValue = null) {
        return this.config[key] !== undefined ? this.config[key] : defaultValue;
    }
}