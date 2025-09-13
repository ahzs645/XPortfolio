/**
 * Internal helpers for window management
 * @file src/scripts/gui/windowInternals.js
 * @description Provides WindowTemplates (iframe window content builder) and window management utilities.
 *              Extracted from window.js to reduce file size.
 */

import {
    createMenuBar,
    createToolbar,
    createAddressBar
} from './windowBars.js';
import {
    isFirefox
} from '../utils/device.js';
import {
    EVENTS
} from '../utils/eventBus.js';


export class WindowTemplates {
    static createElement(tagName, className = '', attributes = {}) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        return element;
    }

    static getTemplate(templateName, programConfig) {
        if (templateName === 'iframe-standard' && programConfig?.appPath) {
            return this.createIframeContainer(programConfig.appPath, programConfig.id, programConfig);
        }
        const content = this.createElement('div', 'window-body');
        const errorMsg = !templateName ?
            'Error: Window template not specified or invalid configuration.' :
            `Error: Template '${templateName}' not found or missing appPath.`;
        content.innerHTML = `<p style="padding:10px;">${errorMsg}</p>`;
        return content;
    }

    static createIframeContainer(appPath, windowId, programConfig) {
        const container = this.createElement('div', 'window-body');

        // --- Dynamically Generate MenuBar based on programConfig ---
        let menuBarContainer = null;
        if (programConfig?.menuBarConfig?.items) {
            const parentWindowElement = container.closest('.window, .app-window');
            menuBarContainer = createMenuBar(programConfig.menuBarConfig, windowId, parentWindowElement);
            if (menuBarContainer) container.appendChild(menuBarContainer);
        }

        // --- Generate Toolbar (if config exists) ---
        let toolbarWrapper = null;
        if (programConfig?.toolbarConfig?.buttons) {
            toolbarWrapper = createToolbar(
                programConfig.toolbarConfig,
                windowId,
                programConfig && programConfig.id === 'image-viewer-window' && !document.documentElement.classList.contains('mobile-device'),
            );
        }

        // --- Create Address Bar (if config exists) ---
        let addressBar = null;
        if (programConfig?.addressBarConfig?.enabled) {
            addressBar = createAddressBar(programConfig.addressBarConfig);
        }

        // --- Create iframe container and iframe ---
        const iframeContainer = this.createElement('div', 'iframe-container');
        iframeContainer.style.position = 'relative';

        let iframe = null;
        // Respect global exclusion list: some programs manage their own loading and should not
        // reuse cached iframes from the global cache.
        const cacheAllowed = !(
            window.__IFRAME_CACHE_EXCLUDE && window.__IFRAME_CACHE_EXCLUDE.has(windowId)
        );
        if (cacheAllowed && window.__IFRAME_CACHE && window.__IFRAME_CACHE.has(windowId)) {
            const cachedData = window.__IFRAME_CACHE.get(windowId);
            if (cachedData.fullyLoaded && cachedData.iframe) {
                iframe = cachedData.iframe;
                try {
                    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                } catch (_) {
                    /* iframe detach failed (non-critical) */
                }
                iframe.removeAttribute('style');
                iframe.removeAttribute('aria-hidden');
                iframe.name = windowId;
                iframe.title = `${windowId}-content`;
                iframe.src = '';
                const attrs = {
                    frameborder: '0',
                    width: '100%',
                    height: '100%',
                    scrolling: document.documentElement.classList.contains('mobile-device') ? 'auto' : 'no',
                    // sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals', // Disabled for Chrome compatibility
                };
                for (const [attr, value] of Object.entries(attrs)) iframe.setAttribute(attr, value);
                iframe.src = appPath;
                window.__IFRAME_CACHE.set(windowId, {
                    ...cachedData,
                    iframe
                });
            } else if (cachedData.fullyLoaded && cachedData.src) {
                iframe = this.createElement('iframe');
                iframe.src = cachedData.src;
                iframe.name = windowId;
                iframe.title = `${windowId}-content`;
                const attrs = {
                    frameborder: '0',
                    width: '100%',
                    height: '100%',
                    scrolling: document.documentElement.classList.contains('mobile-device') ? 'auto' : 'no',
                    // sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals', // Disabled for Chrome compatibility
                };
                for (const [attr, value] of Object.entries(attrs)) iframe.setAttribute(attr, value);
            }
        }
        if (!iframe) {
            iframe = this.createElement('iframe');
            try {
                performance.mark(`${windowId}-iframe-create-start`);
            } catch (_) {
                /* perf mark failed (non-critical) */
            }
            Object.assign(iframe, {
                src: appPath,
                title: `${windowId}-content`
            });
            iframe.name = windowId;
            const attrs = {
                frameborder: '0',
                width: '100%',
                height: '100%',
                scrolling: document.documentElement.classList.contains('mobile-device') ? 'auto' : 'no',
                sandbox: 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-modals allow-downloads',
            };
            for (const [attr, value] of Object.entries(attrs)) iframe.setAttribute(attr, value);
        }

        const prepareIframeForMobile = (targetIframe, {
            skipHide = false
        } = {}) => {
            const apply = () => {
                try {
                    const doc = targetIframe.contentDocument || targetIframe.contentWindow?.document;
                    if (!doc) return;
                    const root = doc.documentElement;
                    const body = doc.body;
                    const mobile = document.documentElement.classList.contains('mobile-device');
                    if (root) root.classList.toggle('mobile-device', mobile);
                    if (body) body.classList.toggle('mobile-device', mobile);
                } catch (_) {
                    /* apply mobile classes failed */
                }
                if (!skipHide) {
                    targetIframe.style.visibility = '';
                    targetIframe.style.opacity = '';
                }
            };
            if (!skipHide) {
                targetIframe.style.visibility = 'hidden';
                targetIframe.style.opacity = '0';
            }
            apply();
            try {
                targetIframe.addEventListener('load', apply, {
                    once: true
                });
            } catch (_) {
                /* addEventListener failed */
            }
        };

        const skipHideForProgram = !!(
            programConfig &&
            (programConfig.id === 'musicPlayer-window' || programConfig.id === 'mediaPlayer-window')
        );
        prepareIframeForMobile(iframe, {
            skipHide: skipHideForProgram
        });

        iframe.addEventListener(
            'load',
            () => {
                try {
                    performance.mark(`${windowId}-iframe-load`);
                    performance.measure(
                        `${windowId}-iframe-total`,
                        `${windowId}-iframe-create-start`,
                        `${windowId}-iframe-load`,
                    );
                } catch (_) {
                    /* iframe load perf measure failed */
                }
            }, {
                once: true
            },
        );

        iframeContainer.appendChild(iframe);
        try {
            performance.mark(`${windowId}-iframe-attached`);
        } catch (_) {
            /* iframe attached perf mark failed */
        }

        const isProjectsWindow = programConfig && programConfig.id === 'projects-window';
        const isAboutWindow = programConfig && programConfig.id === 'about-window';
        if (!isProjectsWindow && !isAboutWindow && addressBar) container.appendChild(addressBar);
        container.appendChild(iframeContainer);
        if (programConfig && programConfig.id === 'image-viewer-window' && !document.documentElement.classList.contains('mobile-device')) {
            if (toolbarWrapper) container.appendChild(toolbarWrapper);
        } else if (toolbarWrapper) {
            container.insertBefore(toolbarWrapper, iframeContainer);
        }
        if ((isProjectsWindow || isAboutWindow) && addressBar) {
            container.insertBefore(addressBar, iframeContainer);
        }
        return container;
    }
}

// ===== Positioning Helpers (extracted) =====
export const TASKBAR_HEIGHT = 30; // same constant used for positioning logic

function resolvePositionValue(value, containerSize, windowSize, axis) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        if (value.endsWith('%')) {
            const percent = parseFloat(value) / 100;
            return (containerSize - windowSize) * percent;
        }
        const keywords = {
            horizontal: {
                left: 0,
                center: (containerSize - windowSize) / 2,
                right: containerSize - windowSize,
            },
            vertical: {
                top: 0,
                center: (containerSize - windowSize - TASKBAR_HEIGHT) / 2,
                bottom: containerSize - windowSize - TASKBAR_HEIGHT,
            },
        };
        return keywords[axis][value] || 0;
    }
    return 0;
}

function getPresetPosition(
    manager,
    preset,
    viewportWidth,
    viewportHeight,
    windowWidth,
    windowHeight,
) {
    const margin = 50;
    const taskbarHeight = manager._getTaskbarHeight ? manager._getTaskbarHeight() : 30;
    const presets = {
        center: {
            x: (viewportWidth - windowWidth) / 2,
            y: (viewportHeight - windowHeight - taskbarHeight) / 2,
        },
        'top-left': {
            x: margin,
            y: margin
        },
        'top-right': {
            x: viewportWidth - windowWidth - margin,
            y: margin
        },
        'bottom-left': {
            x: margin,
            y: viewportHeight - windowHeight - taskbarHeight - margin
        },
        'bottom-right': {
            x: viewportWidth - windowWidth - margin,
            y: viewportHeight - windowHeight - taskbarHeight - margin,
        },
        'center-left': {
            x: margin,
            y: (viewportHeight - windowHeight - taskbarHeight) / 2
        },
        'center-right': {
            x: viewportWidth - windowWidth - margin,
            y: (viewportHeight - windowHeight - taskbarHeight) / 2,
        },
        'mobile-music-player': {
            x: (viewportWidth - windowWidth) / 2,
            y: viewportHeight - windowHeight - taskbarHeight - 30,
        },
    };
    return presets[preset] || presets.center;
}

function constrainWindowToViewport(manager, windowElement) {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const taskbarHeight = TASKBAR_HEIGHT;
    const windowWidth = parseInt(windowElement.style.width) || 600;
    let windowLeft = parseInt(windowElement.style.left) || 0;
    let windowTop = parseInt(windowElement.style.top) || 0;
    const minVisibleWidth = 50;
    const minVisibleHeight = 20;
    windowLeft = Math.max(
        -windowWidth + minVisibleWidth,
        Math.min(windowLeft, viewportWidth - minVisibleWidth),
    );
    windowTop = Math.max(0, Math.min(windowTop, viewportHeight - taskbarHeight - minVisibleHeight));
    windowElement.style.left = `${windowLeft}px`;
    windowElement.style.top = `${windowTop}px`;
    if (windowElement.windowState) {
        windowElement.windowState.originalStyles.left = windowElement.style.left;
        windowElement.windowState.originalStyles.top = windowElement.style.top;
    }
}

function positionWindowCascade(manager, windowElement) {
    const maxPerColumn = 3;
    const initialOffsetX = 120;
    const initialOffsetY = 50;
    const offsetX = 32;
    const offsetY = 32;
    const columnSpacing = 320;
    const cascadeWindows = Object.values(manager.windows).filter((w) => {
        if (w.windowState.isMinimized) return false;
        const programName = w.getAttribute('data-program');
        const program = manager.programData[programName];
        return !(
            program &&
            program.position &&
            (program.position.type === 'custom' || program.position.type === 'special')
        );
    }).length;
    const windowIndex = cascadeWindows - 1;
    const col = Math.floor(windowIndex / maxPerColumn);
    const row = windowIndex % maxPerColumn;
    const x = initialOffsetX + col * columnSpacing + row * offsetX;
    let y = initialOffsetY + col * 15 + row * offsetY;
    const windowHeight = parseInt(windowElement.style.height) || 400;
    const viewportHeight = document.documentElement.clientHeight;
    const maxTop = viewportHeight - windowHeight - TASKBAR_HEIGHT;
    if (y > maxTop) y = Math.max(0, maxTop);
    y = Math.max(0, y);
    windowElement.style.position = 'absolute';
    windowElement.style.left = `${x}px`;
    windowElement.style.top = `${y}px`;
    windowElement.style.transform = 'none';
}

function positionWindowSpecial(manager, windowElement, positionConfig) {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const windowWidth = windowElement.offsetWidth || parseInt(windowElement.style.width) || 400;
    const windowHeight = windowElement.offsetHeight || parseInt(windowElement.style.height) || 300;
    let x, y;
    if (positionConfig.preset) {
        const pos = getPresetPosition(
            manager,
            positionConfig.preset,
            viewportWidth,
            viewportHeight,
            windowWidth,
            windowHeight,
        );
        x = pos.x;
        y = pos.y;
    } else {
        x = resolvePositionValue(positionConfig.x, viewportWidth, windowWidth, 'horizontal');
        y = resolvePositionValue(positionConfig.y, viewportHeight, windowHeight, 'vertical');
    }
    if (positionConfig.offset) {
        x += positionConfig.offset.x || 0;
        y += positionConfig.offset.y || 0;
    }
    const isMobileMusicPlayer =
        document.documentElement.classList.contains('mobile-device') && windowElement.classList.contains('mobile-music-player');
    windowElement.style.position = isMobileMusicPlayer ? 'fixed' : 'absolute';
    windowElement.style.left = `${x}px`;
    windowElement.style.top = `${y}px`;
    windowElement.style.transform = 'none';
}

function positionWindowCustom(manager, windowElement, positionConfig) {
    if (typeof positionConfig.y === 'number') {
        if (positionConfig.yRelativeTo === 'bottom') {
            const viewportHeight = document.documentElement.clientHeight;
            const windowHeight =
                windowElement.offsetHeight || parseInt(windowElement.style.height) || 400;
            const taskbarHeight = manager._getTaskbarHeight ? manager._getTaskbarHeight() : 30;
            windowElement.style.top = `${viewportHeight - windowHeight - taskbarHeight - positionConfig.y}px`;
        } else {
            windowElement.style.top = `${positionConfig.y}px`;
        }
    }
    if (positionConfig.relativeTo === 'right' && typeof positionConfig.x === 'number') {
        const windowWidth = windowElement.offsetWidth || parseInt(windowElement.style.width) || 400;
        const viewportWidth = document.documentElement.clientWidth;
        windowElement.style.left = `${viewportWidth - windowWidth - positionConfig.x}px`;
    } else if (typeof positionConfig.x === 'number') {
        windowElement.style.left = `${positionConfig.x}px`;
        windowElement.style.transform = 'none';
    } else {
        positionWindowCascade(manager, windowElement);
    }
}

export function positionWindow(manager, windowElement) {
    const programName = windowElement.getAttribute('data-program');
    const program = manager.programData[programName];
    constrainWindowToViewport(manager, windowElement);
    if (
        document.documentElement.classList.contains('mobile-device') &&
        programName === 'musicPlayer' &&
        program &&
        program.mobileConfig &&
        program.mobileConfig.position
    ) {
        if (program.mobileConfig.position.type === 'special') {
            positionWindowSpecial(manager, windowElement, program.mobileConfig.position);
        } else if (program.mobileConfig.position.type === 'custom') {
            positionWindowCustom(manager, windowElement, program.mobileConfig.position);
        } else {
            positionWindowCascade(manager, windowElement);
        }
    } else if (program && program.position) {
        if (program.position.type === 'special') {
            positionWindowSpecial(manager, windowElement, program.position);
        } else if (program.position.type === 'custom') {
            positionWindowCustom(manager, windowElement, program.position);
        } else {
            positionWindowCascade(manager, windowElement);
        }
    } else {
        positionWindowCascade(manager, windowElement);
    }
    if (windowElement.windowState) {
        windowElement.windowState.originalStyles.left = windowElement.style.left;
        windowElement.windowState.originalStyles.top = windowElement.style.top;
        windowElement.windowState.originalStyles.transform = windowElement.style.transform;
    }
}

// Export individual helpers if needed elsewhere later
export const positioningInternals = {
    resolvePositionValue,
    getPresetPosition,
    constrainWindowToViewport,
    positionWindowCascade,
    positionWindowSpecial,
    positionWindowCustom,
};

// ===== Drag / Resize / Stacking Helpers (extracted) =====
export function makeDraggable(manager, windowElement, handleElement) {
    // Add a tiny activation delay + movement threshold so fast double clicks don't interfere.
    const DRAG_ACTIVATION_DELAY = 90; // ms (kept short to remain imperceptible)
    const DRAG_MOVE_THRESHOLD = 6; // px (slightly increased to reduce accidental drags on micro jitter)

    let isPointerDown = false;
    let dragActivated = false;
    let activationTimer = null;
    let startX, startY, pointerOffsetX, pointerOffsetY;

    // Firefox throttling optimization
    let dragUpdatePending = false;
    let lastDragX = 0;
    let lastDragY = 0;

    const activateDrag = () => {
        if (!isPointerDown || dragActivated) return;
        dragActivated = true;
        windowElement.dispatchEvent(new CustomEvent('window-drag-start', {
            bubbles: false
        }));
        windowElement.classList.add('dragging-window');

        // Firefox-specific optimizations for smooth dragging
        if (isFirefox()) {
            windowElement.style.transform = 'translateZ(0)'; // Force hardware acceleration
            windowElement.style.backfaceVisibility = 'hidden';
            windowElement.style.perspective = '1000px';
            windowElement.style.willChange = 'transform, left, top';
        } else {
            windowElement.style.transform = 'none';
            windowElement.style.willChange = 'left, top';
        }
    };

    const clearActivation = () => {
        if (activationTimer) {
            clearTimeout(activationTimer);
            activationTimer = null;
        }
    };

    const endDrag = () => {
        clearActivation();
        if (!dragActivated) {
            // Pointer down never escalated to drag; treat as simple click.
            isPointerDown = false;
            return;
        }
        if (windowElement.windowState) {
            windowElement.windowState.originalStyles.left = windowElement.style.left;
            windowElement.windowState.originalStyles.top = windowElement.style.top;
            windowElement.windowState.originalStyles.transform = windowElement.style.transform || 'none';
        }
        windowElement.classList.remove('dragging-window');

        // Clean up Firefox-specific styles but keep hardware acceleration
        if (isFirefox()) {
            windowElement.style.backfaceVisibility = '';
            windowElement.style.perspective = '';
            // Keep transform: translateZ(0) for ongoing hardware acceleration
            if (!windowElement.style.transform || windowElement.style.transform === 'none') {
                windowElement.style.transform = 'translateZ(0)';
            }
        } else {
            windowElement.style.transform = 'none';
        }
        windowElement.style.willChange = '';
        isPointerDown = false;
        dragActivated = false;
    };

    // Throttled drag update for Firefox performance
    const updateDragPosition = (clientX, clientY) => {
        if (!dragActivated) return;

        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;
        const windowWidth = windowElement.offsetWidth;

        let newLeft = clientX - pointerOffsetX;
        let newTop = clientY - pointerOffsetY;

        // Constrain continuously to keep window visible
        newLeft = Math.max(-windowWidth + 100, Math.min(newLeft, viewportWidth - 100));
        newTop = Math.max(0, Math.min(newTop, viewportHeight - TASKBAR_HEIGHT - 20));

        // Use regular positioning for all browsers - hardware acceleration is enabled via CSS
        windowElement.style.left = `${newLeft}px`;
        windowElement.style.top = `${newTop}px`;
    };

    const throttledDragUpdate = (clientX, clientY) => {
        lastDragX = clientX;
        lastDragY = clientY;

        if (!dragUpdatePending) {
            dragUpdatePending = true;
            requestAnimationFrame(() => {
                updateDragPosition(lastDragX, lastDragY);
                dragUpdatePending = false;
            });
        }
    };
    handleElement.addEventListener('mousedown', (e) => {
        if (
            e.button !== 0 ||
            e.target.tagName === 'BUTTON' ||
            (windowElement.windowState && windowElement.windowState.isMaximized) ||
            document.documentElement.classList.contains('mobile-device')
        )
            return;
        startX = e.clientX;
        startY = e.clientY;
        isPointerDown = true;
        const rect = windowElement.getBoundingClientRect();
        pointerOffsetX = startX - rect.left;
        pointerOffsetY = startY - rect.top;
        clearActivation();
        activationTimer = setTimeout(activateDrag, DRAG_ACTIVATION_DELAY);
        e.preventDefault();
    });
    handleElement.addEventListener(
        'touchstart',
        (e) => {
            if (
                e.target.tagName === 'BUTTON' ||
                (windowElement.windowState && windowElement.windowState.isMaximized) ||
                document.documentElement.classList.contains('mobile-device')
            )
                return;
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            isPointerDown = true;
            const rect = windowElement.getBoundingClientRect();
            // initial positions no longer needed beyond offset calculations
            pointerOffsetX = startX - rect.left;
            pointerOffsetY = startY - rect.top;
            clearActivation();
            activationTimer = setTimeout(activateDrag, DRAG_ACTIVATION_DELAY);
            e.preventDefault();
        }, {
            passive: false
        },
    );
    document.addEventListener(
        'mousemove',
        (e) => {
            if (!isPointerDown) return;
            // Activate by movement threshold if user moves early.
            if (!dragActivated) {
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                if (Math.abs(dx) > DRAG_MOVE_THRESHOLD || Math.abs(dy) > DRAG_MOVE_THRESHOLD) {
                    clearActivation();
                    activateDrag();
                } else {
                    return; // not yet dragging visually
                }
            }

            // Use direct update for all browsers now that obfuscation is lighter
            updateDragPosition(e.clientX, e.clientY);

            e.preventDefault();
        }, {
            passive: false
        },
    );
    document.addEventListener(
        'touchmove',
        (e) => {
            if (!isPointerDown) return;
            const t = e.touches[0];
            if (!dragActivated) {
                const dx = t.clientX - startX;
                const dy = t.clientY - startY;
                if (Math.abs(dx) > DRAG_MOVE_THRESHOLD || Math.abs(dy) > DRAG_MOVE_THRESHOLD) {
                    clearActivation();
                    activateDrag();
                } else {
                    return;
                }
            }

            // Use throttled update for Firefox, direct update for others
            if (isFirefox()) {
                throttledDragUpdate(t.clientX, t.clientY);
            } else {
                updateDragPosition(t.clientX, t.clientY);
            }

            e.preventDefault();
        }, {
            passive: false
        },
    );
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag, {
        passive: true
    });
    document.addEventListener('touchcancel', endDrag, {
        passive: true
    });
}

export function makeResizable(manager, windowElement) {
    const programKey = windowElement.getAttribute('data-program');
    const programConfig = manager.programData[programKey];
    const minWidth = programConfig?.minDimensions?.width || 200;
    const minHeight = programConfig?.minDimensions?.height || 150;
    const resizers = windowElement.querySelectorAll('.resizer');
    let original_width = 0,
        original_height = 0,
        original_x = 0,
        original_y = 0,
        original_mouse_x = 0,
        original_mouse_y = 0,
        isResizing = false;
    resizers.forEach((resizer) => {
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            if (windowElement.windowState && windowElement.windowState.isMaximized) return;
            const iframe = windowElement.querySelector('iframe');
            if (iframe) iframe.style.pointerEvents = 'none';
            isResizing = true;
            original_width = parseFloat(getComputedStyle(windowElement, null).getPropertyValue('width'));
            original_height = parseFloat(
                getComputedStyle(windowElement, null).getPropertyValue('height'),
            );
            original_x = windowElement.getBoundingClientRect().left;
            original_y = windowElement.getBoundingClientRect().top;
            original_mouse_x = e.pageX;
            original_mouse_y = e.pageY;
            // Lightweight rAF-coalesced mousemove handler for smooth resizing.
            let pending = false;
            let lastEvent = null;
            const cls = resizer.classList;
            const resizingWest =
                cls.contains('resizer-w') || cls.contains('resizer-nw') || cls.contains('resizer-sw');
            const resizingEast =
                cls.contains('resizer-e') || cls.contains('resizer-ne') || cls.contains('resizer-se');
            const resizingNorth =
                cls.contains('resizer-n') || cls.contains('resizer-ne') || cls.contains('resizer-nw');
            const resizingSouth =
                cls.contains('resizer-s') || cls.contains('resizer-se') || cls.contains('resizer-sw');

            function applyResize(ev) {
                const deltaX = ev.pageX - original_mouse_x;
                const deltaY = ev.pageY - original_mouse_y;
                const vpW = document.documentElement.clientWidth;
                const vpH = document.documentElement.clientHeight - getTaskbarHeight(manager);
                let newLeft = original_x;
                let newTop = original_y;
                let newWidth = original_width;
                let newHeight = original_height;

                if (resizingEast) newWidth = original_width + deltaX;
                if (resizingSouth) newHeight = original_height + deltaY;
                if (resizingWest) {
                    newLeft = original_x + deltaX;
                    newWidth = original_width - deltaX;
                }
                if (resizingNorth) {
                    newTop = original_y + deltaY;
                    newHeight = original_height - deltaY;
                }

                // Enforce minimum size preserving opposite edge when dragging from that side.
                if (newWidth < minWidth) {
                    if (resizingWest && !resizingEast) newLeft -= minWidth - newWidth;
                    newWidth = minWidth;
                }
                if (newHeight < minHeight) {
                    if (resizingNorth && !resizingSouth) newTop -= minHeight - newHeight;
                    newHeight = minHeight;
                }

                // Clamp within viewport.
                if (newLeft < 0) {
                    if (resizingWest) newWidth += newLeft; // subtract negative
                    newLeft = 0;
                }
                if (newTop < 0) {
                    if (resizingNorth) newHeight += newTop;
                    newTop = 0;
                }
                if (newLeft + newWidth > vpW) {
                    if (resizingEast) newWidth = vpW - newLeft;
                    else if (resizingWest) {
                        const overflow = newLeft + newWidth - vpW;
                        newLeft = Math.max(0, newLeft - overflow);
                        if (newLeft === 0) newWidth = vpW;
                        else newWidth = vpW - newLeft;
                    }
                }
                if (newTop + newHeight > vpH) {
                    if (resizingSouth) newHeight = vpH - newTop;
                    else if (resizingNorth) {
                        const overflow = newTop + newHeight - vpH;
                        newTop = Math.max(0, newTop - overflow);
                        if (newTop === 0) newHeight = vpH;
                        else newHeight = vpH - newTop;
                    }
                }

                windowElement.style.width = `${newWidth}px`;
                windowElement.style.height = `${newHeight}px`;
                windowElement.style.left = `${newLeft}px`;
                windowElement.style.top = `${newTop}px`;
                if (windowElement.windowState) {
                    windowElement.windowState.originalStyles.width = windowElement.style.width;
                    windowElement.windowState.originalStyles.height = windowElement.style.height;
                }
                const iframe = windowElement.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    try {
                        iframe.contentWindow.postMessage({
                            type: 'window-resized',
                            height: iframe.offsetHeight
                        }, '*');
                    } catch (_) {
                        /* ignore */
                    }
                }
            }

            const onMouseMove = (ev) => {
                if (!isResizing) return;
                lastEvent = ev;
                if (!pending) {
                    pending = true;
                    requestAnimationFrame(() => {
                        pending = false;
                        if (!isResizing || !lastEvent) return;
                        applyResize(lastEvent);
                    });
                }
                ev.preventDefault();
                ev.stopPropagation();
            };
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.removeEventListener('mouseleave', onMouseUp);
                windowElement.classList.remove('resizing-window');
                const iframe = windowElement.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    try {
                        iframe.contentWindow.postMessage({
                            type: 'window-resize-end'
                        }, '*');
                    } catch (_) {
                        /* minimized postMessage failed */
                    }
                    iframe.style.pointerEvents = '';
                }
                isResizing = false;
                try {
                    positioningInternals.constrainWindowToViewport(windowElement);
                } catch (_) {
                    /* restore postMessage failed */
                }
            };
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            document.addEventListener('mouseleave', onMouseUp);
            windowElement.classList.add('resizing-window');
        });
    });
}

export function updateStackOrder(manager, windowId, action = 'add') {
    const arr = manager.zIndexStack;
    const idx = arr.indexOf(windowId);
    if (idx > -1) arr.splice(idx, 1);
    if (action === 'add') arr.push(windowId);
}

export function applyZIndices(manager) {
    manager.zIndexStack.forEach((id, i) => {
        const el = manager.windows[id];
        if (el) manager._setWindowZIndex(el, manager.baseZIndex + i);
    });
}

export const dragResizeStackInternals = {
    makeDraggable,
    makeResizable,
    updateStackOrder,
    applyZIndices,
};

// ===== Viewport / Taskbar Cache Helpers =====
export function getTaskbarElement(manager) {
    if (!manager._cachedTaskbarElement) {
        manager._cachedTaskbarElement = document.querySelector('.taskbar');
    }
    return manager._cachedTaskbarElement;
}

export function getTaskbarHeight(manager) {
    if (manager._cachedTaskbarHeight === null) {
        const taskbar = getTaskbarElement(manager);
        manager._cachedTaskbarHeight = taskbar ? taskbar.offsetHeight : TASKBAR_HEIGHT;
    }
    return manager._cachedTaskbarHeight;
}

export function getViewportDimensions(manager) {
    if (!manager._cachedViewportDimensions) {
        manager._cachedViewportDimensions = {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
        };
    }
    return manager._cachedViewportDimensions;
}

export function clearCachedValues(manager) {
    manager._cachedTaskbarHeight = null;
    manager._cachedViewportDimensions = null;
    manager._cachedTaskbarElement = null;
}

export function handleViewportChange(manager) {
    clearCachedValues(manager);
}

export const viewportInternals = {
    getTaskbarElement,
    getTaskbarHeight,
    getViewportDimensions,
    clearCachedValues,
    handleViewportChange,
};

// ===== Taskbar & Lifecycle Helpers =====
export function calculateWindowToTaskbarTransform(windowElement, taskbarItem) {
    if (!taskbarItem) return 'scale(0.55)';
    const winRect = windowElement.getBoundingClientRect();
    const taskbarRect = taskbarItem.getBoundingClientRect();
    const winBottomCenterX = winRect.left + winRect.width / 2;
    const winBottomCenterY = winRect.top + winRect.height;
    const taskbarCenterX = taskbarRect.left + taskbarRect.width / 2;
    const taskbarCenterY = taskbarRect.top + taskbarRect.height / 2;
    const scale = 0.55;
    const translateX = taskbarCenterX - winBottomCenterX;
    const translateY = taskbarCenterY - winBottomCenterY;
    return `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
}

export function updateTaskbarItemState(manager, windowId, isActive) {
    Object.values(manager.taskbarItems).forEach((item) => item && item.classList.remove('active'));
    if (isActive) {
        const item = manager.taskbarItems[windowId];
        if (item) item.classList.add('active');
    }
}

export function minimizeWindow(manager, windowElement, EVENTS) {
    if (!windowElement || windowElement.windowState.isMinimized) return;
    const wasActive = manager.activeWindow === windowElement;
    const taskbarItem = manager.taskbarItems[windowElement.id];
    const transform = calculateWindowToTaskbarTransform(windowElement, taskbarItem);
    windowElement.style.setProperty('--window-minimize-transform', transform);
    windowElement.classList.add('window-minimizing');
    windowElement.addEventListener('animationend', function handler(e) {
        if (e.animationName === 'windowMinimizeZoom') {
            windowElement.classList.remove('window-minimizing');
            windowElement.style.removeProperty('--window-minimize-transform');
            windowElement.style.display = 'none';
            windowElement.classList.add('minimized');
            windowElement.windowState.isMinimized = true;
            manager._setWindowZIndex(windowElement, '');
            updateTaskbarItemState(manager, windowElement.id, false);
            manager._updateStackOrder(windowElement.id, 'remove');
            manager._updateZIndices();
            if (wasActive) {
                manager.activeWindow = null;
                const top = manager._findTopWindow();
                if (top) manager.bringToFront(top);
                else Object.values(manager.taskbarItems).forEach((i) => i && i.classList.remove('active'));
            }
            const iframe = windowElement.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                try {
                    iframe.contentWindow.postMessage({
                        type: 'window:minimized'
                    }, '*');
                } catch (_) {
                    /* minimized postMessage failed */
                }
            }
            (window.batchedPublish || manager.eventBus.publish).call(
                window.batchedPublish ? undefined : manager.eventBus,
                EVENTS.WINDOW_MINIMIZED, {
                    windowId: windowElement.id,
                    __coalesce: true
                },
            );
            windowElement.removeEventListener('animationend', handler);
        }
    });
}

export function restoreWindow(manager, windowElement, _EVENTS) {
    void _EVENTS;
    if (!windowElement || !windowElement.windowState.isMinimized) return;
    windowElement.classList.remove('minimized');
    windowElement.windowState.isMinimized = false;
    windowElement.style.display = 'flex';
    const taskbarItem = manager.taskbarItems[windowElement.id];
    const transform = calculateWindowToTaskbarTransform(windowElement, taskbarItem);
    windowElement.style.setProperty('--window-restore-transform', transform);
    windowElement.classList.add('window-restoring');
    windowElement.addEventListener('animationend', function handler(e) {
        if (e.animationName === 'windowRestoreZoom') {
            windowElement.classList.remove('window-restoring');
            windowElement.style.removeProperty('--window-restore-transform');
            windowElement.removeEventListener('animationend', handler);
            const iframe = windowElement.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                try {
                    iframe.contentWindow.postMessage({
                        type: 'window:restored',
                        height: iframe.offsetHeight
                    }, '*');
                } catch (_) {
                    /* restored postMessage failed */
                }
            }
        }
    });
    manager._updateStackOrder(windowElement.id, 'add');
    manager.bringToFront(windowElement);
    // Batched publish for restored state
    (window.batchedPublish || manager.eventBus.publish).call(
        window.batchedPublish ? undefined : manager.eventBus,
        _EVENTS.WINDOW_RESTORED, {
            windowId: windowElement.id,
            __coalesce: true
        },
    );
}

export function toggleMaximize(manager, windowElement, _EVENTS) {
    void _EVENTS;
    if (!windowElement || (document.documentElement.classList.contains('mobile-device') && windowElement.classList.contains('maximized'))) return;
    const state = windowElement.windowState;
    const btn = windowElement.querySelector('[aria-label="Maximize"], [aria-label="Restore"]');
    if (!state.isMaximized) {
        const rect = windowElement.getBoundingClientRect();
        state.originalStyles = {
            width: windowElement.style.width || `${rect.width}px`,
            height: windowElement.style.height || `${rect.height}px`,
            top: windowElement.style.top || `${rect.top}px`,
            left: windowElement.style.left || `${rect.left}px`,
            transform: windowElement.style.transform || '',
        };
        const {
            width: vw,
            height: vh
        } = manager._getViewportDimensions();
        const taskbarHeight = manager._getTaskbarHeight();
        import('../utils/frameScheduler.js').then(({
            scheduleWrite
        }) => {
            scheduleWrite(() => {
                windowElement.style.top = '0px';
                windowElement.style.left = '0px';
                windowElement.style.width = `${vw}px`;
                windowElement.style.height = `${vh - taskbarHeight}px`;
                windowElement.style.transform = 'none';
                state.isMaximized = true;
                windowElement.classList.add('maximized');
                if (btn) {
                    btn.classList.add('restore');
                    btn.setAttribute('aria-label', 'Restore');
                }
                const iframe = windowElement.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    try {
                        iframe.contentWindow.postMessage({
                            type: 'window:maximized',
                            height: iframe.offsetHeight
                        }, '*');
                    } catch (_) {
                        /* maximized postMessage failed */
                    }
                }
                (window.batchedPublish || manager.eventBus.publish).call(
                    window.batchedPublish ? undefined : manager.eventBus,
                    EVENTS.WINDOW_MAXIMIZED, {
                        windowId: windowElement.id,
                        __coalesce: true
                    },
                );
            });
        });
    } else {
        import('../utils/frameScheduler.js').then(({
            scheduleWrite
        }) => {
            scheduleWrite(() => {
                windowElement.style.width = state.originalStyles.width;
                windowElement.style.height = state.originalStyles.height;
                windowElement.style.top = state.originalStyles.top;
                windowElement.style.left = state.originalStyles.left;
                windowElement.style.transform = state.originalStyles.transform;
                windowElement.style.margin = '';
                windowElement.style.border = '';
                windowElement.style.borderRadius = '';
                windowElement.style.boxSizing = '';
                state.isMaximized = false;
                windowElement.classList.remove('maximized');
                if (btn) {
                    btn.classList.remove('restore');
                    btn.setAttribute('aria-label', 'Maximize');
                }
                const iframe = windowElement.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                    try {
                        iframe.contentWindow.postMessage({
                            type: 'window:unmaximized',
                            height: iframe.offsetHeight
                        }, '*');
                    } catch (_) {
                        /* unmaximized postMessage failed */
                    }
                }
                (window.batchedPublish || manager.eventBus.publish).call(
                    window.batchedPublish ? undefined : manager.eventBus,
                    EVENTS.WINDOW_UNMAXIMIZED, {
                        windowId: windowElement.id,
                        __coalesce: true
                    },
                );
            });
        });
    }
}

export const lifecycleInternals = {
    calculateWindowToTaskbarTransform,
    updateTaskbarItemState,
    minimizeWindow,
    restoreWindow,
    toggleMaximize,
};

// Additional lifecycle utilities to migrate more logic
export function refreshActiveWindow(manager) {
    const top = manager._findTopWindow();
    if (top) manager.bringToFront(top);
    else Object.values(manager.taskbarItems).forEach((i) => i && i.classList.remove('active'));
}

export function clearAllTaskbarItemStates(manager) {
    Object.values(manager.taskbarItems).forEach((item) => item && item.classList.remove('active'));
}

export function deactivateAllWindows(manager, excludeWindow = null) {
    Object.values(manager.windows).forEach((win) => {
        if (win !== excludeWindow) {
            win.classList.remove('active');
            manager._toggleInactiveMask(win, true);
            manager._toggleIframeOverlays(win, true);
            updateTaskbarItemState(manager, win.id, false);
            const iframe = win.querySelector('iframe');
            if (iframe && iframe.contentWindow) {
                try {
                    iframe.contentWindow.postMessage({
                        type: 'window:blurred'
                    }, '*');
                } catch (_) {
                    /* blurred or close postMessage failed */
                }
            }
        }
    });
    if (!excludeWindow) manager.activeWindow = null;
}

export function closeWindow(manager, windowElement, _EVENTS) {
    void _EVENTS;
    if (!windowElement) return;
    const windowId = windowElement.id;
    if (windowElement.classList.contains('window-closing')) return;
    windowElement.classList.add('window-closing');
    windowElement.addEventListener('animationend', function handler(e) {
        if (e.animationName === 'windowCloseFade') {
            windowElement.removeEventListener('animationend', handler);
            if (windowElement.parentNode) windowElement.parentNode.removeChild(windowElement);
        }
    });
    manager._handleWindowCloseCleanup(windowId);
    const programName = windowElement.getAttribute('data-program');
    if (programName && manager.programData[programName])
        manager.programData[programName].isOpen = false;
}

// augment export object
Object.assign(lifecycleInternals, {
    refreshActiveWindow,
    clearAllTaskbarItemStates,
    deactivateAllWindows,
    closeWindow,
});