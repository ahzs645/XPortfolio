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
    let uiConfig = null;
    try {
        if (appLoader) appLoader.setProgress(0xf);
        const response = await fetch('../../../ui.json');
        if (appLoader) appLoader.setProgress(0x19);
        uiConfig = await response.json();
        if (appLoader) appLoader.setProgress(0x23);
    } catch (error) {
        if (appLoader) appLoader.complete();
        return;
    }
    if (!uiConfig) {
        if (appLoader) appLoader.complete();
        return;
    }
    if (socialLinksCard && uiConfig.socials) {
        const socialIcons = uiConfig.socials.filter(social => social.showInAbout && social.icon).map(social => transformAssetPath(social.icon));
        if (appLoader && socialIcons.length > 0x0) await appLoader.loadAssets(socialIcons, 0x28, 0x2d);
        else appLoader && appLoader.setProgress(0x2d);
        const socialLinksContent = socialLinksCard.querySelector('.left-panel__card__content-inner');
        socialLinksContent && (socialLinksContent.innerHTML = '', uiConfig.socials.forEach(social => {
            if (!social.showInAbout) return;
            const linkElement = document.createElement('a');
            linkElement.href = social.url, linkElement.target = '_blank', linkElement.rel = 'noopener noreferrer', linkElement.className = 'left-panel__card__row social-link', linkElement.dataset.socialKey = social.key, linkElement.dataset.socialUrl = social.url, linkElement.dataset.socialLabel = social.name;
            const imgElement = document.createElement('img');
            imgElement.className = 'left-panel__card__img', imgElement.src = transformAssetPath(social.icon), imgElement.alt = social.name;
            const spanElement = document.createElement('span');
            spanElement.className = 'left-panel__card__text', spanElement.textContent = social.name, linkElement.appendChild(imgElement), linkElement.appendChild(spanElement), socialLinksContent.appendChild(linkElement), linkElement.addEventListener('click', event => {
                event.preventDefault();
                if (window.parent && window.parent !== window) {
                    const message = {};
                    message.type = 'open-social-from-about', message.key = social.key, message.url = social.url, message.label = social.name, window.parent.postMessage(message, '*');
                }
            });
        }));
    }
    if (uiConfig.about) {
        const paragraphAssets = [];
        for (let i = 0x1; i <= 0x5; i++) {
            const asset = uiConfig.about['p' + i];
            if (asset) paragraphAssets.push(transformAssetPath(asset));
        }
        if (appLoader && paragraphAssets.length > 0x0) await appLoader.loadAssets(paragraphAssets, 0x32, 0x37);
        else appLoader && appLoader.setProgress(0x37);
        const textSection = document.querySelector('.section_text');
        textSection && (textSection.innerHTML = '', uiConfig.about.paragraphs.forEach((paragraph, index) => {
            const paragraphRow = document.createElement('div');
            paragraphRow.className = 'about-paragraph-row';
            const iconCol = document.createElement('span');
            iconCol.className = 'about-paragraph-icon-col';
            const iconImg = document.createElement('img');
            iconImg.className = 'about-paragraph-icon', iconImg.draggable = ![], iconImg.alt = 'Paragraph icon ' + (index + 0x1), iconImg.src = transformAssetPath(uiConfig.about['p' + (index + 0x1)]), iconCol.appendChild(iconImg);
            const textSpan = document.createElement('span');
            textSpan.className = 'about-paragraph-text', /[<>]/.test(paragraph) ? textSpan.innerHTML = sanitizeHTML(paragraph) : textSpan.textContent = paragraph, paragraphRow.appendChild(iconCol), paragraphRow.appendChild(textSpan), textSection.appendChild(paragraphRow);
        }));
        if (skillsCard && uiConfig.about.skills && uiConfig.about.skillsIcons) {
            const skillIcons = uiConfig.about.skillsIcons.map(icon => transformAssetPath(icon));
            if (appLoader && skillIcons.length > 0x0) await appLoader.loadAssets(skillIcons, 0x41, 0x46);
            else appLoader && appLoader.setProgress(0x46);
            const skillsContent = skillsCard.querySelector('.left-panel__card__content-inner');
            skillsContent && (skillsContent.innerHTML = '', uiConfig.about.skills.forEach((skill, index) => {
                const skillRow = document.createElement('div');
                skillRow.className = 'left-panel__card__row';
                const skillImg = document.createElement('img');
                skillImg.className = 'left-panel__card__img', skillImg.alt = skill, skillImg.src = transformAssetPath(uiConfig.about.skillsIcons[index] || '');
                const skillName = document.createElement('span');
                skillName.className = 'left-panel__card__text', skillName.textContent = skill, skillRow.appendChild(skillImg), skillRow.appendChild(skillName), skillsContent.appendChild(skillRow);
            }));
        }
        if (softwareCard && uiConfig.about.software && uiConfig.about.softwareIcons) {
            const softwareIcons = uiConfig.about.softwareIcons.map(icon => transformAssetPath(icon));
            if (appLoader && softwareIcons.length > 0x0) await appLoader.loadAssets(softwareIcons, 0x50, 0x55);
            else appLoader && appLoader.setProgress(0x55);
            const softwareContent = softwareCard.querySelector('.left-panel__card__content-inner');
            softwareContent && (softwareContent.innerHTML = '', uiConfig.about.software.forEach((software, index) => {
                const softwareRow = document.createElement('div');
                softwareRow.className = 'left-panel__card__row';
                const softwareImg = document.createElement('img');
                softwareImg.className = 'left-panel__card__img', softwareImg.alt = software, softwareImg.src = transformAssetPath(uiConfig.about.softwareIcons[index] || '');
                const softwareName = document.createElement('span');
                softwareName.className = 'left-panel__card__text', softwareName.textContent = software, softwareRow.appendChild(softwareImg), softwareRow.appendChild(softwareName), softwareContent.appendChild(softwareRow);
            }));
        }
    }
    socialLinksCard && expandCard(socialLinksCard);
    skillsCard && expandCard(skillsCard);
    softwareCard && expandCard(softwareCard);
    if (socialLinksCard) {
        const socialLinksHeader = socialLinksCard.querySelector('.left-panel__card__header');
        socialLinksHeader && socialLinksHeader.addEventListener('click', () => toggleCard(socialLinksCard));
    }
    if (skillsCard) {
        const skillsHeader = skillsCard.querySelector('.left-panel__card__header');
        skillsHeader && skillsHeader.addEventListener('click', () => toggleCard(skillsCard));
    }
    if (softwareCard) {
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