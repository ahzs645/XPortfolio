import programRegistry from '../utils/programRegistry.js';
import { EVENTS } from '../utils/eventBus.js';
import { isFirefox } from '../utils/device.js';
import systemLoadingManager from '../utils/systemLoadingManager.js';
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
            if (messageEvent['data'] && messageEvent['data']['type'] === 'throttle-nav-buttons') {
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
            messageEvent['data'] && messageEvent['data']['type'] === 'open-app' && (messageEvent['data']['appName'] && this['openProgram'](messageEvent['data']['appName']));
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
            if (!(window['location']['protocol'] === 'file:' || messageEvent['origin'] === window['origin'])) return;
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
    } _createElement(tagName, className = '', attributes = {}) {
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
            clickedOnDesktop && !event.target.closest('.window') && (this.activeWindow && this.deactivateAllWindows());
        }, true);
    }
    _subscribeToEvents() {
        this['eventBus']['subscribe'](EVENTS['PROGRAM_OPEN'], _0x3f53e3 => {
            if (_0x3f53e3['programName'] === 'mediaPlayer' && !_0x3f53e3['skipLoading']) this['openMediaPlayerWithLoading']();
            else {
                if (_0x3f53e3['programName'] === 'musicPlayer' && !_0x3f53e3['skipLoading']) this['openMusicPlayerWithLoading']();
                else _0x3f53e3['programName'] === 'paint' && !_0x3f53e3['skipLoading'] ? this['openPaintWithLoading']() : this['openProgram'](_0x3f53e3['programName'], _0x3f53e3);
            }
        }), this['eventBus']['subscribe'](EVENTS['WINDOW_FOCUSED'], _0x1f9f9e => this['_handleWindowFocus'](_0x1f9f9e['windowId'])), this['eventBus']['subscribe'](EVENTS['WINDOW_MINIMIZED'], _0x117d0d => this['_handleWindowMinimize'](_0x117d0d['windowId'])), this['eventBus']['subscribe'](EVENTS['WINDOW_CLOSED'], _0x2fdcac => this['_handleWindowCloseCleanup'](_0x2fdcac['windowId'])), this['eventBus']['subscribe'](EVENTS['WINDOW_RESTORED'], _0x38f7a0 => this['_handleWindowRestore'](_0x38f7a0['windowId'])), this['eventBus']['subscribe'](EVENTS['TASKBAR_ITEM_CLICKED'], _0x522e43 => this['_handleTaskbarClick'](_0x522e43['windowId'])), this['eventBus']['subscribe'](EVENTS['PROGRAM_CLOSE_REQUESTED'], _0x132100 => {
            if (_0x132100 && _0x132100['programId']) {
                const _0x4f14e0 = this['windows'][_0x132100['programId']];
                _0x4f14e0 && this['closeWindow'](_0x4f14e0);
            }
        });
    } ['_calculateWindowToTaskbarTransform'](_0x60af45, _0x5804d5) {
        return lifecycleInternals['calculateWindowToTaskbarTransform'](_0x60af45, _0x5804d5);
    } ['openPaintWithLoading']() {
        const loadingId = 'paint-' + Date['now']();
        systemLoadingManager.startLoading(loadingId);
        const paintProgram = this.programData['paint'];
        if (!paintProgram) {
            systemLoadingManager.endLoading(loadingId);
            return;
        }
        let existingWindow = document.getElementById(paintProgram.id);
        if (existingWindow) {
            systemLoadingManager.endLoading(loadingId);
            existingWindow.classList.contains('minimized') ? this.restoreWindow(existingWindow) : this.bringToFront(existingWindow);
            return;
        }
        const preloadIframe = document.createElement('iframe');
        preloadIframe.src = paintProgram.appPath;
        preloadIframe.style.cssText = '\n      position: absolute;\n      top: -9999px;\n      left: -9999px;\n      width: 1px;\n      height: 1px;\n      visibility: hidden;\n      opacity: 0;\n      pointer-events: none;\n    ';
        preloadIframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(preloadIframe);
        const finishLoading = () => {
            document.body.contains(preloadIframe) && document.body.removeChild(preloadIframe);
            systemLoadingManager.endLoading(loadingId);
            const openEvent = { programName: 'paint', skipLoading: true };
            this.eventBus.publish(EVENTS['PROGRAM_OPEN'], openEvent);
        };
        preloadIframe.onload = finishLoading;
        preloadIframe.onerror = finishLoading;
        setTimeout(() => {
            document.body.contains(preloadIframe) && finishLoading();
        }, 0x1388);
    } ['openMediaPlayerWithLoading']() {
        const loadingId = 'mediaPlayer-' + Date['now']();
        systemLoadingManager.startLoading(loadingId);
        const mediaProgram = this.programData['mediaPlayer'];
        if (!mediaProgram) {
            systemLoadingManager.endLoading(loadingId);
            return;
        }
        let existingWindow = document.getElementById(mediaProgram.id);
        if (existingWindow) {
            systemLoadingManager.endLoading(loadingId);
            existingWindow.classList.contains('minimized') ? this.restoreWindow(existingWindow) : this.bringToFront(existingWindow);
            return;
        }
        const preloadIframe = document.createElement('iframe');
        preloadIframe.src = mediaProgram.appPath;
        preloadIframe.style.cssText = '\n      position: absolute;\n      top: -9999px;\n      left: -9999px;\n      width: 1px;\n      height: 1px;\n      visibility: hidden;\n      opacity: 0;\n      pointer-events: none;\n    ';
        preloadIframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(preloadIframe);
        setTimeout(() => {
            document.body.contains(preloadIframe) && document.body.removeChild(preloadIframe);
            systemLoadingManager.endLoading(loadingId);
            const openEvent = { programName: 'mediaPlayer', skipLoading: true };
            this.eventBus.publish(EVENTS['PROGRAM_OPEN'], openEvent);
        }, 0x5dc);
    } ['openMusicPlayerWithLoading']() {
        const loadingId = 'musicPlayer-' + Date['now']();
        systemLoadingManager.startLoading(loadingId);
        const musicProgram = this.programData['musicPlayer'];
        if (!musicProgram) {
            systemLoadingManager.endLoading(loadingId);
            return;
        }
        let existingWindow = document.getElementById(musicProgram.id);
        if (existingWindow) {
            systemLoadingManager.endLoading(loadingId);
            existingWindow.classList.contains('minimized') ? this.restoreWindow(existingWindow) : this.bringToFront(existingWindow);
            return;
        }
        const preloadIframe = document.createElement('iframe');
        preloadIframe.src = musicProgram.appPath;
        preloadIframe.style.cssText = '\n      position: absolute;\n      top: -9999px;\n      left: -9999px;\n      width: 1px;\n      height: 1px;\n      visibility: hidden;\n      opacity: 0;\n      pointer-events: none;\n    ';
        preloadIframe.setAttribute('aria-hidden', 'true');
        document.body.appendChild(preloadIframe);
        setTimeout(() => {
            document.body.contains(preloadIframe) && document.body.removeChild(preloadIframe);
            const newWindow = this._createWindowElement(musicProgram);
            newWindow.classList.add('window-opening');
            this._registerWindow(newWindow, musicProgram);
            this._setupWindowEvents(newWindow);
            document.getElementById('windows-container').appendChild(newWindow);
            this.positionWindow(newWindow);
            this.bringToFront(newWindow);
            setTimeout(() => {
                newWindow && newWindow.classList.remove('window-opening');
            }, 0xc8);
            systemLoadingManager.endLoading(loadingId);
        }, 0x1f4);
    } ['openProgram'](_0x445207, _0xc19382 = {}) {
        if (!window['__BOOT_COMPLETE']) return null;
        if (!_0x445207 || !this['programData'][_0x445207]) return;
        const _0x805abb = {
            ...this['programData'][_0x445207]
        };
        let _0x15442b = _0x805abb;
        if (isFirefox() && _0x15442b['firefoxConfig']) {
            if (document['documentElement']['classList']['contains']('mobile-device')) {
                const {
                    resizable: _0x3fae96,
                    canMaximize: _0xdab677,
                    ..._0x157b60
                } = _0x15442b['firefoxConfig'];
                void _0x3fae96, void _0xdab677, _0x15442b = {
                    ..._0x15442b,
                    ..._0x157b60
                };
            } else _0x15442b = {
                ..._0x15442b,
                ..._0x15442b['firefoxConfig']
            };
        }
        let _0xdcc7f = document['getElementById'](_0x15442b['id']);
        if (_0xdcc7f) {
            _0xdcc7f['classList']['contains']('minimized') ? this['restoreWindow'](_0xdcc7f) : (this.bringToFront(_0xdcc7f), this['_handleWindowFocus'](_0xdcc7f['id']), _0xdcc7f['style']['transition'] = 'transform\x200.15s\x20ease-out', _0xdcc7f['style']['transform'] = 'scale(1.02)', setTimeout(() => {
                _0xdcc7f && (_0xdcc7f['style']['transform'] = '', setTimeout(() => {
                    if (_0xdcc7f) _0xdcc7f['style']['transition'] = '';
                }, 0x96));
            }, 0x32));
            if (_0x445207 === 'image-viewer' && _0xc19382 && typeof _0xc19382['initialIndex'] !== 'undefined') {
                const _0x1a646b = _0xdcc7f['querySelector']('iframe');
                if (_0x1a646b && _0x1a646b['contentWindow']) {
                    const _0x1a7ff0 = {};
                    _0x1a7ff0['type'] = 'set-initial-index', _0x1a7ff0['initialIndex'] = _0xc19382['initialIndex'], _0x1a7ff0['projectTitle'] = _0xc19382['projectTitle'], _0x1a646b['contentWindow']['postMessage'](_0x1a7ff0, '*');
                }
            }
            return _0xdcc7f;
        }
        _0xdcc7f = this._createWindowElement(_0x15442b), this._registerWindow(_0xdcc7f, _0x15442b), this._setupWindowEvents(_0xdcc7f), document['getElementById']('windows-container')['appendChild'](_0xdcc7f), this.positionWindow(_0xdcc7f);
        if (_0x15442b['id'] === 'projects') {
            _0xdcc7f['style']['opacity'] = '0', _0xdcc7f['setAttribute']('data-program-loading', 'true');
            const _0xe4a3a0 = _0xdcc7f['querySelector']('iframe');
            if (_0xe4a3a0) {
                const _0x42793e = _0x5ee2e7 => {
                        _0x5ee2e7['source'] === _0xe4a3a0['contentWindow'] && _0x5ee2e7['data'] && _0x5ee2e7['data']['type'] === 'projects-ready' && (window['removeEventListener']('message', _0x42793e), clearTimeout(_0x400e52), _0xdcc7f['style']['opacity'] = '1', _0xdcc7f['removeAttribute']('data-program-loading'), this.bringToFront(_0xdcc7f), this['_handleWindowFocus'](_0xdcc7f['id']));
                    },
                    _0x400e52 = setTimeout(() => {
                        window['removeEventListener']('message', _0x42793e), _0xdcc7f['hasAttribute']('data-program-loading') && (_0xdcc7f['style']['opacity'] = '1', _0xdcc7f['removeAttribute']('data-program-loading'), this.bringToFront(_0xdcc7f), this['_handleWindowFocus'](_0xdcc7f['id']));
                    }, 0x1b58);
                window['addEventListener']('message', _0x42793e);
            }
            this.bringToFront(_0xdcc7f);
        } else {
            const _0x3c22ba = window['__IS_IFRAME_CACHED'] && window['__IS_IFRAME_CACHED'](_0x15442b['id']);
            if (_0x3c22ba) {
                this.bringToFront(_0xdcc7f), this['_handleWindowFocus'](_0xdcc7f['id']);
                if (_0x445207 === 'image-viewer' && _0xc19382 && typeof _0xc19382['initialIndex'] !== 'undefined') {
                    const _0x63f9a4 = _0xdcc7f['querySelector']('iframe');
                    if (_0x63f9a4 && _0x63f9a4['contentWindow']) {
                        const _0xa395f5 = {};
                        _0xa395f5['type'] = 'set-initial-index', _0xa395f5['initialIndex'] = _0xc19382['initialIndex'], _0xa395f5['projectTitle'] = _0xc19382['projectTitle'], _0x63f9a4['contentWindow']['postMessage'](_0xa395f5, '*');
                    }
                }
            } else _0xdcc7f['style']['opacity'] = '0', this.bringToFront(_0xdcc7f), import('../utils/frameScheduler.js')['then'](({
                scheduleWrite: _0x69b940
            }) => {
                _0x69b940(() => {
                    _0xdcc7f['style']['transition'] = 'opacity\x200.15s\x20ease-out', _0xdcc7f['style']['opacity'] = '1', this['_handleWindowFocus'](_0xdcc7f['id']);
                    if (_0x445207 === 'image-viewer' && _0xc19382 && typeof _0xc19382['initialIndex'] !== 'undefined') {
                        const _0x6bf977 = _0xdcc7f['querySelector']('iframe');
                        _0x6bf977 && setTimeout(() => {
                            if (_0x6bf977['contentWindow']) {
                                const _0xd74b0a = {};
                                _0xd74b0a['type'] = 'set-initial-index', _0xd74b0a['initialIndex'] = _0xc19382['initialIndex'], _0xd74b0a['projectTitle'] = _0xc19382['projectTitle'], _0x6bf977['contentWindow']['postMessage'](_0xd74b0a, '*');
                            }
                        }, 0x1f4);
                    }
                    setTimeout(() => {
                        if (_0xdcc7f) _0xdcc7f['style']['transition'] = '';
                    }, 0x96);
                });
            });
        }
        if (document['documentElement']['classList']['contains']('mobile-device')) {
            const _0x329eea = _0xdcc7f['querySelector']('.menu-bar-container'),
                _0x49ce89 = _0xdcc7f['querySelector']('.toolbar-container');
            _0x329eea && (_0x329eea['style']['pointerEvents'] = 'none', _0x329eea['classList']['add']('menubar-temporarily-disabled')), _0x49ce89 && (_0x49ce89['style']['pointerEvents'] = 'none', _0x49ce89['classList']['add']('toolbar-temporarily-disabled')), _0xdcc7f['dataset']['acceptInput'] = 'false', setTimeout(() => {
                document['body']['contains'](_0xdcc7f) && (_0x329eea && (_0x329eea['style']['pointerEvents'] = 'auto'), _0x49ce89 && (_0x49ce89['style']['pointerEvents'] = 'auto'));
            }, 0x1f4), setTimeout(() => {
                document['body']['contains'](_0xdcc7f) && (_0xdcc7f['dataset']['acceptInput'] = 'true', _0x49ce89 && _0x49ce89['classList']['remove']('toolbar-temporarily-disabled'), _0x329eea && _0x329eea['classList']['remove']('menubar-temporarily-disabled'));
            }, 0x226);
        }
        return _0xdcc7f;
    } ['_createWindowElement'](_0x4052e3) {
        const _0x431f7d = {};
        _0x431f7d['id'] = _0x4052e3['id'];
        const _0x4836f = this['_createElement']('div', 'app-window', _0x431f7d);
        _0x4836f['setAttribute']('data-program', _0x4052e3['id']['replace']('-window', '')), _0x4836f['innerHTML'] = this['_getWindowBaseHTML'](_0x4052e3);
        const _0x1a4758 = _0x4052e3['id']['replace']('-window', '');
        if (document['documentElement']['classList']['contains']('mobile-device')) {
            _0x1a4758 === 'musicPlayer' && _0x4052e3['mobileConfig'] ? (_0x4836f['classList']['add']('mobile-music-player'), _0x4052e3['mobileConfig']['dimensions'] && (_0x4052e3['mobileConfig']['dimensions']['width'] && (_0x4836f['style']['width'] = _0x4052e3['mobileConfig']['dimensions']['width'] + 'px', _0x4836f['style']['maxWidth'] = _0x4052e3['mobileConfig']['dimensions']['width'] + 'px'), _0x4052e3['mobileConfig']['dimensions']['height'] && (_0x4836f['style']['height'] = _0x4052e3['mobileConfig']['dimensions']['height'] + 'px')), _0x4052e3['mobileConfig']['draggable'] === ![] && _0x4836f['setAttribute']('data-mobile-no-drag', 'true')) : (_0x4836f['classList']['add']('maximized'), _0x4836f['style']['position'] = 'fixed', _0x4836f['style']['left'] = '0', _0x4836f['style']['top'] = '0', _0x4836f['style']['width'] = '100vw', _0x4836f['style']['maxWidth'] = '100vw');
            if (_0x1a4758 !== 'musicPlayer') {
                const _0x4da95f = _0x4836f['querySelector']('[data-action=\x22maximize\x22]');
                _0x4da95f && (_0x4da95f['classList']['add']('restore'), _0x4da95f['setAttribute']('aria-label', 'Restore'), _0x4da95f['disabled'] = !![]);
            }
        }
        const _0x22aed0 = WindowTemplates['getTemplate'](_0x4052e3['template'], _0x4052e3);
        if (!_0x22aed0) return null;
        _0x4836f['appendChild'](_0x22aed0), this['_addStartMenuOverlay'](_0x4836f, _0x22aed0);
        const _0x5e73db = _0x22aed0['querySelector']('.menu-bar-container');
        _0x5e73db && typeof _0x5e73db['setParentWindowElement'] === 'function' && _0x5e73db['setParentWindowElement'](_0x4836f);
        const _0x2415e8 = _0x4052e3['id']['replace']('-window', '');
        if (_0x2415e8 !== 'cmd' && _0x2415e8 !== 'musicPlayer' && _0x2415e8 !== 'mediaPlayer' && _0x2415e8 !== 'minesweeper') {
            const _0x175910 = this['_createElement']('div', 'status-bar'),
                _0x2055e3 = this['_createElement']('p', 'status-bar-field');
            _0x2055e3['textContent'] = _0x4052e3['statusBarText'] || 'Ready', _0x175910['appendChild'](_0x2055e3), _0x4836f['appendChild'](_0x175910), _0x4836f['statusBarField'] = _0x2055e3;
        }
        const _0x3b5247 = 0x258,
            _0x150909 = 0x190;
        return !_0x4836f['style']['width'] && (_0x4836f['style']['width'] = (_0x4052e3['dimensions']?.['width'] || _0x3b5247) + 'px'), !_0x4836f['style']['height'] && (_0x4836f['style']['height'] = (_0x4052e3['dimensions']?.['height'] || _0x150909) + 'px'), _0x4836f['style']['position'] = 'absolute', _0x4836f['addEventListener']('request-close-window', () => {
            this['closeWindow'](_0x4836f);
        }), _0x4836f['addEventListener']('request-minimize-window', () => {
            this['minimizeWindow'](_0x4836f);
        }), _0x4836f['addEventListener']('request-maximize-window', () => {
            this['toggleMaximize'](_0x4836f);
        }), _0x4836f;
    } ['_getWindowBaseHTML'](_0x33f614) {
        const _0x5a226c = _0x33f614['resizable'] !== ![];
        let _0x16cf3c = '';
        return _0x5a226c && (_0x16cf3c = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22resizer\x20resizer-n\x22></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22resizer\x20resizer-ne\x22></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22resizer\x20resizer-e\x22></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22resizer\x20resizer-se\x22></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22resizer\x20resizer-s\x22></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22resizer\x20resizer-sw\x22></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22resizer\x20resizer-w\x22></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22resizer\x20resizer-nw\x22></div>\x0a\x20\x20\x20\x20\x20\x20'), '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22window-inactive-mask\x22></div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar-left\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar-icon\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20loading=\x22lazy\x22\x20src=\x22' + _0x33f614['icon'] + '\x22\x20alt=\x22' + _0x33f614['title'] + '\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar-text\x22>' + _0x33f614['title'] + '</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<div\x20class=\x22title-bar-controls\x22>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + (_0x33f614['canMinimize'] !== ![] ? '<button\x20class=\x22xp-button\x22\x20aria-label=\x22Minimize\x22\x20data-action=\x22minimize\x22></button>' : '') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + (_0x33f614['canMaximize'] !== ![] ? '<button\x20class=\x22xp-button\x22\x20aria-label=\x22Maximize\x22\x20data-action=\x22maximize\x22></button>' : '') + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<button\x20class=\x22xp-button\x22\x20aria-label=\x22Close\x22\x20data-action=\x22close\x22></button>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20</div>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20' + _0x16cf3c + '\x0a\x20\x20\x20\x20\x20\x20\x20\x20';
    } ['_addStartMenuOverlay'](_0x7de73, _0x4f83c6) {
        const _0x2d59ac = this['_createElement']('div', 'start-menu-content-click-overlay'),
            _0x50833c = _0x4f83c6['classList']['contains']('window-body') ? _0x4f83c6 : _0x7de73;
        _0x50833c !== _0x7de73 && (_0x50833c['style']['position'] = 'relative'), _0x50833c['appendChild'](_0x2d59ac);
    } ['_registerWindow'](_0x2d6aae, _0x16b391) {
        const _0x370858 = _0x2d6aae['id'];
        this['windows'][_0x370858] = _0x2d6aae, this['taskbarItems'][_0x370858] = this['_createTaskbarItem'](_0x2d6aae, _0x16b391), this['windowCount']++, _0x2d6aae['windowState'] = {
            'isMaximized': _0x2d6aae['classList']['contains']('maximized'),
            'isMinimized': ![],
            'originalStyles': {
                'width': _0x2d6aae['style']['width'],
                'height': _0x2d6aae['style']['height'],
                'top': _0x2d6aae['style']['top'],
                'left': _0x2d6aae['style']['left'],
                'transform': _0x2d6aae['style']['transform']
            }
        }, this['_updateStackOrder'](_0x370858, 'add'), this['_updateZIndices']();
    } ['_createTaskbarItem'](_0x11cee1, _0x5d8d22) {
        const _0x5e2d33 = {};
        _0x5e2d33['id'] = 'taskbar-' + _0x11cee1['id'];
        const _0x121ef7 = this['_createElement']('div', 'taskbar-item', _0x5e2d33);
        return _0x121ef7['setAttribute']('data-window-id', _0x11cee1['id']), _0x121ef7['setAttribute']('data-program-id', _0x5d8d22['id']), _0x121ef7['innerHTML'] = '\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<img\x20decoding=\x22async\x22\x20src=\x22' + _0x5d8d22['icon'] + '\x22\x20alt=\x22' + _0x5d8d22['title'] + '\x22\x20/>\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20<span>' + _0x5d8d22['title'] + '</span>\x0a\x20\x20\x20\x20\x20\x20\x20\x20', this['_bindControl'](_0x121ef7, 'mousedown', () => {
            const _0x5e1e80 = {};
            _0x5e1e80['windowId'] = _0x11cee1['id'], _0x5e1e80['__coalesce'] = !![], (window['batchedPublish'] || this['eventBus']['publish'])['call'](window['batchedPublish'] ? undefined : this['eventBus'], EVENTS['TASKBAR_ITEM_CLICKED'], _0x5e1e80);
        }), this['taskbarPrograms']['appendChild'](_0x121ef7), _0x121ef7;
    } ['_setupWindowEvents'](_0x334f90) {
        const _0x1661ee = _0x334f90['querySelector']('.title-bar'),
            _0x555527 = _0x334f90['querySelector']('.start-menu-content-click-overlay');
        this['_bindControl'](_0x334f90['querySelector']('[data-action=\x22close\x22]'), 'click', () => this['closeWindow'](_0x334f90)), this['_bindControl'](_0x334f90['querySelector']('[data-action=\x22minimize\x22]'), 'click', () => this['minimizeWindow'](_0x334f90));
        const _0x21c51a = _0x334f90['querySelector']('[data-action=\x22maximize\x22]');
        _0x21c51a && this['_bindControl'](_0x21c51a, 'click', () => {
            !_0x21c51a['disabled'] && this['toggleMaximize'](_0x334f90);
        });
        _0x334f90['addEventListener']('minimize-window', () => {
            this['minimizeWindow'](_0x334f90);
        });
        _0x1661ee && (this['_bindControl'](_0x1661ee, 'dblclick', () => {
            const _0x3b9e91 = _0x334f90['getAttribute']('data-program');
            let _0x1c51d5 = this['programData'][_0x3b9e91];
            if (isFirefox() && _0x1c51d5 && _0x1c51d5['firefoxConfig']) {
                if (document['documentElement']['classList']['contains']('mobile-device')) {
                    const {
                        canMaximize: _0x4f5a91,
                        ..._0x5a80ee
                    } = _0x1c51d5['firefoxConfig'];
                    _0x1c51d5 = {
                        ..._0x1c51d5,
                        ..._0x5a80ee
                    };
                } else _0x1c51d5 = {
                    ..._0x1c51d5,
                    ..._0x1c51d5['firefoxConfig']
                };
            }
            _0x1c51d5 && _0x1c51d5['canMaximize'] !== ![] && this['toggleMaximize'](_0x334f90);
        }), this['makeDraggable'](_0x334f90, _0x1661ee));
        this['_bindControl'](_0x334f90, 'mousedown', () => {
            _0x334f90 !== this['activeWindow'] && this.bringToFront(_0x334f90);
        }, !![]);
        _0x555527 && this['_bindControl'](_0x555527, 'mousedown', _0x524b21 => {
            _0x524b21['stopPropagation'](), _0x524b21['preventDefault']();
            const _0x448bbc = {};
            _0x448bbc['__coalesce'] = !![], (window['batchedPublish'] || this['eventBus']['publish'])['call'](window['batchedPublish'] ? undefined : this['eventBus'], EVENTS['STARTMENU_CLOSE_REQUEST'], _0x448bbc);
        });
        this['_setupIframeActivationOverlay'](_0x334f90);
        const _0x456ab7 = _0x334f90['querySelectorAll']('.toolbar-button[data-action]');
        _0x456ab7['forEach'](_0x4e60c5 => {
            const _0x39d56d = _0x4e60c5['cloneNode'](!![]);
            _0x4e60c5['replaceWith'](_0x39d56d), this['_bindControl'](_0x39d56d, 'click', () => {
                if (_0x39d56d['classList']['contains']('disabled')) return;
                const _0x32770d = _0x39d56d['getAttribute']('data-action');
                this['_handleToolbarAction'](_0x32770d, _0x334f90, _0x39d56d);
            });
        }), _0x334f90['addEventListener']('dispatchToolbarAction', _0x3c36e1 => {
            _0x3c36e1['detail'] && _0x3c36e1['detail']['action'] && this['_handleToolbarAction'](_0x3c36e1['detail']['action'], _0x334f90, _0x3c36e1['detail']['button']);
        }), this['makeResizable'](_0x334f90);
    } ['_handleToolbarAction'](_0x2bfc8f, _0x1cbaec, _0x3b7d72) {
        switch (_0x2bfc8f) {
            case 'openProjects':
                this['openProgram']('projects');
                break;
            case 'openExternalLink':
                if (_0x3b7d72 && _0x3b7d72['dataset']['urlToOpen'] && !_0x3b7d72['classList']['contains']('disabled')) try {
                    window['postMessage']({
                        'type': 'confirm-open-link',
                        'url': _0x3b7d72['dataset']['urlToOpen'],
                        'label': _0x3b7d72['getAttribute']('aria-label') || ''
                    }, '*');
                } catch (_0x3f072f) {
                    window['open'](_0x3b7d72['dataset']['urlToOpen'], '_blank');
                }
                break;
            case 'openResume':
                this['openProgram']('resume');
                break;
            case 'openContact':
                this['openProgram']('contact');
                break;
            case 'saveResume':
                if (document['documentElement']['classList']['contains']('mobile-device')) window['open']('./assets/apps/resume/resumeMitchIvin.pdf', '_blank');
                else {
                    const _0x409858 = {};
                    _0x409858['href'] = './assets/apps/resume/resumeMitchIvin.pdf', _0x409858['download'] = 'resumeMitchIvin.pdf';
                    const _0x17b0b3 = this['_createElement']('a', '', _0x409858);
                    document['body']['appendChild'](_0x17b0b3), _0x17b0b3['click'](), document['body']['removeChild'](_0x17b0b3);
                }
                break;
            case 'nav:prev':
            case 'nav:next': {
                const _0x36d71f = _0x1cbaec['querySelector']('iframe');
                if (_0x36d71f && _0x36d71f['contentWindow']) {
                    const _0x2921ad = {};
                    _0x2921ad['type'] = 'toolbar:action', _0x2921ad['action'] = _0x2bfc8f, _0x36d71f['contentWindow']['postMessage'](_0x2921ad, '*');
                }
                break;
            }
            case 'navigateHome':
            case 'home': {
                const _0x5547b7 = _0x1cbaec['querySelector']('iframe');
                if (_0x5547b7 && _0x5547b7['contentWindow']) {
                    const _0x57fcb8 = {};
                    _0x57fcb8['type'] = 'toolbar:action', _0x57fcb8['action'] = 'navigateHome', _0x5547b7['contentWindow']['postMessage'](_0x57fcb8, '*');
                }
                break;
            }
            case 'toggleZoom': {
                _0x3b7d72 && _0x3b7d72['classList']['toggle']('pressed');
                const _0x3f51c3 = _0x1cbaec['querySelector']('iframe');
                if (_0x3f51c3 && _0x3f51c3['contentWindow']) {
                    const _0xa8519c = {};
                    _0xa8519c['type'] = 'toolbar:action', _0xa8519c['action'] = 'toggleZoom', _0x3f51c3['contentWindow']['postMessage'](_0xa8519c, '*');
                }
                break;
            }
            case 'nextImage':
            case 'nav:back': {
                const _0x3a22c5 = _0x1cbaec['querySelector']('.toolbar-button.zoom');
                if (_0x3a22c5) _0x3a22c5['classList']['remove']('pressed');
                const _0x20beec = _0x1cbaec['querySelector']('iframe');
                if (_0x20beec && _0x20beec['contentWindow']) {
                    const _0x557705 = {};
                    _0x557705['type'] = 'toolbar:action', _0x557705['action'] = _0x2bfc8f, _0x20beec['contentWindow']['postMessage'](_0x557705, '*');
                }
                break;
            }
            case 'sendMessage': {
                const _0x40c3de = _0x1cbaec['querySelector']('iframe');
                if (_0x40c3de && _0x40c3de['contentWindow']) {
                    const _0x490caf = {};
                    _0x490caf['type'] = 'contact:form-data:request', _0x40c3de['contentWindow']['postMessage'](_0x490caf, '*');
                    const _0x2a0f99 = _0x3c7bc7 => {
                        if (_0x3c7bc7['source'] === _0x40c3de['contentWindow'] && _0x3c7bc7['data'] && _0x3c7bc7['data']['type'] === 'contact:form-data:response') {
                            const _0x54abf4 = _0x3c7bc7['data']['data'],
                                _0x4a18fe = _0x54abf4['to'],
                                _0x1a3ee8 = encodeURIComponent(_0x54abf4['subject']),
                                _0x225fa5 = encodeURIComponent(_0x54abf4['message']);
                            let _0x4e8f43 = 'mailto:' + _0x4a18fe;
                            _0x4e8f43 += '?subject=' + _0x1a3ee8, _0x4e8f43 += '&body=' + _0x225fa5, window['open'](_0x4e8f43, '_blank'), window['removeEventListener']('message', _0x2a0f99);
                            const _0xe20513 = {};
                            _0xe20513['type'] = 'contact:clear-form', _0x40c3de['contentWindow']['postMessage'](_0xe20513, '*');
                        }
                    };
                    window['addEventListener']('message', _0x2a0f99);
                }
                break;
            }
            default: {
                const _0x15a229 = _0x1cbaec['querySelector']('iframe');
                if (_0x15a229 && _0x15a229['contentWindow']) {
                    const _0x128def = {};
                    _0x128def['type'] = 'toolbar:action', _0x128def['action'] = _0x2bfc8f, _0x15a229['contentWindow']['postMessage'](_0x128def, '*');
                }
                break;
            }
        }
    } ['_setupIframeActivationOverlay'](_0x2d7a79) {
        const _0x46dd56 = _0x2d7a79['querySelectorAll']('iframe');
        if (!_0x2d7a79['iframeOverlays']) _0x2d7a79['iframeOverlays'] = [];
        _0x46dd56['forEach'](_0x3851ce => {
            const _0x551aef = this['_createElement']('div', 'iframe-overlay');
            _0x551aef['style']['position'] = 'absolute', _0x551aef['style']['top'] = '0', _0x551aef['style']['left'] = '0', _0x551aef['style']['width'] = '100%', _0x551aef['style']['height'] = '100%', _0x551aef['style']['display'] = 'none';
            const _0x52abef = _0x3851ce['parentElement'];
            _0x52abef && (_0x52abef['style']['position'] = 'relative', _0x52abef['appendChild'](_0x551aef), this['_bindControl'](_0x551aef, 'mousedown', _0x4ea4e4 => {
                _0x4ea4e4['preventDefault'](), _0x4ea4e4['stopPropagation'](), _0x2d7a79 !== this['activeWindow'] && this.bringToFront(_0x2d7a79);
            }), _0x2d7a79['iframeOverlays']['push'](_0x551aef)), _0x3851ce['addEventListener']('focus', () => {
                const _0x18f7bd = {};
                _0x18f7bd['bubbles'] = ![], _0x2d7a79['dispatchEvent'](new CustomEvent('window:iframe-interaction', _0x18f7bd));
            }), _0x3851ce['addEventListener']('mousedown', () => {
                const _0x5877b3 = {};
                _0x5877b3['bubbles'] = ![], _0x2d7a79['dispatchEvent'](new CustomEvent('window:iframe-interaction', _0x5877b3));
            });
        });
    } ['_handleTaskbarClick'](_0x9c8ba9) {
        const _0x14526b = this['windows'][_0x9c8ba9];
        if (_0x14526b) {
            if (_0x14526b['windowState']['isMinimized']) this['restoreWindow'](_0x14526b);
            else this['activeWindow'] === _0x14526b ? this['minimizeWindow'](_0x14526b) : this.bringToFront(_0x14526b);
        } else {
            const _0x5357f9 = _0x9c8ba9['replace']('-window', ''),
                _0x79ca7b = Object['values'](this['windows']),
                _0xcc9732 = _0x79ca7b['find'](_0xb6a397 => _0xb6a397['getAttribute']('data-program') === _0x5357f9);
            if (_0xcc9732) _0xcc9732['windowState']['isMinimized'] ? this['restoreWindow'](_0xcc9732) : this.bringToFront(_0xcc9732);
            else _0x5357f9 && this['programData'][_0x5357f9] && this['openProgram'](_0x5357f9);
        }
    } ['_handleWindowFocus'](_0x4e3ab4) {
        const _0x3a69f3 = this['windows'][_0x4e3ab4];
        _0x3a69f3 && !_0x3a69f3['windowState']['isMinimized'] && this.bringToFront(_0x3a69f3);
    } ['_handleWindowRestore'](_0x1f4f4e) {
        const _0x1a156f = this['windows'][_0x1f4f4e];
        _0x1a156f && this['restoreWindow'](_0x1a156f);
    } ['_handleWindowMinimize'](_0x252507) {
        const _0x313ae9 = this['windows'][_0x252507];
        _0x313ae9 && this['minimizeWindow'](_0x313ae9);
    } ['_handleWindowCloseCleanup'](_0x14d4b5) {
        const _0x3ae018 = this['windows'][_0x14d4b5];
        if (!_0x3ae018) return;
        try {
            if (window['__IFRAME_CACHE'] && window['__IFRAME_CACHE']['has'](_0x14d4b5)) {
                const _0x156df4 = window['__IFRAME_CACHE']['get'](_0x14d4b5);
                if (_0x156df4 && _0x156df4['iframe'] && _0x156df4['iframe']['contentWindow']) {
                    try {
                        performance['mark'](_0x14d4b5 + '-window:soft-reset-dispatch');
                    } catch (_0x56613d) {}
                    const _0x2c7fa1 = {};
                    _0x2c7fa1['type'] = 'window:soft-reset', _0x156df4['iframe']['contentWindow']['postMessage'](_0x2c7fa1, '*');
                }
            }
        } catch {}
        const _0x223bfc = this['taskbarItems'][_0x14d4b5];
        _0x223bfc && _0x223bfc['parentNode'] && _0x223bfc['parentNode']['removeChild'](_0x223bfc);
        delete this['windows'][_0x14d4b5], delete this['taskbarItems'][_0x14d4b5];
        this['activeWindow'] === _0x3ae018 && (this['activeWindow'] = null, this['_refreshActiveWindow']());
        this['windowCount'] = Math['max'](0x0, this['windowCount'] - 0x1), this['_updateStackOrder'](_0x14d4b5, 'remove'), this['_updateZIndices']();
        const _0x362b75 = {};
        _0x362b75['windowId'] = _0x14d4b5, this['eventBus']['publish'](EVENTS['WINDOW_CLOSED'], _0x362b75);
    } ['_refreshActiveWindow']() {
        lifecycleInternals['refreshActiveWindow'](this);
    } ['_clearAllTaskbarItemStates']() {
        lifecycleInternals['clearAllTaskbarItemStates'](this);
    } ['_updateTaskbarItemState'](_0x3e8c23, _0x4f469f) {
        lifecycleInternals['updateTaskbarItemState'](this, _0x3e8c23, _0x4f469f);
    } ['closeWindow'](_0x57cd0c) {
        lifecycleInternals['closeWindow'](this, _0x57cd0c, EVENTS);
    } ['minimizeWindow'](_0x599b60) {
        lifecycleInternals['minimizeWindow'](this, _0x599b60, EVENTS);
    } ['restoreWindow'](_0x18bec6) {
        lifecycleInternals['restoreWindow'](this, _0x18bec6, EVENTS);
    } ['toggleMaximize'](_0x374dc0) {
        lifecycleInternals['toggleMaximize'](this, _0x374dc0, EVENTS);
    } ['bringToFront'](_0x234836) {
        if (!_0x234836 || this['activeWindow'] === _0x234836 || _0x234836['windowState']['isMinimized']) return;
        const _0x2a1c8f = this['activeWindow'];
        this['deactivateAllWindows'](_0x234836), _0x234836['classList']['add']('active'), this['activeWindow'] = _0x234836, this['_updateStackOrder'](_0x234836['id'], 'add'), this['_updateZIndices'](), this['_toggleInactiveMask'](_0x234836, ![]), this['_toggleIframeOverlays'](_0x234836, ![]), this['_updateTaskbarItemState'](_0x234836['id'], !![]);
        if (_0x2a1c8f !== this['activeWindow']) {
            const _0x3c4689 = Date['now']();
            if (!this['_lastWindowFocusPublishTs'] || _0x3c4689 - this['_lastWindowFocusPublishTs'] > 0x64) {
                this['_lastWindowFocusPublishTs'] = _0x3c4689;
                const _0x2ce9d1 = {};
                _0x2ce9d1['windowId'] = _0x234836['id'], _0x2ce9d1['__coalesce'] = !![], (window['batchedPublish'] || this['eventBus']['publish'])['call'](window['batchedPublish'] ? undefined : this['eventBus'], EVENTS['WINDOW_FOCUSED'], _0x2ce9d1);
            }
            const _0x5ba460 = _0x234836['querySelector']('iframe');
            if (_0x5ba460 && _0x5ba460['contentWindow']) {
                const _0x5c0c0a = {};
                _0x5c0c0a['type'] = 'window:focused', _0x5ba460['contentWindow']['postMessage'](_0x5c0c0a, '*');
            }
            if (_0x2a1c8f) {
                const _0x58d7d0 = _0x2a1c8f['querySelector']('iframe');
                if (_0x58d7d0 && _0x58d7d0['contentWindow']) {
                    const _0x42fccd = {};
                    _0x42fccd['type'] = 'window:blurred', _0x58d7d0['contentWindow']['postMessage'](_0x42fccd, '*');
                }
            }
        }
    } ['deactivateAllWindows'](_0x438f3e = null) {
        lifecycleInternals['deactivateAllWindows'](this, _0x438f3e);
    } ['_setWindowZIndex'](_0x38b075, _0x56465b) {
        _0x38b075 && (_0x38b075['style']['zIndex'] = _0x56465b);
    } ['_toggleInactiveMask'](_0x119bdc, _0x41b9e1) {
        const _0x3406de = _0x119bdc['querySelector']('.window-inactive-mask');
        _0x3406de && (_0x3406de['style']['display'] = _0x41b9e1 ? 'block' : 'none');
    } ['_toggleIframeOverlays'](_0x318d5f, _0x32872c) {
        _0x318d5f['iframeOverlays'] && _0x318d5f['iframeOverlays']['forEach'](_0xe80c9e => _0xe80c9e['style']['display'] = _0x32872c ? 'block' : 'none');
    } ['positionWindow'](_0x49ee73) {
        positionWindow(this, _0x49ee73);
    } ['makeDraggable'](_0x1a2eaf, _0x3c13b0) {
        makeDraggable(this, _0x1a2eaf, _0x3c13b0);
    } ['_updateStackOrder'](_0x1f5195, _0x54cd86 = 'add') {
        updateStackOrder(this, _0x1f5195, _0x54cd86);
    } ['_updateZIndices']() {
        applyZIndices(this);
    } ['_findTopWindow']() {
        for (let _0x2cf162 = this['zIndexStack']['length'] - 0x1; _0x2cf162 >= 0x0; _0x2cf162--) {
            const _0x33fb89 = this['zIndexStack'][_0x2cf162],
                _0x5a9406 = this['windows'][_0x33fb89];
            if (_0x5a9406 && _0x5a9406['windowState'] && !_0x5a9406['windowState']['isMinimized']) return _0x5a9406;
        }
        return null;
    } ['_bindControl'](_0x405619, _0x4a0c4f, _0x38888e, _0x555ade = ![]) {
        _0x405619 && _0x405619['addEventListener'](_0x4a0c4f, _0x38888e, _0x555ade);
    } ['makeResizable'](_0x31ec72) {
        makeResizable(this, _0x31ec72);
    } ['_getTaskbarHeight']() {
        return viewportInternals['getTaskbarHeight'](this);
    } ['_getTaskbarElement']() {
        return viewportInternals['getTaskbarElement'](this);
    } ['_getViewportDimensions']() {
        return viewportInternals['getViewportDimensions'](this);
    } ['_clearCachedValues']() {
        viewportInternals['clearCachedValues'](this);
    } ['_handleViewportChange']() {
        viewportInternals['handleViewportChange'](this);
    }
}
