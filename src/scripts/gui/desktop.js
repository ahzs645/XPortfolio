import { EVENTS } from '../utils/eventBus.js';
import { START_MENU_CATALOG } from '../../config/startMenuItems.js';

const SOCIAL_ICON_MAP = {
    linkedin: './assets/gui/start-menu/linkedin.webp',
    github: './assets/gui/start-menu/github.webp',
    instagram: './assets/gui/start-menu/instagram.webp',
    facebook: './assets/gui/start-menu/facebook.webp',
    twitter: './assets/gui/start-menu/github.webp'
};

let SOCIALS_CACHE = null;
let SYSTEM_ASSETS = null;
const DEFAULT_DESKTOP_PROGRAMS = [
    'about',
    'resume',
    'projects',
    'contact'
];
const FALLBACK_PROGRAM_ICON = './assets/gui/start-menu/cmd.webp';

// Function to clear cache for development/testing
window.clearSystemAssetsCache = () => {
    SYSTEM_ASSETS = null;
    SOCIALS_CACHE = null;
    console.log('System assets cache cleared');
};

async function getSocials() {
    if (SOCIALS_CACHE) return SOCIALS_CACHE;
    try {
        const { PortfolioManager } = await import('../../libs/portfolio/portfolioManager.js');
        const portfolio = new PortfolioManager();
        await portfolio.initialize();

        const socialLinks = portfolio.getSocialLinks();
        SOCIALS_CACHE = Array.isArray(socialLinks)
            ? socialLinks.map(link => {
                const rawKey = (link.network || '').toLowerCase();
                const normalizedKey = rawKey === 'x' ? 'twitter' : rawKey;
                const icon = SOCIAL_ICON_MAP[normalizedKey] || SOCIAL_ICON_MAP.github;
                return {
                    key: normalizedKey,
                    // keep compatibility with legacy structure used by desktop icons
                    name: link.network,
                    icon,
                    url: link.url
                };
            })
            : [];
        return SOCIALS_CACHE;
    } catch (error) {
        console.error('Failed to load social links for desktop icons:', error);
        SOCIALS_CACHE = [];
        return SOCIALS_CACHE;
    }
}

async function getSystemAssets() {
    if (SYSTEM_ASSETS) return SYSTEM_ASSETS;
    try {
        const { PortfolioManager } = await import('../../libs/portfolio/portfolioManager.js');
        const portfolio = new PortfolioManager();
        await portfolio.initialize();

        let loadingImage = portfolio.getLoadingImageUrl();

        // Handle dynamic SVG generation
        if (loadingImage === 'dynamic:xp.svg') {
            loadingImage = await portfolio.getDynamicXPSvgContent();
        }

        SYSTEM_ASSETS = {
            loading: loadingImage,
            userIcon: portfolio.getUserIconUrl(),
            wallpaperDesktop: portfolio.getWallpaperDesktopUrl(),
            wallpaperMobile: portfolio.getWallpaperMobileUrl(),
            balloon: {
                title: portfolio.getBalloonTitle(),
                body: portfolio.getBalloonBody()
            }
        };
        return SYSTEM_ASSETS;
    } catch (error) {
        console.error('Failed to load system assets:', error);
        SYSTEM_ASSETS = {};
        return SYSTEM_ASSETS;
    }
}

function normalizeProgramId(programId = '') {
    return programId.trim();
}

function resolveCatalogEntry(programId) {
    const normalizedId = normalizeProgramId(programId);
    if (!normalizedId) return null;

    if (START_MENU_CATALOG[normalizedId]) {
        return START_MENU_CATALOG[normalizedId];
    }

    const entries = Object.values(START_MENU_CATALOG || {});
    return entries.find(entry => entry?.programName === normalizedId) || null;
}

function toIconConfig(programId) {
    const entry = resolveCatalogEntry(programId);
    if (!entry || entry.type === 'separator') return null;

    const label = entry.title || entry.programName || programId;
    const programName = entry.programName || programId;
    const icon = entry.icon || FALLBACK_PROGRAM_ICON;

    return {
        programName,
        label,
        icon,
        ariaLabel: `Open ${label}`
    };
}

export default class Desktop {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.desktop = document.querySelector('.desktop');
        this.desktopIconsContainer = this.desktop?.querySelector('#desktop-icons');
        this.desktopProgramIds = this.resolveDesktopPrograms();
        this.selectionBox = null;
        this.isDragging = false;
        this.hasDragged = false;
        this.startX = 0;
        this.startY = 0;
        this.lastClickTimes = {};
        this.selectedIcons = new Set();
        this.activeDragPointerId = null;
        this.cleanupArtifacts();
        this.createSelectionOverlay();
        this.renderDesktopIcons();
        getSocials().then(socials => {
            this.socials = socials;
            this.updateSocialDesktopIcons();
        });
        this.setupIconEvents();
        this.setupDesktopEvents();
        this.setupPointerSelectionEvents();
        this.setupKeyboardNavigation();
        this.desktop.classList.remove('wallpaper-default', 'wallpaper-mobile');
        if (document.documentElement.classList.contains('mobile-device')) {
            this.desktop.classList.add('wallpaper-mobile');
        } else {
            this.desktop.classList.add('wallpaper-default');
        }
        this.eventBus.subscribe(EVENTS.WINDOW_CREATED, () => this.clearSelection());
        this.eventBus.subscribe(EVENTS.WINDOW_FOCUSED, () => this.clearSelection());
        this.eventBus.subscribe(EVENTS.PROGRAM_OPEN, () => this.resetDragSelectionState());
        this.eventBus.subscribe(EVENTS.STARTMENU_OPENED, () => this.resetDragSelectionState());
        
        // Always use dynamic assets instead of hardcoded preload
        getSystemAssets().then(assets => {
            if (document.documentElement.classList.contains('mobile-device') && assets.wallpaperMobile) {
                this.desktop.style.backgroundImage = `url('${assets.wallpaperMobile}')`;
            } else if (assets.wallpaperDesktop) {
                this.desktop.style.backgroundImage = `url('${assets.wallpaperDesktop}')`;
            }
        });
    }

    resolveDesktopPrograms() {
        if (!this.desktop) return [...DEFAULT_DESKTOP_PROGRAMS];
        const datasetValue = this.desktop.dataset.desktopPrograms || '';
        const configured = datasetValue
            .split(',')
            .map(value => value.trim())
            .filter(Boolean);
        if (configured.length === 0) {
            return [...DEFAULT_DESKTOP_PROGRAMS];
        }
        return configured;
    }

    renderDesktopIcons() {
        if (!this.desktopIconsContainer) return;

        let iconConfigs = this.desktopProgramIds
            .map(programId => toIconConfig(programId))
            .filter(Boolean);

        if (iconConfigs.length === 0) {
            console.warn('No valid desktop programs found; falling back to defaults.');
            this.desktopProgramIds = [...DEFAULT_DESKTOP_PROGRAMS];
            iconConfigs = this.desktopProgramIds
                .map(programId => toIconConfig(programId))
                .filter(Boolean);
        }

        if (iconConfigs.length === 0) return;

        const fragment = document.createDocumentFragment();
        iconConfigs.forEach(config => {
            fragment.appendChild(this.createDesktopIcon(config));
        });
        this.desktopIconsContainer.innerHTML = '';
        this.desktopIconsContainer.appendChild(fragment);
    }

    createDesktopIcon(config) {
        const iconElement = document.createElement('div');
        iconElement.className = 'desktop-icon';
        iconElement.setAttribute('role', 'button');
        iconElement.setAttribute('tabindex', '0');
        iconElement.setAttribute('aria-label', config.ariaLabel);
        iconElement.dataset.programName = config.programName;

        const img = document.createElement('img');
        img.loading = 'eager';
        img.alt = config.label;
        img.src = config.icon;

        const label = document.createElement('span');
        label.textContent = config.label;

        iconElement.appendChild(img);
        iconElement.appendChild(label);
        return iconElement;
    }

    getIcons() {
        return this.desktop.querySelectorAll('.desktop-icon');
    }

    cleanupArtifacts() {
        document.querySelectorAll('#selection-box, .selection-box').forEach(box => box.remove());
    }

    createSelectionOverlay() {
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'selection-overlay';
            this.desktop.prepend(this.overlay);
        }
    }

    updateSocialDesktopIcons() {
        if (!this.socials) return;
        this.socials.forEach(social => {
            const iconImg = this.desktop.querySelector(`.desktop-icon[data-program-name="${social.key}"] img`);
            if (iconImg && social.icon) {
                const iconPath = `./${social.icon.replace(/^\.\//, '').replace(/^\//, '')}`;
                iconImg.src = iconPath;
                iconImg.alt = social.name;
            }
        });
    }

    setupIconEvents() {
        const hasTouch = 'ontouchstart' in window;
        const isMobile = document.documentElement.classList.contains('mobile-device');
        const useTouchClick = hasTouch && isMobile;
        const socialsMap = (this.socials || []).reduce((map, item) => {
            map[item.key] = item;
            return map;
        }, {});
        this.getIcons().forEach(icon => {
            if (icon.tagName === 'A') return;
            const labelSpan = icon.querySelector('span');
            const iconKey = labelSpan ? labelSpan.textContent.trim().toLowerCase().replace(/\s+/g, '-') : '';
            let touchTriggered = false;
            const handleEvent = evt => {
                evt.stopPropagation();
                if (evt.type === 'touchend') {
                    touchTriggered = true;
                    setTimeout(() => {
                        touchTriggered = false;
                    }, 100);
                } else if (evt.type === 'click' && touchTriggered) {
                    return;
                }
                const now = Date.now();
                const doubleClickThreshold = 400;
                const lastClick = this.lastClickTimes[iconKey] || 0;
                if (now - lastClick < doubleClickThreshold) {
                    if (!icon.classList.contains('selected')) this.selectIcon(icon, true);
                    const programName = icon.getAttribute('data-program-name');
                    if (socialsMap[programName]) {
                        window.open(socialsMap[programName].url, '_blank');
                    } else {
                        const payload = { programName };
                        this.eventBus.publish(EVENTS.PROGRAM_OPEN, payload);
                    }
                    this.pendingDrag = false;
                    this.lastClickTimes[iconKey] = 0;
                } else {
                    this.toggleIconSelection(icon, evt.ctrlKey);
                    this.lastClickTimes[iconKey] = now;
                }
            };
            if (useTouchClick) {
                icon.addEventListener('touchend', handleEvent);
                icon.addEventListener('click', handleEvent);
            } else {
                icon.addEventListener('click', handleEvent);
            }
        });
    }

    setupDesktopEvents() {
        this.desktop.addEventListener('click', evt => {
            if ((evt.target === this.desktop || evt.target === this.overlay) && !this.isDragging && !this.hasDragged) {
                this.clearSelection();
            }
        });
    }

    setupPointerSelectionEvents() {
        const desktopDragThreshold = 4;
        const mobileDragThreshold = 10;
        window.addEventListener('pointerdown', evt => {
            if (evt.target !== this.overlay && evt.target !== this.desktop) return;
            if (document.documentElement.classList.contains('mobile-device')) {
                if (this.activeDragPointerId !== null && this.activeDragPointerId !== evt.pointerId) {
                    this.resetDragSelectionState();
                } else if (this.isDragging && this.activeDragPointerId === evt.pointerId) {
                    this.resetDragSelectionState();
                }
            }
            if (this.isDragging) return;
            if (!evt.ctrlKey) this.clearSelection();
            const desktopRect = this.desktop.getBoundingClientRect();
            this.startX = evt.clientX - desktopRect.left;
            this.startY = evt.clientY - desktopRect.top;
            this.clearTemporaryHighlights();
            this.pendingDrag = true;
            this.isDragging = false;
            this.hasDragged = false;
            this.activeDragPointerId = evt.pointerId;
            try {
                (evt.target === this.overlay ? this.overlay : this.desktop).setPointerCapture(evt.pointerId);
            } catch (error) {
                void error;
            }
        });
        window.addEventListener('pointermove', evt => {
            const desktopRect = this.desktop.getBoundingClientRect();
            const currentX = evt.clientX - desktopRect.left;
            const currentY = evt.clientY - desktopRect.top;
            const deltaX = currentX - this.startX;
            const deltaY = currentY - this.startY;
            const distance = Math.hypot(deltaX, deltaY);
            const threshold = document.documentElement.classList.contains('mobile-device') ? mobileDragThreshold : desktopDragThreshold;
            if (this.pendingDrag && distance >= threshold) {
                this.pendingDrag = false;
                this.isDragging = true;
                this.selectionBox = document.createElement('div');
                this.selectionBox.className = 'selection-box';
                Object.assign(this.selectionBox.style, {
                    left: `${this.startX}px`,
                    top: `${this.startY}px`,
                    width: '0px',
                    height: '0px'
                });
                this.desktop.appendChild(this.selectionBox);
            }
            if (!this.isDragging || !this.selectionBox) return;
            this.hasDragged = true;
            const left = Math.min(currentX, this.startX);
            const top = Math.min(currentY, this.startY);
            const width = Math.abs(currentX - this.startX);
            const height = Math.abs(currentY - this.startY);
            const style = this.selectionBox.style;
            style.left = `${left}px`;
            style.top = `${top}px`;
            style.width = `${width}px`;
            style.height = `${height}px`;
            this.highlightIconsIntersecting(left, top, width, height);
        });
        window.addEventListener('pointerup', () => {
            if (this.pendingDrag) {
                this.pendingDrag = false;
                this.activeDragPointerId = null;
                return;
            }
            if (!this.isDragging) return;
            if (this.selectionBox) {
                this.getIcons().forEach(icon => {
                    if (icon.classList.contains('hover-by-selection')) {
                        icon.classList.remove('hover-by-selection');
                        icon.classList.add('selected');
                        this.selectedIcons.add(icon);
                    }
                });
            }
            const dragged = this.hasDragged;
            this.resetDragSelectionState();
            this.hasDragged = dragged;
            setTimeout(() => {
                this.hasDragged = false;
            }, 0);
        });
    }

    highlightIconsIntersecting(left, top, width, height) {
        const selectionBounds = { left, top, right: left + width, bottom: top + height };
        this.getIcons().forEach(icon => {
            const iconRect = icon.getBoundingClientRect();
            const desktopRect = this.desktop.getBoundingClientRect();
            const iconBounds = {
                left: iconRect.left - desktopRect.left,
                top: iconRect.top - desktopRect.top,
                right: iconRect.right - desktopRect.left,
                bottom: iconRect.bottom - desktopRect.top
            };
            const intersects = !(iconBounds.right < selectionBounds.left || iconBounds.left > selectionBounds.right || iconBounds.bottom < selectionBounds.top || iconBounds.top > selectionBounds.bottom);
            if (intersects) {
                icon.classList.add('hover-by-selection');
            } else {
                icon.classList.remove('hover-by-selection');
            }
        });
    }

    toggleIconSelection(icon, isCtrl) {
        if (isCtrl) {
            if (icon.classList.contains('selected')) {
                icon.classList.remove('selected');
                this.selectedIcons.delete(icon);
            } else {
                icon.classList.add('selected');
                this.selectedIcons.add(icon);
            }
        } else {
            this.clearSelection();
            icon.classList.add('selected');
            this.selectedIcons.add(icon);
        }
    }

    selectIcon(icon, clearOthers = true) {
        if (clearOthers) this.clearSelection();
        icon.classList.add('selected');
        this.selectedIcons.add(icon);
    }

    clearSelection() {
        this.getIcons().forEach(icon => {
            icon.classList.remove('selected', 'hover-by-selection');
        });
        this.selectedIcons.clear();
    }

    clearTemporaryHighlights() {
        this.getIcons().forEach(icon => icon.classList.remove('hover-by-selection'));
    }

    resetDragSelectionState() {
        this.isDragging = false;
        this.hasDragged = false;
        this.activeDragPointerId = null;
        if (this.selectionBox && this.selectionBox.parentNode) {
            this.selectionBox.parentNode.removeChild(this.selectionBox);
            this.selectionBox = null;
        }
        this.clearTemporaryHighlights();
    }

    setupKeyboardNavigation() {
        let currentIndex = -1;
        document.addEventListener('keydown', evt => {
            const openStartMenu = document.querySelector('.startmenu.active');
            if (openStartMenu) return;
            const icons = Array.from(this.getIcons());
            if (icons.length === 0) return;
            switch (evt.key) {
                case 'Tab':
                    evt.preventDefault();
                    if (evt.shiftKey) {
                        currentIndex = currentIndex <= 0 ? icons.length - 1 : currentIndex - 1;
                    } else {
                        currentIndex = currentIndex >= icons.length - 1 ? 0 : currentIndex + 1;
                    }
                    this.selectIcon(icons[currentIndex]);
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    evt.preventDefault();
                    currentIndex = currentIndex >= icons.length - 1 ? 0 : currentIndex + 1;
                    this.selectIcon(icons[currentIndex]);
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    evt.preventDefault();
                    currentIndex = currentIndex <= 0 ? icons.length - 1 : currentIndex - 1;
                    this.selectIcon(icons[currentIndex]);
                    break;
                case 'Enter':
                case ' ':
                    if (currentIndex >= 0 && currentIndex < icons.length) {
                        evt.preventDefault();
                        const icon = icons[currentIndex];
                        icon.click();
                        const dblClickEvent = new MouseEvent('dblclick', { bubbles: true, cancelable: true, view: window });
                        icon.dispatchEvent(dblClickEvent);
                    }
                    break;
                case 'Escape':
                    this.clearSelection();
                    currentIndex = -1;
                    break;
            }
        });
        this.eventBus.subscribe(EVENTS.PROGRAM_OPEN, () => {
            currentIndex = -1;
        });
    }
}
