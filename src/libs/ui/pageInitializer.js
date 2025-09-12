import { PortfolioManager } from '../portfolio/portfolioManager.js';

/**
 * Page Initializer - Dynamically updates any page with CV data
 * 
 * This system replaces hardcoded content with dynamic data from CV.yaml
 * and configuration files, making the entire portfolio data-driven.
 */

export class PageInitializer {
    constructor() {
        this.portfolio = new PortfolioManager();
        this.isInitialized = false;
    }

    async initialize() {
        if (!this.isInitialized) {
            await this.portfolio.initialize();
            this.isInitialized = true;
        }
        return this;
    }

    /**
     * Update JSON-LD structured data
     */
    updateStructuredData() {
        const fullName = this.portfolio.getFullName();
        const profession = this.portfolio.getProfession();
        const website = this.portfolio.getWebsite();
        const email = this.portfolio.getEmail();
        const socialLinks = this.portfolio.getSocialLinks();

        // Update Person schema
        document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
            try {
                const data = JSON.parse(script.textContent);
                
                if (data['@type'] === 'Person') {
                    data.name = fullName;
                    data.jobTitle = profession;
                    data.url = website;
                    data.email = email;
                    
                    // Update social media links
                    if (socialLinks.length > 0) {
                        data.sameAs = socialLinks.map(social => social.url);
                    }
                    
                    script.textContent = JSON.stringify(data, null, 2);
                }
                
                if (data['@type'] === 'WebSite') {
                    data.name = this.portfolio.getOSName();
                    data.author = {
                        '@type': 'Person',
                        'name': fullName
                    };
                }
            } catch (error) {
                console.error('Failed to update structured data:', error);
            }
        });
    }

    /**
     * Update page meta tags with dynamic data
     */
    updatePageMeta() {
        const displayName = this.portfolio.getDisplayName();
        const fullName = this.portfolio.getFullName();
        const osName = this.portfolio.getOSName();
        const profession = this.portfolio.getProfession();
        const email = this.portfolio.getEmail();
        const website = this.portfolio.getWebsite();

        // Update title
        const titleElement = document.querySelector('title');
        if (titleElement) {
            titleElement.textContent = osName;
        }

        // Update meta description
        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) {
            descriptionMeta.content = `${fullName} - ${profession}. View my work through an interactive Windows XP desktop experience. Complete with working applications and authentic retro interface.`;
        }

        // Update author meta
        const authorMeta = document.querySelector('meta[name="author"]');
        if (authorMeta) {
            authorMeta.content = `${fullName} (${email})`;
        }

        // Update keywords meta
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        if (keywordsMeta) {
            const baseKeywords = "Windows XP, Desktop, HTML, CSS, JavaScript, Web, UI, Portfolio, Web Development, Frontend, Operating System, Simulation";
            keywordsMeta.content = `${fullName}, ${profession}, ${baseKeywords}`;
        }

        // Update Open Graph tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.content = `${fullName} — Windows XP Portfolio`;
        }

        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.content = `A Windows XP–style interactive portfolio showcasing the work of ${fullName}, ${profession}.`;
        }

        const ogSiteName = document.querySelector('meta[property="og:site_name"]');
        if (ogSiteName) {
            ogSiteName.content = osName;
        }

        // Update Twitter Card tags
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) {
            twitterTitle.content = `${fullName} — Windows XP Portfolio`;
        }

        const twitterDescription = document.querySelector('meta[name="twitter:description"]');
        if (twitterDescription) {
            twitterDescription.content = `A Windows XP–style interactive portfolio showcasing the work of ${fullName}, ${profession}.`;
        }
    }

    /**
     * Update text content throughout the page
     */
    updateTextContent() {
        const displayName = this.portfolio.getDisplayName();
        const fullName = this.portfolio.getFullName();
        const osName = this.portfolio.getOSName();
        const profession = this.portfolio.getProfession();

        // Replace placeholders in text content
        const textNodes = this.getTextNodes(document.body);
        
        textNodes.forEach(node => {
            let text = node.textContent;
            let updated = false;

            // Replace common hardcoded names
            const replacements = {
                'Mitch Ivin': fullName,
                'MitchIvin': displayName,
                'MitchIvin XP': osName,
                'Graphic Designer': profession || 'Professional',
                'mitchellivin@gmail.com': this.portfolio.getEmail()
            };

            Object.entries(replacements).forEach(([search, replace]) => {
                if (text.includes(search) && replace) {
                    text = text.replace(new RegExp(search, 'g'), replace);
                    updated = true;
                }
            });

            if (updated) {
                node.textContent = text;
            }
        });
    }

    /**
     * Update form fields and inputs
     */
    updateFormFields() {
        const fullName = this.portfolio.getFullName();
        const email = this.portfolio.getEmail();

        // Update input placeholders and values
        document.querySelectorAll('input[placeholder*="Mitch"], input[placeholder*="mitch"]').forEach(input => {
            input.placeholder = input.placeholder.replace(/mitch[^\s]*/gi, this.portfolio.getDisplayName());
        });

        // Pre-fill contact form fields if they exist
        const nameInput = document.querySelector('input[name="name"], input[name="from_name"]');
        if (nameInput && !nameInput.value) {
            nameInput.placeholder = fullName;
        }

        const emailInput = document.querySelector('input[name="email"], input[name="from_email"]');
        if (emailInput && !emailInput.value) {
            emailInput.placeholder = email;
        }
    }

    /**
     * Update images with dynamic profile photo
     */
    updateImages() {
        const profilePhotoUrl = this.portfolio.getProfilePhotoUrl();
        
        // Update profile images
        document.querySelectorAll('img[alt*="profile"], img[src*="profile"]').forEach(img => {
            img.src = profilePhotoUrl;
            img.alt = `${this.portfolio.getFullName()} Profile Photo`;
        });
    }

    /**
     * Update social media links
     */
    updateSocialLinks() {
        if (!this.portfolio.shouldShowSocialInStartMenu()) {
            // Hide social media sections
            document.querySelectorAll('.social-media, .social-links').forEach(element => {
                element.style.display = 'none';
            });
            return;
        }

        const socialLinks = this.portfolio.getSocialLinks();
        
        // Update existing social links
        socialLinks.forEach(social => {
            const linkSelector = `a[href*="${social.network.toLowerCase()}"], a[data-social="${social.network.toLowerCase()}"]`;
            document.querySelectorAll(linkSelector).forEach(link => {
                link.href = social.url;
                link.target = '_blank';
                if (link.textContent.includes(social.network)) {
                    link.textContent = `${social.icon} ${social.network}`;
                }
            });
        });

        // Create social links in containers
        document.querySelectorAll('.social-links-container').forEach(container => {
            container.innerHTML = '';
            socialLinks.forEach(social => {
                const link = document.createElement('a');
                link.href = social.url;
                link.target = '_blank';
                link.textContent = `${social.icon} ${social.network}`;
                link.className = 'social-link';
                container.appendChild(link);
            });
        });
    }

    /**
     * Update window titles
     */
    updateWindowTitles() {
        const osName = this.portfolio.getOSName();
        
        // Update window title bars
        document.querySelectorAll('.title-bar-text').forEach(titleBar => {
            let text = titleBar.textContent;
            
            // Replace common patterns
            if (text.includes('MitchIvin')) {
                text = text.replace(/MitchIvin/g, this.portfolio.getDisplayName());
            }
            if (text.includes('Mitch Ivin')) {
                text = text.replace(/Mitch Ivin/g, this.portfolio.getFullName());
            }
            
            titleBar.textContent = text;
        });
    }

    /**
     * Update specific pages based on their content
     */
    updatePageSpecific() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('about')) {
            this.updateAboutPage();
        } else if (currentPath.includes('contact')) {
            this.updateContactPage();
        } else if (currentPath.includes('projects')) {
            this.updateProjectsPage();
        } else if (currentPath.includes('resume')) {
            this.updateResumePage();
        }
    }

    async updateAboutPage() {
        // Update about page with markdown content
        try {
            const aboutContent = await this.portfolio.getAboutContent();
            const aboutContainer = document.querySelector('.about-content, #about-content, .markdown-content');
            if (aboutContainer) {
                aboutContainer.innerHTML = aboutContent.html;
            }
        } catch (error) {
            console.error('Failed to load about content:', error);
        }
    }

    updateContactPage() {
        // Update contact form with CV data
        const email = this.portfolio.getEmail();
        const website = this.portfolio.getWebsite();
        const socialLinks = this.portfolio.getSocialLinks();

        // Update contact information display
        document.querySelectorAll('.contact-email').forEach(el => {
            el.textContent = email;
            if (el.tagName === 'A') el.href = `mailto:${email}`;
        });

        document.querySelectorAll('.contact-website').forEach(el => {
            el.textContent = website;
            if (el.tagName === 'A') el.href = website;
        });
    }

    async updateProjectsPage() {
        try {
            const projects = await this.portfolio.getProjects();
            const projectsContainer = document.querySelector('.projects-container, #projects-container');
            
            if (projectsContainer) {
                projectsContainer.innerHTML = '';
                projects.forEach(project => {
                    const projectElement = this.createProjectElement(project);
                    projectsContainer.appendChild(projectElement);
                });
            }
        } catch (error) {
            console.error('Failed to load projects:', error);
        }
    }

    updateResumePage() {
        const cvPdfUrl = this.portfolio.getCVPDFUrl();
        const displayMode = this.portfolio.getPDFDisplayMode();
        
        if (displayMode === 'embed') {
            const embedContainer = document.querySelector('.resume-embed, #resume-embed');
            if (embedContainer) {
                embedContainer.innerHTML = `<iframe src="${cvPdfUrl}" width="100%" height="800px"></iframe>`;
            }
        }
        
        // Update download links
        document.querySelectorAll('a[href*="resume"], a[href*="cv"]').forEach(link => {
            if (!link.href.includes('http')) {
                link.href = cvPdfUrl;
            }
        });
    }

    createProjectElement(project) {
        const div = document.createElement('div');
        div.className = 'project-item';
        
        let content = `
            <h3>${project.name}</h3>
            <p><strong>Date:</strong> ${project.date || 'N/A'}</p>
        `;
        
        if (project.url) {
            content += `<p><a href="${project.url}" target="_blank">View Project</a></p>`;
        }
        
        if (project.hasMarkdown && project.markdown) {
            content += `<div class="project-description">${project.markdown.html}</div>`;
        } else if (project.summary) {
            content += `<p>${project.summary}</p>`;
        }
        
        div.innerHTML = content;
        return div;
    }

    /**
     * Get all text nodes in an element
     */
    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip script and style elements
                    if (['SCRIPT', 'STYLE'].includes(node.parentElement.tagName)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Only include nodes with actual text content
                    return node.textContent.trim().length > 0 
                        ? NodeFilter.FILTER_ACCEPT 
                        : NodeFilter.FILTER_REJECT;
                }
            }
        );
        
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        return textNodes;
    }

    /**
     * Run all updates
     */
    async updatePage() {
        await this.initialize();
        
        this.updateStructuredData();
        this.updatePageMeta();
        this.updateTextContent();
        this.updateFormFields();
        this.updateImages();
        this.updateSocialLinks();
        this.updateWindowTitles();
        await this.updatePageSpecific();
        
        // Dispatch custom event for other scripts to listen to
        document.dispatchEvent(new CustomEvent('pageInitialized', {
            detail: { portfolio: this.portfolio }
        }));
    }
}

/**
 * Global initialization function
 * Usage: Add <script type="module">import './src/libs/ui/pageInitializer.js'; initializePage();</script>
 */
export async function initializePage() {
    const initializer = new PageInitializer();
    await initializer.updatePage();
    return initializer;
}