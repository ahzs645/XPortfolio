import Desktop from './gui/desktop.js';
import Taskbar from './gui/taskbar.js';
import WindowManager from './gui/window.js';
import {
    eventBus,
    EVENTS
} from './utils/eventBus.js';
document['addEventListener']('visibilitychange', () => {
    if (document['hidden']) {
        const pauseEventData = {};
        pauseEventData['reason'] = 'page-hidden', eventBus['publish'](EVENTS['MEDIA_GLOBAL_PAUSE'], pauseEventData);
    } else {
        const visibleEventData = {};
        visibleEventData['reason'] = 'page-visible', eventBus['publish'](EVENTS['MEDIA_GLOBAL_VISIBLE'], visibleEventData);
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
let IS_MOBILE_DEVICE = ![];
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
document['addEventListener']('DOMContentLoaded', () => {
    try {
        const wasMobile = IS_MOBILE_DEVICE,
            isIos = /iPhone|iPad|iPod/i ['test'](navigator['userAgent']),
            isMobileOrIos = wasMobile || isIos;
        document['documentElement']['classList']['toggle']('mobile-device', isMobileOrIos), document['body']['classList']['toggle']('mobile-device', isMobileOrIos);
    } catch {}
    window['eventBus'] = eventBus, window['EVENTS'] = EVENTS, window['batchedPublish'] = publishBatched, window['flushEventBusQueue'] = flushEventBusQueue, initBootSequence(eventBus, EVENTS, []);
    const iframeCacheExclusions = new Set(['paint-window', 'mediaPlayer-window', 'musicPlayer-window', 'projects-window', 'about-window', 'image-viewer-window']);
    window['__IFRAME_CACHE_EXCLUDE'] = iframeCacheExclusions;
    const resumeApp = {};
    resumeApp['id'] = 'resume-window', resumeApp['src'] = 'src/apps/resume/resume.html', resumeApp['priority'] = 'high';
    const contactApp = {};
    contactApp['id'] = 'contact-window', contactApp['src'] = 'src/apps/contact/contact.html', contactApp['priority'] = 'high';
    const preloadApps = [resumeApp, contactApp];
    let loadedCount = 0x0;
    fetch('projects.json')['then'](_0x67d3c2 => _0x67d3c2['json']())['then'](_0x583482 => {
        window['updateBootProjectsData'] && window['updateBootProjectsData'](_0x583482);
    });
    const ariaHiddenAttributes = {};
    ariaHiddenAttributes['aria-hidden'] = 'true';
    const containerConfig = {};
    containerConfig['attributes'] = ariaHiddenAttributes;
    const preloadContainer = createHiddenContainer('preload-apps-container', containerConfig);
    preloadContainer['className'] = 'hidden-container', document['body']['appendChild'](preloadContainer), window['__IFRAME_CACHE'] = new Map(), window['__BOOT_COMPLETE'] = ![], window['__IS_IFRAME_CACHED'] = iframeId => {
        try {
            if (window['__IFRAME_CACHE_EXCLUDE'] && window['__IFRAME_CACHE_EXCLUDE']['has'](iframeId)) return ![];
            return window['__IFRAME_CACHE'] && window['__IFRAME_CACHE']['has'](iframeId) && window['__IFRAME_CACHE']['get'](iframeId)['fullyLoaded'];
        } catch (err) {
            return ![];
        }
    }, window['__MARK_BOOT_COMPLETE'] = () => {
        window['__BOOT_COMPLETE'] = !![];
    }, window['addEventListener']('message', eventMessage => {
        try {
            if (eventMessage && eventMessage['data'] && eventMessage['data']['type'] === 'app-preload-ready') {
                const messageAppId = eventMessage['data']['appId'];
                if (!messageAppId) return;
                const cacheEntry = window['__IFRAME_CACHE'] && window['__IFRAME_CACHE']['get'](messageAppId);
                cacheEntry && !cacheEntry['fullyLoaded'] && (cacheEntry['fullyLoaded'] = !![], cacheEntry['handshake'] = !![], window['__IFRAME_CACHE']['set'](messageAppId, cacheEntry));
            }
        } catch (e) {}
    });

    function initializeUIComponents() {
        if (window['__UI_INITIALIZED']) return;
        window['__UI_INITIALIZED'] = !![], globalTaskbarInstance = new Taskbar(eventBus), new Desktop(eventBus), window['windowManager'] = new WindowManager(eventBus), initializeDeviceDetection(), IS_MOBILE_DEVICE = document['documentElement']['classList']['contains']('mobile-device'), eventBus['subscribe'](EVENTS['SHUTDOWN_REQUESTED'], () => {
            sessionStorage['removeItem']('logged_in'), window['location']['assign'](window['location']['pathname'] + '?forceBoot=true');
        }), initRandomScanline(), setupTooltips('[data-tooltip]'), ensureLandscapeBlock(), handleOrientationBlock(), setRealVh();
    }
    window['initializeUIComponents'] = initializeUIComponents;

    function onAllPreloaded() {
        applyHiddenContainerStyles(preloadContainer);
        const preloadedIframes = preloadContainer['querySelectorAll']('iframe');
        applyHiddenIframeStyles(preloadedIframes);
        window['__MARK_BOOT_COMPLETE'] && window['__MARK_BOOT_COMPLETE']();
        if (!window['__UI_INITIALIZED']) initializeUIComponents();
        initMessageRouter(), registerMessageHandler('resume-interaction', () => {
                if (!globalTaskbarInstance) return;
                const startMenuComponent = globalTaskbarInstance['startMenuComponent'];
                if (startMenuComponent && startMenuComponent['startMenu']?.['classList']['contains']('active')) startMenuComponent['closeStartMenu']();
            }), registerMessageHandler('open-social-from-about', eventData => {
                const socialKey = eventData?.['data']?.['key'],
                    socialUrl = eventData?.['data']?.['url'],
                    socialLabel = eventData?.['data']?.['label'] || socialKey;
                if (!socialKey || !socialUrl) return;
                const message = {};
                message['type'] = 'confirm-open-link', message['label'] = socialLabel, message['url'] = socialUrl, window['postMessage'](message, '*');
            }), registerMessageHandler('open-projects-from-overlay-studio', () => {
                const eventPayload = {};
                eventPayload['programName'] = 'projects', eventBus['publish'](EVENTS['PROGRAM_OPEN'], eventPayload);
            }), registerMessageHandler('open-program', eventData => {
                const programName = eventData?.['data']?.['programName'];
                if (!programName) return;
                handleProgramOpenRequest({
                    'programName': programName,
                    'eventData': eventData['data'],
                    'publish': eventBus['publish']['bind'](eventBus),
                    'EVENTS': EVENTS
                });
            }), registerMessageHandler('show-youtube-error', eventData => {
                import('./utils/popupManager.js')['then'](({
                    default: popupManager
                }) => {
                    if (!popupManager['isInitialized']) popupManager['init']();
                    const errorMessage = eventData['data']['message'] || 'YouTube\x20playlist\x20error\x20occurred.';
                    popupManager['showPopup']({
                        'type': 'error',
                        'title': 'Media\x20Player\x20Error',
                        'message': errorMessage,
                        'icon': '/assets/gui/start-menu/mediaPlayer.webp',
                        'buttons': [{
                            'text': 'Open\x20YouTube',
                            'action': 'view-playlists',
                            'primary': !![],
                            'onClick': () => {
                                window['open']('https://www.youtube.com/@mitchivin/playlists', '_blank');
                            }
                        }, {
                            'text': 'Close\x20Player',
                            'action': 'close-player',
                            'onClick': () => {
                                const playerIframe = document['querySelector']('iframe[src*=\x22mediaPlayer\x22]');
                                if (playerIframe) {
                                    const windowElement = playerIframe['closest']('.window,\x20.app-window');
                                    windowElement && window['windowManager'] ? window['windowManager']['closeWindow'](windowElement) : console['warn']('Could\x20not\x20find\x20windowManager\x20or\x20windowElement\x20for\x20media\x20player');
                                } else console['warn']('Could\x20not\x20find\x20media\x20player\x20iframe');
                            }
                        }]
                    });
                });
            }), registerMessageHandler('confirm-open-program', eventData => {
                if (!IS_MOBILE_DEVICE) return;
                import('./utils/popupManager.js')['then'](({
                    default: popupManager
                }) => {
                    if (!popupManager['isInitialized']) popupManager['init']();
                    const programName = eventData['data']['programName'],
                        title = eventData['data']['title'] || 'Open\x20Program',
                        icon = eventData['data']['icon'] || null,
                        cancelButton = {};
                    cancelButton['text'] = 'Cancel', cancelButton['action'] = 'cancel', popupManager['showPopup']({
                        'type': 'mobile-restriction',
                        'title': title,
                        'message': 'Are\x20you\x20sure\x20you\x20want\x20to\x20open\x20\x22' + title + '\x22?',
                        'icon': icon,
                        'buttons': [cancelButton, {
                            'text': 'Open\x20' + title,
                            'action': 'confirm',
                            'primary': !![],
                            'onClick': () => {
                                const {
                                    programName: programNameInner,
                                    title: titleInner,
                                    icon: iconInner,
                                    ...additionalData
                                } = eventData['data'], openEvent = {
                                    'programName': programNameInner,
                                    ...additionalData
                                };
                                eventBus['publish'](EVENTS['PROGRAM_OPEN'], openEvent);
                            }
                        }]
                    });
                });
            }), registerMessageHandler('confirm-open-link', eventData => {
                const url = eventData['data']['url'] || '',
                    allowedOnDesktop = ['keepthescore.com', 'github.com/mitchivin', 'instagram.com', 'linkedin.com']['some'](domain => url['includes'](domain));
                if (!IS_MOBILE_DEVICE && !allowedOnDesktop) return;
                import('./utils/popupManager.js')['then'](({
                    default: popupManager
                }) => {
                    if (!popupManager['isInitialized']) popupManager['init']();
                    const linkUrl = eventData['data']['url'] || '';
                    let label = eventData['data']['label'] || '',
                        confirmText = 'Yes,\x20open\x20link',
                        icon = null;
                    if (linkUrl['includes']('keepthescore.com')) label = 'Keep\x20The\x20Score', confirmText = 'Visit\x20Keep\x20The\x20Score', icon = './assets/gui/start-menu/keepthescore.webp';
                    else {
                        if (linkUrl['includes']('github.com/mitchivin')) label = 'My\x20Github', confirmText = 'Visit\x20My\x20Github', icon = './assets/gui/start-menu/github.webp';
                        else {
                            if (linkUrl['includes']('instagram.com')) label = 'Instagram', confirmText = 'Visit\x20Instagram', icon = './assets/gui/start-menu/instagram.webp';
                            else {
                                if (linkUrl['includes']('linkedin.com')) label = 'LinkedIn', confirmText = 'Visit\x20LinkedIn', icon = './assets/gui/start-menu/linkedin.webp';
                                else {
                                    if (!label) try {
                                        label = new URL(linkUrl)['hostname'];
                                    } catch {
                                        label = 'this\x20link';
                                    }
                                }
                            }
                        }
                    }
                    const cancelButton = {};
                    cancelButton['text'] = 'Cancel', cancelButton['action'] = 'cancel', popupManager['showPopup']({
                        'type': 'confirm',
                        'title': 'Open\x20Link',
                        'message': 'Are\x20you\x20sure\x20you\x20want\x20to\x20open\x20\x22' + label + '\x22?',
                        'icon': icon,
                        'buttons': [cancelButton, {
                            'text': confirmText,
                            'action': 'confirm',
                            'primary': !![],
                            'onClick': () => window['open'](linkUrl, '_blank')
                        }]
                    });
                });
            }),
            function suppressGestures() {
                if (window['__GESTURE_SUPPRESSION_V2']) return;
                window['__GESTURE_SUPPRESSION_V2'] = !![];
                const touchState = {};
                touchState['lastTouchEnd'] = 0x0;
                const touchData = touchState,
                    handler = _0x30ead1 => {
                        switch (_0x30ead1['type']) {
                            case 'gesturestart':
                            case 'gesturechange':
                            case 'gestureend':
                                _0x30ead1['preventDefault']();
                                break;
                            case 'touchstart':
                            case 'touchmove':
                                if (_0x30ead1['touches'] && _0x30ead1['touches']['length'] > 0x1) _0x30ead1['preventDefault']();
                                break;
                            case 'touchend': {
                                const now = Date['now']();
                                if (now - touchData['lastTouchEnd'] <= 0x12c) _0x30ead1['preventDefault']();
                                touchData['lastTouchEnd'] = now;
                                break;
                            }
                            case 'wheel':
                                if (_0x30ead1['ctrlKey']) _0x30ead1['preventDefault']();
                                break;
                        }
                    },
                    events = ['gesturestart', 'gesturechange', 'gestureend', 'touchstart', 'touchmove', 'touchend', 'wheel'],
                    options = {};
                options['passive'] = ![], options['capture'] = !![], events['forEach'](_0x187a41 => document['addEventListener'](_0x187a41, handler, options));
                try {
                    const style = document['createElement']('style');
                    style['id'] = 'gesture-suppression-style', style['textContent'] = 'html,body{touch-action:none;overscroll-behavior:none;-webkit-user-select:none;user-select:none;-ms-touch-action:none;}', document['head']['appendChild'](style);
                } catch (_0x332e36) {}
            }(), import('./utils/eventListenerManager.js')['then'](({
                addManagedResizeListener: addManagedResizeListener,
                addManagedOrientationListener: addManagedOrientationListener
            }) => {
                const onResize = () => {
                        handleOrientationBlock(), setRealVh();
                        const isLandscape = window['matchMedia']('(orientation:\x20landscape)')['matches'],
                            isMobile = IS_MOBILE_DEVICE;
                        !(isMobile && isLandscape) && scaleDesktopIconsToFitMobile();
                    },
                    onOrientation = () => {
                        handleOrientationBlock(), setRealVh();
                    };
                addManagedResizeListener(onResize), addManagedOrientationListener(onOrientation);
            })['catch'](() => {
                let timeoutId;
                const debouncedResize = () => {
                    clearTimeout(timeoutId), timeoutId = setTimeout(() => {
                        handleOrientationBlock(), setRealVh();
                        const isLandscape = window['matchMedia']('(orientation:\x20landscape)')['matches'],
                            isMobile = IS_MOBILE_DEVICE;
                        !(isMobile && isLandscape) && scaleDesktopIconsToFitMobile();
                    }, 0x10);
                };
                window['addEventListener']('orientationchange', () => {
                    handleOrientationBlock(), setRealVh();
                }), window['addEventListener']('resize', debouncedResize);
            });
    }
    if (!IS_MOBILE_DEVICE) {
        const highPriorityApps = preloadApps['filter'](_0xf59fcd => _0xf59fcd['priority'] === 'high'),
            mediumPriorityApps = preloadApps['filter'](_0x37e931 => _0x37e931['priority'] === 'medium'),
            lowPriorityApps = preloadApps['filter'](_0x43bc3a => _0x43bc3a['priority'] === 'low');
        highPriorityApps['forEach']((app, index) => {
            const delay = index * 0x12;
            setTimeout(() => preloadIframe(app), delay);
        });
        const loadAppsWithDelay = (apps, initialDelay = 0x50, stepDelay = 0x8c) => {
            if (!apps['length']) return;
            apps['forEach']((app, idx) => {
                const delay = initialDelay + idx * stepDelay,
                    loader = () => preloadIframe(app);
                'requestIdleCallback' in window ? setTimeout(() => {
                    try {
                        const opts = {};
                        opts['timeout'] = 0xfa, window['requestIdleCallback'](loader, opts);
                    } catch {
                        loader();
                    }
                }, delay) : setTimeout(loader, delay);
            });
        };
        loadAppsWithDelay(mediumPriorityApps, 0x5a, 0x78), loadAppsWithDelay(lowPriorityApps, 0x190, 0xa0), setTimeout(() => {
            !globalTaskbarInstance && onAllPreloaded();
        }, 0x898);
    } else onAllPreloaded();

    function preloadIframe(appConfig) {
        const iframeOptions = {};
        iframeOptions['src'] = appConfig['src'], iframeOptions['id'] = appConfig['id'], iframeOptions['withTransform'] = !![];
        const iframe = createPreloadIframe(iframeOptions);
        iframe['onload'] = () => {
            const checkReadyState = () => {
                try {
                    const doc = iframe['contentDocument'] || iframe['contentWindow']['document'];
                    if (doc && doc['readyState'] === 'complete') {
                        let retries = 0x0;
                        const markLoaded = () => {
                                !(iframeCacheExclusions && iframeCacheExclusions['has'](appConfig['id'])) && window['__IFRAME_CACHE']['set'](appConfig['id'], {
                                    'iframe': iframe,
                                    'src': appConfig['src'],
                                    'fullyLoaded': !![],
                                    'loadTime': Date['now']()
                                });
                                loadedCount++;
                                if (loadedCount === preloadApps['length']) onAllPreloaded();
                            },
                            tick = () => {
                                ++retries < 0x2 ? scheduleAfter(tick) : markLoaded();
                            };
                        scheduleAfter(tick), setTimeout(() => {
                            if (!(iframeCacheExclusions && iframeCacheExclusions['has'](appConfig['id']))) {
                                if (!window['__IFRAME_CACHE']['get'](appConfig['id'])?.['fullyLoaded']) markLoaded();
                            } else markLoaded();
                        }, 0x4b0);
                    } else setTimeout(checkReadyState, 0x64);
                } catch (_0x409959) {
                    setTimeout(() => {
                        !(iframeCacheExclusions && iframeCacheExclusions['has'](appConfig['id'])) && window['__IFRAME_CACHE']['set'](appConfig['id'], {
                            'iframe': iframe,
                            'src': appConfig['src'],
                            'fullyLoaded': !![],
                            'loadTime': Date['now']()
                        }), loadedCount++, loadedCount === preloadApps['length'] && onAllPreloaded();
                    }, 0x3e8);
                }
            };
            checkReadyState();
        }, iframe['onerror'] = () => {
            loadedCount++, loadedCount === preloadApps['length'] && onAllPreloaded();
        }, preloadContainer['appendChild'](iframe);
    }
});

function ensureLandscapeBlock() {
    let landscapeBlock = document['getElementById']('landscape-block');
    return !landscapeBlock && (landscapeBlock = document['createElement']('div'), landscapeBlock['id'] = 'landscape-block', landscapeBlock['innerHTML'] = '\x0a\x20\x20\x20\x20\x20\x20<div\x20style=\x22display:\x20flex;\x20flex-direction:\x20column;\x20align-items:\x20center;\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20src=\x22assets/gui/boot/loading.webp\x22\x20alt=\x22Loading\x20animation\x22\x20style=\x22max-width:\x20200px;\x20height:\x20auto;\x22\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22landscape-message\x22>Please\x20rotate\x20your\x20device\x20back\x20to\x20portrait\x20mode.</div>\x0a\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20', document['body']['appendChild'](landscapeBlock)), landscapeBlock;
}

function handleOrientationBlock() {
    const landscapeBlock = document['getElementById']('landscape-block');
    if (!landscapeBlock) return;
    const matchLandscape = window['matchMedia'] && window['matchMedia']('(orientation:\x20landscape)')['matches'],
        viewport = window['visualViewport'],
        width = viewport ? Math['round'](viewport['width']) : window['innerWidth'],
        height = viewport ? Math['round'](viewport['height']) : window['innerHeight'],
        isLandscape = width > height,
        showBlock = matchLandscape || isLandscape;
    if (!IS_MOBILE_DEVICE || !showBlock) {
        landscapeBlock['style']['display'] = 'none';
        return;
    }
    const minSide = Math['min'](width, height),
        isTooSmall = minSide < 0x258;
    landscapeBlock['style']['display'] = isTooSmall ? 'flex' : 'none';
}

function setRealVh() {
    const vhValue = (window['visualViewport'] ? window['visualViewport']['height'] : window['innerHeight']) * 0.01;
    document['documentElement']['style']['setProperty']('--real-vh', vhValue + 'px');
}

function scaleDesktopIconsToFitMobile() {
    const desktopIcons = document['querySelector']('.desktop-icons');
    if (!desktopIcons) return;
    const width = window['innerWidth'],
        height = window['innerHeight'],
        scale = Math['min'](width / 0x320, height / 0x258, 0x1);
    desktopIcons['style']['setProperty']('--icon-scale', scale);
}