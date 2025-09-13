function transformAssetPath(assetPath) {
    if (!assetPath) return assetPath;
    if (assetPath.startsWith('http:') || assetPath.startsWith('https:') || assetPath.startsWith('../../../')) return assetPath;
    let path = assetPath;
    path.startsWith('/') && (path = path.substring(0x1));
    if (path.startsWith('assets/')) return '../../../' + path;
    return path;
}
import {
    sanitizeHTML
} from '../../scripts/utils/sanitizer.js';
import AppLoader from '../../scripts/utils/appLoader.js';
import { PortfolioManager } from '../../libs/portfolio/portfolioManager.js';
document.addEventListener('DOMContentLoaded', async () => {
    const socialLinksCard = document.getElementById('social-links-card'),
        skillsCard = document.getElementById('skills-card'),
        softwareCard = document.getElementById('software-card'),
        leftPanel = document.querySelector('.left-panel');
    if (!leftPanel) return;
    const addressBarElement = window.parent?.document?.querySelector('#about-window .addressbar');
    let appLoader = null;
    addressBarElement && (appLoader = new AppLoader('about', addressBarElement, () => {
        if (window.parent && window.parent !== window) {
            const message = {};
            message.type = 'app-fully-loaded', message.appId = 'about-window', window.parent.postMessage(message, '*');
        }
    }), appLoader.startLoading(0x5));
    let portfolio = null;
    try {
        if (appLoader) appLoader.setProgress(0xf);
        portfolio = new PortfolioManager();
        await portfolio.initialize();
        if (appLoader) appLoader.setProgress(0x23);
    } catch (error) {
        console.error('Failed to load portfolio data:', error);
        if (appLoader) appLoader.complete();
        return;
    }
    if (!portfolio) {
        if (appLoader) appLoader.complete();
        return;
    }
    const socialLinks = portfolio.getSocialLinks();
    const showSkills = portfolio.shouldShowSkillsInAbout();
    const showSoftware = portfolio.shouldShowSoftwareInAbout();
    if (socialLinksCard && socialLinks.length > 0) {
        const socialIcons = socialLinks.filter(social => social.showInAbout !== false).map(() => '../../../assets/gui/start-menu/instagram.webp'); // Default icons
        if (appLoader && socialIcons.length > 0x0) await appLoader.loadAssets(socialIcons, 0x28, 0x2d);
        else appLoader && appLoader.setProgress(0x2d);
        const socialLinksContent = socialLinksCard.querySelector('.left-panel__card__content-inner');
        socialLinksContent && (socialLinksContent.innerHTML = '', socialLinks.forEach(social => {
            if (social.showInAbout === false) return;
            const linkElement = document.createElement('a');
            linkElement.href = social.url, linkElement.target = '_blank', linkElement.rel = 'noopener noreferrer', linkElement.className = 'left-panel__card__row social-link', linkElement.dataset.socialKey = social.network.toLowerCase(), linkElement.dataset.socialUrl = social.url, linkElement.dataset.socialLabel = social.network;
            const imgElement = document.createElement('img');
            imgElement.className = 'left-panel__card__img';
            // Map social networks to their icons
            const iconMap = {
                'instagram': '../../../assets/gui/start-menu/instagram.webp',
                'github': '../../../assets/gui/start-menu/github.webp',
                'linkedin': '../../../assets/gui/start-menu/linkedin.webp',
                'facebook': '../../../assets/gui/start-menu/facebook.webp'
            };
            imgElement.src = iconMap[social.network.toLowerCase()] || '../../../assets/gui/start-menu/cmd.webp';
            imgElement.alt = social.network;
            const spanElement = document.createElement('span');
            spanElement.className = 'left-panel__card__text', spanElement.textContent = social.network, linkElement.appendChild(imgElement), linkElement.appendChild(spanElement), socialLinksContent.appendChild(linkElement), linkElement.addEventListener('click', event => {
                event.preventDefault();
                if (window.parent && window.parent !== window) {
                    const message = {};
                    message.type = 'open-social-from-about', message.key = social.network.toLowerCase(), message.url = social.url, message.label = social.network, window.parent.postMessage(message, '*');
                }
            });
        }));
    } else {
        if (appLoader) appLoader.setProgress(0x2d);
    }
    // Load about content from markdown
    try {
        const aboutContent = await portfolio.getAboutContent();
        // Previously we loaded per-paragraph icons. We no longer use them.
        if (appLoader) appLoader.setProgress(0x37);
        const textSection = document.querySelector('.section_text');
        
        if (textSection && aboutContent.paragraphs) {
            textSection.innerHTML = '';
            aboutContent.paragraphs.forEach((paragraph, index) => {
                const paragraphRow = document.createElement('div');
                paragraphRow.className = 'about-paragraph-row';
                const textSpan = document.createElement('span');
                textSpan.className = 'about-paragraph-text';
                /[<>]/.test(paragraph) ? textSpan.innerHTML = sanitizeHTML(paragraph) : textSpan.textContent = paragraph;
                paragraphRow.appendChild(textSpan);
                textSection.appendChild(paragraphRow);
            });
        }
    } catch (error) {
        console.error('Failed to load about content:', error);
        if (appLoader) appLoader.setProgress(0x37);
    }
    const skills = portfolio.getSkills();
    if (!showSkills && skillsCard) {
        skillsCard.style.display = 'none';
    } else if (skillsCard && skills.length > 0) {
        const skillIcons = [
            '../../../assets/apps/about/skill1.webp',
            '../../../assets/apps/about/skill2.webp',
            '../../../assets/apps/about/skill3.webp',
            '../../../assets/apps/about/skill4.webp',
            '../../../assets/apps/about/skill5.webp'
        ];
        if (appLoader && skillIcons.length > 0x0) await appLoader.loadAssets(skillIcons, 0x41, 0x46);
        else appLoader && appLoader.setProgress(0x46);
        const skillsContent = skillsCard.querySelector('.left-panel__card__content-inner');
        skillsContent && (skillsContent.innerHTML = '', skills.forEach((skill, index) => {
            const skillRow = document.createElement('div');
            skillRow.className = 'left-panel__card__row';
            const skillImg = document.createElement('img');
            skillImg.className = 'left-panel__card__img', skillImg.alt = skill, skillImg.src = skillIcons[index] || skillIcons[0];
            const skillName = document.createElement('span');
            skillName.className = 'left-panel__card__text', skillName.textContent = skill, skillRow.appendChild(skillImg), skillRow.appendChild(skillName), skillsContent.appendChild(skillRow);
        }));
    } else {
        if (appLoader) appLoader.setProgress(0x46);
    }
    const softwareList = portfolio.getSoftware();
    if (!showSoftware && softwareCard) {
        softwareCard.style.display = 'none';
    } else if (softwareCard && softwareList.length > 0) {
        const softwareIcons = [
            '../../../assets/gui/start-menu/vanity-apps/creative-cloud.webp',
            '../../../assets/gui/start-menu/vanity-apps/vscode.webp',
            '../../../assets/gui/start-menu/vanity-apps/copilot.webp',
            '../../../assets/gui/start-menu/github.webp',
            '../../../assets/gui/start-menu/vanity-apps/figma.webp',
            '../../../assets/gui/start-menu/vanity-apps/wordpress.webp'
        ];
        if (appLoader && softwareIcons.length > 0x0) await appLoader.loadAssets(softwareIcons, 0x50, 0x55);
        else appLoader && appLoader.setProgress(0x55);
        const softwareContent = softwareCard.querySelector('.left-panel__card__content-inner');
        softwareContent && (softwareContent.innerHTML = '', softwareList.forEach((software, index) => {
            const softwareRow = document.createElement('div');
            softwareRow.className = 'left-panel__card__row';
            const softwareImg = document.createElement('img');
            softwareImg.className = 'left-panel__card__img', softwareImg.alt = software, softwareImg.src = softwareIcons[index] || softwareIcons[0];
            const softwareName = document.createElement('span');
            softwareName.className = 'left-panel__card__text', softwareName.textContent = software, softwareRow.appendChild(softwareImg), softwareRow.appendChild(softwareName), softwareContent.appendChild(softwareRow);
        }));
    } else {
        if (appLoader) appLoader.setProgress(0x55);
    }
    socialLinksCard && expandCard(socialLinksCard);
    if (showSkills) skillsCard && expandCard(skillsCard);
    if (showSoftware) softwareCard && expandCard(softwareCard);
    if (socialLinksCard) {
        const socialLinksHeader = socialLinksCard.querySelector('.left-panel__card__header');
        socialLinksHeader && socialLinksHeader.addEventListener('click', () => toggleCard(socialLinksCard));
    }
    if (skillsCard && showSkills) {
        const skillsHeader = skillsCard.querySelector('.left-panel__card__header');
        skillsHeader && skillsHeader.addEventListener('click', () => toggleCard(skillsCard));
    }
    if (softwareCard && showSoftware) {
        const softwareHeader = softwareCard.querySelector('.left-panel__card__header');
        softwareHeader && softwareHeader.addEventListener('click', () => toggleCard(softwareCard));
    }
    appLoader && (appLoader.setProgress(0x5f), setTimeout(() => {
        appLoader.complete();
    }, 0x12c));
});

function softResetAboutApp() {
    try {} catch (error) {}
}
window.addEventListener('message', event => {
    event?.data?.type === 'window:soft-reset' && softResetAboutApp();
}), document.addEventListener('click', () => {
    if (window.parent && window.parent !== window) {
        const message = {};
        message.type = 'window:iframe-interaction', window.parent.postMessage(message, '*');
    }
});

function expandCard(card) {
    if (!card) return;
    card.classList.remove('collapsed');
    const headerImg = card.querySelector('.left-panel__card__header__img');
    headerImg && (card.classList.contains('left-panel__card--social') ? headerImg.src = '../../../assets/apps/about/pullup-alt.webp' : headerImg.src = '../../../assets/apps/about/pullup.webp');
}

function toggleCard(card) {
    if (!card) return;
    card.classList.toggle('collapsed');
    const isCollapsed = card.classList.contains('collapsed'),
        headerImg = card.querySelector('.left-panel__card__header__img');
    headerImg && (card.classList.contains('left-panel__card--social') ? headerImg.src = isCollapsed ? '../../../assets/apps/about/pulldown-alt.webp' : '../../../assets/apps/about/pullup-alt.webp' : headerImg.src = isCollapsed ? '../../../assets/apps/about/pulldown.webp' : '../../../assets/apps/about/pullup.webp');
}
