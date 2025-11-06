import Desktop from './gui/desktop.js';
import Taskbar from './gui/taskbar.js';
import WindowManager from './gui/window.js';
import { PortfolioManager } from '../libs/portfolio/portfolioManager.js';
import {
    eventBus,
    EVENTS
} from './utils/eventBus.js';
import clippy from '../libs/clippy/clippy.js';

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        eventBus.publish(EVENTS.MEDIA_GLOBAL_PAUSE, { reason: 'page-hidden' });
    } else {
        eventBus.publish(EVENTS.MEDIA_GLOBAL_VISIBLE, { reason: 'page-visible' });
    }
});

import {
    batchedPublish as publishBatched,
    flushEventBusQueue
} from './utils/eventBusBatching.js';
import {
    initBootSequence
} from './gui/boot.js';
import {
    setupTooltips
} from './gui/tooltip.js';
import {
    initRandomScanline
} from './utils/crtEffect.js';
import {
    initializeDeviceDetection
} from './utils/device.js';

let IS_MOBILE_DEVICE = false;

import {
    initMessageRouter,
    registerMessageHandler,
    handleProgramOpenRequest
} from './utils/messageRouter.js';
import {
    scheduleAfter
} from './utils/frameScheduler.js';
import {
    createHiddenContainer,
    applyHiddenContainerStyles,
    createPreloadIframe,
    applyHiddenIframeStyles
} from './utils/domUtils.js';

let globalTaskbarInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    try {
        const wasMobile = IS_MOBILE_DEVICE;
        const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const isMobileOrIos = wasMobile || isIos;

        document.documentElement.classList.toggle('mobile-device', isMobileOrIos);
        document.body.classList.toggle('mobile-device', isMobileOrIos);
    } catch {}

    window.eventBus = eventBus;
    window.EVENTS = EVENTS;
    window.batchedPublish = publishBatched;
    window.flushEventBusQueue = flushEventBusQueue;

    initBootSequence(eventBus, EVENTS, []);

    const iframeCacheExclusions = new Set(['paint-window', 'mediaPlayer-window', 'musicPlayer-window', 'projects-window', 'about-window', 'image-viewer-window']);
    window.__IFRAME_CACHE_EXCLUDE = iframeCacheExclusions;

    const preloadApps = [
        {
            id: 'resume-window',
            src: 'src/apps/resume/resume.html',
            priority: 'high'
        },
        {
            id: 'contact-window',
            src: 'src/apps/contact/contact.html',
            priority: 'high'
        }
    ];

    let loadedCount = 0;

    fetch('projects.json')
        .then(response => response.json())
        .then(projectsData => {
            if (window.updateBootProjectsData) {
                window.updateBootProjectsData(projectsData);
            }
        });

    const preloadContainer = createHiddenContainer('preload-apps-container', {
        attributes: { 'aria-hidden': 'true' }
    });
    preloadContainer.className = 'hidden-container';
    document.body.appendChild(preloadContainer);

    window.__IFRAME_CACHE = new Map();
    window.__BOOT_COMPLETE = false;

    window.__IS_IFRAME_CACHED = iframeId => {
        try {
            if (window.__IFRAME_CACHE_EXCLUDE && window.__IFRAME_CACHE_EXCLUDE.has(iframeId)) {
                return false;
            }
            return window.__IFRAME_CACHE &&
                   window.__IFRAME_CACHE.has(iframeId) &&
                   window.__IFRAME_CACHE.get(iframeId).fullyLoaded;
        } catch (err) {
            return false;
        }
    };

    window.__MARK_BOOT_COMPLETE = () => {
        window.__BOOT_COMPLETE = true;
    };

    window.addEventListener('message', eventMessage => {
        try {
            if (eventMessage && eventMessage.data && eventMessage.data.type === 'app-preload-ready') {
                const messageAppId = eventMessage.data.appId;
                if (!messageAppId) return;

                const cacheEntry = window.__IFRAME_CACHE && window.__IFRAME_CACHE.get(messageAppId);
                if (cacheEntry && !cacheEntry.fullyLoaded) {
                    cacheEntry.fullyLoaded = true;
                    cacheEntry.handshake = true;
                    window.__IFRAME_CACHE.set(messageAppId, cacheEntry);
                }
            }
        } catch (e) {}
    });

    function initializeUIComponents() {
        if (window.__UI_INITIALIZED) return;

        window.__UI_INITIALIZED = true;
        globalTaskbarInstance = new Taskbar(eventBus);
        new Desktop(eventBus);
        window.windowManager = new WindowManager(eventBus);

        initializeDeviceDetection();
        IS_MOBILE_DEVICE = document.documentElement.classList.contains('mobile-device');

        eventBus.subscribe(EVENTS.SHUTDOWN_REQUESTED, () => {
            sessionStorage.removeItem('logged_in');
            window.location.assign(window.location.pathname + '?forceBoot=true');
        });

        initRandomScanline();
        setupTooltips('[data-tooltip]');

        ensureLandscapeBlock().then(() => handleOrientationBlock());
        setRealVh();
    }

    window.initializeUIComponents = initializeUIComponents;

    function onAllPreloaded() {
        applyHiddenContainerStyles(preloadContainer);
        const preloadedIframes = preloadContainer.querySelectorAll('iframe');
        applyHiddenIframeStyles(preloadedIframes);

        if (window.__MARK_BOOT_COMPLETE) {
            window.__MARK_BOOT_COMPLETE();
        }

        if (!window.__UI_INITIALIZED) {
            initializeUIComponents();
        }

        initMessageRouter();

        registerMessageHandler('resume-interaction', () => {
            if (!globalTaskbarInstance) return;
            const startMenuComponent = globalTaskbarInstance.startMenuComponent;
            if (startMenuComponent && startMenuComponent.startMenu?.classList.contains('active')) {
                startMenuComponent.closeStartMenu();
            }
        });

        registerMessageHandler('open-social-from-about', eventData => {
            const socialKey = eventData?.data?.key;
            const socialUrl = eventData?.data?.url;
            const socialLabel = eventData?.data?.label || socialKey;

            if (!socialKey || !socialUrl) return;

            window.postMessage({
                type: 'confirm-open-link',
                label: socialLabel,
                url: socialUrl
            }, '*');
        });

        registerMessageHandler('open-projects-from-overlay-studio', () => {
            eventBus.publish(EVENTS.PROGRAM_OPEN, { programName: 'projects' });
        });

        registerMessageHandler('open-program', eventData => {
            const programName = eventData?.data?.programName;
            if (!programName) return;

            handleProgramOpenRequest({
                programName: programName,
                eventData: eventData.data,
                publish: eventBus.publish.bind(eventBus),
                EVENTS: EVENTS
            });
        });

        registerMessageHandler('show-youtube-error', eventData => {
            import('./utils/popupManager.js').then(({ default: popupManager }) => {
                if (!popupManager.isInitialized) {
                    popupManager.init();
                }

                const errorMessage = eventData.data.message || 'YouTube playlist error occurred.';

                popupManager.showPopup({
                    type: 'error',
                    title: 'Media Player Error',
                    message: errorMessage,
                    icon: '/assets/gui/start-menu/mediaPlayer.webp',
                    buttons: [
                        {
                            text: 'Open YouTube',
                            action: 'view-playlists',
                            primary: true,
                            onClick: () => {
                                window.open('https://www.youtube.com/@mitchivin/playlists', '_blank');
                            }
                        },
                        {
                            text: 'Close Player',
                            action: 'close-player',
                            onClick: () => {
                                const playerIframe = document.querySelector('iframe[src*="mediaPlayer"]');
                                if (playerIframe) {
                                    const windowElement = playerIframe.closest('.window, .app-window');
                                    if (windowElement && window.windowManager) {
                                        window.windowManager.closeWindow(windowElement);
                                    } else {
                                        console.warn('Could not find windowManager or windowElement for media player');
                                    }
                                } else {
                                    console.warn('Could not find media player iframe');
                                }
                            }
                        }
                    ]
                });
            });
        });

        registerMessageHandler('confirm-open-program', eventData => {
            if (!IS_MOBILE_DEVICE) return;

            import('./utils/popupManager.js').then(({ default: popupManager }) => {
                if (!popupManager.isInitialized) {
                    popupManager.init();
                }

                const programName = eventData.data.programName;
                const title = eventData.data.title || 'Open Program';
                const icon = eventData.data.icon || null;

                popupManager.showPopup({
                    type: 'mobile-restriction',
                    title: title,
                    message: 'Are you sure you want to open "' + title + '"?',
                    icon: icon,
                    buttons: [
                        {
                            text: 'Cancel',
                            action: 'cancel'
                        },
                        {
                            text: 'Open ' + title,
                            action: 'confirm',
                            primary: true,
                            onClick: () => {
                                const {
                                    programName: programNameInner,
                                    title: titleInner,
                                    icon: iconInner,
                                    ...additionalData
                                } = eventData.data;

                                const openEvent = {
                                    programName: programNameInner,
                                    ...additionalData
                                };

                                eventBus.publish(EVENTS.PROGRAM_OPEN, openEvent);
                            }
                        }
                    ]
                });
            });
        });

        registerMessageHandler('confirm-open-link', eventData => {
            const url = eventData.data.url || '';
            const allowedOnDesktop = ['keepthescore.com', 'github.com', 'instagram.com', 'linkedin.com', 'facebook.com']
                .some(domain => url.includes(domain));

            if (!IS_MOBILE_DEVICE && !allowedOnDesktop) return;

            import('./utils/popupManager.js').then(({ default: popupManager }) => {
                if (!popupManager.isInitialized) {
                    popupManager.init();
                }

                const linkUrl = eventData.data.url || '';
                let label = eventData.data.label || '';
                let confirmText = 'Yes, open link';
                let icon = null;

                if (linkUrl.includes('keepthescore.com')) {
                    label = 'Keep The Score';
                    confirmText = 'Visit Keep The Score';
                    icon = './assets/gui/start-menu/keepthescore.webp';
                } else if (linkUrl.includes('github.com')) {
                    label = 'GitHub';
                    confirmText = 'Visit GitHub';
                    icon = './assets/gui/start-menu/github.webp';
                } else if (linkUrl.includes('instagram.com')) {
                    label = 'Instagram';
                    confirmText = 'Visit Instagram';
                    icon = './assets/gui/start-menu/instagram.webp';
                } else if (linkUrl.includes('linkedin.com')) {
                    label = 'LinkedIn';
                    confirmText = 'Visit LinkedIn';
                    icon = './assets/gui/start-menu/linkedin.webp';
                } else if (linkUrl.includes('facebook.com')) {
                    label = 'Facebook';
                    confirmText = 'Visit Facebook';
                    icon = './assets/gui/start-menu/facebook.webp';
                } else if (!label) {
                    try {
                        label = new URL(linkUrl).hostname;
                    } catch {
                        label = 'this link';
                    }
                }

                popupManager.showPopup({
                    type: 'confirm',
                    title: 'Open Link',
                    message: 'Are you sure you want to open "' + label + '"?',
                    icon: icon,
                    buttons: [
                        {
                            text: 'Cancel',
                            action: 'cancel'
                        },
                        {
                            text: confirmText,
                            action: 'confirm',
                            primary: true,
                            onClick: () => window.open(linkUrl, '_blank')
                        }
                    ]
                });
            });
        });

        // Suppress gestures
        (function suppressGestures() {
            if (window.__GESTURE_SUPPRESSION_V2) return;
            window.__GESTURE_SUPPRESSION_V2 = true;

            const touchData = { lastTouchEnd: 0 };

            const handler = event => {
                switch (event.type) {
                    case 'gesturestart':
                    case 'gesturechange':
                    case 'gestureend':
                        event.preventDefault();
                        break;

                    case 'touchstart':
                    case 'touchmove':
                        if (event.touches && event.touches.length > 1) {
                            event.preventDefault();
                        }
                        break;

                    case 'touchend': {
                        const now = Date.now();
                        if (now - touchData.lastTouchEnd <= 300) { // 0x12c
                            event.preventDefault();
                        }
                        touchData.lastTouchEnd = now;
                        break;
                    }

                    case 'wheel':
                        if (event.ctrlKey) {
                            event.preventDefault();
                        }
                        break;
                }
            };

            const events = ['gesturestart', 'gesturechange', 'gestureend', 'touchstart', 'touchmove', 'touchend', 'wheel'];
            const options = { passive: false, capture: true };

            events.forEach(eventType => document.addEventListener(eventType, handler, options));

            try {
                const style = document.createElement('style');
                style.id = 'gesture-suppression-style';
                style.textContent = 'html,body{touch-action:none;overscroll-behavior:none;-webkit-user-select:none;user-select:none;-ms-touch-action:none;}';
                document.head.appendChild(style);
            } catch (error) {}
        })();

        import('./utils/eventListenerManager.js').then(({
            addManagedResizeListener,
            addManagedOrientationListener
        }) => {
            const onResize = () => {
                handleOrientationBlock();
                setRealVh();

                const isLandscape = window.matchMedia('(orientation: landscape)').matches;
                const isMobile = IS_MOBILE_DEVICE;

                if (!(isMobile && isLandscape)) {
                    scaleDesktopIconsToFitMobile();
                }
            };

            const onOrientation = () => {
                handleOrientationBlock();
                setRealVh();
            };

            addManagedResizeListener(onResize);
            addManagedOrientationListener(onOrientation);
        }).catch(() => {
            let timeoutId;

            const debouncedResize = () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    handleOrientationBlock();
                    setRealVh();

                    const isLandscape = window.matchMedia('(orientation: landscape)').matches;
                    const isMobile = IS_MOBILE_DEVICE;

                    if (!(isMobile && isLandscape)) {
                        scaleDesktopIconsToFitMobile();
                    }
                }, 16); // 0x10
            };

            window.addEventListener('orientationchange', () => {
                handleOrientationBlock();
                setRealVh();
            });

            window.addEventListener('resize', debouncedResize);
        });

        // Initialize Clippy after UI is ready
        setTimeout(async () => {
            await clippy.init();
            window.clippy = clippy; // Expose globally for debugging
            setTimeout(() => {
                clippy.show();
            }, 1000); // Show Clippy 1 second after desktop appears
        }, 500);
    }

    if (!IS_MOBILE_DEVICE) {
        const highPriorityApps = preloadApps.filter(app => app.priority === 'high');
        const mediumPriorityApps = preloadApps.filter(app => app.priority === 'medium');
        const lowPriorityApps = preloadApps.filter(app => app.priority === 'low');

        highPriorityApps.forEach((app, index) => {
            const delay = index * 18; // 0x12
            setTimeout(() => preloadIframe(app), delay);
        });

        const loadAppsWithDelay = (apps, initialDelay = 80, stepDelay = 140) => { // 0x50, 0x8c
            if (!apps.length) return;

            apps.forEach((app, idx) => {
                const delay = initialDelay + idx * stepDelay;
                const loader = () => preloadIframe(app);

                if ('requestIdleCallback' in window) {
                    setTimeout(() => {
                        try {
                            window.requestIdleCallback(loader, { timeout: 250 }); // 0xfa
                        } catch {
                            loader();
                        }
                    }, delay);
                } else {
                    setTimeout(loader, delay);
                }
            });
        };

        loadAppsWithDelay(mediumPriorityApps, 90, 120); // 0x5a, 0x78
        loadAppsWithDelay(lowPriorityApps, 400, 160); // 0x190, 0xa0

        setTimeout(() => {
            if (!globalTaskbarInstance) {
                onAllPreloaded();
            }
        }, 2200); // 0x898
    } else {
        onAllPreloaded();
    }

    function preloadIframe(appConfig) {
        const iframe = createPreloadIframe({
            src: appConfig.src,
            id: appConfig.id,
            withTransform: true
        });

        iframe.onload = () => {
            const checkReadyState = () => {
                try {
                    const doc = iframe.contentDocument || iframe.contentWindow.document;

                    if (doc && doc.readyState === 'complete') {
                        let retries = 0;

                        const markLoaded = () => {
                            if (!(iframeCacheExclusions && iframeCacheExclusions.has(appConfig.id))) {
                                window.__IFRAME_CACHE.set(appConfig.id, {
                                    iframe: iframe,
                                    src: appConfig.src,
                                    fullyLoaded: true,
                                    loadTime: Date.now()
                                });
                            }

                            loadedCount++;

                            if (loadedCount === preloadApps.length) {
                                onAllPreloaded();
                            }
                        };

                        const tick = () => {
                            if (++retries < 2) { // 0x2
                                scheduleAfter(tick);
                            } else {
                                markLoaded();
                            }
                        };

                        scheduleAfter(tick);

                        setTimeout(() => {
                            if (!(iframeCacheExclusions && iframeCacheExclusions.has(appConfig.id))) {
                                if (!window.__IFRAME_CACHE.get(appConfig.id)?.fullyLoaded) {
                                    markLoaded();
                                }
                            } else {
                                markLoaded();
                            }
                        }, 1200); // 0x4b0
                    } else {
                        setTimeout(checkReadyState, 100); // 0x64
                    }
                } catch (error) {
                    setTimeout(() => {
                        if (!(iframeCacheExclusions && iframeCacheExclusions.has(appConfig.id))) {
                            window.__IFRAME_CACHE.set(appConfig.id, {
                                iframe: iframe,
                                src: appConfig.src,
                                fullyLoaded: true,
                                loadTime: Date.now()
                            });
                        }

                        loadedCount++;

                        if (loadedCount === preloadApps.length) {
                            onAllPreloaded();
                        }
                    }, 1000); // 0x3e8
                }
            };

            checkReadyState();
        };

        iframe.onerror = () => {
            loadedCount++;

            if (loadedCount === preloadApps.length) {
                onAllPreloaded();
            }
        };

        preloadContainer.appendChild(iframe);
    }
});

async function ensureLandscapeBlock() {
    let landscapeBlock = document.getElementById('landscape-block');

    if (!landscapeBlock) {
        landscapeBlock = document.createElement('div');
        landscapeBlock.id = 'landscape-block';

        // Get the loading image URL from portfolio manager
        let loadingImageSrc = 'assets/gui/boot/xp.svg'; // default fallback

        try {
            const portfolio = new PortfolioManager();
            await portfolio.initialize();
            const imagePath = portfolio.getLoadingImageUrl();

            // Handle dynamic SVG generation
            if (imagePath === 'dynamic:xp.svg') {
                loadingImageSrc = await portfolio.getDynamicXPSvgContent();
            } else {
                loadingImageSrc = imagePath;
            }
        } catch (error) {
            console.warn('Could not get loading image from portfolio manager:', error);
        }

        landscapeBlock.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <img decoding="async" src="${loadingImageSrc}" alt="Loading animation" style="max-width: 200px; height: auto;" />
        <div class="landscape-message">Please rotate your device back to portrait mode.</div>
      </div>
    `;

        document.body.appendChild(landscapeBlock);
    }

    return landscapeBlock;
}

function handleOrientationBlock() {
    const landscapeBlock = document.getElementById('landscape-block');
    if (!landscapeBlock) return;

    const matchLandscape = window.matchMedia && window.matchMedia('(orientation: landscape)').matches;
    const viewport = window.visualViewport;
    const width = viewport ? Math.round(viewport.width) : window.innerWidth;
    const height = viewport ? Math.round(viewport.height) : window.innerHeight;
    const isLandscape = width > height;
    const showBlock = matchLandscape || isLandscape;

    if (!IS_MOBILE_DEVICE || !showBlock) {
        landscapeBlock.style.display = 'none';
        return;
    }

    const minSide = Math.min(width, height);
    const isTooSmall = minSide < 600; // 0x258

    landscapeBlock.style.display = isTooSmall ? 'flex' : 'none';
}

function setRealVh() {
    const vhValue = (window.visualViewport ? window.visualViewport.height : window.innerHeight) * 0.01;
    document.documentElement.style.setProperty('--real-vh', vhValue + 'px');
}

function scaleDesktopIconsToFitMobile() {
    const desktopIcons = document.querySelector('.desktop-icons');
    if (!desktopIcons) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const scale = Math.min(width / 800, height / 600, 1); // 0x320, 0x258, 0x1

    desktopIcons.style.setProperty('--icon-scale', scale);
}
