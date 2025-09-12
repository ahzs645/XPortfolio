import { ConfigLoader } from '../config/configLoader.js';
import { MarkdownLoader } from '../content/markdownLoader.js';

export class PortfolioManager {
    constructor() {
        this.configLoader = new ConfigLoader();
        this.markdownLoader = new MarkdownLoader();
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            await this.configLoader.load();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize portfolio manager:', error);
        }
    }

    // === IDENTITY & BRANDING ===
    
    getDisplayName() {
        return this.configLoader.getDisplayName();
    }

    getOSName() {
        return this.configLoader.getOSName();
    }

    getFullName() {
        return this.configLoader.cvData?.cv?.name || 'User Name';
    }

    getProfession() {
        return this.configLoader.getProfession();
    }

    getProfilePhotoUrl() {
        return this.configLoader.getProfilePhotoPath();
    }

    // === UI ASSET METHODS ===

    getLoadingImageUrl() {
        return this.configLoader.getConfigValue('LOADING_IMAGE_PATH', './assets/gui/boot/loading.webp');
    }

    getUserIconUrl() {
        return this.configLoader.getConfigValue('USER_LOGIN_ICON', './assets/gui/boot/userlogin.webp');
    }

    getUserStartMenuIconUrl() {
        return this.configLoader.getConfigValue('USER_START_MENU_ICON', './assets/gui/boot/userlogin.webp');
    }

    getWallpaperDesktopUrl() {
        return this.configLoader.getConfigValue('WALLPAPER_DESKTOP_PATH', './assets/gui/bgs/bliss.webp');
    }

    getWallpaperMobileUrl() {
        return this.configLoader.getConfigValue('WALLPAPER_MOBILE_PATH', './assets/gui/bgs/blissMobile.webp');
    }

    getBalloonTitle() {
        const osName = this.getOSName();
        return `Welcome to ${osName}`;
    }

    getBalloonBody() {
        return 'A faithful XP-inspired interface, custom-built<br>to showcase my work and attention to detail.';
    }

    getWindowsUserPath() {
        const firstName = this.getDisplayName();
        return `C:\\Users\\${firstName}`;
    }

    getAssetsPath() {
        return `${this.getWindowsUserPath()}\\Assets`;
    }

    getProjectsPath(projectName = '') {
        const basePath = `${this.getWindowsUserPath()}\\Projects`;
        return projectName ? `${basePath}\\${projectName.replace(/\s+/g, '')}` : basePath;
    }

    // === CONTACT & SOCIAL ===
    
    getEmail() {
        return this.configLoader.cvData?.cv?.email || '';
    }

    getLocation() {
        return this.configLoader.cvData?.cv?.location || '';
    }

    getWebsite() {
        return this.configLoader.cvData?.cv?.website || '';
    }

    getPhone() {
        return this.configLoader.cvData?.cv?.phone || '';
    }

    getSocialLinks() {
        const links = this.configLoader.getSocialLinks();
        return links.map(social => ({
            network: social.network,
            username: social.username,
            url: social.url,
            icon: this.getSocialIcon(social.network)
        }));
    }

    getSocialIcon(network) {
        const icons = {
            'LinkedIn': '💼',
            'GitHub': '🐱',
            'Twitter': '🐦', 
            'Facebook': '📘',
            'Instagram': '📷',
            'YouTube': '📺',
            'TikTok': '🎵'
        };
        return icons[network] || '🔗';
    }

    // === CONTENT MANAGEMENT ===

    async getAboutContent() {
        if (this.configLoader.isFeatureEnabled('ENABLE_MARKDOWN_CONTENT')) {
            try {
                return await this.markdownLoader.loadAboutMarkdown();
            } catch (error) {
                console.error('Failed to load about markdown:', error);
            }
        }
        
        // Fallback to generating from CV data
        return this.generateAboutFromCV();
    }

    generateAboutFromCV() {
        const name = this.getFullName();
        const profession = this.getProfession();
        const location = this.getLocation();
        
        return {
            title: `About ${name}`,
            html: `
                <h1>About ${name}</h1>
                <p>I'm a ${profession} based in ${location}.</p>
                <p>Welcome to my digital portfolio showcasing my work and achievements.</p>
            `,
            content: `About ${name}\n\nI'm a ${profession} based in ${location}.\n\nWelcome to my digital portfolio showcasing my work and achievements.`
        };
    }

    // === PROJECTS MANAGEMENT ===

    async getProjects() {
        const cvProjects = this.configLoader.cvData?.cv?.sections?.projects || [];
        const projects = [];

        for (const project of cvProjects) {
            if (project.show === false) continue;

            let projectData = {
                name: project.name,
                date: project.date,
                url: project.url,
                summary: project.summary,
                highlights: project.highlights || [],
                hasMarkdown: false,
                markdown: null
            };

            // Try to load markdown content if enabled
            if (this.configLoader.isFeatureEnabled('ENABLE_PROJECT_MARKDOWN')) {
                try {
                    const markdownContent = await this.markdownLoader.loadProjectMarkdown(project.name);
                    projectData.hasMarkdown = true;
                    projectData.markdown = markdownContent;
                } catch (error) {
                    // No markdown file exists, which is okay
                }
            }

            // Only include projects that have markdown OR if we're showing projects without markdown
            if (projectData.hasMarkdown || this.configLoader.isFeatureEnabled('SHOW_PROJECTS_WITHOUT_MARKDOWN')) {
                projects.push(projectData);
            }
        }

        return projects;
    }

    async getProjectDetails(projectName) {
        const projects = await this.getProjects();
        const project = projects.find(p => 
            p.name.toLowerCase() === projectName.toLowerCase() ||
            p.name.toLowerCase().replace(/\s+/g, '-') === projectName.toLowerCase()
        );

        if (!project) {
            throw new Error(`Project "${projectName}" not found`);
        }

        return project;
    }

    // === RESUME & CV ===

    getCVPDFUrl() {
        return this.configLoader.getCVPDFPath();
    }

    getCVPDFPath() {
        return this.configLoader.getCVPDFPath();
    }

    getPDFDisplayMode() {
        return this.configLoader.getConfigValue('PDF_DISPLAY_MODE', 'embed');
    }

    shouldUsePDFJS() {
        return this.configLoader.isFeatureEnabled('USE_PDF_JS');
    }

    // === EXPERIENCE & EDUCATION ===

    getExperience() {
        return this.configLoader.cvData?.cv?.sections?.experience || [];
    }

    getEducation() {
        return this.configLoader.cvData?.cv?.sections?.education || [];
    }

    getVolunteer() {
        return this.configLoader.cvData?.cv?.sections?.volunteer || [];
    }

    getAwards() {
        return this.configLoader.cvData?.cv?.sections?.awards || [];
    }

    getPublications() {
        return this.configLoader.cvData?.cv?.sections?.publications || [];
    }

    getProfessionalDevelopment() {
        return this.configLoader.cvData?.cv?.sections?.professional_development || [];
    }

    getSkills() {
        return this.configLoader.cvData?.cv?.sections?.skills || [];
    }

    getSoftware() {
        return this.configLoader.cvData?.cv?.sections?.software || [];
    }

    // === UI CUSTOMIZATION ===

    shouldShowSocialInStartMenu() {
        return this.configLoader.isFeatureEnabled('SHOW_SOCIAL_IN_START_MENU');
    }

    shouldShowSocialInAbout() {
        return this.configLoader.isFeatureEnabled('SHOW_SOCIAL_IN_ABOUT');
    }

    shouldShowProfession() {
        return this.configLoader.isFeatureEnabled('SHOW_PROFESSION');
    }

    getTerminalWelcomeMessage() {
        if (this.configLoader.isFeatureEnabled('TERMINAL_WELCOME_CUSTOM')) {
            return this.configLoader.getConfigValue('TERMINAL_WELCOME_MESSAGE');
        }
        return null; // Use default
    }

    // === UTILITY METHODS ===

    isFeatureEnabled(feature) {
        return this.configLoader.isFeatureEnabled(feature);
    }

    getConfigValue(key, defaultValue = null) {
        return this.configLoader.getConfigValue(key, defaultValue);
    }

    // === DEBUGGING ===

    getDebugInfo() {
        return {
            config: this.configLoader.config,
            cvData: this.configLoader.cvData,
            isInitialized: this.isInitialized
        };
    }

    async refreshContent() {
        this.markdownLoader.clearCache();
        await this.configLoader.load();
    }
}