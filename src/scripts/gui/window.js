import programRegistry from '../utils/programRegistry.js';
import { EVENTS } from '../utils/eventBus.js';
import { isFirefox } from '../utils/device.js';
import systemLoadingManager from '../utils/systemLoadingManager.js';
import { PortfolioManager } from '../../libs/portfolio/portfolioManager.js';
import {
    WindowTemplates,
    positionWindow,
    makeDraggable,
    makeResizable,
    updateStackOrder,
    applyZIndices,
    viewportInternals,
    lifecycleInternals,
} from './windowInternals.js';

export default class WindowManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.windows = {};
        this.activeWindow = null;
        this.taskbarItems = {};
        this.windowCount = 0;
        this.programData = programRegistry;
        this.baseZIndex = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--z-window')
        ) || 100;
        this.portfolioManager = null;
        this.windowsContainer = document.getElementById('windows-container');
        this.taskbarPrograms = document.querySelector('.taskbar-programs');
        this.zIndexStack = [];
        this._cachedTaskbarHeight = null;
        this._cachedViewportDimensions = null;
        this._cachedTaskbarElement = null;
        this._setupGlobalHandlers();
        this._subscribeToEvents();

        window.addEventListener('resize', () => {
            this._handleViewportChange();
        });

        window.addEventListener('message', messageEvent => {
            if (!this._toggleButtonState) {
                this._toggleButtonState = (button, enabled) => {
                    if (!button) return;
                    if (enabled) {
                        button.classList.remove('disabled');
                        button.disabled = false;
                    } else {
                        button.classList.add('disabled');
                        button.disabled = true;
                    }
                };
            }

            if (messageEvent.data && messageEvent.data.type === 'ui:home-enabled') {
                const targetWindow = this._findWindowByIframe(messageEvent.source);
                if (targetWindow) {
                    const homeButton = targetWindow.querySelector('.toolbar-button.home');
                    this._toggleButtonState(homeButton, messageEvent.data.enabled);
                }
            }

            if (messageEvent.data && messageEvent.data.type === 'nav:enabled') {
                const navWindow = this._findWindowByIframe(messageEvent.source);
                if (navWindow) {
                    const previousButton = navWindow.querySelector('.toolbar-button.previous');
                    const nextButton = navWindow.querySelector('.toolbar-button.next');
                    this._toggleButtonState(previousButton, messageEvent.data.enabled);
                    this._toggleButtonState(nextButton, messageEvent.data.enabled);
                }
            }

            if (messageEvent.data && messageEvent.data.type === 'throttle-nav-buttons') {
                this.projectNavigationDisabled = messageEvent.data.active;
                const projectsWindow = this.windows['projects-window'];
                if (projectsWindow) {
                    const backBtn = projectsWindow.querySelector('.toolbar-button.previous');
                    const forwardBtn = projectsWindow.querySelector('.toolbar-button.next');
                    if (this.projectNavigationDisabled) {
                        this._toggleButtonState(backBtn, false);
                        this._toggleButtonState(forwardBtn, false);
                    }
                }
            }

            if (messageEvent.data && messageEvent.data.type === 'open-app') {
                if (messageEvent.data.appName) {
                    this.openProgram(messageEvent.data.appName);
                }
            }

            if (messageEvent.data && messageEvent.data.type === 'set-external-link-enabled') {
                const linkWindow = this._findWindowByIframe(messageEvent.source);
                if (linkWindow) {
                    const externalLinkButton = linkWindow.querySelector('.toolbar-button.viewExternalLink');
                    if (externalLinkButton) {
                        this._toggleButtonState(externalLinkButton, messageEvent.data.enabled);
                        if (messageEvent.data.enabled) {
                            externalLinkButton.style.display = '';
                            if (messageEvent.data.url) {
                                externalLinkButton.dataset.urlToOpen = messageEvent.data.url;
                            }
                        } else {
                            externalLinkButton.style.display = 'none';
                            delete externalLinkButton.dataset.urlToOpen;
                        }
                    }
                }
            }

            if (messageEvent.data && messageEvent.data.type === 'update-status-bar') {
                const statusWindow = this._findWindowByIframe(messageEvent.source);
                if (statusWindow && statusWindow.statusBarField) {
                    statusWindow.statusBarField.textContent = messageEvent.data.text;
                }
            }

            if (messageEvent.data && messageEvent.data.type === 'toolbar:zoom-state') {
                const zoomWindow = this._findWindowByIframe(messageEvent.source);
                if (zoomWindow) {
                    const zoomButton = zoomWindow.querySelector('.toolbar-button.zoom');
                    if (zoomButton) {
                        if (messageEvent.data.active) {
                            zoomButton.classList.add('pressed');
                        } else {
                            zoomButton.classList.remove('pressed');
                        }
                    }
                }
            }

            if (messageEvent.data && messageEvent.data.type === 'update-overlay-button-state') {
                const overlayWindow = this._findWindowByIframe(messageEvent.source);
                if (overlayWindow) {
                    const overlayButton = overlayWindow.querySelector('.toolbar-button.search, .toolbar-button.overlayToggleMobile, .toolbar-button.overlaysToggle');
                    if (overlayButton) {
                        if (messageEvent.data.active) {
                            overlayButton.classList.add('touch-active');
                        } else {
                            overlayButton.classList.remove('touch-active');
                        }
                    }
                }
            }

            if (messageEvent.data && messageEvent.data.type === 'update-address-bar') {
                const addressWindow = this._findWindowByIframe(messageEvent.source);
                if (addressWindow) {
                    const addressBarTitle = addressWindow.querySelector('.addressbar-title');
                    if (addressBarTitle && messageEvent.data.title) {
                        addressBarTitle.textContent = messageEvent.data.title;
                    }
                }
            }

            // Security check for message origin
            if (!(window.location.protocol === 'file:' || messageEvent.origin === window.origin)) return;

            if (messageEvent.data && messageEvent.data.type === 'contact:form-state') {
                let contactWindow = null;
                for (const windowKey in this.windows) {
                    const candidate = this.windows[windowKey];
                    const iframe = candidate.querySelector('iframe');
                    if (iframe && iframe.contentWindow === messageEvent.source) {
                        contactWindow = candidate;
                        break;
                    }
                }
                if (contactWindow) {
                    const sendButton = contactWindow.querySelector('.toolbar-button.send');
                    const newButton = contactWindow.querySelector('.toolbar-button.new');
                    this._toggleButtonState(sendButton, messageEvent.data.hasValue);
                    this._toggleButtonState(newButton, messageEvent.data.hasValue);
                }
            }

            let sourceWindow = null;
            if (messageEvent.data?.type === 'window:iframe-interaction' && messageEvent.data.windowId) {
                sourceWindow = document.getElementById(messageEvent.data.windowId);
            }

            if (!sourceWindow) {
                sourceWindow = Array.from(document.querySelectorAll('.app-window')).find(candidateWindow => {
                    const candidateIframe = candidateWindow.querySelector('iframe');
                    return candidateIframe && candidateIframe.contentWindow === messageEvent.source;
                });
            }

            if (!sourceWindow && messageEvent.data?.type === 'window:iframe-interaction') {
                sourceWindow = Array.from(document.querySelectorAll('.app-window')).find(contactCandidate => {
                    const contactIframe = contactCandidate.querySelector('iframe');
                    return contactIframe && contactIframe.src.includes('contact.html');
                });
            }

            if (!sourceWindow) return;

            if (messageEvent.data?.type === 'window:iframe-interaction') {
                const customEventOptions = { bubbles: false };
                sourceWindow.dispatchEvent(new CustomEvent('window:iframe-interaction', customEventOptions));
                return;
            }

            // Window sizing and drag messages from apps (Winamp/Minesweeper)
            if (messageEvent.data?.type === 'resize-window-to') {
                const { width, height } = messageEvent.data;
                if (typeof width === 'number' && typeof height === 'number') {
                    sourceWindow.style.width = Math.max(160, Math.ceil(width)) + 'px';
                    sourceWindow.style.height = Math.max(160, Math.ceil(height)) + 'px';
                }
                return;
            }

            if (messageEvent.data?.type === 'fit-content-size') {
                const iframe = sourceWindow.querySelector('iframe');
                if (iframe && typeof messageEvent.data.width === 'number' && typeof messageEvent.data.height === 'number') {
                    const winRect = sourceWindow.getBoundingClientRect();
                    const iframeRect = iframe.getBoundingClientRect();
                    const chromeW = winRect.width - iframeRect.width;
                    const chromeH = winRect.height - iframeRect.height;
                    const w = Math.max(160, Math.ceil(messageEvent.data.width + chromeW));
                    const h = Math.max(160, Math.ceil(messageEvent.data.height + chromeH));
                    sourceWindow.style.width = w + 'px';
                    sourceWindow.style.height = h + 'px';
                }
                return;
            }

            if (messageEvent.data?.type === 'winamp-drag-start' || messageEvent.data?.type === 'winamp-drag-move' || messageEvent.data?.type === 'winamp-drag-end') {
                const iframe = sourceWindow.querySelector('iframe');
                if (!iframe) return;
                const r = iframe.getBoundingClientRect();
                if (messageEvent.data.type === 'winamp-drag-start') {
                    const x = r.left + (messageEvent.data.clientX || 0);
                    const y = r.top + (messageEvent.data.clientY || 0);
                    const winRect = sourceWindow.getBoundingClientRect();
                    this._extDrag = { targetWindow: sourceWindow, offsetX: x - winRect.left, offsetY: y - winRect.top };
                } else if (messageEvent.data.type === 'winamp-drag-move' && this._extDrag && this._extDrag.targetWindow === sourceWindow) {
                    const x = r.left + (messageEvent.data.clientX || 0);
                    const y = r.top + (messageEvent.data.clientY || 0);
                    sourceWindow.style.left = Math.round(x - this._extDrag.offsetX) + 'px';
                    sourceWindow.style.top = Math.round(y - this._extDrag.offsetY) + 'px';
                } else if (messageEvent.data.type === 'winamp-drag-end') {
                    this._extDrag = null;
                }
                return;
            }

            if (messageEvent.data?.type === 'minimize-window') {
                this.minimizeWindow(sourceWindow);
            } else if (messageEvent.data?.type === 'close-window') {
                this.closeWindow(sourceWindow);
            } else if (messageEvent.data?.type === 'updateStatusBar' && typeof messageEvent.data.text === 'string') {
                if (sourceWindow.statusBarField) {
                    sourceWindow.statusBarField.textContent = messageEvent.data.text;
                }
            }

            if (messageEvent.data && messageEvent.data.type === 'project:view-state') {
                const projectsWindow = this.windows['projects-window'];
                let homeBtn, backBtn, forwardBtn, overlayToggleButton;
                if (projectsWindow) {
                    homeBtn = projectsWindow.querySelector('.toolbar-button.home');
                    backBtn = projectsWindow.querySelector('.toolbar-button.previous');
                    forwardBtn = projectsWindow.querySelector('.toolbar-button.next');
                    overlayToggleButton = projectsWindow.querySelector('.toolbar-button.search, .toolbar-button.overlayToggleMobile, .toolbar-button.overlaysToggle');
                }
                homeBtn && this._toggleButtonState(homeBtn, messageEvent.data.inDetailView);
                backBtn && this._toggleButtonState(backBtn, messageEvent.data.inDetailView && messageEvent.data.hasPrevious);
                forwardBtn && this._toggleButtonState(forwardBtn, messageEvent.data.inDetailView && messageEvent.data.hasNext);
                overlayToggleButton && this._toggleButtonState(overlayToggleButton, !messageEvent.data.inDetailView);
            }
        });

        const globalHomeButton = document.querySelector('.toolbar-button.home');
        if (globalHomeButton) {
            globalHomeButton.addEventListener('click', () => {
                if (!globalHomeButton.classList.contains('disabled')) {
                    const projectsElement = document.getElementById('projects-window');
                    const projectsIframe = projectsElement ? projectsElement.querySelector('iframe') : null;
                    if (projectsIframe && projectsIframe.contentWindow) {
                        const actionMessage = { type: 'toolbar:action', action: 'home' };
                        projectsIframe.contentWindow.postMessage(actionMessage, '*');
                    }
                }
            });
        }
    }

    _createElement(tagName, className = '', attributes = {}) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    _isMobileDevice() {
        return document.documentElement.classList.contains('mobile-device');
    }

    _findWindowByIframe(iframeWindow) {
        for (const windowKey in this.windows) {
            const windowElement = this.windows[windowKey];
            const iframes = windowElement.querySelectorAll('iframe');
            for (const iframe of iframes) {
                if (iframe.contentWindow === iframeWindow) return windowElement;
            }
        }
        return null;
    }

    _setupGlobalHandlers() {
        document.addEventListener('mousedown', event => {
            const clickedOnDesktop = event.target.classList.contains('desktop') || event.target.classList.contains('selection-overlay');
            if (clickedOnDesktop && !event.target.closest('.window')) {
                if (this.activeWindow) {
                    this.deactivateAllWindows();
                }
            }
        }, true);
    }

    _subscribeToEvents() {
        this.eventBus.subscribe(EVENTS.PROGRAM_OPEN, eventData => {
            if (eventData.programName === 'mediaPlayer' && !eventData.skipLoading) {
                this.openMediaPlayerWithLoading();
            } else if (eventData.programName === 'musicPlayer' && !eventData.skipLoading) {
                this.openMusicPlayerWithLoading();
            } else if (eventData.programName === 'paint' && !eventData.skipLoading) {
                this.openPaintWithLoading();
            } else {
                this.openProgram(eventData.programName, eventData);
            }
        });

        this.eventBus.subscribe(EVENTS.WINDOW_FOCUSED, data => this._handleWindowFocus(data.windowId));
        this.eventBus.subscribe(EVENTS.WINDOW_MINIMIZED, data => this._handleWindowMinimize(data.windowId));
        this.eventBus.subscribe(EVENTS.WINDOW_CLOSED, data => this._handleWindowCloseCleanup(data.windowId));
        this.eventBus.subscribe(EVENTS.WINDOW_RESTORED, data => this._handleWindowRestore(data.windowId));
        this.eventBus.subscribe(EVENTS.TASKBAR_ITEM_CLICKED, data => this._handleTaskbarClick(data.windowId));
        this.eventBus.subscribe(EVENTS.PROGRAM_CLOSE_REQUESTED, data => {
            if (data && data.programId) {
                const windowElement = this.windows[data.programId];
                if (windowElement) {
                    this.closeWindow(windowElement);
                }
            }
        });
    }

    _calculateWindowToTaskbarTransform(windowElement, taskbarItem) {
        return lifecycleInternals.calculateWindowToTaskbarTransform(windowElement, taskbarItem);
    }

    openPaintWithLoading() {
        const loadingId = 'paint-' + Date.now();
        systemLoadingManager.startLoading(loadingId);
        const paintProgram = this.programData.paint;
        if (!paintProgram) {
            systemLoadingManager.endLoading(loadingId);
            return;
        }

        let existingWindow = document.getElementById(paintProgram.id);
        if (existingWindow) {
            systemLoadingManager.endLoading(loadingId);
            if (existingWindow.classList.contains('minimized')) {
                this.restoreWindow(existingWindow);
            } else {
                this.bringToFront(existingWindow);
            }
            return;
        }

        const preloadIframe = document.createElement('iframe');
        preloadIframe.src = paintProgram.appPath;
        preloadIframe.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1px;
      height: 1px;
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    `;
        preloadIframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(preloadIframe);

        const finishLoading = () => {
            if (document.body.contains(preloadIframe)) {
                document.body.removeChild(preloadIframe);
            }
            systemLoadingManager.endLoading(loadingId);
            const openEvent = { programName: 'paint', skipLoading: true };
            this.eventBus.publish(EVENTS.PROGRAM_OPEN, openEvent);
        };

        preloadIframe.onload = finishLoading;
        preloadIframe.onerror = finishLoading;
        setTimeout(() => {
            if (document.body.contains(preloadIframe)) {
                finishLoading();
            }
        }, 5000); // 0x1388
    }

    openMediaPlayerWithLoading() {
        const loadingId = 'mediaPlayer-' + Date.now();
        systemLoadingManager.startLoading(loadingId);
        const mediaProgram = this.programData.mediaPlayer;
        if (!mediaProgram) {
            systemLoadingManager.endLoading(loadingId);
            return;
        }

        let existingWindow = document.getElementById(mediaProgram.id);
        if (existingWindow) {
            systemLoadingManager.endLoading(loadingId);
            if (existingWindow.classList.contains('minimized')) {
                this.restoreWindow(existingWindow);
            } else {
                this.bringToFront(existingWindow);
            }
            return;
        }

        const preloadIframe = document.createElement('iframe');
        preloadIframe.src = mediaProgram.appPath;
        preloadIframe.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1px;
      height: 1px;
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    `;
        preloadIframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(preloadIframe);

        setTimeout(() => {
            if (document.body.contains(preloadIframe)) {
                document.body.removeChild(preloadIframe);
            }
            systemLoadingManager.endLoading(loadingId);
            const openEvent = { programName: 'mediaPlayer', skipLoading: true };
            this.eventBus.publish(EVENTS.PROGRAM_OPEN, openEvent);
        }, 1500); // 0x5dc
    }

    openMusicPlayerWithLoading() {
        const loadingId = 'musicPlayer-' + Date.now();
        systemLoadingManager.startLoading(loadingId);
        const musicProgram = this.programData.musicPlayer;
        if (!musicProgram) {
            systemLoadingManager.endLoading(loadingId);
            return;
        }

        let existingWindow = document.getElementById(musicProgram.id);
        if (existingWindow) {
            systemLoadingManager.endLoading(loadingId);
            if (existingWindow.classList.contains('minimized')) {
                this.restoreWindow(existingWindow);
            } else {
                this.bringToFront(existingWindow);
            }
            return;
        }

        const preloadIframe = document.createElement('iframe');
        preloadIframe.src = musicProgram.appPath;
        preloadIframe.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 1px;
      height: 1px;
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
    `;
        preloadIframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(preloadIframe);

        setTimeout(() => {
            if (document.body.contains(preloadIframe)) {
                document.body.removeChild(preloadIframe);
            }
            const newWindow = this._createWindowElement(musicProgram);
            newWindow.classList.add('window-opening');
            this._registerWindow(newWindow, musicProgram);
            this._setupWindowEvents(newWindow);
            document.getElementById('windows-container').appendChild(newWindow);
            this.positionWindow(newWindow);
            this.bringToFront(newWindow);
            setTimeout(() => {
                if (newWindow) {
                    newWindow.classList.remove('window-opening');
                }
            }, 200); // 0xc8
            systemLoadingManager.endLoading(loadingId);
        }, 500); // 0x1f4
    }

    openProgram(programName, options = {}) {
        // Don't open windows if boot is not complete
        if (!window.__BOOT_COMPLETE) return null;

        if (!programName || !this.programData[programName]) return;

        const programConfig = { ...this.programData[programName] };
        let effectiveConfig = programConfig;

        // Apply Firefox-specific configuration if needed
        if (isFirefox() && effectiveConfig.firefoxConfig) {
            if (document.documentElement.classList.contains('mobile-device')) {
                const { resizable, canMaximize, ...restConfig } = effectiveConfig.firefoxConfig;
                void resizable;
                void canMaximize;
                effectiveConfig = { ...effectiveConfig, ...restConfig };
            } else {
                effectiveConfig = { ...effectiveConfig, ...effectiveConfig.firefoxConfig };
            }
        }

        let existingWindow = document.getElementById(effectiveConfig.id);
        if (existingWindow) {
            if (existingWindow.classList.contains('minimized')) {
                this.restoreWindow(existingWindow);
            } else {
                this.bringToFront(existingWindow);
                this._handleWindowFocus(existingWindow.id);
                // Add subtle bounce effect
                existingWindow.style.transition = 'transform 0.15s ease-out';
                existingWindow.style.transform = 'scale(1.02)';
                setTimeout(() => {
                    if (existingWindow) {
                        existingWindow.style.transform = '';
                        setTimeout(() => {
                            if (existingWindow) {
                                existingWindow.style.transition = '';
                            }
                        }, 150); // 0x96
                    }
                }, 50); // 0x32
            }

            // Handle image viewer initial index
            if (programName === 'image-viewer' && options && typeof options.initialIndex !== 'undefined') {
                const iframe = existingWindow.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    const message = {
                        type: 'set-initial-index',
                        initialIndex: options.initialIndex,
                        projectTitle: options.projectTitle
                    };
                    iframe.contentWindow.postMessage(message, '*');
                }
            }

            return existingWindow;
        }

        // Create new window
        existingWindow = this._createWindowElement(effectiveConfig);
        this._registerWindow(existingWindow, effectiveConfig);
        this._setupWindowEvents(existingWindow);
        document.getElementById('windows-container').appendChild(existingWindow);
        this.positionWindow(existingWindow);

        // Special handling for projects window
        if (effectiveConfig.id === 'projects') {
            existingWindow.style.opacity = '0';
            existingWindow.setAttribute('data-program-loading', 'true');
            const iframe = existingWindow.querySelector('iframe');
            if (iframe) {
                const messageHandler = event => {
                    if (event.source === iframe.contentWindow && event.data && event.data.type === 'projects-ready') {
                        window.removeEventListener('message', messageHandler);
                        clearTimeout(timeout);
                        existingWindow.style.opacity = '1';
                        existingWindow.removeAttribute('data-program-loading');
                        this.bringToFront(existingWindow);
                        this._handleWindowFocus(existingWindow.id);
                    }
                };

                const timeout = setTimeout(() => {
                    window.removeEventListener('message', messageHandler);
                    if (existingWindow.hasAttribute('data-program-loading')) {
                        existingWindow.style.opacity = '1';
                        existingWindow.removeAttribute('data-program-loading');
                        this.bringToFront(existingWindow);
                        this._handleWindowFocus(existingWindow.id);
                    }
                }, 7000); // 0x1b58

                window.addEventListener('message', messageHandler);
            }
            this.bringToFront(existingWindow);
        } else {
            const isCached = window.__IS_IFRAME_CACHED && window.__IS_IFRAME_CACHED(effectiveConfig.id);
            if (isCached) {
                this.bringToFront(existingWindow);
                this._handleWindowFocus(existingWindow.id);

                // Handle image viewer initial index
                if (programName === 'image-viewer' && options && typeof options.initialIndex !== 'undefined') {
                    const iframe = existingWindow.querySelector('iframe');
                    if (iframe && iframe.contentWindow) {
                        const message = {
                            type: 'set-initial-index',
                            initialIndex: options.initialIndex,
                            projectTitle: options.projectTitle
                        };
                        iframe.contentWindow.postMessage(message, '*');
                    }
                }
            } else {
                existingWindow.style.opacity = '0';
                this.bringToFront(existingWindow);
                import('../utils/frameScheduler.js').then(({ scheduleWrite }) => {
                    scheduleWrite(() => {
                        existingWindow.style.transition = 'opacity 0.15s ease-out';
                        existingWindow.style.opacity = '1';
                        this._handleWindowFocus(existingWindow.id);

                        // Handle image viewer initial index
                        if (programName === 'image-viewer' && options && typeof options.initialIndex !== 'undefined') {
                            const iframe = existingWindow.querySelector('iframe');
                            if (iframe) {
                                setTimeout(() => {
                                    if (iframe.contentWindow) {
                                        const message = {
                                            type: 'set-initial-index',
                                            initialIndex: options.initialIndex,
                                            projectTitle: options.projectTitle
                                        };
                                        iframe.contentWindow.postMessage(message, '*');
                                    }
                                }, 500); // 0x1f4
                            }
                        }

                        setTimeout(() => {
                            if (existingWindow) {
                                existingWindow.style.transition = '';
                            }
                        }, 150); // 0x96
                    });
                });
            }
        }

        // Disable toolbar/menubar temporarily on mobile to prevent accidental clicks during animation
        if (document.documentElement.classList.contains('mobile-device')) {
            const menuBar = existingWindow.querySelector('.menu-bar-container');
            const toolbar = existingWindow.querySelector('.toolbar-container');

            if (menuBar) {
                menuBar.style.pointerEvents = 'none';
                menuBar.classList.add('menubar-temporarily-disabled');
            }
            if (toolbar) {
                toolbar.style.pointerEvents = 'none';
                toolbar.classList.add('toolbar-temporarily-disabled');
            }

            existingWindow.dataset.acceptInput = 'false';

            setTimeout(() => {
                if (document.body.contains(existingWindow)) {
                    if (menuBar) {
                        menuBar.style.pointerEvents = 'auto';
                    }
                    if (toolbar) {
                        toolbar.style.pointerEvents = 'auto';
                    }
                }
            }, 500); // 0x1f4

            setTimeout(() => {
                if (document.body.contains(existingWindow)) {
                    existingWindow.dataset.acceptInput = 'true';
                    if (toolbar) {
                        toolbar.classList.remove('toolbar-temporarily-disabled');
                    }
                    if (menuBar) {
                        menuBar.classList.remove('menubar-temporarily-disabled');
                    }
                }
            }, 550); // 0x226
        }

        return existingWindow;
    }

    _createWindowElement(programConfig) {
        const windowElement = this._createElement('div', 'app-window', { id: programConfig.id });
        windowElement.setAttribute('data-program', programConfig.id.replace('-window', ''));
        windowElement.innerHTML = this._getWindowBaseHTML(programConfig);

        const programId = programConfig.id.replace('-window', '');

        // Handle mobile-specific window configuration
        if (document.documentElement.classList.contains('mobile-device')) {
            if (programId === 'musicPlayer' && programConfig.mobileConfig) {
                windowElement.classList.add('mobile-music-player');
                if (programConfig.mobileConfig.dimensions) {
                    if (programConfig.mobileConfig.dimensions.width) {
                        windowElement.style.width = programConfig.mobileConfig.dimensions.width + 'px';
                        windowElement.style.maxWidth = programConfig.mobileConfig.dimensions.width + 'px';
                    }
                    if (programConfig.mobileConfig.dimensions.height) {
                        windowElement.style.height = programConfig.mobileConfig.dimensions.height + 'px';
                    }
                }
                if (programConfig.mobileConfig.draggable === false) {
                    windowElement.setAttribute('data-mobile-no-drag', 'true');
                }
            } else {
                // Maximize all other windows on mobile
                windowElement.classList.add('maximized');
                windowElement.style.position = 'fixed';
                windowElement.style.left = '0';
                windowElement.style.top = '0';
                windowElement.style.width = '100vw';
                windowElement.style.maxWidth = '100vw';
            }

            if (programId !== 'musicPlayer') {
                const maximizeButton = windowElement.querySelector('[data-action="maximize"]');
                if (maximizeButton) {
                    maximizeButton.classList.add('restore');
                    maximizeButton.setAttribute('aria-label', 'Restore');
                    maximizeButton.disabled = true;
                }
            }
        }

        // Get and append window template (content)
        const templateContent = WindowTemplates.getTemplate(programConfig.template, programConfig);
        if (!templateContent) return null;

        windowElement.appendChild(templateContent);
        this._addStartMenuOverlay(windowElement, templateContent);

        // Setup menu bar if present
        const menuBarContainer = templateContent.querySelector('.menu-bar-container');
        if (menuBarContainer && typeof menuBarContainer.setParentWindowElement === 'function') {
            menuBarContainer.setParentWindowElement(windowElement);
        }

        // Add status bar for most windows (except cmd, musicPlayer, mediaPlayer, minesweeper, spider-solitaire)
        const windowType = programConfig.id.replace('-window', '');
        if (windowType !== 'cmd' && windowType !== 'musicPlayer' && windowType !== 'mediaPlayer' && windowType !== 'minesweeper' && windowType !== 'spider-solitaire') {
            const statusBar = this._createElement('div', 'status-bar');
            const statusBarField = this._createElement('p', 'status-bar-field');

            // Handle async status bar text
            if (programConfig.getStatusBarText && typeof programConfig.getStatusBarText === 'function') {
                programConfig.getStatusBarText().then(text => {
                    statusBarField.textContent = text || 'Ready';
                }).catch(() => {
                    statusBarField.textContent = programConfig.statusBarText || 'Ready';
                });
            } else {
                statusBarField.textContent = programConfig.statusBarText || 'Ready';
            }

            statusBar.appendChild(statusBarField);
            windowElement.appendChild(statusBar);
            windowElement.statusBarField = statusBarField;
        }

        // Set default dimensions (600x400)
        const DEFAULT_WIDTH = 600;  // 0x258
        const DEFAULT_HEIGHT = 400; // 0x190

        if (!windowElement.style.width) {
            windowElement.style.width = (programConfig.dimensions?.width || DEFAULT_WIDTH) + 'px';
        }
        if (!windowElement.style.height) {
            windowElement.style.height = (programConfig.dimensions?.height || DEFAULT_HEIGHT) + 'px';
        }

        windowElement.style.position = 'absolute';

        // Add event listeners for window controls
        windowElement.addEventListener('request-close-window', () => {
            this.closeWindow(windowElement);
        });
        windowElement.addEventListener('request-minimize-window', () => {
            this.minimizeWindow(windowElement);
        });
        windowElement.addEventListener('request-maximize-window', () => {
            this.toggleMaximize(windowElement);
        });

        return windowElement;
    }

    _getWindowBaseHTML(programConfig) {
        const isResizable = programConfig.resizable !== false;
        let resizersHTML = '';

        if (isResizable) {
            resizersHTML = `
            <div class="resizer resizer-n"></div>
            <div class="resizer resizer-ne"></div>
            <div class="resizer resizer-e"></div>
            <div class="resizer resizer-se"></div>
            <div class="resizer resizer-s"></div>
            <div class="resizer resizer-sw"></div>
            <div class="resizer resizer-w"></div>
            <div class="resizer resizer-nw"></div>
      `;
        }

        return `
            <div class="window-inactive-mask"></div>
            <div class="title-bar">
                <div class="title-bar-left">
                    <div class="title-bar-icon">
            <img decoding="async" loading="lazy" src="${programConfig.icon}" alt="${programConfig.title}">
                    </div>
                    <div class="title-bar-text">${programConfig.title}</div>
                </div>
                <div class="title-bar-controls">
                    ${programConfig.canMinimize !== false ? '<button class="xp-button" aria-label="Minimize" data-action="minimize"></button>' : ''}
                    ${programConfig.canMaximize !== false ? '<button class="xp-button" aria-label="Maximize" data-action="maximize"></button>' : ''}
                    <button class="xp-button" aria-label="Close" data-action="close"></button>
                </div>
            </div>
            ${resizersHTML}
        `;
    }

    _addStartMenuOverlay(windowElement, templateContent) {
        const overlay = this._createElement('div', 'start-menu-content-click-overlay');
        const targetElement = templateContent.classList.contains('window-body') ? templateContent : windowElement;

        if (targetElement !== windowElement) {
            targetElement.style.position = 'relative';
        }
        targetElement.appendChild(overlay);
    }

    _registerWindow(windowElement, programConfig) {
        const windowId = windowElement.id;
        this.windows[windowId] = windowElement;
        this.taskbarItems[windowId] = this._createTaskbarItem(windowElement, programConfig);
        this.windowCount++;

        windowElement.windowState = {
            isMaximized: windowElement.classList.contains('maximized'),
            isMinimized: false,
            originalStyles: {
                width: windowElement.style.width,
                height: windowElement.style.height,
                top: windowElement.style.top,
                left: windowElement.style.left,
                transform: windowElement.style.transform
            }
        };

        this._updateStackOrder(windowId, 'add');
        this._updateZIndices();
    }

    _createTaskbarItem(windowElement, programConfig) {
        const taskbarItem = this._createElement('div', 'taskbar-item', { id: 'taskbar-' + windowElement.id });
        taskbarItem.setAttribute('data-window-id', windowElement.id);
        taskbarItem.setAttribute('data-program-id', programConfig.id);
        taskbarItem.innerHTML = `
            <img decoding="async" src="${programConfig.icon}" alt="${programConfig.title}" />
            <span>${programConfig.title}</span>
        `;

        this._bindControl(taskbarItem, 'mousedown', () => {
            const eventData = { windowId: windowElement.id, __coalesce: true };
            (window.batchedPublish || this.eventBus.publish).call(
                window.batchedPublish ? undefined : this.eventBus,
                EVENTS.TASKBAR_ITEM_CLICKED,
                eventData
            );
        });

        this.taskbarPrograms.appendChild(taskbarItem);
        return taskbarItem;
    }

    _setupWindowEvents(windowElement) {
        const titleBar = windowElement.querySelector('.title-bar');
        const startMenuOverlay = windowElement.querySelector('.start-menu-content-click-overlay');

        // Close button
        this._bindControl(windowElement.querySelector('[data-action="close"]'), 'click', () => {
            this.closeWindow(windowElement);
        });

        // Minimize button
        this._bindControl(windowElement.querySelector('[data-action="minimize"]'), 'click', () => {
            this.minimizeWindow(windowElement);
        });

        // Maximize button
        const maximizeButton = windowElement.querySelector('[data-action="maximize"]');
        if (maximizeButton) {
            this._bindControl(maximizeButton, 'click', () => {
                if (!maximizeButton.disabled) {
                    this.toggleMaximize(windowElement);
                }
            });
        }

        // Minimize event
        windowElement.addEventListener('minimize-window', () => {
            this.minimizeWindow(windowElement);
        });

        // Double-click title bar to maximize
        if (titleBar) {
            this._bindControl(titleBar, 'dblclick', () => {
                const programId = windowElement.getAttribute('data-program');
                let programConfig = this.programData[programId];

                // Apply Firefox config if needed
                if (isFirefox() && programConfig && programConfig.firefoxConfig) {
                    if (document.documentElement.classList.contains('mobile-device')) {
                        const { canMaximize, ...restConfig } = programConfig.firefoxConfig;
                        programConfig = { ...programConfig, ...restConfig };
                    } else {
                        programConfig = { ...programConfig, ...programConfig.firefoxConfig };
                    }
                }

                if (programConfig && programConfig.canMaximize !== false) {
                    this.toggleMaximize(windowElement);
                }
            });

            this.makeDraggable(windowElement, titleBar);
        }

        // Bring window to front on mousedown
        this._bindControl(windowElement, 'mousedown', () => {
            if (windowElement !== this.activeWindow) {
                this.bringToFront(windowElement);
            }
        }, true);

        // Start menu overlay click
        if (startMenuOverlay) {
            this._bindControl(startMenuOverlay, 'mousedown', event => {
                event.stopPropagation();
                event.preventDefault();
                const eventData = { __coalesce: true };
                (window.batchedPublish || this.eventBus.publish).call(
                    window.batchedPublish ? undefined : this.eventBus,
                    EVENTS.STARTMENU_CLOSE_REQUEST,
                    eventData
                );
            });
        }

        // Setup iframe overlays for activation
        this._setupIframeActivationOverlay(windowElement);

        // Setup toolbar button actions
        const toolbarButtons = windowElement.querySelectorAll('.toolbar-button[data-action]');
        toolbarButtons.forEach(button => {
            const clonedButton = button.cloneNode(true);
            button.replaceWith(clonedButton);
            this._bindControl(clonedButton, 'click', () => {
                if (clonedButton.classList.contains('disabled')) return;

                const action = clonedButton.getAttribute('data-action');
                this._handleToolbarAction(action, windowElement, clonedButton);
            });
        });

        // Custom toolbar action dispatch
        windowElement.addEventListener('dispatchToolbarAction', event => {
            if (event.detail && event.detail.action) {
                this._handleToolbarAction(event.detail.action, windowElement, event.detail.button);
            }
        });

        this.makeResizable(windowElement);
    }

    _handleToolbarAction(action, windowElement, button) {
        switch (action) {
            case 'openProjects':
                this.openProgram('projects');
                break;

            case 'openExternalLink':
                if (button && button.dataset.urlToOpen && !button.classList.contains('disabled')) {
                    try {
                        window.postMessage({
                            type: 'confirm-open-link',
                            url: button.dataset.urlToOpen,
                            label: button.getAttribute('aria-label') || ''
                        }, '*');
                    } catch (error) {
                        window.open(button.dataset.urlToOpen, '_blank');
                    }
                }
                break;

            case 'openResume':
                this.openProgram('resume');
                break;

            case 'openContact':
                this.openProgram('contact');
                break;

            case 'saveResume':
                this._handleSaveResume();
                break;

            case 'nav:prev':
            case 'nav:next': {
                const iframe = windowElement.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    const message = { type: 'toolbar:action', action: action };
                    iframe.contentWindow.postMessage(message, '*');
                }
                break;
            }

            case 'navigateHome':
            case 'home': {
                const iframe = windowElement.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    const message = { type: 'toolbar:action', action: 'navigateHome' };
                    iframe.contentWindow.postMessage(message, '*');
                }
                break;
            }

            case 'toggleZoom': {
                if (button) {
                    button.classList.toggle('pressed');
                }
                const iframe = windowElement.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    const message = { type: 'toolbar:action', action: 'toggleZoom' };
                    iframe.contentWindow.postMessage(message, '*');
                }
                break;
            }

            case 'nextImage':
            case 'nav:back': {
                const zoomButton = windowElement.querySelector('.toolbar-button.zoom');
                if (zoomButton) {
                    zoomButton.classList.remove('pressed');
                }
                const iframe = windowElement.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    const message = { type: 'toolbar:action', action: action };
                    iframe.contentWindow.postMessage(message, '*');
                }
                break;
            }

            case 'sendMessage': {
                const iframe = windowElement.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({ type: 'contact:form-data:request' }, '*');

                    const messageHandler = event => {
                        if (event.source === iframe.contentWindow && event.data && event.data.type === 'contact:form-data:response') {
                            const formData = event.data.data;
                            const to = formData.to;
                            const subject = encodeURIComponent(formData.subject);
                            const message = encodeURIComponent(formData.message);

                            let mailtoUrl = 'mailto:' + to;
                            mailtoUrl += '?subject=' + subject;
                            mailtoUrl += '&body=' + message;

                            window.open(mailtoUrl, '_blank');
                            window.removeEventListener('message', messageHandler);

                            iframe.contentWindow.postMessage({ type: 'contact:clear-form' }, '*');
                        }
                    };

                    window.addEventListener('message', messageHandler);
                }
                break;
            }

            default: {
                // Forward action to iframe
                const iframe = windowElement.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    const message = { type: 'toolbar:action', action: action };
                    iframe.contentWindow.postMessage(message, '*');
                }
                break;
            }
        }
    }

    _setupIframeActivationOverlay(windowElement) {
        const iframes = windowElement.querySelectorAll('iframe');
        if (!windowElement.iframeOverlays) {
            windowElement.iframeOverlays = [];
        }

        iframes.forEach(iframe => {
            const overlay = this._createElement('div', 'iframe-overlay');
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.display = 'none';

            const parent = iframe.parentElement;
            if (parent) {
                parent.style.position = 'relative';
                parent.appendChild(overlay);

                this._bindControl(overlay, 'mousedown', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (windowElement !== this.activeWindow) {
                        this.bringToFront(windowElement);
                    }
                });

                windowElement.iframeOverlays.push(overlay);
            }

            // Detect iframe interaction
            iframe.addEventListener('focus', () => {
                windowElement.dispatchEvent(new CustomEvent('window:iframe-interaction', { bubbles: false }));
            });

            iframe.addEventListener('mousedown', () => {
                windowElement.dispatchEvent(new CustomEvent('window:iframe-interaction', { bubbles: false }));
            });
        });
    }

    _handleTaskbarClick(windowId) {
        const windowElement = this.windows[windowId];
        if (windowElement) {
            if (windowElement.windowState.isMinimized) {
                this.restoreWindow(windowElement);
            } else if (this.activeWindow === windowElement) {
                this.minimizeWindow(windowElement);
            } else {
                this.bringToFront(windowElement);
            }
        } else {
            // Try to find window by program ID
            const programId = windowId.replace('-window', '');
            const allWindows = Object.values(this.windows);
            const matchingWindow = allWindows.find(win => win.getAttribute('data-program') === programId);

            if (matchingWindow) {
                if (matchingWindow.windowState.isMinimized) {
                    this.restoreWindow(matchingWindow);
                } else {
                    this.bringToFront(matchingWindow);
                }
            } else if (programId && this.programData[programId]) {
                this.openProgram(programId);
            }
        }
    }

    _handleWindowFocus(windowId) {
        const windowElement = this.windows[windowId];
        if (windowElement && !windowElement.windowState.isMinimized) {
            this.bringToFront(windowElement);
        }
    }

    _handleWindowRestore(windowId) {
        const windowElement = this.windows[windowId];
        if (windowElement) {
            this.restoreWindow(windowElement);
        }
    }

    _handleWindowMinimize(windowId) {
        const windowElement = this.windows[windowId];
        if (windowElement) {
            this.minimizeWindow(windowElement);
        }
    }

    _handleWindowCloseCleanup(windowId) {
        const windowElement = this.windows[windowId];
        if (!windowElement) return;

        // Notify cached iframe to reset state
        try {
            if (window.__IFRAME_CACHE && window.__IFRAME_CACHE.has(windowId)) {
                const cacheEntry = window.__IFRAME_CACHE.get(windowId);
                if (cacheEntry && cacheEntry.iframe && cacheEntry.iframe.contentWindow) {
                    try {
                        performance.mark(windowId + '-window:soft-reset-dispatch');
                    } catch (e) {}
                    cacheEntry.iframe.contentWindow.postMessage({ type: 'window:soft-reset' }, '*');
                }
            }
        } catch (e) {}

        // Remove taskbar item
        const taskbarItem = this.taskbarItems[windowId];
        if (taskbarItem && taskbarItem.parentNode) {
            taskbarItem.parentNode.removeChild(taskbarItem);
        }

        delete this.windows[windowId];
        delete this.taskbarItems[windowId];

        if (this.activeWindow === windowElement) {
            this.activeWindow = null;
            this._refreshActiveWindow();
        }

        this.windowCount = Math.max(0, this.windowCount - 1);
        this._updateStackOrder(windowId, 'remove');
        this._updateZIndices();

        this.eventBus.publish(EVENTS.WINDOW_CLOSED, { windowId: windowId });
    }

    _refreshActiveWindow() {
        lifecycleInternals.refreshActiveWindow(this);
    }

    _clearAllTaskbarItemStates() {
        lifecycleInternals.clearAllTaskbarItemStates(this);
    }

    _updateTaskbarItemState(windowId, isActive) {
        lifecycleInternals.updateTaskbarItemState(this, windowId, isActive);
    }

    closeWindow(windowElement) {
        lifecycleInternals.closeWindow(this, windowElement, EVENTS);
    }

    minimizeWindow(windowElement) {
        lifecycleInternals.minimizeWindow(this, windowElement, EVENTS);
    }

    restoreWindow(windowElement) {
        lifecycleInternals.restoreWindow(this, windowElement, EVENTS);
    }

    toggleMaximize(windowElement) {
        lifecycleInternals.toggleMaximize(this, windowElement, EVENTS);
    }

    bringToFront(windowElement) {
        if (!windowElement || this.activeWindow === windowElement || windowElement.windowState.isMinimized) {
            return;
        }

        const previousActiveWindow = this.activeWindow;
        this.deactivateAllWindows(windowElement);

        windowElement.classList.add('active');
        this.activeWindow = windowElement;
        this._updateStackOrder(windowElement.id, 'add');
        this._updateZIndices();
        this._toggleInactiveMask(windowElement, false);
        this._toggleIframeOverlays(windowElement, false);
        this._updateTaskbarItemState(windowElement.id, true);

        // Publish window focused event
        if (previousActiveWindow !== this.activeWindow) {
            const now = Date.now();
            if (!this._lastWindowFocusPublishTs || now - this._lastWindowFocusPublishTs > 100) {
                this._lastWindowFocusPublishTs = now;
                const eventData = { windowId: windowElement.id, __coalesce: true };
                (window.batchedPublish || this.eventBus.publish).call(
                    window.batchedPublish ? undefined : this.eventBus,
                    EVENTS.WINDOW_FOCUSED,
                    eventData
                );
            }

            // Notify iframe of focus
            const iframe = windowElement.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.postMessage({ type: 'window:focused' }, '*');
            }

            // Notify previous window of blur
            if (previousActiveWindow) {
                const prevIframe = previousActiveWindow.querySelector('iframe');
                if (prevIframe && prevIframe.contentWindow) {
                    prevIframe.contentWindow.postMessage({ type: 'window:blurred' }, '*');
                }
            }
        }
    }

    deactivateAllWindows(exceptWindow = null) {
        lifecycleInternals.deactivateAllWindows(this, exceptWindow);
    }

    _setWindowZIndex(windowElement, zIndex) {
        if (windowElement) {
            windowElement.style.zIndex = zIndex;
        }
    }

    _toggleInactiveMask(windowElement, show) {
        const mask = windowElement.querySelector('.window-inactive-mask');
        if (mask) {
            mask.style.display = show ? 'block' : 'none';
        }
    }

    _toggleIframeOverlays(windowElement, show) {
        if (windowElement.iframeOverlays) {
            windowElement.iframeOverlays.forEach(overlay => {
                overlay.style.display = show ? 'block' : 'none';
            });
        }
    }

    positionWindow(windowElement) {
        positionWindow(this, windowElement);
    }

    makeDraggable(windowElement, handle) {
        makeDraggable(this, windowElement, handle);
    }

    _updateStackOrder(windowId, operation = 'add') {
        updateStackOrder(this, windowId, operation);
    }

    _updateZIndices() {
        applyZIndices(this);
    }

    _findTopWindow() {
        for (let i = this.zIndexStack.length - 1; i >= 0; i--) {
            const windowId = this.zIndexStack[i];
            const windowElement = this.windows[windowId];
            if (windowElement && windowElement.windowState && !windowElement.windowState.isMinimized) {
                return windowElement;
            }
        }
        return null;
    }

    _bindControl(element, eventType, handler, useCapture = false) {
        if (element) {
            element.addEventListener(eventType, handler, useCapture);
        }
    }

    makeResizable(windowElement) {
        makeResizable(this, windowElement);
    }

    _getTaskbarHeight() {
        return viewportInternals.getTaskbarHeight(this);
    }

    _getTaskbarElement() {
        return viewportInternals.getTaskbarElement(this);
    }

    _getViewportDimensions() {
        return viewportInternals.getViewportDimensions(this);
    }

    _clearCachedValues() {
        viewportInternals.clearCachedValues(this);
    }

    _handleViewportChange() {
        viewportInternals.handleViewportChange(this);
    }

    async _getPortfolioManager() {
        if (!this.portfolioManager) {
            this.portfolioManager = new PortfolioManager();
            await this.portfolioManager.initialize();
        }
        return this.portfolioManager;
    }

    async _handleSaveResume() {
        try {
            const portfolio = await this._getPortfolioManager();
            const cvPdfUrl = portfolio.getCVPDFUrl();
            const fullName = portfolio.getFullName();
            const fileName = fullName ? `${fullName.replace(/\s+/g, '')}-CV.pdf` : 'resume.pdf';

            if (document.documentElement.classList.contains('mobile-device')) {
                window.open(cvPdfUrl, '_blank');
            } else {
                const linkElement = this._createElement('a', '', {
                    href: cvPdfUrl,
                    download: fileName
                });
                document.body.appendChild(linkElement);
                linkElement.click();
                document.body.removeChild(linkElement);
            }
        } catch (error) {
            console.error('Failed to download resume:', error);
            // Fallback to hardcoded path
            if (document.documentElement.classList.contains('mobile-device')) {
                window.open('/public/CV.pdf', '_blank');
            } else {
                const linkElement = this._createElement('a', '', {
                    href: '/public/CV.pdf',
                    download: 'CV.pdf'
                });
                document.body.appendChild(linkElement);
                linkElement.click();
                document.body.removeChild(linkElement);
            }
        }
    }
}
