import { lazy } from 'react';

const Steam = lazy(() => import('./index.jsx'));
const SourceGame = lazy(() => import('./SourceGame.jsx'));

export default {
  apps: {
    Steam: {
      header: {
        icon: '/apps/steam/public/images/steam-logo.png',
        title: 'Steam',
        buttons: ['minimize', 'maximize', 'close'],
        invisible: true,
      },
      component: Steam,
      defaultSize: {
        width: 1080,
        height: 680,
      },
      minSize: {
        width: 640,
        height: 480,
      },
      defaultOffset: {
        x: 55,
        y: 10,
      },
      resizable: true,
      minimized: false,
      maximized: false,
      multiInstance: false,
    },
    'Team Fortress 2': {
      header: {
        icon: '/apps/steam/public/images/games/tf2-library-cover.jpg',
        title: 'Team Fortress 2',
        buttons: ['minimize', 'maximize', 'close'],
      },
      component: SourceGame,
      defaultSize: {
        width: 1024,
        height: 700,
      },
      minSize: {
        width: 720,
        height: 520,
      },
      defaultOffset: {
        x: 85,
        y: 38,
      },
      resizable: true,
      minimized: false,
      maximized: false,
      multiInstance: false,
      injectProps: {
        gameId: 'tf2',
      },
    },
    'Half-Life 2': {
      header: {
        icon: '/apps/steam/public/images/games/hl2-library-cover.jpg',
        title: 'Half-Life 2',
        buttons: ['minimize', 'maximize', 'close'],
      },
      component: SourceGame,
      defaultSize: {
        width: 820,
        height: 560,
      },
      minSize: {
        width: 640,
        height: 440,
      },
      defaultOffset: {
        x: 115,
        y: 62,
      },
      resizable: true,
      minimized: false,
      maximized: false,
      multiInstance: false,
      injectProps: {
        gameId: 'hl2',
      },
    },
  },
  icons: {
    steam: {
      icon: '/apps/steam/public/images/steam-logo.png',
      title: 'Steam',
      component: Steam,
    },
  },
  catalogTargets: {
    steam: 'Steam',
  },
  categories: {
    Steam: 'game',
    'Team Fortress 2': 'game',
    'Half-Life 2': 'game',
  },
  startMenu: {
    steam: {
      type: 'program',
      appKey: 'Steam',
      icon: '/apps/steam/public/images/steam-logo.png',
      title: 'Steam',
      description: 'Launch Half-Life 2 and Team Fortress 2',
    },
  },
};
