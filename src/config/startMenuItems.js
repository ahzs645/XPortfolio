export const START_MENU_CATALOG = {
    about: {
        type: 'program',
        programName: 'about',
        icon: './assets/gui/desktop/about.webp',
        title: 'About Me',
        description: null,
        disabled: false
    },
    projects: {
        type: 'program',
        programName: 'projects',
        icon: './assets/gui/desktop/projects.webp',
        title: 'My Projects',
        description: 'View my work',
        disabled: false,
        emphasize: true
    },
    resume: {
        type: 'program',
        programName: 'resume',
        icon: './assets/gui/desktop/resume.svg',
        title: 'My Resume',
        description: null,
        disabled: false
    },
    contact: {
        type: 'program',
        programName: 'contact',
        icon: './assets/gui/desktop/contact.webp',
        title: 'Contact Me',
        description: 'Send me a message',
        disabled: false
    },
    mediaPlayer: {
        type: 'program',
        programName: 'mediaPlayer',
        icon: './assets/gui/start-menu/mediaPlayer.webp',
        title: 'Media Player',
        description: null,
        disabled: false
    },
    minesweeper: {
        type: 'program',
        programName: 'minesweeper',
        icon: './assets/apps/minesweeper/mine-icon.png',
        title: 'Minesweeper',
        description: null,
        disabled: false
    },
    'spider-solitaire': {
        type: 'program',
        programName: 'spider-solitaire',
        icon: './assets/apps/spider-solitaire/spider-solitaire-icon.webp',
        title: 'Spider Solitaire',
        description: null,
        disabled: false
    },
    pinball: {
        type: 'program',
        programName: 'pinball',
        icon: './assets/apps/pinball/pinball-icon.png',
        title: '3D Pinball',
        description: null,
        disabled: false
    },
    winamp: {
        type: 'program',
        programName: 'winamp',
        icon: './assets/apps/winamp/winamp.png',
        title: 'Winamp',
        description: null,
        disabled: false
    },
    calculator: {
        type: 'program',
        programName: 'calculator',
        icon: './assets/apps/calculator/calculator-icon.png',
        title: 'Calculator',
        description: null,
        disabled: false
    },
    musicPlayer: {
        type: 'program',
        programName: 'musicPlayer',
        icon: './assets/gui/start-menu/music.webp',
        title: 'Music Player',
        description: null,
        disabled: false
    },
    'image-viewer': {
        type: 'program',
        programName: 'image-viewer',
        icon: './assets/gui/start-menu/photos.webp',
        title: 'Image Viewer',
        description: null,
        disabled: false
    },
    paint: {
        type: 'program',
        programName: 'paint',
        icon: './assets/gui/start-menu/paint.webp',
        title: 'Paint',
        description: null,
        disabled: false
    },
    cmd: {
        type: 'program',
        programName: 'cmd',
        icon: './assets/gui/start-menu/cmd.webp',
        title: 'Command Prompt',
        description: null,
        disabled: false
    },
    'divider-main': {
        type: 'separator'
    },
    'divider-trailing': {
        type: 'separator'
    }
};

export const PINNED_LEFT_ORDER = [
    'projects',
    'contact',
    'divider-main',
    'about',
    'image-viewer',
    'mediaPlayer',
    'musicPlayer',
    'paint'
];

export const PINNED_RIGHT_ORDER = [
    'cmd',
    'resume'
];

export const ALL_PROGRAMS_ORDER = [
    'about',
    'projects',
    'resume',
    'contact',
    'divider-main',
    'mediaPlayer',
    'winamp',
    'calculator',
    'minesweeper',
    'spider-solitaire',
    'pinball',
    'musicPlayer',
    'image-viewer',
    'paint',
    'cmd',
    'divider-trailing'
];
