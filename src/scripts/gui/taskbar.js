import StartMenu from './startMenu.js';
import {
    EVENTS
} from '../utils/eventBus.js';
import {
    setupTooltips
} from './tooltip.js';
import {
    playBalloonSound
} from '../utils/audioManager.js';
import {
    updateTaskbarPlayingIndicator
} from '../utils/domUtils.js';
let taskbarSharedEventBus = null;
class Clock {
    constructor(selector) {
        this['clockElement'] = document['querySelector'](selector), this['intervalId'] = null, this['initialTimeoutId'] = null;
        const formatterOptions = {};
        formatterOptions['hour'] = 'numeric', formatterOptions['minute'] = '2-digit', formatterOptions['hour12'] = !![], this['timeFormatter'] = new Intl['DateTimeFormat']('en-US', formatterOptions);
        if (!this['clockElement']) return;
        this['setupClockUpdates']();
    } ['setupClockUpdates']() {
        clearTimeout(this['initialTimeoutId']), clearInterval(this['intervalId']);
        const now = new Date(),
            initialDelay = (0x3c - now['getSeconds']()) * 0x3e8 - now['getMilliseconds']();
        this['updateClock'](), this['initialTimeoutId'] = setTimeout(() => {
            this['updateClock'](), this['intervalId'] = setInterval(() => this['updateClock'](), 0xea60);
        }, initialDelay);
    } ['updateClock']() {
        if (!this['clockElement']) return;
        this['clockElement']['textContent'] = this['timeFormatter']['format'](new Date());
    } ['destroy']() {
        clearTimeout(this['initialTimeoutId']), clearInterval(this['intervalId']);
    }
}
export default class Taskbar {
    constructor(eventBus) {
        this['eventBus'] = eventBus, taskbarSharedEventBus = eventBus, this['startButton'] = document['getElementById']('start-button'), this['startMenuComponent'] = new StartMenu(this['eventBus']), this['programsContainer'] = document['querySelector']('.taskbar-programs'), this['systemTray'] = document['querySelector']('.system-tray'), this['taskbar'] = document['querySelector']('.taskbar'), this['_lastStartToggleTs'] = 0x0, this['_setStartButtonImage'](), this['_setTaskbarBackground'](), window['addEventListener']('resize', () => {
            this['_setStartButtonImage']();
        }), this['setupStartButtonEffects'](), this['setupResponsiveTaskbar'](), setupTooltips('.tray-status-icon,\x20.tray-network-icon,\x20.tray-volume-icon,\x20.tray-crt-toggle,\x20.tray-fullscreen-icon', undefined, 0x64, () => !document['getElementById']('balloon-root')), new Clock('.time'), this['subscribeToEvents'](), document['addEventListener']('fullscreenchange', () => {});
    } ['subscribeToEvents']() {
        this['eventBus']['subscribe'](EVENTS['STARTMENU_OPENED'], () => {
            this['startButton']['classList']['add']('active');
        }), this['eventBus']['subscribe'](EVENTS['STARTMENU_CLOSED'], () => {
            this['startButton']['classList']['remove']('active');
        }), this['eventBus']['subscribe'](EVENTS['WINDOW_CREATED'], () => {
            this['updateTaskbarLayout']();
        }), this['eventBus']['subscribe'](EVENTS['WINDOW_CLOSED'], () => {
            this['updateTaskbarLayout']();
        }), this['eventBus']['subscribe'](EVENTS['MUSIC_PLAYER_PLAYING'], payloadPlaying => {
            if (payloadPlaying && payloadPlaying['programId'] === 'musicPlayer') {
                const indicatorOpts = {};
                indicatorOpts['programId'] = 'musicPlayer', indicatorOpts['windowId'] = 'musicPlayer-window', indicatorOpts['indicatorClass'] = 'music-playing-indicator', indicatorOpts['isPlaying'] = !![], updateTaskbarPlayingIndicator(indicatorOpts);
            }
        }), this['eventBus']['subscribe'](EVENTS['MUSIC_PLAYER_STOPPED'], payloadStopped => {
            if (payloadStopped && payloadStopped['programId'] === 'musicPlayer') {
                const indicatorOpts = {};
                indicatorOpts['programId'] = 'musicPlayer', indicatorOpts['windowId'] = 'musicPlayer-window', indicatorOpts['indicatorClass'] = 'music-playing-indicator', indicatorOpts['isPlaying'] = ![], updateTaskbarPlayingIndicator(indicatorOpts);
            }
        }), this['eventBus']['subscribe'](EVENTS['MEDIA_PLAYER_PLAYING'], mediaPlaying => {
            if (mediaPlaying && mediaPlaying['programId'] === 'mediaPlayer') {
                const indicatorOpts = {};
                indicatorOpts['programId'] = 'mediaPlayer', indicatorOpts['windowId'] = 'mediaPlayer-window', indicatorOpts['indicatorClass'] = 'media-playing-indicator', indicatorOpts['isPlaying'] = !![], updateTaskbarPlayingIndicator(indicatorOpts);
            }
        }), this['eventBus']['subscribe'](EVENTS['MEDIA_PLAYER_STOPPED'], mediaStopped => {
            if (mediaStopped && mediaStopped['programId'] === 'mediaPlayer') {
                const indicatorOpts = {};
                indicatorOpts['programId'] = 'mediaPlayer', indicatorOpts['windowId'] = 'mediaPlayer-window', indicatorOpts['indicatorClass'] = 'media-playing-indicator', indicatorOpts['isPlaying'] = ![], updateTaskbarPlayingIndicator(indicatorOpts);
            }
        });
    } ['setupStartButtonEffects']() {
        const publishToggleDedupe = event => {
            if (event) event['stopPropagation']();
            const nowTs = Date['now']();
            if (nowTs - this['_lastStartToggleTs'] < 0xc8) return;
            this['_lastStartToggleTs'] = nowTs;
            !this['startMenuComponent'] && (this['startMenuComponent'] = new StartMenu(this['eventBus']));
            !this['startButton'] && (this['startButton'] = document['getElementById']('start-button'));
            let shouldOpen = !![];
            try {
                const menuEl = this['startMenuComponent'] && this['startMenuComponent']['startMenu'],
                    isActive = !!(menuEl && menuEl['classList'] && menuEl['classList']['contains']('active'));
                shouldOpen = !isActive;
            } catch (err) {}
            const togglePayload = {};
            togglePayload['__coalesce'] = !![], (window['batchedPublish'] || this['eventBus']['publish'])['call'](window['batchedPublish'] ? undefined : this['eventBus'], EVENTS['STARTMENU_TOGGLE'], togglePayload);
            const checkToggle = delay => {
                setTimeout(() => {
                    try {
                        const menuElement = this['startMenuComponent'] && this['startMenuComponent']['startMenu'],
                            active = !!(menuElement && menuElement['classList'] && menuElement['classList']['contains']('active'));
                        shouldOpen && !active && this['startMenuComponent'] && typeof this['startMenuComponent']['toggleStartMenu'] === 'function' && this['startMenuComponent']['toggleStartMenu']();
                    } catch (err2) {}
                }, delay);
            };
            checkToggle(0x40), checkToggle(0xa0);
        };
        this['startButton']['addEventListener']('click', publishToggleDedupe);
    } ['setupResponsiveTaskbar']() {
        this['updateTaskbarLayout'](), window['addEventListener']('resize', () => {
            this['updateTaskbarLayout']();
        });
        const observer = new MutationObserver(() => {
                this['updateTaskbarLayout']();
            }),
            observerConfig = {};
        observerConfig['childList'] = !![], observerConfig['subtree'] = ![], observer['observe'](this['programsContainer'], observerConfig);
    } ['updateTaskbarLayout']() {
        const taskbarItems = document['querySelectorAll']('.taskbar-item');
        if (taskbarItems['length'] === 0x0) return;
        const availableWidth = this['_calculateAvailableWidth'](),
            layoutMode = this['_determineLayoutMode'](taskbarItems['length'], availableWidth);
        this['_applyTaskbarLayout'](taskbarItems, layoutMode, availableWidth);
    } ['_calculateAvailableWidth']() {
        const taskbarWidth = this['taskbar']['offsetWidth'],
            startButtonWidth = this['startButton']['offsetWidth'],
            trayWidth = this['systemTray']['offsetWidth'];
        return taskbarWidth - startButtonWidth - trayWidth;
    } ['_determineLayoutMode'](itemCount, availableWidthParam) {
        const defaultWidth = 0xa8,
            reducedWidth = 0x50,
            iconOnlyWidth = 0x24;
        if (itemCount * defaultWidth <= availableWidthParam) return 'default';
        if (itemCount * reducedWidth <= availableWidthParam) return 'reduced';
        if (itemCount * iconOnlyWidth <= availableWidthParam) return 'icon-only';
        return 'overflow';
    } ['_applyTaskbarLayout'](items, layout, available) {
        const minWidth = 0x24,
            maxWidth = 0xa8,
            itemCount2 = items['length'];
        let itemWidth = Math['floor'](available / itemCount2);
        if (itemWidth > maxWidth) itemWidth = maxWidth;
        if (itemWidth < minWidth) itemWidth = minWidth;
        const iconOnly = itemWidth === minWidth;
        items['forEach'](item => {
            item['style']['display'] = 'flex', item['style']['width'] = itemWidth + 'px', item['classList']['toggle']('icon-only', iconOnly);
        });
    } ['_setStartButtonImage']() {
        const imgEl = this['startButton']['querySelector']('img');
        if (!imgEl) return;
        imgEl['src'] = 'assets/gui/taskbar/start-button.webp';
    } ['_setTaskbarBackground']() {
        try {
            if (!this['taskbar']) return;
            const preload = document['querySelector']('link[rel=\x22preload\x22][href$=\x22assets/gui/taskbar/taskbar-bg.webp\x22]'),
                fallbackBg = 'assets/gui/taskbar/taskbar-bg.webp',
                bgUrl = preload?.['href'] || fallbackBg;
            this['taskbar']['style']['backgroundImage'] = 'url(\x27' + bgUrl + '\x27)', this['taskbar']['style']['backgroundRepeat'] = 'repeat-x', this['taskbar']['style']['backgroundSize'] = 'auto\x20100%';
        } catch (error) {}
    }
}
let balloonTimeouts = [];
export function hideBalloon(removeInstant = ![]) {
    const balloonRoot = document['getElementById']('balloon-root');
    if (!balloonRoot) return;
    const balloon = balloonRoot['querySelector']('.balloon');
    balloonTimeouts['forEach'](t => clearTimeout(t)), balloonTimeouts = [];
    if (removeInstant) {
        if (balloonRoot['parentNode']) balloonRoot['parentNode']['removeChild'](balloonRoot);
        return;
    }
    if (balloon) balloon['classList']['add']('hide');
    setTimeout(() => {
        if (balloonRoot['parentNode']) balloonRoot['parentNode']['removeChild'](balloonRoot);
    }, 0x3e8);
}
export async function showWelcomeBalloon() {
    const loginScreen = document['getElementById']('login-screen');
    if (loginScreen && loginScreen['style']['display'] !== 'none' && loginScreen['style']['opacity'] !== '0') return;
    if (document['getElementById']('balloon-root')) return;
    balloonTimeouts['forEach'](timeoutId => clearTimeout(timeoutId)), balloonTimeouts = [];
    const networkIcon = document['querySelector']('.tray-network-icon');
    if (!networkIcon) return;
    const balloonContainer = document['createElement']('div');
    balloonContainer['id'] = 'balloon-root', balloonContainer['style']['position'] = 'absolute', balloonContainer['style']['zIndex'] = '1400', document['body']['appendChild'](balloonContainer);
    let title = '',
        body = '';
    try {
        const resp = await fetch('./ui.json'),
            data = await resp['json']();
        if (data['balloon']) {
            if (data['balloon']['title']) title = data['balloon']['title'];
            if (data['balloon']['body']) body = data['balloon']['body'];
        }
    } catch (fetchError) {}
    balloonContainer['innerHTML'] = '\x0a\x20\x20\x20\x20<div\x20class=\x22balloon\x22>\x0a\x20\x20\x20\x20\x20\x20<button\x20class=\x22balloon__close\x22\x20aria-label=\x22Close\x22></button>\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22balloon__header\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20class=\x22balloon__header__img\x22\x20src=\x22assets/gui/taskbar/welcome.webp\x22\x20alt=\x22welcome\x22\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<span\x20class=\x22balloon__header__text\x22\x20style=\x22font-weight:\x20bold;\x22>' + title + '</span>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20<p\x20class=\x22balloon__text__first\x22\x20style=\x22padding:\x200\x208px\x200\x202px;\x22>' + body + '</p>\x0a\x20\x20\x20\x20\x20\x20<p\x20class=\x22balloon__text__second\x22\x20style=\x22padding:\x200\x208px\x200\x202px;\x20margin-top:\x208px;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20Get\x20Started:\x20<a\x20href=\x22#\x22\x20id=\x22balloon-about-link\x22\x20style=\x22color:\x20blue;\x20text-decoration:\x20underline;\x22>About\x20Me</a>\x20|\x20<a\x20href=\x22#\x22\x20id=\x22balloon-projects-link\x22\x20style=\x22color:\x20blue;\x20text-decoration:\x20underline;\x22>My\x20Projects</a>\x0a\x20\x20\x20\x20\x20\x20</p>\x0a\x20\x20\x20\x20\x20\x20<div\x20class=\x22balloon-pointer-anchor\x22\x20style=\x22position:absolute;bottom:-19px;right:24px;width:0;height:0;\x22></div>\x0a\x20\x20\x20\x20</div>\x0a\x20\x20';
    const projectsLink = balloonContainer['querySelector']('#balloon-projects-link');
    projectsLink && projectsLink['addEventListener']('click', e => {
        e['preventDefault']();
        if (taskbarSharedEventBus && EVENTS) {
            const payload = {};
            payload['programName'] = 'projects', taskbarSharedEventBus['publish'](EVENTS['PROGRAM_OPEN'], payload);
        }
    });
    const aboutLink = balloonContainer['querySelector']('#balloon-about-link');
    aboutLink && aboutLink['addEventListener']('click', e2 => {
        e2['preventDefault']();
        if (taskbarSharedEventBus && EVENTS) {
            const payload2 = {};
            payload2['programName'] = 'about', taskbarSharedEventBus['publish'](EVENTS['PROGRAM_OPEN'], payload2);
        }
    });
    const positionBalloon = () => {
        return new Promise(resolve => {
            setTimeout(() => {
                const iconRect = networkIcon['getBoundingClientRect'](),
                    balloonEl = balloonContainer['querySelector']('.balloon'),
                    anchorEl = balloonEl['querySelector']('.balloon-pointer-anchor');
                import('../utils/frameScheduler.js')['then'](({
                    scheduleWrite: scheduleWrite
                }) => {
                    scheduleWrite(() => {
                        const anchorRect = anchorEl['getBoundingClientRect'](),
                            iconCenterX = iconRect['left'] + iconRect['width'] / 0x2 + window['scrollX'],
                            anchorCenterX = anchorRect['left'] + anchorRect['width'] / 0x2 + window['scrollX'],
                            offsetX = iconCenterX - anchorCenterX - 0x8;
                        balloonContainer['style']['left'] = balloonContainer['offsetLeft'] + offsetX + 'px', balloonContainer['style']['top'] = iconRect['top'] - balloonEl['offsetHeight'] - 0x8 - 0xc + window['scrollY'] + 'px';
                        const isMobile = document['documentElement']['classList']['contains']('mobile-device'),
                            resolveDelay = isMobile ? 0x96 : 0x32;
                        setTimeout(resolve, resolveDelay);
                    });
                });
            }, 0x0);
        });
    };
    playBalloonSound(), await positionBalloon();
    const balloonEl2 = balloonContainer['querySelector']('.balloon'),
        closeBtn = balloonContainer['querySelector']('.balloon__close');
    closeBtn['onclick'] = () => hideBalloon(), balloonEl2['classList']['remove']('hide');
    const isMobileFlag = document['documentElement']['classList']['contains']('mobile-device'),
        hideDelay = isMobileFlag ? 0x1b58 : 0x2710,
        removeDelay = isMobileFlag ? 0x1f40 : 0x2af8;
    balloonTimeouts['push'](setTimeout(() => balloonEl2['classList']['add']('hide'), hideDelay)), balloonTimeouts['push'](setTimeout(() => hideBalloon(), removeDelay));
}
const setupBalloonClick = () => {
    const networkIcon2 = document['querySelector']('.tray-network-icon');
    if (!networkIcon2) return;
    networkIcon2['addEventListener']('click', showWelcomeBalloon), networkIcon2['addEventListener']('keydown', keyEvent => {
        (keyEvent['key'] === 'Enter' || keyEvent['key'] === '\x20') && (keyEvent['preventDefault'](), showWelcomeBalloon());
    });
};
window['addEventListener']('DOMContentLoaded', () => {
    setupBalloonClick();
    const crtToggle = document['querySelector']('.tray-crt-toggle');
    if (crtToggle) {
        let crtEnabled = !![];
        const toggleCRT = () => {
            crtEnabled = !crtEnabled, document['body']['classList']['remove']('crt-turning-on', 'crt-turning-off');
            crtEnabled ? (document['body']['classList']['add']('crt-turning-on'), setTimeout(() => {
                document['body']['classList']['remove']('crt-turning-on');
            }, 0x12c)) : (document['body']['classList']['add']('crt-turning-off'), setTimeout(() => {
                document['body']['classList']['remove']('crt-turning-off');
            }, 0xfa));
            const crtSelectors = ['.crt-effect', '.crt-scanline', '.crt-vignette', '.crt-noise', '.crt-flicker', '.crt-aberration', '.crt-persistence'];
            crtSelectors['forEach'](selector => {
                const crtElement = document['querySelector'](selector);
                crtElement && (crtElement['style']['display'] = crtEnabled ? 'block' : 'none', selector === '.crt-scanline' && crtEnabled && (crtElement['style']['transition'] = 'none', crtElement['style']['transform'] = 'translateY(-20px)', void crtElement['offsetHeight'], setTimeout(() => {
                    document['dispatchEvent'](new CustomEvent('reinitScanline'));
                }, 0x64)));
            }), crtEnabled ? document['body']['classList']['add']('crt-brightness') : document['body']['classList']['remove']('crt-brightness'), crtToggle['src'] = crtEnabled ? './assets/gui/taskbar/crt.webp' : './assets/gui/taskbar/crt-off.webp', crtToggle['setAttribute']('data-tooltip', crtEnabled ? 'CRT\x20Effects:\x20ON' : 'CRT\x20Effects:\x20OFF');
        };
        document['body']['classList']['add']('crt-brightness'), crtToggle['setAttribute']('data-tooltip', 'CRT\x20Effects:\x20ON'), crtToggle['addEventListener']('click', toggleCRT);
    }
    const fullscreenIcon = document['querySelector']('.tray-fullscreen-icon');
    if (fullscreenIcon) {
        const toggleFullscreen = () => {
            hideBalloon(!![]);
            const docEl = document['documentElement'];
            if (document['fullscreenElement']) document['exitFullscreen']();
            else {
                if (docEl['requestFullscreen']) docEl['requestFullscreen']();
                else {
                    if (docEl['mozRequestFullScreen']) docEl['mozRequestFullScreen']();
                    else {
                        if (docEl['webkitRequestFullscreen']) docEl['webkitRequestFullscreen']();
                        else {
                            if (docEl['msRequestFullscreen']) docEl['msRequestFullscreen']();
                            else {}
                        }
                    }
                }
            }
        };
        fullscreenIcon['addEventListener']('click', toggleFullscreen);
    }
});