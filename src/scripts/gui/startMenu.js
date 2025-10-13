import { EVENTS } from '../utils/eventBus.js';
import { PortfolioManager } from '../../libs/portfolio/portfolioManager.js';
import {
    ALL_PROGRAMS_ORDER,
    PINNED_LEFT_ORDER,
    PINNED_RIGHT_ORDER,
    START_MENU_CATALOG
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

    const attributes = [`id="menu-${menuId}"`, `tabindex="${disabled ? '-1' : '0'}"`, `aria-disabled="${disabled ? 'true' : 'false'}"`];

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

    const descriptionHtml = item.description ? `<span class="item-description">${item.description}</span>` : '';

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

const ALL_PROGRAMS_ITEMS_BASE = ALL_PROGRAMS_ORDER
    .map(id => {
        const entry = getCatalogEntry(id);
        if (!entry) return null;
        if (entry.type === 'separator') {
            return { type: 'separator' };
        }
        return toProgramItem(entry);
    })
    .filter(Boolean),
    AFTER_EFFECTS_ITEM = {
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

function buildMenuHTML(_0x420c10, _0x2403aa, _0x48e8b6) {
    return '<ul' + (_0x48e8b6 ? '\x20class=\x22' + _0x48e8b6 + '\x22' : '') + '>' + _0x420c10['map'](_0x5e2352 => {
        if (_0x5e2352['type'] === 'separator') return '<li\x20class=\x22' + _0x2403aa + '-separator\x22></li>';
        else {
            if (_0x5e2352['type'] === 'program') return '<li\x20class=\x22' + _0x2403aa + '-item' + (_0x5e2352['disabled'] ? '\x20disabled' : '') + '\x22\x20data-action=\x22open-program\x22\x20data-program-name=\x22' + _0x5e2352['programName'] + '\x22>\x0a' + ('<img\x20decoding=\x22async\x22\x20src=\x22' + _0x5e2352['icon'] + '\x22\x20alt=\x22' + _0x5e2352['label'] + '\x22>\x0a') + (_0x5e2352['label'] + '\x0a') + '</li>';
            else {
                if (_0x5e2352['type'] === 'url') return '<li\x20class=\x22' + _0x2403aa + '-item\x22\x20data-action=\x22open-url\x22\x20data-url=\x22' + _0x5e2352['url'] + '\x22>\x0a' + ('<img\x20decoding=\x22async\x22\x20src=\x22' + _0x5e2352['icon'] + '\x22\x20alt=\x22' + _0x5e2352['label'] + '\x22>\x0a') + (_0x5e2352['label'] + '\x0a') + '</li>';
            }
        }
        return '';
    })['join']('') + '</ul>';
}

function attachMenuItemEffects(_0x32a8df, _0x472ade) {
    const _0x4719f4 = _0x32a8df['querySelectorAll'](_0x472ade);
    _0x4719f4['forEach'](_0x489d96 => {
        _0x489d96['addEventListener']('mousedown', _0x21a808 => {
            _0x21a808['preventDefault'](), _0x489d96['classList']['add']('menu-item-clicked');
        }), ['mouseup', 'mouseleave', 'mouseout']['forEach'](_0x4fd62e => {
            _0x489d96['addEventListener'](_0x4fd62e, () => {
                _0x489d96['classList']['remove']('menu-item-clicked');
            });
        });
    });
}
export default class StartMenu {
    constructor(eventBus) {
        this['eventBus'] = eventBus, this['startButton'] = document['getElementById']('start-button'), this['startMenu'] = null, this['allProgramsMenu'] = null, this['recentlyUsedMenu'] = null, this['activeWindowOverlay'] = null, this['infoData'] = {}, this['systemAssets'] = null, this['_eventsInitialized'] = ![], this['_init'](), this['eventBus']['subscribe'](EVENTS['STARTMENU_TOGGLE'], () => this['toggleStartMenu']()), this['eventBus']['subscribe'](EVENTS['STARTMENU_CLOSE_REQUEST'], () => {
            this['startMenu']?.['classList']['contains']('active') && this['closeStartMenu']();
        }), this['eventBus']['subscribe'](EVENTS['WINDOW_FOCUSED'], _0x3d6fe0 => {
            this['updateContentOverlay'](_0x3d6fe0?.['windowId']);
        });
    } ['_cleanup']() {
        try {
            this['removeIframeFocusListeners'](), this['removeWindowBlurListener'](), this['_onWindowMouseDown'] && (window['removeEventListener']('mousedown', this['_onWindowMouseDown'], !![]), this['_onWindowMouseDown'] = null), this['_onDocumentKeyDown'] && (document['removeEventListener']('keydown', this['_onDocumentKeyDown']), this['_onDocumentKeyDown'] = null), this['startMenu'] && this['_onStartMenuClick'] && (this['startMenu']['removeEventListener']('click', this['_onStartMenuClick']), this['_onStartMenuClick'] = null), this['startMenu'] && this['startMenu']['parentNode'] && this['startMenu']['parentNode']['removeChild'](this['startMenu']), this['allProgramsMenu'] && this['allProgramsMenu']['parentNode'] && this['allProgramsMenu']['parentNode']['removeChild'](this['allProgramsMenu']), this['recentlyUsedMenu'] && this['recentlyUsedMenu']['parentNode'] && this['recentlyUsedMenu']['parentNode']['removeChild'](this['recentlyUsedMenu']), this['startMenu'] = null, this['allProgramsMenu'] = null, this['recentlyUsedMenu'] = null, this['activeWindowOverlay'] = null, this['_eventsInitialized'] = ![];
        } catch (_0x44a94a) {}
    }
    async ['_init']() {
        this['infoData'] = await loadSocials(), this['systemAssets'] = await getSystemAssets(), this['createStartMenuElement'](), this['setupEventListeners']();
    } ['createStartMenuElement']() {
        const _0x3db683 = this['startMenu'] || document['querySelector']('.startmenu');
        _0x3db683 && _0x3db683 !== this['startMenu'] && _0x3db683['parentNode']['removeChild'](_0x3db683);
        const _0x286b04 = document['createElement']('div');
        _0x286b04['className'] = 'startmenu', _0x286b04['innerHTML'] = this['getMenuTemplate'](), _0x286b04['style']['visibility'] = 'hidden', _0x286b04['style']['opacity'] = '0', document['body']['appendChild'](_0x286b04), this['startMenu'] = _0x286b04;

        const _0x41658f = _0x286b04['querySelector']('.menutopbar');
        if (_0x41658f) {
            const _0x543978 = this['systemAssets']?.['userIcon'] || './assets/gui/boot/xp.svg';
            const _0x3a6deb = typeof _0x543978 === 'string'
                ? (_0x543978.includes('%') ? _0x543978 : _0x543978.replace(/\s/g, '%20'))
                : null;

            _0x41658f['innerHTML'] = '';

            if (_0x3a6deb) {
                const _0x1c52d5 = document['createElement']('img');
                _0x1c52d5['className'] = 'userpicture';
                _0x1c52d5['decoding'] = 'async';
                _0x1c52d5['draggable'] = ![];
                _0x1c52d5['alt'] = 'User';
                _0x1c52d5['src'] = _0x3a6deb;
                _0x41658f['appendChild'](_0x1c52d5);
            }

            const _0x295cac = document['createElement']('span');
            _0x295cac['className'] = 'username';
            _0x41658f['appendChild'](_0x295cac);
        }
        const _0x1bb69b = this['infoData']?.['contact']?.['name'] || 'firstname lastname';
        _0x286b04['querySelectorAll']('.menutopbar\x20.username')['forEach'](_0x3c4880 => {
            _0x3c4880['textContent'] = _0x1bb69b;
        }), this['createAllProgramsMenu'](), this['createRecentlyUsedMenu'](), this['setupMenuItems'](), this['_setupDelegatedEventHandlers']();
    } ['_createSubMenu'](_0x566194, _0x4d142f, _0x375184) {
        if (!this[_0x375184]) {
            const _0x2033dc = document['createElement']('div');
            _0x2033dc['className'] = _0x566194, _0x2033dc['innerHTML'] = _0x4d142f, _0x2033dc['style']['display'] = 'none', document['body']['appendChild'](_0x2033dc), this[_0x375184] = _0x2033dc;
        }
        return this[_0x375184];
    } ['_createMenuWithEffects']({
        items: _0x402ff1,
        itemClass: _0x78cc1c,
        ulClass: _0x2a0aea,
        menuClass: _0x1924fc,
        propertyName: _0x14812e,
        itemSelector: _0x238ebf,
        attachClickHandler: _0x5d6517
    }) {
        const _0x82504a = buildMenuHTML(_0x402ff1, _0x78cc1c, _0x2a0aea),
            _0x372dd0 = this['_createSubMenu'](_0x1924fc, _0x82504a, _0x14812e);
        return attachMenuItemEffects(_0x372dd0, _0x238ebf), _0x5d6517 && _0x372dd0['addEventListener']('click', this['_handleMenuClick']['bind'](this)), _0x372dd0;
    } ['createAllProgramsMenu']() {
        this['_createMenuWithEffects']({
            'items': getAllProgramsItems(),
            'itemClass': 'all-programs',
            'ulClass': 'all-programs-items',
            'menuClass': 'all-programs-menu',
            'propertyName': 'allProgramsMenu',
            'itemSelector': '.all-programs-item',
            'attachClickHandler': !![]
        });
    } ['createRecentlyUsedMenu']() {
        const _0x758e95 = {};
        _0x758e95['items'] = RECENTLY_USED_ITEMS, _0x758e95['itemClass'] = 'recently-used', _0x758e95['ulClass'] = 'recently-used-items', _0x758e95['menuClass'] = 'recently-used-menu', _0x758e95['propertyName'] = 'recentlyUsedMenu', _0x758e95['itemSelector'] = '.recently-used-item', _0x758e95['attachClickHandler'] = !![], this['_createMenuWithEffects'](_0x758e95);
    } ['getMenuTemplate']() {
        const userIcon = this['systemAssets']?.['userIcon'] || './assets/gui/boot/xp.svg';
        const normalizedIcon = typeof userIcon === 'string'
            ? (userIcon.includes('%') ? userIcon : userIcon.replace(/\s/g, '%20'))
            : null;
        const userIconHtml = normalizedIcon
            ? `<img decoding="async" src="${normalizedIcon}" alt="User" class="userpicture">`
            : '';

        const username = this['infoData']?.['contact']?.['name'] || 'firstname lastname';

        const pinnedLeftItems = buildPinnedMenuItems(PINNED_LEFT_ORDER);
        const pinnedRightItems = buildPinnedMenuItems(PINNED_RIGHT_ORDER);

        const socialMenuItems = SOCIALS.map(social => ({
            'type': 'program',
            'id': social.key,
            'icon': social.icon ? './' + social.icon.replace(/^\.\//, '').replace(/^\//, '') : '',
            'title': social.name,
            'description': null,
            'action': 'open-url',
            'url': social.url,
            'disabled': false
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
    } ['setupEventListeners']() {
        this['_onWindowMouseDown'] = _0x39ff8e => {
            if (!this['startMenu']?.['classList']['contains']('active')) return;
            if (this['_lastOpenedAt'] && Date['now']() - this['_lastOpenedAt'] < 0xc8) return;
            const _0x3330a3 = _0x39ff8e['target'];
            if (_0x3330a3['classList']['contains']('start-menu-content-click-overlay') || _0x3330a3['tagName'] === 'IFRAME') return;
            const _0x10cbaf = this['startMenu']['contains'](_0x3330a3),
                _0x3ffed7 = this['startButton']['contains'](_0x3330a3),
                _0x3d274e = this['allProgramsMenu']?.['contains'](_0x3330a3),
                _0x2c121a = this['recentlyUsedMenu']?.['contains'](_0x3330a3);
            !_0x10cbaf && !_0x3ffed7 && !_0x3d274e && !_0x2c121a && (_0x39ff8e['stopPropagation'](), _0x39ff8e['preventDefault'](), this['hideAllProgramsMenu'](), this['closeStartMenu']());
        }, window['addEventListener']('mousedown', this['_onWindowMouseDown'], !![]), this['_onDocumentKeyDown'] = _0x11d23b => {
            _0x11d23b['key'] === 'Escape' && this['startMenu']?.['classList']['contains']('active') && this['closeStartMenu']();
        }, document['addEventListener']('keydown', this['_onDocumentKeyDown']), this['_eventsInitialized'] = !![];
    } ['_handleMenuClick'](_0x7c8be6) {
        const _0x15c42b = _0x7c8be6['target']['closest']('[data-action],\x20[data-program-name],\x20[data-url]');
        if (!_0x15c42b) return;
        if (_0x15c42b['classList']['contains']('all-programs-item') && _0x15c42b['classList']['contains']('disabled')) {
            _0x7c8be6['stopPropagation'](), _0x7c8be6['preventDefault']();
            return;
        }
        if (_0x15c42b['classList']['contains']('recently-used-item') && _0x15c42b['classList']['contains']('disabled')) {
            _0x7c8be6['stopPropagation'](), _0x7c8be6['preventDefault']();
            return;
        }
        const _0x9a12cb = _0x15c42b['dataset']['action'],
            _0x32d6ba = _0x15c42b['dataset']['programName'],
            _0x208fa2 = _0x15c42b['dataset']['url'];
        if (_0x9a12cb === 'toggle-recently-used') {
            this['showRecentlyUsedMenu']();
            return;
        }
        if (_0x9a12cb === 'open-program' && _0x32d6ba) {
            if (document['documentElement']['classList']['contains']('mobile-device') && (_0x32d6ba === 'mediaPlayer' || _0x32d6ba === 'paint')) {
                _0x7c8be6['preventDefault'](), _0x7c8be6['stopPropagation'](), import('../utils/popupManager.js')['then'](({
                    default: _0x393944
                }) => {
                    !_0x393944['isInitialized'] && _0x393944['init']();
                    const _0x4dca60 = {};
                    _0x4dca60['title'] = 'Media\x20Player', _0x4dca60['icon'] = './assets/gui/start-menu/mediaPlayer.webp';
                    const _0x4a5110 = {};
                    _0x4a5110['title'] = 'Paint', _0x4a5110['icon'] = './assets/gui/start-menu/paint.webp';
                    const _0x1aa6d3 = {};
                    _0x1aa6d3['mediaPlayer'] = _0x4dca60, _0x1aa6d3['paint'] = _0x4a5110;
                    const _0x3c9e67 = _0x1aa6d3,
                        _0xf2df78 = {};
                    _0xf2df78['title'] = 'This\x20App', _0xf2df78['icon'] = null;
                    const {
                        title: _0x77aa58,
                        icon: _0x2847ba
                    } = _0x3c9e67[_0x32d6ba] || _0xf2df78;
                    _0x393944['showMobileRestrictionPopup'](_0x77aa58, _0x2847ba);
                }), this['closeStartMenu']();
                return;
            }
            this['openProgram'](_0x32d6ba), this['closeStartMenu']();
        } else {
            if (_0x9a12cb === 'open-url' && _0x208fa2) {
                try {
                    window['postMessage']({
                        'type': 'confirm-open-link',
                        'url': _0x208fa2,
                        'label': _0x15c42b?.['textContent']?.['trim']() || ''
                    }, '*');
                } catch (_0x12df03) {
                    window['open'](_0x208fa2, '_blank');
                }
                this['closeStartMenu']();
            } else {
                if (_0x9a12cb === 'log-off') {
                    const _0x284e24 = {};
                    _0x284e24['dialogType'] = 'logOff', this['eventBus']['publish'](EVENTS['LOG_OFF_CONFIRMATION_REQUESTED'], _0x284e24), this['closeStartMenu']();
                } else {
                    if (_0x9a12cb === 'shut-down') {
                        const _0x58ef94 = {};
                        _0x58ef94['dialogType'] = 'shutDown', this['eventBus']['publish'](EVENTS['LOG_OFF_CONFIRMATION_REQUESTED'], _0x58ef94), this['closeStartMenu']();
                    }
                }
            }
        }
    } ['_setupDelegatedEventHandlers']() {
        this['startMenu'] && (this['_onStartMenuClick'] = this['_handleMenuClick']['bind'](this), this['startMenu']['addEventListener']('click', this['_onStartMenuClick']));
    } ['setupMenuItems']() {
        this['setupAllProgramsMenu']();
        const _0x4d49a0 = this['startMenu']['querySelector']('#menu-program4');
        if (_0x4d49a0) {
            _0x4d49a0['setAttribute']('data-action', 'toggle-recently-used'), _0x4d49a0['style']['position'] = 'relative', _0x4d49a0['style']['width'] = '100%';
            const _0x428b73 = document['createElement']('span');
            _0x428b73['className'] = 'mut-menu-arrow', _0x428b73['innerHTML'] = '►', _0x428b73['style']['position'] = 'absolute', _0x428b73['style']['right'] = '8px', _0x428b73['style']['top'] = '50%', _0x428b73['style']['transform'] = 'translateY(-50%)\x20scaleX(0.5)', _0x428b73['style']['fontSize'] = '10px', _0x4d49a0['appendChild'](_0x428b73), _0x4d49a0['addEventListener']('mouseenter', () => this['showRecentlyUsedMenu']()), _0x4d49a0['addEventListener']('mouseleave', _0xa93427 => {
                if (_0xa93427['relatedTarget'] && (_0xa93427['relatedTarget']['closest']('.recently-used-menu') || _0xa93427['relatedTarget'] === this['recentlyUsedMenu'])) return;
                this['hideRecentlyUsedMenu']();
            });
        }
    } ['setupAllProgramsMenu']() {
        const _0x5af4b3 = document['getElementById']('menu-all-programs');
        if (!_0x5af4b3 || !this['allProgramsMenu'] || !this['startMenu']) return;
        _0x5af4b3['addEventListener']('mouseenter', () => this['showAllProgramsMenu']()), _0x5af4b3['addEventListener']('mouseleave', _0x2dc82e => {
            if (_0x2dc82e['relatedTarget'] && (_0x2dc82e['relatedTarget']['closest']('.all-programs-menu') || _0x2dc82e['relatedTarget'] === this['allProgramsMenu'])) return;
            this['hideAllProgramsMenu']();
        }), this['allProgramsMenu']['addEventListener']('mouseleave', _0x4e03f8 => {
            if (_0x4e03f8['relatedTarget'] && (_0x4e03f8['relatedTarget'] === _0x5af4b3 || _0x4e03f8['relatedTarget']['closest']('#menu-all-programs'))) return;
            this['hideAllProgramsMenu']();
        });
        const _0x562421 = this['startMenu']['querySelectorAll']('.menu-item:not(#menu-all-programs),\x20.menutopbar,\x20.start-menu-footer,\x20.middle-right');
        _0x562421['forEach'](_0x3819a7 => {
            _0x3819a7['addEventListener']('mouseenter', () => this['hideAllProgramsMenu']());
        });
    } ['showAllProgramsMenu']() {
        if (!this['allProgramsMenu'] || !this['startMenu']) return;
        const _0x4ade8f = this['startMenu']['querySelector']('#menu-all-programs'),
            _0x254ca0 = this['startMenu']['querySelector']('.start-menu-footer');
        if (!_0x4ade8f || !_0x254ca0) return;
        const _0x605fa9 = _0x4ade8f['getBoundingClientRect'](),
            _0x9a5a7 = _0x254ca0['getBoundingClientRect'](),
            _0x19e451 = _0x605fa9['right'] + 'px',
            _0x596b53 = window['innerHeight'] - _0x9a5a7['top'] + 'px',
            _0x19872d = {};
        _0x19872d['left'] = _0x19e451, _0x19872d['bottom'] = _0x596b53, _0x19872d['top'] = 'auto', _0x19872d['display'] = 'block', Object['assign'](this['allProgramsMenu']['style'], _0x19872d), this['allProgramsMenu']['classList']['add']('active');
    } ['hideAllProgramsMenu']() {
        this['allProgramsMenu'] && (this['allProgramsMenu']['classList']['remove']('active'), this['allProgramsMenu']['style']['display'] = 'none');
    } ['openProgram'](_0x485f02) {
        const _0x547faf = {};
        _0x547faf['programName'] = _0x485f02, this['eventBus']['publish'](EVENTS['PROGRAM_OPEN'], _0x547faf);
    } ['toggleStartMenu']() {
        if (!this['startMenu']) {
            this['createStartMenuElement']();
            if (!this['startMenu']) return;
        }
        if (!this['startButton']) {
            this['startButton'] = document['getElementById']('start-button');
            if (!this['startButton']) return;
        }!this['_eventsInitialized'] && this['setupEventListeners']();
        const _0x2edacc = this['startMenu'];
        if (!_0x2edacc) return;
        const _0x53da3c = _0x2edacc['classList']['contains']('active');
        if (!_0x53da3c) {
            _0x2edacc['style']['visibility'] = 'visible', _0x2edacc['style']['opacity'] = '1', _0x2edacc['classList']['add']('active'), this['_lastOpenedAt'] = Date['now'](), this['eventBus']['publish'](EVENTS['STARTMENU_OPENED']);
            const _0x1f6b5d = document['querySelector']('.window.active');
            this['updateContentOverlay'](_0x1f6b5d?.['id']), this['attachIframeFocusListeners'](), this['attachWindowBlurListener']();
        } else this['closeStartMenu']();
    } ['closeStartMenu']() {
        const _0x19bb56 = this['startMenu']?.['classList']['contains']('active');
        if (!this['startMenu'] || !_0x19bb56) return;
        this['startMenu']['classList']['remove']('active'), this['hideAllProgramsMenu'](), this['updateContentOverlay'](null), this['removeIframeFocusListeners'](), this['removeWindowBlurListener'](), import('../utils/frameScheduler.js')['then'](({
            scheduleWrite: _0x2f9ee9
        }) => {
            _0x2f9ee9(() => {
                this['startMenu'] && (this['startMenu']['style']['visibility'] = 'hidden', this['startMenu']['style']['opacity'] = '0');
            });
        }), this['eventBus']['publish'](EVENTS['STARTMENU_CLOSED']), this['hideRecentlyUsedMenu']();
    } ['updateContentOverlay'](_0xbaf11f) {
        if (!this['startMenu']) return;
        this['activeWindowOverlay'] && (this['activeWindowOverlay']['style']['display'] = 'none', this['activeWindowOverlay']['style']['pointerEvents'] = 'none', this['activeWindowOverlay'] = null);
        let _0xf61934 = null;
        if (_0xbaf11f) {
            const _0x3f9a05 = document['getElementById'](_0xbaf11f);
            _0x3f9a05 && (_0xf61934 = _0x3f9a05['querySelector']('.start-menu-content-click-overlay'));
        }
        if (_0xf61934 && this['startMenu']?.['classList']['contains']('active')) _0xf61934['style']['display'] = 'block', _0xf61934['style']['pointerEvents'] = 'auto', this['activeWindowOverlay'] = _0xf61934;
        else _0xf61934 && (_0xf61934['style']['display'] = 'none', _0xf61934['style']['pointerEvents'] = 'none');
    } ['showRecentlyUsedMenu']() {
        if (!this['recentlyUsedMenu'] || !this['startMenu']) return;
        const _0x2ea1b4 = this['startMenu']['querySelector']('#menu-program4');
        if (!_0x2ea1b4) return;
        this['recentlyUsedMenu']['style']['visibility'] = 'hidden', this['recentlyUsedMenu']['style']['display'] = 'block';
        const _0x2af3c4 = _0x2ea1b4['getBoundingClientRect'](),
            _0x48cff9 = this['recentlyUsedMenu']['getBoundingClientRect']();
        let _0x5595d0 = _0x2af3c4['right'];
        _0x5595d0 + _0x48cff9['width'] > window['innerWidth'] && (_0x5595d0 = _0x2af3c4['left'] - _0x48cff9['width']);
        let _0xedde32 = _0x2af3c4['bottom'] - _0x48cff9['height'];
        _0xedde32 < 0x0 && (_0xedde32 = 0x0);
        _0xedde32 + _0x48cff9['height'] > window['innerHeight'] - 0x1e && (_0xedde32 = window['innerHeight'] - 0x1e - _0x48cff9['height']);
        const _0x3f3362 = {};
        _0x3f3362['left'] = _0x5595d0 + 'px', _0x3f3362['top'] = _0xedde32 + 'px', _0x3f3362['display'] = 'block', _0x3f3362['visibility'] = 'visible', Object['assign'](this['recentlyUsedMenu']['style'], _0x3f3362), this['recentlyUsedMenu']['addEventListener']('mouseleave', _0x1db712 => {
            if (_0x1db712['relatedTarget'] && (_0x1db712['relatedTarget'] === _0x2ea1b4 || _0x1db712['relatedTarget']['closest']('#menu-program4'))) return;
            this['hideRecentlyUsedMenu']();
        }), this['recentlyUsedMenu']['classList']['add']('mut-menu-active'), _0x2ea1b4['classList']['add']('active-submenu-trigger');
    } ['hideRecentlyUsedMenu']() {
        this['recentlyUsedMenu'] && (this['recentlyUsedMenu']['classList']['remove']('mut-menu-active'), this['recentlyUsedMenu']['style']['display'] = 'none'), !this['_cachedProgram4Button'] && (this['_cachedProgram4Button'] = this['startMenu']?.['querySelector']('#menu-program4')), this['_cachedProgram4Button']?.['classList']['remove']('active-submenu-trigger');
    } ['attachIframeFocusListeners']() {
        this['_iframeFocusHandler'] = () => this['closeStartMenu'](), this['_cachedIframes'] = document['querySelectorAll']('#windows-container\x20iframe'), this['_cachedIframes']['forEach'](_0x299254 => {
            try {
                _0x299254['addEventListener']('focus', this['_iframeFocusHandler']);
            } catch (_0x3847c4) {}
        });
    } ['removeIframeFocusListeners']() {
        if (!this['_iframeFocusHandler']) return;
        const _0x3fb861 = this['_cachedIframes'] || document['querySelectorAll']('iframe');
        _0x3fb861['forEach'](_0x3ed747 => {
            _0x3ed747['removeEventListener']('focus', this['_iframeFocusHandler']);
        }), this['_iframeFocusHandler'] = null, this['_cachedIframes'] = null;
    } ['attachWindowBlurListener']() {} ['removeWindowBlurListener']() {
        this['_windowBlurHandler'] && (window['removeEventListener']('blur', this['_windowBlurHandler']), this['_windowBlurHandler'] = null);
    }
}

function getAllProgramsItems() {
    // Use dynamic social links from SOCIALS array (loaded by loadSocials())
    const socialItems = SOCIALS.map(social => ({
        'type': 'url',
        'url': social.url,
        'icon': social.icon ? './' + social.icon.replace(/^\.\//, '').replace(/^\//, '') : '',
        'label': social.name
    }));


    return [...ALL_PROGRAMS_ITEMS_BASE, ...socialItems];
}
