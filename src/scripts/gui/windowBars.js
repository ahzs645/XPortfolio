import { PortfolioManager } from '../../libs/portfolio/portfolioManager.js';

export function createAddressBar({
    icon: iconPath,
    title: title = 'About Me',
} = {}) {
    const container = document.createElement('div');
    container.className = 'addressbar-container';
    const iconHtml = iconPath
        ? `<img decoding="async" loading="lazy" style="margin: 0 3px 0 0" alt="icon" width="14" height="14" src="${iconPath}" />`
        : '';
    container.innerHTML = `
    <div class="addressbar-row">
        <div class="address-label-container">
            <span style="color: #7f7c73; font-size: 11px;">Address</span>
        </div>
        <div class="addressbar">
            <div style="display: flex; align-items: center;">
                ${iconHtml}
                <span class="addressbar-title">${title}</span>
            </div>
            <img decoding="async" loading="lazy" alt="dropdown" class="dropdownIcon" width="16" height="18" src="./assets/gui/toolbar/tooldropdown.webp" style="filter: grayscale(100%); opacity: 0.6;" />
            <div class="address-bar-progress" aria-hidden="true"></div>
        </div>
        <div class="go-button-container">
            <img decoding="async" loading="lazy" alt="go" class="goIcon" width="20" height="20" src="./assets/gui/toolbar/go.webp" style="filter: grayscale(100%); opacity: 0.6;" />
            <span>Go</span>
        </div>
    </div>`;
    return container;
}

let SOCIALS_CACHE = null;

async function getSocials() {
    if (SOCIALS_CACHE) return SOCIALS_CACHE;
    try {
        const portfolio = new PortfolioManager();
        await portfolio.initialize();
        const socialLinks = portfolio.getSocialLinks();

        // Convert PortfolioManager format to expected format with proper icon mapping
        SOCIALS_CACHE = socialLinks.map(social => {
            const networkKey = social.network.toLowerCase();
            let iconPath = `assets/gui/start-menu/${networkKey}.webp`;

            // Map network names to correct icon files
            const iconMapping = {
                'linkedin': 'linkedin.webp',
                'github': 'github.webp',
                'facebook': 'facebook.webp',
                'instagram': 'instagram.webp'
            };

            if (iconMapping[networkKey]) {
                iconPath = `assets/gui/start-menu/${iconMapping[networkKey]}`;
            }

            return {
                key: networkKey,
                name: social.network,
                icon: iconPath,
                url: social.url,
                showInAbout: true
            };
        });

        return SOCIALS_CACHE;
    } catch (error) {
        console.error('Failed to load social links from portfolio:', error);
        return SOCIALS_CACHE = [], SOCIALS_CACHE;
    }
}

export function createMenuBar(menuBarConfig, windowId, parentWindowElement) {
    if (!menuBarConfig || !menuBarConfig.items) return null;

    const container = document.createElement('div');
    container.className = 'menu-bar-container';

    let _parentWindowElement = parentWindowElement;
    let closeMenusFunction = null;

    // Method to update parent window element reference
    container.setParentWindowElement = function(newParent) {
        if (_parentWindowElement && closeMenusFunction) {
            _parentWindowElement.removeEventListener('window-drag-start', closeMenusFunction);
            _parentWindowElement.removeEventListener('request-close-window', closeMenusFunction);
        }
        _parentWindowElement = newParent;
        if (_parentWindowElement && closeMenusFunction) {
            _parentWindowElement.addEventListener('window-drag-start', closeMenusFunction);
            _parentWindowElement.addEventListener('request-close-window', closeMenusFunction);
        }
    };

    const bar = document.createElement('div');
    bar.className = 'menu-bar';

    // Build menu items
    menuBarConfig.items.forEach(menuItem => {
        // Special handling for resume window's file menu
        if (windowId === 'resume-window' && menuItem.key === 'file' && Array.isArray(menuItem.dropdown)) {
            menuItem.dropdown = menuItem.dropdown.filter(item => item.action !== 'pageSetup');
            if (!menuItem.dropdown.some(item => item.action === 'saveResume')) {
                const printIndex = menuItem.dropdown.findIndex(item => item.action === 'filePrint');
                if (printIndex !== -1) {
                    menuItem.dropdown.splice(printIndex, 0, {
                        text: 'Save',
                        action: 'saveResume',
                        enabled: true
                    });
                } else {
                    menuItem.dropdown.push({
                        text: 'Download',
                        action: 'saveResume',
                        enabled: true
                    });
                }
            }
        }

        // Create menu item element
        const menuItemElement = document.createElement('div');
        menuItemElement.className = 'menu-item' + (!menuItem.enabled ? ' disabled' : '');
        menuItemElement.textContent = menuItem.text;
        menuItemElement.setAttribute('data-menu', menuItem.key);
        bar.appendChild(menuItemElement);

        // Create dropdown menu if exists
        if (menuItem.dropdown && menuItem.dropdown.length > 0 && !['edit', 'tools', 'help'].includes(menuItem.key)) {
            const dropdownMenu = document.createElement('div');
            dropdownMenu.id = menuItem.key + '-menu-' + windowId;
            dropdownMenu.className = 'dropdown-menu';
            dropdownMenu.style.position = 'absolute';
            dropdownMenu.style.zIndex = '99999';

            menuItem.dropdown.forEach(dropdownItem => {
                if (dropdownItem.type === 'separator') {
                    const separator = document.createElement('div');
                    separator.className = 'menu-separator';
                    dropdownMenu.appendChild(separator);
                } else {
                    const optionElement = document.createElement('div');
                    let isEnabled = dropdownItem.enabled !== false;

                    // Disable maximize on mobile
                    if (dropdownItem.action === 'maximizeWindow' && document.documentElement.classList.contains('mobile-device')) {
                        isEnabled = false;
                    }

                    optionElement.className = 'menu-option' + (!isEnabled ? ' disabled' : '');
                    optionElement.textContent = dropdownItem.text;

                    if (dropdownItem.action && isEnabled) {
                        optionElement.setAttribute('data-action', dropdownItem.action);
                    }

                    dropdownMenu.appendChild(optionElement);
                }
            });

            container.appendChild(dropdownMenu);
        }
    });

    // Add menu bar logo
    const logoImg = document.createElement('img');
    logoImg.className = 'menu-bar-logo-placeholder';
    logoImg.src = './assets/gui/toolbar/barlogo.webp';
    logoImg.decoding = 'async';
    logoImg.loading = 'lazy';
    logoImg.alt = 'Logo';
    bar.appendChild(logoImg);

    container.insertBefore(bar, container.firstChild);

    // Setup menu interactions after DOM is ready
    setTimeout(() => {
        let activeMenuItem = null;
        const menuMap = {};

        container.querySelectorAll('.dropdown-menu').forEach(dropdown => {
            const menuKey = dropdown.id.split('-')[0];
            menuMap[menuKey] = dropdown;
        });

        function closeMenus() {
            if (activeMenuItem) {
                const menuKey = activeMenuItem.getAttribute('data-menu');
                const dropdown = menuMap[menuKey];
                if (dropdown) {
                    dropdown.classList.remove('show');
                }
                activeMenuItem.classList.remove('active');
                activeMenuItem = null;
            }
        }

        closeMenusFunction = closeMenus;

        // Setup window event listeners
        if (_parentWindowElement) {
            _parentWindowElement.addEventListener('window-drag-start', closeMenus);
            _parentWindowElement.addEventListener('request-close-window', closeMenus);
            _parentWindowElement.addEventListener('window:iframe-interaction', closeMenus);

            const iframe = _parentWindowElement.querySelector('iframe');
            if (iframe) {
                iframe.addEventListener('pointerdown', closeMenus, { passive: true, capture: true });
                iframe.addEventListener('load', () => {
                    iframe.addEventListener('pointerdown', closeMenus, { passive: true, capture: true });
                });
            }
        }

        // Setup menu item click handlers
        const enabledMenuItems = container.querySelectorAll('.menu-bar .menu-item:not(.disabled)');
        enabledMenuItems.forEach(menuItemElement => {
            // Hover to switch menus
            menuItemElement.addEventListener('mouseenter', () => {
                if (activeMenuItem && activeMenuItem !== menuItemElement) {
                    menuItemElement.click();
                }
            });

            // Click to open/close menu
            menuItemElement.addEventListener('click', event => {
                event.stopPropagation();
                const menuKey = menuItemElement.getAttribute('data-menu');
                const dropdown = menuMap[menuKey];

                if (!dropdown) return;

                // Toggle menu
                if (activeMenuItem === menuItemElement) {
                    closeMenus();
                    return;
                }

                closeMenus();

                // Update maximize/restore text for view menu
                if (menuKey === 'view' && _parentWindowElement) {
                    const maximizeOption = dropdown.querySelector('[data-action="maximizeWindow"]');
                    if (maximizeOption) {
                        const isMaximized = _parentWindowElement.classList.contains('maximized');
                        maximizeOption.textContent = isMaximized ? 'Restore' : 'Maximize';
                        maximizeOption.setAttribute('aria-label', isMaximized ? 'Restore' : 'Maximize');
                    }
                }

                menuItemElement.classList.add('active');

                // Position dropdown
                const menuBarRect = menuItemElement.closest('.menu-bar').getBoundingClientRect();
                const itemRect = menuItemElement.getBoundingClientRect();

                if (dropdown.parentElement !== document.body) {
                    document.body.appendChild(dropdown);
                }

                dropdown.style.minWidth = '130px';
                dropdown.classList.add('show');

                const dropdownWidth = dropdown.offsetWidth || 130;
                dropdown.classList.remove('show');

                const leftPos = Math.round(Math.min(
                    itemRect.left + window.scrollX,
                    window.scrollX + document.documentElement.clientWidth - dropdownWidth - 4
                ));

                dropdown.style.left = leftPos + 'px';
                dropdown.style.top = Math.round(menuBarRect.bottom + window.scrollY) - 2 + 'px';
                dropdown.style.minWidth = '130px';
                dropdown.classList.add('show');
                activeMenuItem = menuItemElement;

                // Close menu on mouse leave
                const handleMouseLeave = event => {
                    const relatedTarget = event.relatedTarget;
                    if (!relatedTarget || (!dropdown.contains(relatedTarget) && !container.contains(relatedTarget))) {
                        closeMenus();
                        dropdown.removeEventListener('mouseleave', handleMouseLeave, true);
                    }
                };
                dropdown.addEventListener('mouseleave', handleMouseLeave, true);
            });
        });

        // Close menu on click outside
        const handleOutsideClick = event => {
            if (!activeMenuItem) return;
            const menuKey = activeMenuItem.getAttribute('data-menu');
            const dropdown = menuMap[menuKey];
            if (!dropdown) return closeMenus();
            if (!dropdown.contains(event.target) && !container.contains(event.target)) {
                closeMenus();
            }
        };

        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
            document.addEventListener('pointerdown', handleOutsideClick, true);
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape') {
                    closeMenus();
                }
            });
            window.addEventListener('scroll', closeMenus, true);
            window.addEventListener('resize', closeMenus);
        }, 0);

        // Setup dropdown option click handlers
        const menuOptions = container.querySelectorAll('.dropdown-menu .menu-option:not(.disabled)');
        menuOptions.forEach(option => {
            const clonedOption = option.cloneNode(true);
            option.replaceWith(clonedOption);

            clonedOption.addEventListener('click', event => {
                event.stopPropagation();
                event.preventDefault();

                const action = clonedOption.getAttribute('data-action');
                const windowElement = _parentWindowElement;

                // Don't allow actions if window doesn't accept input yet
                if (windowElement && windowElement.dataset.acceptInput === 'false') {
                    closeMenus();
                    return;
                }

                if (action && windowElement) {
                    const dispatchAction = () => {
                        if (action === 'exitProgram') {
                            windowElement.dispatchEvent(new CustomEvent('request-close-window', { bubbles: false }));
                        } else if (action === 'minimizeWindow') {
                            windowElement.dispatchEvent(new CustomEvent('request-minimize-window', { bubbles: false }));
                        } else if (action === 'maximizeWindow') {
                            windowElement.dispatchEvent(new CustomEvent('request-maximize-window', { bubbles: false }));
                        } else if (action.startsWith('file') || action.startsWith('edit') || action.startsWith('view') ||
                                   action.startsWith('tools') || action.startsWith('help') ||
                                   action === 'saveResume' || action === 'newMessage' || action === 'sendMessage') {
                            windowElement.dispatchEvent(new CustomEvent('dispatchToolbarAction', {
                                detail: { action: action, button: null },
                                bubbles: false
                            }));
                        }
                    };
                    dispatchAction();
                }

                closeMenus();
            });
        });
    }, 0);

    return container;
}

export function createToolbar(toolbarConfig, windowId, isBottom) {
    if (!toolbarConfig || !toolbarConfig.buttons) return null;

    const container = document.createElement('div');
    container.className = 'toolbar-container';

    const toolbarRow = document.createElement('div');
    toolbarRow.className = 'toolbar-row';

    if (isBottom) {
        toolbarRow.classList.add('toolbar-bottom');
    }

    const isMobile = document.documentElement.classList.contains('mobile-device');
    let buttons = toolbarConfig.buttons;

    // Filter buttons for mobile contact window
    if (isMobile && windowId === 'contact-window') {
        buttons = buttons.filter(btn => btn.enabled !== false || btn.type === 'separator');
        const newButton = buttons.find(btn => btn.key === 'new');
        const sendButton = buttons.find(btn => btn.key === 'send');
        const mobileButtons = [];
        if (sendButton) mobileButtons.push(sendButton);
        if (newButton) mobileButtons.push(newButton);
        buttons = mobileButtons;
    }

    // Filter buttons for mobile about window
    if (isMobile && windowId === 'about-window') {
        buttons = buttons.filter(btn => btn.enabled !== false || btn.type === 'separator');
        const projectsIndex = buttons.findIndex(btn => btn.key === 'projects');
        let resumeIndex = buttons.findIndex(btn => btn.key === 'resume');

        // Remove separator before resume button if exists
        if (resumeIndex > 0 && buttons[resumeIndex - 1].type === 'separator') {
            buttons.splice(resumeIndex - 1, 1);
            if (projectsIndex < resumeIndex) {
                resumeIndex--;
            }
        }

        // Remove separator after resume button if exists
        if (buttons[resumeIndex + 1] && buttons[resumeIndex + 1].type === 'separator') {
            buttons.splice(resumeIndex + 1, 1);
        }

        // Add separator between projects and resume if they're adjacent
        if (projectsIndex !== -1 && resumeIndex !== -1 && resumeIndex - projectsIndex === 1) {
            buttons.splice(resumeIndex, 0, { type: 'separator' });
        }
    }

    // Add close button for mobile
    let closeButton = null;
    if (isMobile) {
        closeButton = document.createElement('div');
        closeButton.className = 'toolbar-button toolbar-close-button';
        closeButton.setAttribute('aria-label', 'Close');
        closeButton.innerHTML = '<img decoding="async" alt="close" width="25" height="25" src="assets/gui/toolbar/delete.webp" /><span>Close</span>';

        closeButton.addEventListener('click', event => {
            event.stopPropagation();
            let parentWindowElement = container.parentElement;
            while (parentWindowElement && !parentWindowElement.classList.contains('app-window')) {
                parentWindowElement = parentWindowElement.parentElement;
            }

            if (parentWindowElement && parentWindowElement.dataset.acceptInput === 'false') return;

            if (parentWindowElement) {
                parentWindowElement.dispatchEvent(new CustomEvent('request-close-window', { bubbles: false }));
            }
        });

        toolbarRow.appendChild(closeButton);
    }

    // Build toolbar buttons
    buttons.forEach(button => {
        // Handle social buttons
        if (button.type === 'socials') {
            (async () => {
                let socials = await getSocials();
                if (windowId === 'contact-window') {
                    socials = socials.filter(social => social.key === 'linkedin');
                }

                socials.forEach(social => {
                    const socialButton = document.createElement('div');
                    socialButton.className = 'toolbar-button social ' + social.key;
                    socialButton.setAttribute('data-action', 'openExternalLink');
                    socialButton.setAttribute('data-url-to-open', social.url);
                    socialButton.setAttribute('title', 'View on ' + social.name);
                    socialButton.setAttribute('aria-label', 'View on ' + social.name);
                    socialButton.setAttribute('data-social-key', social.key);

                    if (windowId === 'contact-window' && social.key === 'linkedin' && !isMobile) {
                        socialButton.innerHTML = '<img decoding="async" loading="lazy" alt="' + social.name + '" width="25" height="25" src="' + social.icon + '" /><span>LinkedIn</span>';
                    } else {
                        socialButton.innerHTML = '<img decoding="async" loading="lazy" alt="' + social.name + '" width="25" height="25" src="' + social.icon + '" />';
                    }

                    socialButton.addEventListener('click', event => {
                        event.stopPropagation();
                        try {
                            window.postMessage({
                                type: 'confirm-open-link',
                                url: social.url,
                                label: social.name
                            }, '*');
                        } catch (error) {
                            window.open(social.url, '_blank');
                        }
                    });

                    toolbarRow.appendChild(socialButton);
                });
            })();
            return;
        }

        // Skip home button on mobile projects window
        if (isMobile && windowId === 'projects-window' && button.key === 'home') return;

        // Skip desktop-only buttons on mobile
        if (isMobile && button.desktopOnly) return;

        // Skip mobile-only buttons on desktop
        if (!isMobile && button.mobileOnly) return;

        // Handle separator
        if (button.type === 'separator') {
            const separator = document.createElement('div');
            separator.className = 'vertical_line';
            toolbarRow.appendChild(separator);
            return;
        }

        // Handle regular button
        if (button.key) {
            const buttonElement = document.createElement('div');
            buttonElement.className = 'toolbar-button ' + button.key;

            if (!button.enabled) {
                buttonElement.classList.add('disabled');
            }

            if (button.action) {
                buttonElement.setAttribute('data-action', button.action);
            }

            let innerHTML = '';
            if (button.icon) {
                innerHTML += '<img decoding="async" loading="lazy" alt="' + button.key + '" width="25" height="25" src="' + button.icon + '" />';
            }
            if (button.text) {
                innerHTML += '<span>' + button.text + '</span>';
            }

            buttonElement.innerHTML = innerHTML;

            if (button.style) {
                buttonElement.setAttribute('style', button.style);
            }

            if (button.url) {
                buttonElement.dataset.urlToOpen = button.url;
            }

            toolbarRow.appendChild(buttonElement);
        }
    });

    container.appendChild(toolbarRow);

    // Initialize toolbar button press states (global, runs once)
    if (!window.__toolbarPressInit) {
        window.__toolbarPressInit = true;
        const activeButtons = new Set();

        const isPrimaryPointer = event => event.pointerType ? event.isPrimary : true;

        const addActive = button => {
            if (!button || button.classList.contains('disabled') || button.classList.contains('pressed')) return;
            button.classList.add('touch-active');
            activeButtons.add(button);
        };

        const clearAllActive = () => {
            activeButtons.forEach(btn => btn.classList.remove('touch-active'));
            activeButtons.clear();
        };

        const removeActive = button => {
            if (!button) return;
            button.classList.remove('touch-active');
            activeButtons.delete(button);
        };

        document.addEventListener('pointerdown', event => {
            if (event.button !== 0 || !isPrimaryPointer(event)) return;
            const button = event.target.closest('.toolbar-button');
            if (!button) return;
            addActive(button);
        }, true);

        document.addEventListener('pointerup', event => {
            const button = event.target.closest('.toolbar-button');
            if (button) {
                removeActive(button);
            } else {
                clearAllActive();
            }
        }, true);

        document.addEventListener('pointercancel', clearAllActive, true);

        document.addEventListener('pointerleave', event => {
            if (!event.relatedTarget) {
                clearAllActive();
            }
        }, true);

        document.addEventListener('touchstart', event => {
            const button = event.target.closest('.toolbar-button');
            if (button) {
                addActive(button);
            }
        }, { passive: true, capture: true });

        document.addEventListener('touchend', clearAllActive, { passive: true, capture: true });
        document.addEventListener('touchcancel', clearAllActive, { passive: true, capture: true });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') {
                clearAllActive();
            }
        });

        document.addEventListener('click', () => {
            requestAnimationFrame(clearAllActive);
        }, true);
    }

    // Special handling for projects window close button on mobile (becomes home button)
    if (isMobile && windowId === 'projects-window' && closeButton) {
        let isHomeMode = false;

        const switchToHome = () => {
            isHomeMode = true;
            closeButton.innerHTML = '<img decoding="async" alt="home" width="25" height="25" src="assets/gui/toolbar/home.webp" /><span>Home</span>';
            closeButton.setAttribute('aria-label', 'Home');
        };

        const switchToClose = () => {
            isHomeMode = false;
            closeButton.innerHTML = '<img decoding="async" alt="close" width="25" height="25" src="assets/gui/toolbar/delete.webp" /><span>Close</span>';
            closeButton.setAttribute('aria-label', 'Close');
        };

        switchToClose();

        // Re-attach event listener
        closeButton.replaceWith(closeButton.cloneNode(true));
        closeButton = toolbarRow.querySelector('.toolbar-close-button');

        closeButton.addEventListener('click', event => {
            event.stopPropagation();

            if (isHomeMode) {
                let parent = container.parentElement;
                while (parent && !parent.classList.contains('app-window')) {
                    parent = parent.parentElement;
                }

                if (parent) {
                    const iframe = parent.querySelector('iframe');
                    if (iframe && iframe.contentWindow) {
                        iframe.contentWindow.postMessage({
                            type: 'toolbar:action',
                            action: 'navigateHome'
                        }, '*');
                    }
                }
            } else {
                let parent = container.parentElement;
                while (parent && !parent.classList.contains('app-window')) {
                    parent = parent.parentElement;
                }

                if (parent) {
                    parent.dispatchEvent(new CustomEvent('request-close-window', { bubbles: false }));
                }
            }
        });

        // Listen for view state changes
        window.addEventListener('message', event => {
            if (event.data && event.data.type === 'project:view-state') {
                if (event.data.inDetailView) {
                    switchToHome();
                } else {
                    switchToClose();
                    if (closeButton) {
                        void closeButton.offsetWidth; // Force reflow
                    }
                }
            }
        });
    }

    return container;
}

export {
    getSocials
};
