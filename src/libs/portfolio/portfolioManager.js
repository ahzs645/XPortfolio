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
        const path = this.configLoader.getConfigValue('LOADING_IMAGE_PATH', './assets/gui/boot/loading.webp');

        // For SVG files, we'll handle them specially to inject dynamic content
        if (path.includes('xp.svg')) {
            return 'dynamic:xp.svg';
        }

        return path;
    }

    // Get the dynamic SVG content for the XP logo
    async getDynamicXPSvgContent() {
        const displayName = this.getDisplayName();
        const osSuffix = this.configLoader.getConfigValue('OS_SUFFIX', 'XP').toLowerCase();

        try {
            // Fetch the SVG file
            const response = await fetch('./assets/gui/boot/xp.svg');
            let svgContent = await response.text();

            // Replace the text content in the SVG
            svgContent = svgContent.replace(
                /<tspan x="587\.5" y="0">Ahmad<\/tspan>/g,
                `<tspan x="587.5" y="0">${displayName}</tspan>`
            );

            svgContent = svgContent.replace(
                /<tspan x="0" y="0">xp<\/tspan>/g,
                `<tspan x="0" y="0">${osSuffix}</tspan>`
            );

            // Don't change the font-family - keep it as Franklin Gothic
            // But add the font data directly to the SVG

            // First, let's try to fetch the font file and convert it to base64
            try {
                const fontResponse = await fetch('./assets/fonts/Franklin Gothic Medium.woff2');
                const fontBuffer = await fontResponse.arrayBuffer();
                const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(fontBuffer)));

                // Embed the font directly in the SVG
                const fontDef = `
        @font-face {
          font-family: 'FranklinGothicURW-Med';
          src: url('data:font/woff2;base64,${fontBase64}') format('woff2');
          font-weight: 500;
          font-style: normal;
        }
        @font-face {
          font-family: 'FranklinGothic URW';
          src: url('data:font/woff2;base64,${fontBase64}') format('woff2');
          font-weight: 500;
          font-style: normal;
        }`;

                // Insert the font definition into the SVG's style section
                svgContent = svgContent.replace(
                    /<style>/,
                    `<style>${fontDef}`
                );

                // Auto-fit long display names by reducing the name font-size if needed
                // Measurements come from the SVG template:
                // - The name "Ahmad" is drawn using class .st63 with font-size 199.5px
                // - It is right-aligned at x=587.5 (text-anchor="end") within the viewBox [0..731.2]
                // - Anything extending left of x=0 is clipped by the viewport
                // We compute the rendered width using a canvas with the embedded font, and scale down.

                try {
                    // Ensure the font is available for canvas measurement
                    const face = new FontFace('FranklinGothicURW-Med', `url(data:font/woff2;base64,${fontBase64}) format("woff2")`);
                    await face.load();
                    // Add to document fonts so Canvas can use it
                    if (document && document.fonts) {
                        document.fonts.add(face);
                    }

                    // Measure name at the base font-size used in the SVG
                    const baseFontSize = 199.5; // px (from .st63)
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    ctx.font = `${baseFontSize}px 'FranklinGothicURW-Med', 'FranklinGothic URW'`;
                    const nameWidth = ctx.measureText(displayName).width;

                    // Max width before hitting x=0 (leave a small left margin)
                    const rightAnchorX = 587.5;
                    const leftMargin = 12; // px padding from the left edge
                    const maxWidth = Math.max(1, rightAnchorX - leftMargin);
                    const scale = Math.min(1, maxWidth / nameWidth);

                    if (scale < 1) {
                        const newSize = (baseFontSize * scale).toFixed(2);
                        // Update the .st63 font-size in the SVG's <style> block
                        // Target only the .st63 rule to avoid affecting other font-sizes
                        svgContent = svgContent.replace(
                            /(\.st63\s*\{[\s\S]*?font-size:\s*)([\d.]+)(px)/,
                            `$1${newSize}$3`
                        );
                    }
                } catch (measureErr) {
                    console.warn('Name auto-fit measurement failed; using original size.', measureErr);
                }
            } catch (fontError) {
                console.warn('Could not load font for SVG, using fallback:', fontError);
                // If font loading fails, update to use system fonts as fallback
                svgContent = svgContent.replace(
                    /font-family: FranklinGothicURW-Med, 'FranklinGothic URW';/g,
                    `font-family: 'Franklin Gothic Medium', 'Arial Black', Arial, sans-serif; font-weight: 900;`
                );
            }

            // Create a blob URL
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error loading dynamic SVG:', error);
            return './assets/gui/boot/xp.svg';
        }
    }

    getUserIconUrl() {
        return this.configLoader.getConfigValue('USER_LOGIN_ICON', null);
    }

    getUserStartMenuIconUrl() {
        return this.configLoader.getConfigValue('USER_START_MENU_ICON', null);
    }

    getWallpaperDesktopUrl() {
        return this.configLoader.getConfigValue('WALLPAPER_DESKTOP_PATH', './assets/gui/bgs/blissorg.jpeg');
    }

    getWallpaperMobileUrl() {
        return this.configLoader.getConfigValue('WALLPAPER_MOBILE_PATH', './assets/gui/bgs/blissorg.jpeg');
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
        // Prefer loading from markdown path in config; fallback to CV data
        try {
            const aboutPath = this.configLoader.getAboutMarkdownPath();
            const content = await this.markdownLoader.loadMarkdown(aboutPath);

            // Ensure compatibility: provide paragraphs array for consumers
            const paragraphs = (content.content || '')
                .split('\n\n')
                .filter(p => p.trim());

            return { ...content, paragraphs };
        } catch (error) {
            console.error('Failed to load about markdown, using CV fallback:', error);
            const fallback = this.generateAboutFromCV();
            const paragraphs = (fallback.content || '')
                .split('\n\n')
                .filter(p => p.trim());
            return { ...fallback, paragraphs };
        }
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

    shouldShowSkillsInAbout() {
        return this.configLoader.isFeatureEnabled('SHOW_SKILLS_IN_ABOUT');
    }

    shouldShowSoftwareInAbout() {
        return this.configLoader.isFeatureEnabled('SHOW_SOFTWARE_IN_ABOUT');
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
