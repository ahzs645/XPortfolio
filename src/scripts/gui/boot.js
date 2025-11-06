import {
    initializeSystemAudio,
    getLoginSound,
    getLogoffSound,
    getBalloonSound
} from '../utils/audioManager.js';
import { PortfolioManager } from '../../libs/portfolio/portfolioManager.js';

let SYSTEM_ASSETS = null;
let portfolioManager = null;

async function getPortfolioManager() {
    if (!portfolioManager) {
        portfolioManager = new PortfolioManager();
        await portfolioManager.initialize();
    }
    return portfolioManager;
}

async function getSystemAssets() {
    if (SYSTEM_ASSETS) return SYSTEM_ASSETS;
    try {
        const portfolio = await getPortfolioManager();
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
        SYSTEM_ASSETS = {
            loading: './assets/gui/boot/xp.svg',
            userIcon: './assets/gui/boot/xp.svg',
            wallpaperDesktop: './assets/gui/bgs/blissorg.jpeg',
            wallpaperMobile: './assets/gui/bgs/blissorg.jpeg',
            balloon: {
                title: 'Welcome',
                body: 'Dynamic assets unavailable.'
            }
        };
        return SYSTEM_ASSETS;
    }
}

export function initBootSequence(eventBus, EVENTS, projectsData) {
    const bootScreen = document.getElementById('boot-screen');
    const loginScreen = document.getElementById('login-screen');
    const desktopElement = document.querySelector('.desktop');
    const scanlineOverlay = document.querySelector('.crt-scanline');
    const vignetteOverlay = document.querySelector('.crt-vignette');
    const bootDelayMessage = document.getElementById('boot-delay-message');

    let projects = projectsData || [];

    function updateProjectsData(newProjects) {
        projects = newProjects;
    }

    window.updateBootProjectsData = updateProjectsData;

    const urlParams = new URLSearchParams(window.location.search);
    const forceBoot = urlParams.get('forceBoot') === 'true';
    const logoffDialog = document.getElementById('logoff-dialog-container');
    const logoffButton = document.getElementById('logoff-log-off-btn');
    const switchUserButton = document.getElementById('logoff-switch-user-btn');
    const cancelButton = document.getElementById('logoff-cancel-btn');

    let grayscaleTimeout = null;
    let logoffMode = 'logOff';

    initializeSystemAudio();

    let audioUnlocked = false;

    const unlockAudio = () => {
        if (audioUnlocked) return;
        audioUnlocked = true;

        const audioElement = new Audio();
        audioElement.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
        audioElement.volume = 0.01;

        audioElement.play().then(() => {
            audioElement.pause();
            audioElement.remove();
        }).catch(() => {});
    };

    document.addEventListener('touchstart', unlockAudio, { once: true });
    document.addEventListener('mousedown', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });

    if (forceBoot) {
        const newPath = window.location.pathname + window.location.hash;
        history.replaceState({}, document.title, newPath);
        sessionStorage.removeItem('logged_in');
        showBoot(projects);
    } else {
        const loggedIn = sessionStorage.getItem('logged_in') === 'true';
        if (loggedIn) {
            showDesktop();
        } else {
            showBoot(projects);
        }
    }

    function showDesktop() {
        bootScreen.style.display = 'none';
        loginScreen.style.display = 'none';
        desktopElement.style.opacity = '1';
        desktopElement.style.pointerEvents = 'auto';

        if (bootDelayMessage) {
            bootDelayMessage.style.display = 'none';
        }

        if (window.__MARK_BOOT_COMPLETE) {
            window.__MARK_BOOT_COMPLETE();
        }

        if (window.initializeUIComponents) {
            window.initializeUIComponents();
        }
    }

    function showBoot(projectList) {
        setTimeout(async () => {
            desktopElement.style.opacity = '0';
            desktopElement.style.pointerEvents = 'none';

            if (scanlineOverlay) {
                scanlineOverlay.style.display = 'none';
            }
            if (vignetteOverlay) {
                vignetteOverlay.style.display = 'none';
            }

            if (!bootScreen) return;

            const assets = await getSystemAssets();
            const bootLogo = document.getElementById('boot-logo');

            if (bootLogo && assets && assets.loading) {
                bootLogo.src = assets.loading;
            }

            bootScreen.style.display = 'flex';
            bootScreen.style.opacity = '1';
            bootScreen.style.pointerEvents = 'auto';

            const showDelayMessage = () => {
                if (bootScreen.style.display === 'flex' && bootDelayMessage && !resourcesReady) {
                    bootDelayMessage.style.opacity = '0';
                    bootDelayMessage.style.transition = 'opacity 0.5s ease-in-out';
                    bootDelayMessage.style.display = 'block';
                    void bootDelayMessage.offsetWidth;
                    bootDelayMessage.style.opacity = '1';
                }
            };

            let minimumDelayPassed = false;
            let resourcesReady = false;

            const minimumBootDelay = 3750; // 0xea6

            const checkResources = async () => {
                try {
                    if (!assets || Object.keys(assets).length === 0) return false;

                    const preloadImages = [
                        assets.wallpaperDesktop || null,
                        assets.wallpaperMobile || null,
                        './assets/gui/desktop/about.webp',
                        './assets/gui/desktop/projects.webp',
                        './assets/gui/desktop/contact.webp',
                        './assets/gui/desktop/resume.svg',
                        './assets/gui/taskbar/start-button.webp',
                        './assets/gui/taskbar/taskbar-bg.webp',
                        './assets/gui/taskbar/system-tray.webp'
                    ].filter(src => !!src);

                    const imagePromises = preloadImages.map(src => {
                        return new Promise(resolve => {
                            const img = new Image();
                            img.onload = () => resolve(true);
                            img.onerror = () => resolve(false);
                            img.src = src;
                        });
                    });

                    const loadResults = await Promise.all(imagePromises);
                    const allLoaded = loadResults.every(loaded => loaded);
                    const hasProjectData = typeof window.updateBootProjectsData === 'function';

                    return allLoaded && hasProjectData;
                } catch (resourceError) {
                    console.warn('Resource check failed:', resourceError);
                    return false;
                }
            };

            const startTransitionIfReady = () => {
                if (minimumDelayPassed && resourcesReady) {
                    transitionToLogin();
                }
            };

            setTimeout(() => {
                minimumDelayPassed = true;
                if (!resourcesReady) {
                    showDelayMessage();
                }
                startTransitionIfReady();
            }, minimumBootDelay);

            const pollResourceLoad = async () => {
                resourcesReady = await checkResources();
                if (resourcesReady) {
                    startTransitionIfReady();
                } else {
                    setTimeout(pollResourceLoad, 100); // 0x64
                }
            };

            pollResourceLoad();

            const transitionToLogin = () => {
                if (bootDelayMessage && bootDelayMessage.parentNode) {
                    bootDelayMessage.parentNode.removeChild(bootDelayMessage);
                }

                bootScreen.classList.remove('boot-fade-in');

                setTimeout(() => {
                    const fadeOverlay = document.getElementById('boot-fadeout-overlay');
                    if (fadeOverlay) {
                        fadeOverlay.style.display = 'block';
                        void fadeOverlay.offsetWidth;
                        fadeOverlay.style.transition = 'opacity 0.5s';
                        fadeOverlay.style.opacity = '1';

                        setTimeout(() => {
                            bootScreen.style.display = 'none';
                            loginScreen.style.display = 'flex';
                            loginScreen.style.opacity = '1';
                            loginScreen.style.pointerEvents = 'auto';

                            const loginScreenInnerEl = loginScreen.querySelector('.login-screen');
                            if (loginScreenInnerEl) {
                                loginScreenInnerEl.style.opacity = '1';
                            }

                            setupLoginHandlers(projectList);

                            fadeOverlay.style.opacity = '0';

                            if (bootDelayMessage && bootDelayMessage.parentNode) {
                                bootDelayMessage.parentNode.removeChild(bootDelayMessage);
                            }

                            setTimeout(() => {
                                fadeOverlay.style.display = 'none';
                            }, 500); // 0x1f4
                        }, 1150); // 0x47e
                    }
                }, 250); // 0xfa
            };
        }, 1000); // 0x3e8
    }

    function showLoginAnimation() {
        const loginScreenElement = loginScreen.querySelector('.login-screen');
        const welcomeMessage = loginScreen.querySelector('.welcome-message');

        const loginFadeElements = [
            loginScreenElement.querySelector('.login-screen-center'),
            loginScreenElement.querySelector('.back-gradient'),
            loginScreenElement.querySelector('.turn-off'),
            loginScreenElement.querySelector('.right-bottom'),
            loginScreenElement.querySelector('.xp-logo-image'),
            loginScreenElement.querySelector('.left-text'),
            loginScreenElement.querySelector('.login-separator.mobile-only')
        ];

        loginFadeElements.forEach(elem => {
            if (elem) {
                elem.style.transition = 'opacity 0.3s';
                elem.style.opacity = '0';
            }
        });

        setTimeout(() => {
            loginFadeElements.forEach(elem2 => {
                if (elem2) {
                    elem2.style.display = 'none';
                }
            });

            welcomeMessage.style.display = 'block';
            welcomeMessage.classList.remove('welcome-message-initial-hidden');

            import('../utils/frameScheduler.js').then(({ scheduleAfter }) => {
                scheduleAfter(() => {
                    welcomeMessage.classList.add('visible');
                });
            });

            setTimeout(() => {
                welcomeMessage.classList.remove('visible');
                loginScreen.style.display = 'none';
                loginScreen.style.pointerEvents = 'none';
                desktopElement.style.opacity = '1';
                desktopElement.style.pointerEvents = 'auto';

                if (scanlineOverlay) {
                    scanlineOverlay.style.display = 'block';
                }
                if (vignetteOverlay) {
                    vignetteOverlay.style.display = 'block';
                }

                if (window.__MARK_BOOT_COMPLETE) {
                    window.__MARK_BOOT_COMPLETE();
                }

                const loginSound = getLoginSound();
                if (loginSound) {
                    loginSound.pause();
                    loginSound.currentTime = 0;
                    loginSound.volume = 1;

                    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
                    const playDelay = isFirefox ? 50 : 10; // 0x32 : 0xa

                    setTimeout(() => {
                        loginSound.play().catch(() => {});
                    }, playDelay);

                    setTimeout(() => {
                        const balloonSound = getBalloonSound();
                        if (balloonSound) {
                            balloonSound.volume = 0.01;
                            balloonSound.currentTime = 0;
                            balloonSound.play().then(() => {
                                balloonSound.pause();
                                balloonSound.currentTime = 0;
                                balloonSound.volume = 1;
                            }).catch(() => {
                                balloonSound.volume = 1;
                            });
                        }
                    }, 50); // 0x32

                    setTimeout(() => {
                        if (!document.getElementById('balloon-root')) {
                            import('./taskbar.js').then(({ showWelcomeBalloon }) => {
                                showWelcomeBalloon();
                            });
                        }
                    }, 4800); // 0x12c0
                } else {
                    setTimeout(() => {
                        if (!document.getElementById('balloon-root')) {
                            import('./taskbar.js').then(({ showWelcomeBalloon: showWelcomeBalloonAlt }) => {
                                showWelcomeBalloonAlt();
                            });
                        }
                    }, 1000); // 0x3e8
                }

                sessionStorage.setItem('logged_in', 'true');
                window._logoffEnableTime = Date.now() + 4500; // 0x1194
            }, 2000); // 0x7d0
        }, 300); // 0x12c
    }

    window.addEventListener('message', messageEvent => {
        if (messageEvent.data?.type === 'shutdownRequest') {
            if (eventBus && EVENTS) {
                eventBus.publish(EVENTS.SHUTDOWN_REQUESTED);
            }
        }
    });

    if (!eventBus || !EVENTS) return;

    eventBus.subscribe(EVENTS.LOG_OFF_CONFIRMATION_REQUESTED, data => {
        logoffMode = data?.dialogType || 'logOff';
        openLogoffDialog();
    });

    async function openLogoffDialog() {
        if (!logoffDialog) return;

        const headerText = logoffDialog.querySelector('.logoff-dialog-header-text');
        const logoffConfirmButton = logoffDialog.querySelector('#logoff-log-off-btn');
        const logoffButtonImage = logoffConfirmButton?.querySelector('img');
        const logoffButtonLabel = logoffConfirmButton?.querySelector('span');

        if (logoffMode === 'shutDown') {
            if (headerText) {
                try {
                    const portfolio = await getPortfolioManager();
                    headerText.textContent = `Turn off ${portfolio.getOSName()}`;
                } catch (error) {
                    headerText.textContent = 'Turn off XP';
                }
            }

            if (logoffButtonLabel) {
                logoffButtonLabel.textContent = 'Shut Down';
            }
            if (logoffButtonImage) {
                logoffButtonImage.src = 'assets/gui/start-menu/shutdown.webp';
            }

            if (logoffConfirmButton) {
                logoffConfirmButton.style.opacity = '0.6';
                logoffConfirmButton.style.pointerEvents = 'none';
            }
        } else {
            if (headerText) {
                try {
                    const portfolio = await getPortfolioManager();
                    headerText.textContent = `Log Off ${portfolio.getOSName()}`;
                } catch (error) {
                    headerText.textContent = 'Log Off XP';
                }
            }

            if (logoffButtonLabel) {
                logoffButtonLabel.textContent = 'Log Off';
            }
            if (logoffButtonImage) {
                logoffButtonImage.src = 'assets/gui/start-menu/logoff.webp';
            }

            if (logoffConfirmButton) {
                logoffConfirmButton.style.opacity = '';
                logoffConfirmButton.style.pointerEvents = '';
            }
        }

        logoffDialog.classList.remove('logoff-dialog-hidden');
        logoffDialog.classList.add('visible');

        if (switchUserButton) {
            switchUserButton.style.opacity = '';
            switchUserButton.style.pointerEvents = '';
            switchUserButton.classList.remove('disabled');
        }

        if (logoffConfirmButton && logoffMode === 'logOff') {
            const now = Date.now();
            const enableTimestamp = window._logoffEnableTime || 0;

            if (now < enableTimestamp) {
                logoffConfirmButton.classList.add('logoff-button-timed-disable');
                logoffConfirmButton.style.pointerEvents = 'none';
                logoffConfirmButton.style.opacity = '0.6';

                setTimeout(() => {
                    if (logoffConfirmButton && logoffDialog.classList.contains('visible') && logoffMode === 'logOff') {
                        logoffConfirmButton.classList.remove('logoff-button-timed-disable');
                        logoffConfirmButton.style.pointerEvents = '';
                        logoffConfirmButton.style.opacity = '';
                    }
                }, enableTimestamp - now);
            } else {
                logoffConfirmButton.classList.remove('logoff-button-timed-disable');
                logoffConfirmButton.style.pointerEvents = '';
                logoffConfirmButton.style.opacity = '';
            }
        }

        clearTimeout(grayscaleTimeout);
        grayscaleTimeout = setTimeout(() => {
            document.body.classList.add('screen-grayscale-active');
        }, 700); // 0x2bc
    }

    function closeLogoffDialog() {
        if (!logoffDialog) return;

        logoffDialog.classList.remove('visible');
        logoffDialog.classList.add('logoff-dialog-hidden');
        document.body.classList.remove('screen-grayscale-active');
        clearTimeout(grayscaleTimeout);
    }

    if (logoffButton) {
        const handleLogoffClick = event => {
            event.stopPropagation();

            const isDisabled = logoffButton.style.opacity === '0.6' || logoffButton.style.pointerEvents === 'none';
            if (isDisabled) return;

            closeLogoffDialog();

            if (logoffMode === 'shutDown') {
                return;
            } else {
                eventBus.publish(EVENTS.LOG_OFF_REQUESTED);
            }
        };

        if (!logoffButton._logOffActionAttached) {
            logoffButton.addEventListener('click', handleLogoffClick);
            logoffButton.addEventListener('keydown', keyEvt => {
                if (keyEvt.key === 'Enter' || keyEvt.key === ' ') {
                    keyEvt.preventDefault();
                    handleLogoffClick(keyEvt);
                }
            });
            logoffButton._logOffActionAttached = true;
        }
    }

    if (switchUserButton) {
        const handleSwitchUser = event2 => {
            event2.stopPropagation();
            closeLogoffDialog();
            sessionStorage.removeItem('logged_in');
            window.location.reload();
        };

        if (!switchUserButton._restartActionAttached) {
            switchUserButton.addEventListener('click', handleSwitchUser);
            switchUserButton.addEventListener('keydown', keyEvent => {
                if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                    keyEvent.preventDefault();
                    handleSwitchUser(keyEvent);
                }
            });
            switchUserButton._restartActionAttached = true;
        }
    }

    if (cancelButton) {
        const handleCancel = () => {
            closeLogoffDialog();
        };

        if (!cancelButton._cancelActionAttached) {
            cancelButton.addEventListener('click', handleCancel);
            cancelButton._cancelActionAttached = true;
        }
    }

    const handleEscKey = event => {
        if (event.key === 'Escape' && logoffDialog && logoffDialog.classList.contains('visible')) {
            closeLogoffDialog();
        }
    };

    document.addEventListener('keydown', handleEscKey);

    eventBus.subscribe(EVENTS.LOG_OFF_REQUESTED, () => {
        try {
            const logoffSound = getLogoffSound();
            if (logoffSound) {
                logoffSound.pause();
                logoffSound.currentTime = 0;

                const isFirefoxFlag = navigator.userAgent.toLowerCase().includes('firefox');
                const soundDelay = isFirefoxFlag ? 50 : 10; // 0x32 : 0xa

                setTimeout(() => {
                    logoffSound.play().catch(() => {});
                }, soundDelay);
            }
        } catch (logoffError) {}

        try {
            if (eventBus && EVENTS && EVENTS.MEDIA_GLOBAL_PAUSE) {
                eventBus.publish(EVENTS.MEDIA_GLOBAL_PAUSE, { reason: 'logoff' });
            } else if (window.eventBus && window.EVENTS && window.EVENTS.MEDIA_GLOBAL_PAUSE) {
                window.eventBus.publish(window.EVENTS.MEDIA_GLOBAL_PAUSE, { reason: 'logoff' });
            }
        } catch (pauseError) {}

        loginScreen.style.display = 'flex';
        loginScreen.style.opacity = '1';
        loginScreen.style.pointerEvents = 'auto';

        const loginScreenInner = loginScreen.querySelector('.login-screen');
        if (loginScreenInner) {
            loginScreenInner.style.opacity = '1';

            const loginElementsArray = [
                loginScreenInner.querySelector('.login-screen-center'),
                loginScreenInner.querySelector('.back-gradient'),
                loginScreenInner.querySelector('.turn-off'),
                loginScreenInner.querySelector('.right-bottom'),
                loginScreenInner.querySelector('.xp-logo-image'),
                loginScreenInner.querySelector('.left-text'),
                loginScreenInner.querySelector('hr.login-separator'),
                loginScreenInner.querySelector('.login-separator.mobile-only'),
                loginScreen.querySelector('.welcome-message')
            ];

            loginElementsArray.forEach(item => {
                if (item) {
                    item.style.display = '';
                    item.style.opacity = '1';

                    if (item.classList.contains('welcome-message')) {
                        item.classList.remove('visible');
                        item.style.display = 'none';
                    }
                }
            });
        }

        desktopElement.style.opacity = '0';
        desktopElement.style.pointerEvents = 'none';
        sessionStorage.removeItem('logged_in');

        if (scanlineOverlay) {
            scanlineOverlay.style.display = 'none';
        }
        if (vignetteOverlay) {
            vignetteOverlay.style.display = 'none';
        }

        try {
            import('./taskbar.js').then(({ hideBalloon }) => {
                hideBalloon(true);
            });
        } catch (hideError) {}

        (window.batchedPublish || eventBus.publish).call(
            window.batchedPublish ? undefined : eventBus,
            EVENTS.STARTMENU_CLOSE_REQUEST,
            { __coalesce: true }
        );

        setupLoginHandlers(projects);
    });

    function setupLoginHandlers(projectData) {
        const backGradient = document.querySelector('.back-gradient');

        if (backGradient && !backGradient._loginHandlerAttached) {
            backGradient.addEventListener('click', function() {
                backGradient.classList.add('active');
                showLoginAnimation(projectData);
            });
            backGradient._loginHandlerAttached = true;
        }

        const shutdownIcon = document.getElementById('shutdown-icon');

        if (shutdownIcon && !shutdownIcon._shutdownHandlerAttached) {
            shutdownIcon.addEventListener('click', () => {
                if (eventBus && EVENTS) {
                    eventBus.publish(EVENTS.LOG_OFF_CONFIRMATION_REQUESTED, { dialogType: 'shutDown' });
                }
            });
            shutdownIcon._shutdownHandlerAttached = true;
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const assets = await getSystemAssets();
    const logoImg = document.getElementById('boot-logo');

    if (logoImg && assets.loading) {
        logoImg.src = assets.loading;
    }

    document.querySelectorAll('.xp-logo-image').forEach(xpLogoImg => {
        if (assets.loading) {
            xpLogoImg.src = assets.loading;
        }
    });

    document.querySelectorAll('.login-screen .user').forEach(userContainer => {
        const iconSrc = assets.userIcon || './assets/gui/boot/xp.svg';

        if (iconSrc) {
            let img = userContainer.querySelector('img');
            if (!img) {
                img = document.createElement('img');
                img.alt = 'User Profile';
                img.draggable = false;
                img.decoding = 'async';
                userContainer.appendChild(img);
            }
            img.src = iconSrc;
            userContainer.style.display = '';
        } else {
            userContainer.innerHTML = '';
            userContainer.style.display = 'none';
        }
    });

    try {
        const portfolio = await getPortfolioManager();
        const fullName = portfolio.getFullName();
        const profession = portfolio.getProfession();

        document.querySelectorAll('.login-screen .name').forEach(element => {
            element.textContent = fullName;
        });

        document.querySelectorAll('.login-instruction-name').forEach(element2 => {
            element2.textContent = fullName;
        });

        document.querySelectorAll('.user-title').forEach(element => {
            element.textContent = profession;
        });
    } catch (portfolioError) {
        console.error('Failed to load portfolio data for login screen:', portfolioError);
    }

    const preBootOverlay = document.getElementById('pre-boot-overlay');
    const bootScreenElem = document.getElementById('boot-screen');

    if (preBootOverlay && bootScreenElem) {
        setTimeout(() => {
            if (preBootOverlay.parentNode) {
                preBootOverlay.parentNode.removeChild(preBootOverlay);
            }
            bootScreenElem.classList.add('boot-fade-in');
        }, 1000); // 0x3e8
    }
});
