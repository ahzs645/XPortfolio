import { EVENTS } from '../utils/eventBus.js';
import { PortfolioManager } from '../../libs/portfolio/portfolioManager.js';
import {
    ALL_PROGRAMS_ORDER,
    PINNED_LEFT_ORDER,
    PINNED_RIGHT_ORDER,
    START_MENU_CATALOG,
    START_MENU_FOLDERS
} from '../../config/startMenuItems.js';

function getCatalogEntry(id) {
    const entry = START_MENU_CATALOG[id];
    if (!entry) {
        console.warn(`Missing start menu catalog entry for id: ${id}`);
        return null;
    }
    return { id, ...entry };
}

function toProgramItem(entry) {
    return {
        type: 'program',
        programName: entry.programName,
        icon: entry.icon,
        label: entry.title,
        disabled: entry.disabled ?? false
    };
}

function toDetailedMenuItem(entry) {
    if (entry.type === 'separator') {
        return { type: 'separator' };
    }

    return {
        type: 'program',
        id: entry.id,
        icon: entry.icon,
        title: entry.title,
        description: entry.description,
        programName: entry.programName,
        action: 'open-program',
        disabled: entry.disabled ?? false,
        emphasize: entry.emphasize ?? false
    };
}

function buildPinnedMenuItems(order) {
    return order
        .map(id => getCatalogEntry(id))
        .filter(Boolean)
        .map(toDetailedMenuItem);
}

function renderMenuDivider(extraClass = '') {
    const className = extraClass ? `menu-divider ${extraClass}` : 'menu-divider';
    return `<li class="${className}"><hr class="divider"></li>`;
}

function renderDetailedMenuItem(item) {
    if (item.type === 'separator') {
        return renderMenuDivider();
    }

    const disabled = item.disabled ?? false;
    const menuId = item.programName || item.id;
    const itemClasses = ['menu-item'];
    if (disabled) {
        itemClasses.push('disabled');
    }

    const attributes = [
        `id="menu-${menuId}"`,
        `tabindex="${disabled ? '-1' : '0'}"`,
        `aria-disabled="${disabled ? 'true' : 'false'}"`
    ];

    if (!disabled) {
        if (item.action) {
            attributes.push(`data-action="${item.action}"`);
        }
        if (item.programName) {
            attributes.push(`data-program-name="${item.programName}"`);
        }
        if (item.url) {
            attributes.push(`data-url="${item.url}"`);
        }
    }

    const titleClasses = ['item-title'];
    if (item.emphasize) {
        titleClasses.push('projects-bold');
    }

    const descriptionHtml = item.description
        ? `<span class="item-description">${item.description}</span>`
        : '';

    const iconHtml = item.icon
        ? `<img decoding="async" src="${item.icon}" alt="${item.title}">`
        : '';

    return `<li class="${itemClasses.join(' ')}" ${attributes.join(' ')}>
        ${iconHtml}
        <div class="item-content">
            <span class="${titleClasses.join(' ')}">${item.title}</span>
            ${descriptionHtml}
        </div>
    </li>`;
}

// Base program items
const ALL_PROGRAMS_ITEMS_BASE = ALL_PROGRAMS_ORDER
    .map(id => {
        // Check if this is a folder first
        if (START_MENU_FOLDERS && START_MENU_FOLDERS[id]) {
            const folder = START_MENU_FOLDERS[id];
            return {
                type: 'folder',
                folderId: id,
                icon: folder.icon,
                label: folder.title
            };
        }

        // Otherwise check the catalog
        const entry = getCatalogEntry(id);
        if (!entry) return null;
        if (entry.type === 'separator') {
            return { type: 'separator' };
        }
        return toProgramItem(entry);
    })
    .filter(Boolean);

// Vanity disabled programs for visual effect
const AFTER_EFFECTS_ITEM = {
    type: 'program',
    programName: 'program3',
    icon: './assets/gui/start-menu/vanity-apps/after-effects.webp',
    label: 'Adobe After Effects',
    disabled: true
};

const ILLUSTRATOR_ITEM = {
    type: 'program',
    programName: 'program4',
    icon: './assets/gui/start-menu/vanity-apps/illustrator.webp',
    label: 'Adobe Illustrator',
    disabled: true
};

const INDESIGN_ITEM = {
    type: 'program',
    programName: 'program5',
    icon: './assets/gui/start-menu/vanity-apps/illustrator.webp',
    label: 'Adobe InDesign',
    disabled: true
};

const PHOTOSHOP_ITEM = {
    type: 'program',
    programName: 'program1',
    icon: './assets/gui/start-menu/vanity-apps/photoshop.webp',
    label: 'Adobe Photoshop',
    disabled: true
};

const PREMIERE_ITEM = {
    type: 'program',
    programName: 'program2',
    icon: './assets/gui/start-menu/vanity-apps/premiere.webp',
    label: 'Adobe Premiere Pro',
    disabled: true
};

const BLENDER_ITEM = {
    type: 'program',
    programName: 'program10',
    icon: './assets/gui/start-menu/vanity-apps/blender.webp',
    label: 'Blender',
    disabled: true
};

const DAVINCI_ITEM = {
    type: 'program',
    programName: 'program6',
    icon: './assets/gui/start-menu/vanity-apps/davinci.webp',
    label: 'Davinci Resolve',
    disabled: true
};

const FIGMA_ITEM = {
    type: 'program',
    programName: 'program7',
    icon: './assets/gui/start-menu/vanity-apps/figma.webp',
    label: 'Figma',
    disabled: true
};

const COPILOT_ITEM = {
    type: 'program',
    programName: 'program11',
    icon: './assets/gui/start-menu/vanity-apps/copilot.webp',
    label: 'GitHub Copilot',
    disabled: true
};

const OBS_ITEM = {
    type: 'program',
    programName: 'program9',
    icon: './assets/gui/start-menu/vanity-apps/obs.webp',
    label: 'OBS Studio',
    disabled: true
};

const VSCODE_ITEM = {
    type: 'program',
    programName: 'vscode',
    icon: './assets/gui/start-menu/vanity-apps/vscode.webp',
    label: 'VS Code',
    disabled: true
};

const WORDPRESS_ITEM = {
    type: 'program',
    programName: 'program8',
    icon: './assets/gui/start-menu/vanity-apps/wordpress.webp',
    label: 'Wordpress',
    disabled: true
};

const RECENTLY_USED_ITEMS = [
    AFTER_EFFECTS_ITEM,
    ILLUSTRATOR_ITEM,
    INDESIGN_ITEM,
    PHOTOSHOP_ITEM,
    PREMIERE_ITEM,
    BLENDER_ITEM,
    DAVINCI_ITEM,
    FIGMA_ITEM,
    COPILOT_ITEM,
    OBS_ITEM,
    VSCODE_ITEM,
    WORDPRESS_ITEM
];

let SOCIALS = [];
let systemAssets = null;

async function getSystemAssets() {
    if (systemAssets) return systemAssets;

    try {
        // Load dynamic data from CV instead of ui.json
        systemAssets = await loadSocials();

        // Add resume data and user icon
        const portfolio = new PortfolioManager();
        await portfolio.initialize();

        systemAssets.resume = {
            webp: "./assets/apps/resume/resume.webp", // Keep original screenshot
            pdf: portfolio.getCVPDFPath()
        };

        // Add user icon for start menu
        systemAssets.userIcon = portfolio.getUserStartMenuIconUrl();

        // Add wallpaper assets for consistency
        systemAssets.wallpaperDesktop = portfolio.getWallpaperDesktopUrl();
        systemAssets.wallpaperMobile = portfolio.getWallpaperMobileUrl();

        return systemAssets;
    } catch (error) {
        console.error('Failed to load system assets:', error);
        systemAssets = {
            socials: [],
            contact: { name: 'User', email: '' },
            about: { paragraphs: [], skills: [], skillsIcons: [], software: [], softwareIcons: [] },
            resume: { webp: "./assets/apps/resume/resume.webp", pdf: "/public/CV.pdf" }
        };
        return systemAssets;
    }
}

async function loadSocials() {
    try {
        const portfolio = new PortfolioManager();
        await portfolio.initialize();

        // Get social links from CV.yaml
        const socialLinks = portfolio.getSocialLinks();

        // Convert to ui.json format for compatibility with existing code
        SOCIALS = socialLinks.map(social => ({
            key: social.network.toLowerCase(),
            name: social.network,
            icon: getSocialIcon(social.network),
            url: social.url
        }));

        // Return data in expected format
        return {
            socials: SOCIALS,
            contact: {
                name: portfolio.getFullName(),
                email: portfolio.getEmail()
            },
            about: await generateAboutData(portfolio)
        };
    } catch (error) {
        console.error('Failed to load CV data for start menu:', error);
        SOCIALS = [];
        return {};
    }
}

function getSocialIcon(network) {
    const iconMap = {
        'linkedin': './assets/gui/start-menu/linkedin.webp',
        'github': './assets/gui/start-menu/github.webp',
        'instagram': './assets/gui/start-menu/instagram.webp',
        'facebook': './assets/gui/start-menu/facebook.webp',
        'twitter': './assets/gui/start-menu/github.webp', // Fallback to github icon
        'youtube': './assets/gui/start-menu/mediaPlayer.webp' // Fallback to media player icon
    };
    return iconMap[network.toLowerCase()] || './assets/gui/start-menu/cmd.webp'; // Default fallback
}

async function generateAboutData(portfolio) {
    try {
        const aboutContent = await portfolio.getAboutContent();
        const experience = portfolio.getExperience();

        // Extract paragraphs from markdown content
        const paragraphs = aboutContent.content
            .split('\n\n')
            .filter(p => p.trim() && !p.startsWith('#'))
            .slice(0, 4); // Limit to 4 paragraphs like original

        // Generate skills from experience
        const skills = [];
        const skillsSet = new Set();

        experience.forEach(exp => {
            if (exp.positions) {
                exp.positions.forEach(pos => {
                    skillsSet.add(pos.title);
                });
            } else if (exp.position) {
                skillsSet.add(exp.position);
            }
        });

        // Add profession as primary skill
        const profession = portfolio.getProfession();
        if (profession) {
            skills.push(profession);
        }

        // Add experience-based skills
        Array.from(skillsSet).slice(0, 4).forEach(skill => skills.push(skill));

        return {
            paragraphs,
            skills,
            // Placeholder icons - in a full implementation, these would be configurable
            skillsIcons: skills.map(() => './assets/apps/about/skill1.webp'),
            software: ["VS Code", "Git + GitHub", "Node.js", "Modern Web Stack"],
            softwareIcons: [
                "./assets/gui/start-menu/vanity-apps/vscode.webp",
                "./assets/gui/start-menu/github.webp",
                "./assets/gui/start-menu/vanity-apps/nodejs.webp",
                "./assets/gui/start-menu/vanity-apps/html.webp"
            ]
        };
    } catch (error) {
        console.error('Failed to generate about data:', error);
        return {
            paragraphs: [`Welcome! I'm ${portfolio.getFullName()}.`],
            skills: [portfolio.getProfession()],
            skillsIcons: ['./assets/apps/about/skill1.webp'],
            software: ["Modern Tools"],
            softwareIcons: ['./assets/gui/start-menu/vanity-apps/vscode.webp']
        };
    }
}

function buildMenuHTML(items, itemClass, ulClass) {
    return '<ul' + (ulClass ? ' class="' + ulClass + '"' : '') + '>' +
        items.map(item => {
            if (item.type === 'separator') {
                return '<li class="' + itemClass + '-separator"></li>';
            } else if (item.type === 'folder') {
                return '<li class="' + itemClass + '-item folder-item" data-action="toggle-folder" data-folder-id="' + item.folderId + '">\n' +
                    ('<img decoding="async" src="' + item.icon + '" alt="' + item.label + '">\n') +
                    (item.label + '\n') +
                    '<span class="folder-arrow">►</span>\n' +
                    '</li>';
            } else if (item.type === 'program') {
                return '<li class="' + itemClass + '-item' + (item.disabled ? ' disabled' : '') + '" data-action="open-program" data-program-name="' + item.programName + '">\n' +
                    ('<img decoding="async" src="' + item.icon + '" alt="' + item.label + '">\n') +
                    (item.label + '\n') +
                    '</li>';
            } else if (item.type === 'url') {
                return '<li class="' + itemClass + '-item" data-action="open-url" data-url="' + item.url + '">\n' +
                    ('<img decoding="async" src="' + item.icon + '" alt="' + item.label + '">\n') +
                    (item.label + '\n') +
                    '</li>';
            }
            return '';
        }).join('') +
        '</ul>';
}

function attachMenuItemEffects(container, selector) {
    const items = container.querySelectorAll(selector);
    items.forEach(item => {
        item.addEventListener('mousedown', event => {
            event.preventDefault();
            item.classList.add('menu-item-clicked');
        });

        ['mouseup', 'mouseleave', 'mouseout'].forEach(eventType => {
            item.addEventListener(eventType, () => {
                item.classList.remove('menu-item-clicked');
            });
        });
    });
}

export default class StartMenu {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.startButton = document.getElementById('start-button');
        this.startMenu = null;
        this.allProgramsMenu = null;
        this.recentlyUsedMenu = null;
        this.folderSubmenus = {};
        this.activeWindowOverlay = null;
        this.infoData = {};
        this.systemAssets = null;
        this._eventsInitialized = false;

        this._init();

        // Subscribe to events
        this.eventBus.subscribe(EVENTS.STARTMENU_TOGGLE, () => this.toggleStartMenu());
        this.eventBus.subscribe(EVENTS.STARTMENU_CLOSE_REQUEST, () => {
            if (this.startMenu?.classList.contains('active')) {
                this.closeStartMenu();
            }
        });
        this.eventBus.subscribe(EVENTS.WINDOW_FOCUSED, data => {
            this.updateContentOverlay(data?.windowId);
        });
    }

    _cleanup() {
        try {
            this.removeIframeFocusListeners();
            this.removeWindowBlurListener();

            if (this._onWindowMouseDown) {
                window.removeEventListener('mousedown', this._onWindowMouseDown, true);
                this._onWindowMouseDown = null;
            }

            if (this._onDocumentKeyDown) {
                document.removeEventListener('keydown', this._onDocumentKeyDown);
                this._onDocumentKeyDown = null;
            }

            if (this.startMenu && this._onStartMenuClick) {
                this.startMenu.removeEventListener('click', this._onStartMenuClick);
                this._onStartMenuClick = null;
            }

            if (this.startMenu && this.startMenu.parentNode) {
                this.startMenu.parentNode.removeChild(this.startMenu);
            }

            if (this.allProgramsMenu && this.allProgramsMenu.parentNode) {
                this.allProgramsMenu.parentNode.removeChild(this.allProgramsMenu);
            }

            if (this.recentlyUsedMenu && this.recentlyUsedMenu.parentNode) {
                this.recentlyUsedMenu.parentNode.removeChild(this.recentlyUsedMenu);
            }

            // Clean up folder submenus
            Object.values(this.folderSubmenus).forEach(submenu => {
                if (submenu && submenu.parentNode) {
                    submenu.parentNode.removeChild(submenu);
                }
            });

            this.startMenu = null;
            this.allProgramsMenu = null;
            this.recentlyUsedMenu = null;
            this.folderSubmenus = {};
            this.activeWindowOverlay = null;
            this._eventsInitialized = false;
        } catch (error) {}
    }

    async _init() {
        this.infoData = await loadSocials();
        this.systemAssets = await getSystemAssets();
        this.createStartMenuElement();
        this.setupEventListeners();
    }

    createStartMenuElement() {
        const existingMenu = this.startMenu || document.querySelector('.startmenu');
        if (existingMenu && existingMenu !== this.startMenu && existingMenu.parentNode) {
            existingMenu.parentNode.removeChild(existingMenu);
        }

        const menuElement = document.createElement('div');
        menuElement.className = 'startmenu';
        menuElement.innerHTML = this.getMenuTemplate();
        menuElement.style.visibility = 'hidden';
        menuElement.style.opacity = '0';
        document.body.appendChild(menuElement);
        this.startMenu = menuElement;

        // Update user picture
        const topBar = menuElement.querySelector('.menutopbar');
        if (topBar) {
            const userIcon = this.systemAssets?.userIcon || './assets/gui/boot/xp.svg';
            const normalizedIcon = typeof userIcon === 'string'
                ? (userIcon.includes('%') ? userIcon : userIcon.replace(/\s/g, '%20'))
                : null;

            topBar.innerHTML = '';

            if (normalizedIcon) {
                const img = document.createElement('img');
                img.className = 'userpicture';
                img.decoding = 'async';
                img.draggable = false;
                img.alt = 'User';
                img.src = normalizedIcon;
                topBar.appendChild(img);
            }

            const usernameSpan = document.createElement('span');
            usernameSpan.className = 'username';
            topBar.appendChild(usernameSpan);
        }

        const username = this.infoData?.contact?.name || 'firstname lastname';
        menuElement.querySelectorAll('.menutopbar .username').forEach(span => {
            span.textContent = username;
        });

        this.createAllProgramsMenu();
        this.createRecentlyUsedMenu();
        this.setupMenuItems();
        this._setupDelegatedEventHandlers();
    }

    _createSubMenu(menuClass, innerHTML, propertyName) {
        if (!this[propertyName]) {
            const submenu = document.createElement('div');
            submenu.className = menuClass;
            submenu.innerHTML = innerHTML;
            submenu.style.display = 'none';
            document.body.appendChild(submenu);
            this[propertyName] = submenu;
        }
        return this[propertyName];
    }

    _createMenuWithEffects({
        items,
        itemClass,
        ulClass,
        menuClass,
        propertyName,
        itemSelector,
        attachClickHandler
    }) {
        const html = buildMenuHTML(items, itemClass, ulClass);
        const menu = this._createSubMenu(menuClass, html, propertyName);
        attachMenuItemEffects(menu, itemSelector);

        if (attachClickHandler) {
            menu.addEventListener('click', this._handleMenuClick.bind(this));
        }

        return menu;
    }

    createAllProgramsMenu() {
        this._createMenuWithEffects({
            items: getAllProgramsItems(),
            itemClass: 'all-programs',
            ulClass: 'all-programs-items',
            menuClass: 'all-programs-menu',
            propertyName: 'allProgramsMenu',
            itemSelector: '.all-programs-item',
            attachClickHandler: true
        });

        // Set up folder hover handlers
        if (this.allProgramsMenu) {
            const folderItems = this.allProgramsMenu.querySelectorAll('.folder-item');
            folderItems.forEach(folderItem => {
                const folderId = folderItem.dataset.folderId;

                folderItem.addEventListener('mouseenter', () => {
                    this.showFolderSubmenu(folderId, folderItem);
                });
            });
        }
    }

    createRecentlyUsedMenu() {
        this._createMenuWithEffects({
            items: RECENTLY_USED_ITEMS,
            itemClass: 'recently-used',
            ulClass: 'recently-used-items',
            menuClass: 'recently-used-menu',
            propertyName: 'recentlyUsedMenu',
            itemSelector: '.recently-used-item',
            attachClickHandler: true
        });
    }

    getMenuTemplate() {
        const userIcon = this.systemAssets?.userIcon || './assets/gui/boot/xp.svg';
        const normalizedIcon = typeof userIcon === 'string'
            ? (userIcon.includes('%') ? userIcon : userIcon.replace(/\s/g, '%20'))
            : null;
        const userIconHtml = normalizedIcon
            ? `<img decoding="async" src="${normalizedIcon}" alt="User" class="userpicture">`
            : '';

        const username = this.infoData?.contact?.name || 'firstname lastname';

        const pinnedLeftItems = buildPinnedMenuItems(PINNED_LEFT_ORDER);
        const pinnedRightItems = buildPinnedMenuItems(PINNED_RIGHT_ORDER);

        const socialMenuItems = SOCIALS.map(social => ({
            type: 'program',
            id: social.key,
            icon: social.icon ? './' + social.icon.replace(/^\.\//, '').replace(/^\//, '') : '',
            title: social.name,
            description: null,
            action: 'open-url',
            url: social.url,
            disabled: false
        }));

        const leftColumnHtml = [
            ...pinnedLeftItems.map(renderDetailedMenuItem),
            renderMenuDivider()
        ].join('\n                    ');

        const socialHtml = socialMenuItems.map(renderDetailedMenuItem).join('\n                    ');

        const recentlyUsedTriggerHtml = `<li class="menu-item" id="menu-program4" data-action="toggle-recently-used">
                        <img decoding="async" loading="lazy" src="./assets/gui/start-menu/recently-used.webp" alt="Recently Used">
                        <div class="item-content">
                            <span class="item-title">Recently Used</span>
                        </div>
                    </li>`;

        const rightPinnedHtml = pinnedRightItems.map(renderDetailedMenuItem).join('\n                    ');

        const rightColumnPieces = [];
        if (socialHtml) rightColumnPieces.push(socialHtml);
        rightColumnPieces.push(renderMenuDivider('divider-darkblue'));
        rightColumnPieces.push(recentlyUsedTriggerHtml);
        rightColumnPieces.push(renderMenuDivider('divider-darkblue'));
        if (rightPinnedHtml) rightColumnPieces.push(rightPinnedHtml);

        const rightColumnHtml = rightColumnPieces.join('\n                    ');

        return `
            <div class="menutopbar">
                ${userIconHtml}
                <span class="username">${username}</span>
            </div>
            <div class="start-menu-middle">
                <div class="middle-section middle-left">
                    <ul class="menu-items">
                        ${leftColumnHtml}
                    </ul>
                    <div class="all-programs-container">
                        <div class="all-programs-button" id="menu-all-programs" data-action="toggle-all-programs">
                            <span>All Programs</span>
                            <img decoding="async" loading="lazy" src="./assets/gui/start-menu/arrow.webp" alt="All Programs">
                        </div>
                    </div>
                </div>
                <div class="middle-section middle-right">
                    <ul class="menu-items">
                        ${rightColumnHtml}
                    </ul>
                </div>
            </div>
            <div class="start-menu-footer">
                <div class="footer-buttons">
                    <div class="footer-button" id="btn-log-off" data-action="log-off">
                        <img decoding="async" loading="lazy" src="./assets/gui/start-menu/logoff.webp" alt="Log Off">
                        <span>Log Off</span>
                    </div>
                    <div class="footer-button" id="btn-shut-down" data-action="shut-down">
                        <img decoding="async" loading="lazy" src="./assets/gui/start-menu/shutdown.webp" alt="Shut Down">
                        <span>Shut Down</span>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this._onWindowMouseDown = event => {
            if (!this.startMenu?.classList.contains('active')) return;

            // Ignore clicks right after opening
            if (this._lastOpenedAt && Date.now() - this._lastOpenedAt < 200) return; // 0xc8

            const target = event.target;
            if (target.classList.contains('start-menu-content-click-overlay') || target.tagName === 'IFRAME') return;

            const clickedInMenu = this.startMenu.contains(target);
            const clickedStartButton = this.startButton.contains(target);
            const clickedAllPrograms = this.allProgramsMenu?.contains(target);
            const clickedRecentlyUsed = this.recentlyUsedMenu?.contains(target);
            const clickedInFolderSubmenu = Object.values(this.folderSubmenus).some(submenu => submenu?.contains(target));

            if (!clickedInMenu && !clickedStartButton && !clickedAllPrograms && !clickedRecentlyUsed && !clickedInFolderSubmenu) {
                event.stopPropagation();
                event.preventDefault();
                this.hideAllProgramsMenu();
                this.closeStartMenu();
            }
        };

        window.addEventListener('mousedown', this._onWindowMouseDown, true);

        this._onDocumentKeyDown = event => {
            if (event.key === 'Escape' && this.startMenu?.classList.contains('active')) {
                this.closeStartMenu();
            }
        };

        document.addEventListener('keydown', this._onDocumentKeyDown);
        this._eventsInitialized = true;
    }

    _handleMenuClick(event) {
        const target = event.target.closest('[data-action], [data-program-name], [data-url]');
        if (!target) return;

        // Disabled items
        if (target.classList.contains('all-programs-item') && target.classList.contains('disabled')) {
            event.stopPropagation();
            event.preventDefault();
            return;
        }

        if (target.classList.contains('recently-used-item') && target.classList.contains('disabled')) {
            event.stopPropagation();
            event.preventDefault();
            return;
        }

        const action = target.dataset.action;
        const programName = target.dataset.programName;
        const url = target.dataset.url;
        const folderId = target.dataset.folderId;

        if (action === 'toggle-folder' && folderId) {
            event.stopPropagation();
            event.preventDefault();
            this.showFolderSubmenu(folderId, target);
            return;
        }

        if (action === 'toggle-recently-used') {
            this.showRecentlyUsedMenu();
            return;
        }

        if (action === 'open-program' && programName) {
            // Show mobile restriction popup for certain programs
            if (document.documentElement.classList.contains('mobile-device') &&
                (programName === 'mediaPlayer' || programName === 'paint' || programName === 'pinball')) {
                event.preventDefault();
                event.stopPropagation();

                import('../utils/popupManager.js').then(({ default: popupManager }) => {
                    if (!popupManager.isInitialized) {
                        popupManager.init();
                    }

                    const programLabels = {
                        mediaPlayer: { title: 'Media Player', icon: './assets/gui/start-menu/mediaPlayer.webp' },
                        paint: { title: 'Paint', icon: './assets/gui/start-menu/paint.webp' },
                        pinball: { title: '3D Pinball', icon: './assets/apps/pinball/pinball-icon.png' }
                    };

                    const { title, icon } = programLabels[programName] || { title: 'This App', icon: null };
                    popupManager.showMobileRestrictionPopup(title, icon);
                });

                this.closeStartMenu();
                return;
            }

            this.openProgram(programName);
            this.closeStartMenu();
        } else if (action === 'open-url' && url) {
            try {
                window.postMessage({
                    type: 'confirm-open-link',
                    url: url,
                    label: target?.textContent?.trim() || ''
                }, '*');
            } catch (error) {
                window.open(url, '_blank');
            }
            this.closeStartMenu();
        } else if (action === 'log-off') {
            this.eventBus.publish(EVENTS.LOG_OFF_CONFIRMATION_REQUESTED, { dialogType: 'logOff' });
            this.closeStartMenu();
        } else if (action === 'shut-down') {
            this.eventBus.publish(EVENTS.LOG_OFF_CONFIRMATION_REQUESTED, { dialogType: 'shutDown' });
            this.closeStartMenu();
        }
    }

    _setupDelegatedEventHandlers() {
        if (this.startMenu) {
            this._onStartMenuClick = this._handleMenuClick.bind(this);
            this.startMenu.addEventListener('click', this._onStartMenuClick);
        }
    }

    setupMenuItems() {
        this.setupAllProgramsMenu();

        const recentlyUsedTrigger = this.startMenu.querySelector('#menu-program4');
        if (recentlyUsedTrigger) {
            recentlyUsedTrigger.setAttribute('data-action', 'toggle-recently-used');
            recentlyUsedTrigger.style.position = 'relative';
            recentlyUsedTrigger.style.width = '100%';

            const arrow = document.createElement('span');
            arrow.className = 'mut-menu-arrow';
            arrow.innerHTML = '►';
            arrow.style.position = 'absolute';
            arrow.style.right = '8px';
            arrow.style.top = '50%';
            arrow.style.transform = 'translateY(-50%) scaleX(0.5)';
            arrow.style.fontSize = '10px';
            recentlyUsedTrigger.appendChild(arrow);

            recentlyUsedTrigger.addEventListener('mouseenter', () => this.showRecentlyUsedMenu());
            recentlyUsedTrigger.addEventListener('mouseleave', event => {
                if (event.relatedTarget &&
                    (event.relatedTarget.closest('.recently-used-menu') ||
                     event.relatedTarget === this.recentlyUsedMenu)) {
                    return;
                }
                this.hideRecentlyUsedMenu();
            });
        }
    }

    setupAllProgramsMenu() {
        const allProgramsButton = document.getElementById('menu-all-programs');
        if (!allProgramsButton || !this.allProgramsMenu || !this.startMenu) return;

        allProgramsButton.addEventListener('mouseenter', () => this.showAllProgramsMenu());
        allProgramsButton.addEventListener('mouseleave', event => {
            if (event.relatedTarget &&
                (event.relatedTarget.closest('.all-programs-menu') ||
                 event.relatedTarget === this.allProgramsMenu)) {
                return;
            }
            // Delay hiding to allow reaching submenu
            setTimeout(() => {
                // Don't hide if folder submenu is visible
                const anyFolderSubmenuVisible = Object.values(this.folderSubmenus).some(
                    submenu => submenu && submenu.style.display !== 'none'
                );
                if (!anyFolderSubmenuVisible) {
                    this.hideAllProgramsMenu();
                }
            }, 200);
        });

        this.allProgramsMenu.addEventListener('mouseleave', event => {
            const relatedTarget = event.relatedTarget;

            if (relatedTarget &&
                (relatedTarget === allProgramsButton ||
                 relatedTarget.closest('#menu-all-programs') ||
                 relatedTarget.closest('.folder-submenu'))) {
                return;
            }

            // Delay hiding to allow reaching submenu
            setTimeout(() => {
                // Don't hide if folder submenu is visible or mouse is in submenu
                const anyFolderSubmenuVisible = Object.values(this.folderSubmenus).some(
                    submenu => submenu && submenu.style.display !== 'none'
                );
                if (!anyFolderSubmenuVisible) {
                    this.hideAllProgramsMenu();
                }
            }, 200);
        });

        const otherMenuItems = this.startMenu.querySelectorAll('.menu-item:not(#menu-all-programs), .menutopbar, .start-menu-footer, .middle-right');
        otherMenuItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.hideAllProgramsMenu();
                this.hideFolderSubmenus();
            });
        });
    }

    showAllProgramsMenu() {
        if (!this.allProgramsMenu || !this.startMenu) return;

        const allProgramsButton = this.startMenu.querySelector('#menu-all-programs');
        const footer = this.startMenu.querySelector('.start-menu-footer');
        if (!allProgramsButton || !footer) return;

        const buttonRect = allProgramsButton.getBoundingClientRect();
        const footerRect = footer.getBoundingClientRect();
        const left = buttonRect.right + 'px';
        const bottom = window.innerHeight - footerRect.top + 'px';

        Object.assign(this.allProgramsMenu.style, {
            left: left,
            bottom: bottom,
            top: 'auto',
            display: 'block'
        });

        this.allProgramsMenu.classList.add('active');
    }

    hideAllProgramsMenu() {
        // Don't hide if any folder submenu is visible
        const anyFolderSubmenuVisible = Object.values(this.folderSubmenus).some(
            submenu => submenu && submenu.style.display !== 'none'
        );

        if (anyFolderSubmenuVisible) {
            return; // Keep All Programs open while folder is open
        }

        if (this.allProgramsMenu) {
            this.allProgramsMenu.classList.remove('active');
            this.allProgramsMenu.style.display = 'none';
        }
        // Also hide folder submenus when hiding all programs
        this.hideFolderSubmenus();
    }

    openProgram(programName) {
        this.eventBus.publish(EVENTS.PROGRAM_OPEN, { programName: programName });
    }

    toggleStartMenu() {
        if (!this.startMenu) {
            this.createStartMenuElement();
            if (!this.startMenu) return;
        }

        if (!this.startButton) {
            this.startButton = document.getElementById('start-button');
            if (!this.startButton) return;
        }

        if (!this._eventsInitialized) {
            this.setupEventListeners();
        }

        const menu = this.startMenu;
        if (!menu) return;

        const isActive = menu.classList.contains('active');
        if (!isActive) {
            menu.style.visibility = 'visible';
            menu.style.opacity = '1';
            menu.classList.add('active');
            this._lastOpenedAt = Date.now();
            this.eventBus.publish(EVENTS.STARTMENU_OPENED);

            const activeWindow = document.querySelector('.window.active');
            this.updateContentOverlay(activeWindow?.id);
            this.attachIframeFocusListeners();
            this.attachWindowBlurListener();
        } else {
            this.closeStartMenu();
        }
    }

    closeStartMenu() {
        const isActive = this.startMenu?.classList.contains('active');
        if (!this.startMenu || !isActive) return;

        this.startMenu.classList.remove('active');
        this.hideAllProgramsMenu();
        this.hideFolderSubmenus();
        this.updateContentOverlay(null);
        this.removeIframeFocusListeners();
        this.removeWindowBlurListener();

        import('../utils/frameScheduler.js').then(({ scheduleWrite }) => {
            scheduleWrite(() => {
                if (this.startMenu) {
                    this.startMenu.style.visibility = 'hidden';
                    this.startMenu.style.opacity = '0';
                }
            });
        });

        this.eventBus.publish(EVENTS.STARTMENU_CLOSED);
        this.hideRecentlyUsedMenu();
    }

    updateContentOverlay(windowId) {
        if (!this.startMenu) return;

        if (this.activeWindowOverlay) {
            this.activeWindowOverlay.style.display = 'none';
            this.activeWindowOverlay.style.pointerEvents = 'none';
            this.activeWindowOverlay = null;
        }

        let overlay = null;
        if (windowId) {
            const windowElement = document.getElementById(windowId);
            if (windowElement) {
                overlay = windowElement.querySelector('.start-menu-content-click-overlay');
            }
        }

        if (overlay && this.startMenu?.classList.contains('active')) {
            overlay.style.display = 'block';
            overlay.style.pointerEvents = 'auto';
            this.activeWindowOverlay = overlay;
        } else if (overlay) {
            overlay.style.display = 'none';
            overlay.style.pointerEvents = 'none';
        }
    }

    showRecentlyUsedMenu() {
        if (!this.recentlyUsedMenu || !this.startMenu) return;

        const trigger = this.startMenu.querySelector('#menu-program4');
        if (!trigger) return;

        this.recentlyUsedMenu.style.visibility = 'hidden';
        this.recentlyUsedMenu.style.display = 'block';

        const triggerRect = trigger.getBoundingClientRect();
        const menuRect = this.recentlyUsedMenu.getBoundingClientRect();

        let left = triggerRect.right;
        if (left + menuRect.width > window.innerWidth) {
            left = triggerRect.left - menuRect.width;
        }

        let top = triggerRect.bottom - menuRect.height;
        if (top < 0) {
            top = 0;
        }
        if (top + menuRect.height > window.innerHeight - 30) {
            top = window.innerHeight - 30 - menuRect.height;
        }

        Object.assign(this.recentlyUsedMenu.style, {
            left: left + 'px',
            top: top + 'px',
            display: 'block',
            visibility: 'visible'
        });

        this.recentlyUsedMenu.addEventListener('mouseleave', event => {
            if (event.relatedTarget &&
                (event.relatedTarget === trigger ||
                 event.relatedTarget.closest('#menu-program4'))) {
                return;
            }
            this.hideRecentlyUsedMenu();
        });

        this.recentlyUsedMenu.classList.add('mut-menu-active');
        trigger.classList.add('active-submenu-trigger');
    }

    hideRecentlyUsedMenu() {
        if (this.recentlyUsedMenu) {
            this.recentlyUsedMenu.classList.remove('mut-menu-active');
            this.recentlyUsedMenu.style.display = 'none';
        }

        if (!this._cachedProgram4Button) {
            this._cachedProgram4Button = this.startMenu?.querySelector('#menu-program4');
        }
        this._cachedProgram4Button?.classList.remove('active-submenu-trigger');
    }

    createFolderSubmenu(folderId) {
        if (this.folderSubmenus[folderId]) {
            return this.folderSubmenus[folderId];
        }

        const folder = START_MENU_FOLDERS[folderId];
        if (!folder) return null;

        const folderItems = folder.items.map(itemId => {
            const entry = getCatalogEntry(itemId);
            if (!entry) return null;
            return toProgramItem(entry);
        }).filter(Boolean);

        const submenu = document.createElement('div');
        submenu.className = 'folder-submenu';
        submenu.dataset.folderId = folderId;
        submenu.innerHTML = buildMenuHTML(folderItems, 'all-programs', 'all-programs-items');
        submenu.style.display = 'none';
        document.body.appendChild(submenu);

        attachMenuItemEffects(submenu, '.all-programs-item');
        submenu.addEventListener('click', this._handleMenuClick.bind(this));

        this.folderSubmenus[folderId] = submenu;
        return submenu;
    }

    showFolderSubmenu(folderId, triggerElement) {
        // Hide all other folder submenus
        Object.values(this.folderSubmenus).forEach(submenu => {
            submenu.style.display = 'none';
            submenu.classList.remove('mut-menu-active');
        });

        // Remove active state from all folder items
        if (this.allProgramsMenu) {
            this.allProgramsMenu.querySelectorAll('.folder-item').forEach(item => {
                item.classList.remove('active-submenu-trigger');
            });
        }

        let submenu = this.folderSubmenus[folderId];
        if (!submenu) {
            submenu = this.createFolderSubmenu(folderId);
        }

        if (!submenu || !triggerElement) return;

        const triggerRect = triggerElement.getBoundingClientRect();

        submenu.style.visibility = 'hidden';
        submenu.style.display = 'block';

        const submenuRect = submenu.getBoundingClientRect();

        // Position directly adjacent to trigger (no gap)
        let left = triggerRect.right - 4; // More overlap to prevent gap
        if (left + submenuRect.width > window.innerWidth) {
            left = triggerRect.left - submenuRect.width + 4;
        }

        let top = triggerRect.top - 3; // Align with top of trigger with overlap
        if (top + submenuRect.height > window.innerHeight) {
            top = window.innerHeight - submenuRect.height - 10;
        }
        if (top < 0) {
            top = 0;
        }

        Object.assign(submenu.style, {
            left: left + 'px',
            top: top + 'px',
            display: 'block',
            visibility: 'visible'
        });

        submenu.classList.add('mut-menu-active');
        triggerElement.classList.add('active-submenu-trigger');

        // Clean up old listeners
        if (submenu._hideHandler) {
            submenu.removeEventListener('mouseleave', submenu._hideHandler);
            if (submenu._triggerElement) {
                submenu._triggerElement.removeEventListener('mouseleave', submenu._hideHandler);
                submenu._triggerElement.removeEventListener('mouseenter', submenu._enterHandler);
            }
        }
        if (submenu._enterHandler) {
            submenu.removeEventListener('mouseenter', submenu._enterHandler);
        }
        if (submenu._hideTimeout) {
            clearTimeout(submenu._hideTimeout);
        }

        // Set up mouse leave handlers with longer delay
        const hideHandler = (event) => {
            const relatedTarget = event.relatedTarget;

            // Clear any pending hide timeout
            if (submenu._hideTimeout) {
                clearTimeout(submenu._hideTimeout);
            }

            if (!relatedTarget) {
                // Add longer delay before hiding
                submenu._hideTimeout = setTimeout(() => {
                    this.hideFolderSubmenus();
                }, 500);
                return;
            }

            // Don't hide if moving within All Programs menu or to submenu
            const movingToSubmenu = submenu.contains(relatedTarget) || relatedTarget.closest('.folder-submenu');
            const movingToTrigger = triggerElement.contains(relatedTarget) || relatedTarget === triggerElement;
            const movingToAllPrograms = this.allProgramsMenu?.contains(relatedTarget);

            if (!movingToSubmenu && !movingToTrigger && !movingToAllPrograms) {
                // Add longer delay before hiding
                submenu._hideTimeout = setTimeout(() => {
                    this.hideFolderSubmenus();
                }, 500);
            }
        };

        const enterHandler = () => {
            // Cancel hide when mouse enters
            if (submenu._hideTimeout) {
                clearTimeout(submenu._hideTimeout);
            }
        };

        submenu._hideHandler = hideHandler;
        submenu._enterHandler = enterHandler;
        submenu._triggerElement = triggerElement;

        submenu.addEventListener('mouseleave', hideHandler);
        submenu.addEventListener('mouseenter', enterHandler);
        triggerElement.addEventListener('mouseleave', hideHandler);
        triggerElement.addEventListener('mouseenter', enterHandler);
    }

    hideFolderSubmenus() {
        Object.values(this.folderSubmenus).forEach(submenu => {
            if (submenu._hideTimeout) {
                clearTimeout(submenu._hideTimeout);
            }
            submenu.style.display = 'none';
            submenu.classList.remove('mut-menu-active');
        });

        if (this.allProgramsMenu) {
            this.allProgramsMenu.querySelectorAll('.folder-item').forEach(item => {
                item.classList.remove('active-submenu-trigger');
            });
        }

        // After hiding folder submenus, hide all programs menu if appropriate
        setTimeout(() => {
            if (this.allProgramsMenu && this.allProgramsMenu.style.display !== 'none') {
                // Check if mouse is still in the menu area
                const allProgramsButton = document.getElementById('menu-all-programs');
                if (allProgramsButton && !allProgramsButton.matches(':hover') &&
                    !this.allProgramsMenu.matches(':hover')) {
                    this.allProgramsMenu.classList.remove('active');
                    this.allProgramsMenu.style.display = 'none';
                }
            }
        }, 200);
    }

    attachIframeFocusListeners() {
        this._iframeFocusHandler = () => this.closeStartMenu();
        this._cachedIframes = document.querySelectorAll('#windows-container iframe');
        this._cachedIframes.forEach(iframe => {
            try {
                iframe.addEventListener('focus', this._iframeFocusHandler);
            } catch (error) {}
        });
    }

    removeIframeFocusListeners() {
        if (!this._iframeFocusHandler) return;
        const iframes = this._cachedIframes || document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.removeEventListener('focus', this._iframeFocusHandler);
        });
        this._iframeFocusHandler = null;
        this._cachedIframes = null;
    }

    attachWindowBlurListener() {}

    removeWindowBlurListener() {
        if (this._windowBlurHandler) {
            window.removeEventListener('blur', this._windowBlurHandler);
            this._windowBlurHandler = null;
        }
    }
}

function getAllProgramsItems() {
    // Use dynamic social links from SOCIALS array (loaded by loadSocials())
    const socialItems = SOCIALS.map(social => ({
        type: 'url',
        url: social.url,
        icon: social.icon ? './' + social.icon.replace(/^\.\//, '').replace(/^\//, '') : '',
        label: social.name
    }));

    return [...ALL_PROGRAMS_ITEMS_BASE, ...socialItems];
}
