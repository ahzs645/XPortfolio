import {
    initializeSystemAudio,
    getLoginSound,
    getLogoffSound,
    getBalloonSound
} from '../utils/audioManager.js';
let SYSTEM_ASSETS = null;
async function getSystemAssets() {
    if (SYSTEM_ASSETS) return SYSTEM_ASSETS;
    try {
        const response = await fetch('./ui.json');
        return SYSTEM_ASSETS = await response['json'](), SYSTEM_ASSETS;
    } catch (error) {
        return SYSTEM_ASSETS = {}, SYSTEM_ASSETS;
    }
}
export function initBootSequence(eventBus, EVENTS, projectsData) {
    const bootScreen = document['getElementById']('boot-screen'),
        loginScreen = document['getElementById']('login-screen'),
        desktopElement = document['querySelector']('.desktop'),
        scanlineOverlay = document['querySelector']('.crt-scanline'),
        vignetteOverlay = document['querySelector']('.crt-vignette'),
        bootDelayMessage = document['getElementById']('boot-delay-message');
    let projects = projectsData || [];

    function updateProjectsData(newProjects) {
        projects = newProjects;
    }
    window['updateBootProjectsData'] = updateProjectsData;
    const urlParams = new URLSearchParams(window['location']['search']),
        forceBoot = urlParams['get']('forceBoot') === 'true',
        logoffDialog = document['getElementById']('logoff-dialog-container'),
        logoffButton = document['getElementById']('logoff-log-off-btn'),
        switchUserButton = document['getElementById']('logoff-switch-user-btn'),
        cancelButton = document['getElementById']('logoff-cancel-btn');
    let grayscaleTimeout = null,
        logoffMode = 'logOff';
    initializeSystemAudio();
    let audioUnlocked = ![];
    const unlockAudio = () => {
            if (audioUnlocked) return;
            audioUnlocked = !![];
            const audioElement = new Audio();
            audioElement['src'] = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=', audioElement['volume'] = 0.01, audioElement['play']()['then'](() => {
                audioElement['pause'](), audioElement['remove']();
            })['catch'](() => {});
        },
        touchOptions = {};
    touchOptions['once'] = !![], document['addEventListener']('touchstart', unlockAudio, touchOptions);
    const mouseOptions = {};
    mouseOptions['once'] = !![], document['addEventListener']('mousedown', unlockAudio, mouseOptions);
    const keyOptions = {};
    keyOptions['once'] = !![], document['addEventListener']('keydown', unlockAudio, keyOptions);
    if (forceBoot) {
        const newPath = window['location']['pathname'] + window['location']['hash'];
        history['replaceState']({}, document['title'], newPath), sessionStorage['removeItem']('logged_in'), showBoot(projects);
    } else {
        const loggedIn = sessionStorage['getItem']('logged_in') === 'true';
        loggedIn ? showDesktop() : showBoot(projects);
    }

    function showDesktop() {
        bootScreen['style']['display'] = 'none', loginScreen['style']['display'] = 'none', desktopElement['style']['opacity'] = '1', desktopElement['style']['pointerEvents'] = 'auto';
        if (bootDelayMessage) bootDelayMessage['style']['display'] = 'none';
        window['__MARK_BOOT_COMPLETE'] && window['__MARK_BOOT_COMPLETE'](), window['initializeUIComponents'] && window['initializeUIComponents']();
    }

    function showBoot(projectList) {
        setTimeout(async () => {
            desktopElement['style']['opacity'] = '0', desktopElement['style']['pointerEvents'] = 'none';
            if (scanlineOverlay) scanlineOverlay['style']['display'] = 'none';
            if (vignetteOverlay) vignetteOverlay['style']['display'] = 'none';
            if (!bootScreen) return;
            const assets = await getSystemAssets(),
                bootLogo = document['getElementById']('boot-logo');
            bootLogo && assets && assets['loading'] && (bootLogo['src'] = assets['loading']);
            bootScreen['style']['display'] = 'flex', bootScreen['style']['opacity'] = '1', bootScreen['style']['pointerEvents'] = 'auto';
            const showDelayMessage = () => {
                bootScreen['style']['display'] === 'flex' && bootDelayMessage && !resourcesReady && (bootDelayMessage['style']['opacity'] = '0', bootDelayMessage['style']['transition'] = 'opacity\x200.5s\x20ease-in-out', bootDelayMessage['style']['display'] = 'block', void bootDelayMessage['offsetWidth'], bootDelayMessage['style']['opacity'] = '1');
            };
            let minimumDelayPassed = ![],
                resourcesReady = ![];
            const minimumBootDelay = 0xea6,
                checkResources = async () => {
                    try {
                        if (!assets || Object['keys'](assets)['length'] === 0x0) return ![];
                        const preloadImages = ['./assets/gui/bgs/bliss.webp', './assets/gui/desktop/about.webp', './assets/gui/desktop/projects.webp', './assets/gui/desktop/contact.webp', './assets/gui/desktop/resume.webp', './assets/gui/taskbar/start-button.webp', './assets/gui/taskbar/taskbar-bg.webp', './assets/gui/taskbar/system-tray.webp'],
                            imagePromises = preloadImages['map'](src => {
                                return new Promise(resolveFn => {
                                    const img = new Image();
                                    img['onload'] = () => resolveFn(!![]), img['onerror'] = () => resolveFn(![]), img['src'] = src;
                                });
                            }),
                            loadResults = await Promise['all'](imagePromises),
                            allLoaded = loadResults['every'](loaded => loaded),
                            hasProjectData = typeof window['updateBootProjectsData'] === 'function';
                        return allLoaded && hasProjectData;
                    } catch (resourceError) {
                        return console['warn']('Resource\x20check\x20failed:', resourceError), ![];
                    }
                }, startTransitionIfReady = () => {
                    minimumDelayPassed && resourcesReady && transitionToLogin();
                };
            setTimeout(() => {
                minimumDelayPassed = !![], !resourcesReady && showDelayMessage(), startTransitionIfReady();
            }, minimumBootDelay);
            const pollResourceLoad = async () => {
                resourcesReady = await checkResources(), resourcesReady ? startTransitionIfReady() : setTimeout(pollResourceLoad, 0x64);
            };
            pollResourceLoad();
            const transitionToLogin = () => {
                bootDelayMessage && bootDelayMessage['parentNode'] && bootDelayMessage['parentNode']['removeChild'](bootDelayMessage), bootScreen['classList']['remove']('boot-fade-in'), setTimeout(() => {
                    const fadeOverlay = document['getElementById']('boot-fadeout-overlay');
                    fadeOverlay && (fadeOverlay['style']['display'] = 'block', void fadeOverlay['offsetWidth'], fadeOverlay['style']['transition'] = 'opacity\x200.5s', fadeOverlay['style']['opacity'] = '1', setTimeout(() => {
                        bootScreen['style']['display'] = 'none', loginScreen['style']['display'] = 'flex', loginScreen['style']['opacity'] = '1', loginScreen['style']['pointerEvents'] = 'auto';
                        const loginScreenInnerEl = loginScreen['querySelector']('.login-screen');
                        if (loginScreenInnerEl) loginScreenInnerEl['style']['opacity'] = '1';
                        setupLoginHandlers(projectList), fadeOverlay['style']['opacity'] = '0', bootDelayMessage && bootDelayMessage['parentNode'] && bootDelayMessage['parentNode']['removeChild'](bootDelayMessage), setTimeout(() => {
                            fadeOverlay['style']['display'] = 'none';
                        }, 0x1f4);
                    }, 0x47e));
                }, 0xfa);
            };
        }, 0x3e8);
    }

    function showLoginAnimation() {
        const loginScreenElement = loginScreen['querySelector']('.login-screen'),
            welcomeMessage = loginScreen['querySelector']('.welcome-message'),
            loginFadeElements = [loginScreenElement['querySelector']('.login-screen-center'), loginScreenElement['querySelector']('.back-gradient'), loginScreenElement['querySelector']('.turn-off'), loginScreenElement['querySelector']('.right-bottom'), loginScreenElement['querySelector']('.xp-logo-image'), loginScreenElement['querySelector']('.left-text'), loginScreenElement['querySelector']('.login-separator.mobile-only')];
        loginFadeElements['forEach'](elem => {
            elem && (elem['style']['transition'] = 'opacity\x200.3s', elem['style']['opacity'] = '0');
        }), setTimeout(() => {
            loginFadeElements['forEach'](elem2 => {
                if (elem2) elem2['style']['display'] = 'none';
            }), welcomeMessage['style']['display'] = 'block', welcomeMessage['classList']['remove']('welcome-message-initial-hidden'), import('../utils/frameScheduler.js')['then'](({
                scheduleAfter: scheduleAfter
            }) => {
                scheduleAfter(() => {
                    welcomeMessage['classList']['add']('visible');
                });
            }), setTimeout(() => {
                welcomeMessage['classList']['remove']('visible'), loginScreen['style']['display'] = 'none', loginScreen['style']['pointerEvents'] = 'none', desktopElement['style']['opacity'] = '1', desktopElement['style']['pointerEvents'] = 'auto';
                if (scanlineOverlay) scanlineOverlay['style']['display'] = 'block';
                if (vignetteOverlay) vignetteOverlay['style']['display'] = 'block';
                window['__MARK_BOOT_COMPLETE'] && window['__MARK_BOOT_COMPLETE']();
                const loginSound = getLoginSound();
                if (loginSound) {
                    loginSound['pause'](), loginSound['currentTime'] = 0x0, loginSound['volume'] = 0x1;
                    const isFirefox = navigator['userAgent']['toLowerCase']()['includes']('firefox'),
                        playDelay = isFirefox ? 0x32 : 0xa;
                    setTimeout(() => {
                        loginSound['play']()['catch'](() => {});
                    }, playDelay), setTimeout(() => {
                        const balloonSound = getBalloonSound();
                        balloonSound && (balloonSound['volume'] = 0.01, balloonSound['currentTime'] = 0x0, balloonSound['play']()['then'](() => {
                            balloonSound['pause'](), balloonSound['currentTime'] = 0x0, balloonSound['volume'] = 0x1;
                        })['catch'](() => {
                            balloonSound['volume'] = 0x1;
                        }));
                    }, 0x32), setTimeout(() => {
                        !document['getElementById']('balloon-root') && import('./taskbar.js')['then'](({
                            showWelcomeBalloon: showWelcomeBalloon
                        }) => {
                            showWelcomeBalloon();
                        });
                    }, 0x12c0);
                } else setTimeout(() => {
                    !document['getElementById']('balloon-root') && import('./taskbar.js')['then'](({
                        showWelcomeBalloon: showWelcomeBalloonAlt
                    }) => {
                        showWelcomeBalloonAlt();
                    });
                }, 0x3e8);
                sessionStorage['setItem']('logged_in', 'true'), window['_logoffEnableTime'] = Date['now']() + 0x1194;
            }, 0x7d0);
        }, 0x12c);
    }
    window['addEventListener']('message', messageEvent => {
        messageEvent['data']?.['type'] === 'shutdownRequest' && (eventBus && EVENTS && eventBus['publish'](EVENTS['SHUTDOWN_REQUESTED']));
    });
    if (!eventBus || !EVENTS) return;
    eventBus['subscribe'](EVENTS['LOG_OFF_CONFIRMATION_REQUESTED'], data => {
        logoffMode = data?.['dialogType'] || 'logOff', openLogoffDialog();
    });

    function openLogoffDialog() {
        if (!logoffDialog) return;
        const headerText = logoffDialog['querySelector']('.logoff-dialog-header-text'),
            logoffConfirmButton = logoffDialog['querySelector']('#logoff-log-off-btn'),
            logoffButtonImage = logoffConfirmButton?.['querySelector']('img'),
            logoffButtonLabel = logoffConfirmButton?.['querySelector']('span');
        if (logoffMode === 'shutDown') {
            if (headerText) headerText['textContent'] = 'Turn\x20off\x20MitchIvin\x20XP';
            if (logoffButtonLabel) logoffButtonLabel['textContent'] = 'Shut\x20Down';
            if (logoffButtonImage) logoffButtonImage['src'] = 'assets/gui/start-menu/shutdown.webp';
            logoffConfirmButton && (logoffConfirmButton['style']['opacity'] = '0.6', logoffConfirmButton['style']['pointerEvents'] = 'none');
        } else {
            if (headerText) headerText['textContent'] = 'Log\x20Off\x20MitchIvin\x20XP';
            if (logoffButtonLabel) logoffButtonLabel['textContent'] = 'Log\x20Off';
            if (logoffButtonImage) logoffButtonImage['src'] = 'assets/gui/start-menu/logoff.webp';
            logoffConfirmButton && (logoffConfirmButton['style']['opacity'] = '', logoffConfirmButton['style']['pointerEvents'] = '');
        }
        logoffDialog['classList']['remove']('logoff-dialog-hidden'), logoffDialog['classList']['add']('visible');
        switchUserButton && (switchUserButton['style']['opacity'] = '', switchUserButton['style']['pointerEvents'] = '', switchUserButton['classList']['remove']('disabled'));
        if (logoffConfirmButton && logoffMode === 'logOff') {
            const now = Date['now'](),
                enableTimestamp = window['_logoffEnableTime'] || 0x0;
            now < enableTimestamp ? (logoffConfirmButton['classList']['add']('logoff-button-timed-disable'), logoffConfirmButton['style']['pointerEvents'] = 'none', logoffConfirmButton['style']['opacity'] = '0.6', setTimeout(() => {
                logoffConfirmButton && logoffDialog['classList']['contains']('visible') && logoffMode === 'logOff' && (logoffConfirmButton['classList']['remove']('logoff-button-timed-disable'), logoffConfirmButton['style']['pointerEvents'] = '', logoffConfirmButton['style']['opacity'] = '');
            }, enableTimestamp - now)) : (logoffConfirmButton['classList']['remove']('logoff-button-timed-disable'), logoffConfirmButton['style']['pointerEvents'] = '', logoffConfirmButton['style']['opacity'] = '');
        }
        clearTimeout(grayscaleTimeout), grayscaleTimeout = setTimeout(() => {
            document['body']['classList']['add']('screen-grayscale-active');
        }, 0x2bc);
    }

    function closeLogoffDialog() {
        if (!logoffDialog) return;
        logoffDialog['classList']['remove']('visible'), logoffDialog['classList']['add']('logoff-dialog-hidden'), document['body']['classList']['remove']('screen-grayscale-active'), clearTimeout(grayscaleTimeout);
    }
    if (logoffButton) {
        const handleLogoffClick = event => {
            event['stopPropagation']();
            const isDisabled = logoffButton['style']['opacity'] === '0.6' || logoffButton['style']['pointerEvents'] === 'none';
            if (isDisabled) return;
            closeLogoffDialog();
            if (logoffMode === 'shutDown') return;
            else eventBus['publish'](EVENTS['LOG_OFF_REQUESTED']);
        };
        !logoffButton['_logOffActionAttached'] && (logoffButton['addEventListener']('click', handleLogoffClick), logoffButton['addEventListener']('keydown', keyEvt => {
            (keyEvt['key'] === 'Enter' || keyEvt['key'] === '\x20') && (keyEvt['preventDefault'](), handleLogoffClick(keyEvt));
        }), logoffButton['_logOffActionAttached'] = !![]);
    }
    if (switchUserButton) {
        const handleSwitchUser = event2 => {
            event2['stopPropagation'](), closeLogoffDialog(), sessionStorage['removeItem']('logged_in'), window['location']['reload']();
        };
        !switchUserButton['_restartActionAttached'] && (switchUserButton['addEventListener']('click', handleSwitchUser), switchUserButton['addEventListener']('keydown', keyEvent => {
            (keyEvent['key'] === 'Enter' || keyEvent['key'] === '\x20') && (keyEvent['preventDefault'](), handleSwitchUser(keyEvent));
        }), switchUserButton['_restartActionAttached'] = !![]);
    }
    if (cancelButton) {
        const handleCancel = () => {
            closeLogoffDialog();
        };
        !cancelButton['_cancelActionAttached'] && (cancelButton['addEventListener']('click', handleCancel), cancelButton['_cancelActionAttached'] = !![]);
    }
    const handleEscKey = event => {
        event['key'] === 'Escape' && logoffDialog && logoffDialog['classList']['contains']('visible') && closeLogoffDialog();
    };
    document['addEventListener']('keydown', handleEscKey), eventBus['subscribe'](EVENTS['LOG_OFF_REQUESTED'], () => {
        try {
            const logoffSound = getLogoffSound();
            if (logoffSound) {
                logoffSound['pause'](), logoffSound['currentTime'] = 0x0;
                const isFirefoxFlag = navigator['userAgent']['toLowerCase']()['includes']('firefox'),
                    soundDelay = isFirefoxFlag ? 0x32 : 0xa;
                setTimeout(() => {
                    logoffSound['play']()['catch'](() => {});
                }, soundDelay);
            }
        } catch (logoffError) {}
        try {
            if (eventBus && EVENTS && EVENTS['MEDIA_GLOBAL_PAUSE']) {
                const pauseEvent = {};
                pauseEvent['reason'] = 'logoff', eventBus['publish'](EVENTS['MEDIA_GLOBAL_PAUSE'], pauseEvent);
            } else {
                if (window['eventBus'] && window['EVENTS'] && window['EVENTS']['MEDIA_GLOBAL_PAUSE']) {
                    const globalPauseEvent = {};
                    globalPauseEvent['reason'] = 'logoff', window['eventBus']['publish'](window['EVENTS']['MEDIA_GLOBAL_PAUSE'], globalPauseEvent);
                }
            }
        } catch (pauseError) {}
        loginScreen['style']['display'] = 'flex', loginScreen['style']['opacity'] = '1', loginScreen['style']['pointerEvents'] = 'auto';
        const loginScreenInner = loginScreen['querySelector']('.login-screen');
        if (loginScreenInner) {
            loginScreenInner['style']['opacity'] = '1';
            const loginElementsArray = [loginScreenInner['querySelector']('.login-screen-center'), loginScreenInner['querySelector']('.back-gradient'), loginScreenInner['querySelector']('.turn-off'), loginScreenInner['querySelector']('.right-bottom'), loginScreenInner['querySelector']('.xp-logo-image'), loginScreenInner['querySelector']('.left-text'), loginScreenInner['querySelector']('hr.login-separator'), loginScreenInner['querySelector']('.login-separator.mobile-only'), loginScreen['querySelector']('.welcome-message')];
            loginElementsArray['forEach'](item => {
                item && (item['style']['display'] = '', item['style']['opacity'] = '1', item['classList']['contains']('welcome-message') && (item['classList']['remove']('visible'), item['style']['display'] = 'none'));
            });
        }
        desktopElement['style']['opacity'] = '0', desktopElement['style']['pointerEvents'] = 'none', sessionStorage['removeItem']('logged_in');
        if (scanlineOverlay) scanlineOverlay['style']['display'] = 'none';
        if (vignetteOverlay) vignetteOverlay['style']['display'] = 'none';
        try {
            import('./taskbar.js')['then'](({
                hideBalloon: hideBalloon
            }) => {
                hideBalloon(!![]);
            });
        } catch (hideError) {}
        const startMenuClosePayload = {};
        startMenuClosePayload['__coalesce'] = !![], (window['batchedPublish'] || eventBus['publish'])['call'](window['batchedPublish'] ? undefined : eventBus, EVENTS['STARTMENU_CLOSE_REQUEST'], startMenuClosePayload), setupLoginHandlers(projects);
    });

    function setupLoginHandlers(projectData) {
        const backGradient = document['querySelector']('.back-gradient');
        backGradient && !backGradient['_loginHandlerAttached'] && (backGradient['addEventListener']('click', function() {
            backGradient['classList']['add']('active'), showLoginAnimation(projectData);
        }), backGradient['_loginHandlerAttached'] = !![]);
        const shutdownIcon = document['getElementById']('shutdown-icon');
        shutdownIcon && !shutdownIcon['_shutdownHandlerAttached'] && (shutdownIcon['addEventListener']('click', () => {
            if (eventBus && EVENTS) {
                const logoffRequest = {};
                logoffRequest['dialogType'] = 'shutDown', eventBus['publish'](EVENTS['LOG_OFF_CONFIRMATION_REQUESTED'], logoffRequest);
            }
        }), shutdownIcon['_shutdownHandlerAttached'] = !![]);
    }
}
document['addEventListener']('DOMContentLoaded', async () => {
    const assets = await getSystemAssets(),
        logoImg = document['getElementById']('boot-logo');
    if (logoImg && assets['loading']) logoImg['src'] = assets['loading'];
    document['querySelectorAll']('.xp-logo-image')['forEach'](xpLogoImg => {
        if (assets['loading']) xpLogoImg['src'] = assets['loading'];
    }), document['querySelectorAll']('.login-screen\x20.user\x20img')['forEach'](userImage => {
        if (assets['userIcon']) userImage['src'] = assets['userIcon'];
    });
    try {
        const response = await fetch('./ui.json'),
            data = await response['json'](),
            contactName = data?.['contact']?.['name'] || 'Mitch\x20Ivin';
        document['querySelectorAll']('.login-screen\x20.name')['forEach'](element => {
            element['textContent'] = contactName;
        }), document['querySelectorAll']('.login-instruction-name')['forEach'](element2 => {
            element2['textContent'] = contactName;
        });
    } catch (uiError) {}
    const preBootOverlay = document['getElementById']('pre-boot-overlay'),
        bootScreenElem = document['getElementById']('boot-screen');
    preBootOverlay && bootScreenElem && setTimeout(() => {
        if (preBootOverlay['parentNode']) preBootOverlay['parentNode']['removeChild'](preBootOverlay);
        bootScreenElem['classList']['add']('boot-fade-in');
    }, 0x3e8);
});