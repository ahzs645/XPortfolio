/**
 * @file programRegistry.js
 * @description Centralized registry for all application configurations in the Windows XP simulation.
 * Includes window properties, icons, menu bars, toolbars, and helper functions for consistent program definitions.
 */

import { PortfolioManager } from '../../libs/portfolio/portfolioManager.js';


/* ===== Default Configuration Templates ===== */

const defaults = {
    iframe: {
        template: 'iframe-standard',
        dimensions: {
            width: 550,
            height: 400
        },
        minDimensions: {
            width: 250,
            height: 200
        },
    },
};

/* ===== Factory Functions ===== */

/**
 * Generates a standardized window ID from a program key
 * @param {string} name - Program key
 * @returns {string} Window ID
 */
const makeId = (name) => `${name}-window`;

/**
 * Factory function to create a program configuration object
 * @param {string} key - Unique program identifier
 * @param {string} title - Window title
 * @param {string} icon - Program icon filename
 * @param {object} [extraProps={}] - Additional properties
 * @returns {object} Program configuration
 */
const createProgram = (key, title, icon, extraProps = {}) => ({
    id: makeId(key),
    title,
    icon: `./assets/gui/${icon}`,
    ...defaults.iframe, // Merge in default iframe settings
    minDimensions: {
        ...defaults.iframe.minDimensions,
        ...(extraProps.minDimensions || {}),
    },
    ...extraProps,
});

/* ===== Shared Menu Dropdown Configurations ===== */

const VIEW_DROPDOWN = [{
        key: 'maximize',
        text: 'Maximize',
        enabled: !document.documentElement.classList.contains('mobile-device'),
        action: 'maximizeWindow',
    },
    {
        key: 'minimize',
        text: 'Minimize',
        enabled: true,
        action: 'minimizeWindow',
    },
];

const FILE_DROPDOWN_EXIT_ONLY = [{
        key: 'print',
        text: 'Print',
        enabled: false,
        action: 'filePrint'
    },
    {
        key: 'pageSetup',
        text: 'Print Setup',
        enabled: false,
        action: 'pageSetup',
    },
    {
        type: 'separator'
    },
    {
        key: 'exit',
        text: 'Exit',
        enabled: true,
        action: 'exitProgram'
    },
];

const FILE_DROPDOWN_CONTACT = [{
        key: 'newMessage',
        text: 'New Message',
        enabled: false,
        action: 'newMessage',
    },
    {
        key: 'sendMessage',
        text: 'Send Message',
        enabled: false,
        action: 'sendMessage',
    },
    {
        type: 'separator'
    },
    {
        key: 'print',
        text: 'Print',
        enabled: false,
        action: 'filePrint'
    },
    {
        type: 'separator'
    },
    {
        key: 'exit',
        text: 'Exit',
        enabled: true,
        action: 'exitProgram'
    },
];

/* ===== Program Data Registry ===== */

const programData = {
    mediaPlayer: createProgram('mediaPlayer', 'Media Player', 'start-menu/mediaPlayer.webp', {
        appPath: 'src/apps/mediaPlayer/mediaPlayer.html',
        dimensions: {
            width: 825,
            height: 556
        },
        resizable: false,
        canMaximize: true,
    }),

    // --- Minesweeper ---
    minesweeper: createProgram('minesweeper', 'Minesweeper', 'start-menu/minesweeper.svg', {
        appPath: 'src/apps/minesweeper/minesweeper.html?v=1',
        icon: './assets/apps/minesweeper/mine-icon.png',
        dimensions: { width: 280, height: 360 },
        minDimensions: { width: 160, height: 200 },
        resizable: false,
        canMaximize: true,
    }),

    // --- Winamp ---
    winamp: createProgram('winamp', 'Winamp', 'start-menu/winamp.svg', {
        appPath: 'src/apps/winamp/winamp.html?v=1',
        icon: './assets/apps/winamp/winamp.png',
        dimensions: { width: 360, height: 260 },
        minDimensions: { width: 300, height: 200 },
        resizable: false,
        canMaximize: false,
    }),
    musicPlayer: createProgram('musicPlayer', 'Music Player', 'start-menu/music.webp', {
        appPath: 'src/apps/musicPlayer/musicplayer.html',
        dimensions: {
            width: 354,
            height: 222
        },
        minDimensions: {
            width: 354,
            height: 222
        },
        resizable: false,
        canMaximize: false,
        position: {
            type: 'custom',
            x: 24,
            y: 24,
            relativeTo: 'right'
        },
        // Mobile-specific configuration
        mobileConfig: {
            position: {
                type: 'special',
                preset: 'mobile-music-player'
            },
            dimensions: {
                width: 354,
                height: 222
            },
            draggable: false,
            resizable: false,
        },
    }),

    cmd: createProgram('cmd', 'Command Prompt', 'start-menu/cmd.webp', {
        appPath: 'src/apps/cmd/cmd.html',
        dimensions: {
            width: 620,
            height: 420
        },
        minDimensions: {
            width: 420,
            height: 300
        },
        resizable: false,
        canMaximize: false,
    }),
    paint: createProgram('paint', 'Paint', 'start-menu/paint.webp', {
        appPath: 'src/apps/paint/paint.html',
        canMaximize: true,
        resizable: true,
        dimensions: {
            width: 790,
            height: 600
        },
        minDimensions: {
            width: 500,
            height: 400
        },
        // Use our global menu bar (basic File/View plus Close)
        menuBarConfig: {
            items: [{
                    key: 'file',
                    text: 'File',
                    enabled: true,
                    dropdown: [{
                            text: 'New...',
                            action: 'paintNew',
                            enabled: false
                        },
                        {
                            text: 'Save',
                            action: 'fileSave',
                            enabled: false
                        },
                        {
                            text: 'Print',
                            action: 'filePrint',
                            enabled: false
                        },
                        {
                            type: 'separator'
                        },
                        {
                            text: 'Close',
                            action: 'exitProgram',
                            enabled: true
                        },
                    ],
                },
                {
                    key: 'edit',
                    text: 'Edit',
                    enabled: false
                },
                {
                    key: 'view',
                    text: 'View',
                    enabled: true,
                    dropdown: [{
                            text: 'Maximize',
                            action: 'maximizeWindow',
                            enabled: true
                        },
                        {
                            text: 'Minimize',
                            action: 'minimizeWindow',
                            enabled: true
                        },
                    ],
                },
                {
                    key: 'tools',
                    text: 'Tools',
                    enabled: false
                },
                {
                    key: 'help',
                    text: 'Help',
                    enabled: false
                },
            ],
        },
    }),

    about: createProgram('about', 'About Me', 'desktop/about.webp', {
        dimensions: {
            width: 776,
            height: 556
        },
        minDimensions: {
            width: 430,
            height: 400
        },
        statusBarText: 'Learn more about Mitch',
        appPath: 'src/apps/about/about.html',
        toolbarConfig: {
            buttons: [{
                    key: 'previous',
                    enabled: false,
                    icon: './assets/gui/toolbar/back.webp',
                    text: 'Previous',
                    action: 'nav:prev',
                },
                {
                    key: 'next',
                    enabled: false,
                    icon: './assets/gui/toolbar/forward.webp',
                    text: 'Next',
                    action: 'nav:next',
                },
                {
                    type: 'separator',
                    desktopOnly: true
                },
                {
                    key: 'projects',
                    enabled: true,
                    icon: './assets/gui/desktop/projects.webp',
                    text: 'My Projects',
                    action: 'openProjects',
                },
                {
                    key: 'resume',
                    enabled: true,
                    icon: './assets/gui/desktop/resume.svg',
                    text: 'My Resume',
                    action: 'openResume',
                },
                {
                    type: 'separator'
                },
                {
                    key: 'folder',
                    enabled: false,
                    icon: './assets/gui/toolbar/up.webp',
                    text: null,
                    action: 'null',
                },
            ],
        },
        addressBarConfig: {
            enabled: true,
            icon: './assets/gui/desktop/about.webp',
            title: 'About Me',
            canNavigate: false,
        },
        menuBarConfig: {
            items: [{
                    key: 'file',
                    text: 'File',
                    enabled: true,
                    dropdown: FILE_DROPDOWN_EXIT_ONLY,
                },
                {
                    key: 'view',
                    text: 'View',
                    enabled: true,
                    dropdown: VIEW_DROPDOWN,
                },
                {
                    key: 'help',
                    text: 'Help',
                    enabled: false
                },
            ],
        },
    }),
    resume: createProgram('resume', 'My Resume', 'desktop/resume.svg', {
        dimensions: {
            width: 465,
            height: 768
        },
        minDimensions: {
            width: 305,
            height: 350
        },
        statusBarText: document.documentElement.classList.contains('mobile-device') ?
            'Scroll to view pages. Tap Zoom to toggle.' :
            'Scroll to view pages. Click Zoom to toggle.',
        appPath: 'src/apps/resume/resume.html',
        menuBarConfig: {
            items: [{
                    key: 'file',
                    text: 'File',
                    enabled: true,
                    dropdown: FILE_DROPDOWN_EXIT_ONLY,
                },
                {
                    key: 'view',
                    text: 'View',
                    enabled: true,
                    dropdown: VIEW_DROPDOWN
                },
                {
                    key: 'help',
                    text: 'Help',
                    enabled: false
                },
            ],
        },
        toolbarConfig: {
            buttons: [{
                    key: 'zoom',
                    enabled: true,
                    icon: './assets/gui/toolbar/search.webp',
                    text: 'Zoom',
                    desktopOnly: true,
                    action: 'toggleZoom',
                },
                {
                    key: 'save',
                    enabled: true,
                    icon: './assets/gui/toolbar/save.webp',
                    text: 'Save',
                    action: 'saveResume',
                },
                {
                    type: 'separator',
                    desktopOnly: true
                },
                {
                    key: 'print',
                    enabled: false,
                    icon: './assets/gui/toolbar/print.webp',
                    text: 'Print',
                    desktopOnly: true,
                    tooltip: 'Print (Disabled)',
                },
                {
                    type: 'separator',
                    desktopOnly: true
                },
                {
                    key: 'email',
                    enabled: true,
                    icon: './assets/gui/desktop/contact.webp',
                    text: 'Contact Me',
                    action: 'openContact',
                },
            ],
        },
    }),

    'image-viewer': createProgram('image-viewer', 'Image Viewer', 'start-menu/photos.webp', {
        dimensions: {
            width: 640,
            height: 700
        },
        minDimensions: {
            width: 320,
            height: 440
        },
        statusBarText: 'Ready',
        appPath: 'src/apps/imageViewer/imageViewer.html',
        toolbarConfig: {
            buttons: [{
                    key: 'previous',
                    enabled: true,
                    icon: './assets/gui/toolbar/back.webp',
                    text: 'Back',
                    action: 'nav:back',
                },
                {
                    key: 'forward',
                    enabled: true,
                    icon: './assets/gui/toolbar/forward.webp',
                    text: 'Next',
                    action: 'nextImage',
                },
                {
                    key: 'print',
                    enabled: false,
                    icon: './assets/gui/toolbar/print.webp',
                    text: null,
                    desktopOnly: true, // Hide on mobile
                },
                // Zoom toggle button (visible on both desktop & mobile)
                {
                    key: 'zoom',
                    enabled: true,
                    icon: './assets/gui/toolbar/search.webp',
                    text: 'Zoom',
                    desktopOnly: true,
                    action: 'toggleZoom',
                },
                {
                    key: 'save',
                    enabled: false,
                    icon: './assets/gui/toolbar/save.webp',
                    text: null,
                    desktopOnly: true, // Hide on mobile
                },
            ],
        },
        addressBarConfig: {
            enabled: true,
            icon: './assets/gui/start-menu/photos.webp',
            title: 'C:\\Users\\Mitch\\Assets',
            canNavigate: false,
        },
        menuBarConfig: {
            items: [{
                    key: 'file',
                    text: 'File',
                    enabled: true,
                    dropdown: [{
                            key: 'open',
                            text: 'Open',
                            enabled: false,
                            action: 'fileOpen'
                        },
                        {
                            key: 'send',
                            text: 'Send',
                            enabled: false,
                            action: 'fileSend'
                        },
                        {
                            key: 'print',
                            text: 'Print',
                            enabled: false,
                            action: 'filePrint'
                        },
                        {
                            type: 'separator'
                        },
                        {
                            key: 'exit',
                            text: 'Exit',
                            enabled: true,
                            action: 'exitProgram'
                        },
                    ],
                },
                {
                    key: 'edit',
                    text: 'Edit',
                    enabled: false
                },
                {
                    key: 'view',
                    text: 'View',
                    enabled: true,
                    dropdown: VIEW_DROPDOWN
                },
                {
                    key: 'help',
                    text: 'Help',
                    enabled: false
                },
            ],
        },
    }),

    projects: createProgram('projects', 'My Projects', 'desktop/projects.webp', {
        dimensions: {
            width: 840,
            height: 820
        },
        minDimensions: {
            width: 840,
            height: 820
        },
        statusBarText: 'Select a project to view, navigate between projects with the toolbar',
        appPath: 'src/apps/projects/projects.html',
        // Firefox-specific configuration with custom dimensions
        firefoxConfig: {
            dimensions: {
                width: 840,
                height: 820
            }, // Custom Firefox dimensions
            resizable: false,
            canMaximize: false,
        },
        addressBarConfig: {
            enabled: true,
            icon: './assets/gui/desktop/projects.webp',
            title: 'https://www.myprojects.com',
            canNavigate: false,
        },
        menuBarConfig: {
            items: [{
                    key: 'file',
                    text: 'File',
                    enabled: true,
                    dropdown: [{
                            text: 'New Window',
                            action: 'newWindow',
                            enabled: false
                        },
                        {
                            text: 'Save As...',
                            action: 'fileSaveAs',
                            enabled: false
                        },
                        {
                            type: 'separator'
                        },
                        {
                            text: 'Page Setup...',
                            action: 'pageSetup',
                            enabled: false
                        },
                        {
                            text: 'Print...',
                            action: 'filePrint',
                            enabled: false
                        },
                        {
                            type: 'separator'
                        },
                        {
                            text: 'Exit',
                            action: 'exitProgram',
                            enabled: true
                        },
                    ],
                },
                {
                    key: 'view',
                    text: 'View',
                    enabled: true,
                    dropdown: VIEW_DROPDOWN
                },
                {
                    key: 'tools',
                    text: 'Tools',
                    enabled: false
                },
                {
                    key: 'help',
                    text: 'Help',
                    enabled: false
                },
            ],
        },
        toolbarConfig: {
            buttons: [{
                    key: 'home',
                    enabled: false,
                    icon: './assets/gui/toolbar/home.webp',
                    text: 'Home',
                    action: 'navigateHome',
                },
                {
                    type: 'separator',
                    desktopOnly: true
                },
                {
                    key: 'previous',
                    enabled: false,
                    icon: './assets/gui/toolbar/back.webp',
                    text: 'Previous',
                    action: 'nav:prev',
                },
                {
                    key: 'next',
                    enabled: false,
                    icon: './assets/gui/toolbar/forward.webp',
                    text: 'Next',
                    action: 'nav:next',
                },

                {
                    key: 'overlayToggleMobile',
                    enabled: true,
                    icon: './assets/gui/toolbar/views.webp',
                    text: 'Details',
                    action: 'overlays:toggle',
                    tooltip: 'Toggle Project Overlays',
                    mobileOnly: true,
                },
                {
                    key: 'favorites',
                    enabled: false,
                    icon: './assets/gui/toolbar/favorites.webp',
                    text: 'Favorites',
                    desktopOnly: true,
                    tooltip: 'Favorites (Disabled)',
                },
                {
                    type: 'separator',
                    desktopOnly: true
                },
                {
                    key: 'overlaysToggle',
                    enabled: true,
                    icon: './assets/gui/toolbar/views.webp',
                    text: 'Toggle Details',
                    desktopOnly: true,
                    action: 'overlays:toggle',
                    tooltip: 'Toggle Overlays',
                },
            ],
        },
    }),
    contact: createProgram('contact', 'Contact Me', 'desktop/contact.webp', {
        dimensions: {
            width: 570,
            height: 420
        },
        minDimensions: {
            width: 470,
            height: 300
        }, // Custom minimum dimensions for Contact Me
        statusBarText: null, // Will be set dynamically
        getStatusBarText: async () => {
            try {
                const portfolio = new PortfolioManager();
                await portfolio.initialize();
                const fullName = portfolio.getFullName();
                const firstName = fullName ? fullName.split(' ')[0] : 'Mitch';
                return `Compose a message to ${firstName}`;
            } catch (error) {
                console.error('Failed to load portfolio data for status bar:', error);
                return 'Compose a message to Mitch';
            }
        },
        appPath: 'src/apps/contact/contact.html',
        toolbarConfig: {
            buttons: [{
                    key: 'send',
                    enabled: true,
                    icon: './assets/gui/toolbar/send.webp',
                    text: 'Send Message',
                    action: 'sendMessage',
                },
                {
                    key: 'new',
                    enabled: true,
                    icon: './assets/gui/toolbar/new.webp',
                    text: 'New Message',
                    action: 'newMessage',
                },
                {
                    type: 'separator',
                    desktopOnly: true
                },
                {
                    key: 'cut',
                    enabled: false,
                    icon: './assets/gui/toolbar/cut.webp',
                    text: null,
                },
                {
                    key: 'copy',
                    enabled: false,
                    icon: './assets/gui/toolbar/copy.webp',
                    text: null,
                },
                {
                    key: 'paste',
                    enabled: false,
                    icon: './assets/gui/toolbar/paste.webp',
                    text: null,
                },
                {
                    type: 'separator'
                },
                {
                    type: 'socials'
                },
            ],
        },
        menuBarConfig: {
            items: [{
                    key: 'file',
                    text: 'File',
                    enabled: true,
                    dropdown: FILE_DROPDOWN_CONTACT,
                },
                {
                    key: 'edit',
                    text: 'Edit',
                    enabled: false
                },
                {
                    key: 'view',
                    text: 'View',
                    enabled: true,
                    dropdown: VIEW_DROPDOWN
                },
                {
                    key: 'tools',
                    text: 'Tools',
                    enabled: false
                },
                {
                    key: 'help',
                    text: 'Help',
                    enabled: false
                },
            ],
        },
    }),
};

export default programData;
